/**
 * Changelog — tracks admin changes for audit/history
 *
 * Firebase path: changelog/
 * Structure: { [id]: { date, action, field, oldValue, newValue, user } }
 */

import { writable, get } from 'svelte/store';
import { ref, onValue, set, push, query, orderByChild, limitToLast } from 'firebase/database';
import { getDb } from '$lib/firebase';

export type ChangelogEntry = {
	id: string;
	date: number;
	action: 'update' | 'create' | 'delete' | 'restore';
	field: string;
	oldValue?: string;
	newValue?: string;
	user?: string;
};

function createChangelogStore() {
	const entries = writable<ChangelogEntry[]>([]);
	let _unsub: (() => void) | null = null;
	let _initialized = false;

	async function init() {
		if (_initialized) return;
		_initialized = true;
		try {
			const db = await getDb();
			if (!db) return;
			const q = query(ref(db, 'changelog'), orderByChild('date'), limitToLast(100));
			_unsub = onValue(q, (snap) => {
				const val = snap.val();
				if (!val || typeof val !== 'object') {
					entries.set([]);
					return;
				}
				const list: ChangelogEntry[] = Object.entries(val)
					.map(([id, data]: [string, any]) => ({
						id,
						date: data.date ?? 0,
						action: data.action ?? 'update',
						field: data.field ?? '',
						oldValue: data.oldValue,
						newValue: data.newValue,
						user: data.user
					}))
					.sort((a, b) => b.date - a.date);
				entries.set(list);
			});
		} catch (e) {
			console.warn('[Changelog] Firebase not available:', e);
		}
	}

	async function log(entry: Omit<ChangelogEntry, 'id' | 'date'>): Promise<void> {
		try {
			const db = await getDb();
			if (!db) return;
			const newRef = push(ref(db, 'changelog'));
			await set(newRef, {
				...entry,
				date: Date.now()
			});
		} catch (e) {
			// Non-critical — don't break the app
			console.warn('[Changelog] Log failed:', e);
		}
	}

	function destroy() {
		_unsub?.();
		_unsub = null;
		_initialized = false;
	}

	return {
		subscribe: entries.subscribe,
		init,
		log,
		destroy
	};
}

export const changelog = createChangelogStore();
export const initChangelog = () => changelog.init();
export const destroyChangelog = () => changelog.destroy();
