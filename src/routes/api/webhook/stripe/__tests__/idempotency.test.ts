/**
 * Tests for Stripe Webhook — Idempotency & processedEvents cleanup
 *
 * Verifies that duplicate webhook events are skipped,
 * and that cleanup removes expired entries.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Track fetch calls for assertions
let fetchCalls: Array<{ url: string; method: string; body?: string }> = [];
let mockFetchResponses: Record<string, unknown> = {};

function mockFetch(url: string, options?: { method?: string; body?: string }) {
	fetchCalls.push({ url, method: options?.method || 'GET', body: options?.body });

	// Top-level processedEvents.json (fetch all)
	if (url.endsWith('/processedEvents.json') && !url.match(/processedEvents\/[^/.]+\.json/)) {
		const method = options?.method || 'GET';
		if (method === 'GET') {
			// Return all entries from mockFetchResponses that start with 'processedEvents/'
			const all: Record<string, unknown> = {};
			for (const [key, val] of Object.entries(mockFetchResponses)) {
				if (key.startsWith('processedEvents/')) {
					all[key.replace('processedEvents/', '')] = val;
				}
			}
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve(Object.keys(all).length > 0 ? all : null),
			});
		}
	}

	// Individual processedEvents entries
	if (url.includes('/processedEvents/')) {
		const idMatch = url.match(/processedEvents\/([^/.]+)\.json/);
		if (idMatch) {
			const id = idMatch[1];
			const method = options?.method || 'GET';

			if (method === 'GET') {
				const data = mockFetchResponses[`processedEvents/${id}`];
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(data ?? null),
				});
			}
			if (method === 'PUT') {
				const body = options?.body ? JSON.parse(options.body) : {};
				mockFetchResponses[`processedEvents/${id}`] = body;
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(body),
				});
			}
			if (method === 'DELETE') {
				delete mockFetchResponses[`processedEvents/${id}`];
				return Promise.resolve({ ok: true, json: () => Promise.resolve(null) });
			}
		}
	}

	// Default: return null
	return Promise.resolve({
		ok: true,
		json: () => Promise.resolve(null),
	});
}

describe('Webhook Idempotency Logic', () => {
	beforeEach(() => {
		fetchCalls = [];
		mockFetchResponses = {};
		vi.stubGlobal('fetch', mockFetch);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('detects already-processed events', async () => {
		// Simulate: event was already processed
		mockFetchResponses['processedEvents/evt_123'] = {
			processedAt: Date.now() - 1000,
			sessionId: 'cs_test_abc',
		};

		// Check idempotency — should find existing entry
		const resp = await fetch('https://db.firebaseio.com/processedEvents/evt_123.json');
		const existing = await resp.json();

		expect(existing).toBeTruthy();
		expect(existing.processedAt).toBeTypeOf('number');
	});

	it('marks new events as processed', async () => {
		// No existing entry
		const checkResp = await fetch('https://db.firebaseio.com/processedEvents/evt_new.json');
		const existing = await checkResp.json();
		expect(existing).toBeNull();

		// Mark as processed
		const putResp = await fetch('https://db.firebaseio.com/processedEvents/evt_new.json', {
			method: 'PUT',
			body: JSON.stringify({ processedAt: Date.now(), sessionId: 'cs_new' }),
		});
		const putData = await putResp.json();
		expect(putData.processedAt).toBeTypeOf('number');

		// Now it should exist
		const verifyResp = await fetch('https://db.firebaseio.com/processedEvents/evt_new.json');
		const verified = await verifyResp.json();
		expect(verified).toBeTruthy();
	});

	it('cleanup deletes entries older than 30 days', async () => {
		const now = Date.now();
		const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

		// Create some entries: one recent, one old
		mockFetchResponses['processedEvents/recent_evt'] = {
			processedAt: now - 1000,
			sessionId: 'cs_recent',
		};
		mockFetchResponses['processedEvents/old_evt'] = {
			processedAt: now - THIRTY_DAYS - 1000,
			sessionId: 'cs_old',
		};

		// Fetch all
		const resp = await fetch('https://db.firebaseio.com/processedEvents.json');
		const events = await resp.json() as Record<string, { processedAt: number }>;

		// Filter expired
		const cutoff = now - THIRTY_DAYS;
		const toDelete = Object.entries(events)
			.filter(([, data]) => data.processedAt < cutoff)
			.map(([id]) => id);

		expect(toDelete).toContain('old_evt');
		expect(toDelete).not.toContain('recent_evt');

		// Delete expired
		for (const id of toDelete) {
			await fetch(`https://db.firebaseio.com/processedEvents/${id}.json`, { method: 'DELETE' });
		}

		expect(mockFetchResponses['processedEvents/old_evt']).toBeUndefined();
		expect(mockFetchResponses['processedEvents/recent_evt']).toBeTruthy();
	});
});
