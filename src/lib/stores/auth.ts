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

// TODO: Mover a variable de entorno o Firebase custom claims
const ADMIN_UIDS: string[] = [];

const store = writable<AuthState>({ user: null, isAdmin: false, loading: true, error: null });
let unsub: (() => void) | null = null;

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

		unsub = onAuthStateChanged(auth, (fbUser) => {
			if (fbUser) {
				const user: AuthUser = {
					uid: fbUser.uid,
					displayName: fbUser.displayName,
					email: fbUser.email,
					photoURL: fbUser.photoURL
				};
				store.set({ user, isAdmin: ADMIN_UIDS.includes(fbUser.uid), loading: false, error: null });
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
