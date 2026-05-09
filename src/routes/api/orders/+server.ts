import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FIREBASE_DB } from '$lib/firebaseDb';

/**
 * GET /api/orders?email=user@example.com
 * GET /api/orders?sessionId=cs_xxx
 * Server-side orders lookup — uses Firebase REST API.
 * Returns paid orders for the given email or session ID.
 *
 * SECURITY: Rate limited per IP — max 10 requests per minute.
 */

// ── In-memory rate limiter (per Cloudflare Worker instance) ──
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_ORDERS_PER_MINUTE = 10;
const WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
	const now = Date.now();
	const entry = rateLimits.get(ip);

	if (!entry || now > entry.resetAt) {
		rateLimits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
		return { allowed: true };
	}

	if (entry.count >= MAX_ORDERS_PER_MINUTE) {
		const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
		return { allowed: false, retryAfter };
	}

	entry.count++;
	return { allowed: true };
}

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	// Rate limit by IP
	const ip = getClientAddress();
	const rateLimit = checkRateLimit(ip);
	if (!rateLimit.allowed) {
		return json(
			{ ok: false, error: 'Demasiadas solicitudes', retryAfter: rateLimit.retryAfter },
			{
				status: 429,
				headers: {
					'Retry-After': String(rateLimit.retryAfter),
					'X-RateLimit-Limit': String(MAX_ORDERS_PER_MINUTE),
					'X-RateLimit-Remaining': '0'
				}
			}
		);
	}

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
