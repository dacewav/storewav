import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase modules before importing store
vi.mock('$lib/firebase', () => ({
	getAuthInstance: vi.fn().mockResolvedValue({
		currentUser: { getIdToken: vi.fn().mockResolvedValue('mock-token') },
	}),
}));

vi.mock('$lib/firebaseDb', () => ({
	FIREBASE_DB: 'https://test.firebaseio.com',
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import {
	emptyKit,
	type Kit,
	type KitSample,
	type KitsMap,
} from '../kits';

describe('Kits Store — Types & Helpers', () => {
	describe('emptyKit()', () => {
		it('returns a valid empty kit template', () => {
			const kit = emptyKit();
			expect(kit.name).toBe('');
			expect(kit.genre).toBe('Trap');
			expect(kit.imageUrl).toBe('');
			expect(kit.samples).toEqual([]);
			expect(kit.priceMXN).toBe(350);
			expect(kit.priceUSD).toBe(20);
			expect(kit.active).toBe(true);
		});

		it('has all required fields for Firebase validation', () => {
			const kit = emptyKit();
			// Firebase rules require: name, genre, priceMXN, priceUSD
			expect(kit).toHaveProperty('name');
			expect(kit).toHaveProperty('genre');
			expect(kit).toHaveProperty('priceMXN');
			expect(kit).toHaveProperty('priceUSD');
			expect(kit).toHaveProperty('active');
			expect(kit).toHaveProperty('samples');
			expect(kit).toHaveProperty('imageUrl');
		});
	});

	describe('Kit type', () => {
		it('KitSample has name and url', () => {
			const sample: KitSample = { name: 'Kick', url: 'https://cdn.test/kick.wav' };
			expect(sample.name).toBe('Kick');
			expect(sample.url).toBe('https://cdn.test/kick.wav');
			expect(sample.duration).toBeUndefined();
		});

		it('KitSample can have optional duration', () => {
			const sample: KitSample = { name: 'Snare', url: 'https://cdn.test/snare.wav', duration: 2.5 };
			expect(sample.duration).toBe(2.5);
		});
	});
});

describe('Kits Store — Derived Stores Logic', () => {
	// Test the sorting/filtering logic that derived stores use

	function sortKits(data: KitsMap) {
		return Object.entries(data)
			.sort(([, a], [, b]) => {
				const ao = a.order ?? 0;
				const bo = b.order ?? 0;
				if (ao !== bo) return ao - bo;
				return a.name.localeCompare(b.name);
			})
			.map(([id, kit]) => ({ id, ...kit }));
	}

	function filterActiveKits(data: KitsMap) {
		return Object.entries(data)
			.filter(([, k]) => k.active)
			.sort(([, a], [, b]) => {
				const ao = a.order ?? 0;
				const bo = b.order ?? 0;
				if (ao !== bo) return ao - bo;
				return a.name.localeCompare(b.name);
			})
			.map(([id, kit]) => ({ id, ...kit }));
	}

	function extractGenres(kits: Kit[]) {
		const set = new Set<string>();
		for (const k of kits) {
			if (k.genre) set.add(k.genre);
		}
		return Array.from(set).sort();
	}

	function computeStats(kits: (Kit & { id: string })[]) {
		return {
			total: kits.length,
			totalSamples: kits.reduce((s, k) => s + (k.samples?.length || 0), 0),
		};
	}

	const mockKits: KitsMap = {
		'kit-a': { name: 'Trap Kit', genre: 'Trap', imageUrl: '', samples: [{ name: 'Kick', url: 'x' }, { name: 'Snare', url: 'y' }], priceMXN: 350, priceUSD: 20, active: true },
		'kit-b': { name: 'Drill Pack', genre: 'Drill', imageUrl: '', samples: [{ name: 'HiHat', url: 'z' }], priceMXN: 250, priceUSD: 15, active: true, order: 1 },
		'kit-c': { name: 'Hidden Kit', genre: 'Trap', imageUrl: '', samples: [], priceMXN: 100, priceUSD: 5, active: false },
		'kit-d': { name: 'Ambient Kit', genre: 'Ambient', imageUrl: '', samples: [{ name: 'Pad', url: 'p' }], priceMXN: 500, priceUSD: 30, active: true, order: 1 },
	};

	it('sortKits returns all kits sorted by order then name', () => {
		const sorted = sortKits(mockKits);
		expect(sorted).toHaveLength(4);
		// order=0/default kits come first (Hidden, Trap), then order=1 (Ambient, Drill)
		expect(sorted[0].name).toBe('Hidden Kit'); // order=0, H first
		expect(sorted[1].name).toBe('Trap Kit'); // order=0, T second
		expect(sorted[2].name).toBe('Ambient Kit'); // order=1, A first
		expect(sorted[3].name).toBe('Drill Pack'); // order=1, D second
	});

	it('filterActiveKits excludes inactive kits', () => {
		const active = filterActiveKits(mockKits);
		expect(active).toHaveLength(3);
		expect(active.find(k => k.id === 'kit-c')).toBeUndefined(); // Hidden Kit excluded
	});

	it('extractGenres returns unique sorted genres', () => {
		const allKits = sortKits(mockKits);
		const genres = extractGenres(allKits);
		expect(genres).toEqual(['Ambient', 'Drill', 'Trap']);
	});

	it('computeStats counts kits and samples', () => {
		const active = filterActiveKits(mockKits);
		const stats = computeStats(active);
		expect(stats.total).toBe(3);
		expect(stats.totalSamples).toBe(4); // 2 + 1 + 1
	});

	it('computeStats handles kits with no samples', () => {
		const stats = computeStats([{ id: 'x', name: 'Empty', genre: 'Trap', imageUrl: '', samples: [], priceMXN: 0, priceUSD: 0, active: true }]);
		expect(stats.totalSamples).toBe(0);
	});

	it('sortKits handles empty map', () => {
		expect(sortKits({})).toEqual([]);
	});

	it('filterActiveKits handles all-inactive', () => {
		const data: KitsMap = {
			'a': { name: 'A', genre: 'X', imageUrl: '', samples: [], priceMXN: 0, priceUSD: 0, active: false },
		};
		expect(filterActiveKits(data)).toEqual([]);
	});
});

describe('Kits Store — Firebase CRUD (mocked)', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it('createKitWithId sends PUT with correct body', async () => {
		const { createKitWithId } = await import('../kits');
		mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

		const kit: Omit<Kit, 'createdAt' | 'updatedAt'> = {
			name: 'Test Kit', genre: 'Trap', imageUrl: '', samples: [],
			priceMXN: 350, priceUSD: 20, active: true,
		};

		const result = await createKitWithId('test-id-123', kit);
		expect(result).toBe(true);
		expect(mockFetch).toHaveBeenCalledTimes(1);

		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toContain('/kits/test-id-123.json');
		expect(url).toContain('auth=mock-token');
		expect(options.method).toBe('PUT');

		const body = JSON.parse(options.body);
		expect(body.name).toBe('Test Kit');
		expect(body.createdAt).toBeDefined();
		expect(body.updatedAt).toBeDefined();
	});

	it('createKitWithId returns false on network error', async () => {
		const { createKitWithId } = await import('../kits');
		mockFetch.mockRejectedValueOnce(new Error('Network error'));

		const result = await createKitWithId('fail-id', emptyKit());
		expect(result).toBe(false);
	});

	it('updateKit sends PATCH with correct body', async () => {
		const { updateKit } = await import('../kits');
		mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

		const result = await updateKit('kit-123', { name: 'Updated Name' });
		expect(result).toBe(true);

		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toContain('/kits/kit-123.json');
		expect(options.method).toBe('PATCH');

		const body = JSON.parse(options.body);
		expect(body.name).toBe('Updated Name');
		expect(body.updatedAt).toBeDefined();
	});

	it('deleteKit sends DELETE', async () => {
		const { deleteKit } = await import('../kits');
		mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

		const result = await deleteKit('kit-to-delete');
		expect(result).toBe(true);

		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toContain('/kits/kit-to-delete.json');
		expect(options.method).toBe('DELETE');
	});
});
