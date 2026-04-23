/**
 * Theme store — aplica tema como CSS vars
 *
 * FUENTE ÚNICA: settings.data.theme (viene de Firebase settings/ + migration)
 * NO lee de Firebase theme/ directamente — eso causaba desync con admin editor.
 *
 * Flujo:
 *   Admin edita theme → settings.updateField('theme.accent', '#ff0000')
 *   → Firebase settings/theme.accent cambia
 *   → settings store detecta cambio
 *   → theme store re-aplica CSS vars
 */

import { writable } from 'svelte/store';
import { applyTheme, resetTheme, type ThemeConfig } from '$lib/theme';
import { settings } from './settings';

export type ThemeState = {
	config: ThemeConfig | null;
	loading: boolean;
	error: string | null;
};

const store = writable<ThemeState>({ config: null, loading: true, error: null });
let unsub: (() => void) | null = null;

/** Suscribirse a settings.data.theme y aplicar CSS vars */
export async function initTheme() {
	if (unsub) return;

	// Listen to settings store — when theme changes, apply CSS vars
	unsub = settings.subscribe((settingsState) => {
		const themeConfig = settingsState.data?.theme as unknown as ThemeConfig | null;
		if (themeConfig) {
			applyTheme(themeConfig);
			store.set({ config: themeConfig, loading: false, error: null });
		} else if (!settingsState.loading) {
			store.set({ config: null, loading: false, error: null });
		}
	});
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

/** Actualizar un campo del tema en Firebase settings/ */
export async function updateThemeField(key: string, value: unknown) {
	settings.updateField(`theme.${key}`, value);
}

export const theme = { subscribe: store.subscribe };
