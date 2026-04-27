/**
 * Recommendations engine — score-based beat suggestions.
 *
 * Considers: genre, BPM proximity, key compatibility, popularity (likes),
 * and user listening history (plays via analytics).
 */

import type { BeatWithId } from './beats';

/** Key compatibility map (Camelot wheel neighbors) */
const KEY_COMPATIBILITY: Record<string, string[]> = {
	'Ab': ['Ab', 'Eb', 'Db', 'B'],
	'Eb': ['Eb', 'Bb', 'Ab', 'F'],
	'Bb': ['Bb', 'F', 'Eb', 'C'],
	'F':  ['F', 'C', 'Bb', 'G'],
	'C':  ['C', 'G', 'F', 'Am'],
	'G':  ['G', 'D', 'C', 'Em'],
	'D':  ['D', 'A', 'G', 'Bm'],
	'A':  ['A', 'E', 'D', 'F#m'],
	'E':  ['E', 'B', 'A', 'C#m'],
	'B':  ['B', 'F#', 'E', 'G#m'],
	'F#': ['F#', 'C#', 'B', 'D#m'],
	'C#': ['C#', 'G#', 'F#', 'A#m'],
	'Am':  ['Am', 'Em', 'Dm', 'C'],
	'Em':  ['Em', 'Bm', 'Am', 'G'],
	'Bm':  ['Bm', 'F#m', 'Em', 'D'],
	'F#m': ['F#m', 'C#m', 'Bm', 'A'],
	'C#m': ['C#m', 'G#m', 'F#m', 'E'],
	'G#m': ['G#m', 'D#m', 'C#m', 'B'],
	'D#m': ['D#m', 'A#m', 'G#m', 'F#'],
	'A#m': ['A#m', 'F', 'D#m', 'C#'],
	'Dm':  ['Dm', 'Am', 'Gm', 'F'],
	'Gm':  ['Gm', 'Dm', 'Cm', 'Bb'],
	'Cm':  ['Cm', 'Gm', 'Fm', 'Eb'],
	'Fm':  ['Fm', 'Cm', 'Bbm', 'Ab'],
};

/** Normalize key string (remove "min"/"maj" suffix, trim) */
function normalizeKey(key: string): string {
	return key.replace(/\s*(min|maj|minor|major)\s*/gi, '').trim();
}

/** Check if two keys are compatible */
function keysCompatible(key1: string, key2: string): boolean {
	const k1 = normalizeKey(key1);
	const k2 = normalizeKey(key2);
	if (k1 === k2) return true;
	const compat = KEY_COMPATIBILITY[k1];
	return compat ? compat.includes(k2) : false;
}

/** BPM proximity score (0-1, 1 = same BPM) */
function bpmScore(bpm1: number, bpm2: number): number {
	const diff = Math.abs(bpm1 - bpm2);
	if (diff === 0) return 1;
	if (diff <= 5) return 0.9;
	if (diff <= 10) return 0.7;
	if (diff <= 20) return 0.4;
	if (diff <= 40) return 0.1;
	return 0;
}

export type RecommendationScore = {
	beat: BeatWithId;
	score: number;
	reasons: string[];
};

/**
 * Score a candidate beat against a reference beat.
 * Returns 0-1 score + human-readable reasons.
 */
export function scoreBeat(
	candidate: BeatWithId,
	reference: BeatWithId,
	candidateLikes: number = 0
): RecommendationScore {
	let score = 0;
	const reasons: string[] = [];

	// 1. Genre match (weight: 0.35)
	if (candidate.genre === reference.genre) {
		score += 0.35;
		reasons.push(`Mismo género (${candidate.genre})`);
	}

	// 2. BPM proximity (weight: 0.25)
	const bpmS = bpmScore(candidate.bpm, reference.bpm);
	score += 0.25 * bpmS;
	if (bpmS > 0.5) {
		reasons.push(`BPM similar (${candidate.bpm} vs ${reference.bpm})`);
	}

	// 3. Key compatibility (weight: 0.2)
	if (keysCompatible(candidate.key, reference.key)) {
		score += 0.2;
		reasons.push(`Tonalidad compatible (${candidate.key})`);
	}

	// 4. Popularity boost (weight: 0.2)
	const likeBoost = Math.min(candidateLikes / 50, 1); // Cap at 50 likes
	score += 0.2 * likeBoost;
	if (candidateLikes > 0) {
		reasons.push(`🔥 ${candidateLikes} likes`);
	}

	return { beat: candidate, score, reasons };
}

/**
 * Get recommended beats for a reference beat.
 * Returns sorted by score descending, excludes the reference itself.
 */
export function getRecommendations(
	reference: BeatWithId,
	allBeats: BeatWithId[],
	likeCounts: Record<string, number>,
	excludeIds: string[] = [],
	limit: number = 4
): RecommendationScore[] {
	const candidates = allBeats.filter(
		b => b.id !== reference.id && !excludeIds.includes(b.id)
	);

	const scored = candidates
		.map(b => scoreBeat(b, reference, likeCounts[b.id] ?? 0))
		.filter(s => s.score > 0.1) // Minimum threshold
		.sort((a, b) => b.score - a.score);

	return scored.slice(0, limit);
}

/**
 * Get "For You" recommendations based on user's liked beats.
 * Averages the profiles of liked beats, then scores all beats against that profile.
 */
export function getForYouRecommendations(
	likedBeatIds: string[],
	allBeats: BeatWithId[],
	likeCounts: Record<string, number>,
	limit: number = 8
): RecommendationScore[] {
	if (likedBeatIds.length === 0 || allBeats.length === 0) return [];

	// Build average profile from liked beats
	const likedBeats = allBeats.filter(b => likedBeatIds.includes(b.id));
	if (likedBeats.length === 0) return [];

	// Find most common genre
	const genreCounts: Record<string, number> = {};
	likedBeats.forEach(b => {
		genreCounts[b.genre] = (genreCounts[b.genre] ?? 0) + 1;
	});
	const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0][0];

	// Average BPM
	const avgBpm = likedBeats.reduce((sum, b) => sum + b.bpm, 0) / likedBeats.length;

	// Create synthetic reference beat for scoring
	const syntheticRef: BeatWithId = {
		...likedBeats[0],
		genre: topGenre,
		bpm: Math.round(avgBpm),
		key: likedBeats[0].key,
	};

	// Score all beats (excluding already liked)
	const candidates = allBeats.filter(b => !likedBeatIds.includes(b.id));
	const scored = candidates
		.map(b => scoreBeat(b, syntheticRef, likeCounts[b.id] ?? 0))
		.sort((a, b) => b.score - a.score);

	return scored.slice(0, limit);
}
