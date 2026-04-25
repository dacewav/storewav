/**
 * Theme Presets — save/load full theme configurations
 *
 * Firebase path: themePresets/
 * Structure: { [id]: { name, theme: ThemeSettings, createdAt } }
 */

import { writable, get } from 'svelte/store';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { getDb } from '$lib/firebase';
import type { ThemeSettings } from './settings';
import { settings } from './settings';
import { toast } from '$lib/toastStore';

export type ThemePreset = {
	id: string;
	name: string;
	theme: ThemeSettings;
	createdAt: number;
};

function createThemePresetsStore() {
	const presets = writable<ThemePreset[]>([]);
	let _unsub: (() => void) | null = null;
	let _initialized = false;

	async function init() {
		if (_initialized) return;
		_initialized = true;
		try {
			const db = await getDb();
			if (!db) return;
			const r = ref(db, 'themePresets');
			_unsub = onValue(r, (snap) => {
				const val = snap.val();
				if (!val || typeof val !== 'object') {
					presets.set([]);
					return;
				}
				const list: ThemePreset[] = Object.entries(val)
					.map(([id, data]: [string, any]) => ({
						id,
						name: data.name ?? 'Unnamed',
						theme: data.theme ?? {},
						createdAt: data.createdAt ?? 0
					}))
					.sort((a, b) => b.createdAt - a.createdAt);
				presets.set(list);
			});
		} catch (e) {
			console.warn('[ThemePresets] Firebase not available:', e);
		}
	}

	async function savePreset(name: string): Promise<string | null> {
		try {
			const db = await getDb();
			if (!db) return null;
			const currentSettings = get(settings).data;
			if (!currentSettings?.theme) {
				toast.error('No hay tema para guardar');
				return null;
			}
			const newRef = push(ref(db, 'themePresets'));
			const preset: Omit<ThemePreset, 'id'> = {
				name: name.trim() || 'Preset sin nombre',
				theme: { ...currentSettings.theme },
				createdAt: Date.now()
			};
			await set(newRef, preset);
			toast.success(`Preset "${preset.name}" guardado`);
			return newRef.key;
		} catch (e) {
			console.error('[ThemePresets] Save error:', e);
			toast.error('Error al guardar preset');
			return null;
		}
	}

	async function loadPreset(id: string): Promise<boolean> {
		try {
			const current = get(presets);
			const preset = current.find((p) => p.id === id);
			if (!preset) {
				toast.error('Preset no encontrado');
				return false;
			}
			// Apply theme via settings store
			await settings.set({ theme: preset.theme } as any);
			toast.success(`Tema "${preset.name}" aplicado`);
			return true;
		} catch (e) {
			console.error('[ThemePresets] Load error:', e);
			toast.error('Error al cargar preset');
			return false;
		}
	}

	async function deletePreset(id: string): Promise<boolean> {
		try {
			const db = await getDb();
			if (!db) return false;
			await remove(ref(db, `themePresets/${id}`));
			toast.success('Preset eliminado');
			return true;
		} catch (e) {
			console.error('[ThemePresets] Delete error:', e);
			toast.error('Error al eliminar preset');
			return false;
		}
	}

	async function renamePreset(id: string, newName: string): Promise<boolean> {
		try {
			const db = await getDb();
			if (!db) return false;
			const current = get(presets);
			const preset = current.find((p) => p.id === id);
			if (!preset) return false;
			await set(ref(db, `themePresets/${id}/name`), newName.trim());
			return true;
		} catch (e) {
			console.error('[ThemePresets] Rename error:', e);
			return false;
		}
	}

	function destroy() {
		_unsub?.();
		_unsub = null;
		_initialized = false;
	}

	return {
		subscribe: presets.subscribe,
		init,
		savePreset,
		loadPreset,
		deletePreset,
		renamePreset,
		destroy
	};
}

export const themePresets = createThemePresetsStore();
export const initThemePresets = () => themePresets.init();
export const destroyThemePresets = () => themePresets.destroy();
export const savePreset = (name: string) => themePresets.savePreset(name);
export const loadPreset = (preset: ThemePreset | string) => themePresets.loadPreset(typeof preset === 'string' ? preset : preset.id);
export const deletePreset = (id: string) => themePresets.deletePreset(id);
export const renamePreset = (id: string, name: string) => themePresets.renamePreset(id, name);
