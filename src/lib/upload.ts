/**
 * Upload utility — Firebase Storage
 */

import { getStorageInstance } from '$lib/firebase';

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
 * Sube un archivo a Firebase Storage
 * @param path - Path en Storage (ej: 'beats/covers/abc123.jpg')
 * @param file - File object
 * @param onProgress - Callback de progreso
 */
export async function uploadFile(
	path: string,
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	const storage = await getStorageInstance();
	if (!storage) throw new Error('Firebase Storage no configurado. Habilita Storage en la consola Firebase.');

	const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
	const storageRef = ref(storage, path);

	return new Promise((resolve, reject) => {
		const task = uploadBytesResumable(storageRef, file);

		task.on(
			'state_changed',
			(snapshot) => {
				onProgress?.({
					bytesTransferred: snapshot.bytesTransferred,
					totalBytes: snapshot.totalBytes,
					percent: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
				});
			},
			(error) => reject(error),
			async () => {
				const url = await getDownloadURL(task.snapshot.ref);
				resolve({ url, path });
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
 * Borra un archivo de Firebase Storage por URL
 */
export async function deleteFile(url: string): Promise<void> {
	const storage = await getStorageInstance();
	if (!storage) return;

	try {
		const { ref, deleteObject } = await import('firebase/storage');
		const storageRef = ref(storage, url);
		await deleteObject(storageRef);
	} catch {
		// Silently fail — file might not exist
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
