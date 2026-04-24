import { describe, it, expect } from 'vitest';
import { migrateOldData } from '../settings';

describe('migrateOldData', () => {
	it('merges flat heroTitle into hero.title', () => {
		const result = migrateOldData({ heroTitle: 'My Title' });
		expect(result.hero.title).toBe('My Title');
	});

	it('merges flat heroSubtitle into hero.subtitle', () => {
		const result = migrateOldData({ heroSubtitle: 'My Sub' });
		expect(result.hero.subtitle).toBe('My Sub');
	});

	it('prefers heroTitle over siteName for hero.title', () => {
		const result = migrateOldData({ siteName: 'SITE', heroTitle: 'HERO' });
		expect(result.hero.title).toBe('HERO');
	});

	it('uses tagline as subtitle fallback', () => {
		const result = migrateOldData({ tagline: 'My Tagline' });
		expect(result.hero.subtitle).toBe('My Tagline');
	});

	it('preserves nested hero if it exists', () => {
		const result = migrateOldData({
			hero: { title: 'Existing', subtitle: 'Sub', eyebrow: 'Eye', glowWord: 'test' },
		});
		expect(result.hero.title).toBe('Existing');
		expect(result.hero.subtitle).toBe('Sub');
		expect(result.hero.glowWord).toBe('test');
	});

	it('sets default glowWord to "rompen." if not provided', () => {
		const result = migrateOldData({});
		expect(result.hero.glowWord).toBe('rompen.');
	});

	it('creates heroVisual from theme flat keys', () => {
		const result = migrateOldData({
			_theme: { heroGlowOn: true, heroGlowInt: 2, heroGlowBlur: 30 },
		});
		expect(result.heroVisual.glowOn).toBe(true);
		expect(result.heroVisual.glowInt).toBe(2);
		expect(result.heroVisual.glowBlur).toBe(30);
	});

	it('creates empty arrays for testimonials if not present', () => {
		const result = migrateOldData({});
		expect(result.testimonials).toEqual([]);
	});

	it('preserves existing testimonials', () => {
		const testimonials = [{ name: 'John', text: 'Great', stars: 5 }];
		const result = migrateOldData({ testimonials });
		expect(result.testimonials).toEqual(testimonials);
	});

	it('creates brand settings with defaults', () => {
		const result = migrateOldData({});
		expect(result.brand).toBeDefined();
		expect(result.brand.name).toBeDefined();
	});

	it('migrates flat banner keys', () => {
		const result = migrateOldData({
			bannerActive: true,
			bannerText: 'Sale!',
		});
		expect(result.banner.enabled).toBe(true);
		expect(result.banner.text).toBe('Sale!');
		expect(result.banner.animation).toBeDefined();
	});

	it('creates layout settings with defaults', () => {
		const result = migrateOldData({});
		expect(result.layout).toBeDefined();
		expect(result.layout.cardsPerRow).toBe(3);
		expect(result.layout.showWishlist).toBe(true);
	});

	it('migrates globalCardStyle to cardStyle', () => {
		const result = migrateOldData({
			globalCardStyle: {
				glow: { enabled: true, type: 'active', color: '#ff0000', intensity: 1 },
			},
		});
		expect(result.cardStyle).toBeDefined();
		expect(result.cardStyle.glow).toBe('active');
	});

	it('handles completely empty input', () => {
		const result = migrateOldData({});
		expect(result.hero).toBeDefined();
		expect(result.heroVisual).toBeDefined();
		expect(result.brand).toBeDefined();
		expect(result.layout).toBeDefined();
		expect(result.testimonials).toBeDefined();
		expect(result.banner).toBeDefined();
		expect(result.cardStyle).toBeDefined();
	});
});
