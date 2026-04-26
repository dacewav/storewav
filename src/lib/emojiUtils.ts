/**
 * Emoji utilities — shortcode parsing + rendering
 *
 * Converts :emoji_name: → <img> tags in rendered content.
 * Used across store pages for beat descriptions, banners, etc.
 */

import type { CustomEmoji } from '$lib/stores/customEmojis';

/**
 * Replace :shortcode: with <img> tags in a string.
 * Only matches emojis that exist in the provided list.
 */
export function renderEmojis(text: string, emojis: CustomEmoji[]): string {
	if (!text || emojis.length === 0) return text;

	// Build lookup map (case-insensitive)
	const map = new Map(emojis.map(e => [e.name.toLowerCase(), e]));

	return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, name) => {
		const emoji = map.get(name.toLowerCase());
		if (!emoji) return match;
		return `<img class="inline-emoji" src="${escapeAttr(emoji.url)}" alt=":${emoji.name}:" title=":${emoji.name}:" loading="lazy" />`;
	});
}

/**
 * Strip emoji shortcodes from text (for meta tags, plain text contexts)
 */
export function stripEmojis(text: string): string {
	return text.replace(/:[a-zA-Z0-9_+-]+:/g, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Escape HTML attribute characters
 */
function escapeAttr(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Parse a cursor position to find an active :shortcode: being typed.
 * Returns the query string if found, or null.
 */
export function findEmojiQuery(text: string, cursorPos: number): { query: string; start: number; end: number } | null {
	// Look backwards from cursor for a ':'
	const before = text.slice(0, cursorPos);
	const lastColon = before.lastIndexOf(':');

	if (lastColon < 0) return null;

	// Check if this colon is the closing ':' of a complete :shortcode:
	// Find the colon BEFORE lastColon — if it exists and there's no ':' between them,
	// then lastColon is a closing colon, not an opening one
	const textBetween = before.slice(lastColon + 1);
	if (textBetween.includes(':')) {
		// There's another ':' between lastColon and cursor — we're outside any shortcode
		return null;
	}

	// Also check: if the char BEFORE lastColon is the opening ':', and the text between
	// them is a valid shortcode, then we're right after a closing ':'
	if (lastColon > 0) {
		const prevColon = before.lastIndexOf(':', lastColon - 1);
		if (prevColon >= 0) {
			const potentialShortcode = before.slice(prevColon + 1, lastColon);
			// If there's a valid shortcode between prevColon and lastColon, and no ':' in between
			if (/^[a-zA-Z0-9_+-]+$/.test(potentialShortcode) && !before.slice(prevColon + 1, lastColon).includes(':')) {
				return null; // Cursor is right after a complete :shortcode:
			}
		}
	}

	// Check chars between lastColon and cursor — only allow valid shortcode chars
	if (!/^[a-zA-Z0-9_+-]*$/.test(textBetween)) return null;
	if (textBetween.includes(' ')) return null;

	return {
		query: textBetween,
		start: lastColon,
		end: cursorPos
	};
}

/**
 * Insert an emoji shortcode at the cursor position, replacing the :query
 */
export function insertEmoji(text: string, cursorPos: number, emojiQuery: { start: number; end: number }, emojiName: string): { text: string; cursor: number } {
	const before = text.slice(0, emojiQuery.start);
	const after = text.slice(emojiQuery.end);
	// Add trailing space only if next char isn't already a space
	const needsSpace = after.length > 0 && after[0] !== ' ';
	const insertion = `:${emojiName}:${needsSpace ? ' ' : ''}`;
	return {
		text: before + insertion + after,
		cursor: before.length + insertion.length
	};
}
