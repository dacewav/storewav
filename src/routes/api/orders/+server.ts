import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/orders?email=user@example.com
 * Server-side orders lookup — uses Firebase admin access.
 * Returns paid orders for the given email.
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

export const GET: RequestHandler = async ({ url }) => {
	const email = url.searchParams.get('email')?.trim().toLowerCase();

	if (!email || !email.includes('@')) {
		return json({ ok: false, error: 'Email inválido' }, { status: 400 });
	}

	try {
		// Query paidOrders by customerEmail
		const queryUrl = `${FIREBASE_DB}/paidOrders.json?orderBy="customerEmail"&equalTo="${encodeURIComponent(email)}"`;
		const resp = await fetch(queryUrl);

		if (!resp.ok) {
			console.error('[Orders] Firebase error:', resp.status);
			return json({ ok: false, error: 'Error al buscar órdenes' }, { status: 502 });
		}

		const data = await resp.json() as Record<string, {
			sessionId?: string;
			items?: Array<{
				beatId: string;
				beatName: string;
				licenseName: string;
				priceMXN: number;
				priceUSD: number;
			}>;
			paidAt?: number;
			customerEmail?: string;
			customerName?: string;
		}> | null;

		if (!data) {
			return json({ ok: true, orders: [] });
		}

		// Filter by exact email match (case-insensitive) and format
		const orders = Object.entries(data)
			.filter(([, o]) => o.customerEmail?.toLowerCase() === email)
			.map(([id, o]) => ({
				sessionId: o.sessionId || id,
				items: o.items || [],
				paidAt: o.paidAt || 0,
				customerName: o.customerName || '',
				totalMXN: (o.items || []).reduce((s, i) => s + i.priceMXN, 0),
				totalUSD: (o.items || []).reduce((s, i) => s + i.priceUSD, 0),
			}))
			.sort((a, b) => b.paidAt - a.paidAt);

		return json({ ok: true, orders });
	} catch (err) {
		console.error('[Orders] Error:', err);
		return json({ ok: false, error: 'Error del servidor' }, { status: 500 });
	}
};
