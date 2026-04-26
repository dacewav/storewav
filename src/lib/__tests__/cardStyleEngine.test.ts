import { describe, it, expect } from 'vitest';
import { mergeCardStyles, cardStyleToCSS } from '../cardStyleEngine';

describe('mergeCardStyles', () => {
	it('returns defaults when no overrides', () => {
		const result = mergeCardStyles({}, {});
		expect(result.glow).toBe('none');
		expect(result.animation).toBe('none');
		expect(result.shimmer).toBeFalsy();
	});

	it('global overrides defaults', () => {
		const result = mergeCardStyles({ glow: 'active', brightness: 1.2 }, {});
		expect(result.glow).toBe('active');
		expect(result.brightness).toBe(1.2);
	});

	it('perBeat overrides global', () => {
		const result = mergeCardStyles(
			{ glow: 'active', brightness: 1.0 },
			{ glow: 'neon', brightness: 1.5 }
		);
		expect(result.glow).toBe('neon');
		expect(result.brightness).toBe(1.5);
	});

	it('custom overrides perBeat', () => {
		const result = mergeCardStyles(
			{ glow: 'active' },
			{ glow: 'neon' },
			{ glow: 'pulse' }
		);
		expect(result.glow).toBe('pulse');
	});

	it('preserves fields not overridden', () => {
		const result = mergeCardStyles(
			{ glow: 'active', animation: 'float' },
			{ glow: 'neon' }
		);
		expect(result.glow).toBe('neon');
		expect(result.animation).toBe('float');
	});
});

describe('cardStyleToCSS', () => {
	it('returns empty string for default style', () => {
		const result = cardStyleToCSS(
			mergeCardStyles({}, {}),
			'220, 38, 38'
		);
		// Default style has no filters, no transforms, no shadows
		expect(result).toBe('');
	});

	it('generates brightness filter', () => {
		const style = mergeCardStyles({ brightness: 1.3 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('brightness(1.3)');
	});

	it('generates multiple filters', () => {
		const style = mergeCardStyles({ brightness: 1.2, contrast: 1.1, saturate: 1.5 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('brightness(1.2)');
		expect(result).toContain('contrast(1.1)');
		expect(result).toContain('saturate(1.5)');
	});

	it('generates transform for scale', () => {
		const style = mergeCardStyles({ scale: 1.05 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('transform');
		expect(result).toContain('scale(1.05)');
	});

	it('generates box-shadow for boxShadow', () => {
		const style = mergeCardStyles({ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('box-shadow');
	});
});

import { getAllKeyframes } from '../cardStyleEngine';

describe('animIntensity --anim-int', () => {
	it('does not generate --anim-int at default (100)', () => {
		const style = mergeCardStyles({ animIntensity: 100 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).not.toContain('--anim-int');
	});

	it('generates --anim-int at 50%', () => {
		const style = mergeCardStyles({ animIntensity: 50 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('--anim-int: 0.5;');
	});

	it('generates --anim-int at 0%', () => {
		const style = mergeCardStyles({ animIntensity: 0 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('--anim-int: 0;');
	});

	it('generates --anim-int at 75%', () => {
		const style = mergeCardStyles({ animIntensity: 75 }, {});
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('--anim-int: 0.75;');
	});

	it('perBeat animIntensity overrides global', () => {
		const style = mergeCardStyles({ animIntensity: 100 }, { animIntensity: 25 });
		const result = cardStyleToCSS(style, '220, 38, 38');
		expect(result).toContain('--anim-int: 0.25;');
	});

	it('keyframes contain var(--anim-int)', () => {
		const keyframes = getAllKeyframes();
		expect(keyframes).toContain('var(--anim-int, 1)');
	});
});
