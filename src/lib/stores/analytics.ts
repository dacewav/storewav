/**
 * Analytics store — batched events → Firebase
 *
 * Acumula eventos en memoria y los escribe a Firebase en batch.
 * Schema match deployed rules: analytics/events/{date}/{eventId} → { ts, cat, act, lbl, val, meta }
 *
 * Uso: analytics.track('beat_play', { beatId: 'xyz' });
 */

import { getDb } from '$lib/firebase';

type AnalyticsEvent = {
	ts: number;
	cat: string;
	act: string;
	lbl?: string;
	val?: number;
	meta?: string;
};

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30_000; // 30s
const MAX_QUEUE_SIZE = 50; // Drop oldest if exceeded

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

/** Get today's date key for path partitioning */
function todayKey(): string {
	return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function flush() {
	if (queue.length === 0) return;

	const batch = queue.splice(0, BATCH_SIZE);

	try {
		const db = await getDb();
		if (!db) return;

		const { ref, push } = await import('firebase/database');
		const dateKey = todayKey();
		const eventsRef = ref(db, `analytics/events/${dateKey}`);

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
	/**
	 * Registrar un evento.
	 * @param cat - Categoría (ej: 'beat', 'license', 'wishlist', 'ui')
	 * @param act - Acción (ej: 'play', 'select', 'toggle', 'click')
	 * @param opts - Opciones adicionales
	 */
	track(cat: string, act: string, opts?: { lbl?: string; val?: number; meta?: string }) {
		queue.push({
			ts: Date.now(),
			cat,
			act,
			...(opts?.lbl && { lbl: opts.lbl }),
			...(opts?.val !== undefined && { val: opts.val }),
			...(opts?.meta && { meta: opts.meta })
		});

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
