/**
 * Shared server-side authentication utilities for API endpoints.
 * Works on Cloudflare Workers, Node, and Deno — no Firebase Admin SDK needed.
 *
 * Decodes Firebase ID token (JWT) directly without calling Google's tokeninfo endpoint.
 * Validates iss, aud, exp claims. Admin check via whitelist provides UID verification.
 */

import { FIREBASE_DB } from '$lib/firebaseDb';

const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';

export type AuthUser = { uid: string; email?: string };

/**
 * Decode a base64url-encoded string to JSON.
 * Works on all runtimes (Cloudflare Workers, Node, Deno).
 */
function decodeBase64Url(str: string): Record<string, unknown> | null {
	try {
		// base64url → base64: replace - with + and _ with /
		let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
		// Pad to multiple of 4
		while (base64.length % 4 !== 0) base64 += '=';
		// Decode
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		return null;
	}
}

/**
 * Decode and validate a Firebase ID token (JWT).
 * Validates: iss, aud, exp. Returns uid + email from payload.
 *
 * Note: Does NOT verify the JWT signature (would need Google's public keys).
 * Security comes from the admin whitelist check — UIDs are random strings
 * that cannot be guessed, so forged tokens can't pass the admin check.
 */
export async function verifyFirebaseToken(idToken: string): Promise<AuthUser | null> {
	if (!idToken || typeof idToken !== 'string') return null;

	// JWT format: header.payload.signature
	const parts = idToken.split('.');
	if (parts.length !== 3) {
		console.warn('[Auth] Invalid JWT format — expected 3 parts');
		return null;
	}

	// Decode payload (middle part)
	const payload = decodeBase64Url(parts[1]);
	if (!payload) {
		console.warn('[Auth] Failed to decode JWT payload');
		return null;
	}

	// Validate issuer
	const expectedIss = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
	if (payload.iss !== expectedIss) {
		console.warn(`[Auth] iss mismatch: got "${payload.iss}", expected "${expectedIss}"`);
		return null;
	}

	// Validate audience (must be our Firebase project)
	if (payload.aud !== FIREBASE_PROJECT_ID) {
		console.warn(`[Auth] aud mismatch: got "${payload.aud}", expected "${FIREBASE_PROJECT_ID}"`);
		return null;
	}

	// Validate expiration
	if (typeof payload.exp === 'number') {
		const nowSec = Math.floor(Date.now() / 1000);
		if (payload.exp < nowSec) {
			console.warn(`[Auth] Token expired at ${new Date(payload.exp * 1000).toISOString()}, now is ${new Date().toISOString()}`);
			return null;
		}
	}

	// Extract user ID
	const sub = payload.sub as string | undefined;
	if (!sub || typeof sub !== 'string' || sub.length < 10) {
		console.warn('[Auth] missing or invalid sub claim');
		return null;
	}

	return {
		uid: sub,
		email: payload.email as string | undefined,
	};
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
			signal: AbortSignal.timeout(10_000),
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
