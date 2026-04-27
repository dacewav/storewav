/**
 * Likes store — Firebase-backed likes/favorites system.
 * Syncs in real-time. Falls back gracefully if not authenticated.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

/** Current user's liked beat IDs */
const userLikesStore = writable<Set<string>>(new Set());

/** Like counts per beat */
const likeCountsStore = writable<Record<string, number>>({});

/** Current UID (set by init) */
let currentUid: string | null = null;

/** Auth token for REST calls */
let _authToken: string | null = null;

/** Get current user's Firebase ID token */
async function getAuthToken(): Promise<string | null> {
	if (_authToken) return _authToken;
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		const user = auth?.currentUser;
		if (!user) return null;
		_authToken = await user.getIdToken();
		return _authToken;
	} catch {
		return null;
	}
}

/** Build URL with auth token */
async function authUrl(path: string): Promise<string> {
	const token = await getAuthToken();
	return token ? `${FIREBASE_DB}${path}?auth=${token}` : `${FIREBASE_DB}${path}`;
}

/** Active listeners for cleanup */
const activeListeners: Array<() => void> = [];

/**
 * Initialize likes for authenticated user.
 * Call after auth state changes.
 */
export async function initLikes(uid: string | null) {
	// Cleanup previous listeners
	destroyLikes();

	if (!browser) return;

	currentUid = uid;
	_authToken = null; // Reset token for new user

	if (!uid) {
		userLikesStore.set(new Set());
		return;
	}

	try {
		const { getDatabase, ref, onValue, query, orderByChild, equalTo } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const app = getApp();
		const db = getDatabase(app);

		// Listen to user's likes
		const userLikesRef = ref(db, `userLikes/${uid}`);
		const unsubUser = onValue(userLikesRef, (snap) => {
			const val = snap.val();
			if (val) {
				userLikesStore.set(new Set(Object.keys(val)));
			} else {
				userLikesStore.set(new Set());
			}
		});
		activeListeners.push(unsubUser);
	} catch (err) {
		console.error('[Likes] Init failed:', err);
	}
}

/**
 * Subscribe to like count for a specific beat.
 * Returns unsubscribe function.
 */
export function subscribeToLikeCount(beatId: string, callback: (count: number) => void): () => void {
	let unsub: (() => void) | null = null;

	(async () => {
		try {
			const { getDatabase, ref, onValue } = await import('firebase/database');
			const { getApp } = await import('firebase/app');

			const app = getApp();
			const db = getDatabase(app);

			const countRef = ref(db, `beats/${beatId}/likeCount`);
			unsub = onValue(countRef, (snap) => {
				const count = snap.val() || 0;
				callback(count);
				likeCountsStore.update(m => ({ ...m, [beatId]: count }));
			});
		} catch {
			callback(0);
		}
	})();

	return () => {
		if (unsub) unsub();
	};
}

/**
 * Toggle like on a beat. Requires auth.
 */
export async function toggleLike(beatId: string, uid: string): Promise<boolean> {
	try {
		const checkUrl = await authUrl(`/userLikes/${uid}/${beatId}`);
		const resp = await fetch(checkUrl);
		const exists = await resp.json();

		if (exists) {
			// Unlike
			await fetch(await authUrl(`/userLikes/${uid}/${beatId}`), { method: 'DELETE' });
			await fetch(await authUrl(`/beatLikes/${beatId}/${uid}`), { method: 'DELETE' });
			// Decrement count
			const countResp = await fetch(await authUrl(`/beats/${beatId}/likeCount`));
			const count = (await countResp.json() as number) || 0;
			await fetch(await authUrl(`/beats/${beatId}/likeCount`), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(Math.max(0, count - 1)),
			});
			return false;
		} else {
			// Like
			await fetch(await authUrl(`/userLikes/${uid}/${beatId}`), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(true),
			});
			await fetch(await authUrl(`/beatLikes/${beatId}/${uid}`), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(true),
			});
			// Increment count
			const countResp = await fetch(await authUrl(`/beats/${beatId}/likeCount`));
			const count = (await countResp.json() as number) || 0;
			await fetch(await authUrl(`/beats/${beatId}/likeCount`), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(count + 1),
			});
			return true;
		}
	} catch (err) {
		console.error('[Likes] Toggle failed:', err);
		return get(userLikesStore).has(beatId);
	}
}

/** Check if a beat is liked by current user */
export function isLiked(beatId: string) {
	return {
		subscribe: (fn: (v: boolean) => void) =>
			userLikesStore.subscribe((likes) => fn(likes.has(beatId)))
	};
}

/** Cleanup all listeners */
export function destroyLikes() {
	for (const unsub of activeListeners) {
		try { unsub(); } catch { /* ignore */ }
	}
	activeListeners.length = 0;
}

export const userLikes = { subscribe: userLikesStore.subscribe };
export const likeCounts = { subscribe: likeCountsStore.subscribe };
