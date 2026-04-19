/**
 * Beats store — lee beats/ de Firebase
 *
 * Estructura Firebase:
 *   beats/{id} → { title, artist, bpm, key, genre, tags, coverUrl, audioUrl, licenses, createdAt, active }
 */

import { createFirebaseStore } from './_firebaseStore';

export type License = {
	basic: number;
	premium: number;
	unlimited: number;
	exclusive: number;
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
	licenses: License;
	createdAt: number;
	active: boolean;
};

export type BeatsMap = Record<string, Beat>;

export const beats = createFirebaseStore<BeatsMap>('beats', {});

/** Helper: beats activos como array ordenado por createdAt */
import { derived } from 'svelte/store';

export const beatsList = derived(beats, ($beats) => {
	if (!$beats.data) return [];
	return Object.entries($beats.data)
		.filter(([, b]) => b.active)
		.sort(([, a], [, b]) => b.createdAt - a.createdAt)
		.map(([id, beat]) => ({ id, ...beat }));
});

/** Total de beats activos (evita recalcular array completo) */
export const beatsCount = derived(beatsList, ($list) => $list.length);

/** Helper: géneros únicos */
export const genres = derived(beatsList, ($list) => {
	if ($list.length === 0) return [];
	return [...new Set($list.map((b) => b.genre))].sort();
});

/** Helper: tags únicos */
export const allTags = derived(beatsList, ($list) => {
	if ($list.length === 0) return [];
	return [...new Set($list.flatMap((b) => b.tags))].sort();
});
