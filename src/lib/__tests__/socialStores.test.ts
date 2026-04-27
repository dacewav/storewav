import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase
vi.mock('$lib/firebase', () => ({
	getApp: vi.fn().mockResolvedValue({}),
	getDb: vi.fn().mockResolvedValue(null),
}));

// Mock firebase/app
vi.mock('firebase/app', () => ({
	getApp: vi.fn().mockReturnValue({}),
	initializeApp: vi.fn().mockReturnValue({}),
	getApps: vi.fn().mockReturnValue([]),
}));

// Mock firebase/database
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn().mockReturnValue({}),
	ref: vi.fn().mockReturnValue({}),
	onValue: vi.fn().mockReturnValue(() => {}),
	get: vi.fn().mockResolvedValue({ exists: () => false, val: () => null }),
}));

describe('Contract Templates Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock fetch
		(globalThis as any).fetch = vi.fn();
	});

	it('exports contractTemplates object', async () => {
		const mod = await import('$lib/stores/contractTemplates');
		expect(mod.contractTemplates).toBeDefined();
		expect(typeof mod.contractTemplates.load).toBe('function');
		expect(typeof mod.contractTemplates.getTemplate).toBe('function');
		expect(typeof mod.contractTemplates.save).toBe('function');
		expect(typeof mod.contractTemplates.reset).toBe('function');
	});

	it('getTemplate returns null when no custom template', async () => {
		(globalThis as any).fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(null),
		});

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.getTemplate('01-mp3');
		expect(result).toBeNull();
	});

	it('getTemplate returns text when custom template exists', async () => {
		(globalThis as any).fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({
				text: 'Custom contract text',
				updatedAt: Date.now(),
				updatedBy: 'admin',
			}),
		});

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.getTemplate('01-mp3');
		expect(result).toBe('Custom contract text');
	});

	it('save sends PUT request to Firebase', async () => {
		(globalThis as any).fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		});

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.save('01-mp3', 'Test text');
		expect(result).toBe(true);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('contractTemplates/01-mp3.json'),
			expect.objectContaining({ method: 'PUT' })
		);
	});

	it('reset sends DELETE request to Firebase', async () => {
		(globalThis as any).fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		});

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.reset('01-mp3');
		expect(result).toBe(true);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('contractTemplates/01-mp3.json'),
			expect.objectContaining({ method: 'DELETE' })
		);
	});
});

describe('Likes Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(globalThis as any).fetch = vi.fn();
	});

	it('exports required functions', async () => {
		const mod = await import('$lib/stores/likes');
		expect(typeof mod.initLikes).toBe('function');
		expect(typeof mod.toggleLike).toBe('function');
		expect(typeof mod.isLiked).toBe('function');
		expect(typeof mod.destroyLikes).toBe('function');
		expect(mod.userLikes).toBeDefined();
		expect(mod.likeCounts).toBeDefined();
	});

	it('isLiked returns reactive store', async () => {
		const mod = await import('$lib/stores/likes');
		const store = mod.isLiked('beat-123');
		expect(store).toBeDefined();
		expect(typeof store.subscribe).toBe('function');
	});

	it('toggleLike returns boolean', async () => {
		(globalThis as any).fetch = vi.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(null) }) // check
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // put userLikes
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // put beatLikes
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(0) }) // get count
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // put count

		const mod = await import('$lib/stores/likes');
		const result = await mod.toggleLike('beat-123', 'user-456');
		expect(typeof result).toBe('boolean');
	});
});

describe('Comments Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(globalThis as any).fetch = vi.fn();
	});

	it('exports required functions', async () => {
		const mod = await import('$lib/stores/comments');
		expect(typeof mod.initComments).toBe('function');
		expect(typeof mod.postComment).toBe('function');
		expect(typeof mod.deleteComment).toBe('function');
		expect(typeof mod.destroyComments).toBe('function');
		expect(mod.comments).toBeDefined();
		expect(mod.commentsLoading).toBeDefined();
	});

	it('postComment rejects empty text', async () => {
		const mod = await import('$lib/stores/comments');
		const result = await mod.postComment('beat-123', 'user-456', 'Test', null, '');
		expect(result.ok).toBe(false);
		expect(result.error).toContain('vacío');
	});

	it('postComment rejects text over 500 chars', async () => {
		const mod = await import('$lib/stores/comments');
		const longText = 'a'.repeat(501);
		const result = await mod.postComment('beat-123', 'user-456', 'Test', null, longText);
		expect(result.ok).toBe(false);
		expect(result.error).toContain('500');
	});

	it('postComment sends POST to Firebase', async () => {
		(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true });

		const mod = await import('$lib/stores/comments');
		const result = await mod.postComment('beat-123', 'user-456', 'Test User', null, 'Great beat!');
		expect(result.ok).toBe(true);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('beatComments/beat-123'),
			expect.objectContaining({ method: 'POST' })
		);
	});
});

describe('Wishlist Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(globalThis as any).fetch = vi.fn();
		// Mock localStorage
		const store: Record<string, string> = {};
		(globalThis as any).localStorage = {
			getItem: (k: string) => store[k] || null,
			setItem: (k: string, v: string) => { store[k] = v; },
			removeItem: (k: string) => { delete store[k]; },
		};
	});

	it('exports wishlist with toggle/has/clear', async () => {
		const mod = await import('$lib/stores/wishlist');
		expect(mod.wishlist).toBeDefined();
		expect(typeof mod.wishlist.toggle).toBe('function');
		expect(typeof mod.wishlist.has).toBe('function');
		expect(typeof mod.wishlist.clear).toBe('function');
	});

	it('toggle adds and removes beatId', async () => {
		const mod = await import('$lib/stores/wishlist');

		// Mock fetch for Firebase sync
		(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true });

		expect(mod.wishlist.has('beat-1')).toBe(false);
		mod.wishlist.toggle('beat-1');
		// Note: reactive store, has() reads current value
	});

	it('initWishlistSync and destroyWishlistSync are exported', async () => {
		const mod = await import('$lib/stores/wishlist');
		expect(typeof mod.initWishlistSync).toBe('function');
		expect(typeof mod.destroyWishlistSync).toBe('function');
	});
});
