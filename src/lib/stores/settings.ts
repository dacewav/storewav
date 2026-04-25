/**
 * Settings store — lee/escribe settings/ de Firebase
 *
 * Estructura Firebase:
 *   settings/hero → { title, subtitle, eyebrow, glowWord }
 *   settings/heroVisual → { glowOn, glowInt, strokeOn, titleSize, ... }
 *   settings/theme → { accent, glowColor, glowIntensity, fonts, radius, ... }
 *   settings/layout → { cardsPerRow, showWishlist, heroPadTop, logoScale, ... }
 *   settings/section → { title, dividerTitle, dividerSub }
 *   settings/cta → { title, subtitle, buttonText, buttonUrl }
 *   settings/links → [{ label, url, icon }]
 *   settings/brand → { name, logo, favicon, footerText, metaDescription }
 *   settings/loader → { enabled, brandText }
 *   settings/banner → { enabled, text, url, animation, speed, ... }
 *   settings/cardStyle → { glow, animation, shimmer, ... }
 *   settings/labels → { search, emptyTitle, emptySub, ... }
 *   settings/testimonials → [{ name, text, stars, avatar }]
 *   settings/animations → { animLogo, animTitle, animCards, ... }
 */

import { createFirebaseStore } from './_firebaseStore';
import type { StoreState } from './_firebaseStore';
import type { CardStyleConfig } from '$lib/cardStyleEngine';
import type { IconName } from '$lib/icons';
import { writable, type Writable } from 'svelte/store';
import { getDb } from '$lib/firebase';

export type HeroSettings = {
	title: string;
	subtitle: string;
	eyebrow: string;
	glowWord: string;
};

export type SectionSettings = {
	title: string;
	dividerTitle: string;
	dividerSub: string;
};

export type CtaSettings = {
	title: string;
	subtitle: string;
	buttonText: string;
	buttonUrl: string;
};

export type LinkItem = {
	label: string;
	url: string;
	icon: IconName;
};

export type BrandSettings = {
	name: string;
	logo: string;
	favicon: string;
	ogImage: string;
	footerText: string;
	metaDescription: string;
	whatsapp: string;
};

export type LoaderSettings = {
	enabled: boolean;
	brandText: string;
};

export type BannerSettings = {
	enabled: boolean;
	text: string;
	url: string;
	animation: string; // 'static' | 'scroll' | 'fade-pulse' | 'bounce' | 'glow-pulse'
	speed: number; // seconds
	easing: string; // 'linear' | 'ease' | 'ease-in-out'
	direction: string; // 'normal' | 'reverse' | 'alternate'
	delay: number; // seconds
	bgColor: string;
	textColor: string;
};

export type Testimonial = {
	name: string;
	text: string;
	stars?: number;
	avatar?: string;
	role?: string; // Firebase uses role instead of stars
};

// ── Hero Visual Settings ──
export type HeroColorSegment = {
	text: string;
	color: string;
};

export type HeroVisualSettings = {
	// Glow word
	glowOn: boolean;
	glowInt: number; // 0-2
	glowBlur: number; // px
	glowClr: string;

	// Stroke mode
	strokeOn: boolean;
	strokeW: number; // px
	strokeClr: string;

	// Word glow (last line)
	wordBlur: number; // px
	wordOp: number; // 0-1

	// Title sizing
	titleSize: number; // rem
	letterSpacing: number; // em
	lineHeight: number;

	// Color segments (per-word colors)
	segments: HeroColorSegment[];

	// Eyebrow
	eyebrowOn: boolean;
	eyebrowClr: string;
	eyebrowSize: number; // px

	// Background gradient
	gradOn: boolean;
	gradClr: string;
	gradOp: number; // 0-1
	gradW: number; // % 10-100
	gradH: number; // % 10-100

	// Padding
	padTop: number; // rem
};

// ── Theme Settings ──
export type ThemeSettings = {
	accent: string;
	glowColor: string;
	glowIntensity: number; // 0-2
	glowBlur: number; // px
	glowAnim: string; // 'none' | 'pulse' | 'breathe' | 'spin'
	glowAnimSpeed: number; // seconds

	fontDisplay: string; // Google Font name
	fontBody: string; // Google Font name
	fontWeight: number; // 100-900
	fontSize: number; // px base
	lineHeight: number;

	radiusGlobal: number; // px
	sectionPadding: number; // rem
	beatGap: number; // px

	cardOpacity: number; // 0-1
	cardShadowIntensity: number; // 0-1
	cardShadowColor: string;
	blurBg: number; // px
	grainOpacity: number; // 0-1

	navOpacity: number; // 0-1
	heroBgOpacity: number; // 0-1
	sectionOpacity: number; // 0-1
	beatImgOpacity: number; // 0-1
	textOpacity: number; // 0-1

	bgOpacity: number; // 0-1
	btnOpacityNormal: number; // 0-1
	btnOpacityHover: number; // 0-1

	wbarColor: string;
	wbarActive: string;
	wbarHeight: number; // px
	wbarRadius: number; // px

	orbBlendMode: string;
	grainBlendMode: string;

	// Light/dark mode
	lightMode?: boolean;

	// Particles
	particlesOn: boolean;
	particlesCount: number;
	particlesSpeed: number;
	particlesType: string; // 'circle' | 'square' | 'line' | 'text' | 'image'
	particlesColor: string;
	particlesOpacity: number; // 0-1
	particlesText: string;
	particlesImgUrl: string;
	particlesSizeMin: number; // px, default 3
	particlesSizeMax: number; // px, default 8

	// Hero stroke (background overlay)
	heroStrokeOn: boolean;
	heroStrokeClr: string;
	heroStrokeW: number; // px

	// Global glow toggle
	glowActive: boolean;

	// Wave opacity
	waveOpacityOff: number; // 0-1
	waveOpacityOn: number; // 0-1

	// Hero glow (background)
	heroGlowOn: boolean;
	heroGlowInt: number; // 0-3
	heroGlowBlur: number; // px
	heroGlowClr: string;

	// License buttons
	btnLicBg: string;
	btnLicClr: string;
	btnLicBdr: string;

	// Background & surfaces
	bgColor: string; // main background hex
	surfaceColor: string; // card/panel background hex
	textColor: string; // main text color hex

	// Navigation
	navBgColor: string; // nav background (hex, opacity via navOpacity)
	navBlur: number; // px, backdrop-filter blur

	// CTA button
	ctaBtnBg: string;
	ctaBtnClr: string;
	ctaBtnHoverBg: string;
	ctaBtnRadius: number; // px

	// Container
	containerMaxWidth: number; // px, default 1200

	// Custom CSS injection
	customCSS: string;

	// ── NEW: Hero ──
	heroMinHeight: number;       // vh, default 60

	// ── NEW: Section titles ──
	sectionTitleSize: string;    // CSS font-size (e.g. "1.5rem")
	sectionTitleWeight: number;  // 100-900
	sectionTitleAlign: string;   // left, center, right
	sectionTitleColor: string;   // hex color

	// ── NEW: Background ──
	bgPattern: string;           // none, dots, lines, grid
	bgPatternColor: string;      // hex color
	bgPatternOpacity: number;    // 0-1

	// ── NEW: Scrollbar ──
	scrollbarThin: boolean;      // thin scrollbar
	scrollbarColor: string;      // thumb color
};

