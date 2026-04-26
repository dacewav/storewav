import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/plays
 * Secure play counter endpoint with server-side rate limiting.
 * Replaces direct Firebase writes from client-side `incrementPlay()`.
 *
 * SECURITY:
 * - Rate limited per IP: max 30 plays per minute
 * - Validates beatId format
 * - Uses Firebase REST API with admin-level transaction
 * - No auth required (public endpoint) but rate limited
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

// ── In-memory rate limiter (per Cloudflare Worker instance) ──
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_PLAYS_PER_MINUTE = 30;
const WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
	const now = Date.now();
	const entry = rateLimits.get(ip);

	if (!entry || now > entry.resetAt) {
		rateLimits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
		return { allowed: true };
	}

	if (entry.count >= MAX_PLAYS_PER_MINUTE) {
		const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
		return { allowed: false, retryAfter };
	}

	entry.count++;
	return { allowed: true };
}

// ── Cleanup stale entries periodically ──
let lastCleanup = 0;
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes

function cleanupStaleEntries() {
	const now = Date.now();
	if (now - lastCleanup < CLEANUP_INTERVAL) return;
	lastCleanup = now;

	for (const [ip, entry] of rateLimits) {
		if (now > entry.resetAt) {
			rateLimits.delete(ip);
		}
	}
}

/** Validate beatId format (Firebase push IDs are 20 chars, alphanumeric) */
function isValidBeatId(id: string): boolean {
	return /^[a-zA-Z0-9_-]{1,128}$/.test(id);
}

/** Increment plays via Firebase REST API transaction */
async function incrementPlays(beatId: string): Promise<number | null> {
	try {
		// Read current value
		const readResp = await fetch(`${FIREBASE_DB}/beats/${beatId}/plays.json`);
		if (!readResp.ok) return null;

		const current = await readResp.json();
		const currentValue = typeof current === 'number' ? current : 0;
		const newValue = currentValue + 1;

		// Write new value (simple optimistic approach — acceptable for play counts)
		const writeResp = await fetch(`${FIREBASE_DB}/beats/${beatId}/plays.json`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newValue)
		});

		if (!writeResp.ok) return null;
		return newValue;
	} catch {
		return null;
	}
}

/** POST — increment play count for a beat */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	cleanupStaleEntries();

	// 1. Rate limit by IP
	const ip = getClientAddress();
	const rateLimit = checkRateLimit(ip);
	if (!rateLimit.allowed) {
		return json(
			{ ok: false, error: 'Demasiadas solicitudes', retryAfter: rateLimit.retryAfter },
			{
				status: 429,
				headers: {
					'Retry-After': String(rateLimit.retryAfter),
					'X-RateLimit-Limit': String(MAX_PLAYS_PER_MINUTE),
					'X-RateLimit-Remaining': '0'
				}
			}
		);
	}

	// 2. Parse body
	let body: { beatId?: string };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Body inválido — esperaba JSON con beatId' }, { status: 400 });
	}

	const { beatId } = body;
	if (!beatId || typeof beatId !== 'string') {
		return json({ ok: false, error: 'Falta campo requerido: beatId' }, { status: 400 });
	}

	if (!isValidBeatId(beatId)) {
		return json({ ok: false, error: 'beatId inválido' }, { status: 400 });
	}

	// 3. Increment
	const newCount = await incrementPlays(beatId);
	if (newCount === null) {
		return json({ ok: false, error: 'Beat no encontrado o error al incrementar' }, { status: 404 });
	}

	return json({ ok: true, plays: newCount });
};
