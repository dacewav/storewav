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
	fontSize?: number;        // px base (applied directly to <html>)

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
	// Colors
	bg: '--bg',
	bgSecondary: '--bg-secondary',
	surface: '--surface',
	surface2: '--surface2',
	accent: '--accent',
	text: '--text',
	textSecondary: '--text-secondary',
	textOpacity: '--text-opacity',
	// Typography
	fontDisplay: '--font-display',
	fontBody: '--font-body',
	// Radius
	radiusGlobal: '--radius-lg',
	// Card
	cardOpacity: '--card-opacity',
	cardShadowIntensity: '--card-shadow-intensity',
	cardShadowColor: '--card-shadow-color',
	// Effects
	grainOpacity: '--grain-opacity',
	grainBlendMode: '--grain-blend',
	blurBg: '--blur-bg',
	// Layout
	beatGap: '--beat-gap',
	sectionPadding: '--section-padding',
	heroPadTop: '--hero-pad-top',
	padSection: '--section-padding',
	// Opacity
	btnOpacityNormal: '--btn-opacity',
	btnOpacityHover: '--btn-opacity-hover',
	bgOpacity: '--bg-opacity',
	heroBgOpacity: '--hero-bg-opacity',
	sectionOpacity: '--section-opacity',
	beatImgOpacity: '--beat-img-opacity',
	navOpacity: '--nav-opacity',
	// Waveform bar
	wbarColor: '--wbar-color',
	wbarActive: '--wbar-active',
	wbarHeight: '--wbar-h',
	wbarRadius: '--wbar-r',
	// Orb / blend
	orbBlendMode: '--orb-blend',
	// Borders
	border: '--border',
	border2: '--border2',
	// Logo
	logoHeight: '--logo-height',
	logoWidth: '--logo-width',
	logoScale: '--logo-scale',
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
 * Modo light: usa data-theme attribute para que CSS [data-theme="light"] aplique.
 * No aplicar overrides inline — dejar que app.css maneje los colores via cascada.
 */
function setLightMode(enabled: boolean) {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', enabled ? 'light' : 'dark');
	document.documentElement.style.colorScheme = enabled ? 'light' : 'dark';
}

/**
 * Aplica tema completo al DOM
 * Llamar con el objeto de Firebase: theme/{...}
 */
export function applyTheme(config: ThemeConfig) {
	if (!config || typeof document === 'undefined') return;

	const root = document.documentElement;
	const vars: Record<string, string> = {};

	// 1. Light mode — delegar a data-theme attribute + CSS
	if (config.lightMode !== undefined) {
		setLightMode(config.lightMode);
	}

	// 2. Direct mappings
	for (const [key, cssVar] of Object.entries(THEME_MAP)) {
		const value = config[key as keyof ThemeConfig];
		if (value !== undefined && value !== null) {
			// Values that need 'rem' suffix
			const needsRem = ['sectionPadding', 'heroPadTop', 'padSection'];
			// Values that need 'px' suffix
			const needsPx = ['beatGap', 'wbarHeight', 'wbarRadius', 'blurBg', 'cardShadowIntensity'];
			if (needsRem.includes(key) && typeof value === 'number') {
				vars[cssVar] = `${value}rem`;
			} else if (needsPx.includes(key) && typeof value === 'number') {
				vars[cssVar] = `${value}px`;
			} else {
				vars[cssVar] = String(value);
			}
		}
	}

	// 2b. Font size — set directly on <html> (not as CSS var)
	if (config.fontSize && typeof config.fontSize === 'number') {
		root.style.fontSize = `${config.fontSize}px`;
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

	// Reset font size
	root.style.fontSize = '';
}
