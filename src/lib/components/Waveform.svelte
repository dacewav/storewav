<script lang="ts">
	/**
	 * Waveform — SVG waveform visualization
	 *
	 * Modes:
	 *  - "static": pre-generated bars (default, no audio needed)
	 *  - "live": real-time from audio element (needs audioUrl)
	 */

	import { player } from '$lib/stores';

	let {
		height = 40,
		bars = 60,
		color = 'var(--accent)',
		bgColor = 'var(--surface2)',
		rounded = true,
		mode = 'static'
	}: {
		height?: number;
		bars?: number;
		color?: string;
		bgColor?: string;
		rounded?: boolean;
		mode?: 'static' | 'live';
	} = $props();

	let state = $derived($player);
	let progress = $derived(state.duration > 0 ? state.currentTime / state.duration : 0);

	// Generate pseudo-random bar heights (deterministic per bars count)
	const barHeights = $derived(
		Array.from({ length: bars }, (_, i) => {
			// Simple seeded pseudo-random
			const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
			return 0.2 + (x - Math.floor(x)) * 0.8;
		})
	);

	let svgWidth = $derived(bars * 4); // 3px bar + 1px gap
</script>

<svg
	class="waveform"
	width="100%"
	height={height}
	viewBox="0 0 {svgWidth} {height}"
	preserveAspectRatio="none"
	role="img"
	aria-label="Forma de onda"
>
	{#each barHeights as h, i}
		{@const barH = h * height}
		{@const isActive = (i / bars) <= progress}
		<rect
			x={i * 4}
			y={(height - barH) / 2}
			width="3"
			height={barH}
			rx={rounded ? 1.5 : 0}
			fill={isActive ? color : bgColor}
			class:waveform-active={isActive}
		/>
	{/each}
</svg>

<style>
	.waveform {
		display: block;
		overflow: hidden;
	}

	.waveform-active {
		transition: fill 0.1s;
	}
</style>
