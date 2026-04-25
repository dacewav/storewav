/**
 * Init stores — llamar una vez al arrancar la app.
 * Suscribe los stores que necesitan Firebase.
 */

import { settings } from './settings';
import { initTheme } from './theme';
import { initAuth } from './auth';
import { beats } from './beats';
import { initConnection } from './connection';
import { initOfflineQueue, destroyOfflineQueue } from './settings';
import { initThemePresets, destroyThemePresets } from './themePresets';
import { initFloating, destroyFloating } from './floating';
import { dev } from '$app/environment';

let initialized = false;

export async function initStores() {
	if (initialized) return;
	initialized = true;

	if (dev) console.log('[Init] Starting store initialization...');

	// Fire-and-forget — cada store maneja sus errores internamente
	const results = await Promise.allSettled([
		settings.subscribeFirebase(),
		initTheme(),
		initAuth(),
		beats.subscribeFirebase(),
		initConnection(),
		initOfflineQueue(),
		initThemePresets(),
		initFloating()
	]);

	if (dev) console.log('[Init] Stores initialized:', results.map((r, i) => {
		const names = ['settings', 'theme', 'auth', 'beats', 'connection', 'offlineQueue', 'themePresets', 'floating'];
		return `${names[i]}: ${r.status}`;
	}));
}

export function destroyStores() {
	settings.unsubscribe();
	beats.unsubscribe();
	destroyOfflineQueue();
	destroyThemePresets();
	destroyFloating();
	// theme y auth se destruyen en sus propios módulos
}
