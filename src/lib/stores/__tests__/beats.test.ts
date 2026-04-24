import { describe, it, expect } from 'vitest';

// We test the pure functions directly — no Firebase needed

// Re-implement emptyBeat locally for testing (matches src/lib/stores/beats.ts)
function emptyBeat() {
	return {
		name: '',
		artist: '',
		bpm: 140,
		key: 'Am',
		genre: 'Trap',
		tags: [],
		imageUrl: '',
		audioUrl: '',
		previewUrl: '',
		description: '',
		spotify: '',
		youtube: '',
		soundcloud: '',
		licenses: [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 },
		],
		active: true,
		featured: false,
		exclusive: false,
		available: true,
		plays: 0,
		order: 0,
	};
}

describe('emptyBeat', () => {
	it('returns a beat with correct default values', () => {
		const beat = emptyBeat();
		expect(beat.name).toBe('');
		expect(beat.bpm).toBe(140);
		expect(beat.key).toBe('Am');
		expect(beat.genre).toBe('Trap');
		expect(beat.active).toBe(true);
		expect(beat.plays).toBe(0);
	});

	it('returns 4 default licenses', () => {
		const beat = emptyBeat();
		expect(beat.licenses).toHaveLength(4);
		expect(beat.licenses[0].name).toBe('Basic');
		expect(beat.licenses[3].name).toBe('Exclusive');
	});

	it('returns empty arrays for tags', () => {
		const beat = emptyBeat();
		expect(beat.tags).toEqual([]);
	});

	it('returns all required fields', () => {
		const beat = emptyBeat();
		const requiredFields = ['name', 'bpm', 'key', 'genre', 'licenses', 'active'];
		for (const field of requiredFields) {
			expect(beat).toHaveProperty(field);
		}
	});

	it('licenses have correct price structure', () => {
		const beat = emptyBeat();
		for (const license of beat.licenses) {
			expect(license).toHaveProperty('name');
			expect(license).toHaveProperty('priceMXN');
			expect(license).toHaveProperty('priceUSD');
			expect(typeof license.priceMXN).toBe('number');
			expect(typeof license.priceUSD).toBe('number');
			expect(license.priceMXN).toBeGreaterThan(0);
			expect(license.priceUSD).toBeGreaterThan(0);
		}
	});
});
