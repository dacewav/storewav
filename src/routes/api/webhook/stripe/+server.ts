import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/webhook/stripe
 * Handles Stripe webhook events (checkout.session.completed).
 * Verifies webhook signature, then updates order in Firebase.
 *
 * Requires STRIPE_WEBHOOK_SECRET env var.
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

export const POST: RequestHandler = async ({ request, platform }) => {
	const webhookSecret = platform?.env?.STRIPE_WEBHOOK_SECRET || (typeof process !== 'undefined' ? process.env?.STRIPE_WEBHOOK_SECRET : undefined);

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
		const paymentIntentId = session.payment_intent as string;

		console.log(`[Stripe Webhook] Payment completed: ${sessionId}`);

		// Update order in Firebase
		try {
			const updateData = {
				status: 'paid',
				customerEmail,
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...updateData,
					items: session.metadata?.items ? JSON.parse(session.metadata.items as string) : [],
				}),
			});

			console.log(`[Stripe Webhook] Order ${sessionId} marked as paid`);
		} catch (err) {
			console.error('[Stripe Webhook] Failed to update order:', err);
			// Return 200 to avoid Stripe retrying (we can fix manually)
		}
	}

	// Always return 200 to Stripe
	return json({ received: true });
};
