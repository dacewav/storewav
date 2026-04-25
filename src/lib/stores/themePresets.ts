/**
 * Theme Presets — save/load theme configurations
 *
 * Firebase path: themePresets/
 * Each preset: { id, name, theme: ThemeSettings, createdAt }
 */

import { writable, derived } from 'svelte/store';
import { getDb } from '$lib/firebase';
import { settings, type ThemeSettings } from './settings';
import { toast } from '$lib/toastStore';

export type ThemePreset = {
	id: string;
	name: string;
	theme: Partial<ThemeSettings>;
	createdAt: number;
};

const presetsStore = writable<ThemePreset[]>([]);
let unsub: (() => void) | null = null;

/** Start listening to themePresets/ in Firebase */
export async function initThemePresets() {
	if (unsub) return;
	try {
		const db = await getDb();
		if (!db) return;
		const { ref, onValue } = await import('firebase/database');
		unsub = onValue(ref(db, 'themePresets'), (snap) => {
			const val = snap.val();
			if (!val) {
				presetsStore.set([]);
				return;
			}
			const list: ThemePreset[] = Object.entries(val).map(([id, data]) => ({
				id,
				...(data as Omit<ThemePreset, 'id'>)
			}));
			list.sort((a, b) => b.createdAt - a.createdAt);
			presetsStore.set(list);
		});
	} catch (err) {
		console.error('[ThemePresets] Init failed:', err);
	}
}

/** Save current theme as a new preset */
export async function savePreset(name: string): Promise<string | null> {
	try {
		const db = await getDb();
		if (!db) throw new Error('Firebase not available');

		// Capture current theme
		let currentTheme: Partial<ThemeSettings> = {};
		const unsubSnap = settings.subscribe((s) => {
			if (s.data?.theme) {
				currentTheme = { ...s.data.theme };
			}
		});
		unsubSnap();

		const { ref, push, set: fbSet } = await import('firebase/database');
		const newRef = push(ref(db, 'themePresets'));
		const preset: Omit<ThemePreset, 'id'> = {
			name,
			theme: currentTheme,
			createdAt: Date.now()
		};
		await fbSet(newRef, preset);
		toast.success(`Preset "${name}" guardado`);
		return newRef.key;
	} catch (err) {
		console.error('[ThemePresets] Save failed:', err);
		toast.error('Error al guardar preset');
		return null;
	}
}

/** Load a preset — apply its theme to current settings */
export async function loadPreset(preset: ThemePreset): Promise<void> {
	try {
		// Apply each theme key via updateField
		for (const [key, value] of Object.entries(preset.theme)) {
			if (value !== undefined && value !== null) {
				await settings.updateField(`theme.${key}`, value);
			}
		}
		toast.success(`Preset "${preset.name}" aplicado`);
	} catch (err) {
		console.error('[ThemePresets] Load failed:', err);
		toast.error('Error al cargar preset');
	}
}

/** Delete a preset */
export async function deletePreset(id: string): Promise<void> {
	try {
		const db = await getDb();
		if (!db) throw new Error('Firebase not available');
		const { ref, remove } = await import('firebase/database');
		await remove(ref(db, `themePresets/${id}`));
		toast.success('Preset eliminado');
	} catch (err) {
		console.error('[ThemePresets] Delete failed:', err);
		toast.error('Error al eliminar preset');
	}
}

/** Rename a preset */
export async function renamePreset(id: string, newName: string): Promise<void> {
	try {
		const db = await getDb();
		if (!db) throw new Error('Firebase not available');
		const { ref, update: fbUpdate } = await import('firebase/database');
		await fbUpdate(ref(db, `themePresets/${id}`), { name: newName });
		toast.success('Preset renombrado');
	} catch (err) {
		console.error('[ThemePresets] Rename failed:', err);
		toast.error('Error al renombrar preset');
	}
}

/** Destroy listener */
export function destroyThemePresets() {
	if (unsub) {
		unsub();
		unsub = null;
	}
}

export const themePresets = { subscribe: presetsStore.subscribe };
