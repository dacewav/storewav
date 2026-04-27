import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for cart items.
 * Returns { url } — redirect the user to this URL to complete payment.
 *
 * Expects JSON body: { items: CartItem[], customerEmail?: string }
 * Requires STRIPE_SECRET_KEY env var.
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

/** Validate cart item shape */
function isValidItem(item: unknown): item is {
	beatId: string;
	beatName: string;
	licenseName: string;
	priceUSD: number;
	priceMXN: number;
} {
	if (!item || typeof item !== 'object') return false;
	const i = item as Record<string, unknown>;
	return (
		typeof i.beatId === 'string' && i.beatId.length > 0 && i.beatId.length <= 128 &&
		typeof i.beatName === 'string' && i.beatName.length > 0 &&
		typeof i.licenseName === 'string' && i.licenseName.length > 0 &&
		typeof i.priceUSD === 'number' && i.priceUSD > 0 && i.priceUSD <= 100000 &&
		typeof i.priceMXN === 'number' && i.priceMXN > 0
	);
}

/** Validate a discount code against Firebase */
async function validateDiscountCode(
	code: string,
	items: Array<{ licenseName: string; priceUSD: number }>
): Promise<{ valid: true; type: 'percent' | 'fixed'; amount: number; code: string } | { valid: false; error: string }> {
	try {
		const codeKey = code.trim().toUpperCase();
		const resp = await fetch(`${FIREBASE_DB}/discountCodes/${codeKey}.json`);
		if (!resp.ok) return { valid: false, error: 'Código no encontrado' };

		const discount = await resp.json() as {
			type?: 'percent' | 'fixed';
			amount?: number;
			maxUses?: number;
			usedCount?: number;
			expiresAt?: string;
			applicableLicenses?: string[];
			active?: boolean;
		} | null;

		if (!discount) return { valid: false, error: 'Código no encontrado' };
		if (!discount.active) return { valid: false, error: 'El código está inactivo' };
		if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
			return { valid: false, error: 'El código ha expirado' };
		}
		if (discount.usedCount !== undefined && discount.maxUses !== undefined && discount.usedCount >= discount.maxUses) {
			return { valid: false, error: 'El código ha alcanzado el máximo de usos' };
		}

		// Check if code applies to at least one item in cart
		if (discount.applicableLicenses && discount.applicableLicenses.length > 0) {
			const hasApplicable = items.some(item =>
				discount.applicableLicenses!.includes(item.licenseName)
			);
			if (!hasApplicable) {
				return { valid: false, error: `El código solo aplica a: ${discount.applicableLicenses.join(', ')}` };
			}
		}

		return {
			valid: true,
			type: discount.type || 'percent',
			amount: discount.amount || 0,
			code: codeKey,
		};
	} catch {
		return { valid: false, error: 'Error al validar el código' };
	}
}

