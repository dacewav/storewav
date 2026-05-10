/**
 * Tests for Download Token TTL verification
 *
 * Verifies that download tokens expire after 7 days
 * and that valid tokens are accepted.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let mockFetchResponses: Record<string, unknown> = {};

function mockFetch(url: string) {
	// Match downloadTokens pattern
	const tokenMatch = url.match(/downloadTokens\/([^/.]+)\.json/);
	if (tokenMatch) {
		const key = tokenMatch[1];
		const data = mockFetchResponses[key];
		return Promise.resolve({
			ok: !!data,
			json: () => Promise.resolve(data ?? null),
		});
	}
	return Promise.resolve({
		ok: false,
		json: () => Promise.resolve(null),
	});
}

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

async function verifyToken(orderId: string, beatId: string, token: string): Promise<boolean> {
	try {
		const resp = await fetch(`https://db.firebaseio.com/downloadTokens/${orderId}_${beatId}.json`);
		if (!resp.ok) return false;

		const data = await resp.json() as { token?: string; createdAt?: number } | null;
		if (!data || data.token !== token) return false;

		if (data.createdAt && Date.now() - data.createdAt > TOKEN_TTL) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

describe('Download Token TTL', () => {
	beforeEach(() => {
		mockFetchResponses = {};
		vi.stubGlobal('fetch', mockFetch);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('accepts valid token within 7-day window', async () => {
		vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));

		mockFetchResponses['order1_beat1'] = {
			token: 'valid-uuid-token',
			createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
		};

		const result = await verifyToken('order1', 'beat1', 'valid-uuid-token');
		expect(result).toBe(true);
	});

	it('rejects token older than 7 days', async () => {
		vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));

		mockFetchResponses['order1_beat1'] = {
			token: 'old-uuid-token',
			createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
		};

		const result = await verifyToken('order1', 'beat1', 'old-uuid-token');
		expect(result).toBe(false);
	});

	it('accepts token at exactly 7-day boundary (within)', async () => {
		vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));

		mockFetchResponses['order1_beat1'] = {
			token: 'boundary-token',
			createdAt: Date.now() - TOKEN_TTL + 1000, // Just under 7 days
		};

		const result = await verifyToken('order1', 'beat1', 'boundary-token');
		expect(result).toBe(true);
	});

	it('rejects token at exactly 7-day boundary (over)', async () => {
		vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));

		mockFetchResponses['order1_beat1'] = {
			token: 'boundary-token',
			createdAt: Date.now() - TOKEN_TTL - 1000, // Just over 7 days
		};

		const result = await verifyToken('order1', 'beat1', 'boundary-token');
		expect(result).toBe(false);
	});

	it('rejects wrong token', async () => {
		mockFetchResponses['order1_beat1'] = {
			token: 'correct-token',
			createdAt: Date.now(),
		};

		const result = await verifyToken('order1', 'beat1', 'wrong-token');
		expect(result).toBe(false);
	});

	it('rejects missing token entry', async () => {
		// No entry in mock
		const result = await verifyToken('order1', 'nonexistent', 'any-token');
		expect(result).toBe(false);
	});

	it('accepts token without createdAt (legacy tokens)', async () => {
		// Legacy tokens might not have createdAt — should still work
		mockFetchResponses['order1_beat1'] = {
			token: 'legacy-token',
			// no createdAt
		};

		const result = await verifyToken('order1', 'beat1', 'legacy-token');
		expect(result).toBe(true);
	});
});
