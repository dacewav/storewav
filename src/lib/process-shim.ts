// Shim for process.env used by Firebase SDK in browser
if (typeof globalThis.process === 'undefined') {
	(globalThis as Record<string, unknown>).process = { env: { NODE_ENV: 'production' }, version: '' };
}
export {};
