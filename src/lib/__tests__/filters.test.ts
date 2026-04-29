import { describe, it, expect } from 'vitest';
import { lowestPrice } from '../stores/beats';

// Test the filtering logic that lives in the store page (extracted for testing)

function filterBeats(
	beats: Array<{
		id: string;
		name: string;
		genre?: string;
		key?: string;
		bpm: number;
		tags?: string[];
		licenses?: { priceMXN: number }[];
		featured?: boolean;
	}>,
	filters: {
		search?: string;
		genre?: string;
		key?: string;
		sort?: string;
		tags?: string[];
		priceMin?: number;
		priceMax?: number;
	}
) {
	let list = [...beats];

	// Exclude featured
	list = list.filter(b => !b.featured);

	if (filters.genre) {
		list = list.filter(b => b.genre === filters.genre);
	}

	if (filters.search?.trim()) {
		const q = filters.search.trim().toLowerCase();
		list = list.filter(b =>
			b.name?.toLowerCase().includes(q) ||
			b.genre?.toLowerCase().includes(q)
		);
	}

	if (filters.key) {
		list = list.filter(b => b.key === filters.key);
	}

	if (filters.tags && filters.tags.length > 0) {
		list = list.filter(b => filters.tags!.some(t => b.tags?.includes(t)));
	}

	// Price range
	if (filters.priceMin && filters.priceMin > 0) {
		list = list.filter(b => lowestPrice(b) >= filters.priceMin!);
	}
	if (filters.priceMax && filters.priceMax > 0) {
		list = list.filter(b => lowestPrice(b) <= filters.priceMax!);
	}

	return list;
}

const mockBeats = [
	{ id: '1', name: 'Cheap Beat', genre: 'Trap', key: 'Am', bpm: 140, tags: ['dark'], licenses: [{ priceMXN: 200 }] },
	{ id: '2', name: 'Mid Beat', genre: 'Drill', key: 'Cm', bpm: 150, tags: ['hard'], licenses: [{ priceMXN: 500 }] },
	{ id: '3', name: 'Premium Beat', genre: 'Trap', key: 'Gm', bpm: 130, tags: ['dark', 'hard'], licenses: [{ priceMXN: 1500 }] },
	{ id: '4', name: 'Featured Beat', genre: 'Trap', key: 'Am', bpm: 140, tags: [], licenses: [{ priceMXN: 300 }], featured: true },
	{ id: '5', name: 'Free Beat', genre: 'Boom Bap', key: 'Dm', bpm: 90, tags: [], licenses: [{ priceMXN: 0 }] },
];

describe('Filter logic', () => {
	it('excludes featured beats', () => {
		const result = filterBeats(mockBeats, {});
		expect(result.find(b => b.featured)).toBeUndefined();
		expect(result.length).toBe(4);
	});

	it('filters by genre', () => {
		const result = filterBeats(mockBeats, { genre: 'Trap' });
		expect(result.length).toBe(2); // Cheap Beat + (featured excluded, but Premium Beat is also Trap)
		expect(result.map(b => b.name)).toContain('Cheap Beat');
		expect(result.map(b => b.name)).toContain('Premium Beat');
	});

	it('filters by search', () => {
		const result = filterBeats(mockBeats, { search: 'premium' });
		expect(result.length).toBe(1);
		expect(result[0].name).toBe('Premium Beat');
	});

	it('filters by key', () => {
		const result = filterBeats(mockBeats, { key: 'Am' });
		expect(result.length).toBe(1); // Cheap Beat (featured excluded)
	});

	it('filters by tags', () => {
		const result = filterBeats(mockBeats, { tags: ['dark'] });
		expect(result.length).toBe(2); // Cheap Beat + Premium Beat
	});

	it('filters by priceMin', () => {
		const result = filterBeats(mockBeats, { priceMin: 300 });
		expect(result.length).toBe(2); // Mid Beat (500) + Premium Beat (1500)
	});

	it('filters by priceMax', () => {
		const result = filterBeats(mockBeats, { priceMax: 500 });
		expect(result.length).toBe(3); // Cheap (200), Mid (500), Free (0)
	});

	it('filters by price range (min + max)', () => {
		const result = filterBeats(mockBeats, { priceMin: 100, priceMax: 600 });
		expect(result.length).toBe(2); // Cheap (200) + Mid (500)
	});

	it('combines genre + price filter', () => {
		const result = filterBeats(mockBeats, { genre: 'Trap', priceMin: 100 });
		expect(result.length).toBe(2); // Cheap Beat (200, Trap) + Premium Beat (1500, Trap)
	});

	it('returns all non-featured when no filters', () => {
		const result = filterBeats(mockBeats, {});
		expect(result.length).toBe(4);
	});

	it('handles empty beats array', () => {
		const result = filterBeats([], { genre: 'Trap', priceMin: 100 });
		expect(result.length).toBe(0);
	});
});

describe('lowestPrice', () => {
	it('returns lowest price from licenses', () => {
		expect(lowestPrice({ licenses: [{ priceMXN: 500 }, { priceMXN: 200 }, { priceMXN: 1000 }] })).toBe(200);
	});

	it('returns 0 for no licenses', () => {
		expect(lowestPrice({})).toBe(0);
		expect(lowestPrice({ licenses: [] })).toBe(0);
	});

	it('returns single license price', () => {
		expect(lowestPrice({ licenses: [{ priceMXN: 750 }] })).toBe(750);
	});
});
