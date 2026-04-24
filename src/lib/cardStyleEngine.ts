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
 * - Animations (30+ presets del catalog)
 * - Shimmer overlay
 * - Cover effects
 */

export type GlowType = 'active' | 'rgb' | 'pulse' | 'breathe' | 'neon' | 'none';

export type CardAnimation =
	| 'none'
	| 'float'
	| 'hologram'
	| 'glitch'
	| 'colorShift'
	| 'shimmer'
	| 'borderGlow'
	| 'rotate3d'
	| 'breathe'
	| 'pulse'
	| 'neonFlicker'
	| 'slideDown'
	| 'slideUp'
	| 'fadeIn'
	| 'scaleIn'
	| 'jello'
	| 'wobble'
	| 'heartbeat'
	| 'tada'
	| 'rubberBand'
	| 'swing'
	| 'flash'
	| 'bounce'
	| 'shake'
	| 'headShake'
	| 'flip'
	| 'lightSpeed'
	| 'blurIn'
	| 'zoomPulse'
	| 'gradientBorder'
	| 'drift'
	| 'driftSlow'
	| 'spin'
	| 'spinReverse'
	| 'tilt'
	| 'sway'
	| 'popIn'
	| 'elastic'
	| 'dropIn'
	| 'riseUp'
	| 'flipX'
	| 'flipY'
	| 'rubber'
	| 'squeeze';

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
	animation?: CardAnimation;
	animationDuration?: string;  // e.g. "3s"
	animationDelay?: string;

	// Cover effects
	coverOverlay?: string;  // CSS gradient/overlay
	coverBlur?: number;     // px

	// Shimmer
	shimmer?: boolean;
	shimmerColor?: string;
	shimmerDuration?: string;
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
	animation: 'none',
};

