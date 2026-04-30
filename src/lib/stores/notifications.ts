/**
 * Notifications store — Firebase-backed, per-user.
 *
 * Types: wishlist_discount, new_beat, price_change
 * Each notification has: id, type, title, message, beatId?, read, createdAt
 *
 * Uses Firebase SDK (not REST) for reliable auth + automatic token refresh.
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type NotificationType = 'wishlist_discount' | 'new_beat' | 'price_change' | 'system';

export type Notification = {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	beatId?: string;
	read: boolean;
	createdAt: number;
};

let currentUid: string | null = null;
let _notifications = writable<Notification[]>([]);
let _unsub: (() => void) | null = null;

export const notifications = {
	subscribe: _notifications.subscribe,
};

export const unreadCount = derived(_notifications, ($n) => $n.filter((n) => !n.read).length);

/**
 * Initialize notifications sync for authenticated user.
 * Uses Firebase SDK onValue for real-time sync.
 * Returns a Promise that resolves after the first data load completes.
 */
export async function initNotifications(uid: string | null): Promise<void> {
	// Cleanup previous listener
	if (_unsub) { _unsub(); _unsub = null; }

	currentUid = uid;
	if (!uid || !browser) {
		_notifications.set([]);
		return;
	}

	try {
		const { getDatabase, ref, onValue } = await import('firebase/database');
		const { getApp } = await import('firebase/app');

		const app = getApp();
		const db = getDatabase(app);
		const notifRef = ref(db, `userNotifications/${uid}`);

		// Wait for the first data callback before resolving
		await new Promise<void>((resolve) => {
			let first = true;
			_unsub = onValue(notifRef, (snap) => {
				const val = snap.val();
				if (val) {
					const list = Object.entries(val)
						.map(([id, n]: [string, any]) => ({
							id,
							type: n.type || 'system',
							title: n.title || '',
							message: n.message || '',
							beatId: n.beatId,
							read: n.read ?? false,
							createdAt: n.createdAt || 0,
						}))
						.sort((a, b) => b.createdAt - a.createdAt);
					_notifications.set(list);
				} else {
					_notifications.set([]);
				}
				if (first) { first = false; resolve(); }
			}, (err) => {
				console.error('[Notifications] Realtime sync error:', err);
				if (first) { first = false; resolve(); }
			});
		});
	} catch (err) {
		console.error('[Notifications] Init failed:', err);
	}
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string) {
	if (!currentUid || !browser) return;

	// Optimistic update
	_notifications.update((list) =>
		list.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
	);

	try {
		const { getDatabase, ref, update } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());
		await update(ref(db, `userNotifications/${currentUid}/${notificationId}`), { read: true });
	} catch (err) {
		console.error('[Notifications] Mark read failed:', err);
	}
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead() {
	if (!currentUid || !browser) return;

	const unreadIds: string[] = [];
	_notifications.subscribe((list) => {
		for (const n of list) {
			if (!n.read) unreadIds.push(n.id);
		}
	})();

	// Optimistic update
	_notifications.update((list) => list.map((n) => ({ ...n, read: true })));

	try {
		const { getDatabase, ref, update } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());

		const updates: Record<string, unknown> = {};
		for (const id of unreadIds) {
			updates[`userNotifications/${currentUid}/${id}/read`] = true;
		}
		await update(ref(db), updates);
	} catch (err) {
		console.error('[Notifications] Mark all read failed:', err);
	}
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: string) {
	if (!currentUid || !browser) return;

	_notifications.update((list) => list.filter((n) => n.id !== notificationId));

	try {
		const { getDatabase, ref, remove } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());
		await remove(ref(db, `userNotifications/${currentUid}/${notificationId}`));
	} catch (err) {
		console.error('[Notifications] Delete failed:', err);
	}
}

/**
 * Send a notification to a specific user (admin use).
 * Uses Firebase SDK — works with admin auth context.
 */
export async function sendNotification(
	targetUid: string,
	notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
): Promise<string | null> {
	try {
		const { getDatabase, ref, push, set } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());

		const newRef = push(ref(db, `userNotifications/${targetUid}`));
		await set(newRef, {
			...notification,
			read: false,
			createdAt: Date.now(),
		});
		return newRef.key;
	} catch (err) {
		console.error('[Notifications] Send failed:', err);
		return null;
	}
}

/**
 * Broadcast notification to all users with a specific beat in wishlist.
 * Admin use: when a beat gets a discount, notify users who wishlisted it.
 */
export async function notifyWishlistDiscount(
	beatId: string,
	beatName: string,
	discountPercent: number
): Promise<number> {
	try {
		const { getDatabase, ref, get } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());

		const wishSnap = await get(ref(db, 'userWishlist'));
		const allWishlists = wishSnap.val() as Record<string, Record<string, unknown>> | null;
		if (!allWishlists) return 0;

		const uids = Object.entries(allWishlists)
			.filter(([, wishlist]) => beatId in wishlist)
			.map(([uid]) => uid);

		let sent = 0;
		for (const uid of uids) {
			const result = await sendNotification(uid, {
				type: 'wishlist_discount',
				title: '🔥 ¡Descuento en tu wishlist!',
				message: `${beatName} tiene ${discountPercent}% de descuento por tiempo limitado.`,
				beatId,
			});
			if (result) sent++;
		}

		return sent;
	} catch (err) {
		console.error('[Notifications] Wishlist discount broadcast failed:', err);
		return 0;
	}
}

/**
 * Broadcast: new beat added.
 */
export async function notifyNewBeat(beatId: string, beatName: string): Promise<number> {
	try {
		const { getDatabase, ref, get } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());

		const usersSnap = await get(ref(db, 'users'));
		const users = usersSnap.val() as Record<string, unknown> | null;
		if (!users) return 0;

		let sent = 0;
		for (const uid of Object.keys(users)) {
			const result = await sendNotification(uid, {
				type: 'new_beat',
				title: '🎵 Nuevo beat disponible',
				message: `"${beatName}" acaba de salir. ¡Escúchalo antes que nadie!`,
				beatId,
			});
			if (result) sent++;
		}

		return sent;
	} catch (err) {
		console.error('[Notifications] New beat broadcast failed:', err);
		return 0;
	}
}

/**
 * Notify users who wishlisted a beat about price change.
 */
export async function notifyPriceChange(
	beatId: string,
	beatName: string,
	oldPrice: number,
	newPrice: number
): Promise<number> {
	const direction = newPrice < oldPrice ? 'bajó' : 'subió';
	const emoji = newPrice < oldPrice ? '📉' : '📈';

	try {
		const { getDatabase, ref, get } = await import('firebase/database');
		const { getApp } = await import('firebase/app');
		const db = getDatabase(getApp());

		const wishSnap = await get(ref(db, 'userWishlist'));
		const allWishlists = wishSnap.val() as Record<string, Record<string, unknown>> | null;
		if (!allWishlists) return 0;

		const uids = Object.entries(allWishlists)
			.filter(([, wishlist]) => beatId in wishlist)
			.map(([uid]) => uid);

		let sent = 0;
		for (const uid of uids) {
			const result = await sendNotification(uid, {
				type: 'price_change',
				title: `${emoji} Precio actualizado`,
				message: `${beatName} ${direction} de $${oldPrice} a $${newPrice} MXN.`,
				beatId,
			});
			if (result) sent++;
		}

		return sent;
	} catch (err) {
		console.error('[Notifications] Price change broadcast failed:', err);
		return 0;
	}
}

/** Cleanup on logout */
export function destroyNotifications() {
	if (_unsub) { _unsub(); _unsub = null; }
	currentUid = null;
	_notifications.set([]);
}
