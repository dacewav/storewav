/**
 * Google One Tap + FedCM integration.
 * Migrated from deprecated GSI to FedCM (Federated Credential Management) API.
 * Falls back to GSI for browsers without FedCM support.
 *
 * FedCM: https://developers.google.com/identity/fedcm/overview
 * Firebase FedCM: https://firebase.google.com/docs/auth/web/fedcm
 */

import { browser } from '$app/environment';
import { dev } from '$app/environment';

let initialized = false;
let gsiLoaded = false;

/** Check if browser supports FedCM */
function hasFedCMSupport(): boolean {
	if (typeof window === 'undefined') return false;
	return 'IdentityCredential' in window;
}

/** Load the Google Identity Services script (fallback for non-FedCM browsers) */
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
 * Initialize Google One Tap / FedCM.
 * Shows the credential prompt if user is not logged in.
 */
export async function initOneTap(
	onCredential: (idToken: string) => Promise<void>,
	clientId: string
): Promise<void> {
	if (!browser || initialized || !clientId) return;

	try {
		// Try FedCM first (modern browsers)
		if (hasFedCMSupport()) {
			if (dev) console.log('[OneTap] FedCM supported, using native API');
			await initFedCM(onCredential, clientId);
			return;
		}

		// Fallback to GSI (legacy)
		if (dev) console.log('[OneTap] FedCM not supported, falling back to GSI');
		await initGSI(onCredential, clientId);
	} catch (err) {
		if (dev) console.error('[OneTap] Init failed:', err);
	}
}

/**
 * FedCM initialization — uses the IdentityCredential API.
 * This is the modern replacement for GSI One Tap.
 */
async function initFedCM(
	onCredential: (idToken: string) => Promise<void>,
	clientId: string
): Promise<void> {
	try {
		// Check if FedCM is available and user is signed in to Google
		const credential = await navigator.credentials.get({
			identity: {
				context: 'signin',
				providers: [{
					configURL: 'https://accounts.google.com/gsi/fedcm.json',
					clientId,
				}],
				mode: 'passive', // Don't show UI if user hasn't consented
			},
		}) as (IdentityCredential & { token?: string }) | null;

		if (credential?.token) {
			if (dev) console.log('[OneTap] FedCM credential received');
			await onCredential(credential.token);
			initialized = true;
		} else {
			if (dev) console.log('[OneTap] FedCM: no credential returned (user not signed in or declined)');
			// Fall back to GSI for active prompt
			await initGSI(onCredential, clientId);
		}
	} catch (err) {
		if (dev) console.warn('[OneTap] FedCM failed, falling back to GSI:', err);
		await initGSI(onCredential, clientId);
	}
}

/**
 * GSI initialization — legacy fallback for browsers without FedCM.
 */
async function initGSI(
	onCredential: (idToken: string) => Promise<void>,
	clientId: string
): Promise<void> {
	await loadGSI();

	const google = (window as any).google;
	if (!google?.accounts?.id) {
		if (dev) console.log('[OneTap] GSI not available');
		return;
	}

	google.accounts.id.initialize({
		client_id: clientId,
		callback: async (response: { credential: string }) => {
			if (dev) console.log('[OneTap] GSI credential received');
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
}

/**
 * Sign in with a Google ID token (from One Tap, FedCM, or GSI).
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

/** Dismiss the credential prompt */
export function dismissOneTap() {
	if (!browser) return;
	// GSI dismiss
	const google = (window as any).google;
	if (google?.accounts?.id) {
		google.accounts.id.cancel();
	}
	// FedCM: no dismiss API — passive mode auto-dismisses
}

/** Reset One Tap state (call on logout) */
export function resetOneTap() {
	initialized = false;
	dismissOneTap();
}
