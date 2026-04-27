/**
 * Google One Tap — GIS (Google Identity Services) integration.
 * COOP-safe: works without popups or redirects.
 * Uses Firebase credential to sign in after One Tap callback.
 */

import { browser } from '$app/environment';
import { dev } from '$app/environment';

let initialized = false;
let gsiLoaded = false;

/** Load the Google Identity Services script */
function loadGSI(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (gsiLoaded) { resolve(); return; }
		if (typeof document === 'undefined') { reject(new Error('No document')); return; }

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => { gsiLoaded = true; resolve(); };
		script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
		document.head.appendChild(script);
	});
}

/**
 * Initialize Google One Tap.
 * Shows the One Tap prompt if user is not logged in.
 */
export async function initOneTap(
	onCredential: (idToken: string) => Promise<void>,
	clientId: string
): Promise<void> {
	if (!browser || initialized || !clientId) return;

	try {
		await loadGSI();

		const google = (window as any).google;
		if (!google?.accounts?.id) {
			if (dev) console.log('[OneTap] GSI not available');
			return;
		}

		google.accounts.id.initialize({
			client_id: clientId,
			callback: async (response: { credential: string }) => {
				if (dev) console.log('[OneTap] Credential received');
				try {
					await onCredential(response.credential);
				} catch (err) {
					console.error('[OneTap] Sign-in failed:', err);
				}
			},
			auto_select: false,
			cancel_on_tap_outside: true,
		});

		// Show the One Tap prompt
		google.accounts.id.prompt((notification: any) => {
			if (dev) console.log('[OneTap] Prompt:', notification.getMomentType());
		});

		initialized = true;
	} catch (err) {
		if (dev) console.error('[OneTap] Init failed:', err);
	}
}

/**
 * Sign in with a Google ID token (from One Tap or GSI).
 * Uses Firebase signInWithCredential.
 */
export async function signInWithIdToken(idToken: string): Promise<void> {
	const { getAuth, signInWithCredential, GoogleAuthProvider } = await import('firebase/auth');
	const { getApp } = await import('firebase/app');

	const app = getApp();
	const auth = getAuth(app);
	const credential = GoogleAuthProvider.credential(idToken);

	await signInWithCredential(auth, credential);
	if (dev) console.log('[OneTap] Firebase sign-in successful');
}

/** Dismiss the One Tap prompt */
export function dismissOneTap() {
	if (!browser) return;
	const google = (window as any).google;
	if (google?.accounts?.id) {
		google.accounts.id.cancel();
	}
}

/** Reset One Tap state (call on logout) */
export function resetOneTap() {
	initialized = false;
	dismissOneTap();
}
