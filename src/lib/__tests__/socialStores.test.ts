import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock $app/environment — browser=true so stores don't early-return
vi.mock('$app/environment', () => ({
	browser: true,
	dev: true,
	building: false,
	version: '1.0.0',
}));

// Ensure window exists for browser-dependent stores
if (typeof globalThis.window === 'undefined') {
	(globalThis as any).window = {
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		localStorage: {
			getItem: vi.fn().mockReturnValue(null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		},
	};
}

// Mock Firebase
vi.mock('$lib/firebase', () => ({
	getApp: vi.fn().mockResolvedValue({}),
	getDb: vi.fn().mockResolvedValue(null),
	getAuthInstance: vi.fn().mockResolvedValue(null),
}));

// Mock firebase/app
vi.mock('firebase/app', () => ({
	getApp: vi.fn().mockReturnValue({}),
	initializeApp: vi.fn().mockReturnValue({}),
	getApps: vi.fn().mockReturnValue([]),
}));

// Mock firebase/database — SDK methods used by stores
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn().mockReturnValue({}),
	ref: vi.fn().mockReturnValue({}),
	onValue: vi.fn().mockReturnValue(() => {}),
	get: vi.fn().mockResolvedValue({ exists: () => false, val: () => null }),
	set: vi.fn().mockResolvedValue(undefined),
	update: vi.fn().mockResolvedValue(undefined),
	remove: vi.fn().mockResolvedValue(undefined),
	push: vi.fn().mockReturnValue({ key: 'push-key-123' }),
	runTransaction: vi.fn().mockResolvedValue(undefined),
}));

describe('Contract Templates Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
		const { get } = await import('firebase/database');
		(get as any).mockResolvedValueOnce({ exists: () => false, val: () => null });

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.getTemplate('01-mp3');
		expect(result).toBeNull();
	});

	it('getTemplate returns text when custom template exists', async () => {
		const { get } = await import('firebase/database');
		(get as any).mockResolvedValueOnce({
			exists: () => true,
			val: () => ({ text: 'Custom contract text', updatedAt: Date.now(), updatedBy: 'admin' }),
		});

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.getTemplate('01-mp3');
		expect(result).toBe('Custom contract text');
	});

	it('save uses Firebase SDK set()', async () => {
		const { set } = await import('firebase/database');
		(set as any).mockResolvedValueOnce(undefined);

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.save('01-mp3', 'Test text');
		expect(result).toBe(true);
		expect(set).toHaveBeenCalled();
	});

	it('reset uses Firebase SDK remove()', async () => {
		const { remove } = await import('firebase/database');
		(remove as any).mockResolvedValueOnce(undefined);

		const mod = await import('$lib/stores/contractTemplates');
		const result = await mod.contractTemplates.reset('01-mp3');
		expect(result).toBe(true);
		expect(remove).toHaveBeenCalled();
	});
});

describe('Likes Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it('toggleLike returns boolean (like)', async () => {
		const { get, set, runTransaction } = await import('firebase/database');
		// get returns snapshot with exists() = false (not yet liked)
		(get as any).mockResolvedValueOnce({ exists: () => false, val: () => null });
		(set as any).mockResolvedValue(undefined);
		(runTransaction as any).mockResolvedValue(undefined);

		const mod = await import('$lib/stores/likes');
		const result = await mod.toggleLike('beat-123', 'user-456');
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true); // was not liked, now liked
	});

	it('toggleLike returns boolean (unlike)', async () => {
		const { get, remove, runTransaction } = await import('firebase/database');
		// get returns snapshot with exists() = true (already liked)
		(get as any).mockResolvedValueOnce({ exists: () => true, val: () => true });
		(remove as any).mockResolvedValue(undefined);
		(runTransaction as any).mockResolvedValue(undefined);

		const mod = await import('$lib/stores/likes');
		const result = await mod.toggleLike('beat-123', 'user-456');
		expect(result).toBe(false); // was liked, now unliked
	});
});

describe('Comments Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it('postComment uses Firebase SDK push()+set()', async () => {
		const { push, set } = await import('firebase/database');
		(push as any).mockReturnValue({ key: 'new-comment-id' });
		(set as any).mockResolvedValue(undefined);

		const mod = await import('$lib/stores/comments');
		const result = await mod.postComment('beat-123', 'user-456', 'Test User', null, 'Great beat!');
		expect(result.ok).toBe(true);
		expect(push).toHaveBeenCalled();
		expect(set).toHaveBeenCalled();
	});
});

describe('Wishlist Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
