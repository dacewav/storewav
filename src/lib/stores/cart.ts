/**
 * Cart store — localStorage-backed shopping cart for beat licenses
 *
 * Each cart item = 1 beat + 1 selected license.
 * Cart persists across sessions via localStorage.
 *
 * Usage:
 *   cart.add({ beatId, beatName, imageUrl, licenseName, licenseIndex, priceMXN, priceUSD });
 *   cart.remove(beatId);
 *   cart.clear();
 */

import { writable, derived } from 'svelte/store';

export type CartItem = {
	beatId: string;
	beatName: string;
	imageUrl: string;
	licenseName: string;
	licenseIndex: number;
	priceMXN: number;
	priceUSD: number;
	addedAt: number;
};

const STORAGE_KEY = 'dacewav-cart';

function loadCart(): CartItem[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		// Storage full or unavailable — silent fail
	}
}

function createCartStore() {
	const items = writable<CartItem[]>(loadCart());

	// Persist on every change
	items.subscribe((value) => {
		saveCart(value);
	});

	function add(item: Omit<CartItem, 'addedAt'>) {
		items.update((current) => {
			// Replace if same beat+license already in cart
			const filtered = current.filter(
				(i) => !(i.beatId === item.beatId && i.licenseIndex === item.licenseIndex)
			);
			return [...filtered, { ...item, addedAt: Date.now() }];
		});
	}

	function remove(beatId: string, licenseIndex?: number) {
		items.update((current) => {
			if (licenseIndex !== undefined) {
				return current.filter(
					(i) => !(i.beatId === beatId && i.licenseIndex === licenseIndex)
				);
			}
			return current.filter((i) => i.beatId !== beatId);
		});
	}

	function clear() {
		items.set([]);
	}

	function isInCart(beatId: string, licenseIndex?: number) {
		return derived(items, ($items) => {
			if (licenseIndex !== undefined) {
				return $items.some(
					(i) => i.beatId === beatId && i.licenseIndex === licenseIndex
				);
			}
			return $items.some((i) => i.beatId === beatId);
		});
	}

	return {
		subscribe: items.subscribe,
		add,
		remove,
		clear,
		isInCart
	};
}

export const cart = createCartStore();

/** Total items count */
export const cartCount = derived(cart, ($cart) => $cart.length);

/** Total price in MXN */
export const cartTotalMXN = derived(cart, ($cart) =>
	$cart.reduce((sum, i) => sum + i.priceMXN, 0)
);

/** Total price in USD */
export const cartTotalUSD = derived(cart, ($cart) =>
	$cart.reduce((sum, i) => sum + i.priceUSD, 0)
);
