/**
 * Wishlist store — localStorage + Firebase sync when authenticated.
 *
 * - Without login: localStorage only (fast, offline-friendly)
 * - With login: syncs to Firebase, merges on first login
 * - Cross-device: available on any device when logged in
 */

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'dacewav_wishlist';
const STORAGE_UID_KEY = 'dacewav_wishlist_uid'; // Track whose wishlist is in localStorage
const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

let currentUid: string | null = null;
let syncingToFirebase = false;

/** Get current user's Firebase ID token for authenticated REST calls */
async function getAuthToken(): Promise<string | null> {
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		const user = auth?.currentUser;
		if (!user) return null;
		return await user.getIdToken();
	} catch {
		return null;
	}
}

/** Build URL with auth token */
async function authUrl(path: string): Promise<string> {
	const token = await getAuthToken();
	return token ? `${FIREBASE_DB}${path}?auth=${token}` : `${FIREBASE_DB}${path}`;
}

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
 * localStorage is only used for anonymous users.
 */
export async function initWishlistSync(uid: string | null) {
	currentUid = uid;

	if (!uid || !browser) {
		// Not logged in — load from localStorage
		store.set(loadLocal());
		return;
	}

	try {
		// Load Firebase wishlist (source of truth)
		const url = await authUrl(`/userWishlist/${uid}`);
		const resp = await fetch(url);
		const firebaseData = await resp.json() as Record<string, { addedAt?: number }> | null;
		const firebaseIds = firebaseData ? Object.keys(firebaseData) : [];

		// Replace localStorage with Firebase data (no merge — per-account isolation)
		store.set(firebaseIds);
		saveLocal(firebaseIds);

		// If there were local items not in Firebase, sync them up
		// (first time migration: user had wishlist before creating account)
		const storedUid = localStorage.getItem(STORAGE_UID_KEY);
		if (!storedUid || storedUid !== uid) {
			// First time logging in with this account — check for anonymous local items
			// loadLocal() returns [] because of UID mismatch, so we need raw localStorage
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					const localIds: string[] = JSON.parse(raw);
					const newIds = localIds.filter(id => !firebaseIds.includes(id));
					if (newIds.length > 0) {
						// Merge anonymous items into Firebase
						const merged = [...firebaseIds, ...newIds];
						await syncToFirebase(merged);
						store.set(merged);
						saveLocal(merged);
					}
				}
			} catch { /* ignore parse errors */ }
		}

		// Mark localStorage as belonging to this user
		localStorage.setItem(STORAGE_UID_KEY, uid);
	} catch (err) {
		console.error('[Wishlist] Firebase sync failed:', err);
		// Fallback to localStorage
		store.set(loadLocal());
	}
}

/**
 * Sync wishlist to Firebase (full replace).
 */
async function syncToFirebase(ids: string[]) {
	if (!currentUid || syncingToFirebase) return;
	syncingToFirebase = true;

	try {
		const data: Record<string, { addedAt: number }> = {};
		for (const id of ids) {
			data[id] = { addedAt: Date.now() };
		}
		const url = await authUrl(`/userWishlist/${currentUid}`);
		await fetch(url, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
	} catch (err) {
		console.error('[Wishlist] Sync to Firebase failed:', err);
	} finally {
		syncingToFirebase = false;
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
	if (currentUid) {
		authUrl(`/userWishlist/${currentUid}`).then(url => fetch(url, { method: 'DELETE' })).catch(() => {});
	}
}

/** Cleanup on logout */
export function destroyWishlistSync() {
	currentUid = null;
	// Clear UID tracking so next login starts fresh
	if (browser) localStorage.removeItem(STORAGE_UID_KEY);
	// Keep localStorage wishlist for anonymous browsing
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
