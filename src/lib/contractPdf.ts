/**
 * Contract PDF generator — pure JS, no dependencies, Cloudflare Workers compatible.
 * Generates a minimal but valid PDF from contract data.
 */

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
	contractFile: string; // e.g. "01-mp3.md"
};

/** License → contract file mapping */
const LICENSE_CONTRACT_MAP: Record<string, string> = {
	'MP3': '01-mp3',
	'Basic': '01-mp3',
	'WAV': '02-wav',
	'Standard': '02-wav',
	'Premium': '03-premium',
	'Ilimitada': '04-ilimitada',
	'Unlimited': '04-ilimitada',
	'Exclusiva': '05-exclusiva',
	'Exclusive': '05-exclusiva',
};

export function getContractFile(licenseName: string): string {
	return LICENSE_CONTRACT_MAP[licenseName] || '01-mp3';
}

/**
 * Generate a minimal valid PDF.
 * Returns Uint8Array of PDF bytes.
 */
export function generateContractPDF(data: ContractData): Uint8Array {
	const lines: string[] = [];

	// Header
	lines.push('CONTRATO DE LICENCIA');
	lines.push('');
	lines.push(`No. de contrato: ${data.orderId.slice(0, 8).toUpperCase()}`);
	lines.push(`Fecha: ${data.date}`);
	lines.push(`Ciudad: Heroica Puebla de Zaragoza, CP 72000`);
	lines.push('');

	// Producer
	lines.push('EL PRODUCTOR (LICENCIANTE)');
	lines.push('Nombre completo: Daniel Antonio Cebrero Escalante');
	lines.push('Nombre art\u00edstico: Dace');
	lines.push('Correo electr\u00f3nico: dace.wav.negocios@gmail.com');
	lines.push('Instagram: dace.wav');
	lines.push('');

	// Buyer
	lines.push('EL ARTISTA (LICENCIATARIO)');
	lines.push(`Nombre completo: ${data.buyerName}`);
	if (data.buyerArtist) lines.push(`Nombre art\u00edstico: ${data.buyerArtist}`);
	lines.push(`Correo electr\u00f3nico: ${data.buyerEmail}`);
	lines.push('');

	// Beat
	lines.push('DESCRIPCI\u00d3N DEL BEAT');
	lines.push(`Nombre del beat: ${data.beatName}`);
	if (data.beatBpm) lines.push(`BPM: ${data.beatBpm}`);
	if (data.beatKey) lines.push(`Tonalidad: ${data.beatKey}`);
	if (data.beatGenre) lines.push(`G\u00e9nero: ${data.beatGenre}`);
	lines.push(`Licencia: ${data.licenseName}`);
	lines.push(`Precio pactado: $${data.priceMXN} MXN / $${data.priceUSD} USD`);
	lines.push('');

	// Terms summary
	lines.push('T\u00c9RMINOS PRINCIPALES');
	lines.push('');
	lines.push('1. El PRODUCTOR otorga al ARTISTA una licencia de uso seg\u00fan el tipo de licencia adquirida.');
	lines.push('2. El PRODUCTOR retiene el 100% de la propiedad intelectual del beat original.');
	lines.push('3. El ARTISTA debe acreditar "Prod. by Dace" en todos los lanzamientos.');
	lines.push('4. Queda prohibido registrar el beat como obra propia o en Content ID sin autorizaci\u00f3n.');
	lines.push('5. La licencia es intransferible y no sublicenciable.');
	lines.push('6. El pago es \u00fanico e irrepetible, no genera regal\u00edas futuras.');
	lines.push('');
	lines.push('El contrato completo est\u00e1 disponible en:');
	lines.push(`https://dacewav.store/contracts/${data.contractFile}`);
	lines.push('');
	lines.push('Aceptaci\u00f3n por pago: El pago constituye aceptaci\u00f3n total de los t\u00e9rminos.');
	lines.push('');
	lines.push('________________________          ________________________');
	lines.push('       Dace                                    Artista');
	lines.push('  EL PRODUCTOR                         EL LICENCIATARIO');

	return buildPDF(lines.join('\n'));
}

/**
 * Build a minimal valid PDF from text content.
 * Uses WinAnsiEncoding for accented characters.
 */
function buildPDF(text: string): Uint8Array {
	const encoder = new TextEncoder();

	// Escape special PDF chars and handle accented characters
	function escapePDF(s: string): string {
		return s
			.replace(/\\/g, '\\\\')
			.replace(/\(/g, '\\(')
			.replace(/\)/g, '\\)')
			.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
			.replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U')
			.replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
			.replace(/ü/g, 'u').replace(/Ü/g, 'U');
	}

	const contentLines = text.split('\n');
	const pageHeight = 842; // A4
	const pageWidth = 595;
	const margin = 50;
	const fontSize = 10;
	const lineHeight = 14;
	const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

	// Split into pages
	const pages: string[][] = [];
	for (let i = 0; i < contentLines.length; i += maxLinesPerPage) {
		pages.push(contentLines.slice(i, i + maxLinesPerPage));
	}

	const objects: string[] = [];
	const objectOffsets: number[] = [];
	let pdf = '';

	// Header
	pdf += '%PDF-1.4\n';

	// Object 1: Catalog
	objectOffsets.push(pdf.length);
	objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

	// Object 2: Pages
	objectOffsets.push(pdf.length);
	const pageRefs = pages.map((_, i) => `${3 + i} 0 R`).join(' ');
	objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj\n`);

	// Page objects + content streams
	for (let pi = 0; pi < pages.length; pi++) {
		const pageObjIdx = 3 + pi;
		const contentObjIdx = 3 + pages.length + pi;

		// Page object
		objectOffsets.push(pdf.length);
		objects.push(`${pageObjIdx} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjIdx} 0 R /Resources << /Font << /F1 10 0 R >> >> >>\nendobj\n`);
	}

	// Content streams
	for (let pi = 0; pi < pages.length; pi++) {
		const contentObjIdx = 3 + pages.length + pi;
		const pageLines = pages[pi];

		let stream = 'BT\n/F1 ' + fontSize + ' Tf\n';
		for (let li = 0; li < pageLines.length; li++) {
			const y = pageHeight - margin - li * lineHeight;
			const escaped = escapePDF(pageLines[li]);
			stream += `${margin} ${y} Td\n(${escaped}) Tj\n0 -${lineHeight} Td\n`;
		}
		stream += 'ET';

		const streamBytes = encoder.encode(stream);
		objectOffsets.push(pdf.length);
		objects.push(`${contentObjIdx} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
	}

	// Font object (Helvetica)
	objectOffsets.push(pdf.length);
	objects.push('10 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

	// Write all objects
	for (const obj of objects) {
		pdf += obj;
	}

	// Cross-reference table
	const xrefOffset = pdf.length;
	pdf += 'xref\n';
	pdf += `0 ${objects.length + 1}\n`;
	pdf += '0000000000 65535 f \n';
	for (const offset of objectOffsets) {
		pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
	}

	// Trailer
	pdf += 'trailer\n';
	pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
	pdf += 'startxref\n';
	pdf += xrefOffset + '\n';
	pdf += '%%EOF\n';

	return encoder.encode(pdf);
}
