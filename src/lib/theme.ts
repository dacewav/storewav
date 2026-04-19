/**
 * Theme Engine — aplica tema de Firebase como CSS variables
 *
 * Admin escribe a Firebase: theme/{property}
 * Este módulo lee y aplica a document.documentElement.style
 *
 * Uso (en Bloque 2 — Firebase stores):
 *   import { applyTheme, type ThemeConfig } from '$lib/theme';
 *   onValue(ref(db, 'theme'), (snap) => applyTheme(snap.val()));
 */

export interface ThemeConfig {
	// Core colors
	bg?: string;
	bgSecondary?: string;
	surface?: string;
	surface2?: string;
	accent?: string;
	text?: string;
	textSecondary?: string;

	// Glow
	glowColor?: string;       // base color for glow presets (default: accent)
	glowIntensity?: number;   // 0-1 multiplier

	// Card
	cardOpacity?: number;     // 0-1
	radiusGlobal?: string;    // e.g. "16px"

	// Effects
	grainOpacity?: number;    // 0-1
	blurBg?: string;          // backdrop blur value

	// Typography
	fontDisplay?: string;     // CSS font-family
	fontBody?: string;

	// Logo
	logoUrl?: string;
	logoWidth?: string;
	logoHeight?: string;

	// Hero
	heroGlowOn?: boolean;
	heroGlowInt?: number;
	heroStrokeOn?: boolean;

	// Mode
	lightMode?: boolean;
}

/** Map de Firebase theme/ keys → CSS custom properties */
const THEME_MAP: Record<string, string> = {
	bg: '--bg',
	bgSecondary: '--bg-secondary',
	surface: '--surface',
	surface2: '--surface2',
	accent: '--accent',
	text: '--text',
	textSecondary: '--text-secondary',
	fontDisplay: '--font-display',
	fontBody: '--font-body',
	radiusGlobal: '--radius-lg',
	cardOpacity: '--card-opacity',
	grainOpacity: '--grain-opacity',
	beatGap: '--beat-gap',
	sectionPadding: '--section-padding',
	heroPadTop: '--hero-pad-top',
	btnOpacity: '--btn-opacity',
	btnOpacityHover: '--btn-opacity-hover',
	bgOpacity: '--bg-opacity',
};

/**
 * Genera variantes de accent a partir del color base
 * #dc2626 → accent-dim, accent-glow, accent-glow-strong, accent-rgb, red, red-light, red-glow
 */
function generateAccentVariants(hex: string) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	// Dim: ~80% brightness
	const dimHex = '#' + [r, g, b].map(c => Math.round(c * 0.8).toString(16).padStart(2, '0')).join('');
	// Red variants (darker shades for orbs/gradients)
	const redHex = '#' + [r, g, b].map(c => Math.round(c * 0.5).toString(16).padStart(2, '0')).join('');
	const redLightHex = '#' + [r, g, b].map(c => Math.round(c * 0.6).toString(16).padStart(2, '0')).join('');
	const redGlowHex = '#' + [r, g, b].map(c => Math.round(c * 0.7).toString(16).padStart(2, '0')).join('');

	return {
		'--accent': hex,
		'--accent-dim': dimHex,
		'--accent-glow': `rgba(${r}, ${g}, ${b}, 0.12)`,
		'--accent-glow-strong': `rgba(${r}, ${g}, ${b}, 0.25)`,
		'--accent-rgb': `${r}, ${g}, ${b}`,
		'--red': redHex,
		'--red-light': redLightHex,
		'--red-glow': redGlowHex,
		// Derived
		'--success': hex,
		'--wbar-active': hex,
	};
}

/**
 * Genera variantes de glow a partir del color e intensidad
 */