/** Keyframe definitions for animation presets */
const ANIMATION_KEYFRAMES: Record<string, string> = {
	float: `@keyframes cardFloat {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}`,
	hologram: `@keyframes cardHologram {
		0% { filter: hue-rotate(0deg) brightness(1); }
		50% { filter: hue-rotate(180deg) brightness(1.1); }
		100% { filter: hue-rotate(360deg) brightness(1); }
	}`,
	glitch: `@keyframes cardGlitch {
		0%, 100% { transform: translate(0); }
		20% { transform: translate(-2px, 2px); }
		40% { transform: translate(-2px, -2px); }
		60% { transform: translate(2px, 2px); }
		80% { transform: translate(2px, -2px); }
	}`,
	colorShift: `@keyframes cardColorShift {
		0% { filter: hue-rotate(0deg); }
		100% { filter: hue-rotate(360deg); }
	}`,
	shimmer: `@keyframes cardShimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}`,
	borderGlow: `@keyframes cardBorderGlow {
		0%, 100% { border-color: rgba(var(--accent-rgb), 0.2); box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.1); }
		50% { border-color: rgba(var(--accent-rgb), 0.6); box-shadow: 0 0 25px rgba(var(--accent-rgb), 0.3); }
	}`,
	rotate3d: `@keyframes cardRotate3d {
		0%, 100% { transform: perspective(600px) rotateY(0deg); }
		50% { transform: perspective(600px) rotateY(5deg); }
	}`,
	jello: `@keyframes cardJello {
		0%, 100% { transform: none; }
		30% { transform: skewX(-12.5deg) skewY(-12.5deg); }
		40% { transform: skewX(6.25deg) skewY(6.25deg); }
		50% { transform: skewX(-3.125deg) skewY(-3.125deg); }
		65% { transform: skewX(1.5625deg) skewY(1.5625deg); }
		75% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
	}`,
	wobble: `@keyframes cardWobble {
		0%, 100% { transform: none; }
		15% { transform: translateX(-8px) rotate(-4deg); }
		30% { transform: translateX(6px) rotate(3deg); }
		45% { transform: translateX(-4px) rotate(-2deg); }
		60% { transform: translateX(2px) rotate(1deg); }
	}`,
	heartbeat: `@keyframes cardHeartbeat {
		0%, 100% { transform: scale(1); }
		14% { transform: scale(1.05); }
		28% { transform: scale(1); }
		42% { transform: scale(1.05); }
		70% { transform: scale(1); }
	}`,
	tada: `@keyframes cardTada {
		0%, 100% { transform: scale(1) rotate(0deg); }
		10%, 20% { transform: scale(0.9) rotate(-3deg); }
		30%, 50%, 70%, 90% { transform: scale(1.05) rotate(2deg); }
		40%, 60%, 80% { transform: scale(1.05) rotate(-2deg); }
	}`,
	rubberBand: `@keyframes cardRubberBand {
		0%, 100% { transform: scaleX(1) scaleY(1); }
		30% { transform: scaleX(1.15) scaleY(0.85); }
		40% { transform: scaleX(0.85) scaleY(1.15); }
		50% { transform: scaleX(1.08) scaleY(0.92); }
		65% { transform: scaleX(0.97) scaleY(1.03); }
		75% { transform: scaleX(1.02) scaleY(0.98); }
	}`,
	swing: `@keyframes cardSwing {
		20% { transform: rotate(8deg); }
		40% { transform: rotate(-6deg); }
		60% { transform: rotate(4deg); }
		80% { transform: rotate(-2deg); }
		100% { transform: rotate(0deg); }
	}`,
	flash: `@keyframes cardFlash {
		0%, 50%, 100% { opacity: 1; }
		25%, 75% { opacity: 0; }
	}`,
	bounce: `@keyframes cardBounce {
		0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
		40% { transform: translateY(-12px); }
		60% { transform: translateY(-6px); }
	}`,
	shake: `@keyframes cardShake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
		20%, 40%, 60%, 80% { transform: translateX(4px); }
	}`,
	headShake: `@keyframes cardHeadShake {
		0%, 100% { transform: translateX(0) rotateY(0); }
		6.5% { transform: translateX(-4px) rotateY(-4deg); }
		18.5% { transform: translateX(3px) rotateY(3deg); }
		31.5% { transform: translateX(-2px) rotateY(-2deg); }
		43.5% { transform: translateX(1px) rotateY(1deg); }
	}`,
	flip: `@keyframes cardFlip {
		0% { transform: perspective(400px) rotateY(0); }
		40% { transform: perspective(400px) rotateY(180deg); }
		100% { transform: perspective(400px) rotateY(360deg); }
	}`,
	lightSpeed: `@keyframes cardLightSpeed {
		0% { transform: translateX(100%) skewX(-30deg); opacity: 0; }
		60% { transform: skewX(20deg); opacity: 1; }
		80% { transform: skewX(-5deg); }
		100% { transform: none; }
	}`,
	blurIn: `@keyframes cardBlurIn {
		0% { filter: blur(8px); opacity: 0; }
		100% { filter: blur(0); opacity: 1; }
	}`,
	zoomPulse: `@keyframes cardZoomPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.04); }
	}`,
	gradientBorder: `@keyframes cardGradientBorder {
		0% { border-image-source: linear-gradient(0deg, var(--accent), transparent); }
		25% { border-image-source: linear-gradient(90deg, var(--accent), transparent); }
		50% { border-image-source: linear-gradient(180deg, var(--accent), transparent); }
		75% { border-image-source: linear-gradient(270deg, var(--accent), transparent); }
		100% { border-image-source: linear-gradient(360deg, var(--accent), transparent); }
	}`,
	drift: `@keyframes cardDrift {
		0%, 100% { transform: translate(0, 0) rotate(0deg); }
		25% { transform: translate(3px, -4px) rotate(0.5deg); }
		50% { transform: translate(-2px, -6px) rotate(-0.3deg); }
		75% { transform: translate(4px, -2px) rotate(0.2deg); }
	}`,
	spin: `@keyframes cardSpin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}`,
	tilt: `@keyframes cardTilt {
		0%, 100% { transform: perspective(600px) rotateX(0deg) rotateY(0deg); }
		25% { transform: perspective(600px) rotateX(2deg) rotateY(3deg); }
		75% { transform: perspective(600px) rotateX(-2deg) rotateY(-3deg); }
	}`,
	sway: `@keyframes cardSway {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(2deg); }
		75% { transform: rotate(-2deg); }
	}`,
	popIn: `@keyframes cardPopIn {
		0% { transform: scale(0.8); opacity: 0; }
		60% { transform: scale(1.05); opacity: 1; }
		100% { transform: scale(1); }
	}`,
	elastic: `@keyframes cardElastic {
		0% { transform: scale(0); }
		55% { transform: scale(1.08); }
		70% { transform: scale(0.96); }
		85% { transform: scale(1.02); }
		100% { transform: scale(1); }
	}`,
	dropIn: `@keyframes cardDropIn {
		0% { transform: translateY(-30px) scale(0.9); opacity: 0; }
		60% { transform: translateY(4px) scale(1.02); opacity: 1; }
		100% { transform: translateY(0) scale(1); }
	}`,
	riseUp: `@keyframes cardRiseUp {
		0% { transform: translateY(20px); opacity: 0; }
		100% { transform: translateY(0); opacity: 1; }
	}`,
	flipX: `@keyframes cardFlipX {
		0% { transform: perspective(400px) rotateX(0); }
		100% { transform: perspective(400px) rotateX(360deg); }
	}`,
	flipY: `@keyframes cardFlipY {
		0% { transform: perspective(400px) rotateY(0); }
		100% { transform: perspective(400px) rotateY(360deg); }
	}`,
	rubber: `@keyframes cardRubber {
		0%, 100% { transform: scaleX(1) scaleY(1); }
		30% { transform: scaleX(1.12) scaleY(0.88); }
		60% { transform: scaleX(0.92) scaleY(1.08); }
	}`,
	squeeze: `@keyframes cardSqueeze {
		0%, 100% { transform: scaleX(1) scaleY(1); }
		50% { transform: scaleX(0.95) scaleY(1.05); }
	}`,
};

