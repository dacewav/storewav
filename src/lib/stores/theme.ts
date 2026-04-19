/**
 * Theme store — lee theme/ de Firebase y aplica CSS vars
 *
 * Usa el theme.ts existente (applyTheme) como engine.
 * Firebase escribe → onValue → applyTheme() → CSS vars en DOM
 *
 * Estructura Firebase:
 *   theme/accent → "#dc2626"
 *   theme/bg → "#060404"
 *   theme/surface → "#0f0808"
 *   theme/radiusGlobal → "16px"
 *   theme/cardOpacity → 1
 *   theme/lightMode → false
 *   ... (ver ThemeConfig en theme.ts)
 */

import { writable } from 'svelte/store';
import { applyTheme, resetTheme, type ThemeConfig } from '$lib/theme';
import { getDb } from '$lib/firebase';

export type ThemeState = {
	config: ThemeConfig | null;
	loading: boolean;
	error: string | null;
};

const store = writable<ThemeState>({ config: null, loading: true, error: null });
let unsub: (() => void) | null = null;

/** Suscribirse a Firebase theme/ y aplicar al DOM */
export async function initTheme() {
	if (unsub) return;

	try {
		const db = await getDb();
		if (!db) {
			store.set({ config: null, loading: false, error: 'Firebase no inicializado' });
			return;
		}

		const { ref, onValue } = await import('firebase/database');

		unsub = onValue(
			ref(db, 'theme'),
			(snap) => {
				const config = snap.val() as ThemeConfig | null;
				if (config) {
					applyTheme(config);
				}
				store.set({ config, loading: false, error: null });
			},
			(err) => {
				console.error('[Theme]', err.message);
				store.set({ config: null, loading: false, error: err.message });
			}
		);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.set({ config: null, loading: false, error: msg });
	}
}

/** Desuscribirse y resetear CSS vars */
export function destroyTheme() {
	if (unsub) {
		unsub();
		unsub = null;
	}
	resetTheme();
	store.set({ config: null, loading: true, error: null });
}

/** Actualizar un campo del tema en Firebase */
export async function updateThemeField(key: string, value: unknown) {
	try {
		const db = await getDb();
		if (!db) throw new Error('Firebase no inicializado');

		const { ref, update } = await import('firebase/database');
		await update(ref(db, 'theme'), { [key]: value });
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		store.update((s) => ({ ...s, error: msg }));
	}
}

export const theme = { subscribe: store.subscribe };
