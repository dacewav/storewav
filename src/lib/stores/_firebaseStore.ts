/**
 * Utilidad base para stores que leen de Firebase Realtime Database.
 * Patrón: writable + onValue + cleanup automático.
 *
 * Incluye retry con exponential backoff para errores de conexión.
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

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1s, doubles each retry → max ~31s

function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms));
}

/**
 * Crea un store reactivo conectado a un path de Firebase.
 * - Se suscribe al montar (lazy)
 * - Se desuscribe al destruir (cleanup)
 * - Expone loading/error states
 * - Reintenta con exponential backoff en errores de conexión
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
	let retryCount = 0;
	let retryTimer: ReturnType<typeof setTimeout> | null = null;
	let destroyed = false;

	async function attemptSubscribe() {
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
					retryCount = 0; // reset on success
					store.set({ data: snap.val() ?? defaultValue, loading: false, error: null });
				},
				(err) => {
					console.error(`[Store:${path}]`, err.message);
					// Don't set defaultValue on error — let consumers handle null data
					store.set({ data: null, loading: false, error: err.message });
					scheduleRetry();
				}
			);
			// Connection established — reset retries
			retryCount = 0;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			store.set({ data: defaultValue, loading: false, error: msg });
			scheduleRetry();
		}
	}

	function scheduleRetry() {
		if (destroyed || retryCount >= MAX_RETRIES) return;
		const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
		retryCount++;
		console.warn(`[Store:${path}] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
		retryTimer = setTimeout(() => {
			retryTimer = null;
			if (!destroyed) attemptSubscribe();
		}, delay);
	}

	async function subscribe() {
		refCount++;
		if (refCount > 1) return; // Ya suscrito
		destroyed = false;
		await attemptSubscribe();
	}

	function unsubscribe() {
		refCount = Math.max(0, refCount - 1);
		if (refCount === 0) {
			destroyed = true;
			if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
			if (unsub) {
				unsub();
				unsub = null;
			}
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