// ── Layout Settings (expanded) ──
export type LayoutSettings = {
	cardsPerRow: number;
	showWishlist: boolean;

	heroPadTop: number; // rem
	playerBottom: number; // px
	logoScale: number; // 0.5-3
	logoWidth: number; // px
	logoHeight: number; // px 0=auto
	logoRotation: number; // deg
	showLogoText: boolean;

	navHeight: number; // px, default 64
	footerVisible: boolean;
	showBanner: boolean;
	sectionOrder: string; // comma-separated section ids
};

// ── Animation Settings ──
export type AnimPreset = 'none' | 'float' | 'pulse' | 'bounce' | 'spin' | 'shake' | 'glow' | 'slide-up' | 'slide-down' | 'fade-in';

export type AnimationSettings = {
	animLogo: AnimPreset;
	animTitle: AnimPreset;
	animPlayer: AnimPreset;
	animCards: AnimPreset;
	animButtons: AnimPreset;
	animWaveform: AnimPreset;
	animDuration: number; // global default seconds, default 2
	animDelay: number; // global default seconds, default 0
	animEasing: string; // global default CSS easing, default 'ease-in-out'

	// Per-element timing (optional, falls back to global)
	animLogoDur?: number;
	animLogoDel?: number;
	animLogoEase?: string;
	animTitleDur?: number;
	animTitleDel?: number;
	animTitleEase?: string;
	animCardsDur?: number;
	animCardsDel?: number;
	animCardsEase?: string;
	animButtonsDur?: number;
	animButtonsDel?: number;
	animButtonsEase?: string;
	animPlayerDur?: number;
	animPlayerDel?: number;
	animPlayerEase?: string;
	animWaveformDur?: number;
	animWaveformDel?: number;
	animWaveformEase?: string;

	// Custom CSS keyframes
	animCustomCSS?: string;
};

export type LabelSettings = {
	search: string;
	emptyTitle: string;
	emptySub: string;
	wishlistEmptyTitle: string;
	wishlistEmptySub: string;
	beatPreview: string;
	licenses: string;
	filterAll: string;
	filterKey: string;
	clearAll: string;
	tags: string;
	priceFrom: string;
	statBeats: string;
	statGenres: string;
	statLicenses: string;
	preview: string;
	buy: string;
	backToCatalog: string;
	relatedBeats: string;
	testimonialsTitle: string;
	loginTitle: string;
	loginSub: string;
	loginBtn: string;
	loginBack: string;
	loginNote: string;
	errorTitle: string;
	errorBtn: string;
};

export type SettingsData = {
	hero: HeroSettings;
	heroVisual: HeroVisualSettings;
	theme: ThemeSettings;
	section: SectionSettings;
	cta: CtaSettings;
	layout: LayoutSettings;
	links: LinkItem[];
	brand: BrandSettings;
	loader: LoaderSettings;
	banner: BannerSettings;
	testimonials: Testimonial[];
	cardStyle: CardStyleConfig;
	animations: AnimationSettings;
	labels: LabelSettings;
};

