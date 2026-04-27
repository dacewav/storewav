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
		const resp = await fetch(`${FIREBASE_DB}/userLikes/${uid}/${beatId}.json`);
		const exists = await resp.json();

		if (exists) {
			// Unlike
			await fetch(`${FIREBASE_DB}/userLikes/${uid}/${beatId}.json`, { method: 'DELETE' });
			await fetch(`${FIREBASE_DB}/beatLikes/${beatId}/${uid}.json`, { method: 'DELETE' });
			// Decrement count
			const countResp = await fetch(`${FIREBASE_DB}/beats/${beatId}/likeCount.json`);
			const count = (await countResp.json() as number) || 0;
			await fetch(`${FIREBASE_DB}/beats/${beatId}/likeCount.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(Math.max(0, count - 1)),
			});
			return false;
		} else {
			// Like
			await fetch(`${FIREBASE_DB}/userLikes/${uid}/${beatId}.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(true),
			});
			await fetch(`${FIREBASE_DB}/beatLikes/${beatId}/${uid}.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(true),
			});
			// Increment count
			const countResp = await fetch(`${FIREBASE_DB}/beats/${beatId}/likeCount.json`);
			const count = (await countResp.json() as number) || 0;
			await fetch(`${FIREBASE_DB}/beats/${beatId}/likeCount.json`, {
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
