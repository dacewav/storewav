import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/download
 * Returns a download URL for a purchased beat.
 * Expects: { orderId, beatId }
 * Verifies the order exists and is paid in Firebase.
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

export const POST: RequestHandler = async ({ request, platform }) => {
	let body: { orderId?: string; beatId?: string };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'Body inválido' }, { status: 400 });
	}

	const { orderId, beatId } = body;

	if (!orderId || !beatId) {
		return json({ ok: false, error: 'Faltan parámetros: orderId y beatId' }, { status: 400 });
	}

	// Verify order exists and is paid
	try {
		const resp = await fetch(`${FIREBASE_DB}/orders/${orderId}.json`);
		if (!resp.ok) {
			return json({ ok: false, error: 'Orden no encontrada' }, { status: 404 });
		}

		const order = await resp.json() as {
			status?: string;
			items?: Array<{ beatId: string }>;
		} | null;

		if (!order || order.status !== 'paid') {
			return json({ ok: false, error: 'Orden no pagada o inexistente' }, { status: 403 });
		}

		// Check beat is in the order
		const hasBeat = order.items?.some(i => i.beatId === beatId);
		if (!hasBeat) {
			return json({ ok: false, error: 'Beat no incluido en esta orden' }, { status: 403 });
		}
	} catch {
		return json({ ok: false, error: 'Error al verificar orden' }, { status: 500 });
	}

	// Get beat data to find the audio URL
	try {
		const beatResp = await fetch(`${FIREBASE_DB}/beats/${beatId}.json`);
		if (!beatResp.ok) {
			return json({ ok: false, error: 'Beat no encontrado' }, { status: 404 });
		}

		const beat = await beatResp.json() as {
			audioUrl?: string;
			name?: string;
		} | null;

		if (!beat?.audioUrl) {
			return json({ ok: false, error: 'Audio no disponible para este beat' }, { status: 404 });
		}

		// The audioUrl is already a direct R2 URL (cdn.dacewav.store/...)
		// For downloads, we append ?download=true or use Content-Disposition
		const downloadUrl = beat.audioUrl;

		return json({
			ok: true,
			downloadUrl,
			beatName: beat.name || 'beat',
		});
	} catch {
		return json({ ok: false, error: 'Error al obtener beat' }, { status: 500 });
	}
};
