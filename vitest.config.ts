import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'$lib': path.resolve(__dirname, 'src/lib'),
			'$env/static/public': path.resolve(__dirname, 'src/lib/__tests__/mocks/env-public.ts'),
			'$app/environment': path.resolve(__dirname, 'src/lib/__tests__/mocks/app-environment.ts'),
		},
	},
	test: {
		include: ['src/**/__tests__/**/*.test.ts'],
		environment: 'node',
		globals: true,
	},
});
