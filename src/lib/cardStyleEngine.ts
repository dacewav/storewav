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
	glowEnabled?: boolean;
	glowColor?: string;
	glowSpeed?: number;        // seconds
	glowIntensity?: number;    // 0-1
	glowBlur?: number;         // px
	glowOpacity?: number;      // 0-1
	glowHoverOnly?: boolean;

	// Filters
	brightness?: number;    // 0-2, default 1
	contrast?: number;      // 0-2, default 1
	saturate?: number;      // 0-3, default 1
	grayscale?: number;     // 0-1
	sepia?: number;         // 0-1
	hueRotate?: number;     // 0-360 deg
	invert?: number;        // 0-1

	// Border
	borderEnabled?: boolean;
	borderWidth?: string;
	borderStyle?: string;
	borderColor?: string;
	borderRadius?: string;

	// Shadow
	boxShadow?: string;
	shadowEnabled?: boolean;
	shadowColor?: string;
	shadowOpacity?: number;    // 0-1
	shadowX?: number;          // px
	shadowY?: number;          // px
	shadowBlur?: number;       // px
	shadowSpread?: number;     // px
	shadowInset?: boolean;

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
	hoverShadowBlur?: number;      // px
	hoverTransition?: number;      // seconds
	hoverBorderColor?: string;
	hoverGlowIntensify?: boolean;
	hoverSiblingsBlur?: number;    // px
	hoverHueRotate?: number;       // deg
	hoverOpacity?: number;         // 0-1

	// Animation
	animation?: CardAnimation;
	animationDuration?: string;  // e.g. "3s"
	animationDelay?: string;
	animType?: string;           // catalog anim type (holograma, flotar, glitch, respirar)
	animDur?: number;            // seconds
	animDelay?: number;          // seconds
	animEasing?: string;         // CSS easing
	animIntensity?: number;      // 0-100, default 100. Controls animation strength via --anim-int CSS var

	// Cover effects
	coverOverlay?: string;  // CSS gradient/overlay
	coverBlur?: number;     // px

	// Shimmer
	shimmer?: boolean;
	shimmerColor?: string;
	shimmerSpeed?: number;       // seconds
	shimmerDuration?: string;
	shimmerOpacity?: number; // 0-1, controls shimmer overlay intensity

	// ── NEW: Card background ──
	cardBg?: string;           // CSS background (color, gradient)
	cardBgOpacity?: number;    // 0-1

	// ── NEW: Title typography ──
	titleSize?: string;        // CSS font-size (e.g. "1rem")
	titleWeight?: number;      // 100-900
	titleColor?: string;       // hex color
	titleAlign?: string;       // left, center, right

	// ── NEW: Price display ──
	priceSize?: string;        // CSS font-size
	priceColor?: string;       // hex color
	priceBadge?: boolean;      // show as badge

	// ── NEW: Tag pills ──
	tagBg?: string;            // background color
	tagColor?: string;         // text color
	tagRadius?: string;        // border-radius
	tagSize?: string;          // font-size

	// ── NEW: Image ──
	imageAspect?: string;      // aspect-ratio (e.g. "1/1", "4/3", "16/9")
	imageHoverZoom?: number;   // scale on hover (e.g. 1.05)
	imageObjectFit?: string;   // cover, contain, fill

	// ── NEW: Layout ──
	cardPadding?: string;      // internal padding
	infoBg?: string;           // background for info section below image
	gap?: string;              // gap between card elements

	// ── NEW: Sibling hover effect ──
	siblingHoverEffect?: 'blur' | 'dim' | 'scale-down' | 'none';
	siblingHoverBlur?: number;      // px, default: 3
	siblingHoverOpacity?: number;   // 0-1, default: 0.6
	siblingHoverScale?: number;     // e.g. 0.95
	siblingHoverDuration?: string;  // default: '0.3s'
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
	animIntensity: 100,
};

