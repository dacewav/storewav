/**
 * Shared CSS custom property values — read once, reactive everywhere.
 * Avoids per-component getComputedStyle calls.
 */
import { readable } from 'svelte/store';
import { browser } from '$app/environment';

/** --accent-rgb from CSS vars (e.g. "220, 38, 38") */
export const accentRgb = readable('220, 38, 38', (set) => {
	if (!browser) return;
	const val = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
	if (val) set(val);

	// Watch for theme changes via MutationObserver on <html> style attribute
	const observer = new MutationObserver(() => {
		const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
		if (v) set(v);
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
	return () => observer.disconnect();
});

/** --accent from CSS vars (e.g. "#dc2626") */
export const accentColor = readable('#dc2626', (set) => {
	if (!browser) return;
	const val = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
	if (val) set(val);

	const observer = new MutationObserver(() => {
		const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
		if (v) set(v);
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
	return () => observer.disconnect();
});
