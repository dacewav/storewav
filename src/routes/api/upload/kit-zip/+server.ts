import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';
import { FIREBASE_DB } from '$lib/firebaseDb';
import { PUBLIC_ADMIN_UIDS } from '$env/static/public';
import { unzipSync } from 'fflate';
import { getAudioDuration } from '$lib/audioDuration';

/**
 * POST /api/upload/kit-zip
 * Upload a ZIP of audio samples, extract to R2.
 * Expects multipart/form-data with field: file, kitId
 * Extracts audio files to kits/{kitId}/samples/{filename}
 * Returns JSON: { ok, samples: [{ name, url }] }
 */

const R2_PUBLIC_BASE = 'https://cdn.dacewav.store';
const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';
const MAX_ZIP_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_SAMPLE_SIZE = 50 * 1024 * 1024; // 50MB per sample
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.wma', '.aiff', '.aif'];

const MIME_MAP: Record<string, string> = {
	'.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.flac': 'audio/flac',
	'.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
	'.wma': 'audio/x-ms-wma', '.aiff': 'audio/aiff', '.aif': 'audio/aiff',
};

function isAudioFile(name: string): boolean {
	const lower = name.toLowerCase();
	return AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function getMimeType(name: string): string {
	const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
	return MIME_MAP[ext] || 'audio/mpeg';
}

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

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
	if (file.size > MAX_ZIP_SIZE) return json({ ok: false, error: 'Máximo 200MB' }, { status: 400 });
	if (kitId.includes('..') || kitId.includes('/')) return json({ ok: false, error: 'kitId inválido' }, { status: 400 });

	// Check file extension
	const fname = file.name.toLowerCase();
	if (!fname.endsWith('.zip') && !fname.endsWith('.rar') && !fname.endsWith('.7z')) {
		return json({ ok: false, error: 'Solo archivos .zip' }, { status: 400 });
	}

	if (!fname.endsWith('.zip')) {
		return json({ ok: false, error: 'Solo .zip soportado por ahora. Próximamente .rar y .7z' }, { status: 400 });
	}

	try {
		const zipBuffer = new Uint8Array(await file.arrayBuffer());
		const files = unzipSync(zipBuffer);

		const bucket = platform?.env?.MEDIA;
		const samples: { name: string; url: string; duration?: number }[] = [];
		const errors: string[] = [];

		for (const [entryName, entryData] of Object.entries(files)) {
			// Skip directories and non-audio files
			if (entryName.endsWith('/')) continue;
			if (!isAudioFile(entryName)) continue;
			if (entryData.length > MAX_SAMPLE_SIZE) {
				errors.push(`${entryName}: demasiado grande (máx 50MB)`);
				continue;
			}

			// Flatten path: take only filename, not nested dirs
			const flatName = sanitizeFilename(entryName.split('/').pop() || entryName);
			const r2Path = `kits/${kitId}/samples/${flatName}`;
			const mimeType = getMimeType(flatName);
			const duration = getAudioDuration(entryData, flatName);

			const sample: { name: string; url: string; duration?: number } = {
				name: flatName.replace(/\.[^.]+$/, ''),
				url: '', // set below
			};
			if (duration != null && duration > 0) sample.duration = duration;

			if (bucket) {
				await bucket.put(r2Path, entryData, {
					httpMetadata: { contentType: mimeType, cacheControl: 'public, max-age=31536000' }
				});
				sample.url = `${R2_PUBLIC_BASE}/${r2Path}`;
				samples.push(sample);
			} else if (dev) {
				const { mkdirSync, writeFileSync, existsSync } = await import('node:fs');
				const { join } = await import('node:path');
				const dir = join(process.cwd(), 'static', 'uploads', 'kits', kitId, 'samples');
				if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
				writeFileSync(join(dir, flatName), entryData);
				sample.url = `/uploads/kits/${kitId}/samples/${flatName}`;
				samples.push(sample);
			}
		}

		if (samples.length === 0) {
			return json({ ok: false, error: 'No se encontraron archivos de audio en el ZIP', details: errors }, { status: 400 });
		}

		return json({ ok: true, samples, errors: errors.length ? errors : undefined });
	} catch (err) {
		console.error('[Kit ZIP Upload]', err);
		return json({ ok: false, error: 'Error al procesar ZIP — ¿está corrupto?' }, { status: 500 });
	}
};
