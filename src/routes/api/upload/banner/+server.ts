import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { authenticateRequest, R2_PUBLIC_BASE } from '$lib/serverAuth';

/**
 * POST /api/upload/banner
 * Upload user banner to R2. Any authenticated user can upload.
 * Expects multipart/form-data with field: file
 * Saves to banners/{uid}/banner.{ext}
 */

const MAX_BANNER_SIZE = 4 * 1024 * 1024; // 4MB

export const POST: RequestHandler = async ({ request, platform }) => {
	let user: { uid: string; email?: string } | null = null;

	if (dev) {
		user = { uid: 'dev-user', email: 'dev@localhost' };
	} else {
		const auth = await authenticateRequest(request, false); // any authenticated user
		if (auth?.error) return json({ ok: false, error: auth.error }, { status: auth.status });
		user = auth!.user;
	}

	let formData: FormData;
	try { formData = await request.formData(); } catch { return json({ ok: false, error: 'Body inválido' }, { status: 400 }); }

	const file = formData.get('file') as File | null;
	if (!file) return json({ ok: false, error: 'Falta archivo' }, { status: 400 });
	if (!file.type.startsWith('image/')) return json({ ok: false, error: 'Solo imágenes' }, { status: 400 });
	if (file.size > MAX_BANNER_SIZE) return json({ ok: false, error: 'Máximo 4MB' }, { status: 400 });

	const ext = file.name.split('.').pop() || 'jpg';
	const path = `banners/${user!.uid}/banner.${ext}`;

	try {
		const bucket = platform?.env?.MEDIA;
		const arrayBuffer = await file.arrayBuffer();

		if (bucket) {
			await bucket.put(path, arrayBuffer, {
				httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=3600' }
			});
			return json({ ok: true, path, url: `${R2_PUBLIC_BASE}/${path}?t=${Date.now()}` });
		} else if (dev) {
			const { mkdirSync, writeFileSync, existsSync } = await import('node:fs');
			const { join } = await import('node:path');
			const dir = join(process.cwd(), 'static', 'uploads', 'banners');
			if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
			const filePath = join(dir, `banner-${user!.uid}.${ext}`);
			writeFileSync(filePath, Buffer.from(arrayBuffer));
			return json({ ok: true, path, url: `/uploads/banners/banner-${user!.uid}.${ext}` });
		}
		return json({ ok: false, error: 'R2 no configurado' }, { status: 500 });
	} catch (err) {
		console.error('[Banner Upload]', err);
		return json({ ok: false, error: 'Error al subir' }, { status: 500 });
	}
};
