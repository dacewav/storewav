import type { RequestHandler } from './$types';
import { getPresignedDownloadUrl, r2KeyFromUrl, sanitizeFilename } from '$lib/r2Presign';
import { FIREBASE_DB } from '$lib/firebaseDb';

/**
 * GET /api/download/[orderId]/[beatId]?token=uuid
 * Secure file download — verifies order is paid + download token, then redirects to a presigned R2 URL.
 * Falls back to R2 binding or proxy if presigning is unavailable.
 */
const R2_BUCKET = 'dace-beats';
const PRESIGNED_EXPIRY = 3600; // 1 hour

// Cache verified orders for 5 min to avoid repeated Firebase calls
const orderCache = new Map<string, { verified: number; items: string[] }>();
const CACHE_TTL = 5 * 60 * 1000;

// Probabilistic cleanup of stale cache entries (10% of requests)
function maybeCleanupCache(): void {
	if (Math.random() > 0.1) return;
	const cutoff = Date.now() - CACHE_TTL;
	for (const [key, entry] of orderCache) {
		if (entry.verified < cutoff) orderCache.delete(key);
	}
}

async function verifyOrder(orderId: string, beatId: string): Promise<boolean> {
	const cached = orderCache.get(orderId);
	if (cached && Date.now() - cached.verified < CACHE_TTL) {
		return cached.items.includes(beatId);
	}

	try {
		const resp = await fetch(`${FIREBASE_DB}/orders/${orderId}.json`);
		if (!resp.ok) return false;

		const order = await resp.json() as {
			status?: string;
			items?: Array<{ beatId: string }>;
		} | null;

		if (!order || order.status !== 'paid') return false;

		const items = order.items?.map(i => i.beatId) ?? [];
		orderCache.set(orderId, { verified: Date.now(), items });
		return items.includes(beatId);
	} catch (err) {
		console.warn(`[Download] Order verification failed for ${orderId}:`, err);
		return false;
	}
}

/** Verify download token from Firebase (7-day TTL) */
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
async function verifyToken(orderId: string, beatId: string, token: string): Promise<boolean> {
	try {
		const resp = await fetch(`${FIREBASE_DB}/downloadTokens/${orderId}_${beatId}.json`);
		if (!resp.ok) return false;

		const data = await resp.json() as { token?: string; createdAt?: number } | null;
		if (!data || data.token !== token) return false;

		// Check TTL — reject tokens older than 7 days
		if (data.createdAt && Date.now() - data.createdAt > TOKEN_TTL) {
			console.warn(`[Download] Expired token for ${orderId}/${beatId} (created ${new Date(data.createdAt).toISOString()})`);
			return false;
		}

		return true;
	} catch (err) {
		console.warn(`[Download] Token verification failed for ${orderId}/${beatId}:`, err);
		return false;
	}
}

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const { orderId, beatId } = params;
	const token = url.searchParams.get('token');

	if (!orderId || !beatId) {
		return new Response('Missing parameters', { status: 400 });
	}

	if (!token) {
		return new Response('Missing download token', { status: 403 });
	}

	maybeCleanupCache();

	// Verify order
	const isAuthorized = await verifyOrder(orderId, beatId);
	if (!isAuthorized) {
		return new Response('Unauthorized — order not paid or beat not in order', { status: 403 });
	}

	// Verify token
	const isTokenValid = await verifyToken(orderId, beatId, token);
	if (!isTokenValid) {
		return new Response('Invalid or expired download token', { status: 403 });
	}

	// Get beat data to find R2 key
	let audioUrl: string;
	let beatName: string;
	try {
		const beatResp = await fetch(`${FIREBASE_DB}/beats/${beatId}.json`);
		if (!beatResp.ok) return new Response('Beat not found', { status: 404 });

		const beat = await beatResp.json() as { audioUrl?: string; name?: string } | null;
		if (!beat?.audioUrl) return new Response('Audio not available', { status: 404 });

		audioUrl = beat.audioUrl;
		beatName = beat.name || 'beat';
	} catch {
		return new Response('Error fetching beat', { status: 500 });
	}

	// ── Presigned URL (primary method) ──
	const env = platform?.env as Record<string, string> | undefined;
	const r2AccountId = env?.R2_ACCOUNT_ID;
	const r2AccessKeyId = env?.R2_ACCESS_KEY_ID;
	const r2SecretAccessKey = env?.R2_SECRET_ACCESS_KEY;

	if (r2AccountId && r2AccessKeyId && r2SecretAccessKey) {
		const key = r2KeyFromUrl(audioUrl);
		if (key) {
			const r2Env = { R2_ACCOUNT_ID: r2AccountId, R2_ACCESS_KEY_ID: r2AccessKeyId, R2_SECRET_ACCESS_KEY: r2SecretAccessKey };
			try {
				// Try normalized key first (no leading slash)
				const presignedUrl = await getPresignedDownloadUrl(R2_BUCKET, key, r2Env, PRESIGNED_EXPIRY);
				return new Response(null, {
					status: 302,
					headers: { Location: presignedUrl, 'Cache-Control': 'private, no-store' },
				});
			} catch (err) {
				// Fallback: try with leading slash (legacy R2 keys)
				try {
					const presignedUrl = await getPresignedDownloadUrl(R2_BUCKET, `/${key}`, r2Env, PRESIGNED_EXPIRY);
					return new Response(null, {
						status: 302,
						headers: { Location: presignedUrl, 'Cache-Control': 'private, no-store' },
					});
				} catch {
					console.error('[Download] Presign failed (both keys), falling back:', err);
				}
			}
		}
	}

	// ── Fallback 1: R2 binding (direct, no egress) ──
	const r2 = platform?.env?.MEDIA;
	if (r2) {
		const key = r2KeyFromUrl(audioUrl);
		if (key) {
			// Try normalized key first, then with leading slash (legacy keys)
			for (const tryKey of [key, `/${key}`]) {
				try {
					const obj = await r2.get(tryKey);
					if (obj) {
						const headers = new Headers();
						headers.set('Content-Type', obj.httpMetadata?.contentType || 'audio/mpeg');
						headers.set('Content-Disposition', `attachment; filename="${sanitizeFilename(beatName)}.mp3"`);
						headers.set('Cache-Control', 'private, no-store');
						return new Response(obj.body, { headers });
					}
				} catch { /* try next key */ }
			}
			console.warn('[Download] R2 binding: object not found for either key');
		}
	}

	// ── Fallback 2: proxy from public URL ──
	try {
		const resp = await fetch(audioUrl);
		if (!resp.ok) return new Response('File not found', { status: 404 });

		const headers = new Headers();
		headers.set('Content-Type', resp.headers.get('Content-Type') || 'audio/mpeg');
		headers.set('Content-Disposition', `attachment; filename="${sanitizeFilename(beatName)}.mp3"`);
		headers.set('Cache-Control', 'private, no-store');

		return new Response(resp.body, { headers });
	} catch {
		return new Response('Download error', { status: 500 });
	}
};
