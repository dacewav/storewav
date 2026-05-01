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
import { dev } from '$app/environment';

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

const ADMIN_UIDS: string[] = (PUBLIC_ADMIN_UIDS ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);

if (dev) console.log('[Auth] Admin UIDs configured:', ADMIN_UIDS.length);

const store = writable<AuthState>({ user: null, isAdmin: false, adminChecked: false, loading: true, error: null });
let unsub: (() => void) | null = null;

/** RTDB get with timeout — prevents hanging when Firebase reconnects post-auth */
async function getWithTimeout(dbRef: { key: string | null }, timeoutMs = 5000) {
	const { get } = await import('firebase/database');
	return new Promise<Awaited<ReturnType<typeof get>> | null>((resolve) => {
		const timer = setTimeout(() => {
			console.warn('[Auth] RTDB read timed out after', timeoutMs, 'ms');
			resolve(null);
		}, timeoutMs);
		get(dbRef as any).then((snap) => {
			clearTimeout(timer);
			resolve(snap);
		}).catch((err) => {
			clearTimeout(timer);
			console.error('[Auth] RTDB read error:', err);
			resolve(null);
		});
	});
}

/** Verifica si el UID o email es admin — with retry for post-auth token propagation */
async function checkAdmin(uid: string, email?: string | null): Promise<boolean> {
	// Fast path: local UIDs
	if (ADMIN_UIDS.includes(uid)) {
		if (dev) console.log('[Auth] Admin confirmed via local UID');
		return true;
	}

	// Dev mode: any authenticated user is admin (safe — dev is only true in vite dev)
	if (dev) {
		console.log('[Auth] Dev mode — granting admin access to:', uid);
		return true;
	}

	// Retry up to 3 times — after signInWithPopup, Firebase RTDB may need a moment
	// to reconnect with the new auth token. First attempt may timeout or return stale data.
	const maxAttempts = 3;
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			const db = await (await import('$lib/firebase')).getDb();
			if (!db) {
				console.warn('[Auth] Firebase not available for admin check');
				return false;
			}

			const { ref } = await import('firebase/database');

			// Check adminWhitelist/approved/{uid}
			const approvedSnap = await getWithTimeout(ref(db, `adminWhitelist/approved/${uid}`));
			if (approvedSnap && (approvedSnap as any).exists()) {
				if (dev) console.log('[Auth] Admin confirmed via Firebase whitelist');
				return true;
			}

			// Fallback: legacy admins/{uid} (backward compat)
			const legacySnap = await getWithTimeout(ref(db, `admins/${uid}`));
			if (legacySnap && (legacySnap as any).val() === true) {
				if (dev) console.log('[Auth] Admin confirmed via legacy admins/');
				return true;
			}

			// Got a valid response but user is not admin — no need to retry
			if (approvedSnap !== null) {
				if (dev) console.log('[Auth] NOT admin. UID:', uid);
				return false;
			}

			// Null response = timeout/error — retry after delay
			if (attempt < maxAttempts - 1) {
				const delay = 1000 * (attempt + 1);
				if (dev) console.log(`[Auth] Admin check attempt ${attempt + 1} inconclusive, retrying in ${delay}ms...`);
				await new Promise((r) => setTimeout(r, delay));
			}
		} catch (err) {
			if (attempt < maxAttempts - 1) {
				const delay = 1000 * (attempt + 1);
				if (dev) console.log(`[Auth] Admin check attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
				await new Promise((r) => setTimeout(r, delay));
			} else {
				console.error('[Auth] Admin check failed after', maxAttempts, 'attempts:', err);
			}
		}
	}

	console.warn('[Auth] Admin check exhausted retries. UID:', uid);
	return false;
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
				console.log('[Auth] onAuthStateChanged: signed in as', fbUser.email, 'UID:', fbUser.uid);
				const user: AuthUser = {
					uid: fbUser.uid,
					displayName: fbUser.displayName,
					email: fbUser.email,
					photoURL: fbUser.photoURL
				};
				// Set user immediately, admin check pending
				store.set({ user, isAdmin: false, adminChecked: false, loading: false, error: null });
				const isAdmin = await checkAdmin(fbUser.uid, fbUser.email);
				console.log('[Auth] Admin check result:', isAdmin, 'for UID:', fbUser.uid);
				// Single update: admin check complete
				store.update((s) => ({ ...s, isAdmin, adminChecked: true }));
			} else {
				console.log('[Auth] onAuthStateChanged: signed out');
				store.set({ user: null, isAdmin: false, adminChecked: true, loading: false, error: null });
			}
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.set({ user: null, isAdmin: false, adminChecked: true, loading: false, error: msg });
	}
}

/** Login con Google — credential directo vía GSI (sin redirect/popup)
 *
 * signInWithRedirect está roto porque CORS bloquea la comunicación
 * entre dacewav.store y dacewav-store-3b0f5.firebaseapp.com (authDomain).
 * Firebase Hosting no está desplegado → init.json 404.
 *
 * signInWithPopup está roto por COOP: same-origin de Google.
 *
 * Solución: usar Google Identity Services (GSI) directamente
 * para obtener el ID token, luego signInWithCredential en Firebase.
 * No depende del authDomain, no necesita popup ni redirect.
 */
export async function loginWithGoogle() {
	try {
		const auth = await getAuthInstance();
		if (!auth) throw new Error('Firebase no inicializado');

		if (dev) console.log('[Auth] GSI credential flow...');

		// Load GSI script if not already loaded
		await loadGSIScript();

		const google = (window as any).google;
		if (!google?.accounts?.id) {
			throw new Error('Google Identity Services no disponible');
		}

		// Get client ID
		const { PUBLIC_GOOGLE_CLIENT_ID } = await import('$env/static/public');
		if (!PUBLIC_GOOGLE_CLIENT_ID) throw new Error('PUBLIC_GOOGLE_CLIENT_ID no configurado');

		// Use a promise to wait for the GSI credential callback
		const idToken: string = await new Promise((resolve, reject) => {
			let resolved = false;

			google.accounts.id.initialize({
				client_id: PUBLIC_GOOGLE_CLIENT_ID,
				callback: (response: { credential: string }) => {
					if (response.credential) {
						resolved = true;
						resolve(response.credential);
					}
				},
				auto_select: false,
				cancel_on_tap_outside: true,
			});

			// Show the One Tap prompt (this is the active sign-in UI)
			google.accounts.id.prompt((notification: any) => {
				if (dev) console.log('[Auth] GSI prompt moment:', notification.getMomentType());
				// If the prompt was dismissed or skipped without getting a credential
				if (!resolved && notification.getMomentType() === 'dismissed') {
					reject(new Error('Login cancelado'));
				}
				if (!resolved && notification.getMomentType() === 'skipped') {
					// 'skipped' can mean browser doesn't support the prompt UI
					// Don't reject — the credential callback might still fire
					if (dev) console.log('[Auth] GSI prompt skipped (credential may still arrive)');
				}
			});

			// Timeout after 60s (user might be slow to pick account)
			setTimeout(() => {
				if (!resolved) reject(new Error('Login timeout — no se recibió credencial'));
			}, 60000);
		});

		// Sign in to Firebase with the GSI credential
		const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
		const credential = GoogleAuthProvider.credential(idToken);
		const result = await signInWithCredential(auth, credential);

		if (dev) console.log('[Auth] GSI sign-in successful:', result.user.email, 'UID:', result.user.uid);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error('[Auth] loginWithGoogle error:', msg);
		store.update((s) => ({ ...s, error: msg }));
	}
}

/** Load GSI script (shared with oneTap.ts) */
function loadGSIScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if ((window as any).google?.accounts?.id) { resolve(); return; }
		if (typeof document === 'undefined') { reject(new Error('No document')); return; }

		// Check if script already exists
		const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
		if (existing) {
			existing.addEventListener('load', () => resolve());
			existing.addEventListener('error', () => reject(new Error('Failed to load GSI')));
			// If already loaded
			if ((window as any).google?.accounts?.id) resolve();
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			// Give it a tick to initialize
			setTimeout(() => {
				if ((window as any).google?.accounts?.id) resolve();
				else reject(new Error('GSI loaded but not available'));
			}, 100);
		};
		script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
		document.head.appendChild(script);
	});
}

/** Login con email link (passwordless) — envía link al email */
export async function loginWithEmailLink(email: string) {
	try {
		const auth = await getAuthInstance();
		if (!auth) throw new Error('Firebase no inicializado');

		const { sendSignInLinkToEmail, isSignInWithEmailLink } = await import('firebase/auth');

		// If already on the sign-in link page, complete the flow
		if (isSignInWithEmailLink(auth, window.location.href)) {
			const { signInWithEmailLink } = await import('firebase/auth');
			const result = await signInWithEmailLink(auth, email, window.location.href);
			if (dev) console.log('[Auth] Email link sign-in successful:', result.user.email);
			// Clear saved email
			window.localStorage.removeItem('dacewav_emailForSignIn');
			return;
		}

		// Otherwise, send the link
		const actionCodeSettings = {
			url: `${window.location.origin}/login?complete=email`,
			handleCodeInApp: true,
		};

		await sendSignInLinkToEmail(auth, email, actionCodeSettings);
		// Save email for completion
		window.localStorage.setItem('dacewav_emailForSignIn', email);
		if (dev) console.log('[Auth] Email link sent to:', email);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error('[Auth] loginWithEmailLink error:', msg);
		store.update((s) => ({ ...s, error: msg }));
		throw err;
	}
}

/** Completar email link sign-in si el usuario vino del link */
export async function completeEmailLinkSignIn(): Promise<string | null> {
	try {
		const auth = await getAuthInstance();
		if (!auth) return null;

		const { isSignInWithEmailLink, signInWithEmailLink } = await import('firebase/auth');

		if (!isSignInWithEmailLink(auth, window.location.href)) return null;

		// Get email from localStorage (saved when link was sent)
		let email = window.localStorage.getItem('dacewav_emailForSignIn');
		if (!email) {
			// Prompt user for email if not saved
			email = window.prompt('Ingresá tu email para completar el login:');
			if (!email) return null;
		}

		const result = await signInWithEmailLink(auth, email, window.location.href);
		window.localStorage.removeItem('dacewav_emailForSignIn');
		if (dev) console.log('[Auth] Email link completed:', result.user.email);
		return email;
	} catch (err) {
		console.error('[Auth] completeEmailLinkSignIn error:', err);
		return null;
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
