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

import { writable, derived, get } from 'svelte/store';

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

/** Sync cart to Firebase for abandonment tracking */
let _syncTimeout: ReturnType<typeof setTimeout> | null = null;

function syncToFirebase(items: CartItem[]) {
	if (_syncTimeout) clearTimeout(_syncTimeout);
	_syncTimeout = setTimeout(async () => {
		if (items.length === 0) return;
		try {
			const { getAuthInstance } = await import('$lib/firebase');
			const auth = await getAuthInstance();
			const user = auth?.currentUser;
			if (!user) return;

			const { getDatabase, ref, set } = await import('firebase/database');
			const { getApp } = await import('firebase/app');
			const db = getDatabase(getApp());

			const data = {
				uid: user.uid,
				email: user.email || '',
				displayName: user.displayName || '',
				items: items.map(i => ({
					beatId: i.beatId,
					beatName: i.beatName,
					licenseName: i.licenseName,
					priceMXN: i.priceMXN,
					priceUSD: i.priceUSD,
				})),
				totalMXN: items.reduce((s, i) => s + i.priceMXN, 0),
				totalUSD: items.reduce((s, i) => s + i.priceUSD, 0),
				lastUpdated: Date.now(),
			};

			await set(ref(db, `abandonedCarts/${user.uid}`), data);
		} catch {
			// Silent fail — don't block cart operations
		}
	}, 2000); // Debounce 2s
}

function createCartStore() {
	const items = writable<CartItem[]>(loadCart());

	// Persist on every change + sync to Firebase
	items.subscribe((value) => {
		saveCart(value);
		syncToFirebase(value);
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

	async function clear() {
		items.set([]);
		// Remove from Firebase abandoned carts
		try {
			const { getAuthInstance } = await import('$lib/firebase');
			const auth = await getAuthInstance();
			const uid = auth?.currentUser?.uid;
			if (uid) {
				const { getDatabase, ref, set } = await import('firebase/database');
				const { getApp } = await import('firebase/app');
				const db = getDatabase(getApp());
				await set(ref(db, `abandonedCarts/${uid}`), null);
			}
		} catch { /* silent */ }
	}

	/** Reset cart — clear items + localStorage. Called on auth account switch. */
	function reset() {
		items.set([]);
		if (typeof localStorage !== 'undefined') {
			try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
		}
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
		reset,
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
