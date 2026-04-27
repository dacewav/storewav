/**
 * Abandoned carts cron logic — shared between HTTP endpoint and scheduled handler.
 */

import { sendAbandonedCartEmail } from '$lib/abandonedCart';

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';
const ABANDON_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function processAbandonedCarts(env: Record<string, string | undefined>) {
	try {
		const resp = await fetch(`${FIREBASE_DB}/abandonedCarts.json`);
		if (!resp.ok) {
			return { ok: false, error: 'Failed to fetch carts', sent: 0 };
		}

		const carts = await resp.json() as Record<string, {
			uid: string;
			email: string;
			displayName: string;
			items: Array<{
				beatId: string;
				beatName: string;
				licenseName: string;
				priceMXN: number;
				priceUSD: number;
			}>;
			totalMXN: number;
			totalUSD: number;
			lastUpdated: number;
			reminderSent?: boolean;
		}> | null;

		if (!carts) {
			return { ok: true, message: 'No abandoned carts', sent: 0 };
		}

		const now = Date.now();
		let sent = 0;
		const errors: string[] = [];

		for (const [cartId, cart] of Object.entries(carts)) {
			const age = now - cart.lastUpdated;

			if (age < ABANDON_THRESHOLD_MS) continue;
			if (age > MAX_AGE_MS) continue;
			if (cart.reminderSent) continue;
			if (!cart.email || !cart.items?.length) continue;

			const result = await sendAbandonedCartEmail(
				{
					uid: cart.uid,
					email: cart.email,
					displayName: cart.displayName,
					items: cart.items,
					totalMXN: cart.totalMXN,
					totalUSD: cart.totalUSD,
					cartUrl: 'https://dacewav.store/cart',
					lastUpdated: cart.lastUpdated,
				},
				{ RESEND_API_KEY: env.RESEND_API_KEY }
			);

			if (result.ok) {
				sent++;
				await fetch(`${FIREBASE_DB}/abandonedCarts/${cartId}/reminderSent.json`, {
					method: 'PUT',
					body: JSON.stringify(true),
				});
			} else {
				errors.push(`${cart.email}: ${result.error}`);
			}
		}

		return { ok: true, sent, errors: errors.length > 0 ? errors : undefined };
	} catch (err) {
		console.error('[Cron] Abandoned carts error:', err);
		return { ok: false, error: String(err), sent: 0 };
	}
}
