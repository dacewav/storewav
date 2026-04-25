/**
 * Utilidad base para stores que leen de Firebase Realtime Database.
 * Patrón: writable + onValue + cleanup automático.
 *
 * Uso:
 *   export const settings = createFirebaseStore<SettingsType>('settings');
 */

import { writable, type Writable } from 'svelte/store';
import { getDb } from '$lib/firebase';

export type StoreState<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
};

/**
 * Crea un store reactivo conectado a un path de Firebase.
 * - Se suscribe al montar (lazy)
 * - Se desuscribe al destruir (cleanup)
 * - Expone loading/error states
 */
export function createFirebaseStore<T>(
	path: string,
	defaultValue: T | null = null
) {
	const store: Writable<StoreState<T>> = writable({
		data: defaultValue,
		loading: true,
		error: null
	});

	let unsub: (() => void) | null = null;
	let refCount = 0;

	async function subscribe() {
		refCount++;
		if (refCount > 1) return; // Ya suscrito

		try {
			const db = await getDb();
			if (!db) {
				store.set({ data: defaultValue, loading: false, error: 'Firebase no inicializado' });
				return;
			}

			const { ref, onValue } = await import('firebase/database');
			const dbRef = ref(db, path);

			unsub = onValue(
				dbRef,
				(snap) => {
					store.set({ data: snap.val() ?? defaultValue, loading: false, error: null });
				},
				(err) => {
					console.error(`[Store:${path}]`, err.message);
					store.set({ data: defaultValue, loading: false, error: err.message });
				}
			);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			store.set({ data: defaultValue, loading: false, error: msg });
		}
	}

	function unsubscribe() {
		refCount = Math.max(0, refCount - 1);
		if (refCount === 0 && unsub) {
			unsub();
			unsub = null;
		}
	}

	/** Escritura a Firebase */
	/** Escritura completa — re-lanza errores */
	async function set(value: T) {
		const db = await getDb();
		if (!db) throw new Error('Firebase no inicializado');

		const { ref, set: fbSet } = await import('firebase/database');
		await fbSet(ref(db, path), value);
	}

	/** Update parcial en Firebase — re-lanza errores para que el caller los maneje */
	async function update(value: Partial<T>) {
		const db = await getDb();
		if (!db) throw new Error('Firebase no inicializado');

		const { ref, update: fbUpdate } = await import('firebase/database');
		await fbUpdate(ref(db, path), value);
	}

	return {
		subscribe: store.subscribe,
		subscribeFirebase: subscribe,
		unsubscribe,
		set,
		update
	};
}
