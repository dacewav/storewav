/**
 * Beats store — lee/escribe beats/ de Firebase
 *
 * Estructura Firebase (matches deployed rules):
 *   beats/{id} → { name, artist, bpm, key, genre, genreCustom, tags, imageUrl, audioUrl, ... }
 */

import { createFirebaseStore } from './_firebaseStore';
import { derived } from 'svelte/store';

/** License item in the deployed array format */
export type LicenseItem = {
	name: string;
	description?: string;
	priceMXN: number;
	priceUSD: number;
};

export type Platforms = {
	spotify?: string;
	youtube?: string;
	soundcloud?: string;
};

export type Beat = {
	name: string;
	artist?: string;
	bpm: number;
	key: string;
	genre: string;
	genreCustom?: string;
	tags: string[];
	imageUrl: string;
	images?: string[];
	audioUrl?: string;
	previewUrl?: string;
	description?: string;
	spotify?: string;
	youtube?: string;
	soundcloud?: string;
	licenses: LicenseItem[];
	date?: string;
	order?: number;
	active: boolean;
	featured?: boolean;
	exclusive?: boolean;
	available?: boolean;
	plays?: number;
	cardStyle?: Record<string, unknown>;
	glowConfig?: Record<string, unknown>;
	cardAnim?: Record<string, unknown>;
	accentColor?: string;
	shimmer?: boolean;
	shimmerSpeed?: number;
	shimmerOp?: number;
	cardBorder?: Record<string, unknown>;
	/** @deprecated — not in deployed rules, kept for backwards compat */
	coverUrl?: string;
	/** @deprecated — not in deployed rules, kept for backwards compat */
	createdAt?: number;
};

export type BeatWithId = Beat & { id: string };

export type BeatsMap = Record<string, Beat>;

export const beats = createFirebaseStore<BeatsMap>('beats', {});

/** Todos los beats como array (activos e inactivos), ordenados por order then date */
export const allBeatsList = derived(beats, ($beats) => {
	if (!$beats.data) return [];
	return Object.entries($beats.data)
		.sort(([, a], [, b]) => {
			const ao = a.order ?? 0;
			const bo = b.order ?? 0;
			if (ao !== bo) return ao - bo;
			const ad = a.date ?? '';
			const bd = b.date ?? '';
			return bd.localeCompare(ad);
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
export async function createBeat(data: Omit<Beat, 'date'>) {
	const { getDb } = await import('$lib/firebase');
	const db = await getDb();
	if (!db) throw new Error('Firebase no inicializado');

	const { ref, push, set } = await import('firebase/database');
	const newRef = push(ref(db, 'beats'));
	await set(newRef, { ...data, date: new Date().toISOString() });
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

	const { name, date, ...rest } = beatData as Beat;
	const dupData: Omit<Beat, 'date'> = {
		...rest,
		name: `${name} (copy)`,
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
export function emptyBeat(): Omit<Beat, 'date'> {
	return {
		name: '',
		artist: '',
		bpm: 140,
		key: 'Am',
		genre: 'Trap',
		tags: [],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: '',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 }
		],
		active: true,
		available: true,
		featured: false,
		exclusive: false,
		cardStyle: {}
	};
}
