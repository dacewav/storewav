/**
 * Connection store — Firebase .info/connected
 *
 * Expone:
 *   - online: boolean (navigator.onLine)
 *   - firebaseConnected: boolean (Firebase RTDB connection state)
 *   - isFullyConnected: boolean (ambos)
 */

import { writable, derived } from 'svelte/store';
import { getDb } from '$lib/firebase';

const onlineStore = writable(typeof navigator !== 'undefined' ? navigator.onLine : true);
const firebaseStore = writable(false);

let unsubFirebase: (() => void) | null = null;
let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

/** Inicializar connection monitoring */
export async function initConnection() {
	if (typeof window === 'undefined') return;

	// Browser online/offline
	const onOnline = () => onlineStore.set(true);
	const onOffline = () => onlineStore.set(false);
	window.addEventListener('online', onOnline);
	window.addEventListener('offline', onOffline);

	// Firebase .info/connected
	try {
		const db = await getDb();
		if (!db) return;

		const { ref, onValue } = await import('firebase/database');
		const connectedRef = ref(db, '.info/connected');
		unsubFirebase = onValue(connectedRef, (snap) => {
			const connected = snap.val() === true;
			if (connected) {
				// Reconnected — cancel any pending disconnect timer and show connected immediately
				if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null; }
				firebaseStore.set(true);
			} else {
				// Disconnected — grace period of 3s before showing offline.
				// During signInWithPopup, Firebase RTDB briefly disconnects to refresh the auth token.
				// Without grace period, the offline banner would flash every time a user logs in.
				if (!disconnectTimer) {
					disconnectTimer = setTimeout(() => {
						firebaseStore.set(false);
						disconnectTimer = null;
					}, 3000);
				}
			}
		});
	} catch (err) {
		console.error('[Connection] Firebase connection check failed:', err);
	}
}

export function destroyConnection() {
	if (unsubFirebase) {
		unsubFirebase();
		unsubFirebase = null;
	}
	if (disconnectTimer) {
		clearTimeout(disconnectTimer);
		disconnectTimer = null;
	}
}

export const online = { subscribe: onlineStore.subscribe };
export const firebaseConnected = { subscribe: firebaseStore.subscribe };

/** True only when both browser and Firebase are connected */
export const isFullyConnected = derived(
	[onlineStore, firebaseStore],
	([$online, $firebase]) => $online && $firebase
);
