import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none');
	response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
	return response;
};
