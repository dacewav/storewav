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
	adminChecked: boolean;
	loading: boolean;
	error: string | null;
};

const ADMIN_UIDS: string[] = PUBLIC_ADMIN_UIDS.split(',').map((s: string) => s.trim()).filter(Boolean);

console.log('[Auth] Admin UIDs configured:', ADMIN_UIDS.length);

const store = writable<AuthState>({ user: null, isAdmin: false, adminChecked: false, loading: true, error: null });
let unsub: (() => void) | null = null;

/** Verifica si el UID o email es admin */
async function checkAdmin(uid: string, email?: string | null): Promise<boolean> {
	// Fast path: local UIDs
	if (ADMIN_UIDS.includes(uid)) {
		console.log('[Auth] Admin confirmed via local UID');
		return true;
	}

	console.log('[Auth] UID not in local list, checking Firebase...', { uid, email });

	try {
		const db = await (await import('$lib/firebase')).getDb();
		if (!db) {
			console.warn('[Auth] Firebase not available for admin check');
			return false;
		}

		const { ref, get } = await import('firebase/database');

		// Check adminWhitelist/approved/{uid}
		const approvedSnap = await get(ref(db, `adminWhitelist/approved/${uid}`));
		if (approvedSnap.exists()) {
			console.log('[Auth] Admin confirmed via Firebase whitelist');
			return true;
		}

		// Fallback: legacy admins/{uid} (backward compat)
		const legacySnap = await get(ref(db, `admins/${uid}`));
		if (legacySnap.val() === true) {
			console.log('[Auth] Admin confirmed via legacy admins/');
			return true;
		}

		console.warn('[Auth] NOT admin. UID:', uid);
		return false;
	} catch (err) {
		console.error('[Auth] Admin check failed:', err);
		return false;
	}
}

/** Iniciar listener de auth */
export async function initAuth() {
	if (unsub) return;

	try {
		const auth = await getAuthInstance();
		if (!auth) {
			store.set({ user: null, isAdmin: false, adminChecked: true, loading: false, error: 'Firebase no inicializado' });
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
				// Set user immediately, admin check pending
				store.set({ user, isAdmin: false, adminChecked: false, loading: false, error: null });
				const isAdmin = await checkAdmin(fbUser.uid, fbUser.email);
				// Single update: admin check complete
				store.update((s) => ({ ...s, isAdmin, adminChecked: true }));
			} else {
				store.set({ user: null, isAdmin: false, adminChecked: true, loading: false, error: null });
			}
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.set({ user: null, isAdmin: false, adminChecked: true, loading: false, error: msg });
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

/** Login anónimo (para testing) */
export async function loginAnonymously() {
	try {
		const auth = await getAuthInstance();
		if (!auth) throw new Error('Firebase no inicializado');

		const { signInAnonymously } = await import('firebase/auth');
		await signInAnonymously(auth);
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
