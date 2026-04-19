/**
 * Auth store — Google Auth via Firebase
 *
 * Expone:
 *   - user: Firebase User | null
 *   - isAdmin: boolean (UID hardcodeado o custom claim)
 *   - loading: boolean
 */

import { writable } from 'svelte/store';
import { getAuthInstance } from '$lib/firebase';
import { PUBLIC_ADMIN_UIDS } from '$env/static/public';

export type AuthUser = {
	uid: string;
	displayName: string | null;
	email: string | null;
	photoURL: string | null;
} | null;

export type AuthState = {
	user: AuthUser;
	isAdmin: boolean;
	loading: boolean;
	error: string | null;
};

const ADMIN_UIDS: string[] = PUBLIC_ADMIN_UIDS
	.split(',')
	.map(s => s.trim())
	.filter(Boolean);

const store = writable<AuthState>({ user: null, isAdmin: false, loading: true, error: null });
let unsub: (() => void) | null = null;

/** Verifica si el UID es admin (local UIDs + Firebase DB) */
async function checkAdmin(uid: string): Promise<boolean> {
	// Fast path: local UIDs
	if (ADMIN_UIDS.includes(uid)) return true;

	// Remote check: Firebase admins/{uid}
	try {
		const db = await (await import('$lib/firebase')).getDb();
		if (!db) return false;

		const { ref, get } = await import('firebase/database');
		const snap = await get(ref(db, `admins/${uid}`));
		return snap.val() === true;
	} catch {
		return false;
	}
}

/** Iniciar listener de auth */
export async function initAuth() {
	if (unsub) return;

	try {
		const auth = await getAuthInstance();
		if (!auth) {
			store.set({ user: null, isAdmin: false, loading: false, error: 'Firebase no inicializado' });
			return;
		}

		const { onAuthStateChanged } = await import('firebase/auth');

		unsub = onAuthStateChanged(auth, async (fbUser) => {
			if (fbUser) {
				const user: AuthUser = {
					uid: fbUser.uid,
					displayName: fbUser.displayName,
					email: fbUser.email,
					photoURL: fbUser.photoURL
				};
				// Set user immediately, check admin async
				store.set({ user, isAdmin: false, loading: false, error: null });
				const isAdmin = await checkAdmin(fbUser.uid);
				store.update((s) => ({ ...s, isAdmin }));
			} else {
				store.set({ user: null, isAdmin: false, loading: false, error: null });
			}
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.set({ user: null, isAdmin: false, loading: false, error: msg });
	}
}

/** Login con Google */
export async function loginWithGoogle() {
	try {
		const auth = await getAuthInstance();
		if (!auth) throw new Error('Firebase no inicializado');

		const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.update((s) => ({ ...s, error: msg }));
	}
}

/** Logout */
export async function logout() {
	try {
		const auth = await getAuthInstance();
		if (!auth) throw new Error('Firebase no inicializado');

		const { signOut } = await import('firebase/auth');
		await signOut(auth);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.update((s) => ({ ...s, error: msg }));
	}
}

/** Destruir listener */
export function destroyAuth() {
	if (unsub) {
		unsub();
		unsub = null;
	}
}

export const auth = { subscribe: store.subscribe };