/** Apply discount to items and return adjusted prices */
function applyDiscount(
	items: Array<{ beatId: string; beatName: string; licenseName: string; priceUSD: number; priceMXN: number }>,
	discount: { type: 'percent' | 'fixed'; amount: number; applicableLicenses?: string[] }
) {
	return items.map(item => {
		const isApplicable = !discount.applicableLicenses?.length || discount.applicableLicenses.includes(item.licenseName);
		if (!isApplicable) return item;

		let discountUSD = 0;
		if (discount.type === 'percent') {
			discountUSD = Math.round(item.priceUSD * (discount.amount / 100) * 100) / 100;
		} else {
			discountUSD = Math.min(discount.amount, item.priceUSD);
		}

		const newPriceUSD = Math.max(1, Math.round((item.priceUSD - discountUSD) * 100) / 100); // Min $1 USD
		const ratio = newPriceUSD / item.priceUSD;
		const newPriceMXN = Math.round(item.priceMXN * ratio);

		return {
			...item,
			priceUSD: newPriceUSD,
			priceMXN: newPriceMXN,
			originalPriceUSD: item.priceUSD,
			discountUSD,
		};
	});
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const stripeKey = platform?.env?.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env?.STRIPE_SECRET_KEY : undefined);

	if (!stripeKey) {
		return json({ ok: false, error: 'Stripe no configurado — falta STRIPE_SECRET_KEY' }, { status: 500 });
	}

	// Parse body
	let body: { items?: unknown[]; customerEmail?: string; discountCode?: string };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Body inválido — esperaba JSON' }, { status: 400 });
	}

	const { items, customerEmail, discountCode } = body;

	if (!Array.isArray(items) || items.length === 0) {
		return json({ ok: false, error: 'El carrito está vacío' }, { status: 400 });
	}

	if (items.length > 20) {
		return json({ ok: false, error: 'Máximo 20 items por compra' }, { status: 400 });
	}

	// Validate all items
	for (const item of items) {
		if (!isValidItem(item)) {
			return json({ ok: false, error: 'Item inválido en el carrito' }, { status: 400 });
		}
	}

	const validItems = items as {
		beatId: string;
		beatName: string;
		licenseName: string;
		priceUSD: number;
		priceMXN: number;
	}[];

	// Validate and apply discount code
	let appliedDiscount: { code: string; type: 'percent' | 'fixed'; amount: number } | null = null;
	let finalItems = validItems;

	if (discountCode && typeof discountCode === 'string' && discountCode.trim()) {
		const validation = await validateDiscountCode(discountCode, validItems);
		if (!validation.valid) {
			return json({ ok: false, error: validation.error }, { status: 400 });
		}

		// Fetch full discount data for applicableLicenses
		try {
			const discResp = await fetch(`${FIREBASE_DB}/discountCodes/${validation.code}.json`);
			const discData = await discResp.json() as { applicableLicenses?: string[] } | null;

			finalItems = applyDiscount(validItems, {
				type: validation.type,
				amount: validation.amount,
				applicableLicenses: discData?.applicableLicenses,
			});

			appliedDiscount = {
				code: validation.code,
				type: validation.type,
				amount: validation.amount,
			};
		} catch {
			// If discount fetch fails, proceed without discount
		}
	}

	// Build Stripe line items
	const lineItems = finalItems.map((item) => ({
		price_data: {
			currency: 'usd',
			product_data: {
				name: `${item.beatName} — ${item.licenseName}`,
				description: appliedDiscount
					? `Licencia ${item.licenseName} para "${item.beatName}" (descuento: ${appliedDiscount.code})`
					: `Licencia ${item.licenseName} para "${item.beatName}"`,
			},
			unit_amount: Math.round(item.priceUSD * 100), // Stripe uses cents
		},
		quantity: 1,
	}));

	// Build metadata (for webhook)
	const metadata: Record<string, string> = {
		items: JSON.stringify(finalItems.map((i) => ({
			beatId: i.beatId,
			licenseName: i.licenseName,
			priceMXN: i.priceMXN,
			priceUSD: i.priceUSD,
		}))),
	};

	if (appliedDiscount) {
		metadata.discountCode = appliedDiscount.code;
		metadata.discountType = appliedDiscount.type;
		metadata.discountAmount = String(appliedDiscount.amount);
	}

	// Create Stripe Checkout Session via REST API
	const origin = request.headers.get('origin') || 'https://dacewav.store';

	const params = new URLSearchParams();
	params.append('mode', 'payment');
	params.append('success_url', `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
	params.append('cancel_url', `${origin}/checkout/cancel`);
	params.append('payment_intent_data[metadata][items]', metadata.items);

	if (customerEmail) {
		params.append('customer_email', customerEmail);
	}

	// Add line items
	for (let i = 0; i < lineItems.length; i++) {
		const li = lineItems[i];
		params.append(`line_items[${i}][price_data][currency]`, li.price_data.currency);
		params.append(`line_items[${i}][price_data][product_data][name]`, li.price_data.product_data.name);
		if (li.price_data.product_data.description) {
			params.append(`line_items[${i}][price_data][product_data][description]`, li.price_data.product_data.description);
		}
		params.append(`line_items[${i}][price_data][unit_amount]`, String(li.price_data.unit_amount));
		params.append(`line_items[${i}][quantity]`, String(li.quantity));
	}

	// Add metadata
	for (const [key, value] of Object.entries(metadata)) {
		params.append(`metadata[${key}]`, value);
	}

	try {
		const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${stripeKey}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		});

		if (!resp.ok) {
			const err = await resp.text();
			console.error('[Checkout] Stripe error:', err);
			return json({ ok: false, error: 'Error al crear sesión de pago' }, { status: 502 });
		}

		const session = await resp.json() as { id: string; url: string };

		// Save order to Firebase (pending)
		try {
			const orderData: Record<string, unknown> = {
				sessionId: session.id,
				items: finalItems.map((i) => ({
					beatId: i.beatId,
					beatName: i.beatName,
					licenseName: i.licenseName,
					priceMXN: i.priceMXN,
					priceUSD: i.priceUSD,
				})),
				status: 'pending',
				customerEmail: customerEmail || null,
				createdAt: Date.now(),
			};

			if (appliedDiscount) {
				orderData.discountCode = appliedDiscount.code;
				orderData.discountType = appliedDiscount.type;
				orderData.discountAmount = appliedDiscount.amount;
			}

			await fetch(`${FIREBASE_DB}/orders/${session.id}.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(orderData),
			});

			// NOTE: usedCount is incremented in the Stripe webhook on successful payment,
			// not here — to avoid counting abandoned checkouts.
		} catch {
			// Non-critical — order will be created by webhook if this fails
			console.warn('[Checkout] Failed to save order to Firebase');
		}

		return json({ ok: true, url: session.url, sessionId: session.id });
	} catch (err) {
		console.error('[Checkout]', err);
		return json({ ok: false, error: 'Error al conectar con Stripe' }, { status: 500 });
	}
};
