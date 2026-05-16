/**
 * Utilidad base para stores que leen de Firebase Realtime Database.
 * Patrón: writable + onValue + cleanup automático.
 *
 * Incluye retry con exponential backoff para errores de conexión
 * y localStorage cache para fallback cuando Firebase está bloqueado.
 *
 * Uso:
 *   export const settings = createFirebaseStore<SettingsType>('settings');
 */

import { writable, type Writable } from 'svelte/store';
import { getDb } from '$lib/firebase';
import { browser } from '$app/environment';

export type StoreState<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
	/** True when data came from localStorage cache (Firebase blocked) */
	stale: boolean;
};

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1s, doubles each retry → max ~31s
const CACHE_PREFIX = 'oc_store_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Ad blocker detection (shared across stores) ──
let _firebaseBlocked: boolean | null = null; // null = not checked yet

/** Check if Firebase is likely blocked by an ad blocker */
export async function isFirebaseBlocked(): Promise<boolean> {
	if (_firebaseBlocked !== null) return _firebaseBlocked;
	if (!browser) { _firebaseBlocked = false; return false; }

	try {
		// Try a lightweight fetch to Firebase RTDB root — ad blockers intercept this
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 3000);
		const resp = await fetch('https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/.json?shallow=true', {
			signal: controller.signal,
			mode: 'no-cors' // We just want to check if the request is blocked
		});
		clearTimeout(timer);
		// no-cors returns opaque response — if we get here, request wasn't blocked
		_firebaseBlocked = false;
	} catch {
		// AbortError = timeout (slow network, not blocked)
		// TypeError = likely blocked by extension (network error)
		_firebaseBlocked = navigator.onLine; // If online but fetch failed → blocked
		if (_firebaseBlocked) {
			console.warn('[Firebase] Likely blocked by ad blocker');
		}
	}
	return _firebaseBlocked;
}

/** Get cached data from localStorage */
function getCached<T>(path: string): { data: T; timestamp: number } | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(CACHE_PREFIX + path);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
			localStorage.removeItem(CACHE_PREFIX + path);
			return null;
		}
		return parsed;
	} catch { return null; }
}

/** Cache data to localStorage */
function setCache<T>(path: string, data: T): void {
	if (!browser) return;
	try {
		localStorage.setItem(CACHE_PREFIX + path, JSON.stringify({ data, timestamp: Date.now() }));
	} catch { /* quota exceeded — silent */ }
}

/**
 * Crea un store reactivo conectado a un path de Firebase.
 * - Se suscribe al montar (lazy)
 * - Se desuscribe al destruir (cleanup)
 * - Expone loading/error/stale states
 * - Reintenta con exponential backoff en errores de conexión
 * - Cachea datos exitosos en localStorage para fallback offline/ad-blocker
 */
export function createFirebaseStore<T>(
	path: string,
	defaultValue: T | null = null
) {
	const store: Writable<StoreState<T>> = writable({
		data: defaultValue,
		loading: true,
		error: null,
		stale: false
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
				// Firebase not available — try cache before falling back to default
				const cached = getCached<T>(path);
				const fallbackData = cached ? cached.data : defaultValue;
				const isBlocked = await isFirebaseBlocked();
				const errorMsg = isBlocked ? 'Firebase bloqueado (ad blocker)' : 'Firebase no inicializado';
				store.set({ data: fallbackData, loading: false, error: errorMsg, stale: !!cached });
				return;
			}

			const { ref, onValue } = await import('firebase/database');
			const dbRef = ref(db, path);

			let initialCallbackFired = false; // tracks if onValue ever fired (for timeout only)

			unsub = onValue(
				dbRef,
				(snap) => {
					initialCallbackFired = true;
					retryCount = 0; // reset on success
					const val = snap.val() ?? defaultValue;
					store.set({ data: val, loading: false, error: null, stale: false });
					// Cache successful data for offline/ad-blocker fallback
					if (val !== null) setCache(path, val);
				},
				(err) => {
					initialCallbackFired = true;
					console.error(`[Store:${path}]`, err.message);
					// Try cache before falling back to null
					const cached = getCached<T>(path);
					store.set({ data: cached ? cached.data : null, loading: false, error: err.message, stale: !!cached });
					scheduleRetry();
				}
			);

			// Safety timeout: if onValue never fires (e.g. 401 from Firebase rules),
			// force loading=false after 5s so the UI doesn't hang forever
			setTimeout(() => {
				if (!initialCallbackFired && !destroyed) {
					console.warn(`[Store:${path}] onValue timeout (5s) — falling back to cache`);
					const cached = getCached<T>(path);
					store.set({ data: cached ? cached.data : defaultValue, loading: false, error: 'timeout', stale: !!cached });
				}
			}, 5000);

			// Connection established — reset retries
			retryCount = 0;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			// Try cache before falling back to defaultValue
			const cached = getCached<T>(path);
			store.set({ data: cached ? cached.data : defaultValue, loading: false, error: msg, stale: !!cached });
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
