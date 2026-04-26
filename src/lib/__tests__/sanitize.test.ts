import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeCSS } from '../sanitize';

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

describe('sanitizeCSS', () => {
	it('returns empty string for empty input', () => {
		expect(sanitizeCSS('')).toBe('');
	});

	it('allows normal CSS', () => {
		const css = 'body { color: red; background: #000; }';
		expect(sanitizeCSS(css)).toBe(css);
	});

	it('allows flexbox and grid', () => {
		const css = '.container { display: flex; gap: 10px; }';
		expect(sanitizeCSS(css)).toBe(css);
	});

	it('blocks javascript: in url()', () => {
		const css = 'body { background: url(javascript:alert(1)) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('javascript:');
	});

	it('blocks data: in url()', () => {
		const css = 'body { background: url(data:text/html,<script>alert(1)</script>) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('data:');
	});

	it('blocks vbscript: in url()', () => {
		const css = 'body { background: url(vbscript:msgbox) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('vbscript:');
	});

	it('blocks expression()', () => {
		const css = 'body { width: expression(alert(1)) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('expression(');
	});

	it('blocks -moz-binding', () => {
		const css = 'body { -moz-binding: url(evil.xml#xss) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('-moz-binding:');
	});

	it('blocks behavior:', () => {
		const css = 'body { behavior: url(evil.htc) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('behavior:');
	});

	it('blocks @import with external URL', () => {
		const css = '@import url("https://evil.com/style.css")';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('https://evil.com');
	});

	it('strips HTML tags from CSS', () => {
		const css = 'body { color: red; }<script>alert(1)</script>';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('<script>');
		expect(result).toContain('color: red');
	});

	it('handles url() with quotes', () => {
		const css = 'body { background: url("javascript:alert(1)") }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('javascript:');
	});

	it('handles mixed case javascript:', () => {
		const css = 'body { background: url(JaVaScRiPt:alert(1)) }';
		const result = sanitizeCSS(css);
		expect(result).not.toContain('javascript:');
		expect(result).not.toContain('JaVaScRiPt');
	});
});
