import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'unsafe-none',
		},
	},
});
