/**
 * Card Style Presets — predefined style configurations
 */

import type { CardStyleConfig } from './cardStyleEngine';

export type CardPreset = {
	id: string;
	name: string;
	description: string;
	icon: string;
	config: Partial<CardStyleConfig>;
};

export const CARD_PRESETS: CardPreset[] = [
	{
		id: 'default',
		name: 'Default',
		description: 'Limpio, sin efectos',
		icon: '⬜',
		config: {
			glow: 'none',
			brightness: 1,
			contrast: 1,
			saturate: 1,
			grayscale: 0,
			sepia: 0,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,255,255,0.08)',
			boxShadow: 'none',
			hoverScale: 1.02,
			animation: 'none',
			shimmer: false
		}
	},
	{
		id: 'neon',
		name: 'Neon',
		description: 'Glow intenso + saturación',
		icon: '💜',
		config: {
			glow: 'neon',
			glowIntensity: 0.8,
			saturate: 1.4,
			brightness: 1.05,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(var(--accent-rgb), 0.4)',
			boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.3), inset 0 0 20px rgba(var(--accent-rgb), 0.05)',
			hoverScale: 1.04,
			hoverSaturate: 1.6,
			animation: 'none',
			shimmer: true,
			shimmerOpacity: 0.15
		}
	},
	{
		id: 'glass',
		name: 'Glass',
		description: 'Translúcido + blur',
		icon: '🪟',
		config: {
			glow: 'none',
			brightness: 1,
			contrast: 1,
			saturate: 1.1,
			cardBgOpacity: 0.4,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,255,255,0.15)',
			boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
			hoverScale: 1.02,
			hoverBrightness: 1.1,
			animation: 'none',
			shimmer: false,
			coverBlur: 0
		}
	},
	{
		id: 'retro',
		name: 'Retro',
		description: 'Sepia + borde grueso',
		icon: '📼',
		config: {
			glow: 'none',
			sepia: 0.3,
			saturate: 0.9,
			contrast: 1.1,
			borderWidth: '3px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,200,100,0.3)',
			boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
			hoverScale: 1.0,
			hoverBrightness: 1.05,
			animation: 'none',
			shimmer: false
		}
	},
	{
		id: 'cinema',
		name: 'Cinema',
		description: 'Oscuro + sombra intensa',
		icon: '🎬',
		config: {
			glow: 'active',
			glowIntensity: 0.4,
			brightness: 0.95,
			contrast: 1.2,
			saturate: 1.1,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,255,255,0.05)',
			boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
			hoverScale: 1.03,
			hoverBrightness: 1.1,
			animation: 'none',
			shimmer: false
		}
	},
	{
		id: 'glitch',
		name: 'Glitch',
		description: 'Distorsión + hue-rotate',
		icon: '📺',
		config: {
			glow: 'rgb',
			glowIntensity: 0.6,
			hueRotate: 15,
			saturate: 1.5,
			contrast: 1.1,
			borderWidth: '2px',
			borderStyle: 'solid',
			borderColor: 'rgba(var(--accent-rgb), 0.5)',
			boxShadow: '2px 0 rgba(255,0,0,0.1), -2px 0 rgba(0,255,255,0.1)',
			hoverScale: 1.02,
			hoverSaturate: 2,
			animation: 'glitch',
			animationDuration: '3s',
			shimmer: false
		}
	},
	{
		id: 'minimal',
		name: 'Minimal',
		description: 'Sin glow, borde fino',
		icon: '◽',
		config: {
			glow: 'none',
			brightness: 1,
			contrast: 1,
			saturate: 1,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,255,255,0.06)',
			boxShadow: 'none',
			hoverScale: 1.01,
			hoverBrightness: 1.02,
			animation: 'none',
			shimmer: false
		}
	},
	{
		id: 'bold',
		name: 'Bold',
		description: 'Sombra fuerte + accent border',
		icon: '🔴',
		config: {
			glow: 'active',
			glowIntensity: 0.5,
			saturate: 1.2,
			contrast: 1.1,
			borderWidth: '2px',
			borderStyle: 'solid',
			borderColor: 'var(--accent)',
			boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
			hoverScale: 1.05,
			hoverBrightness: 1.1,
			animation: 'none',
			shimmer: false
		}
	}
];
