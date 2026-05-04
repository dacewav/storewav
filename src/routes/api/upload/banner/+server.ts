import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

/**
 * POST /api/upload/banner
 * Upload user banner to R2. Any authenticated user can upload.
 * Expects multipart/form-data with field: file
 * Saves to banners/{uid}/banner.{ext}
 */

const R2_PUBLIC_BASE = 'https://cdn.dacewav.store';
const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';
const MAX_BANNER_SIZE = 4 * 1024 * 1024; // 4MB

async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email?: string } | null> {
	try {
		const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
		if (!resp.ok) return null;
		const payload = await resp.json() as Record<string, string>;
		if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;
		if (payload.aud !== FIREBASE_PROJECT_ID) return null;
		if (!payload.sub) return null;
		return { uid: payload.sub, email: payload.email };
	} catch {
		return null;
	}
}

export const POST: RequestHandler = async ({ request, platform }) => {
	// 1. Authenticate
	let user: { uid: string; email?: string } | null = null;

	if (dev) {
		user = { uid: 'dev-user', email: 'dev@localhost' };
	} else {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return json({ ok: false, error: 'No autorizado' }, { status: 401 });
		}
		user = await verifyFirebaseToken(authHeader.slice(7));
		if (!user) {
			return json({ ok: false, error: 'Token inválido' }, { status: 401 });
		}
	}

	// 2. Parse form data
	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return json({ ok: false, error: 'Body inválido' }, { status: 400 });
	}

	const file = formData.get('file') as File | null;
	if (!file) {
		return json({ ok: false, error: 'Falta archivo' }, { status: 400 });
	}

	// 3. Validate: only images
	if (!file.type.startsWith('image/')) {
		return json({ ok: false, error: 'Solo se permiten imágenes' }, { status: 400 });
	}

	// 4. Size limit
	if (file.size > MAX_BANNER_SIZE) {
		return json({ ok: false, error: 'Máximo 4MB' }, { status: 400 });
	}

	// 5. Determine path
	const ext = file.name.split('.').pop() || 'jpg';
	const path = `banners/${user.uid}/banner.${ext}`;

	// 6. Upload to R2
	try {
		const bucket = platform?.env?.MEDIA;
		const arrayBuffer = await file.arrayBuffer();

		if (bucket) {
			await bucket.put(path, arrayBuffer, {
				httpMetadata: {
					contentType: file.type,
					cacheControl: 'public, max-age=3600'
				}
			});
			const url = `${R2_PUBLIC_BASE}/${path}?t=${Date.now()}`;
			return json({ ok: true, path, url });
		} else if (dev) {
			const { mkdirSync, writeFileSync, existsSync } = await import('node:fs');
			const { join } = await import('node:path');
			const uploadDir = join(process.cwd(), 'static', 'uploads', 'banners');
			if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
			const filePath = join(uploadDir, `banner-${user.uid}.${ext}`);
			writeFileSync(filePath, Buffer.from(arrayBuffer));
			const url = `/uploads/banners/banner-${user.uid}.${ext}`;
			return json({ ok: true, path, url });
		} else {
			return json({ ok: false, error: 'R2 no configurado' }, { status: 500 });
		}
	} catch (err) {
		console.error('[Banner Upload]', err);
		return json({ ok: false, error: 'Error al subir' }, { status: 500 });
	}
};