/**
 * Get all keyframe definitions (for injection into a <style> block)
 */
export function getAllKeyframes(): string {
	return Object.values(ANIMATION_KEYFRAMES).join('\n');
}

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

	// Animation preset
	if (style.animation && style.animation !== 'none') {
		const duration = style.animationDuration || '3s';
		const delay = style.animationDelay || '';
		const animMap: Record<string, string> = {
			float: `cardFloat ${duration} ease-in-out infinite ${delay}`,
			hologram: `cardHologram ${duration} linear infinite ${delay}`,
			glitch: `cardGlitch 0.3s linear infinite ${delay}`,
			colorShift: `cardColorShift ${duration} linear infinite ${delay}`,
			shimmer: `cardShimmer 2s ease-in-out infinite ${delay}`,
			borderGlow: `cardBorderGlow ${duration} ease-in-out infinite ${delay}`,
			rotate3d: `cardRotate3d ${duration} ease-in-out infinite ${delay}`,
			breathe: `glowBreathe ${duration} ease-in-out infinite ${delay}`,
			pulse: `glowPulse ${duration} ease-in-out infinite ${delay}`,
			neonFlicker: `neonFlicker ${duration} ease-in-out infinite ${delay}`,
			slideDown: `slideDown 0.4s var(--ease-out) ${delay}`,
			slideUp: `slideUp 0.4s var(--ease-out) ${delay}`,
			fadeIn: `fadeIn 0.4s var(--ease-out) ${delay}`,
			scaleIn: `scaleIn 0.3s var(--ease-out) ${delay}`,
			jello: `cardJello 1s ease-in-out infinite ${delay}`,
			wobble: `cardWobble 1s ease-in-out infinite ${delay}`,
			heartbeat: `cardHeartbeat 1.5s ease-in-out infinite ${delay}`,
			tada: `cardTada 1s ease-in-out infinite ${delay}`,
			rubberBand: `cardRubberBand 1s ease-in-out infinite ${delay}`,
			swing: `cardSwing 1s ease-in-out ${delay}`,
			flash: `cardFlash 1s ease-in-out infinite ${delay}`,
			bounce: `cardBounce 1s ease-in-out infinite ${delay}`,
			shake: `cardShake 0.8s ease-in-out infinite ${delay}`,
			headShake: `cardHeadShake 0.8s ease-in-out infinite ${delay}`,
			flip: `cardFlip 1s ease-in-out ${delay}`,
			lightSpeed: `cardLightSpeed 1s ease-out ${delay}`,
			blurIn: `cardBlurIn 0.6s ease-out ${delay}`,
			zoomPulse: `cardZoomPulse ${duration} ease-in-out infinite ${delay}`,
			gradientBorder: `cardGradientBorder 4s linear infinite ${delay}`,
			drift: `cardDrift ${duration} ease-in-out infinite ${delay}`,
			driftSlow: `cardDrift ${parseFloat(duration) * 2}s ease-in-out infinite ${delay}`,
			spin: `cardSpin ${duration} linear infinite ${delay}`,
			spinReverse: `cardSpin ${duration} linear infinite reverse ${delay}`,
			tilt: `cardTilt ${duration} ease-in-out infinite ${delay}`,
			sway: `cardSway ${duration} ease-in-out infinite ${delay}`,
			popIn: `cardPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}`,
			elastic: `cardElastic 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}`,
			dropIn: `cardDropIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}`,
			riseUp: `cardRiseUp 0.5s var(--ease-out) ${delay}`,
			flipX: `cardFlipX 0.8s ease-in-out ${delay}`,
			flipY: `cardFlipY 0.8s ease-in-out ${delay}`,
			rubber: `cardRubber 0.8s ease-in-out infinite ${delay}`,
			squeeze: `cardSqueeze 0.6s ease-in-out infinite ${delay}`,
		};
		if (animMap[style.animation]) {
			parts.push(`animation: ${animMap[style.animation]};`);
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

/**
 * Genera shimmer overlay styles
 */
export function shimmerCSS(style: CardStyleConfig): string {
	if (!style.shimmer) return '';
	return `position: relative; overflow: hidden;`;
}
