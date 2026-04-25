/**
 * Color palette utilities
 * Generates shade palettes from a base hex color
 */

/** Parse hex (#rrggbb or #rgb) to [r, g, b] */
export function hexToRgb(hex: string): [number, number, number] {
	let h = hex.replace('#', '');
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	const n = parseInt(h, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** [r, g, b] → "#rrggbb" */
export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** Hex → HSL [h 0-360, s 0-1, l 0-1] */
export function hexToHsl(hex: string): [number, number, number] {
	const [r, g, b] = hexToRgb(hex);
	const rf = r / 255, gf = g / 255, bf = b / 255;
	const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h = 0;
	if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
	else if (max === gf) h = ((bf - rf) / d + 2) / 6;
	else h = ((rf - gf) / d + 4) / 6;
	return [h * 360, s, l];
}

/** HSL → hex */
export function hslToHex(h: number, s: number, l: number): string {
	h = ((h % 360) + 360) % 360;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r = 0, g = 0, b = 0;
	if (h < 60) { r = c; g = x; }
	else if (h < 120) { r = x; g = c; }
	else if (h < 180) { g = c; b = x; }
	else if (h < 240) { g = x; b = c; }
	else if (h < 300) { r = x; b = c; }
	else { r = c; b = x; }
	return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export type PaletteShade = {
	name: string;   // "50", "100", "200", ... "950"
	hex: string;
	rgb: string;    // "r, g, b"
};

/**
 * Generate a full palette (50-950) from a base accent color.
 * Uses HSL lightness manipulation for perceptually even shades.
 */
export function generatePalette(accent: string): PaletteShade[] {
	const [h, s] = hexToHsl(accent);

	// Target lightness values for each shade (Tailwind-inspired)
	const targets: Array<{ name: string; l: number }> = [
		{ name: '50',  l: 0.97 },
		{ name: '100', l: 0.93 },
		{ name: '200', l: 0.86 },
		{ name: '300', l: 0.74 },
		{ name: '400', l: 0.60 },
		{ name: '500', l: 0.45 },
		{ name: '600', l: 0.37 },
		{ name: '700', l: 0.30 },
		{ name: '800', l: 0.24 },
		{ name: '900', l: 0.18 },
		{ name: '950', l: 0.10 },
	];

	return targets.map(({ name, l }) => {
		// Slightly desaturate very light/dark shades for natural feel
		const sAdj = s * (l > 0.9 || l < 0.15 ? 0.7 : 1);
		const hex = hslToHex(h, sAdj, l);
		const [r, g, b] = hexToRgb(hex);
		return { name, hex, rgb: `${r}, ${g}, ${b}` };
	});
}

/**
 * Generate a complementary palette (accent + analogous + complementary)
 */
export function generateHarmony(accent: string): Array<{ name: string; hex: string }> {
	const [h, s, l] = hexToHsl(accent);
	return [
		{ name: 'Accent',      hex: accent },
		{ name: 'Analogous -', hex: hslToHex(h - 30, s, l) },
		{ name: 'Analogous +', hex: hslToHex(h + 30, s, l) },
		{ name: 'Complement',  hex: hslToHex(h + 180, s, l) },
		{ name: 'Triadic -',   hex: hslToHex(h - 120, s, l) },
		{ name: 'Triadic +',   hex: hslToHex(h + 120, s, l) },
	];
}

/** Contrast ratio (WCAG) between two hex colors */
export function contrastRatio(hex1: string, hex2: string): number {
	const lum1 = relativeLuminance(...hexToRgb(hex1));
	const lum2 = relativeLuminance(...hexToRgb(hex2));
	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);
	return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
