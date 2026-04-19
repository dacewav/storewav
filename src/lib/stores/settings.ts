/**
 * Settings store — lee/escribe settings/ de Firebase
 *
 * Estructura Firebase:
 *   settings/hero → { title, subtitle }
 *   settings/layout → { cardsPerRow, showWishlist }
 *   settings/links → [{ label, url, icon }]
 *   settings/brand → { logo, favicon }
 */

import { createFirebaseStore } from './_firebaseStore';

export type HeroSettings = {
	title: string;
	subtitle: string;
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
	logo: string;
	favicon: string;
};

export type SettingsData = {
	hero: HeroSettings;
	layout: LayoutSettings;
	links: LinkItem[];
	brand: BrandSettings;
};

const DEFAULT: SettingsData = {
	hero: { title: 'DACEWAV', subtitle: 'Beats que rompen' },
	layout: { cardsPerRow: 3, showWishlist: true },
	links: [
		{ label: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
		{ label: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
		{ label: 'WhatsApp', url: 'https://wa.me', icon: 'whatsapp' }
	],
	brand: { logo: '', favicon: '' }
};

export const settings = createFirebaseStore<SettingsData>('settings', DEFAULT);

/** Sub-store para cada sección (lectura directa, sin escribir) */
export function getHeroSettings() {
	return { subscribe: (fn: (v: HeroSettings) => void) => {
		return settings.subscribe((s) => fn(s.data?.hero ?? DEFAULT.hero));
	}};
}
