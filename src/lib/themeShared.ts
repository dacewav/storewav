/**
 * Shared utilities for theme admin pages.
 * Import in both theme/+page.svelte and effects/+page.svelte
 */

/** Update a settings field via the settings store */
export function update(settings: { updateField: (path: string, value: unknown) => void }, path: string, value: unknown) {
	settings.updateField(path, value);
}

/** Format slider value for display */
export function fmt(local: Record<string, number>, key: string, max: number, unit = '', pct = false): string {
	const n = local[key] ?? 0;
	const clamped = Math.min(n, max);
	if (pct) return `${Math.round(clamped * 100)}%`;
	if (unit === 's') return `${clamped}s`;
	if (unit) return `${clamped}${unit}`;
	return String(Math.round(clamped * 100) / 100);
}

/** Shift+Arrow for 10x step on sliders */
export function handleShiftArrows(e: KeyboardEvent) {
	if (!e.shiftKey) return;
	if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
	e.preventDefault();
	const input = e.currentTarget as HTMLInputElement;
	const min = parseFloat(input.min);
	const max = parseFloat(input.max);
	const step = parseFloat(input.step) || 1;
	const dir = (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -1 : 1;
	const newVal = Math.max(min, Math.min(max, parseFloat(input.value) + dir * step * 10));
	const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
	if (nativeSetter) nativeSetter.call(input, String(newVal));
	else input.value = String(newVal);
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Convert hex color to "r, g, b" string */
export function hexToRgb(hex: string): string {
	const h = hex.replace('#', '');
	if (h.length !== 6) return '220, 38, 38';
	const r = parseInt(h.substring(0, 2), 16);
	const g = parseInt(h.substring(2, 4), 16);
	const b = parseInt(h.substring(4, 6), 16);
	return `${r}, ${g}, ${b}`;
}

export const BLEND_MODES = ['normal', 'screen', 'overlay', 'multiply', 'soft-light', 'hard-light', 'color-dodge'];
export const GLOW_ANIMS = ['none', 'pulse', 'breathe', 'spin'];
export const PARTICLE_TYPES = ['circle', 'square', 'line', 'text', 'image'];
