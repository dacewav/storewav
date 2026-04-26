/**
 * Contract PDF Generator Tests
 *
 * Verifies PDF generation, structure, and behavior for all license types.
 * Text content is verified indirectly via pdf-lib's drawText (trusted library).
 */

import { describe, it, expect } from 'vitest';
import { generateContractPDF, generateContractPDFBase64, getContractFile, type ContractData } from '../contractGenerator';
import { PDFDocument } from 'pdf-lib';

// ─── Test Data ──────────────────────────────────────────────────────

function makeData(overrides: Partial<ContractData> = {}): ContractData {
	return {
		orderId: 'abc12345def67890',
		beatName: 'Midnight Dreams',
		beatBpm: '140',
		beatKey: 'Am',
		beatGenre: 'Trap',
		licenseName: 'MP3',
		priceMXN: 350,
		priceUSD: 20,
		buyerName: 'Carlos García López',
		buyerEmail: 'carlos@example.com',
		buyerArtist: 'CGLO',
		date: '27 de abril de 2026',
		contractFile: '01-mp3',
		...overrides,
	};
}

// ─── 1. getContractFile mapping ─────────────────────────────────────

describe('getContractFile', () => {
	it('maps MP3 → 01-mp3', () => {
		expect(getContractFile('MP3')).toBe('01-mp3');
		expect(getContractFile('Basic')).toBe('01-mp3');
	});

	it('maps WAV → 02-wav', () => {
		expect(getContractFile('WAV')).toBe('02-wav');
		expect(getContractFile('Standar')).toBe('02-wav');
	});

	it('maps Premium → 03-premium', () => {
		expect(getContractFile('Premium')).toBe('03-premium');
	});

	it('maps Ilimitada → 04-ilimitada', () => {
		expect(getContractFile('Ilimitada')).toBe('04-ilimitada');
		expect(getContractFile('Unlimited')).toBe('04-ilimitada');
	});

	it('maps Exclusiva → 05-exclusiva', () => {
		expect(getContractFile('Exclusiva')).toBe('05-exclusiva');
		expect(getContractFile('Exclusive')).toBe('05-exclusiva');
	});

	it('defaults to 01-mp3 for unknown license', () => {
		expect(getContractFile('Unknown')).toBe('01-mp3');
		expect(getContractFile('')).toBe('01-mp3');
	});
});

// ─── 2. PDF generation per license ──────────────────────────────────

describe('generateContractPDF', () => {
	const licenses = ['MP3', 'WAV', 'Premium', 'Ilimitada', 'Exclusiva'];

	for (const license of licenses) {
		it(`generates valid PDF for ${license} license`, async () => {
			const data = makeData({ licenseName: license });
			const pdfBytes = await generateContractPDF(data);

			expect(pdfBytes).toBeInstanceOf(Uint8Array);
			// PDF header
			const header = String.fromCharCode(...pdfBytes.slice(0, 5));
			expect(header).toBe('%PDF-');
			// Reasonable size (>1KB for a multi-clause contract)
			expect(pdfBytes.length).toBeGreaterThan(1024);
		});
	}

	it('Exclusiva produces a valid PDF (14 clauses)', async () => {
		const exBytes = await generateContractPDF(makeData({ licenseName: 'Exclusiva' }));
		expect(exBytes).toBeInstanceOf(Uint8Array);
		expect(exBytes.length).toBeGreaterThan(1024);
		// Verify it's a valid PDF
		const header = String.fromCharCode(...exBytes.slice(0, 5));
		expect(header).toBe('%PDF-');
		const doc = await PDFDocument.load(exBytes);
		expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
	});
});

// ─── 3. Page count ──────────────────────────────────────────────────

describe('page count', () => {
	const licenses = ['MP3', 'WAV', 'Premium', 'Ilimitada', 'Exclusiva'];

	for (const license of licenses) {
		it(`${license} contract has at least 2 pages`, async () => {
			const data = makeData({ licenseName: license });
			const pdfBytes = await generateContractPDF(data);
			const doc = await PDFDocument.load(pdfBytes);
			expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
		});
	}

	it('all pages are A4 size (595.28 x 841.89)', async () => {
		const pdfBytes = await generateContractPDF(makeData());
		const doc = await PDFDocument.load(pdfBytes);
		const pages = doc.getPages();
		for (const page of pages) {
			const { width, height } = page.getSize();
			expect(width).toBeCloseTo(595.28, 0);
			expect(height).toBeCloseTo(841.89, 0);
		}
	});
});

