import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { authenticateRequest, R2_PUBLIC_BASE } from '$lib/serverAuth';

/**
 * POST /api/upload/kit-image
 * Upload drumkit cover image to R2.
 * Expects multipart/form-data with field: file, kitId
 * Saves to kits/{kitId}/cover.{ext}
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const POST: RequestHandler = async ({ request, platform }) => {
	let user: { uid: string; email?: string } | null = null;

	if (dev) {
		user = { uid: 'dev-user', email: 'dev@localhost' };
	} else {
		const auth = await authenticateRequest(request);
		if (auth?.error) return json({ ok: false, error: auth.error }, { status: auth.status });
		user = auth!.user;
	}

	let formData: FormData;
	try { formData = await request.formData(); } catch { return json({ ok: false, error: 'Body inválido' }, { status: 400 }); }

	const file = formData.get('file') as File | null;
	const kitId = formData.get('kitId') as string | null;

	if (!file || !kitId) return json({ ok: false, error: 'Falta file o kitId' }, { status: 400 });
	if (!file.type.startsWith('image/')) return json({ ok: false, error: 'Solo imágenes' }, { status: 400 });
	if (file.size > MAX_IMAGE_SIZE) return json({ ok: false, error: 'Máximo 5MB' }, { status: 400 });
	if (kitId.includes('..') || kitId.includes('/')) return json({ ok: false, error: 'kitId inválido' }, { status: 400 });

	const ext = file.name.split('.').pop() || 'jpg';
	const path = `kits/${kitId}/cover.${ext}`;

	try {
		const bucket = platform?.env?.MEDIA;
		const arrayBuffer = await file.arrayBuffer();

		if (bucket) {
			await bucket.put(path, arrayBuffer, {
				httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000' }
			});
			return json({ ok: true, path, url: `${R2_PUBLIC_BASE}/${path}?t=${Date.now()}` });
		} else if (dev) {
			const { mkdirSync, writeFileSync, existsSync } = await import('node:fs');
			const { join } = await import('node:path');
			const dir = join(process.cwd(), 'static', 'uploads', 'kits');
			if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
			const filePath = join(dir, `${kitId}-cover.${ext}`);
			writeFileSync(filePath, Buffer.from(arrayBuffer));
			return json({ ok: true, path, url: `/uploads/kits/${kitId}-cover.${ext}` });
		}
		return json({ ok: false, error: 'R2 no configurado' }, { status: 500 });
	} catch (err) {
		console.error('[Kit Image Upload]', err);
		return json({ ok: false, error: 'Error al subir' }, { status: 500 });
	}
};
