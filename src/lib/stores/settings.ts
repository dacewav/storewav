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
	icon: string;
};

export type BrandSettings = {
	name: string;
	logo: string;
	favicon: string;
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
	stars: number;
	avatar: string;
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

	// Particles
	particlesOn: boolean;
	particlesCount: number;
	particlesSpeed: number;
	particlesType: string; // 'circle' | 'square' | 'line' | 'text' | 'image'
	particlesColor: string;
	particlesOpacity: number; // 0-1
	particlesText: string;
	particlesImgUrl: string;
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
};

export type LabelSettings = {
	search: string;
	emptyTitle: string;
	emptySub: string;
	wishlistEmptyTitle: string;
	wishlistEmptySub: string;
	beatPreview: string;
	licenses: string;
	buyPrefix: string;
	filterAll: string;
	filterKey: string;
	clearAll: string;
	tags: string;
	priceFrom: string;
	statBeats: string;
	statGenres: string;
	statLicenses: string;
	licenseBasic: string;
	licensePremium: string;
	licenseUnlimited: string;
	licenseExclusive: string;
	licenseBasicDesc: string;
	licensePremiumDesc: string;
	licenseUnlimitedDesc: string;
	licenseExclusiveDesc: string;
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
		particlesImgUrl: ''
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
		showLogoText: true
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
		animWaveform: 'none'
	},
	labels: {
		search: 'Buscar beats...',
		emptyTitle: 'Sin resultados',
		emptySub: 'Prueba con otros filtros',
		wishlistEmptyTitle: 'Sin favoritos',
		wishlistEmptySub: 'Añade beats a tu lista para verlos aquí',
		beatPreview: 'Escuchar preview',
		licenses: 'Licencias',
		buyPrefix: 'Comprar',
		filterAll: 'Todos',
		filterKey: 'Tonalidad',
		clearAll: 'Limpiar todo',
		tags: 'Tags',
		priceFrom: 'Desde',
		statBeats: 'beats',
		statGenres: 'géneros',
		statLicenses: 'licencias',
		licenseBasic: 'Basic',
		licensePremium: 'Premium',
		licenseUnlimited: 'Unlimited',
		licenseExclusive: 'Exclusive',
		licenseBasicDesc: 'MP3 · 1 uso',
		licensePremiumDesc: 'WAV · Sin tag',
		licenseUnlimitedDesc: 'WAV + Stems',
		licenseExclusiveDesc: 'Exclusivo total',
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

/** Helper para actualizar un campo por dot-path (ej: 'heroVisual.glowOn') */
async function updateField(dotPath: string, value: unknown) {
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
		// Firebase update acepta claves con dot-notation directamente
		await base.update({ [dotPath]: value } as Partial<SettingsData>);
		saveStatus.set('saved');
	} catch {
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

/** Undo last change */
export async function undoField() {
	const entry = undoStack.pop();
	if (!entry) return;
	redoStack.push(entry);
	canUndo.set(undoStack.length > 0);
	canRedo.set(true);
	await base.update({ [entry.dotPath]: entry.oldValue } as Partial<SettingsData>);
}

/** Redo last undone change */
export async function redoField() {
	const entry = redoStack.pop();
	if (!entry) return;
	undoStack.push(entry);
	canRedo.set(redoStack.length > 0);
	canUndo.set(true);
	await base.update({ [entry.dotPath]: entry.newValue } as Partial<SettingsData>);
}

	// ── Data Migration: flat (old) → nested (new) ──
	// Firebase may have data in old flat format (heroTitle, bannerText, siteName, etc.)
	// or new nested format (hero.title, banner.text, brand.name, etc.)
	// This function normalizes both into the nested format the code expects.

function migrateOldData(raw: Record<string, unknown>): SettingsData {
	const d = { ...raw } as Record<string, unknown>;

	// Merge hero from flat keys if nested doesn't exist
	if (!d.hero || typeof d.hero !== 'object') d.hero = {};
	const hero = d.hero as Record<string, unknown>;
	const t = (d._theme ?? {}) as Record<string, unknown>;
	if (!hero.title && d.heroTitle) hero.title = d.heroTitle;
	if (!hero.title && d.siteName) hero.title = d.siteName;
	if (!hero.subtitle && d.heroSubtitle) hero.subtitle = d.heroSubtitle;
	if (!hero.eyebrow) {
		const hEyebrow = t.heroEyebrow ?? d.heroEyebrow;
		if (hEyebrow) hero.eyebrow = hEyebrow;
	}
	if (!hero.glowWord && t.heroTitleCustom) hero.glowWord = t.heroTitleCustom;
	else if (!hero.glowWord) hero.glowWord = 'rompen.';

	// Merge heroVisual from theme flat keys
	if (!d.heroVisual || typeof d.heroVisual !== 'object') d.heroVisual = {};
	const hv = d.heroVisual as Record<string, unknown>;
	if (hv.glowOn === undefined && t.heroGlowOn !== undefined) hv.glowOn = t.heroGlowOn;
	if (!hv.glowInt && t.heroGlowInt) hv.glowInt = t.heroGlowInt;
	if (!hv.glowBlur && t.heroGlowBlur) hv.glowBlur = t.heroGlowBlur;
	if (!hv.glowClr && t.heroGlowClr) hv.glowClr = t.heroGlowClr;
	if (hv.strokeOn === undefined && t.heroStrokeOn !== undefined) hv.strokeOn = t.heroStrokeOn;
	if (!hv.strokeW && t.heroStrokeW) hv.strokeW = t.heroStrokeW;
	if (!hv.strokeClr && t.heroStrokeClr) hv.strokeClr = t.heroStrokeClr;
	if (!hv.wordBlur && t.heroWordBlur) hv.wordBlur = t.heroWordBlur;
	if (!hv.wordOp && t.heroWordOp) hv.wordOp = t.heroWordOp;
	if (!hv.titleSize && t.heroTitleSize) hv.titleSize = t.heroTitleSize;
	if (!hv.letterSpacing && t.heroLetterSpacing) hv.letterSpacing = t.heroLetterSpacing;
	if (!hv.lineHeight && t.heroLineHeight) hv.lineHeight = t.heroLineHeight;
	if (hv.eyebrowOn === undefined && t.heroEyebrowOn !== undefined) hv.eyebrowOn = t.heroEyebrowOn;
	if (!hv.eyebrowClr && t.heroEyebrowClr) hv.eyebrowClr = t.heroEyebrowClr;
	if (!hv.eyebrowSize && t.heroEyebrowSize) hv.eyebrowSize = t.heroEyebrowSize;
	if (hv.gradOn === undefined && t.heroGradOn !== undefined) hv.gradOn = t.heroGradOn;
	if (!hv.gradClr && t.heroGradClr) hv.gradClr = t.heroGradClr;
	if (!hv.gradOp && t.heroGradOp) hv.gradOp = t.heroGradOp;
	if (!hv.gradW && t.heroGradW) hv.gradW = t.heroGradW;
	if (!hv.gradH && t.heroGradH) hv.gradH = t.heroGradH;
	if (hv.eyebrowOn === undefined) hv.eyebrowOn = true;
	if (hv.glowOn === undefined) hv.glowOn = true;

	// Merge section from flat keys
	if (!d.section || typeof d.section !== 'object') d.section = {};
	const sec = d.section as Record<string, unknown>;
	if (!sec.title) sec.title = 'Catálogo';
	if (!sec.dividerTitle && d.dividerTitle) sec.dividerTitle = d.dividerTitle;
	if (!sec.dividerSub && d.dividerSub) sec.dividerSub = d.dividerSub;

	// Merge brand from flat keys
	if (!d.brand || typeof d.brand !== 'object') d.brand = {};
	const brand = d.brand as Record<string, unknown>;
	if (!brand.name && d.siteName) brand.name = d.siteName;
	if (!brand.name) brand.name = 'DACEWAV';
	if (!brand.logo && t.logoUrl) brand.logo = t.logoUrl;
	if (!brand.whatsapp && d.whatsapp) brand.whatsapp = d.whatsapp;
	if (!brand.footerText) brand.footerText = 'Todos los derechos reservados · 2026';
	if (!brand.metaDescription) brand.metaDescription = 'Beats que rompen';

	// Merge banner from flat keys
	if (!d.banner || typeof d.banner !== 'object') d.banner = {};
	const banner = d.banner as Record<string, unknown>;
	if (banner.enabled === undefined && d.bannerActive !== undefined) banner.enabled = d.bannerActive;
	if (!banner.text && d.bannerText) banner.text = d.bannerText;
	if (!banner.animation && d.bannerAnim) banner.animation = d.bannerAnim;
	if (!banner.bgColor && d.bannerBg) banner.bgColor = d.bannerBg;
	if (!banner.textColor && d.bannerTxtClr) banner.textColor = d.bannerTxtClr;
	if (!banner.speed && d.bannerSpeed) banner.speed = d.bannerSpeed;
	if (!banner.easing && d.bannerEasing) banner.easing = d.bannerEasing;
	if (!banner.direction && d.bannerDir) banner.direction = d.bannerDir;
	if (!banner.delay && d.bannerDelay) banner.delay = d.bannerDelay;

	// Merge loader
	if (!d.loader || typeof d.loader !== 'object') d.loader = { enabled: true, brandText: brand.name || 'DACEWAV' };

	// Merge cardStyle from flat keys
	if (!d.cardStyle || typeof d.cardStyle !== 'object') {
		if (d.globalCardStyle && typeof d.globalCardStyle === 'object') {
			d.cardStyle = d.globalCardStyle;
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

	// Merge CTA
	if (!d.cta || typeof d.cta !== 'object') d.cta = {};

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
	updateField
};
