/**
 * Slug utilities for SEO-friendly beat URLs.
 * /beat/noche-oscura instead of /beat/-Nz...
 */

/** Generate a URL-friendly slug from a beat name */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove accents
		.replace(/[^a-z0-9\s-]/g, '') // Remove special chars
		.replace(/\s+/g, '-') // Spaces to hyphens
		.replace(/-+/g, '-') // Collapse multiple hyphens
		.replace(/^-|-$/g, '') // Trim leading/trailing hyphens
		.slice(0, 80); // Max length
}

/** Get the slug for a beat (uses name) */
export function getBeatSlug(beat: { name: string; id: string }): string {
	const slug = generateSlug(beat.name);
	return slug || beat.id; // Fallback to ID if slug is empty
}
