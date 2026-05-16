/**
 * Wishlist store — localStorage + Firebase sync when authenticated.
 *
 * - Without login: localStorage only (fast, offline-friendly)
 * - With login: syncs to Firebase via SDK (reliable auth, real-time)
 * - Cross-device: available on any device when logged in
 * - Per-account isolation: localStorage cleared on user switch
 *
 * Uses Firebase SDK (not REST) for all Firebase operations.
 */

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'dacewav_wishlist';
const STORAGE_UID_KEY = 'dacewav_wishlist_uid'; // Track whose wishlist is in localStorage

let currentUid: string | null = null;
let _unsub: (() => void) | null = null;

function loadLocal(): string[] {
	if (!browser) return [];
	try {
		// If localStorage belongs to a different user, ignore it
		const storedUid = localStorage.getItem(STORAGE_UID_KEY);
		if (currentUid && storedUid && storedUid !== currentUid) {
			return []; // Different user — don't load stale data
		}
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveLocal(ids: string[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
		if (currentUid) localStorage.setItem(STORAGE_UID_KEY, currentUid);
	} catch {
		// Storage full or unavailable
	}
}

function clearLocal() {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
	localStorage.removeItem(STORAGE_UID_KEY);
}

const store = writable<string[]>(loadLocal());

/** Sincronizar entre tabs */
if (browser) {
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY) {
			store.set(loadLocal());
		}
	});
}

/**
 * Initialize Firebase sync for authenticated user.
 * Firebase is the source of truth when logged in.
 * Uses Firebase SDK onValue for real-time sync.
 */
export async function initWishlistSync(uid: string | null) {
	// Cleanup previous listener
	if (_unsub) { _unsub(); _unsub = null; }

	currentUid = uid;

	if (!uid || !browser) {
		// Not logged in — load from localStorage
		store.set(loadLocal());
		return;
	}

	try {
		const { getDatabase, ref, onValue, get, set, update } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const wishlistRef = ref(db, `userWishlist/${uid}`);

		// First, check if Firebase has data
		const snap = await get(wishlistRef);
		const firebaseData = snap.val() as Record<string, { addedAt?: number }> | null;
		const firebaseIds = firebaseData ? Object.keys(firebaseData) : [];

		// Check for anonymous local items to migrate
		const storedUid = localStorage.getItem(STORAGE_UID_KEY);
		if (!storedUid || storedUid !== uid) {
			// First time with this account — check for anonymous items
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					const localIds: string[] = JSON.parse(raw);
					const newIds = localIds.filter(id => !firebaseIds.includes(id));
					if (newIds.length > 0) {
						// Merge anonymous items into Firebase
						const mergedData: Record<string, { addedAt: number }> = {};
						if (firebaseData) {
							for (const [k, v] of Object.entries(firebaseData)) {
								mergedData[k] = { addedAt: v.addedAt ?? Date.now() };
							}
						}
						for (const id of newIds) {
							mergedData[id] = { addedAt: Date.now() };
						}
						await set(wishlistRef, mergedData);
						// The onValue listener will pick up the change
					}
				}
			} catch { /* ignore parse errors */ }
		}

		// Set localStorage to belong to this user
		localStorage.setItem(STORAGE_UID_KEY, uid);

		// Replace local store with Firebase data
		store.set(firebaseIds);
		saveLocal(firebaseIds);

		// Subscribe to real-time changes
		_unsub = onValue(wishlistRef, (snap) => {
			const val = snap.val();
			const ids = val ? Object.keys(val) : [];
			store.set(ids);
			saveLocal(ids);
		}, (err) => {
			console.error('[Wishlist] Realtime sync error:', err);
		});
	} catch (err) {
		console.error('[Wishlist] Firebase sync failed:', err);
		// Fallback to localStorage
		store.set(loadLocal());
	}
}

/**
 * Sync wishlist to Firebase (full replace).
 * Uses Firebase SDK.
 */
async function syncToFirebase(ids: string[]) {
	if (!currentUid || !browser) return;

	try {
		const { getDatabase, ref, set } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const data: Record<string, { addedAt: number }> = {};
		for (const id of ids) {
			data[id] = { addedAt: Date.now() };
		}
		await set(ref(db, `userWishlist/${currentUid}`), data);
	} catch (err) {
		console.error('[Wishlist] Sync to Firebase failed:', err);
	}
}

function toggle(beatId: string) {
	store.update((ids) => {
		const next = ids.includes(beatId) ? ids.filter((id) => id !== beatId) : [...ids, beatId];
		saveLocal(next);
		// Sync to Firebase in background if logged in
		if (currentUid) syncToFirebase(next);
		return next;
	});
}

function has(beatId: string): boolean {
	let result = false;
	store.subscribe((ids) => { result = ids.includes(beatId); })();
	return result;
}

function clear() {
	store.set([]);
	saveLocal([]);
	if (currentUid && browser) {
		(async () => {
			try {
				const { getDatabase, ref, set } = await import('firebase/database');
				const { getApp } = await import('firebase/app');
				const db = getDatabase(getApp());
				await set(ref(db, `userWishlist/${currentUid}`), null);
			} catch { /* silent */ }
		})();
	}
}

/** Cleanup on logout / account switch */
export function destroyWishlistSync() {
	if (_unsub) { _unsub(); _unsub = null; }
	currentUid = null;
	// Clear all wishlist localStorage so next account starts clean
	if (browser) {
		localStorage.removeItem(STORAGE_UID_KEY);
		localStorage.removeItem(STORAGE_KEY);
	}
	store.set([]);
}

export const wishlist = {
	subscribe: store.subscribe,
	toggle,
	has,
	clear,
	/** ¿Un beat está en la wishlist? (reactivo) */
	isIn: (beatId: string) => {
		return { subscribe: (fn: (v: boolean) => void) => store.subscribe((ids) => fn(ids.includes(beatId))) };
	}
};
