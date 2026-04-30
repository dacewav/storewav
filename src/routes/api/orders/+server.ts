import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FIREBASE_DB } from '$lib/firebaseDb';

/**
 * GET /api/orders?email=user@example.com
 * GET /api/orders?sessionId=cs_xxx
 * Server-side orders lookup — uses Firebase REST API.
 * Returns paid orders for the given email or session ID.
 */

export const GET: RequestHandler = async ({ url }) => {
	const email = url.searchParams.get('email')?.trim().toLowerCase();
	const sessionId = url.searchParams.get('sessionId')?.trim();

	// Session ID lookup (for checkout success page)
	if (sessionId) {
		try {
			const resp = await fetch(`${FIREBASE_DB}/orders/${sessionId}.json`);
			if (!resp.ok) {
				return json({ ok: false, error: 'Orden no encontrada' }, { status: 404 });
			}
			const order = await resp.json() as Record<string, unknown> | null;
			if (!order) {
				return json({ ok: false, error: 'Orden no encontrada' }, { status: 404 });
			}
			return json({ ok: true, order });
		} catch (err) {
			console.error('[Orders] Error:', err);
			return json({ ok: false, error: 'Error del servidor' }, { status: 500 });
		}
	}

	// Email lookup (for account orders page)
	if (!email || !email.includes('@')) {
		return json({ ok: false, error: 'Email o sessionId requerido' }, { status: 400 });
	}

	try {
		// Query orders by customerEmail (orders has .write:true so webhook can write)
		// We need to scan orders and filter by email since we can't index on customerEmail
		// without changing rules. Use paidOrders as the primary index (read: true).
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
