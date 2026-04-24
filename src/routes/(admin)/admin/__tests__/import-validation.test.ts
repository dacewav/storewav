import { describe, it, expect } from 'vitest';

// Test the validation logic used in admin import
const REQUIRED_BEAT_FIELDS = ['name', 'genre', 'bpm', 'key'] as const;

function validateBeat(beat: Record<string, unknown>): string[] {
	const missing: string[] = [];
	for (const field of REQUIRED_BEAT_FIELDS) {
		if (beat[field] === undefined || beat[field] === null || beat[field] === '') {
			missing.push(field);
		}
	}
	return missing;
}

describe('validateBeat', () => {
	it('accepts a valid beat', () => {
		const beat = { name: 'Test', genre: 'Trap', bpm: 140, key: 'Am' };
		expect(validateBeat(beat)).toEqual([]);
	});

	it('rejects beat without name', () => {
		const beat = { genre: 'Trap', bpm: 140, key: 'Am' };
		expect(validateBeat(beat)).toContain('name');
	});

	it('rejects beat with empty name', () => {
		const beat = { name: '', genre: 'Trap', bpm: 140, key: 'Am' };
		expect(validateBeat(beat)).toContain('name');
	});

	it('rejects beat without genre', () => {
		const beat = { name: 'Test', bpm: 140, key: 'Am' };
		expect(validateBeat(beat)).toContain('genre');
	});

	it('rejects beat without bpm', () => {
		const beat = { name: 'Test', genre: 'Trap', key: 'Am' };
		expect(validateBeat(beat)).toContain('bpm');
	});

	it('rejects beat without key', () => {
		const beat = { name: 'Test', genre: 'Trap', bpm: 140 };
		expect(validateBeat(beat)).toContain('key');
	});

	it('rejects beat with null fields', () => {
		const beat = { name: null, genre: 'Trap', bpm: 140, key: 'Am' };
		expect(validateBeat(beat)).toContain('name');
	});

	it('accepts beat with extra fields', () => {
		const beat = {
			name: 'Test',
			genre: 'Trap',
			bpm: 140,
			key: 'Am',
			tags: ['dark'],
			imageUrl: 'https://example.com/img.jpg',
		};
		expect(validateBeat(beat)).toEqual([]);
	});

	it('reports multiple missing fields', () => {
		const beat = {};
		const missing = validateBeat(beat);
		expect(missing).toHaveLength(4);
		expect(missing).toContain('name');
		expect(missing).toContain('genre');
		expect(missing).toContain('bpm');
		expect(missing).toContain('key');
	});

	it('accepts bpm as 0 (valid number)', () => {
		const beat = { name: 'Test', genre: 'Trap', bpm: 0, key: 'Am' };
		expect(validateBeat(beat)).toEqual([]);
	});
});
