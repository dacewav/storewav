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
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveLocal(ids: string[]) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
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
 * Merges localStorage wishlist with Firebase on first login.
 */
export async function initWishlistSync(uid: string | null) {
	currentUid = uid;

	if (!uid || !browser) return;

	try {
		// Load Firebase wishlist
		const url = await authUrl(`/userWishlist/${uid}`);
		const resp = await fetch(url);
		const firebaseData = await resp.json() as Record<string, { addedAt?: number }> | null;
		const firebaseIds = firebaseData ? Object.keys(firebaseData) : [];

		// Merge: union of local + Firebase
		const localIds = loadLocal();
		const merged = [...new Set([...localIds, ...firebaseIds])];

		// Update store and both storages
		store.set(merged);
		saveLocal(merged);

		// Sync merged list to Firebase
		await syncToFirebase(merged);
	} catch (err) {
		console.error('[Wishlist] Firebase sync failed:', err);
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
	// Keep localStorage — don't clear the store
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
