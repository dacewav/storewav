/**
 * Init stores — llamar una vez al arrancar la app.
 * Suscribe los stores que necesitan Firebase.
 */

import { settings } from './settings';
import { initTheme } from './theme';
import { initAuth } from './auth';
import { beats } from './beats';
import { initConnection } from './connection';
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
		initConnection()
	]);

	if (dev) console.log('[Init] Stores initialized:', results.map((r, i) => {
		const names = ['settings', 'theme', 'auth', 'beats', 'connection'];
		return `${names[i]}: ${r.status}`;
	}));
}

export function destroyStores() {
	settings.unsubscribe();
	beats.unsubscribe();
	// theme y auth se destruyen en sus propios módulos
}
