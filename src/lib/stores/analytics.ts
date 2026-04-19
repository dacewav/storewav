/**
 * Analytics store — batched events → Firebase
 *
 * Acumula eventos en memoria y los escribe a Firebase en batch.
 * Uso: analytics.track('beat_play', { beatId: 'xyz' });
 */

import { getDb } from '$lib/firebase';

type AnalyticsEvent = {
	name: string;
	data: Record<string, unknown>;
	timestamp: number;
};

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30_000; // 30s
const MAX_QUEUE_SIZE = 50; // Drop oldest if exceeded

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flush() {
	if (queue.length === 0) return;

	const batch = queue.splice(0, BATCH_SIZE);

	try {
		const db = await getDb();
		if (!db) return;

		const { ref, push } = await import('firebase/database');
		const eventsRef = ref(db, 'analytics/events');

		for (const event of batch) {
			await push(eventsRef, event);
		}
	} catch {
		// Silencioso — analytics no debe romper la app
		// Re-encolar eventos fallidos
		queue.unshift(...batch);
	}
}

function startFlushing() {
	if (flushTimer) return;
	flushTimer = setInterval(flush, FLUSH_INTERVAL);
}

function stopFlushing() {
	if (flushTimer) {
		clearInterval(flushTimer);
		flushTimer = null;
	}
	// Flush final
	flush();
}

export const analytics = {
	/** Registrar un evento */
	track(name: string, data: Record<string, unknown> = {}) {
		queue.push({ name, data, timestamp: Date.now() });

		// Cap queue — drop oldest events if over limit
		if (queue.length > MAX_QUEUE_SIZE) {
			queue = queue.slice(-MAX_QUEUE_SIZE);
		}

		// Flush si acumula mucho
		if (queue.length >= BATCH_SIZE) {
			flush();
		}

		// Iniciar timer si no está corriendo
		startFlushing();
	},

	/** Flush manual (ej: antes de navegar) */
	flush,

	/** Limpiar */
	destroy() {
		stopFlushing();
		queue = [];
	}
};
