/**
 * Gallery — Media management for beat covers and images
 *
 * Firebase path: gallery/
 * Structure: { [id]: { url, name, size, uploadedAt, usedIn } }
 */

import { writable, derived, get } from 'svelte/store';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { getDb } from '$lib/firebase';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from '$lib/toastStore';

export type GalleryImage = {
	id: string;
	url: string;
	name: string;
	size: number;
	uploadedAt: number;
	usedIn?: string; // beat id
};

function createGalleryStore() {
	const images = writable<GalleryImage[]>([]);
	const loading = writable(false);
	let _unsub: (() => void) | null = null;
	let _initialized = false;

	function init() {
		if (_initialized) return;
		_initialized = true;
		loading.set(true);
		try {
			const db = getDb();
			const r = ref(db, 'gallery');
			_unsub = onValue(r, (snap) => {
				const val = snap.val();
				if (!val || typeof val !== 'object') {
					images.set([]);
					loading.set(false);
					return;
				}
				const list: GalleryImage[] = Object.entries(val)
					.map(([id, data]: [string, any]) => ({
						id,
						url: data.url ?? '',
						name: data.name ?? 'Unnamed',
						size: data.size ?? 0,
						uploadedAt: data.uploadedAt ?? 0,
						usedIn: data.usedIn
					}))
					.sort((a, b) => b.uploadedAt - a.uploadedAt);
				images.set(list);
				loading.set(false);
			});
		} catch (e) {
			console.warn('[Gallery] Firebase not available:', e);
			loading.set(false);
		}
	}

	async function uploadImage(file: File, onProgress?: (pct: number) => void): Promise<GalleryImage | null> {
		try {
			const storage = getStorage();
			const ext = file.name.split('.').pop() ?? 'jpg';
			const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
			const sRef = storageRef(storage, filename);

			return new Promise((resolve, reject) => {
				const task = uploadBytesResumable(sRef, file, { contentType: file.type });
				task.on(
					'state_changed',
					(snap) => {
						const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
						onProgress?.(pct);
					},
					(err) => {
						console.error('[Gallery] Upload error:', err);
						toast.error('Error al subir imagen');
						reject(err);
					},
					async () => {
						const url = await getDownloadURL(task.snapshot.ref);
						const db = getDb();
						const newRef = push(ref(db, 'gallery'));
						const image: Omit<GalleryImage, 'id'> = {
							url,
							name: file.name,
							size: file.size,
							uploadedAt: Date.now()
						};
						await set(newRef, image);
						toast.success(`"${file.name}" subido`);
						resolve({ id: newRef.key!, ...image });
					}
				);
			});
		} catch (e) {
			console.error('[Gallery] Upload failed:', e);
			toast.error('Error al subir imagen');
			return null;
		}
	}

	async function deleteImage(id: string): Promise<boolean> {
		try {
			const current = get(images);
			const img = current.find((i) => i.id === id);
			if (!img) return false;

			// Delete from Storage if it's a Firebase URL
			if (img.url.includes('firebasestorage.googleapis.com')) {
				try {
					const storage = getStorage();
					const sRef = storageRef(storage, img.url);
					await deleteObject(sRef);
				} catch {
					// Storage delete may fail if already gone — non-fatal
				}
			}

			// Delete from RTDB
			const db = getDb();
			await remove(ref(db, `gallery/${id}`));
			toast.success('Imagen eliminada');
			return true;
		} catch (e) {
			console.error('[Gallery] Delete error:', e);
			toast.error('Error al eliminar imagen');
			return false;
		}
	}

	function destroy() {
		_unsub?.();
		_unsub = null;
		_initialized = false;
	}

	return {
		subscribe: images.subscribe,
		loading: { subscribe: loading.subscribe },
		init,
		uploadImage,
		deleteImage,
		destroy
	};
}

export const gallery = createGalleryStore();
export const galleryLoading = gallery.loading;
export const initGallery = () => gallery.init();
export const destroyGallery = () => gallery.destroy();
