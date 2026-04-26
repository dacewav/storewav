<script lang="ts">
	/**
	 * Waveform — SVG waveform visualization
	 *
	 * Modes:
	 *  - "static": pre-generated bars (default, no audio needed)
	 *  - "live": real-time frequency data from audio via Web Audio API
	 *
	 * Visual: gradient active bars, glow at playback position, breathing when playing
	 */

	import { player } from '$lib/stores';
	import { browser } from '$app/environment';

	let {
		height = 40,
		bars = 60,
		color = 'var(--accent)',
		bgColor = 'var(--surface2)',
		rounded = true,
		mode = 'static',
		compact = false
	}: {
		height?: number;
		bars?: number;
		color?: string;
		bgColor?: string;
		rounded?: boolean;
		mode?: 'static' | 'live';
		compact?: boolean; // for mini player — thinner bars
	} = $props();

	let playerState = $derived($player);
	let isPlaying = $derived(playerState.playing);
	let progress = $derived(playerState.duration > 0 ? playerState.currentTime / playerState.duration : 0);

	// Bar dimensions — compact mode for mini player
	let barW = $derived(compact ? 2 : 2.5);
	let gap = $derived(compact ? 1 : 1.5);
	let barRadius = $derived(rounded ? barW / 2 : 0);
	let step = $derived(barW + gap);

	// ── Static mode ──
	// Organic heights using overlapping sine waves (more natural than pure hash)
	const staticHeights: number[] = $derived(
		Array.from({ length: bars }, (_, i) => {
			const t = i / bars;
			// Layered sine waves for organic shape — like a real waveform envelope
			const base = 0.3 + 0.2 * Math.sin(t * Math.PI * 2.3 + 0.5);
			const mid = 0.15 * Math.sin(t * Math.PI * 5.1 + 1.2);
			const high = 0.1 * Math.sin(t * Math.PI * 11.7 + 2.8);
			const detail = 0.08 * Math.sin(t * Math.PI * 23.3 + 0.3);
			return Math.max(0.12, Math.min(1, base + mid + high + detail));
		})
	);

	// ── Live mode ──
	let liveHeights: number[] = $state([]);

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
			teardownLive();
		}
	}

	function tickLive() {
		let isPlayingNow = false;
		player.subscribe((s) => { isPlayingNow = s.playing; })();

		if (!analyser || !isPlayingNow) {
			liveHeights = liveHeights.map((h: number) => Math.max(0.05, h * 0.92));
			if (isPlayingNow) rafId = requestAnimationFrame(tickLive);
			return;
		}

		const data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(data);

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

	function getAudioElement(): HTMLAudioElement | null {
		if (!browser) return null;
		try {
			return player.getAudioElement();
		} catch {
			return null;
		}
	}

	$effect(() => {
		if (mode !== 'live' || !browser) return;
		if (playerState.playing && playerState.audioUrl) {
			setupLiveAnalysis();
		}
		return () => { teardownLive(); };
	});

	let barHeights: number[] = $derived(mode === 'live' ? liveHeights : staticHeights);
	let svgWidth = $derived(bars * step);
	let progressX = $derived(progress * svgWidth);
</script>

<svg
	class="waveform"
	class:playing={isPlaying}
	class:compact
	width="100%"
	height={height}
	viewBox="0 0 {svgWidth} {height}"
	preserveAspectRatio="none"
	role="img"
	aria-label="Forma de onda"
>
	<defs>
		<!-- Gradient for active bars: accent → lighter -->
		<linearGradient id="wf-grad" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color={color} stop-opacity="1" />
			<stop offset="100%" stop-color={color} stop-opacity="0.5" />
		</linearGradient>
		<!-- Glow filter for playback position -->
		<filter id="wf-glow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	{#each barHeights as h, i}
		{@const barH = h * height * 0.85}
		{@const x = i * step}
		{@const isActive = mode === 'live' ? h > 0.1 : (i / bars) <= progress}
		{@const isAtCursor = Math.abs(x - progressX) < step * 1.5 && isPlaying}
		<rect
			{x}
			y={(height - barH) / 2}
			width={barW}
			height={barH}
			rx={barRadius}
			fill={isActive ? 'url(#wf-grad)' : bgColor}
			opacity={isActive ? (isAtCursor ? 1 : 0.9) : 0.4}
			filter={isAtCursor ? 'url(#wf-glow)' : undefined}
			class:wf-bar-active={isActive}
			class:wf-bar-cursor={isAtCursor}
		/>
	{/each}
</svg>

<style>
	.waveform {
		display: block;
		overflow: visible;
	}

	.waveform.playing .wf-bar-active {
		animation: wfBreathe 2.5s ease-in-out infinite;
	}

	.waveform.compact.playing .wf-bar-active {
		animation-duration: 1.8s;
	}

	.wf-bar-cursor {
		animation: wfPulse 0.8s ease-in-out infinite alternate !important;
	}

	@keyframes wfBreathe {
		0%, 100% { opacity: 0.85; }
		50% { opacity: 1; }
	}

	@keyframes wfPulse {
		0% { opacity: 0.8; }
		100% { opacity: 1; }
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.waveform.playing .wf-bar-active,
		.wf-bar-cursor {
			animation: none !important;
		}
	}
</style>
