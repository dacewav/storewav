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

export const POST: RequestHandler = async ({ request, platform }) => {
	const stripeKey = platform?.env?.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env?.STRIPE_SECRET_KEY : undefined);

	if (!stripeKey) {
		return json({ ok: false, error: 'Stripe no configurado — falta STRIPE_SECRET_KEY' }, { status: 500 });
	}

	// Parse body
	let body: { items?: unknown[]; customerEmail?: string };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Body inválido — esperaba JSON' }, { status: 400 });
	}

	const { items, customerEmail } = body;

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

	// Build Stripe line items
	const lineItems = validItems.map((item) => ({
		price_data: {
			currency: 'usd',
			product_data: {
				name: `${item.beatName} — ${item.licenseName}`,
				description: `Licencia ${item.licenseName} para "${item.beatName}"`,
			},
			unit_amount: Math.round(item.priceUSD * 100), // Stripe uses cents
		},
		quantity: 1,
	}));

	// Build metadata (for webhook)
	const metadata: Record<string, string> = {
		items: JSON.stringify(validItems.map((i) => ({
			beatId: i.beatId,
			licenseName: i.licenseName,
			priceMXN: i.priceMXN,
			priceUSD: i.priceUSD,
		}))),
	};

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
			await fetch(`${FIREBASE_DB}/orders/${session.id}.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionId: session.id,
					items: validItems.map((i) => ({
						beatId: i.beatId,
						beatName: i.beatName,
						licenseName: i.licenseName,
						priceMXN: i.priceMXN,
						priceUSD: i.priceUSD,
					})),
					status: 'pending',
					customerEmail: customerEmail || null,
					createdAt: Date.now(),
				}),
			});
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
