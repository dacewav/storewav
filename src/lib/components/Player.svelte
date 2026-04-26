<script lang="ts">
	/**
	 * Player — Global audio player bar
	 *
	 * Features: mini waveform, skip ±10s, gradient progress, pulsing glow, track transitions
	 */
	import { player } from '$lib/stores';
	import Icon from './Icon.svelte';
	import Waveform from './Waveform.svelte';

	let ps = $derived($player);
	let progressVal = $derived(ps.duration > 0 ? ps.currentTime / ps.duration : 0);
	let showBar = $derived(ps.beatId !== null);
	let volumeVal = $derived(ps.muted ? 0 : ps.volume);

	let currentTime = $derived(formatTime(ps.currentTime));
	let totalTime = $derived(formatTime(ps.duration));

	// Track transition animation
	let trackKey = $state(0);
	let prevBeatId: string | null = $state(null);
	$effect(() => {
		if (ps.beatId && ps.beatId !== prevBeatId) {
			prevBeatId = ps.beatId;
			trackKey++;
		}
	});

	function formatTime(sec: number): string {
		if (!sec || !isFinite(sec)) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const pct = (e.clientX - rect.left) / rect.width;
		player.seek(pct * ps.duration);
	}

	function handleSeekKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') player.seek(ps.currentTime + 5);
		if (e.key === 'ArrowLeft') player.seek(ps.currentTime - 5);
	}
</script>

