/**
 * Playlists store — user-created beat collections in Firebase RTDB.
 *
 * Structure:
 *   userPlaylists/{uid}/{playlistId}: { name, description, beatIds, createdAt, updatedAt }
 *
 * Uses Firebase SDK for all operations (reliable auth, no stale tokens).
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type Playlist = {
	id: string;
	name: string;
	description: string;
	beatIds: string[];
	createdAt: number;
	updatedAt: number;
};

export type PlaylistInput = {
	name: string;
	description?: string;
};

let _uid: string | null = null;
const playlistsStore = writable<Playlist[]>([]);

/** Initialize playlists for authenticated user */
export async function initPlaylists(uid: string | null) {
	_uid = uid;
	if (!uid || !browser) {
		playlistsStore.set([]);
		return;
	}

	try {
		const { getDatabase, ref, onValue } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const playlistsRef = ref(db, `userPlaylists/${uid}`);

		onValue(playlistsRef, (snap) => {
			const data = snap.val();
			if (data) {
				const playlists = Object.entries(data).map(([id, p]: [string, any]) => ({
					id,
					name: p.name || 'Untitled',
					description: p.description || '',
					beatIds: p.beatIds || [],
					createdAt: p.createdAt || 0,
					updatedAt: p.updatedAt || 0,
				}));
				playlistsStore.set(playlists.sort((a, b) => b.updatedAt - a.updatedAt));
			} else {
				playlistsStore.set([]);
			}
		}, (err) => {
			console.error('[Playlists] Realtime sync error:', err);
		});
	} catch (err) {
		console.error('[Playlists] Load failed:', err);
	}
}

/** Create a new playlist */
export async function createPlaylist(input: PlaylistInput): Promise<Playlist | null> {
	if (!_uid || !browser) return null;

	const now = Date.now();
	const playlist = {
		name: input.name.trim(),
		description: (input.description || '').trim(),
		beatIds: [],
		createdAt: now,
		updatedAt: now,
	};

	try {
		const { getDatabase, ref, push, set } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const newRef = push(ref(db, `userPlaylists/${_uid}`));
		await set(newRef, playlist);

		const newPlaylist: Playlist = { ...playlist, id: newRef.key! };
		playlistsStore.update(p => [newPlaylist, ...p]);
		return newPlaylist;
	} catch (err) {
		console.error('[Playlists] Create failed:', err);
	}
	return null;
}

/** Delete a playlist */
export async function deletePlaylist(playlistId: string): Promise<boolean> {
	if (!_uid || !browser) return false;

	try {
		const { getDatabase, ref, remove } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		await remove(ref(db, `userPlaylists/${_uid}/${playlistId}`));
		playlistsStore.update(p => p.filter(pl => pl.id !== playlistId));
		return true;
	} catch (err) {
		console.error('[Playlists] Delete failed:', err);
	}
	return false;
}

/** Add a beat to a playlist */
export async function addToPlaylist(playlistId: string, beatId: string): Promise<boolean> {
	if (!_uid || !browser) return false;

	try {
		const { getDatabase, ref, get, set } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const beatIdsRef = ref(db, `userPlaylists/${_uid}/${playlistId}/beatIds`);

		// Fetch current beatIds
		const snap = await get(beatIdsRef);
		let beatIds: string[] = snap.val() || [];
		if (beatIds.includes(beatId)) return true; // Already there

		beatIds.push(beatId);
		await set(beatIdsRef, beatIds);

		playlistsStore.update(playlists =>
			playlists.map(p =>
				p.id === playlistId
					? { ...p, beatIds, updatedAt: Date.now() }
					: p
			)
		);
		return true;
	} catch (err) {
		console.error('[Playlists] Add beat failed:', err);
	}
	return false;
}

/** Remove a beat from a playlist */
export async function removeFromPlaylist(playlistId: string, beatId: string): Promise<boolean> {
	if (!_uid || !browser) return false;

	try {
		const { getDatabase, ref, get, set } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const db = getDatabase(getApp());
		const beatIdsRef = ref(db, `userPlaylists/${_uid}/${playlistId}/beatIds`);

		const snap = await get(beatIdsRef);
		const beatIds: string[] = (snap.val() || []).filter((id: string) => id !== beatId);

		await set(beatIdsRef, beatIds);

		playlistsStore.update(playlists =>
			playlists.map(p =>
				p.id === playlistId
					? { ...p, beatIds, updatedAt: Date.now() }
					: p
			)
		);
		return true;
	} catch (err) {
		console.error('[Playlists] Remove beat failed:', err);
	}
	return false;
}

export const playlists = { subscribe: playlistsStore.subscribe };
