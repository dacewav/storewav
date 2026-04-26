import { describe, it, expect } from 'vitest';
import { renderEmojis, stripEmojis, findEmojiQuery, insertEmoji } from '../emojiUtils';
import type { CustomEmoji } from '$lib/stores/customEmojis';

const mockEmojis: CustomEmoji[] = [
	{ id: '1', name: 'fire', url: 'https://cdn.example.com/fire.png', createdAt: 0 },
	{ id: '2', name: 'star', url: 'https://cdn.example.com/star.png', createdAt: 0 },
	{ id: '3', name: 'cool-beans', url: 'https://cdn.example.com/cool.png', createdAt: 0 },
];

describe('renderEmojis', () => {
	it('replaces :shortcode: with <img> tags', () => {
		const result = renderEmojis('This is :fire: awesome', mockEmojis);
		expect(result).toContain('<img class="inline-emoji"');
		expect(result).toContain('src="https://cdn.example.com/fire.png"');
		expect(result).toContain('alt=":fire:"');
	});

	it('does not replace unknown shortcodes', () => {
		const result = renderEmojis('Hello :unknown: world', mockEmojis);
		expect(result).toBe('Hello :unknown: world');
	});

	it('handles multiple emojis in one string', () => {
		const result = renderEmojis(':fire: and :star:', mockEmojis);
		expect(result).toContain('fire.png');
		expect(result).toContain('star.png');
	});

	it('returns original text when no emojis list', () => {
		expect(renderEmojis('Hello :fire:', [])).toBe('Hello :fire:');
	});

	it('returns original text when empty', () => {
		expect(renderEmojis('', mockEmojis)).toBe('');
	});

	it('is case-insensitive', () => {
		const result = renderEmojis(':FIRE:', mockEmojis);
		expect(result).toContain('fire.png');
	});

	it('handles hyphenated shortcodes', () => {
		const result = renderEmojis(':cool-beans:', mockEmojis);
		expect(result).toContain('cool.png');
	});
});

describe('stripEmojis', () => {
	it('removes emoji shortcodes', () => {
		expect(stripEmojis('Hello :fire: world')).toBe('Hello world');
	});

	it('removes multiple shortcodes', () => {
		expect(stripEmojis(':fire: :star: text')).toBe('text');
	});

	it('cleans up extra spaces', () => {
		expect(stripEmojis(':fire:  :star:')).toBe('');
	});
});

describe('findEmojiQuery', () => {
	it('finds query after single colon', () => {
		const result = findEmojiQuery('Hello :fi', 9);
		expect(result).toEqual({ query: 'fi', start: 6, end: 9 });
	});

	it('returns null when no colon', () => {
		expect(findEmojiQuery('Hello world', 5)).toBeNull();
	});

	it('returns null for complete shortcode', () => {
		const result = findEmojiQuery('Hello :fire: ', 12);
		expect(result).toBeNull();
	});

	it('returns null when space in query', () => {
		const result = findEmojiQuery('Hello :fi re', 12);
		expect(result).toBeNull();
	});

	it('handles empty query (just colon)', () => {
		const result = findEmojiQuery('Hello :', 7);
		expect(result).toEqual({ query: '', start: 6, end: 7 });
	});
});

describe('insertEmoji', () => {
	it('replaces query with full shortcode', () => {
		const query = { start: 6, end: 9 };
		const result = insertEmoji('Hello :fi world', 9, query, 'fire');
		expect(result.text).toBe('Hello :fire: world');
		expect(result.cursor).toBe(12);
	});

	it('handles insert at end of string', () => {
		const query = { start: 6, end: 7 };
		const result = insertEmoji('Hello :', 7, query, 'star');
		expect(result.text).toBe('Hello :star:');
		expect(result.cursor).toBe(12);
	});
});
