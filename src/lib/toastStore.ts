import { writable } from 'svelte/store';

export type ToastType = 'default' | 'success' | 'error' | 'warning';

export interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
	duration: number;
}

let nextId = 0;
const MAX_TOASTS = 5;
const pendingTimers = new Map<number, ReturnType<typeof setTimeout>>();

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	return {
		subscribe,
		add(message: string, type: ToastType = 'default', duration = 2800) {
			const id = ++nextId;
			update((toasts) => {
				// Cap max visible toasts — remove oldest if exceeded
				const list = toasts.length >= MAX_TOASTS ? toasts.slice(-(MAX_TOASTS - 1)) : toasts;
				return [...list, { id, message, type, duration }];
			});
			if (duration > 0) {
				const timer = setTimeout(() => {
					pendingTimers.delete(id);
					update((toasts) => toasts.filter((t) => t.id !== id));
				}, duration);
				pendingTimers.set(id, timer);
			}
			return id;
		},
		remove(id: number) {
			const timer = pendingTimers.get(id);
			if (timer) {
				clearTimeout(timer);
				pendingTimers.delete(id);
			}
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		clear() {
			for (const timer of pendingTimers.values()) {
				clearTimeout(timer);
			}
			pendingTimers.clear();
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
