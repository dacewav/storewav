import { describe, it, expect } from 'vitest';
import {
	hexToRgb,
	rgbToHex,
	hexToHsl,
	hslToHex,
	generatePalette,
	generateHarmony,
	contrastRatio
} from '$lib/colorPalette';

describe('colorPalette', () => {
	it('hexToRgb parses 6-digit hex', () => {
		expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
		expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
		expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
		expect(hexToRgb('#dc2626')).toEqual([220, 38, 38]);
	});

	it('hexToRgb parses 3-digit hex', () => {
		expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
		expect(hexToRgb('#abc')).toEqual([170, 187, 204]);
	});

	it('rgbToHex converts correctly', () => {
		expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
		expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
		expect(rgbToHex(220, 38, 38)).toBe('#dc2626');
	});

	it('hex → rgb → hex roundtrips', () => {
		const colors = ['#dc2626', '#3b82f6', '#10b981', '#000000', '#ffffff'];
		for (const hex of colors) {
			const [r, g, b] = hexToRgb(hex);
			expect(rgbToHex(r, g, b)).toBe(hex);
		}
	});

	it('hexToHsl returns valid HSL', () => {
		const [h, s, l] = hexToHsl('#ff0000');
		expect(h).toBeCloseTo(0, 0);
		expect(s).toBeCloseTo(1, 1);
		expect(l).toBeCloseTo(0.5, 1);
	});

	it('hslToHex converts back', () => {
		expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
		expect(hslToHex(120, 1, 0.5)).toBe('#00ff00');
		expect(hslToHex(240, 1, 0.5)).toBe('#0000ff');
	});

	it('generatePalette returns 11 shades', () => {
		const palette = generatePalette('#dc2626');
		expect(palette).toHaveLength(11);
		expect(palette[0].name).toBe('50');
		expect(palette[10].name).toBe('950');
		// All have valid hex
		for (const shade of palette) {
			expect(shade.hex).toMatch(/^#[0-9a-f]{6}$/);
			expect(shade.rgb).toMatch(/^\d+, \d+, \d+$/);
		}
	});

	it('palette shades go from light to dark', () => {
		const palette = generatePalette('#3b82f6');
		for (let i = 1; i < palette.length; i++) {
			const [, , lPrev] = hexToHsl(palette[i - 1].hex);
			const [, , lCurr] = hexToHsl(palette[i].hex);
			expect(lCurr).toBeLessThan(lPrev);
		}
	});

	it('generateHarmony returns 6 colors', () => {
		const harmony = generateHarmony('#dc2626');
		expect(harmony).toHaveLength(6);
		expect(harmony[0].name).toBe('Accent');
		expect(harmony[0].hex).toBe('#dc2626');
	});

	it('contrastRatio is symmetric and >= 1', () => {
		const r1 = contrastRatio('#000000', '#ffffff');
		const r2 = contrastRatio('#ffffff', '#000000');
		expect(r1).toBeCloseTo(21, 0);
		expect(r2).toBeCloseTo(21, 0);
		expect(contrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1, 0);
	});
});
