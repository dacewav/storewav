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
