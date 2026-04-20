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
import type { CardStyleConfig } from '$lib/cardStyleEngine';
import { writable, type Writable } from 'svelte/store';

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
		metaDescription: 'Beats que rompen'
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

export const settings = {
	subscribe: base.subscribe,
	subscribeFirebase: base.subscribeFirebase,
	unsubscribe: base.unsubscribe,
	set: base.set,
	update: base.update,
	updateField
};
