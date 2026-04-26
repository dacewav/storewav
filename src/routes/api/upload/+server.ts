import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/upload
 * Upload file to R2 bucket.
 * Expects multipart/form-data with fields: file, path
 *
 * R2 binding: MEDIA (configured in wrangler.jsonc)
 * For public access: enable R2 Public Bucket Access or use custom domain
 */

// R2 public URL base — configure in Cloudflare dashboard or wrangler vars
// e.g. "https://pub-xxx.r2.dev" or "https://media.dacewav.com"
const R2_PUBLIC_BASE = 'https://cdn.dacewav.store';

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

/** POST — upload file to R2 */
export const POST: RequestHandler = async ({ request, platform }) => {
	const bucket = platform?.env?.MEDIA;
	if (!bucket) {
		return json({ ok: false, error: 'R2 bucket no configurado (binding: MEDIA)' }, { status: 500 });
	}

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

	// Security: no path traversal
	if (path.includes('..') || path.startsWith('/') || path.includes('\0')) {
		return json({ ok: false, error: 'Path inválido' }, { status: 400 });
	}

	// Size limit: 100MB
	if (file.size > 100 * 1024 * 1024) {
		return json({ ok: false, error: 'Archivo demasiado grande (máx 100MB)' }, { status: 400 });
	}

	try {
		const arrayBuffer = await file.arrayBuffer();

		await bucket.put(path, arrayBuffer, {
			httpMetadata: {
				contentType: file.type || 'application/octet-stream',
				cacheControl: 'public, max-age=31536000, immutable'
			}
		});

		const url = `${R2_PUBLIC_BASE}/${path}`;

		return json({ ok: true, path, url });
	} catch (err) {
		console.error('[Upload R2]', err);
		return json({ ok: false, error: 'Error al subir a R2' }, { status: 500 });
	}
};
