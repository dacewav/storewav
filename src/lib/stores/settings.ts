/**
 * Settings store — lee/escribe settings/ de Firebase
 *
 * Estructura Firebase:
 *   settings/hero → { title, subtitle, eyebrow, glowWord }
 *   settings/section → { title, dividerTitle, dividerSub }
 *   settings/cta → { title, subtitle, buttonText, buttonUrl }
 *   settings/layout → { cardsPerRow, showWishlist }
 *   settings/links → [{ label, url, icon }]
 *   settings/brand → { name, logo, favicon, footerText, metaDescription }
 *   settings/loader → { enabled, brandText }
 *   settings/cardStyle → { glow, animation, shimmer, ... }
 *   settings/labels → { search, emptyTitle, emptySub, ... }
 */

import { createFirebaseStore } from './_firebaseStore';

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

export type LayoutSettings = {
	cardsPerRow: number;
	showWishlist: boolean;
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
};

export type Testimonial = {
	name: string;
	text: string;
	stars: number;
	avatar: string;
};

export type CardStyleSettings = {
	glow: string;
	animation: string;
	shimmer: boolean;
	hoverScale: number;
	brightness: number;
	saturate: number;
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
};

export type SettingsData = {
	hero: HeroSettings;
	section: SectionSettings;
	cta: CtaSettings;
	layout: LayoutSettings;
	links: LinkItem[];
	brand: BrandSettings;
	loader: LoaderSettings;
	banner: BannerSettings;
	testimonials: Testimonial[];
	cardStyle: CardStyleSettings;
	labels: LabelSettings;
};

const DEFAULT: SettingsData = {
	hero: {
		title: 'DACEWAV',
		subtitle: 'Trap · R&B · Drill · Beats profesionales para tu próximo hit',
		eyebrow: 'En vivo · Producción profesional',
		glowWord: 'rompen.'
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
	layout: { cardsPerRow: 3, showWishlist: true },
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
		animation: 'static'
	},
	testimonials: [],
	cardStyle: { glow: 'none', animation: 'none', shimmer: false, hoverScale: 1.02, brightness: 1, saturate: 1 },
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
		licenseExclusiveDesc: 'Exclusivo total'
	}
};

export const settings = createFirebaseStore<SettingsData>('settings', DEFAULT);
