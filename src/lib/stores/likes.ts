/**
 * Likes store — Firebase-backed likes/favorites system.
 * Syncs in real-time. Falls back gracefully if not authenticated.
 *
 * Uses Firebase SDK for all operations (no REST calls = no stale token issues).
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

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
		const { getDatabase, ref, onValue } = await import('firebase/database');
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
 * Uses Firebase SDK for reliable auth + atomic writes.
 */
export async function toggleLike(beatId: string, uid: string): Promise<boolean> {
	try {
		const { getDatabase, ref, get, set, remove, runTransaction } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());

		// Check if already liked
		const userLikeRef = ref(db, `userLikes/${uid}/${beatId}`);
		const snap = await get(userLikeRef);

		if (snap.exists()) {
			// Unlike — remove from both paths
			await remove(userLikeRef);
			await remove(ref(db, `beatLikes/${beatId}/${uid}`));
			// Decrement count atomically
			const countRef = ref(db, `beats/${beatId}/likeCount`);
			await runTransaction(countRef, (current) => Math.max(0, (current || 0) - 1));
			return false;
		} else {
			// Like — write to both paths
			await set(userLikeRef, true);
			await set(ref(db, `beatLikes/${beatId}/${uid}`), true);
			// Increment count atomically
			const countRef = ref(db, `beats/${beatId}/likeCount`);
			await runTransaction(countRef, (current) => (current || 0) + 1);
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
