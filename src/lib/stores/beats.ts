/**
 * Beats store — lee/escribe beats/ de Firebase
 *
 * Estructura Firebase:
 *   beats/{id} → { title, artist, bpm, key, genre, tags, coverUrl, audioUrl, ... }
 */

import { createFirebaseStore } from './_firebaseStore';
import { derived } from 'svelte/store';

export type License = {
	basic: number;
	premium: number;
	unlimited: number;
	exclusive: number;
};

export type LicenseNames = {
	basic?: string;
	premium?: string;
	unlimited?: string;
	exclusive?: string;
};

export type Platforms = {
	spotify?: string;
	youtube?: string;
	soundCloud?: string;
};

export type Beat = {
	title: string;
	artist: string;
	bpm: number;
	key: string;
	genre: string;
	tags: string[];
	coverUrl: string;
	audioUrl: string;
	previewUrl?: string;
	description?: string;
	platforms?: Platforms;
	licenses: License;
	licenseNames?: LicenseNames;
	licenseDescs?: LicenseNames;
	createdAt: number;
	order?: number;
	active: boolean;
	featured?: boolean;
	cardStyle?: Record<string, unknown>;
};

export type BeatWithId = Beat & { id: string };

export type BeatsMap = Record<string, Beat>;

export const beats = createFirebaseStore<BeatsMap>('beats', {});

/** Todos los beats como array (activos e inactivos), ordenados por order then createdAt */
export const allBeatsList = derived(beats, ($beats) => {
	if (!$beats.data) return [];
	return Object.entries($beats.data)
		.sort(([, a], [, b]) => {
			const ao = a.order ?? 0;
			const bo = b.order ?? 0;
			if (ao !== bo) return ao - bo;
			return b.createdAt - a.createdAt;
		})
		.map(([id, beat]) => ({ id, ...beat }));
});

/** Beats activos ordenados por createdAt */
export const beatsList = derived(allBeatsList, ($list) =>
	$list.filter((b) => b.active)
);

/** Stats rápidas */
export const beatsStats = derived(allBeatsList, ($list) => ({
	total: $list.length,
	active: $list.filter((b) => b.active).length,
	inactive: $list.filter((b) => !b.active).length,
	genres: [...new Set($list.map((b) => b.genre))].length
}));

/** Géneros únicos (de beats activos) */
export const genres = derived(beatsList, ($list) => {
	if ($list.length === 0) return [];
	return [...new Set($list.map((b) => b.genre))].sort();
});

/** Tags únicos (de beats activos) */
export const allTags = derived(beatsList, ($list) => {
	if ($list.length === 0) return [];
	return [...new Set($list.flatMap((b) => b.tags))].sort();
});

// ── CRUD Helpers ──

/** Crear un beat nuevo */
export async function createBeat(data: Omit<Beat, 'createdAt'>) {
	const { getDb } = await import('$lib/firebase');
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, push, set } = await import('firebase/database');
	const newRef = push(ref(db, 'beats'));
	await set(newRef, { ...data, createdAt: Date.now() });
	return newRef.key;
}

/** Actualizar un beat existente */
export async function updateBeat(id: string, data: Partial<Beat>) {
	const { getDb } = await import('$lib/firebase');
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, update } = await import('firebase/database');
	await update(ref(db, `beats/${id}`), data);
}

/** Borrar un beat */
export async function deleteBeat(id: string) {
	const { getDb } = await import('$lib/firebase');
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, remove } = await import('firebase/database');
	await remove(ref(db, `beats/${id}`));
}

/** Duplicar un beat */
export async function duplicateBeat(id: string) {
	const current = beats;
	let beatData: Beat | null = null;

	// Get current beat data from store
	const unsub = current.subscribe(($beats) => {
		if ($beats.data?.[id]) {
			beatData = $beats.data[id];
		}
	});
	unsub();

	if (!beatData) throw new Error('Beat no encontrado');

	const { title, createdAt, ...rest } = beatData as Beat;
	const dupData: Omit<Beat, 'createdAt'> = {
		...rest,
		title: `${title} (copy)`,
		active: false
	};

	return createBeat(dupData);
}

/** Reordenar un beat (cambia su campo order) */
export async function reorderBeat(id: string, newOrder: number) {
	await updateBeat(id, { order: newOrder });
}

/** Reordenar múltiples beats (swap) */
export async function swapBeatOrders(id1: string, order1: number, id2: string, order2: number) {
	await Promise.all([
		updateBeat(id1, { order: order2 }),
		updateBeat(id2, { order: order1 })
	]);
}

/** Beat vacío para nuevo */
export function emptyBeat(): Omit<Beat, 'createdAt'> {
	return {
		title: '',
		artist: '',
		bpm: 140,
		key: 'Am',
		genre: 'Trap',
		tags: [],
		coverUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: '',
		platforms: { spotify: '', youtube: '', soundCloud: '' },
		licenses: { basic: 350, premium: 750, unlimited: 1500, exclusive: 5000 },
		licenseNames: {},
		licenseDescs: {},
		active: true,
		cardStyle: {}
	};
}
