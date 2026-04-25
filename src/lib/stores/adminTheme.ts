/**
 * Admin theme — dark/light toggle independent of store theme.
 * Persists to localStorage.
 */

import { writable } from 'svelte/store';

type AdminTheme = 'dark' | 'light';

function getInitial(): AdminTheme {
	if (typeof window === 'undefined') return 'dark';
	const stored = localStorage.getItem('admin-theme') as AdminTheme | null;
	if (stored === 'dark' || stored === 'light') return stored;
	// Respect system preference
	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function createAdminThemeStore() {
	const { subscribe, update, set } = writable<AdminTheme>(getInitial());

	// Apply class to document
	if (typeof window !== 'undefined') {
		subscribe((theme) => {
			document.documentElement.classList.toggle('admin-light', theme === 'light');
			document.documentElement.classList.toggle('admin-dark', theme === 'dark');
			localStorage.setItem('admin-theme', theme);
		});
	}

	return {
		subscribe,
		toggle: () => update((t) => (t === 'dark' ? 'light' : 'dark')),
		set
	};
}

export const adminTheme = createAdminThemeStore();
