/**
 * Seed demo beats — creates sample beats in Firebase for testing.
 * Usage: import { seedDemoBeats } from '$lib/seed';
 */

import { createBeat, type Beat } from '$lib/stores/beats';

const DEMO_BEATS: Omit<Beat, 'date'>[] = [
	{
		name: 'Noche Oscura',
		artist: 'DACEWAV',
		bpm: 140,
		key: 'Am',
		genre: 'Trap',
		tags: ['dark', 'hard', '808'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Beat de trap oscuro con 808s pesados y melodies etéreas.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 }
		],
		active: true,
		featured: true,
		available: true,
		exclusive: false
	},
	{
		name: 'Luna Llena',
		artist: 'DACEWAV',
		bpm: 128,
		key: 'Dm',
		genre: 'R&B',
		tags: ['chill', 'smooth', 'vocal'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'R&B suave con pads atmosféricos y groove relajado.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 }
		],
		active: true,
		featured: false,
		available: true,
		exclusive: false
	},
	{
		name: 'Fuego Cruzado',
		artist: 'DACEWAV',
		bpm: 145,
		key: 'Fm',
		genre: 'Drill',
		tags: ['drill', 'uk', 'sliding'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Drill agresivo con sliding 808s y hi-hats rápidos.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 400, priceUSD: 25 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 850, priceUSD: 50 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1700, priceUSD: 100 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 6000, priceUSD: 350 }
		],
		active: true,
		featured: true,
		available: true,
		exclusive: false
	},
	{
		name: 'Corrido Tumbado',
		artist: 'DACEWAV',
		bpm: 110,
		key: 'G',
		genre: 'Corrido',
		tags: ['corrido', 'mexicano', 'bajo'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Corrido tumbado con requinto y bajo sexto.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 }
		],
		active: true,
		featured: false,
		available: true,
		exclusive: false
	},
	{
		name: 'Neón',
		artist: 'DACEWAV',
		bpm: 135,
		key: 'C#m',
		genre: 'Pop',
		tags: ['pop', 'synth', 'bright'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Pop electrónico con synths brillantes y drop energético.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 300, priceUSD: 18 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 650, priceUSD: 40 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1300, priceUSD: 80 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 4500, priceUSD: 270 }
		],
		active: true,
		featured: false,
		available: true,
		exclusive: false
	},
	{
		name: 'Humo',
		artist: 'DACEWAV',
		bpm: 90,
		key: 'Em',
		genre: 'Ambient',
		tags: ['ambient', 'dark', 'pad'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Ambient oscuro con texturas etéreas y reverbs largos.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 250, priceUSD: 15 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 550, priceUSD: 35 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1100, priceUSD: 65 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 3500, priceUSD: 210 }
		],
		active: true,
		featured: false,
		available: true,
		exclusive: false
	},
	{
		name: 'Calles',
		artist: 'DACEWAV',
		bpm: 150,
		key: 'Bm',
		genre: 'Hip-Hop',
		tags: ['boom-bap', 'classic', 'vinyl'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Hip-hop clásico con samples de vinilo y drums crudos.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 }
		],
		active: false,
		featured: false,
		available: true,
		exclusive: false
	},
	{
		name: 'Perreo Intenso',
		artist: 'DACEWAV',
		bpm: 92,
		key: 'Am',
		genre: 'Reggaeton',
		tags: ['reggaeton', 'perreo', 'dembow'],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: 'Reggaeton con dembow duro y melodies pegajosas.',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 400, priceUSD: 25 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 850, priceUSD: 50 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1700, priceUSD: 100 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 6000, priceUSD: 350 }
		],
		active: true,
		featured: true,
		available: true,
		exclusive: false
	}
];

/** Seed demo beats into Firebase. Returns count of created beats. */
export async function seedDemoBeats(): Promise<number> {
	let created = 0;
	for (const beat of DEMO_BEATS) {
		try {
			await createBeat(beat);
			created++;
		} catch (err) {
			console.error(`[Seed] Error creating "${beat.name}":`, err);
		}
	}
	return created;
}

export const SEED_COUNT = DEMO_BEATS.length;
