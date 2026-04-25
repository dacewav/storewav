/**
 * Custom Emojis — user-defined emojis for content
 *
 * Firebase path: customEmojis/
 * Structure: { [id]: { name, url, createdAt } }
 */

import { writable, get } from 'svelte/store';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { getDb } from '$lib/firebase';
import { toast } from '$lib/toastStore';

export type CustomEmoji = {
	id: string;
	name: string;
	url: string;
	createdAt: number;
};

function createCustomEmojisStore() {
	const emojis = writable<CustomEmoji[]>([]);
	let _unsub: (() => void) | null = null;
	let _initialized = false;

	async function init() {
		if (_initialized) return;
		_initialized = true;
		try {
			const db = await getDb();
			if (!db) return;
			const r = ref(db, 'customEmojis');
			_unsub = onValue(r, (snap) => {
				const val = snap.val();
				if (!val || typeof val !== 'object') {
					emojis.set([]);
					return;
				}
				const list: CustomEmoji[] = Object.entries(val)
					.map(([id, data]: [string, any]) => ({
						id,
						name: data.name ?? '',
						url: data.url ?? '',
						createdAt: data.createdAt ?? 0
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
				emojis.set(list);
			});
		} catch (e) {
			console.warn('[CustomEmojis] Firebase not available:', e);
		}
	}

	async function addEmoji(name: string, url: string): Promise<boolean> {
		try {
			const db = await getDb();
			if (!db) return false;
			const newRef = push(ref(db, 'customEmojis'));
			await set(newRef, { name: name.trim(), url: url.trim(), createdAt: Date.now() });
			toast.success(`Emoji :${name}: agregado`);
			return true;
		} catch (e) {
			console.error('[CustomEmojis] Add error:', e);
			toast.error('Error al agregar emoji');
			return false;
		}
	}

	async function deleteEmoji(id: string): Promise<boolean> {
		try {
			const db = await getDb();
			if (!db) return false;
			await remove(ref(db, `customEmojis/${id}`));
			toast.success('Emoji eliminado');
			return true;
		} catch (e) {
			console.error('[CustomEmojis] Delete error:', e);
			return false;
		}
	}

	function destroy() {
		_unsub?.();
		_unsub = null;
		_initialized = false;
	}

	return {
		subscribe: emojis.subscribe,
		init,
		addEmoji,
		deleteEmoji,
		destroy
	};
}

export const customEmojis = createCustomEmojisStore();
export const initCustomEmojis = () => customEmojis.init();
export const destroyCustomEmojis = () => customEmojis.destroy();
