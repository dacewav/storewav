/**
 * Shared visual utilities
 */

/** Genre-based gradient for placeholder covers */
export function genreGradient(genre: string): string {
	const g = (genre || '').toLowerCase();
	if (g.includes('trap')) return 'linear-gradient(135deg, #1a1a2e, #e94560)';
	if (g.includes('lo-fi') || g.includes('lofi')) return 'linear-gradient(135deg, #2d1b69, #11998e)';
	if (g.includes('drill')) return 'linear-gradient(135deg, #0f0c29, #302b63)';
	if (g.includes('reggaeton')) return 'linear-gradient(135deg, #f12711, #f5af19)';
	return 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.4), rgba(var(--accent-rgb), 0.1))';
}

/** Hex color to rgba string */
export function hexToRgba(hex: string, alpha: number, fallback = '#dc2626'): string {
	if (!hex) hex = fallback;
	const h = hex.replace('#', '');
	const r = parseInt(h.substring(0, 2), 16) || 0;
	const g = parseInt(h.substring(2, 4), 16) || 0;
	const b = parseInt(h.substring(4, 6), 16) || 0;
	return `rgba(${r},${g},${b},${alpha})`;
}