{#if showBar}
	<div class="player-bar" class:playing={ps.playing}>
		<!-- Gradient progress track -->
		<div class="progress-track" role="slider" aria-label="Progreso" aria-valuenow={Math.round(progressVal * 100)} aria-valuemin={0} aria-valuemax={100} tabindex="0"
			onclick={handleSeek}
			onkeydown={handleSeekKey}
		>
			<div class="progress-fill" style="width: {progressVal * 100}%"></div>
			<div class="progress-glow" style="left: {progressVal * 100}%"></div>
			<div class="progress-thumb" style="left: {progressVal * 100}%"></div>
		</div>

		<div class="player-inner">
			<!-- Cover + Info + Mini Waveform -->
			<div class="player-info">
				{#key trackKey}
					<div class="player-cover-wrap">
						{#if ps.imageUrl}
							<img class="player-cover" src={ps.imageUrl} alt="{ps.name} cover" decoding="async" />
						{:else}
							<div class="player-cover player-cover-placeholder">🎵</div>
						{/if}
					</div>
				{/key}
				<div class="player-text">
					{#key trackKey}
						<div class="player-title">{ps.name}</div>
					{/key}
					<div class="player-artist">{ps.artist}</div>
				</div>
				<!-- Mini waveform -->
				<div class="player-waveform">
					<Waveform bars={20} height={24} compact={true} />
				</div>
			</div>

			<!-- Controls -->
			<div class="player-controls">
				<span class="player-time">{currentTime}</span>

				<button class="ctrl-btn ctrl-skip" onclick={() => player.seek(Math.max(0, ps.currentTime - 10))} aria-label="Retroceder 10s" title="-10s">
					<Icon name="skipBack" size={14} />
				</button>

				<button class="ctrl-btn ctrl-play" onclick={() => ps.playing ? player.pause() : player.resume()} aria-label={ps.playing ? 'Pausar' : 'Reproducir'}>
					{#if ps.playing}
						<Icon name="pause" size={16} />
					{:else}
						<Icon name="play" size={16} />
					{/if}
				</button>

				<button class="ctrl-btn ctrl-skip" onclick={() => player.seek(Math.min(ps.duration, ps.currentTime + 10))} aria-label="Adelantar 10s" title="+10s">
					<Icon name="skipForward" size={14} />
				</button>

				<span class="player-time">{totalTime}</span>
			</div>

			<!-- Volume + Close -->
			<div class="player-right">
				<div class="volume-group">
					<button class="ctrl-btn" onclick={() => player.toggleMute()} aria-label={ps.muted ? 'Activar sonido' : 'Silenciar'}>
						{#if ps.muted || ps.volume === 0}
							<Icon name="volumeOff" size={14} />
						{:else}
							<Icon name="volumeOn" size={14} />
						{/if}
					</button>
					<input
						class="volume-slider"
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={volumeVal}
						aria-label="Volumen"
						oninput={(e) => player.setVolume(+e.currentTarget.value)}
					/>
				</div>

				<button class="ctrl-btn" onclick={() => player.stop()} aria-label="Cerrar">
					<Icon name="close" size={14} />
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.player-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-player);
		background: var(--surface);
		border-top: 1px solid var(--border);
		backdrop-filter: blur(20px);
		animation: slideUp 0.3s var(--ease-out);
	}

	.player-bar.playing {
		border-top-color: rgba(var(--accent-rgb), 0.25);
		box-shadow: 0 -4px 20px rgba(var(--accent-rgb), 0.06);
	}

	.player-bar.playing::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent 5%, var(--accent) 50%, transparent 95%);
		opacity: 0.4;
		animation: accentSweep 3s ease-in-out infinite;
	}

	@keyframes accentSweep {
		0%, 100% { opacity: 0.2; }
		50% { opacity: 0.5; }
	}

	/* ── Progress ── */
	.progress-track {
		position: relative;
		height: 4px;
		background: var(--surface2);
		cursor: pointer;
		transition: height var(--duration-fast);
	}

	.progress-track:hover {
		height: 6px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, white));
		border-radius: 2px;
		transition: width 0.1s linear;
	}

	.progress-glow {
		position: absolute;
		top: -4px;
		width: 8px;
		height: 12px;
		border-radius: 50%;
		background: var(--accent);
		filter: blur(6px);
		opacity: 0;
		transform: translateX(-50%);
		transition: opacity var(--duration-fast);
		pointer-events: none;
	}

	.progress-track:hover .progress-glow {
		opacity: 0.5;
	}

	.progress-thumb {
		position: absolute;
		top: 50%;
		width: 12px;
		height: 12px;
		background: var(--accent);
		border-radius: 50%;
		transform: translate(-50%, -50%) scale(0);
		transition: transform var(--duration-fast);
		box-shadow: var(--glow-sm);
	}

	.progress-track:hover .progress-thumb {
		transform: translate(-50%, -50%) scale(1);
	}

	/* ── Inner ── */
	.player-inner {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) var(--container-padding);
	}

	/* Info */
	.player-info {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
	}

	.player-cover-wrap {
		flex-shrink: 0;
		animation: trackIn 0.3s var(--ease-out);
	}

	@keyframes trackIn {
		from { opacity: 0; transform: translateX(-8px) scale(0.95); }
		to { opacity: 1; transform: translateX(0) scale(1); }
	}

	.player-cover {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		object-fit: cover;
		transition: transform var(--duration-normal) var(--ease-out);
	}

	.player-bar.playing .player-cover {
		animation: play-cover-pulse 3s ease-in-out infinite;
	}

	@keyframes play-cover-pulse {
		0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
		50% { transform: scale(1.04); box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.2); }
	}

	.player-cover-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface2);
		font-size: var(--text-base);
	}

	.player-text {
		min-width: 0;
		flex-shrink: 0;
		max-width: 160px;
	}

	.player-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		animation: trackTextIn 0.35s var(--ease-out);
	}

	@keyframes trackTextIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.player-artist {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.player-waveform {
		flex-shrink: 0;
		width: 60px;
		opacity: 0.6;
		transition: opacity var(--duration-fast);
	}

	.player-bar.playing .player-waveform {
		opacity: 1;
	}

	/* Controls */
	.player-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.ctrl-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.ctrl-btn:hover {
		color: var(--text);
		background: var(--surface-hover);
	}

	.ctrl-skip {
		min-width: 32px;
		min-height: 32px;
		opacity: 0.6;
	}

	.ctrl-skip:hover {
		opacity: 1;
	}

	.ctrl-play {
		width: 44px;
		height: 44px;
		background: var(--accent);
		color: var(--bg);
	}

	.ctrl-play:hover {
		background: var(--accent-dim);
		color: var(--bg);
		box-shadow: var(--glow-accent);
	}

	.player-bar.playing .ctrl-play {
		animation: playBtnPulse 2s ease-in-out infinite;
	}

	@keyframes playBtnPulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.3); }
		50% { box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.2); }
	}

	.player-time {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		min-width: 36px;
		text-align: center;
	}

	/* Right */
	.player-right {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.volume-group {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.volume-slider {
		width: 80px;
		height: 4px;
		accent-color: var(--accent);
		cursor: pointer;
		opacity: 0.7;
		transition: opacity var(--duration-fast);
	}

	.volume-slider:hover {
		opacity: 1;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.player-time {
			display: none;
		}

		.player-inner {
			padding: var(--space-2) var(--space-3);
			gap: var(--space-2);
		}

		.volume-slider {
			display: none;
		}

		.player-waveform {
			display: none;
		}

		.player-text {
			max-width: 120px;
		}

		.ctrl-skip {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.player-right {
			gap: 0;
		}

		.player-right .ctrl-btn {
			min-width: var(--touch-min);
			min-height: var(--touch-min);
		}

		.ctrl-play {
			width: 44px;
			height: 44px;
		}
	}

	@keyframes slideUp {
		from { transform: translateY(100%); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.player-bar.playing::before,
		.player-bar.playing .player-cover,
		.player-bar.playing .ctrl-play {
			animation: none !important;
		}
	}
</style>
