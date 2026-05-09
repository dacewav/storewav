/**
 * Drumkits store — lee/escribe kits/ de Firebase
 *
 * Estructura Firebase:
 *   kits/{kitId} → { name, description, genre, imageUrl, previewUrls, samples, priceMXN, priceUSD, active, order, ... }
 */

import { createFirebaseStore } from './_firebaseStore';
import { derived } from 'svelte/store';

export type KitSample = {
	name: string;
	url: string;
	duration?: number;
};

export type Kit = {
	name: string;
	description?: string;
	genre: string;
	imageUrl: string;
	previewUrls?: string[];
	samples: KitSample[];
	priceMXN: number;
	priceUSD: number;
	active: boolean;
	order?: number;
	createdAt?: number;
	updatedAt?: number;
};

export type KitWithId = Kit & { id: string };

export type KitsMap = Record<string, Kit>;

export const kits = createFirebaseStore<KitsMap>('kits', {});

/** All active kits as array, sorted by order then name */
export const kitsList = derived(kits, ($kits) => {
	if (!$kits.data) return [];
	return Object.entries($kits.data)
		.filter(([, k]) => k.active)
		.sort(([, a], [, b]) => {
			const ao = a.order ?? 0;
			const bo = b.order ?? 0;
			if (ao !== bo) return ao - bo;
			return a.name.localeCompare(b.name);
		})
		.map(([id, kit]) => ({ id, ...kit }));
});

/** All kits including inactive */
export const allKitsList = derived(kits, ($kits) => {
	if (!$kits.data) return [];
	return Object.entries($kits.data)
		.sort(([, a], [, b]) => {
			const ao = a.order ?? 0;
			const bo = b.order ?? 0;
			if (ao !== bo) return ao - bo;
			return a.name.localeCompare(b.name);
		})
		.map(([id, kit]) => ({ id, ...kit }));
});

/** Kits stats */
export const kitsStats = derived(kitsList, ($kits) => ({
	total: $kits.length,
	totalSamples: $kits.reduce((s, k) => s + (k.samples?.length || 0), 0),
}));

/** All genres from kits */
export const kitGenres = derived(kitsList, ($kits) => {
	const set = new Set<string>();
	for (const k of $kits) {
		if (k.genre) set.add(k.genre);
	}
	return Array.from(set).sort();
});

/** Create a new kit */
export async function createKit(kit: Omit<Kit, 'createdAt' | 'updatedAt'>): Promise<string | null> {
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		const token = await auth?.currentUser?.getIdToken();
		const { FIREBASE_DB } = await import('$lib/firebaseDb');
		const authParam = token ? `?auth=${token}` : '';

		const resp = await fetch(`${FIREBASE_DB}/kits.json${authParam}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...kit, createdAt: Date.now(), updatedAt: Date.now() }),
		});
		const data = await resp.json();
		return data.name || null;
	} catch {
		return null;
	}
}

/** Create a new kit with a specific ID (PUT instead of POST) */
export async function createKitWithId(id: string, kit: Omit<Kit, 'createdAt' | 'updatedAt'>): Promise<boolean> {
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		const token = await auth?.currentUser?.getIdToken(true);
		if (!token) return false;
		const { FIREBASE_DB } = await import('$lib/firebaseDb');

		const resp = await fetch(`${FIREBASE_DB}/kits/${id}.json?auth=${token}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...kit, createdAt: Date.now(), updatedAt: Date.now() }),
		});
		return resp.ok;
	} catch {
		return false;
	}
}

/** Update an existing kit */
export async function updateKit(id: string, patch: Partial<Kit>): Promise<boolean> {
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		const token = await auth?.currentUser?.getIdToken();
		const { FIREBASE_DB } = await import('$lib/firebaseDb');
		const authParam = token ? `?auth=${token}` : '';

		await fetch(`${FIREBASE_DB}/kits/${id}.json${authParam}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...patch, updatedAt: Date.now() }),
		});
		return true;
	} catch {
		return false;
	}
}

/** Delete a kit */
export async function deleteKit(id: string): Promise<boolean> {
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		const token = await auth?.currentUser?.getIdToken();
		const { FIREBASE_DB } = await import('$lib/firebaseDb');
		const authParam = token ? `?auth=${token}` : '';

		await fetch(`${FIREBASE_DB}/kits/${id}.json${authParam}`, {
			method: 'DELETE',
		});
		return true;
	} catch {
		return false;
	}
}

/** Empty kit template */
export function emptyKit(): Kit {
	return {
		name: '',
		genre: 'Trap',
		imageUrl: '',
		samples: [],
		priceMXN: 350,
		priceUSD: 20,
		active: true,
	};
}
