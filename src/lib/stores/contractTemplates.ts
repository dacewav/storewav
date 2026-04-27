/**
 * Contract Templates Store — Firebase-backed custom contract templates.
 * Stores admin-edited contract text per license type.
 * Falls back to original .md if no custom template exists.
 *
 * Uses Firebase SDK for all operations (reliable auth, no stale tokens).
 */

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type ContractTemplateData = {
	text: string;
	updatedAt: number;
	updatedBy: string;
};

export type ContractTemplatesMap = Record<string, ContractTemplateData | null>;

function createContractTemplatesStore() {
	const { subscribe, set } = writable<ContractTemplatesMap>({});

	return {
		subscribe,

		/** Load all custom templates from Firebase */
		async load(): Promise<void> {
			if (!browser) return;
			try {
				const { getDatabase, ref, get } = await import('firebase/database');
				const { getApp } = await import('firebase/app');
				const db = getDatabase(getApp());

				const snap = await get(ref(db, 'contractTemplates'));
				set(snap.val() || {});
			} catch (err) {
				console.error('[ContractTemplates] Load failed:', err);
			}
		},

		/** Get a specific template (returns null if no custom template) */
		async getTemplate(contractFile: string): Promise<string | null> {
			if (!browser) return null;
			try {
				const { getDatabase, ref, get } = await import('firebase/database');
				const { getApp } = await import('firebase/app');
				const db = getDatabase(getApp());

				const snap = await get(ref(db, `contractTemplates/${contractFile}`));
				const data = snap.val() as ContractTemplateData | null;
				return data?.text || null;
			} catch (err) {
				console.error('[ContractTemplates] Get failed:', err);
			}
			return null;
		},

		/** Save a custom template to Firebase */
		async save(contractFile: string, text: string): Promise<boolean> {
			if (!browser) return false;
			try {
				const { getDatabase, ref, set: fbSet } = await import('firebase/database');
				const { getApp } = await import('firebase/app');
				const db = getDatabase(getApp());

				const data: ContractTemplateData = {
					text,
					updatedAt: Date.now(),
					updatedBy: 'admin',
				};
				await fbSet(ref(db, `contractTemplates/${contractFile}`), data);

				// Update local store
				const current = get({ subscribe });
				set({ ...current, [contractFile]: data });
				return true;
			} catch (err) {
				console.error('[ContractTemplates] Save failed:', err);
			}
			return false;
		},

		/** Delete a custom template (reset to original) */
		async reset(contractFile: string): Promise<boolean> {
			if (!browser) return false;
			try {
				const { getDatabase, ref, remove } = await import('firebase/database');
				const { getApp } = await import('firebase/app');
				const db = getDatabase(getApp());

				await remove(ref(db, `contractTemplates/${contractFile}`));

				const current = get({ subscribe });
				const next = { ...current };
				delete next[contractFile];
				set(next);
				return true;
			} catch (err) {
				console.error('[ContractTemplates] Reset failed:', err);
			}
			return false;
		},
	};
}

export const contractTemplates = createContractTemplatesStore();
