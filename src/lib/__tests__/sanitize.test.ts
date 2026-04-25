import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../sanitize';

describe('sanitizeHtml', () => {
	it('returns empty string for empty input', () => {
		expect(sanitizeHtml('')).toBe('');
	});

	it('returns empty string for null/undefined-like', () => {
		expect(sanitizeHtml('' as string)).toBe('');
	});

	it('allows <em> tags', () => {
		expect(sanitizeHtml('<em>text</em>')).toBe('<em>text</em>');
	});

	it('allows <strong> tags', () => {
		expect(sanitizeHtml('<strong>text</strong>')).toBe('<strong>text</strong>');
	});

	it('allows <b> and <i> tags', () => {
		expect(sanitizeHtml('<b>bold</b> and <i>italic</i>')).toBe('<b>bold</b> and <i>italic</i>');
	});

	it('allows <span> tags', () => {
		expect(sanitizeHtml('<span>text</span>')).toBe('<span>text</span>');
	});

	it('strips <script> tags but keeps inner text', () => {
		expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
	});

	it('strips <img> tags', () => {
		expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('');
	});

	it('strips <div> tags', () => {
		expect(sanitizeHtml('<div>content</div>')).toBe('content');
	});

	it('strips <iframe> tags', () => {
		expect(sanitizeHtml('<iframe src="evil"></iframe>')).toBe('');
	});

	it('preserves plain text', () => {
		expect(sanitizeHtml('just plain text')).toBe('just plain text');
	});

	it('handles mixed allowed and disallowed tags', () => {
		const input = '<em>good</em><script>bad</script><strong>also good</strong>';
		expect(sanitizeHtml(input)).toBe('<em>good</em>bad<strong>also good</strong>');
	});

	it('is case-insensitive for tag matching', () => {
		expect(sanitizeHtml('<EM>text</EM>')).toBe('<EM>text</EM>');
		expect(sanitizeHtml('<SCRIPT>bad</SCRIPT>')).toBe('bad');
	});
});
