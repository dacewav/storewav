/**
 * Centralized app configuration.
 * Single source of truth for domain, Firebase project, and CDN URLs.
 *
 * For client-side env vars (PUBLIC_*), import from '$env/static/public'.
 * For server-only secrets, use platform.env or process.env.
 */

/** Primary store domain */
export const STORE_DOMAIN = 'dacewav.store';

/** Canonical store URL (no trailing slash) */
export const STORE_URL = `https://${STORE_DOMAIN}`;

/** Cloudflare Pages preview domain */
export const PREVIEW_DOMAIN = 'dacewav-store.pages.dev';

/** R2 CDN domain for public assets */
export const CDN_DOMAIN = 'cdn.dacewav.store';
export const CDN_URL = `https://${CDN_DOMAIN}`;

/** Firebase project ID */
export const FIREBASE_PROJECT_ID = 'dacewav-store-3b0f5';

/** Firebase Realtime Database URL */
export const FIREBASE_DB_URL = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

/** Allowed origins for CSRF protection (server-side) */
export const ALLOWED_ORIGINS = [
	STORE_URL,
	`https://${PREVIEW_DOMAIN}`,
	'http://localhost:5173',
	'http://localhost:4173',
];

/** Email sender address */
export const EMAIL_FROM = `ventas@${STORE_DOMAIN}`;
