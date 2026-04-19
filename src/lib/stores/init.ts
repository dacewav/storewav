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

	// Fire-and-forget — cada store maneja sus errores internamente
	await Promise.allSettled([
		settings.subscribeFirebase(),
		initTheme(),
		initAuth(),
		beats.subscribeFirebase()
	]);
}

export function destroyStores() {
	settings.unsubscribe();
	beats.unsubscribe();
	// theme y auth se destruyen en sus propios módulos
}