// ═══ Premium Card Effect Presets ═══
// Imported from catalog's 13 premium presets (Limpio, Cine, Noir, Retiro, Brasa, Escarcha, Cristal, Holo, Flota, Glitch, Eco, Pop, Abismo)

export type PresetId = 'none' | 'film' | 'noir' | 'vintage' | 'ember' | 'frost' | 'crystal' | 'hologram' | 'float' | 'glitch' | 'ghost' | 'pop' | 'deep';

export interface CardPreset {
	id: PresetId;
	name: string;
	desc: string;
	config: CardStyleConfig;
}

export const PRESETS: Record<PresetId, CardPreset> = {
	none: {
		id: 'none',
		name: 'Limpio',
		desc: 'Sin efectos',
		config: {
			brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '0px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: false, shadowColor: '#000000', shadowOpacity: 0.35, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowSpread: 0, shadowInset: false,
			hoverScale: 1, hoverBrightness: 1, hoverSaturate: 1, hoverShadowBlur: 0, hoverTransition: 0.3, hoverBorderColor: '#dc2626', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 0, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	film: {
		id: 'film',
		name: 'Cine',
		desc: 'Desaturación sutil, contraste cinematográfico, grano orgánico',
		config: {
			brightness: 0.97, contrast: 1.15, saturate: 0.75, grayscale: 0.3, sepia: 0.1, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '4px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#1c1917', shadowOpacity: 0.6, shadowX: 0, shadowY: 8, shadowBlur: 24, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.02, hoverBrightness: 1.12, hoverSaturate: 0.85, hoverShadowBlur: 30, hoverTransition: 0.4, hoverBorderColor: '#78716c', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 2, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	noir: {
		id: 'noir',
		name: 'Noir',
		desc: 'Alto contraste B&W, sombras profundas, elegancia clásica',
		config: {
			brightness: 0.9, contrast: 1.4, saturate: 0, grayscale: 1, sepia: 0, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '2px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#0c0a09', shadowOpacity: 0.7, shadowX: 0, shadowY: 10, shadowBlur: 28, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.03, hoverBrightness: 1.2, hoverSaturate: 0, hoverShadowBlur: 35, hoverTransition: 0.35, hoverBorderColor: '#d6d3d1', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 3, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	vintage: {
		id: 'vintage',
		name: 'Retiro',
		desc: 'Sepia cálido, bordes suaves, atmósfera nostálgica',
		config: {
			brightness: 0.95, contrast: 1.05, saturate: 0.85, grayscale: 0, sepia: 0.6, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '8px', cardBgOpacity: 1,
			borderEnabled: true, borderColor: '#78716c', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#44403c', shadowOpacity: 0.4, shadowX: 0, shadowY: 6, shadowBlur: 20, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.02, hoverBrightness: 1.1, hoverSaturate: 1, hoverShadowBlur: 24, hoverTransition: 0.45, hoverBorderColor: '#a68a64', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 2, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	ember: {
		id: 'ember',
		name: 'Brasa',
		desc: 'Glow cálido contenido, profundidad sin saturación excesiva',
		config: {
			brightness: 1.05, contrast: 1.1, saturate: 1.2, grayscale: 0, sepia: 0.05, hueRotate: 0,
			glowEnabled: true, glow: 'pulse', glowColor: '#c2410c', glowSpeed: 2.5, glowIntensity: 1.1, glowBlur: 25, glowOpacity: 0.55, glowHoverOnly: false,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '6px', cardBgOpacity: 1,
			borderEnabled: true, borderColor: '#9a3412', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#431407', shadowOpacity: 0.5, shadowX: 0, shadowY: 8, shadowBlur: 22, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.03, hoverBrightness: 1.2, hoverSaturate: 1.3, hoverShadowBlur: 0, hoverTransition: 0.3, hoverBorderColor: '#f97316', hoverGlowIntensify: true, hoverBlur: 0, hoverSiblingsBlur: 4, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	frost: {
		id: 'frost',
		name: 'Escarcha',
		desc: 'Tinte frío, glow tenue solo en hover, pulido helado',
		config: {
			brightness: 1.08, contrast: 1.05, saturate: 0.85, grayscale: 0, sepia: 0, hueRotate: -5,
			glowEnabled: true, glow: 'breathe', glowColor: '#0e7490', glowSpeed: 5, glowIntensity: 0.8, glowBlur: 28, glowOpacity: 0.4, glowHoverOnly: true,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: true, shimmerSpeed: 3, shimmerOpacity: 0.04,
			borderRadius: '10px', cardBgOpacity: 1,
			borderEnabled: true, borderColor: '#155e75', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#083344', shadowOpacity: 0.45, shadowX: 0, shadowY: 6, shadowBlur: 18, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.03, hoverBrightness: 1.15, hoverSaturate: 1, hoverShadowBlur: 0, hoverTransition: 0.4, hoverBorderColor: '#67e8f9', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 3, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	crystal: {
		id: 'crystal',
		name: 'Cristal',
		desc: 'Glassmorphism con refracción interior, bordes iluminados',
		config: {
			brightness: 1.1, contrast: 1.05, saturate: 1.1, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: true, glow: 'breathe', glowColor: '#6366f1', glowSpeed: 4, glowIntensity: 0.7, glowBlur: 30, glowOpacity: 0.35, glowHoverOnly: true,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: true, shimmerSpeed: 3, shimmerOpacity: 0.04,
			borderRadius: '14px', cardBgOpacity: 0.92,
			borderEnabled: true, borderColor: 'rgba(255,255,255,0.08)', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#1e1b4b', shadowOpacity: 0.4, shadowX: 0, shadowY: 10, shadowBlur: 30, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.04, hoverBrightness: 1.2, hoverSaturate: 1.15, hoverShadowBlur: 0, hoverTransition: 0.35, hoverBorderColor: 'rgba(255,255,255,0.2)', hoverGlowIntensify: true, hoverBlur: 0, hoverSiblingsBlur: 5, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	hologram: {
		id: 'hologram',
		name: 'Holo',
		desc: 'Ciclo de tono iridiscente, brillo orgánico, no neón genérico',
		config: {
			brightness: 1.05, contrast: 1.08, saturate: 1.2, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: true, glow: 'rgb', glowColor: '#7c2d12', glowSpeed: 6, glowIntensity: 0.8, glowBlur: 22, glowOpacity: 0.45, glowHoverOnly: false,
			animation: 'hologram', animType: 'holograma', animDur: 5, animDelay: 0, animEasing: 'ease-in-out',
			shimmer: true, shimmerSpeed: 3, shimmerOpacity: 0.04,
			borderRadius: '10px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#1c1917', shadowOpacity: 0.35, shadowX: 0, shadowY: 6, shadowBlur: 20, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.04, hoverBrightness: 1.2, hoverSaturate: 1.3, hoverShadowBlur: 0, hoverTransition: 0.3, hoverBorderColor: '#fbbf24', hoverGlowIntensify: true, hoverBlur: 0, hoverSiblingsBlur: 4, hoverHueRotate: 15, hoverOpacity: 1,
		},
	},
	float: {
		id: 'float',
		name: 'Flota',
		desc: 'Flotación sutil, sombra difusa, sensación etérea',
		config: {
			brightness: 1.05, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'float', animType: 'flotar', animDur: 4, animDelay: 0, animEasing: 'ease-in-out',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '12px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#1c1917', shadowOpacity: 0.25, shadowX: 0, shadowY: 12, shadowBlur: 30, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.04, hoverBrightness: 1.1, hoverSaturate: 1, hoverShadowBlur: 40, hoverTransition: 0.4, hoverBorderColor: '#a8a29e', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 3, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	glitch: {
		id: 'glitch',
		name: 'Glitch',
		desc: 'Distorsión controlada, aberración cromática sutil',
		config: {
			brightness: 1.05, contrast: 1.2, saturate: 1.5, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'glitch', animType: 'glitch', animDur: 0.4, animDelay: 0, animEasing: 'steps(2)',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '0px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: false, shadowColor: '#000000', shadowOpacity: 0.35, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowSpread: 0, shadowInset: false,
			hoverScale: 1, hoverBrightness: 1.3, hoverSaturate: 1.8, hoverShadowBlur: 0, hoverTransition: 0.1, hoverBorderColor: '#ef4444', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 0, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	ghost: {
		id: 'ghost',
		name: 'Eco',
		desc: 'Translucidez etérea, respiración lenta, aura índigo',
		config: {
			brightness: 1, contrast: 0.92, saturate: 0.7, grayscale: 0.2, sepia: 0, hueRotate: 0,
			glowEnabled: true, glow: 'breathe', glowColor: '#6366f1', glowSpeed: 6, glowIntensity: 0.6, glowBlur: 32, glowOpacity: 0.3, glowHoverOnly: false,
			animation: 'breathe', animType: 'respirar', animDur: 6, animDelay: 0, animEasing: 'ease-in-out',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '14px', cardBgOpacity: 0.75,
			borderEnabled: true, borderColor: 'rgba(99,102,241,0.2)', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: false, shadowColor: '#4338ca', shadowOpacity: 0.35, shadowX: 0, shadowY: 4, shadowBlur: 12, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.02, hoverBrightness: 1.25, hoverSaturate: 1, hoverShadowBlur: 0, hoverTransition: 0.5, hoverBorderColor: 'rgba(99,102,241,0.4)', hoverGlowIntensify: true, hoverBlur: 0, hoverSiblingsBlur: 4, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
	pop: {
		id: 'pop',
		name: 'Pop',
		desc: 'Saturación alta con bordes marcados, estilo editorial',
		config: {
			brightness: 1.05, contrast: 1.25, saturate: 2.5, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: false, glow: 'active', glowColor: '#dc2626', glowSpeed: 3, glowIntensity: 1, glowBlur: 20, glowOpacity: 1, glowHoverOnly: false,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '2px', cardBgOpacity: 1,
			borderEnabled: true, borderColor: '#1c1917', borderWidth: '2px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#1c1917', shadowOpacity: 0.25, shadowX: 4, shadowY: 4, shadowBlur: 0, shadowSpread: 0, shadowInset: false,
			hoverScale: 1.05, hoverBrightness: 1.15, hoverSaturate: 2.8, hoverShadowBlur: 0, hoverTransition: 0.18, hoverBorderColor: '#e11d48', hoverGlowIntensify: false, hoverBlur: 0, hoverSiblingsBlur: 3, hoverHueRotate: 10, hoverOpacity: 1,
		},
	},
	deep: {
		id: 'deep',
		name: 'Abismo',
		desc: 'Oscuridad profunda con sombra interna, volumen dramático',
		config: {
			brightness: 0.85, contrast: 1.2, saturate: 0.9, grayscale: 0, sepia: 0, hueRotate: 0,
			glowEnabled: true, glow: 'active', glowColor: '#dc2626', glowSpeed: 4, glowIntensity: 0.6, glowBlur: 30, glowOpacity: 0.25, glowHoverOnly: true,
			animation: 'none',
	animIntensity: 100, animType: '', animDur: 0, animDelay: 0, animEasing: '',
			shimmer: false, shimmerSpeed: 0, shimmerOpacity: 0,
			borderRadius: '8px', cardBgOpacity: 1,
			borderEnabled: false, borderColor: '#dc2626', borderWidth: '1px', borderStyle: 'solid',
			shadowEnabled: true, shadowColor: '#000000', shadowOpacity: 0.7, shadowX: 0, shadowY: 12, shadowBlur: 35, shadowSpread: -5, shadowInset: true,
			hoverScale: 1.02, hoverBrightness: 1.3, hoverSaturate: 1.1, hoverShadowBlur: 0, hoverTransition: 0.4, hoverBorderColor: '#dc2626', hoverGlowIntensify: true, hoverBlur: 0, hoverSiblingsBlur: 6, hoverHueRotate: 0, hoverOpacity: 1,
		},
	},
};

/** Get a preset config by ID, falls back to 'none' */
export function getPreset(id: string): CardStyleConfig {
	return PRESETS[id as PresetId]?.config ?? PRESETS.none.config;
}

/** Get all preset entries for UI listing */
export function getAllPresets(): CardPreset[] {
	return Object.values(PRESETS);
}

/** Keyframe definitions for animation presets */
const ANIMATION_KEYFRAMES: Record<string, string> = {
	float: `@keyframes cardFloat {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(calc(-6px * var(--anim-int, 1))); }
	}`,
	hologram: `@keyframes cardHologram {
		0% { filter: hue-rotate(0deg) brightness(1); }
		50% { filter: hue-rotate(180deg) brightness(1.1); }
		100% { filter: hue-rotate(360deg) brightness(1); }
	}`,
	glitch: `@keyframes cardGlitch {
		0%, 100% { transform: translate(0); }
		20% { transform: translate(calc(-2px * var(--anim-int, 1)), calc(2px * var(--anim-int, 1))); }
		40% { transform: translate(calc(-2px * var(--anim-int, 1)), calc(-2px * var(--anim-int, 1))); }
		60% { transform: translate(calc(2px * var(--anim-int, 1)), calc(2px * var(--anim-int, 1))); }
		80% { transform: translate(calc(2px * var(--anim-int, 1)), calc(-2px * var(--anim-int, 1))); }
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
		50% { transform: perspective(600px) rotateY(calc(5deg * var(--anim-int, 1))); }
	}`,
	jello: `@keyframes cardJello {
		0%, 100% { transform: none; }
		30% { transform: skewX(calc(-12.5deg * var(--anim-int, 1))) skewY(calc(-12.5deg * var(--anim-int, 1))); }
		40% { transform: skewX(calc(6.25deg * var(--anim-int, 1))) skewY(calc(6.25deg * var(--anim-int, 1))); }
		50% { transform: skewX(calc(-3.125deg * var(--anim-int, 1))) skewY(calc(-3.125deg * var(--anim-int, 1))); }
		65% { transform: skewX(calc(1.5625deg * var(--anim-int, 1))) skewY(calc(1.5625deg * var(--anim-int, 1))); }
		75% { transform: skewX(calc(-0.78125deg * var(--anim-int, 1))) skewY(calc(-0.78125deg * var(--anim-int, 1))); }
	}`,
	wobble: `@keyframes cardWobble {
		0%, 100% { transform: none; }
		15% { transform: translateX(calc(-8px * var(--anim-int, 1))) rotate(calc(-4deg * var(--anim-int, 1))); }
		30% { transform: translateX(calc(6px * var(--anim-int, 1))) rotate(calc(3deg * var(--anim-int, 1))); }
		45% { transform: translateX(calc(-4px * var(--anim-int, 1))) rotate(calc(-2deg * var(--anim-int, 1))); }
		60% { transform: translateX(calc(2px * var(--anim-int, 1))) rotate(calc(1deg * var(--anim-int, 1))); }
	}`,
	heartbeat: `@keyframes cardHeartbeat {
		0%, 100% { transform: scale(1); }
		14% { transform: scale(calc(1 + 0.05 * var(--anim-int, 1))); }
		28% { transform: scale(1); }
		42% { transform: scale(calc(1 + 0.05 * var(--anim-int, 1))); }
		70% { transform: scale(1); }
	}`,
	tada: `@keyframes cardTada {
		0%, 100% { transform: scale(1) rotate(0deg); }
		10%, 20% { transform: scale(calc(1 - 0.1 * var(--anim-int, 1))) rotate(calc(-3deg * var(--anim-int, 1))); }
		30%, 50%, 70%, 90% { transform: scale(calc(1 + 0.05 * var(--anim-int, 1))) rotate(calc(2deg * var(--anim-int, 1))); }
		40%, 60%, 80% { transform: scale(calc(1 + 0.05 * var(--anim-int, 1))) rotate(calc(-2deg * var(--anim-int, 1))); }
	}`,
	rubberBand: `@keyframes cardRubberBand {
		0%, 100% { transform: scaleX(1) scaleY(1); }
		30% { transform: scaleX(calc(1 + 0.15 * var(--anim-int, 1))) scaleY(calc(1 - 0.15 * var(--anim-int, 1))); }
		40% { transform: scaleX(calc(1 - 0.15 * var(--anim-int, 1))) scaleY(calc(1 + 0.15 * var(--anim-int, 1))); }
		50% { transform: scaleX(calc(1 + 0.08 * var(--anim-int, 1))) scaleY(calc(1 - 0.08 * var(--anim-int, 1))); }
		65% { transform: scaleX(calc(1 - 0.03 * var(--anim-int, 1))) scaleY(calc(1 + 0.03 * var(--anim-int, 1))); }
		75% { transform: scaleX(calc(1 + 0.02 * var(--anim-int, 1))) scaleY(calc(1 - 0.02 * var(--anim-int, 1))); }
	}`,
	swing: `@keyframes cardSwing {
		20% { transform: rotate(calc(8deg * var(--anim-int, 1))); }
		40% { transform: rotate(calc(-6deg * var(--anim-int, 1))); }
		60% { transform: rotate(calc(4deg * var(--anim-int, 1))); }
		80% { transform: rotate(calc(-2deg * var(--anim-int, 1))); }
		100% { transform: rotate(0deg); }
	}`,
	flash: `@keyframes cardFlash {
		0%, 50%, 100% { opacity: 1; }
		25%, 75% { opacity: 0; }
	}`,
	bounce: `@keyframes cardBounce {
		0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
		40% { transform: translateY(calc(-12px * var(--anim-int, 1))); }
		60% { transform: translateY(calc(-6px * var(--anim-int, 1))); }
	}`,
	shake: `@keyframes cardShake {
		0%, 100% { transform: translateX(0); }
		10%, 30%, 50%, 70%, 90% { transform: translateX(calc(-4px * var(--anim-int, 1))); }
		20%, 40%, 60%, 80% { transform: translateX(calc(4px * var(--anim-int, 1))); }
	}`,
	headShake: `@keyframes cardHeadShake {
		0%, 100% { transform: translateX(0) rotateY(0); }
		6.5% { transform: translateX(calc(-4px * var(--anim-int, 1))) rotateY(calc(-4deg * var(--anim-int, 1))); }
		18.5% { transform: translateX(calc(3px * var(--anim-int, 1))) rotateY(calc(3deg * var(--anim-int, 1))); }
		31.5% { transform: translateX(calc(-2px * var(--anim-int, 1))) rotateY(calc(-2deg * var(--anim-int, 1))); }
		43.5% { transform: translateX(calc(1px * var(--anim-int, 1))) rotateY(calc(1deg * var(--anim-int, 1))); }
	}`,
	flip: `@keyframes cardFlip {
		0% { transform: perspective(400px) rotateY(0); }
		40% { transform: perspective(400px) rotateY(180deg); }
		100% { transform: perspective(400px) rotateY(360deg); }
	}`,
	lightSpeed: `@keyframes cardLightSpeed {
		0% { transform: translateX(calc(100% * var(--anim-int, 1))) skewX(calc(-30deg * var(--anim-int, 1))); opacity: 0; }
		60% { transform: skewX(calc(20deg * var(--anim-int, 1))); opacity: 1; }
		80% { transform: skewX(calc(-5deg * var(--anim-int, 1))); }
		100% { transform: none; }
	}`,
	blurIn: `@keyframes cardBlurIn {
		0% { filter: blur(8px); opacity: 0; }
		100% { filter: blur(0); opacity: 1; }
	}`,
	zoomPulse: `@keyframes cardZoomPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(calc(1 + 0.04 * var(--anim-int, 1))); }
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
		25% { transform: translate(calc(3px * var(--anim-int, 1)), calc(-4px * var(--anim-int, 1))) rotate(calc(0.5deg * var(--anim-int, 1))); }
		50% { transform: translate(calc(-2px * var(--anim-int, 1)), calc(-6px * var(--anim-int, 1))) rotate(calc(-0.3deg * var(--anim-int, 1))); }
		75% { transform: translate(calc(4px * var(--anim-int, 1)), calc(-2px * var(--anim-int, 1))) rotate(calc(0.2deg * var(--anim-int, 1))); }
	}`,
	spin: `@keyframes cardSpin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}`,
	tilt: `@keyframes cardTilt {
		0%, 100% { transform: perspective(600px) rotateX(0deg) rotateY(0deg); }
		25% { transform: perspective(600px) rotateX(calc(2deg * var(--anim-int, 1))) rotateY(calc(3deg * var(--anim-int, 1))); }
		75% { transform: perspective(600px) rotateX(calc(-2deg * var(--anim-int, 1))) rotateY(calc(-3deg * var(--anim-int, 1))); }
	}`,
	sway: `@keyframes cardSway {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(calc(2deg * var(--anim-int, 1))); }
		75% { transform: rotate(calc(-2deg * var(--anim-int, 1))); }
	}`,
	popIn: `@keyframes cardPopIn {
		0% { transform: scale(calc(1 - 0.2 * var(--anim-int, 1))); opacity: 0; }
		60% { transform: scale(calc(1 + 0.05 * var(--anim-int, 1))); opacity: 1; }
		100% { transform: scale(1); }
	}`,
	elastic: `@keyframes cardElastic {
		0% { transform: scale(calc(1 - 1 * var(--anim-int, 1))); }
		55% { transform: scale(calc(1 + 0.08 * var(--anim-int, 1))); }
		70% { transform: scale(calc(1 - 0.04 * var(--anim-int, 1))); }
		85% { transform: scale(calc(1 + 0.02 * var(--anim-int, 1))); }
		100% { transform: scale(1); }
	}`,
	dropIn: `@keyframes cardDropIn {
		0% { transform: translateY(calc(-30px * var(--anim-int, 1))) scale(calc(1 - 0.1 * var(--anim-int, 1))); opacity: 0; }
		60% { transform: translateY(calc(4px * var(--anim-int, 1))) scale(calc(1 + 0.02 * var(--anim-int, 1))); opacity: 1; }
		100% { transform: translateY(0) scale(1); }
	}`,
	riseUp: `@keyframes cardRiseUp {
		0% { transform: translateY(calc(20px * var(--anim-int, 1))); opacity: 0; }
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
		30% { transform: scaleX(calc(1 + 0.12 * var(--anim-int, 1))) scaleY(calc(1 - 0.12 * var(--anim-int, 1))); }
		60% { transform: scaleX(calc(1 - 0.08 * var(--anim-int, 1))) scaleY(calc(1 + 0.08 * var(--anim-int, 1))); }
	}`,
	squeeze: `@keyframes cardSqueeze {
		0%, 100% { transform: scaleX(1) scaleY(1); }
		50% { transform: scaleX(calc(1 - 0.05 * var(--anim-int, 1))) scaleY(calc(1 + 0.05 * var(--anim-int, 1))); }
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
	const merged = { ...DEFAULT, ...global, ...perBeat, ...custom };
	// Backward compat: hoverBlur was repurposed — map to siblingsBlur
	if (merged.hoverBlur && !merged.hoverSiblingsBlur) {
		merged.hoverSiblingsBlur = merged.hoverBlur;
		merged.hoverBlur = 0;
	}
	return merged;
}

/**
 * Genera CSS inline string desde config
 */
export function cardStyleToCSS(style: CardStyleConfig, accentRgb: string): string {
	const parts: string[] = [];

	// Animation intensity CSS variable (0-1 scale)
	if (style.animIntensity !== undefined && style.animIntensity !== 100) {
		parts.push(`--anim-int: ${style.animIntensity / 100};`);
	}
	// Filter
	// Card background — apply opacity only to background, not entire element
	if (style.cardBg) {
		if (style.cardBgOpacity !== undefined && style.cardBgOpacity < 1) {
			parts.push(`background: ${style.cardBg}; opacity: ${style.cardBgOpacity};`);
		} else {
			parts.push(`background: ${style.cardBg};`);
		}
	} else if (style.cardBgOpacity !== undefined && style.cardBgOpacity < 1) {
		// No custom bg — darken the surface with a semi-transparent overlay
		// This keeps text/images fully opaque while making the card glass-like
		parts.push(`background: rgba(0, 0, 0, ${(1 - style.cardBgOpacity) * 0.7});`);
		parts.push(`backdrop-filter: blur(var(--blur-bg, 20px));`);
	}

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
 * Genera CSS para el título del beat dentro de la card
 */
export function cardTitleCSS(style: CardStyleConfig): string {
	const parts: string[] = [];
	if (style.titleSize) parts.push(`font-size: ${style.titleSize};`);
	if (style.titleWeight) parts.push(`font-weight: ${style.titleWeight};`);
	if (style.titleColor) parts.push(`color: ${style.titleColor};`);
	if (style.titleAlign) parts.push(`text-align: ${style.titleAlign};`);
	return parts.join(' ');
}

/**
 * Genera CSS para el precio dentro de la card
 */
export function cardPriceCSS(style: CardStyleConfig): string {
	const parts: string[] = [];
	if (style.priceSize) parts.push(`font-size: ${style.priceSize};`);
	if (style.priceColor) parts.push(`color: ${style.priceColor};`);
	return parts.join(' ');
}

/**
 * Genera CSS para los tags de la card
 */
export function cardTagCSS(style: CardStyleConfig): string {
	const parts: string[] = [];
	if (style.tagBg) parts.push(`background: ${style.tagBg};`);
	if (style.tagColor) parts.push(`color: ${style.tagColor};`);
	if (style.tagRadius) parts.push(`border-radius: ${style.tagRadius};`);
	if (style.tagSize) parts.push(`font-size: ${style.tagSize};`);
	return parts.join(' ');
}

/**
 * Genera CSS para la imagen de la card
 */
export function cardImageCSS(style: CardStyleConfig): string {
	const parts: string[] = [];
	if (style.imageAspect) parts.push(`aspect-ratio: ${style.imageAspect};`);
	if (style.imageObjectFit) parts.push(`object-fit: ${style.imageObjectFit};`);
	return parts.join(' ');
}

/**
 * Genera hover CSS para zoom de imagen
 */
export function cardImageHoverCSS(style: CardStyleConfig): string {
	if (!style.imageHoverZoom) return '';
	return `transform: scale(${style.imageHoverZoom});`;
}

/**
 * Genera CSS para layout interno de la card
 */
export function cardLayoutCSS(style: CardStyleConfig): string {
	const parts: string[] = [];
	if (style.cardPadding) parts.push(`padding: ${style.cardPadding};`);
	if (style.infoBg) parts.push(`background: ${style.infoBg};`);
	if (style.gap) parts.push(`gap: ${style.gap};`);
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
	const opacity = style.shimmerOpacity ?? 1;
	return `position: relative; overflow: hidden; --shimmer-opacity: ${opacity};`;
}
