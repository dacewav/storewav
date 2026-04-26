/**
 * Upload utility — R2 (prod/ dev) / Firebase Storage (fallback)
 *
 * Production: POST /api/upload → Cloudflare R2 (with auth)
 * Dev: POST /api/upload → R2 via wrangler dev, or local filesystem fallback
 */

import { dev } from '$app/environment';

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
 * Get current Firebase ID token for authenticated uploads
 */
async function getAuthToken(): Promise<string | null> {
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		if (!auth?.currentUser) return null;
		return await auth.currentUser.getIdToken();
	} catch {
		return null;
	}
}

/**
 * Upload: POST /api/upload → R2 (with auth + real progress via XHR)
 * Siempre intenta R2 primero. Fallback a Firebase solo si falla por errores NO-auth.
 */
export async function uploadFile(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	try {
		return await uploadToR2(path, file, onProgress);
	} catch (r2Err) {
		const msg = r2Err instanceof Error ? r2Err.message : String(r2Err);
		// Auth errors → no fallback (Firebase Storage también fallará). Propagar inmediatamente.
		if (msg.includes('autenticado') || msg.includes('autorizado') || msg.includes('permiso')) {
			throw r2Err;
		}
		console.warn('[Upload] R2 falló, intentando Firebase Storage:', r2Err);
	}

	// Fallback: Firebase Storage (solo para errores de red/R2, NO auth)
	return uploadToFirebase(path, file, onProgress);
}

/**
 * Upload via /api/upload → R2 (with auth + real progress via XHR)
 */
async function uploadToR2(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	const token = await getAuthToken();
	if (!token) {
		throw new Error('No autenticado — inicia sesión para subir archivos');
	}

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
			} else if (xhr.status === 401 || xhr.status === 403) {
				reject(new Error('No autorizado — verifica tu sesión'));
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
		xhr.setRequestHeader('Authorization', `Bearer ${token}`);
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
		let settled = false;
		const timeout = setTimeout(() => {
			if (!settled && lastProgress === 0) {
				settled = true;
				reject(new Error('Upload timeout: sin progreso en 30s. Verifica las reglas de Firebase Storage.'));
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
				if (settled) return;
				settled = true;
				clearTimeout(timeout);
				// Provide clear error for permission issues
				if (error.code === 'storage/unauthorized') {
					reject(new Error('Sin permiso para subir. Verifica las reglas de Firebase Storage o inicia sesión como admin.'));
				} else {
					reject(new Error(`Firebase Storage: ${error.message}`));
				}
			},
			async () => {
				if (settled) return;
				settled = true;
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
export async function deleteFile(pathOrUrl: string): Promise<void> {
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
