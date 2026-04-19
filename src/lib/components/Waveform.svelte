<script lang="ts">
	/**
	 * Waveform — SVG waveform visualization
	 *
	 * Modes:
	 *  - "static": pre-generated bars (default, no audio needed)
	 *  - "live": real-time frequency data from audio via Web Audio API
	 */

	import { player } from '$lib/stores';
	import { browser } from '$app/environment';

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

	let playerState = $derived($player);
	let progress = $derived(playerState.duration > 0 ? playerState.currentTime / playerState.duration : 0);

	// ── Static mode ──
	// Pseudo-random bar heights (deterministic per bars count)
	const staticHeights: number[] = $derived(
		Array.from({ length: bars }, (_, i) => {
			const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
			return 0.2 + (x - Math.floor(x)) * 0.8;
		})
	);

	// ── Live mode ──
	let liveHeights: number[] = $state([]);

	// Init/reset liveHeights when bars count changes
	$effect(() => {
		liveHeights = Array(bars).fill(0.05);
	});
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let rafId: number | null = null;
	let currentAudioUrl: string | null = null;

	function setupLiveAnalysis() {
		if (!browser || mode !== 'live') return;

		const audio = getAudioElement();
		if (!audio || audio.src === currentAudioUrl) return;
		currentAudioUrl = audio.src;

		// Clean previous
		teardownLive();

		try {
			audioCtx = new AudioContext();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = bars * 4;
			analyser.smoothingTimeConstant = 0.75;

			sourceNode = audioCtx.createMediaElementSource(audio);
			sourceNode.connect(analyser);
			analyser.connect(audioCtx.destination);

			tickLive();
		} catch {
			// CORS or other error — fallback to static
			teardownLive();
		}
	}

	function tickLive() {
		// Read current state directly from store (not from captured $derived)
		let isPlaying = false;
		player.subscribe((s) => { isPlaying = s.playing; })();

		if (!analyser || !isPlaying) {
			// Decay when paused
			liveHeights = liveHeights.map((h: number) => Math.max(0.05, h * 0.9));
			if (isPlaying) rafId = requestAnimationFrame(tickLive);
			return;
		}

		const data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);

		// Sample evenly across frequency data into bars buckets
		const step = Math.floor(data.length / bars);
		liveHeights = Array.from({ length: bars }, (_, i) => {
			let sum = 0;
			for (let j = 0; j < step; j++) {
				sum += data[i * step + j];
			}
			return 0.05 + (sum / step / 255) * 0.95;
		});

		rafId = requestAnimationFrame(tickLive);
	}

	function teardownLive() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		if (sourceNode) {
			sourceNode.disconnect();
			sourceNode = null;
		}
		if (analyser) {
			analyser.disconnect();
			analyser = null;
		}
		if (audioCtx) {
			audioCtx.close();
			audioCtx = null;
		}
		currentAudioUrl = null;
	}

	/** Get the internal Audio element from the player store */
	function getAudioElement(): HTMLAudioElement | null {
		if (!browser) return null;
		try {
			return player.getAudioElement();
		} catch {
			return null;
		}
	}

	// React to playing state changes
	$effect(() => {
		if (mode !== 'live' || !browser) return;

		if (playerState.playing && playerState.audioUrl) {
			setupLiveAnalysis();
		}

		return () => {
			teardownLive();
		};
	});

	let barHeights: number[] = $derived(mode === 'live' ? liveHeights : staticHeights);
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
		{@const isActive = mode === 'live' ? h > 0.1 : (i / bars) <= progress}
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