const DEFAULT: SettingsData = {
	hero: {
		title: 'DACEWAV',
		subtitle: 'Trap · R&B · Drill · Beats profesionales para tu próximo hit',
		eyebrow: 'En vivo · Producción profesional',
		glowWord: 'rompen.'
	},
	heroVisual: {
		glowOn: true,
		glowInt: 1,
		glowBlur: 20,
		glowClr: '',
		strokeOn: false,
		strokeW: 1,
		strokeClr: '',
		wordBlur: 10,
		wordOp: 0.35,
		titleSize: 0, // 0 = default (clamp)
		letterSpacing: -0.04,
		lineHeight: 1,
		segments: [],
		eyebrowOn: true,
		eyebrowClr: '',
		eyebrowSize: 0,
		gradOn: true,
		gradClr: '',
		gradOp: 0.14,
		gradW: 80,
		gradH: 60,
		padTop: 0
	},
	theme: {
		accent: '#dc2626',
		glowColor: '',
		glowIntensity: 1,
		glowBlur: 20,
		glowAnim: 'none',
		glowAnimSpeed: 2,
		fontDisplay: 'Syne',
		fontBody: 'DM Mono',
		fontWeight: 400,
		fontSize: 14,
		lineHeight: 1.6,
		radiusGlobal: 12,
		sectionPadding: 4,
		beatGap: 16,
		cardOpacity: 0.85,
		cardShadowIntensity: 0.3,
		cardShadowColor: '#000000',
		blurBg: 20,
		grainOpacity: 0.03,
		navOpacity: 0.95,
		heroBgOpacity: 1,
		sectionOpacity: 1,
		beatImgOpacity: 1,
		textOpacity: 1,
		bgOpacity: 1,
		btnOpacityNormal: 1,
		btnOpacityHover: 1,
		wbarColor: '',
		wbarActive: '',
		wbarHeight: 64,
		wbarRadius: 0,
		orbBlendMode: 'screen',
		grainBlendMode: 'overlay',
		particlesOn: false,
		particlesCount: 50,
		particlesSpeed: 1,
		particlesType: 'circle',
		particlesColor: '',
		particlesOpacity: 0.3,
		particlesText: '',
		particlesImgUrl: '',
		particlesSizeMin: 3,
		particlesSizeMax: 8,
		heroStrokeOn: false,
		heroStrokeClr: '',
		heroStrokeW: 1,
		glowActive: false,
		waveOpacityOff: 0.3,
		waveOpacityOn: 0.8,
		heroGlowOn: false,
		heroGlowInt: 1,
		heroGlowBlur: 20,
		heroGlowClr: '',
		btnLicBg: '',
		btnLicClr: '',
		btnLicBdr: '',
		bgColor: '',
		surfaceColor: '',
		textColor: '',
		navBgColor: '',
		navBlur: 24,
		ctaBtnBg: '',
		ctaBtnClr: '',
		ctaBtnHoverBg: '',
		ctaBtnRadius: 12,
		containerMaxWidth: 1200,
		customCSS: '',
		heroMinHeight: 60,
		sectionTitleSize: '',
		sectionTitleWeight: 0,
		sectionTitleAlign: '',
		sectionTitleColor: '',
		bgPattern: 'none',
		bgPatternColor: '',
		bgPatternOpacity: 0.05,
		scrollbarThin: false,
		scrollbarColor: ''
	},
	section: {
		title: 'Catálogo',
		dividerTitle: 'Todo fire. <em>Zero filler.</em>',
		dividerSub: 'Beats profesionales. Licencias para todos los niveles — desde bedroom producers hasta majors.'
	},
	cta: {
		title: '¿Listo para tu próximo hit?',
		subtitle: 'Contáctanos por WhatsApp y te ayudamos a encontrar el beat perfecto para tu proyecto.',
		buttonText: 'Escríbenos',
		buttonUrl: 'https://wa.me'
	},
	layout: {
		cardsPerRow: 3,
		showWishlist: true,
		heroPadTop: 0,
		playerBottom: 0,
		logoScale: 1,
		logoWidth: 80,
		logoHeight: 0,
		logoRotation: 0,
		showLogoText: true,
		navHeight: 64,
		footerVisible: true,
		showBanner: true,
		sectionOrder: 'hero,featured,divider,beats,testimonials,cta'
	},
	links: [
		{ label: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
		{ label: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
		{ label: 'WhatsApp', url: 'https://wa.me', icon: 'whatsapp' }
	],
	brand: {
		name: 'DACEWAV',
		logo: '',
		favicon: '',
		ogImage: '',
		footerText: 'Todos los derechos reservados · 2026',
		metaDescription: 'Beats que rompen',
		whatsapp: ''
	},
	loader: {
		enabled: true,
		brandText: 'DACEWAV'
	},
	banner: {
		enabled: false,
		text: '',
		url: '',
		animation: 'scroll',
		speed: 20,
		easing: 'linear',
		direction: 'normal',
		delay: 0,
		bgColor: '#7f1d1d',
		textColor: '#ffffff'
	},
	testimonials: [],
	cardStyle: { glow: 'none', animation: 'none', shimmer: false, hoverScale: 1.02, brightness: 1, saturate: 1 },
	animations: {
		animLogo: 'none',
		animTitle: 'none',
		animPlayer: 'none',
		animCards: 'none',
		animButtons: 'none',
		animWaveform: 'none',
		animDuration: 2,
		animDelay: 0,
		animEasing: 'ease-in-out'
	},
	labels: {
		search: 'Buscar beats...',
		emptyTitle: 'Sin resultados',
		emptySub: 'Prueba con otros filtros',
		wishlistEmptyTitle: 'Sin favoritos',
		wishlistEmptySub: 'Añade beats a tu lista para verlos aquí',
		beatPreview: 'Escuchar preview',
		licenses: 'Licencias',
		filterAll: 'Todos',
		filterKey: 'Tonalidad',
		clearAll: 'Limpiar todo',
		tags: 'Tags',
		priceFrom: 'Desde',
		statBeats: 'beats',
		statGenres: 'géneros',
		statLicenses: 'licencias',
		preview: 'Escuchar preview',
		buy: 'Comprar',
		backToCatalog: 'Volver al catálogo',
		relatedBeats: 'Beats relacionados',
		testimonialsTitle: 'Lo que dicen',
		loginTitle: 'Admin',
		loginSub: 'Inicia sesión para acceder al panel',
		loginBtn: 'Continuar con Google',
		loginBack: '← Volver a la tienda',
		loginNote: 'Solo administradores autorizados',
		errorTitle: 'Página no encontrada',
		errorBtn: 'Volver al inicio'
	}
};

const base = createFirebaseStore<SettingsData>('settings', DEFAULT);

/** Save status store — admin pages set this, layout reads it */
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
export const saveStatus: Writable<SaveStatus> = writable('saved');

/** Undo/Redo — stack de cambios */
type UndoEntry = { dotPath: string; oldValue: unknown; newValue: unknown };
const MAX_UNDO = 20;
const undoStack: UndoEntry[] = [];
const redoStack: UndoEntry[] = [];
export const canUndo = writable(false);
export const canRedo = writable(false);

/** Offline write queue — stores failed writes for replay on reconnect */
type PendingWrite = { dotPath: string; value: unknown; timestamp: number };
const pendingWrites: PendingWrite[] = [];
let flushScheduled = false;

/** Flush pending writes when back online */
async function flushPendingWrites() {
	if (pendingWrites.length === 0 || flushScheduled) return;
	flushScheduled = true;
	// Small delay to let connection stabilize
	await new Promise((r) => setTimeout(r, 500));

	while (pendingWrites.length > 0) {
		const write = pendingWrites[0];
		try {
			const flatPath = flattenSettingsPath(write.dotPath);
			await base.update({ [flatPath]: write.value } as Partial<SettingsData>);
			pendingWrites.shift();
			pendingCount.set(pendingWrites.length);
		} catch {
			// Still offline, stop trying
			break;
		}
	}

	if (pendingWrites.length === 0) {
		saveStatus.set('saved');
	}
	flushScheduled = false;
}

/** Watch connection state and flush on reconnect */
let unsubConnection: (() => void) | null = null;
export async function initOfflineQueue() {
	try {
		const { isFullyConnected } = await import('./connection');
		unsubConnection = isFullyConnected.subscribe((connected) => {
			if (connected && pendingWrites.length > 0) {
				flushPendingWrites();
			}
		});
	} catch { /* connection store not available */ }
}

export function destroyOfflineQueue() {
	unsubConnection?.();
	unsubConnection = null;
}

/** Get pending writes count (for UI indicator) */
export function getPendingCount(): number {
	return pendingWrites.length;
}

/** Reactive pending writes count — updated on queue/flush */
export const pendingCount = writable(0);

/** Clamp numeric fields to their valid ranges */
const CLAMP_MAP: Record<string, [number, number]> = {
	'theme.glowBlur': [0, 60],
	'theme.heroGlowBlur': [0, 60],
	'theme.heroGlowInt': [0, 3],
	'theme.glowIntensity': [0, 3],
	'theme.waveOpacityOff': [0, 1],
	'theme.waveOpacityOn': [0, 1],
	'heroVisual.glowBlur': [0, 60],
	'heroVisual.glowInt': [0, 3],
	'heroVisual.wordBlur': [0, 40],
	'heroVisual.wordOp': [0, 1],
	'heroVisual.gradOp': [0, 1],
	'heroVisual.gradW': [10, 100],
	'heroVisual.gradH': [10, 100],
	'theme.cardOpacity': [0, 1],
	'theme.navOpacity': [0, 1],
	'theme.heroBgOpacity': [0, 1],
	'theme.sectionOpacity': [0, 1],
	'theme.beatImgOpacity': [0, 1],
	'theme.textOpacity': [0, 1],
	'theme.bgOpacity': [0, 1],
	'theme.btnOpacityNormal': [0, 1],
	'theme.btnOpacityHover': [0, 1],
	'theme.grainOpacity': [0, 0.2],
	'theme.cardShadowIntensity': [0, 1],
	'theme.particlesOpacity': [0, 1],
	'banner.speed': [5, 60],
	'banner.delay': [0, 10],
	'theme.navBlur': [0, 40],
	'theme.ctaBtnRadius': [0, 50],
	'theme.containerMaxWidth': [800, 1800],
	'theme.heroMinHeight': [30, 100],
	'theme.bgPatternOpacity': [0, 1],
};

/** Reverse mapping: nested dot-path → flat Firebase key for settings/ writes.
 *  This is needed because Firebase rules expect flat keys but the code uses nested structure. */
const NESTED_TO_FLAT: Record<string, string> = {
	// Hero → settings/
	'hero.title': 'heroTitle',
	'hero.subtitle': 'heroSubtitle',
	'hero.eyebrow': 'heroEyebrow',
	'hero.glowWord': 'heroTitleCustom',
	// Section → settings/
	'section.title': 'sectionTitle',
	'section.dividerTitle': 'dividerTitle',
	'section.dividerSub': 'dividerSub',
	// CTA → settings/
	'cta.title': 'ctaTitle',
	'cta.subtitle': 'ctaSub',
	'cta.buttonText': 'ctaBtnText',
	'cta.buttonUrl': 'ctaBtnUrl',
	// Brand → settings/
	'brand.name': 'siteName',
	'brand.logo': 'logoUrl',
	'brand.favicon': 'faviconUrl',
	'brand.ogImage': 'ogImageUrl',
	'brand.footerText': 'footerText',
	'brand.metaDescription': 'metaDescription',
	'brand.whatsapp': 'whatsapp',
	// Banner → settings/
	'banner.enabled': 'bannerActive',
	'banner.text': 'bannerText',
	'banner.url': 'bannerUrl',
	'banner.animation': 'bannerAnim',
	'banner.bgColor': 'bannerBg',
	'banner.textColor': 'bannerTxtClr',
	'banner.speed': 'bannerSpeed',
	'banner.easing': 'bannerEasing',
	'banner.direction': 'bannerDir',
	'banner.delay': 'bannerDelay',
	// Loader → settings/
	'loader.enabled': 'loaderEnabled',
	'loader.brandText': 'loaderBrandText',
	// Layout → settings/
	'layout.cardsPerRow': 'cardsPerRow',
	'layout.showWishlist': 'showWishlist',
	'layout.heroPadTop': 'heroPadTop',
	'layout.playerBottom': 'playerBottom',
	'layout.logoScale': 'logoScale',
	'layout.logoWidth': 'logoWidth',
	'layout.logoHeight': 'logoHeight',
	'layout.logoRotation': 'logoRotation',
	'layout.showLogoText': 'showLogoText',
	'layout.navHeight': 'navHeight',
	'layout.footerVisible': 'footerVisible',
	'layout.showBanner': 'showBanner',
	'layout.sectionOrder': 'sectionOrder',
	// Labels → settings/
	'labels.search': 'labelSearch',
	'labels.emptyTitle': 'labelEmptyTitle',
	'labels.emptySub': 'labelEmptySub',
	'labels.wishlistEmptyTitle': 'labelWishlistEmptyTitle',
	'labels.wishlistEmptySub': 'labelWishlistEmptySub',
	'labels.beatPreview': 'labelBeatPreview',
	'labels.licenses': 'labelLicenses',
	'labels.filterAll': 'labelFilterAll',
	'labels.filterKey': 'labelFilterKey',
	'labels.clearAll': 'labelClearAll',
	'labels.tags': 'labelTags',
	'labels.priceFrom': 'labelPriceFrom',
	'labels.statBeats': 'labelStatBeats',
	'labels.statGenres': 'labelStatGenres',
	'labels.statLicenses': 'labelStatLicenses',
	'labels.preview': 'labelPreview',
	'labels.buy': 'labelBuy',
	'labels.backToCatalog': 'labelBackToCatalog',
	'labels.relatedBeats': 'labelRelatedBeats',
	'labels.testimonialsTitle': 'labelTestimonialsTitle',
	'labels.loginTitle': 'labelLoginTitle',
	'labels.loginSub': 'labelLoginSub',
	'labels.loginBtn': 'labelLoginBtn',
	'labels.loginBack': 'labelLoginBack',
	'labels.loginNote': 'labelLoginNote',
	'labels.errorTitle': 'labelErrorTitle',
	'labels.errorBtn': 'labelErrorBtn',
};

/** Paths that should write to theme/ instead of settings/ */
const THEME_PREFIXES = ['theme.', 'heroVisual.', 'animations.'];

/** Convert nested dot-path to flat Firebase key, or return as-is if no mapping */
function flattenSettingsPath(dotPath: string): string {
	return NESTED_TO_FLAT[dotPath] ?? dotPath;
}

/** Determine if a dot-path should write to theme/ instead of settings/ */
function isThemePath(dotPath: string): boolean {
	return THEME_PREFIXES.some(p => dotPath.startsWith(p));
}

/** Get the flat key for theme writes (strip prefix) */
function getThemeKey(dotPath: string): string {
	if (dotPath.startsWith('heroVisual.')) {
		// heroVisual.glowOn → heroGlowOn
		return 'hero' + dotPath.replace('heroVisual.', '');
	}
	if (dotPath.startsWith('animations.')) {
		// animations.animLogo → animLogo
		return dotPath.replace('animations.', '');
	}
	// theme.accent → accent
	return dotPath.replace('theme.', '');
}

/** Helper para actualizar un campo por dot-path (ej: 'heroVisual.glowOn') */
async function updateField(dotPath: string, value: unknown) {
	// Clamp numeric values to valid ranges
	const range = CLAMP_MAP[dotPath];
	if (range && typeof value === 'number') {
		value = Math.max(range[0], Math.min(range[1], value));
	}

	// Get current value for undo
	const current = getNestedValue(dotPath);
	if (current !== value) {
		undoStack.push({ dotPath, oldValue: current, newValue: value });
		if (undoStack.length > MAX_UNDO) undoStack.shift();
		redoStack.length = 0; // clear redo on new change
		canUndo.set(true);
		canRedo.set(false);
	}

	saveStatus.set('saving');
	try {
		// Determine target Firebase path: theme/heroVisual/animations writes go to theme/, settings writes go to settings/
		if (isThemePath(dotPath)) {
			// Theme writes: convert to flat key, write to theme/ path
			const themeKey = getThemeKey(dotPath);
			const { ref, update: fbUpdate } = await import('firebase/database');
			const db = await (await import('$lib/firebase')).getDb();
			if (db) {
				await fbUpdate(ref(db, 'theme'), { [themeKey]: value });
			}
		} else {
			// Settings writes: flatten nested paths to match deployed rules (flat keys)
			const flatPath = flattenSettingsPath(dotPath);
			await base.update({ [flatPath]: value } as Partial<SettingsData>);
		}
		saveStatus.set('saved');
	} catch (err) {
		// Log the actual error for debugging
		console.error(`[Settings] Write failed: ${isThemePath(dotPath) ? 'theme/' : 'settings/'}${isThemePath(dotPath) ? getThemeKey(dotPath) : flatPath}`, err);

		// Retry once on network error, then queue for later
		const isNetwork = err instanceof Error && (
			err.message.includes('network') || err.message.includes('fetch') || err.message.includes('unavailable')
		);
		if (isNetwork) {
			console.warn('[Settings] Network error, retrying in 1s...');
			await new Promise((r) => setTimeout(r, 1000));
			try {
				if (isThemePath(dotPath)) {
					const themeKey = getThemeKey(dotPath);
					const { ref, update: fbUpdate } = await import('firebase/database');
					const db = await (await import('$lib/firebase')).getDb();
					if (db) await fbUpdate(ref(db, 'theme'), { [themeKey]: value });
				} else {
					await base.update({ [flatPath]: value } as Partial<SettingsData>);
				}
				saveStatus.set('saved');
				return;
			} catch {
				// Queue for replay when back online
				pendingWrites.push({ dotPath, value, timestamp: Date.now() });
				pendingCount.set(pendingWrites.length);
				console.warn(`[Settings] Write queued (${pendingWrites.length} pending): ${dotPath}`);
			}
		}
		saveStatus.set('error');
	}
}

/** Get current value by dot-path */
function getNestedValue(dotPath: string): unknown {
	let data: unknown;
	const unsub = base.subscribe((s) => { data = s.data; });
	unsub();
	if (!data || typeof data !== 'object') return undefined;
	let current: unknown = data;
	for (const key of dotPath.split('.')) {
		if (current == null || typeof current !== 'object') return undefined;
		current = (current as Record<string, unknown>)[key];
	}
	return current;
}

// ── Debounced batched writes ──
const _pendingBatch: Record<string, unknown> = {};
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

/**
 * Debounced version of updateField — batches multiple rapid changes
 * into a single Firebase write after DEBOUNCE_MS of inactivity.
 * Undo entries are tracked immediately on each call.
 */
function updateFieldDebounced(dotPath: string, value: unknown) {
	// Clamp
	const range = CLAMP_MAP[dotPath];
	if (range && typeof value === 'number') {
		value = Math.max(range[0], Math.min(range[1], value));
	}

	// Track undo immediately
	const current = getNestedValue(dotPath);
	if (current !== value) {
		undoStack.push({ dotPath, oldValue: current, newValue: value });
		if (undoStack.length > MAX_UNDO) undoStack.shift();
		redoStack.length = 0;
		canUndo.set(true);
		canRedo.set(false);
	}

	// Add to pending batch
	_pendingBatch[dotPath] = value;

	// Reset debounce timer
	if (_debounceTimer) clearTimeout(_debounceTimer);
	_debounceTimer = setTimeout(flushBatch, DEBOUNCE_MS);

	// Show saving immediately for UX feedback
	saveStatus.set('saving');
}

/** Flush all pending writes as a single Firebase update */
async function flushBatch() {
	const keys = Object.keys(_pendingBatch);
	if (keys.length === 0) return;

	const rawBatch = { ..._pendingBatch };
	for (const k of keys) delete _pendingBatch[k];

	// Flatten nested paths to match Firebase rules (flat keys)
	// Separate theme/heroVisual/animations writes from settings writes
	const settingsBatch: Record<string, unknown> = {};
	const themeBatch: Record<string, unknown> = {};
	for (const [dotPath, value] of Object.entries(rawBatch)) {
		if (isThemePath(dotPath)) {
			themeBatch[getThemeKey(dotPath)] = value;
		} else {
			settingsBatch[flattenSettingsPath(dotPath)] = value;
		}
	}

	try {
		const promises: Promise<void>[] = [];
		if (Object.keys(settingsBatch).length > 0) {
			promises.push(base.update(settingsBatch as Partial<SettingsData>));
		}
		if (Object.keys(themeBatch).length > 0) {
			const { ref, update: fbUpdate } = await import('firebase/database');
			const db = await (await import('$lib/firebase')).getDb();
			if (db) {
				promises.push(fbUpdate(ref(db, 'theme'), themeBatch));
			}
		}
		await Promise.all(promises);
		saveStatus.set('saved');
	} catch (err) {
		console.error('[Settings] Batch write failed:', err);
		// Queue failed writes (keep original nested paths for retry)
		for (const [dotPath, value] of Object.entries(rawBatch)) {
			pendingWrites.push({ dotPath, value, timestamp: Date.now() });
		}
		pendingCount.set(pendingWrites.length);
		saveStatus.set('error');
	}
}

/** Undo last change — returns entry info for toast display */
export async function undoField(): Promise<{ dotPath: string; oldValue: unknown; newValue: unknown } | null> {
	const entry = undoStack.pop();
	if (!entry) return null;
	redoStack.push(entry);
	canUndo.set(undoStack.length > 0);
	canRedo.set(true);
	try {
		// Flatten path to match Firebase rules
		const flatPath = flattenSettingsPath(entry.dotPath);
		if (isThemePath(entry.dotPath)) {
			const themeKey = getThemeKey(entry.dotPath);
			const { ref, update: fbUpdate } = await import('firebase/database');
			const db = await (await import('$lib/firebase')).getDb();
			if (db) await fbUpdate(ref(db, 'theme'), { [themeKey]: entry.oldValue });
		} else {
			await base.update({ [flatPath]: entry.oldValue } as Partial<SettingsData>);
		}
		return entry;
	} catch (err) {
		console.error('[Undo] Failed:', err);
		// Revert stack mutation on failure
		redoStack.pop();
		undoStack.push(entry);
		canUndo.set(true);
		canRedo.set(redoStack.length > 0);
		return null;
	}
}

/** Redo last undone change — returns entry info for toast display */
export async function redoField(): Promise<{ dotPath: string; oldValue: unknown; newValue: unknown } | null> {
	const entry = redoStack.pop();
	if (!entry) return null;
	undoStack.push(entry);
	canRedo.set(redoStack.length > 0);
	canUndo.set(true);
	try {
		// Flatten path to match Firebase rules
		const flatPath = flattenSettingsPath(entry.dotPath);
		if (isThemePath(entry.dotPath)) {
			const themeKey = getThemeKey(entry.dotPath);
			const { ref, update: fbUpdate } = await import('firebase/database');
			const db = await (await import('$lib/firebase')).getDb();
			if (db) await fbUpdate(ref(db, 'theme'), { [themeKey]: entry.newValue });
		} else {
			await base.update({ [flatPath]: entry.newValue } as Partial<SettingsData>);
		}
		return entry;
	} catch (err) {
		console.error('[Redo] Failed:', err);
		// Revert stack mutation on failure
		undoStack.pop();
		redoStack.push(entry);
		canRedo.set(true);
		canUndo.set(undoStack.length > 0);
		return null;
	}
}

	// ── Data Migration: flat (old) → nested (new) ──
	// Firebase may have data in old flat format (heroTitle, bannerText, siteName, etc.)
	// or new nested format (hero.title, banner.text, brand.name, etc.)
	// This function normalizes both into the nested format the code expects.

/** Migration: flat (old) → nested (new). Exported for testing. */
export function migrateOldData(raw: Record<string, unknown>): SettingsData {
	const d = { ...raw } as Record<string, unknown>;

	// Merge hero from flat keys — ALWAYS prefer non-empty flat keys over nested
	if (!d.hero || typeof d.hero !== 'object') d.hero = {};
	const hero = d.hero as Record<string, unknown>;
	const t = (d._theme ?? {}) as Record<string, unknown>;

	// Title: flat key > theme > nested > siteName > default
	if (d.heroTitle) hero.title = d.heroTitle;
	else if (!hero.title && d.siteName) hero.title = d.siteName;
	// Subtitle: flat key > theme > nested > tagline > default
	if (d.heroSubtitle) hero.subtitle = d.heroSubtitle;
	else if (!hero.subtitle && d.tagline) hero.subtitle = d.tagline;
	// Eyebrow: theme > flat key > nested
	const hEyebrow = t.heroEyebrow ?? d.heroEyebrow;
	if (hEyebrow) hero.eyebrow = hEyebrow;
	// Glow word: settings/heroTitleCustom > theme/heroTitleCustom > nested > default
	if (d.heroTitleCustom) hero.glowWord = d.heroTitleCustom;
	else if (t.heroTitleCustom) hero.glowWord = t.heroTitleCustom;
	else if (!hero.glowWord) hero.glowWord = 'rompen.';
	// Clean empty strings so DEFAULT fallback kicks in via ?? in templates
	if (hero.title === '') delete hero.title;
	if (hero.subtitle === '') delete hero.subtitle;

	// Merge heroVisual from theme flat keys — ALWAYS prefer theme values
	if (!d.heroVisual || typeof d.heroVisual !== 'object') d.heroVisual = {};
	const hv = d.heroVisual as Record<string, unknown>;
	if (t.heroGlowOn !== undefined) hv.glowOn = t.heroGlowOn;
	if (t.heroGlowInt !== undefined) hv.glowInt = t.heroGlowInt;
	if (t.heroGlowBlur !== undefined) hv.glowBlur = t.heroGlowBlur;
	if (t.heroGlowClr !== undefined) hv.glowClr = t.heroGlowClr;
	if (t.heroStrokeOn !== undefined) hv.strokeOn = t.heroStrokeOn;
	if (t.heroStrokeW !== undefined) hv.strokeW = t.heroStrokeW;
	if (t.heroStrokeClr !== undefined) hv.strokeClr = t.heroStrokeClr;
	if (t.heroWordBlur !== undefined) hv.wordBlur = t.heroWordBlur;
	if (t.heroWordOp !== undefined) hv.wordOp = t.heroWordOp;
	if (t.heroTitleSize !== undefined) hv.titleSize = t.heroTitleSize;
	if (t.heroLetterSpacing !== undefined) hv.letterSpacing = t.heroLetterSpacing;
	if (t.heroLineHeight !== undefined) hv.lineHeight = t.heroLineHeight;
	if (t.heroEyebrowOn !== undefined) hv.eyebrowOn = t.heroEyebrowOn;
	if (t.heroEyebrowClr !== undefined) hv.eyebrowClr = t.heroEyebrowClr;
	if (t.heroEyebrowSize !== undefined) hv.eyebrowSize = t.heroEyebrowSize;
	if (t.heroGradOn !== undefined) hv.gradOn = t.heroGradOn;
	if (t.heroGradClr !== undefined) hv.gradClr = t.heroGradClr;
	if (t.heroGradOp !== undefined) hv.gradOp = t.heroGradOp;
	if (t.heroGradW !== undefined) hv.gradW = t.heroGradW;
	if (t.heroGradH !== undefined) hv.gradH = t.heroGradH;
	if (hv.eyebrowOn === undefined) hv.eyebrowOn = true;
	if (hv.glowOn === undefined) hv.glowOn = true;

	// Merge section from flat keys — prefer non-empty flat keys
	if (!d.section || typeof d.section !== 'object') d.section = {};
	const sec = d.section as Record<string, unknown>;
	if (!sec.title) sec.title = 'Catálogo';
	if (d.dividerTitle) sec.dividerTitle = d.dividerTitle;
	if (d.dividerSub) sec.dividerSub = d.dividerSub;
	if (!sec.dividerTitle) sec.dividerTitle = DEFAULT.section.dividerTitle;
	if (!sec.dividerSub) sec.dividerSub = DEFAULT.section.dividerSub;

	// Merge brand from flat keys — prefer non-empty flat keys
	if (!d.brand || typeof d.brand !== 'object') d.brand = {};
	const brand = d.brand as Record<string, unknown>;
	if (d.siteName) brand.name = d.siteName;
	if (!brand.name) brand.name = 'DACEWAV';
	if (t.logoUrl) brand.logo = t.logoUrl;
	if (d.whatsapp) brand.whatsapp = d.whatsapp;
	if (!brand.footerText) brand.footerText = 'Todos los derechos reservados · 2026';
	if (!brand.metaDescription) brand.metaDescription = 'Beats que rompen';

	// Merge banner from flat keys — prefer non-empty flat keys
	if (!d.banner || typeof d.banner !== 'object') d.banner = {};
	const banner = d.banner as Record<string, unknown>;
	if (d.bannerActive !== undefined) banner.enabled = d.bannerActive;
	if (d.bannerText) banner.text = d.bannerText;
	if (d.bannerAnim) banner.animation = d.bannerAnim;
	if (d.bannerBg) banner.bgColor = d.bannerBg;
	if (d.bannerTxtClr) banner.textColor = d.bannerTxtClr;
	if (d.bannerSpeed) banner.speed = d.bannerSpeed;
	if (d.bannerEasing) banner.easing = d.bannerEasing;
	if (d.bannerDir) banner.direction = d.bannerDir;
	if (d.bannerDelay !== undefined) banner.delay = d.bannerDelay;
	// Defaults for banner
	if (!banner.animation) banner.animation = DEFAULT.banner.animation;
	if (!banner.bgColor) banner.bgColor = DEFAULT.banner.bgColor;
	if (!banner.textColor) banner.textColor = DEFAULT.banner.textColor;
	if (!banner.speed) banner.speed = DEFAULT.banner.speed;

	// Merge loader
	if (!d.loader || typeof d.loader !== 'object') d.loader = { enabled: true, brandText: brand.name || 'DACEWAV' };

	// Merge cardStyle from flat keys
	if (!d.cardStyle || typeof d.cardStyle !== 'object') {
		if (d.globalCardStyle && typeof d.globalCardStyle === 'object') {
			// Migrate nested Firebase structure → flat CardStyleConfig
			const gcs = d.globalCardStyle as Record<string, unknown>;
			const flat: Record<string, unknown> = {};

			// Glow
			const glow = gcs.glow as Record<string, unknown> | undefined;
			if (glow) {
				flat.glow = glow.enabled ? (glow.type ?? 'active') : 'none';
				flat.glowColor = glow.color ?? '';
				flat.glowIntensity = glow.intensity ?? 1;
			}

			// Filter
			const filter = gcs.filter as Record<string, unknown> | undefined;
			if (filter) {
				flat.brightness = filter.brightness ?? 1;
				flat.contrast = filter.contrast ?? 1;
				flat.saturate = filter.saturate ?? 1;
				flat.grayscale = filter.grayscale ?? 0;
				flat.sepia = filter.sepia ?? 0;
				flat.hueRotate = filter.hueRotate ?? 0;
				flat.invert = filter.invert ?? 0;
			}

			// Border
			const border = gcs.border as Record<string, unknown> | undefined;
			if (border && border.enabled) {
				flat.borderWidth = `${border.width ?? 1}px`;
				flat.borderStyle = border.style ?? 'solid';
				flat.borderColor = border.color ?? '';
			}

			// Shadow
			const shadow = gcs.shadow as Record<string, unknown> | undefined;
			if (shadow && shadow.enabled) {
				flat.boxShadow = `${shadow.x ?? 0}px ${shadow.y ?? 4}px ${shadow.blur ?? 12}px ${shadow.spread ?? 0}px rgba(0,0,0,${shadow.opacity ?? 0.35})${shadow.inset ? ' inset' : ''}`;
			}

			// Hover
			const hover = gcs.hover as Record<string, unknown> | undefined;
			if (hover) {
				flat.hoverScale = hover.scale ?? 1.02;
				flat.hoverBrightness = hover.brightness ?? 1;
				flat.hoverBlur = hover.blur ?? 0;
				flat.hoverSaturate = hover.saturate ?? 1;
				if (hover.transition) flat.hoverTransition = hover.transition;
			}

			// Style (shimmer, borderRadius, opacity)
			const style = gcs.style as Record<string, unknown> | undefined;
			if (style) {
				flat.shimmer = style.shimmer ?? false;
				if (style.borderRadius) flat.borderRadius = `${style.borderRadius}px`;
				if (style.shimmerOp) flat.shimmerOpacity = style.shimmerOp;
				if (style.shimmerSpeed) flat.shimmerDuration = `${style.shimmerSpeed}s`;
			}

			// Transform
			const transform = gcs.transform as Record<string, unknown> | undefined;
			if (transform) {
				if (transform.rotate) flat.rotate = transform.rotate;
				if (transform.scale && transform.scale !== 1) flat.scale = transform.scale;
				if (transform.skewX || transform.skewY) {
					flat.skew = `${transform.skewX ?? 0}deg, ${transform.skewY ?? 0}deg`;
				}
			}

			d.cardStyle = flat;
		} else {
			d.cardStyle = {};
		}
	}

	// Merge links from settings flat keys
	if (!d.links) {
		const links = [];
		if (d.instagram) links.push({ label: 'Instagram', url: `https://instagram.com/${d.instagram}`, icon: 'instagram' });
		if (d.whatsapp) links.push({ label: 'WhatsApp', url: `https://wa.me/${String(d.whatsapp).replace('+', '')}`, icon: 'whatsapp' });
		d.links = links;
	}

	// Merge animations from theme flat keys
	if (!d.animations || typeof d.animations !== 'object') d.animations = {};
	const anim = d.animations as Record<string, unknown>;
	if (!anim.animLogo && t.animLogo) anim.animLogo = (t.animLogo as Record<string, unknown>)?.type ?? 'none';
	if (!anim.animCards && t.animCards) anim.animCards = (t.animCards as Record<string, unknown>)?.type ?? 'none';
	if (!anim.animButtons && t.animButtons) anim.animButtons = (t.animButtons as Record<string, unknown>)?.type ?? 'none';
	if (!anim.animPlayer && t.animPlayer) anim.animPlayer = (t.animPlayer as Record<string, unknown>)?.type ?? 'none';
	if (!anim.animTitle && t.animTitle) anim.animTitle = (t.animTitle as Record<string, unknown>)?.type ?? 'none';
	if (!anim.animWaveform && t.animWaveform) anim.animWaveform = (t.animWaveform as Record<string, unknown>)?.type ?? 'none';

	// Merge labels
	if (!d.labels || typeof d.labels !== 'object') d.labels = {};
	// Merge labels with defaults
	const lbl = d.labels as Record<string, unknown>;
	for (const [k, v] of Object.entries(DEFAULT.labels)) {
		if (!lbl[k]) lbl[k] = v;
	}

	// Merge CTA with defaults
	if (!d.cta || typeof d.cta !== 'object') d.cta = {};
	const cta = d.cta as Record<string, unknown>;
	if (!cta.title) cta.title = DEFAULT.cta.title;
	if (!cta.subtitle) cta.subtitle = DEFAULT.cta.subtitle;
	if (!cta.buttonText) cta.buttonText = DEFAULT.cta.buttonText;
	if (!cta.buttonUrl) cta.buttonUrl = DEFAULT.cta.buttonUrl;

	// Merge layout
	if (!d.layout || typeof d.layout !== 'object') d.layout = {};
	const layout = d.layout as Record<string, unknown>;
	if (!layout.cardsPerRow) layout.cardsPerRow = 3;
	if (layout.showWishlist === undefined) layout.showWishlist = true;
	if (!layout.logoScale && t.logoScale) layout.logoScale = t.logoScale;
	if (!layout.logoWidth && t.logoWidth) layout.logoWidth = t.logoWidth;
	if (!layout.heroPadTop && t.heroPadTop) layout.heroPadTop = t.heroPadTop;

	// Merge testimonials
	if (!d.testimonials) d.testimonials = [];

	// Merge theme from Firebase theme/ path
	// _theme (t) contains the flat theme data from the separate Firebase path.
	// Settings writes go to settings.theme.*, but old data may live in theme/.
	// Merge: settings.theme takes priority, fill gaps from theme/ path.
	if (!d.theme || typeof d.theme !== 'object') d.theme = {};
	const theme = d.theme as Record<string, unknown>;
	// Copy all _theme keys that aren't already set in settings.theme
	for (const [k, v] of Object.entries(t)) {
		if (theme[k] === undefined || theme[k] === null || theme[k] === '') {
			theme[k] = v;
		}
	}

	return d as unknown as SettingsData;
}

// Settings store with migration layer
let _rawData: Record<string, unknown> | null = null;
let _themeData: Record<string, unknown> | null = null;
const settingsStore = writable<StoreState<SettingsData>>({
	data: null,
	loading: true,
	error: null
});

// Listen to base settings store
base.subscribe((state) => {
	_rawData = state.data as Record<string, unknown> | null;
	if (_rawData && typeof _rawData === 'object') {
		const merged = { ..._rawData, _theme: _themeData };
		settingsStore.set({ data: migrateOldData(merged), loading: false, error: null });
	} else if (!state.loading) {
		settingsStore.set({ data: DEFAULT, loading: false, error: state.error });
	} else {
		settingsStore.set({ data: null, loading: true, error: null });
	}
});

// Also listen to theme store for hero data
let _themeUnsub: (() => void) | null = null;
async function subscribeThemeForMigration() {
	try {
		const db = await getDb();
		if (!db) return;
		const { ref, onValue } = await import('firebase/database');
		_themeUnsub = onValue(ref(db, 'theme'), (snap) => {
			_themeData = snap.val();
			if (_rawData && typeof _rawData === 'object') {
				const merged = { ..._rawData, _theme: _themeData };
				settingsStore.set({ data: migrateOldData(merged), loading: false, error: null });
			}
		});
	} catch { /* silent */ }
}

export const settings = {
	subscribe: settingsStore.subscribe,
	subscribeFirebase: () => {
		base.subscribeFirebase();
		subscribeThemeForMigration();
	},
	unsubscribe: () => {
		base.unsubscribe();
		if (_themeUnsub) { _themeUnsub(); _themeUnsub = null; }
	},
	set: base.set,
	update: base.update,
	updateField,
	updateFieldDebounced
};
