import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateContractPDF, getContractFile } from '$lib/contractPdf';
import { sendDeliveryEmail } from '$lib/email';

/**
 * POST /api/webhook/stripe
 * Handles Stripe webhook events (checkout.session.completed).
 * Verifies signature → updates order → generates contract → sends email.
 *
 * Requires: STRIPE_WEBHOOK_SECRET, optionally RESEND_API_KEY
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

/** Verify Stripe webhook signature using Web Crypto */
async function verifyStripeSignature(
	payload: string,
	sigHeader: string,
	secret: string
): Promise<boolean> {
	try {
		const parts = sigHeader.split(',').reduce((acc, part) => {
			const [key, val] = part.split('=');
			if (!acc[key]) acc[key] = [];
			acc[key].push(val);
			return acc;
		}, {} as Record<string, string[]>);

		const timestamp = parts['t']?.[0];
		const signature = parts['v1']?.[0];

		if (!timestamp || !signature) return false;

		// Reject events older than 5 minutes
		const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
		if (age > 300) return false;

		const signedPayload = `${timestamp}.${payload}`;
		const encoder = new TextEncoder();

		const key = await crypto.subtle.importKey(
			'raw',
			encoder.encode(secret),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);

		const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
		const computedSig = Array.from(new Uint8Array(sigBuffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

		return computedSig === signature;
	} catch {
		return false;
	}
}

/** Parse metadata items from Stripe session */
function parseItems(metadata: Record<string, unknown> | undefined): Array<{
	beatId: string;
	beatName?: string;
	licenseName: string;
	priceMXN: number;
	priceUSD: number;
}> {
	try {
		if (!metadata?.items) return [];
		const parsed = JSON.parse(metadata.items as string);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const webhookSecret = platform?.env?.STRIPE_WEBHOOK_SECRET || (typeof process !== 'undefined' ? process.env?.STRIPE_WEBHOOK_SECRET : undefined);
	const resendKey = platform?.env?.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : undefined);

	if (!webhookSecret) {
		console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET');
		return json({ error: 'Webhook not configured' }, { status: 500 });
	}

	// Get raw body + signature
	const rawBody = await request.text();
	const sigHeader = request.headers.get('stripe-signature') || '';

	// Verify signature
	const isValid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
	if (!isValid) {
		console.warn('[Stripe Webhook] Invalid signature');
		return json({ error: 'Invalid signature' }, { status: 400 });
	}

	// Parse event
	let event: { type: string; data: { object: Record<string, unknown> } };
	try {
		event = JSON.parse(rawBody);
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	// Handle checkout.session.completed
	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		const sessionId = session.id as string;
		const customerEmail = (session.customer_email as string) || (session.customer_details as { email?: string })?.email || null;
		const customerName = (session.customer_details as { name?: string })?.name || 'Cliente';
		const paymentIntentId = session.payment_intent as string;

		console.log(`[Stripe Webhook] Payment completed: ${sessionId}`);

		// Parse items from metadata
		const items = parseItems(session.metadata as Record<string, unknown> | undefined);

		// 1. Update order in Firebase
		try {
			const updateData = {
				status: 'paid',
				customerEmail,
				customerName,
				paymentIntentId,
				paidAt: Date.now(),
			};

			await fetch(`${FIREBASE_DB}/orders/${sessionId}.json`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData),
			});

			// Also create a record under paidOrders for easy lookup
			await fetch(`${FIREBASE_DB}/paidOrders/${sessionId}.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json'},
				body: JSON.stringify({
					...updateData,
					items,
				}),
			});

			console.log(`[Stripe Webhook] Order ${sessionId} marked as paid`);
		} catch (err) {
			console.error('[Stripe Webhook] Failed to update order:', err);
		}

		// 2. Generate contracts + download links + email (non-blocking)
		if (items.length > 0 && customerEmail) {
			try {
				// Fetch beat data for contract details
				const beatDataMap: Record<string, { name: string; bpm?: string; key?: string; genre?: string; audioUrl?: string }> = {};
				for (const item of items) {
					try {
						const resp = await fetch(`${FIREBASE_DB}/beats/${item.beatId}.json`);
						if (resp.ok) {
							const beat = await resp.json() as { name?: string; bpm?: number; key?: string; genre?: string; audioUrl?: string } | null;
							if (beat) {
								beatDataMap[item.beatId] = {
									name: beat.name || item.beatName || 'Beat',
									bpm: beat.bpm?.toString(),
									key: beat.key,
									genre: beat.genre,
									audioUrl: beat.audioUrl,
								};
							}
						}
					} catch {
						// Non-critical
					}
				}

				// Generate PDFs and collect download info
				const emailItems: Array<{ beatName: string; licenseName: string; downloadUrl: string }> = [];
				let combinedPdfBase64: string | undefined;

				for (const item of items) {
					const beatData = beatDataMap[item.beatId];
					const contractFile = getContractFile(item.licenseName);

					// Generate contract PDF
					const pdfBytes = generateContractPDF({
						orderId: sessionId,
						beatName: beatData?.name || item.beatName || 'Beat',
						beatBpm: beatData?.bpm,
						beatKey: beatData?.key,
						beatGenre: beatData?.genre,
						licenseName: item.licenseName,
						priceMXN: item.priceMXN,
						priceUSD: item.priceUSD,
						buyerName: customerName,
						buyerEmail: customerEmail,
						date: new Date().toISOString().split('T')[0],
						contractFile,
					});

					// Store contract in Firebase
					const contractId = `${sessionId}_${item.beatId}`;
					await fetch(`${FIREBASE_DB}/contracts/${contractId}.json`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							orderId: sessionId,
							beatId: item.beatId,
							beatName: beatData?.name || item.beatName,
							licenseName: item.licenseName,
							buyerEmail: customerEmail,
							buyerName: customerName,
							contractFile,
							createdAt: Date.now(),
						}),
					});

					// Build download URL
					const downloadUrl = beatData?.audioUrl || `${FIREBASE_DB}/beats/${item.beatId}/audioUrl.json`;

					emailItems.push({
						beatName: beatData?.name || item.beatName || 'Beat',
						licenseName: item.licenseName,
						downloadUrl,
					});

					// Use first PDF as attachment (or combine if multiple)
					if (!combinedPdfBase64) {
						combinedPdfBase64 = btoa(String.fromCharCode(...pdfBytes));
					}
				}

				// 3. Send delivery email
				const totalMXN = items.reduce((s, i) => s + i.priceMXN, 0);
				const totalUSD = items.reduce((s, i) => s + i.priceUSD, 0);

				await sendDeliveryEmail({
					orderId: sessionId,
					buyerEmail: customerEmail,
					buyerName: customerName,
					items: emailItems,
					totalMXN,
					totalUSD,
					contractPdfBase64: combinedPdfBase64,
				}, { RESEND_API_KEY: resendKey });

				console.log(`[Stripe Webhook] Delivery email sent for ${sessionId}`);
			} catch (err) {
				console.error('[Stripe Webhook] Post-payment processing error:', err);
				// Non-critical — order is already marked as paid
			}
		}
	}

	// Always return 200 to Stripe
	return json({ received: true });
};
