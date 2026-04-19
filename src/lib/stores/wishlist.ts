/**
 * Wishlist store — localStorage + reactive
 *
 * No necesita Firebase. Persiste en localStorage del browser.
 * Sincroniza entre tabs via storage event.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'dacewav_wishlist';

function load(): string[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function save(ids: string[]) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const store = writable<string[]>(load());

/** Sincronizar entre tabs */
if (browser) {
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY) {
			store.set(load());
		}
	});
}

function toggle(beatId: string) {
	store.update((ids) => {
		const next = ids.includes(beatId) ? ids.filter((id) => id !== beatId) : [...ids, beatId];
		save(next);
		return next;
	});
}

function has(beatId: string): boolean {
	let result = false;
	store.subscribe((ids) => { result = ids.includes(beatId); })();
	return result;
}

function clear() {
	store.set([]);
	save([]);
}

export const wishlist = {
	subscribe: store.subscribe,
	toggle,
	has,
	clear,
	/** ¿Un beat está en la wishlist? (reactivo) */
	isIn: (beatId: string) => {
		return { subscribe: (fn: (v: boolean) => void) => store.subscribe((ids) => fn(ids.includes(beatId))) };
	}
};
