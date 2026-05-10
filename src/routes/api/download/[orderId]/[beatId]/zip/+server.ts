import type { RequestHandler } from './$types';
import { generateContractPDF, getContractFile } from '$lib/contractGenerator';
import { zipSync } from 'fflate';
import { FIREBASE_DB } from '$lib/firebaseDb';
import { r2KeyFromUrl, sanitizeFilename } from '$lib/r2Presign';

/**
 * GET /api/download/[orderId]/[beatId]/zip?token=uuid
 * Downloads a zip containing: beat audio + contract PDF.
 * If stems exist in the future, they'll be included too.
 */

// Reuse order cache from parent endpoint
const orderCache = new Map<string, { verified: number; items: Array<{ beatId: string; licenseName: string; beatName?: string; priceMXN: number; priceUSD: number }> }>();
const CACHE_TTL = 5 * 60 * 1000;

/** Verify download token from Firebase (7-day TTL) */
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
async function verifyToken(orderId: string, beatId: string, token: string): Promise<boolean> {
	try {
		const resp = await fetch(`${FIREBASE_DB}/downloadTokens/${orderId}_${beatId}.json`);
		if (!resp.ok) return false;
		const data = await resp.json() as { token?: string; createdAt?: number } | null;
		if (!data || data.token !== token) return false;

		// Check TTL — reject tokens older than 7 days
		if (data.createdAt && Date.now() - data.createdAt > TOKEN_TTL) {
			console.warn(`[Download ZIP] Expired token for ${orderId}/${beatId}`);
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

async function verifyAndGetOrder(orderId: string, beatId: string) {
	const cached = orderCache.get(orderId);
	if (cached && Date.now() - cached.verified < CACHE_TTL) {
		const item = cached.items.find(i => i.beatId === beatId);
		return item ? { verified: true, item, customerEmail: '', customerName: '' } : null;
	}

	try {
		const resp = await fetch(`${FIREBASE_DB}/orders/${orderId}.json`);
		if (!resp.ok) return null;

		const order = await resp.json() as {
			status?: string;
			items?: Array<{ beatId: string; licenseName: string; beatName?: string; priceMXN: number; priceUSD: number }>;
			customerEmail?: string;
			customerName?: string;
		} | null;

		if (!order || order.status !== 'paid') return null;

		const items = order.items ?? [];
		orderCache.set(orderId, { verified: Date.now(), items });

		const item = items.find(i => i.beatId === beatId);
		if (!item) return null;

		return {
			verified: true,
			item,
			customerEmail: order.customerEmail || '',
			customerName: order.customerName || '',
		};
	} catch (err) {
		console.warn(`[Download ZIP] Order verification failed for ${orderId}:`, err);
		return null;
	}
}

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const { orderId, beatId } = params;
	const token = url.searchParams.get('token');

	if (!orderId || !beatId) {
		return new Response('Missing parameters', { status: 400 });
	}

	if (!token) {
		return new Response('Missing download token', { status: 403 });
	}

	// Verify token
	const isTokenValid = await verifyToken(orderId, beatId, token);
	if (!isTokenValid) {
		return new Response('Invalid or expired download token', { status: 403 });
	}

	// Verify order and get item details
	const orderData = await verifyAndGetOrder(orderId, beatId);
	if (!orderData?.verified) {
		return new Response('Unauthorized — order not paid or beat not in order', { status: 403 });
	}

	const { item, customerEmail, customerName } = orderData;

	// 1. Fetch beat audio + stems
	let audioData: Uint8Array | null = null;
	let stemsData: Uint8Array | null = null;
	let audioFilename = 'beat.mp3';
	let stemsFilename = 'stems.zip';

	try {
		const beatResp = await fetch(`${FIREBASE_DB}/beats/${beatId}.json`);
		if (beatResp.ok) {
			const beat = await beatResp.json() as {
				audioUrl?: string;
				name?: string;
				bpm?: number;
				key?: string;
				genre?: string;
				stemsUrl?: string;
			} | null;

			const r2 = platform?.env?.MEDIA;

			if (beat?.audioUrl) {
				audioFilename = `${sanitizeFilename(beat.name || item.beatName || 'beat')}.mp3`;

				// Try R2 binding first
				if (r2) {
					const key = r2KeyFromUrl(beat.audioUrl);
					if (key) {
						for (const tryKey of [key, `/${key}`]) {
							try {
								const obj = await r2.get(tryKey);
								if (obj) {
									const buffer = await obj.arrayBuffer();
									audioData = new Uint8Array(buffer);
									break;
								}
							} catch { /* try next key */ }
						}
					}
				}

				// Fallback: proxy from public URL
				if (!audioData) {
					const resp = await fetch(beat.audioUrl);
					if (resp.ok) {
						const buffer = await resp.arrayBuffer();
						audioData = new Uint8Array(buffer);
					}
				}
			}

			// Fetch stems if available
			if (beat?.stemsUrl) {
				stemsFilename = `${sanitizeFilename(beat.name || item.beatName || 'beat')}_stems.zip`;

				if (r2) {
					const key = r2KeyFromUrl(beat.stemsUrl);
					if (key) {
						for (const tryKey of [key, `/${key}`]) {
							try {
								const obj = await r2.get(tryKey);
								if (obj) {
									const buffer = await obj.arrayBuffer();
									stemsData = new Uint8Array(buffer);
									break;
								}
							} catch { /* try next key */ }
						}
					}
				}

				if (!stemsData) {
					const resp = await fetch(beat.stemsUrl);
					if (resp.ok) {
						const buffer = await resp.arrayBuffer();
						stemsData = new Uint8Array(buffer);
					}
				}
			}
		}
	} catch (err) {
		console.warn('[Download ZIP] Audio/stems fetch failed:', err);
	}

	// 2. Generate contract PDF
	let contractPdf: Uint8Array | null = null;
	try {
		const contractFile = getContractFile(item.licenseName);
		contractPdf = await generateContractPDF({
			orderId,
			beatName: item.beatName || 'Beat',
			licenseName: item.licenseName,
			priceMXN: item.priceMXN,
			priceUSD: item.priceUSD,
			buyerName: customerName || 'Cliente',
			buyerEmail: customerEmail || '',
			date: new Date().toISOString().split('T')[0],
			contractFile,
		});
	} catch (err) {
		console.warn('[Download ZIP] Contract PDF generation failed:', err);
	}

	// 3. Build zip
	const zipFiles: Record<string, Uint8Array> = {};

	if (audioData) {
		zipFiles[audioFilename] = audioData;
	}

	if (stemsData) {
		zipFiles[stemsFilename] = stemsData;
	}

	if (contractPdf) {
		const contractFilename = `Contrato_${sanitizeFilename(item.beatName || 'beat')}_${item.licenseName}.pdf`;
		zipFiles[contractFilename] = contractPdf;
	}

	if (Object.keys(zipFiles).length === 0) {
		return new Response('No files available for download', { status: 404 });
	}

	// Generate zip
	const zipped = zipSync(zipFiles, { level: 6 });

	// Return zip
	const zipFilename = `${sanitizeFilename(item.beatName || 'beat')}_${item.licenseName}_dacewav.zip`;

	return new Response(zipped as BodyInit, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${zipFilename}"`,
			'Cache-Control': 'private, no-store',
		},
	});
};
