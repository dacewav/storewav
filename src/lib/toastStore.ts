import { writable } from 'svelte/store';

export type ToastType = 'default' | 'success' | 'error' | 'warning';

export interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
	duration: number;
}

let nextId = 0;

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	return {
		subscribe,
		add(message: string, type: ToastType = 'default', duration = 2800) {
			const id = ++nextId;
			update((toasts) => [...toasts, { id, message, type, duration }]);
			if (duration > 0) {
				setTimeout(() => {
					update((toasts) => toasts.filter((t) => t.id !== id));
				}, duration);
			}
			return id;
		},
		remove(id: number) {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		clear() {
			update(() => []);
		}
	};
}

export const toasts = createToastStore();

/** Shorthand helpers */
export const toast = {
	success(msg: string, duration?: number) { return toasts.add(msg, 'success', duration); },
	error(msg: string, duration?: number) { return toasts.add(msg, 'error', duration); },
	warning(msg: string, duration?: number) { return toasts.add(msg, 'warning', duration); },
	show(msg: string, duration?: number) { return toasts.add(msg, 'default', duration); }
};
