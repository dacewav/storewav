/**
 * Gallery — Media management for beat covers and images
 *
 * Firebase path: gallery/
 * Structure: { [id]: { url, name, size, uploadedAt, usedIn } }
 */

import { writable, derived, get } from 'svelte/store';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { getDb } from '$lib/firebase';
import { uploadFile, deleteFile } from '$lib/upload';
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

	async function init() {
		if (_initialized) return;
		_initialized = true;
		loading.set(true);
		try {
			const db = await getDb();
			if (!db) return;
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
			const ext = file.name.split('.').pop() ?? 'jpg';
			const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

			const result = await uploadFile(filename, file, (p) => onProgress?.(p.percent));

			const db = await getDb();
			if (!db) return null;
			const newRef = push(ref(db, 'gallery'));
			const image: Omit<GalleryImage, 'id'> = {
				url: result.url,
				name: file.name,
				size: file.size,
				uploadedAt: Date.now()
			};
			await set(newRef, image);
			toast.success(`"${file.name}" subido`);
			return { id: newRef.key!, ...image };
		} catch (e) {
			console.error('[Gallery] Upload failed:', e);
			toast.error(e instanceof Error ? e.message : 'Error al subir imagen');
			return null;
		}
	}

	async function deleteImage(id: string): Promise<boolean> {
		try {
			const current = get(images);
			const img = current.find((i) => i.id === id);
			if (!img) return false;

			// Delete from storage (R2 or Firebase)
			if (img.url) {
				await deleteFile(img.url);
			}

			// Delete from RTDB
			const db = await getDb();
			if (!db) return false;
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
