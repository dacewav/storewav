/**
 * Full Contract PDF Generator — pdf-lib based, Cloudflare Workers compatible.
 * Generates complete multi-page contracts with proper formatting, accented characters,
 * and all clauses for all 5 license types.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getContractTemplate, type ContractClause } from './contractText';

export type ContractData = {
	orderId: string;
	beatName: string;
	beatBpm?: string;
	beatKey?: string;
	beatGenre?: string;
	licenseName: string;
	priceMXN: number;
	priceUSD: number;
	buyerName: string;
	buyerEmail: string;
	buyerArtist?: string;
	date: string; // ISO date
	contractFile: string; // e.g. "01-mp3"
};

/** License → contract file mapping */
const LICENSE_CONTRACT_MAP: Record<string, string> = {
	'MP3': '01-mp3',
	'Basic': '01-mp3',
	'WAV': '02-wav',
	'Standar': '02-wav',
	'Premium': '03-premium',
	'Ilimitada': '04-ilimitada',
	'Unlimited': '04-ilimitada',
	'Exclusiva': '05-exclusiva',
	'Exclusive': '05-exclusiva',
};

export function getContractFile(licenseName: string): string {
	return LICENSE_CONTRACT_MAP[licenseName] || '01-mp3';
}

// ─── PDF Layout Constants ───────────────────────────────────────────

const PAGE_W = 595.28; // A4 width
const PAGE_H = 841.89; // A4 height
const MARGIN_L = 60;
const MARGIN_R = 60;
const MARGIN_T = 60;
const MARGIN_B = 50;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

const FONT_SIZE_TITLE = 14;
const FONT_SIZE_SECTION = 11;
const FONT_SIZE_BODY = 9.5;
const FONT_SIZE_SMALL = 8;
const LINE_H = 13;
const CLAUSE_GAP = 10;
const SECTION_GAP = 16;

type TextSegment = { text: string; bold?: boolean };

type RenderState = {
	doc: PDFDocument;
	fontRegular: any;
	fontBold: any;
	page: any;
	y: number;
	pageNum: number;
};

// ─── Text Rendering ─────────────────────────────────────────────────

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
	const words = text.split(' ');
	const lines: string[] = [];
	let currentLine = '';

	for (const word of words) {
		const testLine = currentLine ? `${currentLine} ${word}` : word;
		const width = font.widthOfTextAtSize(testLine, fontSize);
		if (width > maxWidth && currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = testLine;
		}
	}
	if (currentLine) lines.push(currentLine);
	return lines.length ? lines : [''];
}

function ensureSpace(st: RenderState, needed: number) {
	if (st.y - needed < MARGIN_B) {
		addPage(st);
	}
}

function addPage(st: RenderState) {
	st.page = st.doc.addPage([PAGE_W, PAGE_H]);
	st.y = PAGE_H - MARGIN_T;
	st.pageNum++;
}

function drawLine(st: RenderState, text: string, fontSize: number, font: any, indent = 0, gap?: number) {
	const lines = wrapText(text, font, fontSize, CONTENT_W - indent);
	for (const line of lines) {
		ensureSpace(st, LINE_H + 2);
		st.page.drawText(line, {
			x: MARGIN_L + indent,
			y: st.y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0),
		});
		st.y -= LINE_H;
	}
	if (gap) st.y -= gap;
}

