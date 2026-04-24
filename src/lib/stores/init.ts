/**
 * Init stores — llamar una vez al arrancar la app.
 * Suscribe los stores que necesitan Firebase.
 */

import { settings } from './settings';
import { initTheme } from './theme';
import { initAuth } from './auth';
import { beats } from './beats';

let initialized = false;

export async function initStores() {
	if (initialized) return;
	initialized = true;

	console.log('[Init] Starting store initialization...');

	// Fire-and-forget — cada store maneja sus errores internamente
	const results = await Promise.allSettled([
		settings.subscribeFirebase(),
		initTheme(),
		initAuth(),
		beats.subscribeFirebase()
	]);

	console.log('[Init] Stores initialized:', results.map((r, i) => {
		const names = ['settings', 'theme', 'auth', 'beats'];
		return `${names[i]}: ${r.status}`;
	}));
}

export function destroyStores() {
	settings.unsubscribe();
	beats.unsubscribe();
	// theme y auth se destruyen en sus propios módulos
}
