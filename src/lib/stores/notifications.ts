/**
 * Notifications store — Firebase-backed, per-user.
 *
 * Types: wishlist_discount, new_beat, price_change
 * Each notification has: id, type, title, message, beatId?, read, createdAt
 */

import { writable, derived } from 'svelte/store';

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

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

export const notifications = {
	subscribe: _notifications.subscribe,
};

export const unreadCount = derived(_notifications, ($n) => $n.filter((n) => !n.read).length);

/**
 * Initialize notifications sync for authenticated user.
 */
export async function initNotifications(uid: string | null) {
	currentUid = uid;
	if (!uid) {
		_notifications.set([]);
		return;
	}

	try {
		const resp = await fetch(`${FIREBASE_DB}/userNotifications/${uid}.json`);
		const data = await resp.json() as Record<string, Omit<Notification, 'id'>> | null;

		if (data) {
			const list = Object.entries(data)
				.map(([id, n]) => ({ ...n, id }))
				.sort((a, b) => b.createdAt - a.createdAt);
			_notifications.set(list);
		} else {
			_notifications.set([]);
		}
	} catch (err) {
		console.error('[Notifications] Load failed:', err);
	}
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string) {
	if (!currentUid) return;

	_notifications.update((list) =>
		list.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
	);

	try {
		await fetch(`${FIREBASE_DB}/userNotifications/${currentUid}/${notificationId}/read.json`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(true),
		});
	} catch (err) {
		console.error('[Notifications] Mark read failed:', err);
	}
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead() {
	if (!currentUid) return;

	// Get IDs of unread notifications before updating
	const unreadIds: string[] = [];
	_notifications.subscribe((list) => {
		for (const n of list) {
			if (!n.read) unreadIds.push(n.id);
		}
	})();

	_notifications.update((list) => list.map((n) => ({ ...n, read: true })));

	try {
		for (const id of unreadIds) {
			await fetch(`${FIREBASE_DB}/userNotifications/${currentUid}/${id}/read.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(true),
			});
		}
	} catch (err) {
		console.error('[Notifications] Mark all read failed:', err);
	}
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: string) {
	if (!currentUid) return;

	_notifications.update((list) => list.filter((n) => n.id !== notificationId));

	try {
		await fetch(`${FIREBASE_DB}/userNotifications/${currentUid}/${notificationId}.json`, {
			method: 'DELETE',
		});
	} catch (err) {
		console.error('[Notifications] Delete failed:', err);
	}
}

/**
 * Send a notification to a specific user (admin use).
 */
export async function sendNotification(
	targetUid: string,
	notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
) {
	try {
		const resp = await fetch(`${FIREBASE_DB}/userNotifications/${targetUid}.json`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...notification,
				read: false,
				createdAt: Date.now(),
			}),
		});
		const result = await resp.json() as { name?: string };
		return result.name ?? null; // Firebase push ID
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
) {
	try {
		// Get all wishlists to find users who have this beat
		const resp = await fetch(`${FIREBASE_DB}/userWishlist.json`);
		const allWishlists = await resp.json() as Record<string, Record<string, unknown>> | null;

		if (!allWishlists) return 0;

		const uids = Object.entries(allWishlists)
			.filter(([, wishlist]) => beatId in wishlist)
			.map(([uid]) => uid);

		// Send notification to each user
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
export async function notifyNewBeat(beatId: string, beatName: string) {
	try {
		// Get all user IDs from users/ node
		const resp = await fetch(`${FIREBASE_DB}/users.json`);
		const users = await resp.json() as Record<string, unknown> | null;

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
) {
	const direction = newPrice < oldPrice ? 'bajó' : 'subió';
	const emoji = newPrice < oldPrice ? '📉' : '📈';

	try {
		const resp = await fetch(`${FIREBASE_DB}/userWishlist.json`);
		const allWishlists = await resp.json() as Record<string, Record<string, unknown>> | null;

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
	currentUid = null;
	_notifications.set([]);
}
