/**
 * Comments store — Firebase-backed beat comments.
 * Flat comments (no threads), basic moderation.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

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

/**
 * Subscribe to comments for a beat.
 */
export function initComments(beatId: string) {
	destroyComments();
	if (!browser) return;

	loadingStore.set(true);

	(async () => {
		try {
			const { getDatabase, ref, onValue, query, orderByChild, limitToLast } = await import('firebase/database');
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
		const url = await authUrl(`/beatComments/${beatId}`);
		const resp = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				uid,
				displayName,
				photoURL,
				text: trimmed,
				createdAt: now,
				editedAt: null,
				likes: 0,
			}),
		});

		if (resp.ok) {
			lastCommentAt = now;
			return { ok: true };
		}
		return { ok: false, error: 'Error al publicar' };
	} catch (err) {
		console.error('[Comments] Post failed:', err);
		return { ok: false, error: 'Error de conexión' };
	}
}

/**
 * Delete a comment. Only the author or admin can delete.
 */
export async function deleteComment(beatId: string, commentId: string): Promise<boolean> {
	try {
		const url = await authUrl(`/beatComments/${beatId}/${commentId}`);
		const resp = await fetch(url, { method: 'DELETE' });
		return resp.ok;
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
