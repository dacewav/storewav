import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { authenticateRequest, R2_PUBLIC_BASE } from '$lib/serverAuth';

/**
 * POST /api/upload
 * Upload file to R2 bucket.
 * Expects multipart/form-data with fields: file, path
 *
 * R2 binding: MEDIA (configured in wrangler.jsonc)
 * SECURITY: Requires Firebase ID token + admin in Authorization header.
 * Only image/*, audio/*, video/* MIME types are allowed.
 */

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

function isBlockedExtension(filename: string): boolean {
	const lower = filename.toLowerCase();
	return BLOCKED_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function isAllowedMimeType(mimeType: string): boolean {
	if (!mimeType) return false;
	return Object.keys(ALLOWED_TYPES).some(prefix => mimeType.startsWith(prefix));
}

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
	let user: { uid: string; email?: string } | null = null;

	if (dev) {
		user = { uid: 'dev-user', email: 'dev@localhost' };
	} else {
		const auth = await authenticateRequest(request);
		if (auth?.error) return json({ ok: false, error: auth.error }, { status: auth.status });
		user = auth!.user;
	}

	const bucket = platform?.env?.MEDIA;

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return json({ ok: false, error: 'Body inválido — esperaba multipart/form-data' }, { status: 400 });
	}

	const file = formData.get('file') as File | null;
	const path = formData.get('path') as string | null;

	if (!file || !path) return json({ ok: false, error: 'Faltan campos requeridos: file, path' }, { status: 400 });

	// Security checks
	if (path.includes('..') || path.startsWith('/') || path.includes('\0')) {
		return json({ ok: false, error: 'Path inválido' }, { status: 400 });
	}
	if (isBlockedExtension(file.name)) {
		return json({ ok: false, error: `Tipo de archivo no permitido: ${file.name}` }, { status: 400 });
	}
	if (!isAllowedMimeType(file.type)) {
		return json({ ok: false, error: `MIME type no permitido: ${file.type || 'desconocido'}. Solo se permiten imágenes, audio y video.` }, { status: 400 });
	}

	const maxSize = getMaxSize(file.type);
	if (file.size > maxSize) {
		const maxMB = Math.round(maxSize / (1024 * 1024));
		return json({ ok: false, error: `Archivo demasiado grande (máx ${maxMB}MB para ${file.type})` }, { status: 400 });
	}

	try {
		const arrayBuffer = await file.arrayBuffer();

		if (bucket) {
			await bucket.put(path, arrayBuffer, {
				httpMetadata: {
					contentType: file.type || 'application/octet-stream',
					cacheControl: 'public, max-age=31536000, immutable'
				}
			});
			return json({ ok: true, path, url: `${R2_PUBLIC_BASE}/${path}` });
		} else if (dev) {
			const { mkdirSync, writeFileSync, existsSync } = await import('node:fs');
			const { join } = await import('node:path');
			const uploadDir = join(process.cwd(), 'static', 'uploads');
			if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

			const flatName = path.replace(/\//g, '-');
			const filePath = join(uploadDir, flatName);
			writeFileSync(filePath, Buffer.from(arrayBuffer));
			return json({ ok: true, path, url: `/uploads/${flatName}` });
		}
		return json({ ok: false, error: 'R2 bucket no configurado (binding: MEDIA)' }, { status: 500 });
	} catch (err) {
		console.error('[Upload]', err);
		return json({ ok: false, error: 'Error al subir archivo' }, { status: 500 });
	}
};
