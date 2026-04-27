/**
 * Playlists store — user-created beat collections in Firebase RTDB.
 *
 * Structure:
 *   userPlaylists/{uid}/{playlistId}: { name, description, beatIds, createdAt, updatedAt }
 */

import { writable, derived } from 'svelte/store';

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

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
let _token: string | null = null;

const playlistsStore = writable<Playlist[]>([]);

async function authHeaders(): Promise<HeadersInit> {
	const headers: HeadersInit = { 'Content-Type': 'application/json' };
	if (_token) headers['Authorization'] = `Bearer ${_token}`;
	return headers;
}

async function firebaseUrl(path: string): Promise<string> {
	const auth = _token ? `?auth=${_token}` : '';
	return `${FIREBASE_DB}/${path}${auth}`;
}

/** Initialize playlists for authenticated user */
export async function initPlaylists(uid: string | null) {
	_uid = uid;
	if (!uid) {
		playlistsStore.set([]);
		return;
	}

	// Get token for authenticated requests
	try {
		const { getAuthInstance } = await import('$lib/firebase');
		const auth = await getAuthInstance();
		if (auth?.currentUser) {
			_token = await auth.currentUser.getIdToken();
		}
	} catch { /* silent */ }

	try {
		const url = await firebaseUrl(`userPlaylists/${uid}`);
		const resp = await fetch(url);
		if (resp.ok) {
			const data = await resp.json();
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
		}
	} catch (err) {
		console.error('[Playlists] Load failed:', err);
	}
}

/** Create a new playlist */
export async function createPlaylist(input: PlaylistInput): Promise<Playlist | null> {
	if (!_uid) return null;

	const now = Date.now();
	const playlist = {
		name: input.name.trim(),
		description: (input.description || '').trim(),
		beatIds: [],
		createdAt: now,
		updatedAt: now,
	};

	try {
		const url = await firebaseUrl(`userPlaylists/${_uid}`);
		const resp = await fetch(url, {
			method: 'POST',
			headers: await authHeaders(),
			body: JSON.stringify(playlist),
		});

		if (resp.ok) {
			const { name: id } = await resp.json();
			const newPlaylist: Playlist = { ...playlist, id };
			playlistsStore.update(p => [newPlaylist, ...p]);
			return newPlaylist;
		}
	} catch (err) {
		console.error('[Playlists] Create failed:', err);
	}
	return null;
}

/** Delete a playlist */
export async function deletePlaylist(playlistId: string): Promise<boolean> {
	if (!_uid) return false;

	try {
		const url = await firebaseUrl(`userPlaylists/${_uid}/${playlistId}`);
		const resp = await fetch(url, { method: 'DELETE', headers: await authHeaders() });
		if (resp.ok) {
			playlistsStore.update(p => p.filter(pl => pl.id !== playlistId));
			return true;
		}
	} catch (err) {
		console.error('[Playlists] Delete failed:', err);
	}
	return false;
}

/** Add a beat to a playlist */
export async function addToPlaylist(playlistId: string, beatId: string): Promise<boolean> {
	if (!_uid) return false;

	try {
		const url = await firebaseUrl(`userPlaylists/${_uid}/${playlistId}/beatIds`);
		// Fetch current beatIds, append, write back
		const currentResp = await fetch(url.replace('?auth=', '?auth='));
		let beatIds: string[] = [];
		if (currentResp.ok) {
			const data = await currentResp.json();
			beatIds = data || [];
		}
		if (beatIds.includes(beatId)) return true; // Already there

		beatIds.push(beatId);
		const resp = await fetch(url, {
			method: 'PUT',
			headers: await authHeaders(),
			body: JSON.stringify(beatIds),
		});

		if (resp.ok) {
			playlistsStore.update(playlists =>
				playlists.map(p =>
					p.id === playlistId
						? { ...p, beatIds, updatedAt: Date.now() }
						: p
				)
			);
			return true;
		}
	} catch (err) {
		console.error('[Playlists] Add beat failed:', err);
	}
	return false;
}

/** Remove a beat from a playlist */
export async function removeFromPlaylist(playlistId: string, beatId: string): Promise<boolean> {
	if (!_uid) return false;

	try {
		const url = await firebaseUrl(`userPlaylists/${_uid}/${playlistId}/beatIds`);
		const currentResp = await fetch(url);
		let beatIds: string[] = [];
		if (currentResp.ok) {
			const data = await currentResp.json();
			beatIds = (data || []).filter((id: string) => id !== beatId);
		}

		const resp = await fetch(url, {
			method: 'PUT',
			headers: await authHeaders(),
			body: JSON.stringify(beatIds),
		});

		if (resp.ok) {
			playlistsStore.update(playlists =>
				playlists.map(p =>
					p.id === playlistId
						? { ...p, beatIds, updatedAt: Date.now() }
						: p
				)
			);
			return true;
		}
	} catch (err) {
		console.error('[Playlists] Remove beat failed:', err);
	}
	return false;
}

export const playlists = { subscribe: playlistsStore.subscribe };
