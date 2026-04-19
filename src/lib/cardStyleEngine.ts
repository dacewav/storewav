/**
 * Card Style Engine — merge global + per-beat styles
 *
 * Simplificado del catalog v5.2. Soporta:
 * - Glow (5 tipos)
 * - Filters CSS (brightness, contrast, saturate, etc.)
 * - Border custom
 * - Shadow custom
 * - Transform
 * - Hover effects
 * - Animations (preset names)
 */

export type GlowType = 'active' | 'rgb' | 'pulse' | 'breathe' | 'neon' | 'none';

export type CardStyleConfig = {
	// Glow
	glow?: GlowType;
	glowColor?: string;
	glowIntensity?: number; // 0-1

	// Filters
	brightness?: number;    // 0-2, default 1
	contrast?: number;      // 0-2, default 1
	saturate?: number;      // 0-3, default 1
	grayscale?: number;     // 0-1
	sepia?: number;         // 0-1
	hueRotate?: number;     // 0-360 deg
	invert?: number;        // 0-1

	// Border
	borderWidth?: string;
	borderStyle?: string;
	borderColor?: string;
	borderRadius?: string;

	// Shadow
	boxShadow?: string;

	// Transform
	rotate?: number;        // deg
	scale?: number;         // 0.5-1.5
	skew?: string;          // "10deg, 0"
	translateY?: string;

	// Hover
	hoverScale?: number;
	hoverBrightness?: number;
	hoverBlur?: number;
	hoverSaturate?: number;

	// Animation
	animation?: string;     // CSS animation shorthand
	animationName?: string; // keyframe name

	// Cover effects
	coverOverlay?: string;  // CSS gradient/overlay
	coverBlur?: number;     // px
};

const DEFAULT: CardStyleConfig = {
	glow: 'none',
	brightness: 1,
	contrast: 1,
	saturate: 1,
	grayscale: 0,
	sepia: 0,
	hueRotate: 0,
	invert: 0,
	hoverScale: 1.02,
	hoverBrightness: 1.05,
};

/**
 * Merge global + per-beat + custom overrides
 */
export function mergeCardStyles(
	global: Partial<CardStyleConfig>,
	perBeat: Partial<CardStyleConfig>,
	custom?: Partial<CardStyleConfig>
): CardStyleConfig {
	return { ...DEFAULT, ...global, ...perBeat, ...custom };
}

/**
 * Genera CSS inline string desde config
 */
export function cardStyleToCSS(style: CardStyleConfig, accentRgb: string): string {
	const parts: string[] = [];

	// Filter
	const filters: string[] = [];
	if (style.brightness !== undefined && style.brightness !== 1) filters.push(`brightness(${style.brightness})`);
	if (style.contrast !== undefined && style.contrast !== 1) filters.push(`contrast(${style.contrast})`);
	if (style.saturate !== undefined && style.saturate !== 1) filters.push(`saturate(${style.saturate})`);
	if (style.grayscale) filters.push(`grayscale(${style.grayscale})`);
	if (style.sepia) filters.push(`sepia(${style.sepia})`);
	if (style.hueRotate) filters.push(`hue-rotate(${style.hueRotate}deg)`);
	if (style.invert) filters.push(`invert(${style.invert})`);
	if (filters.length) parts.push(`filter: ${filters.join(' ')};`);

	// Border
	if (style.borderWidth) parts.push(`border-width: ${style.borderWidth};`);
	if (style.borderStyle) parts.push(`border-style: ${style.borderStyle};`);
	if (style.borderColor) parts.push(`border-color: ${style.borderColor};`);
	if (style.borderRadius) parts.push(`border-radius: ${style.borderRadius};`);

	// Shadow
	if (style.boxShadow) parts.push(`box-shadow: ${style.boxShadow};`);

	// Transform
	const transforms: string[] = [];
	if (style.rotate) transforms.push(`rotate(${style.rotate}deg)`);
	if (style.scale) transforms.push(`scale(${style.scale})`);
	if (style.skew) transforms.push(`skew(${style.skew})`);
	if (style.translateY) transforms.push(`translateY(${style.translateY})`);
	if (transforms.length) parts.push(`transform: ${transforms.join(' ')};`);

	// Animation
	if (style.animation) parts.push(`animation: ${style.animation};`);

	// Glow via box-shadow
	if (style.glow && style.glow !== 'none') {
		const color = style.glowColor || `rgba(${accentRgb}, 0.3)`;
		const intensity = style.glowIntensity ?? 1;
		switch (style.glow) {
			case 'active':
				parts.push(`box-shadow: 0 0 ${20 * intensity}px ${color};`);
				break;
			case 'rgb':
				parts.push(`box-shadow: 0 0 ${30 * intensity}px ${color}, 0 0 ${60 * intensity}px ${color};`);
				break;
			case 'pulse':
				parts.push(`animation: glowPulse 2s ease-in-out infinite;`);
				break;
			case 'breathe':
				parts.push(`animation: glowBreathe 3s ease-in-out infinite;`);
				break;
			case 'neon':
				parts.push(`animation: neonFlicker 4s ease-in-out infinite;`);
				break;
		}
	}

	return parts.join(' ');
}

/**
 * Genera hover CSS class name
 */
export function cardHoverClass(style: CardStyleConfig): string {
	if (!style.hoverScale && !style.hoverBrightness && !style.hoverBlur && !style.hoverSaturate) {
		return '';
	}
	return 'card-custom-hover';
}

/**
 * Genera hover inline styles CSS (para <style> block)
 */
export function cardHoverCSS(style: CardStyleConfig, accentRgb: string): string {
	const parts: string[] = [];

	if (style.hoverScale) parts.push(`transform: scale(${style.hoverScale});`);
	if (style.hoverBrightness || style.hoverSaturate || style.hoverBlur) {
		const filters: string[] = [];
		if (style.hoverBrightness) filters.push(`brightness(${style.hoverBrightness})`);
		if (style.hoverSaturate) filters.push(`saturate(${style.hoverSaturate})`);
		if (style.hoverBlur) filters.push(`blur(${style.hoverBlur}px)`);
		parts.push(`filter: ${filters.join(' ')};`);
	}

	return parts.join(' ');
}
