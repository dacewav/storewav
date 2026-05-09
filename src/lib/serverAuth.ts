/**
 * Shared server-side authentication utilities for API endpoints.
 * Works on Cloudflare Workers, Node, and Deno — no Firebase Admin SDK needed.
 */

import { FIREBASE_DB } from '$lib/firebaseDb';

const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';

export type AuthUser = { uid: string; email?: string };

/**
 * Verify a Firebase ID token using Google's tokeninfo endpoint.
 * Returns the user payload if valid, null otherwise.
 *
 * Handles both regular and anonymous auth tokens.
 * Token must have iss=https://securetoken.google.com/{projectId} and aud={projectId}.
 */
export async function verifyFirebaseToken(idToken: string): Promise<AuthUser | null> {
	if (!idToken || idToken.length < 10) return null;

	try {
		const resp = await fetch(
			`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
			{ signal: AbortSignal.timeout(10_000) } // 10s timeout for Cloudflare Workers
		);

		if (!resp.ok) {
			console.warn(`[Auth] tokeninfo failed: ${resp.status} ${resp.statusText}`);
			return null;
		}

		const payload = await resp.json() as Record<string, string>;

		// Validate issuer: must be Firebase Auth
		const expectedIss = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
		if (payload.iss !== expectedIss) {
			console.warn(`[Auth] iss mismatch: got "${payload.iss}", expected "${expectedIss}"`);
			return null;
		}

		// Validate audience: must be our project
		if (payload.aud !== FIREBASE_PROJECT_ID) {
			console.warn(`[Auth] aud mismatch: got "${payload.aud}", expected "${FIREBASE_PROJECT_ID}"`);
			return null;
		}

		// Must have a subject (user ID)
		if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length < 10) {
			console.warn('[Auth] missing or invalid sub claim');
			return null;
		}

		return { uid: payload.sub, email: payload.email };
	} catch (err) {
		if (err instanceof Error && err.name === 'TimeoutError') {
			console.error('[Auth] tokeninfo timeout (>10s) — possible network issue on Cloudflare Workers');
		} else {
			console.error('[Auth] token verification error:', err);
		}
		return null;
	}
}

/**
 * Check if a user is an admin.
 * Fast path: check PUBLIC_ADMIN_UIDS env var.
 * Slow path: check Firebase RTDB adminWhitelist/approved/{uid}.
 */
export async function checkIsAdmin(uid: string, idToken?: string): Promise<boolean> {
	// Import env var dynamically (SvelteKit SSR)
	let adminUids: string[] = [];
	try {
		const { PUBLIC_ADMIN_UIDS } = await import('$env/static/public');
		adminUids = (PUBLIC_ADMIN_UIDS ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
	} catch {
		// Fallback: no env var available
	}

	if (adminUids.includes(uid)) return true;

	try {
		const authParam = idToken ? `?auth=${idToken}` : '';
		const resp = await fetch(`${FIREBASE_DB}/adminWhitelist/approved/${uid}.json${authParam}`, {
			signal: AbortSignal.timeout(10_000)
		});
		if (!resp.ok) return false;
		const data = await resp.json();
		return data !== null;
	} catch {
		return false;
	}
}

/**
 * Extract and verify Bearer token from request Authorization header.
 * Returns user payload if valid and admin, null otherwise.
 *
 * @param request - The incoming request
 * @param requireAdmin - If true, also checks admin status (default: true)
 * @returns AuthUser if authenticated (and admin if required), null if not
 */
export async function authenticateRequest(
	request: Request,
	requireAdmin = true
): Promise<{ user: AuthUser; error?: string; status?: number } | null> {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return { user: { uid: '' }, error: 'No autorizado — se requiere token de Firebase', status: 401 };
	}

	const idToken = authHeader.slice(7);
	const user = await verifyFirebaseToken(idToken);
	if (!user) {
		return { user: { uid: '' }, error: 'Token inválido o expirado — intenta recargar la página', status: 401 };
	}

	if (requireAdmin) {
		const isAdmin = await checkIsAdmin(user.uid, idToken);
		if (!isAdmin) {
			return { user, error: 'Prohibido — solo administradores pueden realizar esta acción', status: 403 };
		}
	}

	return { user };
}

/** R2 public CDN base URL */
export const R2_PUBLIC_BASE = 'https://cdn.dacewav.store';
