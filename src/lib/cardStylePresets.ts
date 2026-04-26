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
	},
	{
		id: 'noir',
		name: 'Noir',
		description: 'B/N dramático + alto contraste',
		icon: '🖤',
		config: {
			glow: 'none',
			brightness: 0.9,
			contrast: 1.4,
			saturate: 0.15,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,255,255,0.12)',
			boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
			hoverScale: 1.03,
			hoverBrightness: 1.15,
			animation: 'none',
			shimmer: false
		}
	},
	{
		id: 'brasa',
		name: 'Brasa',
		description: 'Glow cálido + tonos fuego',
		icon: '🔥',
		config: {
			glow: 'active',
			glowIntensity: 0.7,
			brightness: 1.0,
			contrast: 1.1,
			saturate: 1.3,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,120,50,0.3)',
			boxShadow: '0 0 24px rgba(255,80,20,0.2), 0 4px 16px rgba(0,0,0,0.3)',
			hoverScale: 1.04,
			hoverSaturate: 1.5,
			animation: 'none',
			shimmer: true,
			shimmerOpacity: 0.1
		}
	},
	{
		id: 'escarcha',
		name: 'Escarcha',
		description: 'Frío + cristal + azul',
		icon: '❄️',
		config: {
			glow: 'active',
			glowIntensity: 0.5,
			brightness: 1.1,
			contrast: 1.0,
			saturate: 0.8,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(150,200,255,0.25)',
			boxShadow: '0 0 20px rgba(100,180,255,0.15), 0 4px 16px rgba(0,0,0,0.2)',
			hoverScale: 1.02,
			hoverBrightness: 1.15,
			animation: 'none',
			shimmer: true,
			shimmerOpacity: 0.2
		}
	},
	{
		id: 'holo',
		name: 'Holo',
		description: 'Holográfico + hue-rotate cycling',
		icon: '🌈',
		config: {
			glow: 'rgb',
			glowIntensity: 0.6,
			saturate: 1.3,
			contrast: 1.1,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(var(--accent-rgb), 0.3)',
			boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.2)',
			hoverScale: 1.03,
			hoverSaturate: 1.8,
			animation: 'hologram',
			animationDuration: '5s',
			shimmer: true,
			shimmerOpacity: 0.15
		}
	},
	{
		id: 'flota',
		name: 'Flota',
		description: 'Flotando suave + sombra difusa',
		icon: '🎈',
		config: {
			glow: 'none',
			brightness: 1.05,
			contrast: 1.0,
			saturate: 1.1,
			borderWidth: '0px',
			borderStyle: 'none',
			borderColor: 'transparent',
			boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
			hoverScale: 1.06,
			hoverBrightness: 1.1,
			animation: 'float',
			animationDuration: '4s',
			shimmer: false
		}
	},
	{
		id: 'eco',
		name: 'Eco',
		description: 'Orgánico + tonos tierra',
		icon: '🌿',
		config: {
			glow: 'active',
			glowIntensity: 0.3,
			brightness: 1.0,
			contrast: 1.05,
			saturate: 0.9,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(100,160,80,0.2)',
			boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
			hoverScale: 1.02,
			hoverBrightness: 1.08,
			animation: 'breathe',
			animationDuration: '6s',
			shimmer: false
		}
	},
	{
		id: 'pop',
		name: 'Pop',
		description: 'Vibrante + colores fuertes',
		icon: '💥',
		config: {
			glow: 'active',
			glowIntensity: 0.6,
			brightness: 1.1,
			contrast: 1.2,
			saturate: 1.6,
			borderWidth: '2px',
			borderStyle: 'solid',
			borderColor: 'var(--accent)',
			boxShadow: '0 4px 20px rgba(var(--accent-rgb), 0.3)',
			hoverScale: 1.06,
			hoverSaturate: 2.0,
			animation: 'none',
			shimmer: false
		}
	},
	{
		id: 'abismo',
		name: 'Abismo',
		description: 'Profundo + oscuridad total',
		icon: '🕳️',
		config: {
			glow: 'active',
			glowIntensity: 0.8,
			brightness: 0.85,
			contrast: 1.3,
			saturate: 0.7,
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgba(255,255,255,0.04)',
			boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.3)',
			hoverScale: 1.02,
			hoverBrightness: 1.2,
			animation: 'none',
			shimmer: false
		}
	}
];
