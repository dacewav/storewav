import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { FIREBASE_DB } from '$lib/firebaseDb';
import { PUBLIC_ADMIN_UIDS } from '$env/static/public';

/**
 * POST /api/upload/kit-image
 * Upload drumkit cover image to R2.
 * Expects multipart/form-data with field: file, kitId
 * Saves to kits/{kitId}/cover.{ext}
 */

const R2_PUBLIC_BASE = 'https://cdn.dacewav.store';
const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

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

async function checkIsAdmin(uid: string, idToken?: string): Promise<boolean> {
	const adminUids = (PUBLIC_ADMIN_UIDS ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
	if (adminUids.includes(uid)) return true;
	try {
		const authParam = idToken ? `?auth=${idToken}` : '';
		const resp = await fetch(`${FIREBASE_DB}/adminWhitelist/approved/${uid}.json${authParam}`);
		if (!resp.ok) return false;
		return (await resp.json()) !== null;
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request, platform }) => {
	let user: { uid: string; email?: string } | null = null;

	if (dev) {
		user = { uid: 'dev-user', email: 'dev@localhost' };
	} else {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) return json({ ok: false, error: 'No autorizado' }, { status: 401 });
		user = await verifyFirebaseToken(authHeader.slice(7));
		if (!user) return json({ ok: false, error: 'Token inválido' }, { status: 401 });
		const isAdmin = await checkIsAdmin(user.uid, authHeader.slice(7));
		if (!isAdmin) return json({ ok: false, error: 'Solo admins' }, { status: 403 });
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
