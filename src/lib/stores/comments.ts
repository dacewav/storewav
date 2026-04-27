/**
 * Comments store — Firebase-backed beat comments.
 * Flat comments (no threads), basic moderation.
 *
 * Uses Firebase SDK for all operations (reliable auth, real-time sync).
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Comment = {
	id: string;
	uid: string;
	displayName: string;
	photoURL: string | null;
	text: string;
	createdAt: number;
	editedAt: number | null;
	likes: number;
};

/** Comments for the currently viewed beat */
const commentsStore = writable<Comment[]>([]);
const loadingStore = writable(false);

/** Active listeners */
const activeListeners: Array<() => void> = [];

/** Rate limit: last comment timestamp */
let lastCommentAt = 0;

/**
 * Subscribe to comments for a beat.
 */
export function initComments(beatId: string) {
	destroyComments();
	if (!browser) return;

	loadingStore.set(true);

	(async () => {
		try {
			const { getDatabase, ref, onValue } = await import('firebase/database');
			const { getApp } = await import('firebase/app');

			const app = getApp();
			const db = getDatabase(app);

			const commentsRef = ref(db, `beatComments/${beatId}`);
			const unsub = onValue(commentsRef, (snap) => {
				const val = snap.val();
				if (val) {
					const comments = Object.entries(val)
						.map(([id, data]: [string, any]) => ({
							id,
							uid: data.uid || '',
							displayName: data.displayName || 'Anónimo',
							photoURL: data.photoURL || null,
							text: data.text || '',
							createdAt: data.createdAt || 0,
							editedAt: data.editedAt || null,
							likes: data.likes || 0,
						}))
						.sort((a, b) => b.createdAt - a.createdAt);
					commentsStore.set(comments);
				} else {
					commentsStore.set([]);
				}
				loadingStore.set(false);
			});

			activeListeners.push(unsub);
		} catch (err) {
			console.error('[Comments] Init failed:', err);
			loadingStore.set(false);
		}
	})();
}

/**
 * Post a comment. Rate limited to 1 per 30 seconds.
 * Uses Firebase SDK for reliable auth.
 */
export async function postComment(
	beatId: string,
	uid: string,
	displayName: string,
	photoURL: string | null,
	text: string
): Promise<{ ok: boolean; error?: string }> {
	// Validate
	const trimmed = text.trim();
	if (!trimmed) return { ok: false, error: 'El comentario no puede estar vacío' };
	if (trimmed.length > 500) return { ok: false, error: 'Máximo 500 caracteres' };

	// Rate limit
	const now = Date.now();
	if (now - lastCommentAt < 30_000) {
		const remaining = Math.ceil((30_000 - (now - lastCommentAt)) / 1000);
		return { ok: false, error: `Esperá ${remaining} segundos antes de comentar de nuevo` };
	}

	try {
		const { getDatabase, ref, push, set } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const newRef = push(ref(db, `beatComments/${beatId}`));
		await set(newRef, {
			uid,
			displayName,
			photoURL,
			text: trimmed,
			createdAt: now,
			editedAt: null,
			likes: 0,
		});

		lastCommentAt = now;
		return { ok: true };
	} catch (err) {
		console.error('[Comments] Post failed:', err);
		return { ok: false, error: 'Error de conexión' };
	}
}

/**
 * Delete a comment. Only the author or admin can delete.
 * Uses Firebase SDK.
 */
export async function deleteComment(beatId: string, commentId: string): Promise<boolean> {
	try {
		const { getDatabase, ref, remove } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		await remove(ref(db, `beatComments/${beatId}/${commentId}`));
		return true;
	} catch {
		return false;
	}
}

/** Cleanup all listeners */
export function destroyComments() {
	for (const unsub of activeListeners) {
		try { unsub(); } catch { /* ignore */ }
	}
	activeListeners.length = 0;
	commentsStore.set([]);
}

export const comments = { subscribe: commentsStore.subscribe };
export const commentsLoading = { subscribe: loadingStore.subscribe };
