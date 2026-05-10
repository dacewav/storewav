/**
 * Shared server-side authentication utilities for API endpoints.
 * Works on Cloudflare Workers, Node, and Deno — no Firebase Admin SDK needed.
 *
 * Verifies Firebase ID tokens (JWT) using Google's public keys (RS256).
 * Validates iss, aud, exp, and cryptographic signature.
 */

import { FIREBASE_DB } from '$lib/firebaseDb';
import { FIREBASE_PROJECT_ID, CDN_URL } from '$lib/config';

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
 * Decode a base64url-encoded string to raw bytes.
 */
function decodeBase64UrlBytes(str: string): Uint8Array | null {
	try {
		let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
		while (base64.length % 4 !== 0) base64 += '=';
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return bytes;
	} catch {
		return null;
	}
}

/**
 * Parse a PEM-encoded X.509 certificate to extract the public key for RS256.
 * Strips PEM headers/footers, decodes base64, extracts SubjectPublicKeyInfo.
 */
async function importPublicKeyFromPem(pem: string): Promise<CryptoKey | null> {
	try {
		// Strip PEM headers/footers and whitespace
		const base64 = pem
			.replace(/-----BEGIN CERTIFICATE-----/, '')
			.replace(/-----END CERTIFICATE-----/, '')
			.replace(/\s/g, '');
		const certBytes = decodeBase64UrlBytes(base64.replace(/\+/g, '-').replace(/\//g, '_'));
		if (!certBytes) return null;

		// Import as X.509 certificate to extract public key
		return await crypto.subtle.importKey(
			'spki',
			extractSpkiFromCert(certBytes),
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			false,
			['verify']
		);
	} catch {
		return null;
	}
}

/**
 * Extract SubjectPublicKeyInfo (SPKI) from a DER-encoded X.509 certificate.
 * This is a simplified parser that finds the public key bit string.
 */
function extractSpkiFromCert(certDer: Uint8Array): ArrayBuffer {
	// X.509 DER: SEQUENCE { tbsCertificate, signatureAlgorithm, signatureValue }
	// tbsCertificate contains SubjectPublicKeyInfo
	// We'll parse the ASN.1 structure to find it

	let offset = 0;

	function readTag(): number {
		return certDer[offset++];
	}

	function readLength(): number {
		let len = certDer[offset++];
		if (len & 0x80) {
			const numBytes = len & 0x7f;
			len = 0;
			for (let i = 0; i < numBytes; i++) {
				len = (len << 8) | certDer[offset++];
			}
		}
		return len;
	}

	// Top-level SEQUENCE
	readTag();
	const seqLen = readLength();
	const seqEnd = offset + seqLen;

	// tbsCertificate SEQUENCE
	readTag();
	const tbsLen = readLength();
	const tbsEnd = offset + tbsLen;

	// Skip version (context [0]) if present
	if (certDer[offset] === 0xa0) {
		readTag();
		const verLen = readLength();
		offset += verLen;
	}

	// Skip serial number (INTEGER)
	readTag();
	const serialLen = readLength();
	offset += serialLen;

	// Skip signature algorithm (SEQUENCE)
	readTag();
	const sigAlgLen = readLength();
	offset += sigAlgLen;

	// Skip issuer (SEQUENCE)
	readTag();
	const issuerLen = readLength();
	offset += issuerLen;

	// Skip validity (SEQUENCE)
	readTag();
	const validityLen = readLength();
	offset += validityLen;

	// Skip subject (SEQUENCE)
	readTag();
	const subjectLen = readLength();
	offset += subjectLen;

	// SubjectPublicKeyInfo (SEQUENCE) — this is what we want
	const spkiStart = offset;
	readTag(); // SEQUENCE tag
	const spkiLen = readLength();
	const spkiEnd = offset + spkiLen;

	// Return the full SPKI as ArrayBuffer
	return certDer.slice(spkiStart, spkiEnd).buffer as ArrayBuffer;
}

// ── Google public key cache ──
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let cachedCerts: Record<string, string> | null = null;
let certsExpiry = 0;

async function getGooglePublicKeys(): Promise<Record<string, string>> {
	const now = Date.now();
	if (cachedCerts && now < certsExpiry) return cachedCerts;

	try {
		const resp = await fetch(GOOGLE_CERTS_URL, {
			headers: { 'Accept': 'application/json' },
			signal: AbortSignal.timeout(10_000),
		});
		if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

		const certs = await resp.json() as Record<string, string>;
		cachedCerts = certs;

		// Cache for 1 hour (Google's Cache-Control is usually max-age=3600)
		const cacheControl = resp.headers.get('Cache-Control') || '';
		const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
		const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) * 1000 : 3600_000;
		certsExpiry = now + maxAge;

		return certs;
	} catch (err) {
		// If fetch fails but we have stale cache, use it
		if (cachedCerts) {
			console.warn('[Auth] Failed to fetch Google certs, using stale cache');
			return cachedCerts;
		}
		throw err;
	}
}

/**
 * Verify RS256 signature of a JWT using Google's public keys.
 */
async function verifyJwtSignature(
	headerB64: string,
	payloadB64: string,
	signatureB64: string,
	header: Record<string, unknown>
): Promise<boolean> {
	try {
		const kid = header.kid as string | undefined;
		if (!kid) return false;

		const certs = await getGooglePublicKeys();
		const pem = certs[kid];
		if (!pem) {
			console.warn(`[Auth] No Google cert found for kid: ${kid}`);
			return false;
		}

		const publicKey = await importPublicKeyFromPem(pem);
		if (!publicKey) {
			console.warn('[Auth] Failed to import public key');
			return false;
		}

		const signatureBytes = decodeBase64UrlBytes(signatureB64);
		if (!signatureBytes) return false;

		const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

		return await crypto.subtle.verify(
			'RSASSA-PKCS1-v1_5',
			publicKey,
			signatureBytes.buffer as ArrayBuffer,
			signedData
		);
	} catch (err) {
		console.warn('[Auth] Signature verification error:', err);
		return false;
	}
}

/**
 * Decode and validate a Firebase ID token (JWT).
 * Validates: iss, aud, exp, and cryptographic signature (RS256).
 * Returns uid + email from payload.
 */
export async function verifyFirebaseToken(idToken: string): Promise<AuthUser | null> {
	if (!idToken || typeof idToken !== 'string') return null;

	// JWT format: header.payload.signature
	const parts = idToken.split('.');
	if (parts.length !== 3) {
		console.warn('[Auth] Invalid JWT format — expected 3 parts');
		return null;
	}

	const [headerB64, payloadB64, signatureB64] = parts;

	// Decode header
	const header = decodeBase64Url(headerB64);
	if (!header) {
		console.warn('[Auth] Failed to decode JWT header');
		return null;
	}

	// Validate algorithm
	if (header.alg !== 'RS256') {
		console.warn(`[Auth] Unexpected algorithm: ${header.alg}, expected RS256`);
		return null;
	}

	// Decode payload (middle part)
	const payload = decodeBase64Url(payloadB64);
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

	// Verify cryptographic signature with Google's public keys
	const sigValid = await verifyJwtSignature(headerB64, payloadB64, signatureB64, header);
	if (!sigValid) {
		console.warn('[Auth] JWT signature verification failed');
		return null;
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
export const R2_PUBLIC_BASE = CDN_URL;
