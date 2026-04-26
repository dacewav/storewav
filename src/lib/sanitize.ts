/**
 * Sanitize utilities — XSS prevention
 */

/**
 * Sanitize HTML — allow only whitelisted inline formatting tags.
 * Blocks all other tags to prevent XSS.
 */
export function sanitizeHtml(raw: string): string {
	if (!raw) return '';
	return raw.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
		const allowed = ['em', 'strong', 'b', 'i', 'span'];
		return allowed.includes(tag.toLowerCase()) ? match : '';
	});
}

/**
 * Sanitize custom CSS — strip dangerous patterns.
 * Allows most CSS but blocks:
 *   - <script> tags (shouldn't be in style, but just in case)
 *   - url() with data: or javascript: schemes
 *   - expression() (IE)
 *   - -moz-binding (Firefox XSS)
 *   - behavior (IE XSS)
 *   - @import with external URLs
 */
export function sanitizeCSS(raw: string): string {
	if (!raw) return '';

	let css = raw;

	// Remove any HTML tags that might have been injected
	css = css.replace(/<[^>]*>/g, '');

	// Block javascript: and data: in url()
	css = css.replace(/url\s*\(\s*['"]?\s*(?:javascript|data|vbscript):/gi, 'url(blocked:');

	// Block CSS expression() (IE)
	css = css.replace(/expression\s*\(/gi, 'blocked(');

	// Block -moz-binding (Firefox XSS vector)
	css = css.replace(/-moz-binding\s*:/gi, '/* blocked:');

	// Block behavior: (IE XSS vector)
	css = css.replace(/behavior\s*:/gi, '/* blocked:');

	// Block @import with external URLs (only allow relative or same-origin)
	css = css.replace(/@import\s+url\s*\(\s*['"]?\s*https?:\/\//gi, '/* blocked import */');

	return css;
}
