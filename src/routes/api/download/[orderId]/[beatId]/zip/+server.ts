import type { RequestHandler } from './$types';
import { generateContractPDF, getContractFile } from '$lib/contractGenerator';
import { zipSync } from 'fflate';

/**
 * GET /api/download/[orderId]/[beatId]/zip
 * Downloads a zip containing: beat audio + contract PDF.
 * If stems exist in the future, they'll be included too.
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

// Reuse order cache from parent endpoint
const orderCache = new Map<string, { verified: number; items: Array<{ beatId: string; licenseName: string; beatName?: string; priceMXN: number; priceUSD: number }> }>();
const CACHE_TTL = 5 * 60 * 1000;

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
	} catch {
		return null;
	}
}

function r2KeyFromUrl(url: string): string | null {
	try {
		const u = new URL(url);
		return u.pathname.slice(1) || null;
	} catch {
		return null;
	}
}

function sanitizeFilename(name: string): string {
	return name
		.replace(/[^\w\s.-]/g, '')
		.replace(/\s+/g, '_')
		.slice(0, 80);
}

export const GET: RequestHandler = async ({ params, platform }) => {
	const { orderId, beatId } = params;

	if (!orderId || !beatId) {
		return new Response('Missing parameters', { status: 400 });
	}

	// Verify order and get item details
	const orderData = await verifyAndGetOrder(orderId, beatId);
	if (!orderData?.verified) {
		return new Response('Unauthorized — order not paid or beat not in order', { status: 403 });
	}

	const { item, customerEmail, customerName } = orderData;

	// 1. Fetch beat audio
	let audioData: Uint8Array | null = null;
	let audioFilename = 'beat.mp3';

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

			if (beat?.audioUrl) {
				audioFilename = `${sanitizeFilename(beat.name || item.beatName || 'beat')}.mp3`;

				// Try R2 binding first
				const r2 = platform?.env?.MEDIA;
				if (r2) {
					const key = r2KeyFromUrl(beat.audioUrl);
					if (key) {
						try {
							const obj = await r2.get(key);
							if (obj) {
								const buffer = await obj.arrayBuffer();
								audioData = new Uint8Array(buffer);
							}
						} catch {
							// Fall through to proxy
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
		}
	} catch {
		// Audio fetch failed — continue with contract only
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
	} catch {
		// Contract generation failed — continue with audio only
	}

	// 3. Build zip
	const zipFiles: Record<string, Uint8Array> = {};

	if (audioData) {
		zipFiles[audioFilename] = audioData;
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

	return new Response(zipped, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${zipFilename}"`,
			'Cache-Control': 'private, no-store',
		},
	});
};