function generateGlowVariants(color: string, intensity: number = 1) {
	// Parse color
	let r: number, g: number, b: number;
	if (color.startsWith('#')) {
		r = parseInt(color.slice(1, 3), 16);
		g = parseInt(color.slice(3, 5), 16);
		b = parseInt(color.slice(5, 7), 16);
	} else {
		// Fallback: use accent
		return {};
	}

	const i = Math.max(0, Math.min(1, intensity));

	return {
		'--glow-sm': `0 0 20px rgba(${r}, ${g}, ${b}, ${0.2 * i})`,
		'--glow-md': `0 0 40px rgba(${r}, ${g}, ${b}, ${0.25 * i}), 0 0 80px rgba(${r}, ${g}, ${b}, ${0.08 * i})`,
		'--glow-lg': `0 0 60px rgba(${r}, ${g}, ${b}, ${0.3 * i}), 0 0 120px rgba(${r}, ${g}, ${b}, ${0.1 * i})`,
		'--glow-accent': `0 0 20px rgba(${r}, ${g}, ${b}, ${0.3 * i})`,
	};
}

/**
 * Modo light: invierte paleta base
 */
function getLightOverrides(): Record<string, string> {
	return {
		'--bg': '#f5f5f5',
		'--bg-secondary': '#ebebeb',
		'--surface': '#ffffff',
		'--surface2': '#f0f0f0',
		'--surface-hover': '#e8e8e8',
		'--surface-active': '#e0e0e0',
		'--text': '#0a0a0a',
		'--text-secondary': 'rgba(10, 10, 10, 0.55)',
		'--text-muted': 'rgba(10, 10, 10, 0.25)',
		'--text-hint': 'rgba(10, 10, 10, 0.15)',
		'--border': 'rgba(0, 0, 0, 0.08)',
		'--border2': 'rgba(0, 0, 0, 0.15)',
		'--border-hover': 'rgba(0, 0, 0, 0.2)',
		'--backdrop': 'rgba(255, 255, 255, 0.7)',
	};
}

/**
 * Aplica tema completo al DOM
 * Llamar con el objeto de Firebase: theme/{...}
 */
export function applyTheme(config: ThemeConfig) {
	if (!config || typeof document === 'undefined') return;

	const root = document.documentElement;
	const vars: Record<string, string> = {};

	// 1. Light mode overrides (aplicar PRIMERO, otros valores pisan)
	if (config.lightMode) {
		Object.assign(vars, getLightOverrides());
	}

	// 2. Direct mappings
	for (const [key, cssVar] of Object.entries(THEME_MAP)) {
		const value = config[key as keyof ThemeConfig];
		if (value !== undefined && value !== null) {
			vars[cssVar] = String(value);
		}
	}

	// 3. Accent variants (auto-genera)
	if (config.accent) {
		Object.assign(vars, generateAccentVariants(config.accent));
	}

	// 4. Glow variants
	const glowColor = config.glowColor || config.accent;
	if (glowColor) {
		Object.assign(vars, generateGlowVariants(glowColor, config.glowIntensity ?? 1));
	}

	// 5. Apply all vars
	for (const [cssVar, value] of Object.entries(vars)) {
		root.style.setProperty(cssVar, value);
	}

	// 6. Derived radius (scale others from radiusGlobal)
	if (config.radiusGlobal) {
		const base = parseFloat(config.radiusGlobal);
		if (!isNaN(base)) {
			root.style.setProperty('--radius-sm', `${Math.round(base * 0.375)}px`);
			root.style.setProperty('--radius-md', `${Math.round(base * 0.625)}px`);
			root.style.setProperty('--radius-xl', `${Math.round(base * 1.5)}px`);
		}
	}
}

/**
 * Resetea todas las variables inline (vuelve a defaults de CSS)
 */
export function resetTheme() {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;
	const allVars = [
		...Object.values(THEME_MAP),
		'--accent-dim', '--accent-glow', '--accent-glow-strong', '--accent-rgb',
		'--glow-sm', '--glow-md', '--glow-lg', '--glow-accent',
		'--success', '--wbar-active',
		'--radius-sm', '--radius-md', '--radius-xl',
	];

	for (const v of allVars) {
		root.style.removeProperty(v);
	}
}
