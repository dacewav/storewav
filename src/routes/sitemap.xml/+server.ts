import type { RequestHandler } from './$types';
import { FIREBASE_DB } from '$lib/firebaseDb';
import { STORE_URL } from '$lib/config';

/**
 * GET /sitemap.xml
 * Dynamic sitemap generated from Firebase beats + static pages.
 * Cached for 1 hour.
 */

interface Beat {
	name?: string;
	genre?: string;
	updatedAt?: number;
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function getBeatSlug(beat: { name?: string; id: string }): string {
	const name = beat.name || 'beat';
	return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const GET: RequestHandler = async () => {
	const urls: string[] = [];

	// Static pages
	urls.push(`${STORE_URL}/`);
	urls.push(`${STORE_URL}/cart`);
	urls.push(`${STORE_URL}/account`);

	// Fetch beats from Firebase
	try {
		const resp = await fetch(`${FIREBASE_DB}/beats.json`);
		if (resp.ok) {
			const beats = await resp.json() as Record<string, Beat> | null;
			if (beats) {
				for (const [id, beat] of Object.entries(beats)) {
					const slug = getBeatSlug({ name: beat.name, id });
					const lastmod = beat.updatedAt
						? new Date(beat.updatedAt).toISOString().split('T')[0]
						: undefined;
					urls.push(`${STORE_URL}/beat/${slug}${lastmod ? `|${lastmod}` : ''}`);
				}
			}
		}
	} catch (err) {
		console.warn('[Sitemap] Failed to fetch beats:', err);
	}

	// Fetch genres
	try {
		const resp = await fetch(`${FIREBASE_DB}/genres.json`);
		if (resp.ok) {
			const genres = await resp.json() as Record<string, { name?: string }> | null;
			if (genres) {
				for (const [, genre] of Object.entries(genres)) {
					const slug = (genre.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
					if (slug) urls.push(`${STORE_URL}/genre/${slug}`);
				}
			}
		}
	} catch (err) {
		console.warn('[Sitemap] Failed to fetch genres:', err);
	}

	// Build XML
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => {
		const [loc, lastmod] = u.split('|');
		let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>`;
		if (lastmod) entry += `\n    <lastmod>${lastmod}</lastmod>`;
		entry += `\n    <changefreq>daily</changefreq>`;
		entry += `\n    <priority>${loc === `${STORE_URL}/` ? '1.0' : '0.8'}</priority>`;
		entry += `\n  </url>`;
		return entry;
	}).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
