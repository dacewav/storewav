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
 * Upload via /api/upload → R2 (with real progress via XHR)
 */
async function uploadToR2(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	return new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('path', path);

		const xhr = new XMLHttpRequest();

		// Real upload progress
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				onProgress?.({
					bytesTransferred: e.loaded,
					totalBytes: e.total,
					percent: Math.round((e.loaded / e.total) * 100)
				});
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const data = JSON.parse(xhr.responseText);
					if (!data.ok) {
						reject(new Error(data.error || 'Upload falló'));
						return;
					}
					onProgress?.({ bytesTransferred: file.size, totalBytes: file.size, percent: 100 });
					resolve({ url: data.url, path: data.path });
				} catch {
					reject(new Error('Respuesta inválida del servidor'));
				}
			} else {
				try {
					const body = JSON.parse(xhr.responseText);
					reject(new Error(body.error || `Upload falló (${xhr.status})`));
				} catch {
					reject(new Error(`Upload falló (HTTP ${xhr.status})`));
				}
			}
		};

		xhr.onerror = () => {
			reject(new Error('Error de red — no se pudo conectar al servidor'));
		};

		xhr.ontimeout = () => {
			reject(new Error('Upload timeout: el servidor no respondió'));
		};

		xhr.open('POST', '/api/upload');
		xhr.timeout = 120_000; // 2 min
		xhr.send(formData);
	});
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
 * Check if R2 upload endpoint is available (binding configured)
 */
async function isR2Available(): Promise<boolean> {
	if (!browser) return false;
	try {
		// Just check if the /api/upload route exists (any response = route exists)
		const res = await fetch('/api/upload', { method: 'HEAD' });
		// Any response means the route exists → R2 is available (prod)
		// Network error or no response → fallback to Firebase (dev)
		return true;
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
