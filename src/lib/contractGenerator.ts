/**
 * Full Contract PDF Generator — pdf-lib based, Cloudflare Workers compatible.
 * Generates complete multi-page contracts with proper formatting, accented characters,
 * and all clauses for all 5 license types.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

	// ── Title ──
	st.page.drawText(cfg.title, {
		x: MARGIN_L,
		y: st.y,
		size: FONT_SIZE_TITLE,
		font: st.fontBold,
		color: rgb(0, 0, 0),
	});
	st.y -= LINE_H + 4;
	st.page.drawText(cfg.subtitle, {
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

	// ── Cláusula I ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA I. OTORGAMIENTO DE DERECHOS EXCLUSIVOS');
		drawBody(st, `El PRODUCTOR otorga al ARTISTA una licencia EXCLUSIVA y A PERPETUIDAD para usar el beat descrito anteriormente con el fin de grabar, reproducir, distribuir, monetizar y explotar comercialmente una o varias obras musicales (en adelante, las "Nuevas Canciones"), entendidas como composiciones musicales vocales o instrumentales que incorporen el beat licenciado.`);
		drawBody(st, `1.1 Formato entregado: todos los archivos indicados en la sección Descripción del Beat (MP3, WAV, Stems/Trackout en archivo ZIP).`);
		drawBody(st, `1.2 Sincronización (TV, cine, publicidad, radio): SÍ permitida con esta licencia, sujeta a las restricciones de contenido de la Cláusula VIII.`);
		drawBody(st, `1.3 Uso en presentaciones en vivo: SÍ incluido, sin límite.`);
		drawBody(st, `1.4 Esta licencia NO transfiere la titularidad de los derechos de autor del beat.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA I. OBJETO DE LA LICENCIA');
		drawBody(st, `El PRODUCTOR otorga al ARTISTA una licencia no exclusiva, intransferible y no sublicenciable para usar el beat descrito anteriormente con el fin de crear una nueva obra musical (en adelante, la "Nueva Canción"), entendida como una única composición musical vocal o instrumental que incorpore el beat licenciado. Para efectos de este contrato, "Nueva Canción" se refiere exclusivamente a una sola obra; cada obra adicional que utilice el beat requerirá una licencia por separado o una licencia de nivel superior. Se considera la misma Nueva Canción: versiones, remixes, ediciones acústicas, instrumentales y ediciones de radio de la obra original, siempre que mantengan la misma composición vocal/letra base.`);
		drawBody(st, `1.1 Formato: El archivo indicado en la sección Descripción del Beat.`);
		drawBody(st, `1.2 Unidades físicas: ${cfg.copies}.`);
		drawBody(st, `1.3 Streaming: ${cfg.streams} en todas las plataformas.`);
		if (!cfg.exclusive) {
			drawBody(st, `1.4 Renovación: Al alcanzar cualquiera de estos límites, el ARTISTA deberá adquirir una licencia superior.`);
		}
		drawBody(st, `1.5 Esta licencia NO transfiere la titularidad ni los derechos de autor del beat.`);
	}

	// ── Cláusula II ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA II. OBLIGACIONES DEL PRODUCTOR');
		drawBody(st, `Tras la recepción del pago, el PRODUCTOR se compromete a:`);
		drawBody(st, `2.1 Cese de licenciamiento: No vender, arrendar ni licenciar el beat a ningún otro tercero.`);
		drawBody(st, `2.2 Retiro del mercado: Retirar el beat de todas las tiendas en línea en un plazo máximo de 5 días hábiles.`);
		drawBody(st, `2.3 Uso para portafolio (YouTube): El PRODUCTOR podrá mantener el beat en YouTube únicamente con fines de exposición y portafolio personal.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA II. TIPO DE LICENCIA Y ALCANCE');
		drawBody(st, `Tipo: NO EXCLUSIVA. El PRODUCTOR puede licenciar el mismo beat a otros artistas.`);
		drawBody(st, `2.1 Plataformas autorizadas: Spotify, Apple Music, YouTube, TikTok, SoundCloud y plataformas de streaming digital.`);
		drawBody(st, `2.2 Uso en presentaciones en vivo: Incluido.`);
		if (cfg.syncAllowed) {
			drawBody(st, `2.3 Sincronización (TV, cine, publicidad, radio): SÍ permitida, sujeta a las restricciones de contenido de la Cláusula V.`);
		} else {
			drawBody(st, `2.3 Sincronización (TV, cine, publicidad, radio): NO permitida con esta licencia. Se requiere licencia ilimitada o exclusiva.`);
		}
		drawBody(st, `2.4 Territorio: Mundial.`);
		drawBody(st, `2.5 NFTs / Web3: Prohibido salvo autorización escrita del PRODUCTOR.`);
	}

	// ── Cláusula III ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA III. DERECHOS RESERVADOS POR EL PRODUCTOR');
		drawBody(st, `3.1 Derechos de autor de la composición: El PRODUCTOR retiene su participación del 50% de los derechos editoriales (publishing).`);
		drawBody(st, `3.2 Uso promocional: El PRODUCTOR podrá usar el beat en su portafolio con fines no comerciales, después del lanzamiento de la primera Nueva Canción o transcurridos 12 meses.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA III. DERECHOS Y PORCENTAJES');
		drawBody(st, `3.1 Propiedad del beat: El PRODUCTOR retiene el 100% de la propiedad y los derechos de autor del beat original.`);
		drawBody(st, `3.2 Ingresos del máster: ${cfg.masterRevenue}`);
		drawBody(st, `3.3 Derechos editoriales (Publishing): ${cfg.publishing}`);
	}

	// ── Cláusula IV ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA IV. REGALÍAS Y PORCENTAJES');
		drawBody(st, `4.1 Mecanismo de distribución: Las regalías del máster se gestionarán mediante split de ingresos (revenue split) del distribuidor digital.`);
		drawBody(st, `4.2 División del máster: 70% ARTISTA / 30% PRODUCTOR en ingresos brutos del máster.`);
		drawBody(st, `4.3 Verificación del split: Si el ARTISTA cambia de distribuidor, deberá notificarlo y configurar el split dentro de 5 días hábiles.`);
		drawBody(st, `4.4 Plataformas sin split automático: El ARTISTA realizará transferencia manual del 30% dentro de 15 días hábiles del cierre de cada período.`);
		drawBody(st, `4.5 Derechos editoriales (Publishing): 50% PRODUCTOR / 50% ARTISTA.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA IV. CRÉDITOS OBLIGATORIOS');
		drawBody(st, `El ARTISTA se compromete a acreditar al PRODUCTOR en todos los lanzamientos y plataformas de la siguiente forma:`);
		drawBodyBold(st, `"Prod. by Dace" o "Beat by Dace"`, 10);
		drawBody(st, `El crédito deberá aparecer como mínimo en: (a) los metadatos de distribución digital, y (b) la descripción o título de cualquier contenido de video donde se utilice la Nueva Canción.`);
		drawBody(st, `La omisión del crédito constituye una violación a este contrato y puede resultar en la revocación inmediata de la licencia sin derecho a reembolso.`);
	}

	// ── Cláusula V ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA V. RECONOCIMIENTO DE LICENCIAS ANTERIORES');
		drawBody(st, `El ARTISTA reconoce que el beat pudo haber sido licenciado a terceros de forma no-exclusiva antes de este Contrato. Dichos licenciatarios conservan sus derechos. El PRODUCTOR no otorgará licencias adicionales a partir de la fecha de este acuerdo.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA V. RESTRICCIONES Y PROHIBICIONES');
		drawBody(st, `5.1 Queda expresamente prohibido al ARTISTA:`);
		drawBody(st, `a) Registrar el beat como obra propia ante organismos de derechos de autor.`, 15);
		drawBody(st, `b) Registrar la Nueva Canción en Content ID sin autorización escrita del PRODUCTOR.`, 15);
		drawBody(st, `c) Sublicenciar, revender, ceder o transferir esta licencia a terceros.`, 15);
		if (cfg.stemsIncluded) {
			drawBody(st, `d) Extraer o comercializar stems del beat. Los stems son de uso exclusivo para la Nueva Canción.`, 15);
		} else {
			drawBody(st, `d) Extraer, cortar o alterar elementos del beat para comercializarlos como producción propia.`, 15);
		}
		drawBody(st, `e) Usar el beat en contenido que promueva odio, discriminación, violencia, pornografía o actividades ilegales.`, 15);
		drawBody(st, `f) Usar el beat en proyectos de NFTs, tokens o blockchain sin autorización expresa.`, 15);
	}

	// ── Cláusula VI ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA VI. CONTENT ID Y PROTECCIÓN DE LICENCIATARIOS ANTERIORES');
		drawBody(st, `6.1 El ARTISTA tendrá derecho de registrar la Nueva Canción en Content ID.`);
		drawBody(st, `6.2 Obligación de Whitelisting: El ARTISTA deberá liberar reclamaciones contra videos de licenciatarios previos dentro de 3 días hábiles.`);
		drawBody(st, `6.3 El PRODUCTOR facilitará lista de licenciatarios previos bajo petición razonable.`);
		drawBody(st, `6.4 Si el beat está en Content ID a nombre del PRODUCTOR, éste lo retirará o transferirá dentro de 5 días hábiles.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA VI. DERECHOS QUE CONSERVA EL PRODUCTOR');
		drawBody(st, `a) Licenciar el mismo beat a otros artistas (licencia no exclusiva).`);
		drawBody(st, `b) Usar el beat en su portafolio, redes sociales y material promocional.`);
		drawBody(st, `c) Acreditar el beat en su discografía o catálogo.`);
		drawBody(st, `d) Revocar la licencia ante incumplimiento grave.`);
	}

	// ── Cláusula VII ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA VII. CRÉDITOS OBLIGATORIOS');
		drawBody(st, `El ARTISTA se compromete a acreditar al PRODUCTOR:`);
		drawBodyBold(st, `"Prod. by Dace" o "Beat by Dace"`, 10);
		drawBody(st, `El crédito deberá aparecer como mínimo en: (a) los metadatos de distribución digital, y (b) la descripción o título de cualquier contenido de video.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA VII. GARANTÍAS E INDEMNIDAD');
		drawBody(st, `7.1 El PRODUCTOR garantiza que es el único autor y titular de los derechos del beat.`);
		drawBody(st, `7.2 El ARTISTA indemnizará al PRODUCTOR de cualquier reclamación por contenido añadido por el ARTISTA o uso indebido del beat.`);
	}

	// ── Cláusula VIII ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA VIII. RESTRICCIONES Y PROHIBICIONES');
		drawBody(st, `8.1 Queda prohibido al ARTISTA:`);
		drawBody(st, `a) Revender, alquilar, prestar o licenciar el beat o stems a terceros.`, 15);
		drawBody(st, `b) Extraer o comercializar stems. Los stems son de uso exclusivo para las Nuevas Canciones.`, 15);
		drawBody(st, `c) Usar el beat en contenido que promueva odio, discriminación, violencia, pornografía o actividades ilegales.`, 15);
		drawBody(st, `d) Usar el beat en proyectos de NFTs sin autorización escrita.`, 15);
	} else {
		drawClauseTitle(st, 'CLÁUSULA VIII. ENTREGA DE ARCHIVOS');
		drawBody(st, `8.1 Entrega automatizada al confirmarse el pago, o máximo 24 horas en entrega manual.`);
		drawBody(st, `8.2 Canal de entrega: Email.`);
		drawBody(st, `8.3 Content ID — Obligación del PRODUCTOR: El PRODUCTOR se compromete a liberar (whitelist) la grabación maestra de la Nueva Canción en todos los sistemas de Content ID dentro de las 24 horas hábiles siguientes a recibir el enlace de distribución. Esta obligación se activa únicamente al recibir dicho enlace; el PRODUCTOR no será responsable de reclamaciones si el ARTISTA no ha proporcionado el enlace.`);
	}

	// ── Cláusula IX ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA IX. GARANTÍAS E INDEMNIDAD');
		drawBody(st, `9.1 El PRODUCTOR garantiza que es el único autor y titular de los derechos del beat.`);
		drawBody(st, `9.2 El ARTISTA indemnizará al PRODUCTOR de cualquier reclamación por contenido añadido o uso indebido.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA IX. PAGO Y CONDICIONES ECONÓMICAS');
		drawBody(st, `El ARTISTA realizó el pago único e irrepetible de: ${cfg.price}.`);
		drawBody(st, `Este pago no genera regalías ni pagos adicionales futuros al PRODUCTOR, salvo acuerdo escrito.`);
		if (cfg.exclusive) {
			// not applicable here
		}
		drawBody(st, `En caso de chargeback, devolución o reversión del pago por cualquier motivo, la licencia se revocará automáticamente e inmediatamente, sin necesidad de notificación previa. El ARTISTA deberá cesar todo uso del beat y retirar la Nueva Canción de todas las plataformas dentro de los 5 días hábiles siguientes.`);
		drawBody(st, `El pago de la licencia no es reembolsable, salvo en los supuestos expresamente previstos en la Cláusula VIII.3.`);
	}

	// ── Cláusula X ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA X. PAGO Y CONDICIONES ECONÓMICAS');
		drawBody(st, `El ARTISTA realizó el pago único e irrepetible de: ${cfg.price}.`);
		drawBody(st, `Este pago único no cubre las regalías del máster (30% para el PRODUCTOR, según Cláusula IV).`);
		drawBody(st, `En caso de chargeback, devolución o reversión del pago, la licencia se revocará automáticamente. El ARTISTA deberá retirar todas las Nuevas Canciones de todas las plataformas dentro de los 5 días hábiles siguientes.`);
		drawBody(st, `El pago no es reembolsable.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA X. VIGENCIA Y TERMINACIÓN');
		if (nameIncludes(data.licenseName, ['ilimitada', 'unlimited'])) {
			drawBody(st, `La licencia es indefinida a perpetuidad, condicionada al cumplimiento de los términos. No existen límites de streams ni de copias.`);
		} else {
			drawBody(st, `La licencia es indefinida mientras no se superen los límites del punto 1.3. Al alcanzarse dichos límites, la licencia expira automáticamente.`);
		}
		drawBody(st, `El PRODUCTOR puede revocar esta licencia en caso de incumplimiento grave. La revocación implica la obligación del ARTISTA de retirar la Nueva Canción dentro de los 5 días hábiles siguientes.`);
	}

	// ── Cláusula XI ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA XI. DURACIÓN Y TERMINACIÓN');
		drawBody(st, `La duración es a perpetuidad, siempre que el ARTISTA cumpla los términos. El PRODUCTOR puede revocar por incumplimiento grave sin derecho a reembolso.`);
		drawBody(st, `La revocación implica la obligación de retirar todas las Nuevas Canciones dentro de los 5 días hábiles siguientes.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA XI. CONDICIONES GENERALES');
		drawBody(st, `11.1 Modificaciones: Cualquier modificación deberá constar por escrito.`);
		drawBody(st, `11.2 Acuerdo completo: Este documento reemplaza cualquier acuerdo previo.`);
		drawBody(st, `11.3 Fuerza mayor: Ninguna parte será responsable por eventos fuera de su control.`);
		drawBody(st, `11.4 Confidencialidad: Los términos económicos son confidenciales.`);
		drawBody(st, `11.5 Notificaciones: Las comunicaciones oficiales se realizarán por correo electrónico.`);
		drawBody(st, `11.6 Protección de datos: Conforme a la LFPDPPP de México.`);
		drawBody(st, `11.7 Definición de incumplimiento grave: (a) omisión del crédito; (b) registro no autorizado en Content ID; (c) sublicenciamiento no autorizado; (d) uso fuera de límites sin renovar; (e) uso en contenido prohibido; (f) uso en NFTs sin autorización.`);
	}

	// ── Cláusula XII ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA XII. CONDICIONES GENERALES');
		drawBody(st, `12.1 No reembolsable: Salvo incumplimiento del PRODUCTOR.`);
		drawBody(st, `12.2 Modificaciones: Cualquier modificación deberá constar por escrito.`);
		drawBody(st, `12.3 Fuerza mayor: Ninguna parte será responsable por eventos fuera de su control.`);
		drawBody(st, `12.4 Confidencialidad: Los términos económicos son confidenciales.`);
		drawBody(st, `12.5 Notificaciones: Las comunicaciones oficiales se realizarán por correo electrónico.`);
		drawBody(st, `12.6 Protección de datos: Conforme a la LFPDPPP de México.`);
		drawBody(st, `12.7 Acuerdo completo: Este documento reemplaza cualquier acuerdo previo.`);
		drawBody(st, `12.8 Definición de incumplimiento grave: (a) omisión del crédito; (b) registro no autorizado en Content ID; (c) sublicenciamiento no autorizado; (d) no configurar split del 30%; (e) uso en contenido prohibido; (f) no realizar whitelisting; (g) uso indebido de stems; (h) omisión reiterada de pagos manuales.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA XII. LEGISLACIÓN APLICABLE');
		drawBody(st, `Este contrato se rige por las leyes de los Estados Unidos Mexicanos, en especial la Ley Federal del Derecho de Autor (LFDA) y el Código Civil Federal.`);
		drawBody(st, `Las partes intentarán resolver controversias mediante negociación directa en un plazo de 15 días hábiles.`);
		drawBody(st, `Las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Puebla de Zaragoza, Estado de Puebla, México, renunciando a cualquier otro fuero.`);
	}

	// ── Cláusula XIII ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA XIII. LEGISLACIÓN APLICABLE');
		drawBody(st, `Este contrato se rige por las leyes de los Estados Unidos Mexicanos, en especial la LFDA y el Código Civil Federal.`);
		drawBody(st, `Las partes intentarán resolver controversias mediante negociación directa en un plazo de 15 días hábiles.`);
		drawBody(st, `Las partes se someten a la jurisdicción de los tribunales competentes de Puebla de Zaragoza, Puebla, México.`);
	} else {
		drawClauseTitle(st, 'CLÁUSULA XIII. ACEPTACIÓN Y ACUERDO COMPLETO');
		drawBody(st, `Aceptación por pago: El pago del precio de la licencia por parte del ARTISTA constituye su aceptación total e incondicional de todos los términos, sin necesidad de firma física o digital.`);
		drawBody(st, `Las partes declaran haber leído, entendido y aceptado voluntariamente todos los términos.`);
	}

	// ── Cláusula XIV (solo exclusiva) ──
	if (cfg.exclusive) {
		drawClauseTitle(st, 'CLÁUSULA XIV. ACEPTACIÓN Y ACUERDO COMPLETO');
		drawBody(st, `PERFECCIONAMIENTO: Este contrato EXCLUSIVO se perfecciona con el pago MÁS la firma de ambas partes por: (a) firma electrónica oficial (DocuSign, Smallpdf) o autógrafa ante notario; o (b) firma manuscrita escaneada/fotografiada enviada por email o WhatsApp.`);
		drawBody(st, `El pago sin firma no genera la licencia exclusiva ni obliga al PRODUCTOR a retirar el beat del mercado.`);
		drawBody(st, `Las partes declaran haber leído, entendido y aceptado voluntariamente todos los términos.`);
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

function nameIncludes(name: string, terms: string[]): boolean {
	const lower = name.toLowerCase();
	return terms.some(t => lower.includes(t));
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