function drawClauseTitle(st: RenderState, title: string) {
	ensureSpace(st, SECTION_GAP + LINE_H);
	st.y -= CLAUSE_GAP;
	st.page.drawText(title, {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_SECTION,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.y -= LINE_H + 2;
}

function drawBody(st: RenderState, text: string, indent = 0) {
	drawLine(st, text, FONT_SIZE_BODY, st.fontRegular, indent);
}

function drawBodyBold(st: RenderState, text: string, indent = 0) {
	drawLine(st, text, FONT_SIZE_BODY, st.fontBold, indent);
}

function drawSeparator(st: RenderState) {
	ensureSpace(st, 10);
	st.y -= 4;
	st.page.drawLine({
		start: { x: MARGIN_L, y: st.y },
		end: { x: PAGE_W - MARGIN_R, y: st.y },
		thickness: 0.5,
		color: rgb(0.7, 0.7, 0.7),
	});
	st.y -= 6;
}

function drawFieldTable(st: RenderState, rows: [string, string][]) {
	for (const [label, value] of rows) {
		ensureSpace(st, LINE_H + 4);
		// Label (bold)
		st.page.drawText(`${label}:`, {
			x: MARGIN_L,
			y: st.y,
			size: FONT_SIZE_BODY,
			font: st.fontBold,
			color: rgb(0.15, 0.15, 0.15),
		});
		const labelW = st.fontBold.widthOfTextAtSize(`${label}:`, FONT_SIZE_BODY);
		// Value
		st.page.drawText(value, {
			x: MARGIN_L + labelW + 8,
			y: st.y,
			size: FONT_SIZE_BODY,
			font: st.fontRegular,
			color: rgb(0, 0, 0),
		});
		st.y -= LINE_H + 3;
	}
}

// ─── License-Specific Content ───────────────────────────────────────

type LicenseConfig = {
	title: string;
	subtitle: string;
	formatLabel: string; // e.g. "MP3" or "WAV + MP3"
	streams: string;
	copies: string;
	syncAllowed: boolean;
	stemsIncluded: boolean;
	publishing: string;
	masterRevenue: string;
	exclusive: boolean;
	price: string;
};

function getLicenseConfig(data: ContractData): LicenseConfig {
	const name = data.licenseName.toLowerCase();
	const priceStr = `$${data.priceMXN.toLocaleString()} MXN / $${data.priceUSD.toLocaleString()} USD`;

	if (name.includes('mp3') || name.includes('basic')) {
		return {
			title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
			subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL (MP3)',
			formatLabel: '[X] MP3 [ ] WAV [ ] Stems [ ] Todos',
			streams: 'Hasta 100,000 (cien mil) reproducciones combinadas',
			copies: 'Hasta 2,000 (dos mil) copias físicas o descargas digitales',
			syncAllowed: false,
			stemsIncluded: false,
			publishing: 'El ARTISTA conserva el 100% de los derechos editoriales sobre la letra de la Nueva Canción.',
			masterRevenue: 'El ARTISTA conserva el 100% de los ingresos por venta, distribución y streaming.',
			exclusive: false,
			price: priceStr,
		};
	}
	if (name.includes('wav') || name.includes('standar')) {
		return {
			title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
			subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL (WAV + MP3)',
			formatLabel: '[X] MP3 [X] WAV [ ] Stems [ ] Todos',
			streams: 'Hasta 500,000 (quinientas mil) reproducciones combinadas',
			copies: 'Hasta 5,000 (cinco mil) copias físicas o descargas digitales',
			syncAllowed: false,
			stemsIncluded: false,
			publishing: 'El ARTISTA conserva el 100% de los derechos editoriales sobre la letra de la Nueva Canción.',
			masterRevenue: 'El ARTISTA conserva el 100% de los ingresos por venta, distribución y streaming.',
			exclusive: false,
			price: priceStr,
		};
	}
	if (name.includes('premium')) {
		return {
			title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
			subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL — PREMIUM (WAV + MP3 + Stems)',
			formatLabel: '[X] MP3 [X] WAV [X] Stems [ ] Todos',
			streams: 'Hasta 1,000,000 (un millón) reproducciones combinadas',
			copies: 'Hasta 10,000 (diez mil) copias físicas o descargas digitales',
			syncAllowed: false,
			stemsIncluded: true,
			publishing: 'El ARTISTA conserva el 100% de los derechos editoriales sobre la letra de la Nueva Canción.',
			masterRevenue: 'El ARTISTA conserva el 100% de los ingresos por venta, distribución y streaming.',
			exclusive: false,
			price: priceStr,
		};
	}
	if (name.includes('ilimitada') || name.includes('unlimited')) {
		return {
			title: 'CONTRATO DE LICENCIA NO EXCLUSIVA',
			subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL — ILIMITADA (WAV + MP3 + Stems)',
			formatLabel: '[X] MP3 [X] WAV [X] Stems [X] Todos',
			streams: 'SIN LÍMITE de reproducciones',
			copies: 'SIN LÍMITE de copias físicas o descargas digitales',
			syncAllowed: true,
			stemsIncluded: true,
			publishing: 'División editorial 50% PRODUCTOR (compositor) / 50% ARTISTA (letrista).',
			masterRevenue: 'El ARTISTA conserva el 100% de los ingresos por venta, distribución y streaming.',
			exclusive: false,
			price: priceStr,
		};
	}
	// Exclusiva
	return {
		title: 'CONTRATO DE LICENCIA EXCLUSIVA',
		subtitle: 'DERECHOS DE USO, TÉRMINOS Y CONDICIONES — BEAT / PRODUCCIÓN MUSICAL — EXCLUSIVA',
		formatLabel: '[X] MP3 [X] WAV [X] Stems [X] Todos',
		streams: 'SIN LÍMITE — licencia exclusiva mundial a perpetuidad',
		copies: 'SIN LÍMITE — licencia exclusiva mundial a perpetuidad',
		syncAllowed: true,
		stemsIncluded: true,
		publishing: 'División editorial 50% PRODUCTOR (compositor) / 50% ARTISTA (letrista).',
		masterRevenue: '70% ARTISTA / 30% PRODUCTOR en ingresos brutos del máster (vía split del distribuidor).',
		exclusive: true,
		price: data.priceMXN > 0 ? priceStr : 'Cantidad negociada entre las partes',
	};
}

// ─── Contract Builder ───────────────────────────────────────────────

function buildContract(st: RenderState, data: ContractData, cfg: LicenseConfig) {
	const contractNo = data.orderId.slice(0, 8).toUpperCase();
	const formattedDate = data.date;

	// ── Get clause template from markdown source ──
	const template = getContractTemplate(data.contractFile, data.priceMXN, data.priceUSD);

	// ── Title ──
	st.page.drawText(template.title, {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_TITLE,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.y -= LINE_H + 4;
	st.page.drawText(template.subtitle, {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_SMALL,
		font: st.fontRegular,
		color: rgb(0.3, 0.3, 0.3),
	});
	st.y -= SECTION_GAP;

	drawSeparator(st);

	// ── Datos de la Operación ──
	drawClauseTitle(st, 'DATOS DE LA OPERACIÓN');
	drawFieldTable(st, [
		['No. de contrato', contractNo],
		['Fecha', formattedDate],
		['Ciudad', 'Heroica Puebla de Zaragoza, CP 72000'],
		['Forma de pago', 'Plataforma digital (Stripe)'],
	]);

	drawSeparator(st);

	// ── El Productor ──
	drawClauseTitle(st, 'EL PRODUCTOR (LICENCIANTE)');
	drawFieldTable(st, [
		['Nombre completo', 'Daniel Antonio Cebrero Escalante'],
		['Nombre artístico', 'Dace'],
		['Correo electrónico', 'dace.wav.negocios@gmail.com'],
		['Instagram / redes', 'dace.wav'],
	]);

	drawSeparator(st);

	// ── El Artista ──
	drawClauseTitle(st, 'EL ARTISTA (LICENCIATARIO)');
	const buyerFields: [string, string][] = [
		['Nombre completo', data.buyerName],
	];
	if (data.buyerArtist) buyerFields.push(['Nombre artístico', data.buyerArtist]);
	buyerFields.push(['Correo electrónico', data.buyerEmail]);
	drawFieldTable(st, buyerFields);

	drawSeparator(st);

	// ── Descripción del Beat ──
	drawClauseTitle(st, 'DESCRIPCIÓN DEL BEAT');
	const beatFields: [string, string][] = [
		['Nombre del beat', data.beatName],
	];
	if (data.beatBpm) beatFields.push(['BPM', data.beatBpm]);
	if (data.beatKey) beatFields.push(['Tonalidad', data.beatKey]);
	if (data.beatGenre) beatFields.push(['Género', data.beatGenre]);
	beatFields.push(['Formato entregado', cfg.formatLabel]);
	beatFields.push(['Precio pactado', cfg.price]);
	drawFieldTable(st, beatFields);

	drawSeparator(st);

	// ── TÉRMINOS Y CONDICIONES ──
	st.y -= 4;
	st.page.drawText('TÉRMINOS Y CONDICIONES', {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_SECTION + 1,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.y -= SECTION_GAP;

	// ── Render clauses from template ──
	for (const clause of template.clauses) {
		drawClauseTitle(st, clause.title);
		for (const paragraph of clause.paragraphs) {
			// Check if this is a bold credit line (e.g. "Prod. by Dace")
			if (
				paragraph === '"Prod. by Dace" o "Beat by Dace"' ||
				paragraph === '"Prod. by Dace" o "Beat by Dace"'
			) {
				drawBodyBold(st, paragraph, 10);
			} else if (/^[a-f]\)/.test(paragraph)) {
				// Sub-items like a), b), c) get indented
				drawBody(st, paragraph, 15);
			} else {
				drawBody(st, paragraph);
			}
		}
	}

	// ── Signature Block ──
	st.y -= SECTION_GAP;
	ensureSpace(st, 80);
	drawSeparator(st);

	st.page.drawText('FIRMAS', {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_SECTION,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.y -= LINE_H + 10;

	// Producer signature
	st.page.drawText('________________________', {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_BODY,
		font: st.fontRegular,
		color: rgb(0, 0, 0),
	});
	st.page.drawText('Dace', {
		x: MARGIN_L,
		y: st.y - LINE_H,
		size: FONT_SIZE_BODY,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.page.drawText('EL PRODUCTOR (LICENCIANTE)', {
		x: MARGIN_L,
		y: st.y - LINE_H * 2,
		size: FONT_SIZE_SMALL,
		font: st.fontRegular,
		color: rgb(0.3, 0.3, 0.3),
	});

	// Artist signature
	st.page.drawText('________________________', {
		x: PAGE_W - MARGIN_R - 150,
		y: st.y,
		size: FONT_SIZE_BODY,
		font: st.fontRegular,
		color: rgb(0, 0, 0),
	});
	st.page.drawText(data.buyerArtist || data.buyerName, {
		x: PAGE_W - MARGIN_R - 150,
		y: st.y - LINE_H,
		size: FONT_SIZE_BODY,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.page.drawText('EL ARTISTA (LICENCIATARIO)', {
		x: PAGE_W - MARGIN_R - 150,
		y: st.y - LINE_H * 2,
		size: FONT_SIZE_SMALL,
		font: st.fontRegular,
		color: rgb(0.3, 0.3, 0.3),
	});

	st.y -= LINE_H * 3 + 10;

	// ── Footer note ──
	ensureSpace(st, 40);
	drawBody(st, 'Lugar y fecha de firma: Heroica Puebla de Zaragoza, ' + formattedDate);
	st.y -= 4;
	drawBody(st, 'IMPORTANTE: Una foto del contrato firmado enviada por WhatsApp o correo electrónico tiene validez como evidencia de acuerdo.');

	// ── Page numbers ──
	const pages = st.doc.getPages();
	for (let i = 0; i < pages.length; i++) {
		pages[i].drawText(`Página ${i + 1} de ${pages.length}`, {
			x: PAGE_W - MARGIN_R - 80,
			y: 25,
			size: FONT_SIZE_SMALL,
			font: st.fontRegular,
			color: rgb(0.5, 0.5, 0.5),
		});
		pages[i].drawText('Este documento es confidencial.', {
			x: MARGIN_L,
			y: 25,
			size: FONT_SIZE_SMALL,
			font: st.fontRegular,
			color: rgb(0.5, 0.5, 0.5),
		});
	}
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Generate a complete contract PDF.
 * Returns Uint8Array of PDF bytes.
 */
export async function generateContractPDF(data: ContractData): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
	const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

	const firstPage = doc.addPage([PAGE_W, PAGE_H]);

	const st: RenderState = {
		doc,
		fontRegular,
		fontBold,
		page: firstPage,
		y: PAGE_H - MARGIN_T,
		pageNum: 1,
	};

	const cfg = getLicenseConfig(data);
	buildContract(st, data, cfg);

	return doc.save();
}

/**
 * Generate contract PDF and return as base64 string (for email attachment).
 */
export async function generateContractPDFBase64(data: ContractData): Promise<string> {
	const bytes = await generateContractPDF(data);
	// Convert Uint8Array to base64
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
