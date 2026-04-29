/**
 * Recently Played — tracks last N beats played by the user
 * Stored in localStorage (per-device, no auth needed)
 */

import { writable } from 'svelte/store';

export type RecentBeat = {
	id: string;
	name: string;
	artist: string;
	imageUrl: string;
	genre: string;
	playedAt: number;
};

const STORAGE_KEY = 'dacewav-recently-played';
const MAX_ITEMS = 12;

function loadFromStorage(): RecentBeat[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveToStorage(items: RecentBeat[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

const store = writable<RecentBeat[]>(loadFromStorage());

function addRecent(beat: { id: string; name: string; artist: string; imageUrl: string; genre: string }) {
	store.update(items => {
		// Remove if already exists
		const filtered = items.filter(b => b.id !== beat.id);
		// Add to front
		const updated = [
			{ ...beat, playedAt: Date.now() },
			...filtered
		].slice(0, MAX_ITEMS);
		saveToStorage(updated);
		return updated;
	});
}

function clearRecent() {
	store.set([]);
	saveToStorage([]);
}

export const recentlyPlayed = {
	subscribe: store.subscribe,
	add: addRecent,
	clear: clearRecent
};
