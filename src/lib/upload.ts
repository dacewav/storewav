/**
 * Upload utility — R2 (prod) / Firebase Storage (dev fallback)
 *
 * Production: POST /api/upload → Cloudflare R2
 * Dev: Firebase Storage (si está configurado)
 */

import { browser } from '$app/environment';

export type UploadResult = {
	url: string;
	path: string;
};

export type UploadProgress = {
	bytesTransferred: number;
	totalBytes: number;
	percent: number;
};

/**
 * Sube un archivo vía API route → R2 (prod) o Firebase Storage (dev)
 * @param path - Path en storage (ej: 'beats/covers/abc123/1234.jpg')
 * @param file - File object
 * @param onProgress - Callback de progreso
 */
export async function uploadFile(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	// Detect: if we have an API route, use R2; otherwise fallback to Firebase
	const useR2 = await isR2Available();

	if (useR2) {
		return uploadToR2(path, file, onProgress);
	}

	// Dev fallback: Firebase Storage
	return uploadToFirebase(path, file, onProgress);
}

/**
 * Upload via /api/upload → R2
 */
async function uploadToR2(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	onProgress?.({ bytesTransferred: 0, totalBytes: file.size, percent: 0 });

	const formData = new FormData();
	formData.append('file', file);
	formData.append('path', path);

	const res = await fetch('/api/upload', {
		method: 'POST',
		body: formData
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
		throw new Error(body.error || `Upload falló (${res.status})`);
	}

	onProgress?.({ bytesTransferred: file.size, totalBytes: file.size, percent: 100 });

	const data = await res.json();
	if (!data.ok) throw new Error(data.error || 'Upload falló');

	return { url: data.url, path: data.path };
}

/**
 * Dev fallback: Firebase Storage
 */
async function uploadToFirebase(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	const { getStorageInstance } = await import('$lib/firebase');
	const storage = await getStorageInstance();
	if (!storage) throw new Error('Firebase Storage no configurado y R2 no disponible.');

	const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
	const storageRef = ref(storage, path);

	return new Promise((resolve, reject) => {
		let lastProgress = 0;
		const timeout = setTimeout(() => {
			if (lastProgress === 0) {
				reject(new Error('Upload timeout: sin progreso en 30s.'));
			}
		}, 30_000);

		const task = uploadBytesResumable(storageRef, file);

		task.on(
			'state_changed',
			(snapshot) => {
				const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
				if (pct > 0) lastProgress = pct;
				onProgress?.({
					bytesTransferred: snapshot.bytesTransferred,
					totalBytes: snapshot.totalBytes,
					percent: pct
				});
			},
			(error) => {
				clearTimeout(timeout);
				reject(error);
			},
			async () => {
				clearTimeout(timeout);
				try {
					const url = await getDownloadURL(task.snapshot.ref);
					resolve({ url, path });
				} catch (err) {
					reject(err);
				}
			}
		);
	});
}

/**
 * Check if R2 upload endpoint is available
 */
async function isR2Available(): Promise<boolean> {
	if (!browser) return false;
	try {
		// If the app is running on Cloudflare Pages with R2 binding, the API route works
		// In dev mode (localhost), it won't have R2 → falls back to Firebase
		const res = await fetch('/api/upload', { method: 'OPTIONS' }).catch(() => null);
		// If the route exists (even if it returns 405), R2 is available
		return res !== null && res.status !== 404;
	} catch {
		return false;
	}
}

/**
 * Genera un path único para un archivo
 */
export function generatePath(folder: string, beatId: string, fileName: string): string {
	const ext = fileName.split('.').pop() || 'bin';
	const ts = Date.now();
	return `${folder}/${beatId}/${ts}.${ext}`;
}

/**
 * Borra un archivo de R2 o Firebase Storage por path/URL
 */
export async function deleteFile(pathOrUrl: string): void {
	// If it looks like a URL, try Firebase delete; otherwise it's an R2 path
	if (pathOrUrl.startsWith('http')) {
		try {
			const { getStorageInstance } = await import('$lib/firebase');
			const storage = await getStorageInstance();
			if (!storage) return;
			const { ref, deleteObject } = await import('firebase/storage');
			await deleteObject(ref(storage, pathOrUrl));
		} catch {
			// Silently fail
		}
	}
	// R2 delete would need a separate API route — for now, files are overwritten
}

/**
 * Acepta un file y retorna la data URL (para preview local)
 */
export function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
