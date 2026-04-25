/**
 * Feature Toggles — enable/disable store features from admin
 *
 * Firebase path: settings/features
 * Controls: wishlist, testimonials, particles, banner, hero, player, filters
 */

import type { CardStyleConfig } from '$lib/cardStyleEngine';

export type FeatureKey =
	| 'wishlist'
	| 'testimonials'
	| 'particles'
	| 'banner'
	| 'hero'
	| 'player'
	| 'filters'
	| 'stats'
	| 'floating'
	| 'scrollProgress'
	| 'cursorGlow';

export const FEATURE_LABELS: Record<FeatureKey, { label: string; icon: string; description: string }> = {
	wishlist: { label: 'Wishlist', icon: '❤️', description: 'Botón de favoritos en cards' },
	testimonials: { label: 'Testimonios', icon: '💬', description: 'Sección de testimonios en la tienda' },
	particles: { label: 'Partículas', icon: '✨', description: 'Efecto de partículas flotantes' },
	banner: { label: 'Banner', icon: '📢', description: 'Banner superior animado' },
	hero: { label: 'Hero', icon: '🏠', description: 'Sección hero principal' },
	player: { label: 'Player', icon: '🎵', description: 'Barra de reproducción inferior' },
	filters: { label: 'Filtros', icon: '🔍', description: 'Filtros de búsqueda en la tienda' },
	stats: { label: 'Stats', icon: '📊', description: 'Barra de estadísticas en hero' },
	floating: { label: 'Floating', icon: '🎈', description: 'Elementos flotantes sobre la tienda' },
	scrollProgress: { label: 'Scroll Progress', icon: '📏', description: 'Barra de progreso de scroll' },
	cursorGlow: { label: 'Cursor Glow', icon: '💡', description: 'Efecto glow que sigue el cursor' }
};

export const ALL_FEATURES: FeatureKey[] = Object.keys(FEATURE_LABELS) as FeatureKey[];
