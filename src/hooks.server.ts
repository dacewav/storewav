import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// COOP/COEP — disabled for Google Auth popup compatibility
	response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
	response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	// Content Security Policy — allows Firebase, Google Auth, Stripe, Resend, R2 CDN
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://js.stripe.com https://static.cloudflareinsights.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
		"img-src 'self' data: blob: https://cdn.dacewav.store https://*.firebasestorage.app https://*.googleusercontent.com https://*.r2.dev",
		"font-src 'self' https://fonts.gstatic.com",
		"connect-src 'self' https://dacewav-store-3b0f5-default-rtdb.firebaseio.com https://*.firebaseio.com https://*.firebaseapp.com https://*.googleapis.com https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.google.com https://api.stripe.com https://api.resend.com https://cdn.dacewav.store wss://*.firebaseio.com",
		"frame-src 'self' https://accounts.google.com https://js.stripe.com https://*.firebaseapp.com",
		"media-src 'self' blob: https://cdn.dacewav.store https://*.firebasestorage.app https://*.r2.dev",
		"worker-src 'self' blob:",
	].join('; ');
	response.headers.set('Content-Security-Policy', csp);

	return response;
};
