/**
 * Sanitize utilities — XSS prevention
 */

/**
 * Escape </script> in JSON-LD values to prevent script injection.
 * Replaces </script with <\/script in string values.
 */
export function escapeJsonLd(str: string): string {
	if (!str) return '';
	return str.replace(/<\/script/gi, '<\\/script');
}

/**
 * Sanitize HTML — allow only whitelisted inline formatting tags.
 * Blocks all other tags to prevent XSS.
 * Strips all attributes (including event handlers) from allowed tags.
 */
export function sanitizeHtml(raw: string): string {
	if (!raw) return '';
	return raw.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
		const allowed = ['em', 'strong', 'b', 'i', 'span'];
		if (!allowed.includes(tag.toLowerCase())) return '';
		// Strip all attributes — only keep the tag name
		const isClosing = match.startsWith('</');
		const isSelfClosing = match.endsWith('/>');
		if (isClosing) return `</${tag}>`;
		if (isSelfClosing) return `<${tag}/>`;
		return `<${tag}>`;
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

	// Block javascript:, data:, vbscript: in url()
	css = css.replace(/url\s*\(\s*['"]?\s*(?:javascript|data|vbscript):/gi, 'url(blocked:');

	// Block CSS expression() (IE)
	css = css.replace(/expression\s*\(/gi, 'blocked(');

	// Block -moz-binding (Firefox XSS vector)
	css = css.replace(/-moz-binding\s*:/gi, '/* blocked:');

	// Block behavior: (IE XSS vector)
	css = css.replace(/behavior\s*:/gi, '/* blocked:');

	// Block content: property (can inject text/html via data: URIs)
	css = css.replace(/content\s*:\s*url\s*\(/gi, '/* blocked content-url */');

	// Block @import with external URLs (only allow relative or same-origin)
	css = css.replace(/@import\s+url\s*\(\s*['"]?\s*https?:\/\//gi, '/* blocked import */');

	// Block @namespace (can redefine XML namespaces)
	css = css.replace(/@namespace\s+/gi, '/* blocked namespace */');

	return css;
}