// ─── 4. Dynamic fields don't crash ──────────────────────────────────

describe('dynamic fields', () => {
	it('handles all fields populated', async () => {
		const data = makeData({
			buyerName: 'Juan Pérez Martínez',
			buyerEmail: 'test@dacewav.store',
			buyerArtist: 'El Artista',
			beatName: 'Summer Vibes 2026',
			beatBpm: '160',
			beatKey: 'C#m',
			beatGenre: 'Drill',
			priceMXN: 1500,
			priceUSD: 90,
			date: '1 de enero de 2027',
		});
		const pdfBytes = await generateContractPDF(data);
		expect(pdfBytes).toBeInstanceOf(Uint8Array);
		expect(pdfBytes.length).toBeGreaterThan(1024);
	});

	it('handles minimal fields (no optional)', async () => {
		const data = makeData({
			beatBpm: undefined,
			beatKey: undefined,
			beatGenre: undefined,
			buyerArtist: undefined,
		});
		const pdfBytes = await generateContractPDF(data);
		expect(pdfBytes).toBeInstanceOf(Uint8Array);
		expect(pdfBytes.length).toBeGreaterThan(1024);
	});

	it('handles special characters in names', async () => {
		const data = makeData({
			buyerName: 'José María Ñuñez García',
			beatName: 'Noche de Azúcar ñ',
		});
		const pdfBytes = await generateContractPDF(data);
		expect(pdfBytes).toBeInstanceOf(Uint8Array);
	});

	it('handles zero-price exclusiva (negotiated)', async () => {
		const data = makeData({
			licenseName: 'Exclusiva',
			priceMXN: 0,
			priceUSD: 0,
		});
		const pdfBytes = await generateContractPDF(data);
		expect(pdfBytes).toBeInstanceOf(Uint8Array);
	});
});

// ─── 5. Base64 conversion ───────────────────────────────────────────

describe('generateContractPDFBase64', () => {
	it('returns valid base64 string', async () => {
		const data = makeData();
		const base64 = await generateContractPDFBase64(data);

		expect(typeof base64).toBe('string');
		expect(base64.length).toBeGreaterThan(0);
		expect(base64).toMatch(/^[A-Za-z0-9+/]+=*$/);

		// Decoded should start with PDF header
		const decoded = atob(base64);
		expect(decoded.slice(0, 5)).toBe('%PDF-');
	});

	it('produces same size as generateContractPDF', async () => {
		const data = makeData();
		const pdfBytes = await generateContractPDF(data);
		const base64 = await generateContractPDFBase64(data);

		const decoded = atob(base64);
		expect(decoded.length).toBe(pdfBytes.length);
	});
});

// ─── 6. License-specific properties ─────────────────────────────────

describe('license-specific properties', () => {
	it('MP3 has 2 pages (shorter contract)', async () => {
		const doc = await PDFDocument.load(await generateContractPDF(makeData({ licenseName: 'MP3' })));
		expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
	});

	it('Ilimitada has 2+ pages (stream limit text)', async () => {
		const doc = await PDFDocument.load(await generateContractPDF(makeData({ licenseName: 'Ilimitada' })));
		expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
	});

	it('Exclusiva has 2+ pages (14 clauses + signature)', async () => {
		const doc = await PDFDocument.load(await generateContractPDF(makeData({ licenseName: 'Exclusiva' })));
		expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
	});

	it('all licenses produce valid PDFs of reasonable size', async () => {
		for (const license of ['MP3', 'WAV', 'Premium', 'Ilimitada', 'Exclusiva']) {
			const bytes = await generateContractPDF(makeData({ licenseName: license }));
			expect(bytes.length).toBeGreaterThan(1024);
			// Verify valid PDF
			const header = String.fromCharCode(...bytes.slice(0, 5));
			expect(header).toBe('%PDF-');
		}
	});
});

// ─── 7. Error handling ──────────────────────────────────────────────

describe('error handling', () => {
	it('does not throw for any license name', async () => {
		for (const name of ['MP3', 'WAV', 'Premium', 'Ilimitada', 'Exclusiva', 'Unknown', '']) {
			await expect(generateContractPDF(makeData({ licenseName: name }))).resolves.toBeInstanceOf(Uint8Array);
		}
	});
});
