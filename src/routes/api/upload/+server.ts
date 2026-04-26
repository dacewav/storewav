import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

/**
 * POST /api/upload
 * Upload file to R2 bucket.
 * Expects multipart/form-data with fields: file, path
 *
 * R2 binding: MEDIA (configured in wrangler.jsonc)
 * SECURITY: Requires Firebase ID token in Authorization header.
 * Only image/*, audio/*, video/* MIME types are allowed.
 */

const R2_PUBLIC_BASE = 'https://cdn.dacewav.store';
const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';

/** Allowed MIME type prefixes and their max sizes */
const ALLOWED_TYPES: Record<string, number> = {
	'image/': 20 * 1024 * 1024,
	'audio/': 100 * 1024 * 1024,
	'video/': 100 * 1024 * 1024,
};

/** Blocked extensions (even if MIME is spoofed) */
const BLOCKED_EXTENSIONS = [
	'.html', '.htm', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
	'.svg', '.xml', '.xhtml', '.php', '.py', '.rb', '.pl', '.sh',
	'.bat', '.cmd', '.ps1', '.exe', '.dll', '.so', '.dylib',
	'.jar', '.war', '.class', '.wasm',
];

/** Verify Firebase ID token using Google's tokeninfo endpoint.
 *  Works on all runtimes (Cloudflare Workers, Node, Deno) — no Web Crypto needed. */
async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string } | null> {
	try {
		const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
		if (!resp.ok) return null;

		const payload = await resp.json() as Record<string, string>;

		// Validate issuer
		if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
		// Validate audience
		if (payload.aud !== FIREBASE_PROJECT_ID) return null;
		// Must have a subject (user ID)
		if (!payload.sub || typeof payload.sub !== 'string') return null;

		return { uid: payload.sub, email: payload.email };
	} catch (err) {
		console.error('[Upload] Token verification failed:', err);
		return null;
	}
}

/** Check if user is admin via Firebase RTDB REST API (with auth token) */
async function checkIsAdmin(uid: string, idToken?: string): Promise<boolean> {
	// Hardcoded super-admin
	if (uid === 'Uks9YGSd6rS40zqlRujoe6pE6N22') return true;

	try {
		const authParam = idToken ? `?auth=${idToken}` : '';
		const resp = await fetch(`https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/adminWhitelist/approved/${uid}.json${authParam}`);
		if (!resp.ok) return false;
		const data = await resp.json();
		return data !== null;
	} catch {
		return false;
	}
}

/** Validate file extension against blocklist */
function isBlockedExtension(filename: string): boolean {
	const lower = filename.toLowerCase();
	return BLOCKED_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/** Validate MIME type against allowlist */
function isAllowedMimeType(mimeType: string): boolean {
	if (!mimeType) return false;
	return Object.keys(ALLOWED_TYPES).some(prefix => mimeType.startsWith(prefix));
}

/** Get max size for MIME type */
function getMaxSize(mimeType: string): number {
	for (const [prefix, maxSize] of Object.entries(ALLOWED_TYPES)) {
		if (mimeType.startsWith(prefix)) return maxSize;
	}
	return 0;
}

/** HEAD — health check for R2 availability */
export const HEAD: RequestHandler = async ({ platform }) => {
	const hasR2 = !!platform?.env?.MEDIA;
	return new Response(null, {
		status: hasR2 ? 200 : 503,
		headers: { 'X-R2-Available': String(hasR2) }
	});
};

/** GET — also respond for health checks */
export const GET: RequestHandler = async ({ platform }) => {
	const hasR2 = !!platform?.env?.MEDIA;
	return json({ r2: hasR2 });
};

/** POST — upload file to R2 (requires auth + admin) */
export const POST: RequestHandler = async ({ request, platform }) => {
	// 1. Authenticate — skip token verification in dev mode
	let user: { uid: string; email?: string } | null = null;

	if (dev) {
		// Dev mode: accept any request, use placeholder user
		user = { uid: 'dev-user', email: 'dev@localhost' };
	} else {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return json({ ok: false, error: 'No autorizado — se requiere token de Firebase' }, { status: 401 });
		}

		const idToken = authHeader.slice(7);
		user = await verifyFirebaseToken(idToken);
		if (!user) {
			return json({ ok: false, error: 'Token inválido o expirado' }, { status: 401 });
		}

		// Admin check — only in production
		const isAdmin = await checkIsAdmin(user.uid, idToken);
		if (!isAdmin) {
			return json({ ok: false, error: 'Prohibido — solo administradores pueden subir archivos' }, { status: 403 });
		}
	}

	// 2. Check R2 binding
	const bucket = platform?.env?.MEDIA;

	// 4. Parse form data
	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return json({ ok: false, error: 'Body inválido — esperaba multipart/form-data' }, { status: 400 });
	}

	const file = formData.get('file') as File | null;
	const path = formData.get('path') as string | null;

	if (!file || !path) {
		return json({ ok: false, error: 'Faltan campos requeridos: file, path' }, { status: 400 });
	}

	// 5. Security: no path traversal
	if (path.includes('..') || path.startsWith('/') || path.includes('\0')) {
		return json({ ok: false, error: 'Path inválido' }, { status: 400 });
	}

	// 6. Security: block dangerous file extensions
	if (isBlockedExtension(file.name)) {
		return json({ ok: false, error: `Tipo de archivo no permitido: ${file.name}` }, { status: 400 });
	}

	// 7. Security: validate MIME type
	if (!isAllowedMimeType(file.type)) {
		return json({ ok: false, error: `MIME type no permitido: ${file.type || 'desconocido'}. Solo se permiten imágenes, audio y video.` }, { status: 400 });
	}

	// 8. Size limit based on type
	const maxSize = getMaxSize(file.type);
	if (file.size > maxSize) {
		const maxMB = Math.round(maxSize / (1024 * 1024));
		return json({ ok: false, error: `Archivo demasiado grande (máx ${maxMB}MB para ${file.type})` }, { status: 400 });
	}

	// 9. Upload
	try {
		const arrayBuffer = await file.arrayBuffer();

		if (bucket) {
			// R2 available (prod or wrangler dev): upload to R2
			await bucket.put(path, arrayBuffer, {
				httpMetadata: {
					contentType: file.type || 'application/octet-stream',
					cacheControl: 'public, max-age=31536000, immutable'
				}
			});
			const url = `${R2_PUBLIC_BASE}/${path}`;
			return json({ ok: true, path, url });
		} else if (dev) {
			// Dev mode without R2: save to local filesystem (static/uploads/)
			const { mkdirSync, writeFileSync, existsSync } = await import('node:fs');
			const { join } = await import('node:path');
			const uploadDir = join(process.cwd(), 'static', 'uploads');
			if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

			const flatName = path.replace(/\//g, '-');
			const filePath = join(uploadDir, flatName);
			writeFileSync(filePath, Buffer.from(arrayBuffer));

			const url = `/uploads/${flatName}`;
			console.log(`[Upload] Dev mode — saved to ${filePath}`);
			return json({ ok: true, path, url });
		} else {
			return json({ ok: false, error: 'R2 bucket no configurado (binding: MEDIA)' }, { status: 500 });
		}
	} catch (err) {
		console.error('[Upload]', err);
		return json({ ok: false, error: 'Error al subir archivo' }, { status: 500 });
	}
};
