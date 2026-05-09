import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { FIREBASE_DB } from '$lib/firebaseDb';

/**
 * GET /verify/[hash]
 * Verifies a contract by its verification hash.
 * Looks up the hash index in Firebase and returns contract details.
 */

export const GET: RequestHandler = async ({ params }) => {
	const { hash } = params;

	if (!hash || !/^[A-F0-9]{16}$/.test(hash)) {
		return json({ ok: false, error: 'Hash inválido — debe ser 16 caracteres hexadecimales' }, { status: 400 });
	}

	try {
		// Look up hash index
		const indexResp = await fetch(`${FIREBASE_DB}/contractHashes/${hash}.json`);
		if (!indexResp.ok) {
			return json({ ok: false, error: 'Error al buscar contrato' }, { status: 502 });
		}

		const indexData = await indexResp.json() as { contractId?: string } | null;
		if (!indexData?.contractId) {
			return json({ ok: false, error: 'Contrato no encontrado', verified: false }, { status: 404 });
		}

		// Fetch full contract
		const contractResp = await fetch(`${FIREBASE_DB}/contracts/${indexData.contractId}.json`);
		if (!contractResp.ok) {
			return json({ ok: false, error: 'Error al obtener contrato' }, { status: 502 });
		}

		const contract = await contractResp.json() as {
			orderId?: string;
			beatName?: string;
			licenseName?: string;
			buyerName?: string;
			buyerEmail?: string;
			verificationHash?: string;
			createdAt?: number;
		} | null;

		if (!contract) {
			return json({ ok: false, error: 'Contrato no encontrado', verified: false }, { status: 404 });
		}

		// Verify hash matches
		if (contract.verificationHash !== hash) {
			return json({ ok: false, error: 'Hash no coincide', verified: false }, { status: 400 });
		}

		return json({
			ok: true,
			verified: true,
			contract: {
				orderId: contract.orderId,
				beatName: contract.beatName,
				licenseName: contract.licenseName,
				buyerName: contract.buyerName,
				createdAt: contract.createdAt,
			},
		});
	} catch (err) {
		console.error('[Verify] Error:', err);
		return json({ ok: false, error: 'Error del servidor' }, { status: 500 });
	}
};
