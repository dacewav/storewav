/**
 * Contract Templates Store — Firebase-backed custom contract templates.
 * Stores admin-edited contract text per license type.
 * Falls back to original .md if no custom template exists.
 */

import { writable, get } from 'svelte/store';

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

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
			try {
				const resp = await fetch(`${FIREBASE_DB}/contractTemplates.json`);
				if (resp.ok) {
					const data = await resp.json();
					set(data || {});
				}
			} catch (err) {
				console.error('[ContractTemplates] Load failed:', err);
			}
		},

		/** Get a specific template (returns null if no custom template) */
		async getTemplate(contractFile: string): Promise<string | null> {
			try {
				const resp = await fetch(`${FIREBASE_DB}/contractTemplates/${contractFile}.json`);
				if (resp.ok) {
					const data = await resp.json() as ContractTemplateData | null;
					return data?.text || null;
				}
			} catch (err) {
				console.error('[ContractTemplates] Get failed:', err);
			}
			return null;
		},

		/** Save a custom template to Firebase */
		async save(contractFile: string, text: string): Promise<boolean> {
			try {
				const data: ContractTemplateData = {
					text,
					updatedAt: Date.now(),
					updatedBy: 'admin',
				};
				const resp = await fetch(`${FIREBASE_DB}/contractTemplates/${contractFile}.json`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});
				if (resp.ok) {
					// Update local store
					const current = get({ subscribe });
					set({ ...current, [contractFile]: data });
					return true;
				}
			} catch (err) {
				console.error('[ContractTemplates] Save failed:', err);
			}
			return false;
		},

		/** Delete a custom template (reset to original) */
		async reset(contractFile: string): Promise<boolean> {
			try {
				const resp = await fetch(`${FIREBASE_DB}/contractTemplates/${contractFile}.json`, {
					method: 'DELETE',
				});
				if (resp.ok) {
					const current = get({ subscribe });
					const next = { ...current };
					delete next[contractFile];
					set(next);
					return true;
				}
			} catch (err) {
				console.error('[ContractTemplates] Reset failed:', err);
			}
			return false;
		},
	};
}

export const contractTemplates = createContractTemplatesStore();
