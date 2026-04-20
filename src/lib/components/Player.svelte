<script lang="ts">
	import { player } from '$lib/stores';
	import Icon from './Icon.svelte';

	let state = $derived($player);
	let progressVal = $derived(state.duration > 0 ? state.currentTime / state.duration : 0);
	let showBar = $derived(state.beatId !== null);

	let currentTime = $derived(formatTime(state.currentTime));
	let totalTime = $derived(formatTime(state.duration));

	function formatTime(sec: number): string {
		if (!sec || !isFinite(sec)) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
</script>

{#if showBar}
	<div class="player-bar" class:playing={state.playing}>
		<!-- Progress bar -->
		<div class="progress-track" role="slider" aria-label="Progreso" aria-valuenow={Math.round(progressVal * 100)} aria-valuemin={0} aria-valuemax={100} tabindex="0"
			onclick={(e) => {
				const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
				const pct = (e.clientX - rect.left) / rect.width;
				player.seek(pct * state.duration);
			}}
			onkeydown={(e) => {
				if (e.key === 'ArrowRight') player.seek(state.currentTime + 5);
				if (e.key === 'ArrowLeft') player.seek(state.currentTime - 5);
			}}
		>
			<div class="progress-fill" style="width: {progressVal * 100}%"></div>
			<div class="progress-thumb" style="left: {progressVal * 100}%"></div>
		</div>

		<div class="player-inner">
			<!-- Cover + Info -->
			<div class="player-info">
				{#if state.coverUrl}
					<img class="player-cover" src={state.coverUrl} alt="" />
				{:else}
					<div class="player-cover player-cover-placeholder">🎵</div>
				{/if}
				<div class="player-text">
					<div class="player-title">{state.title}</div>
					<div class="player-artist">{state.artist}</div>
				</div>
			</div>

			<!-- Controls -->
			<div class="player-controls">
				<span class="player-time">{currentTime}</span>

				<button class="ctrl-btn ctrl-play" onclick={() => state.playing ? player.pause() : player.resume()} aria-label={state.playing ? 'Pausar' : 'Reproducir'}>
					{#if state.playing}
						<Icon name="pause" size={16} />
					{:else}
						<Icon name="play" size={16} />
					{/if}
				</button>

				<span class="player-time">{totalTime}</span>
			</div>

			<!-- Volume + Close -->
			<div class="player-right">
				<button class="ctrl-btn" onclick={() => player.toggleMute()} aria-label={state.muted ? 'Activar sonido' : 'Silenciar'}>
					{#if state.muted || state.volume === 0}
						<Icon name="volumeOff" size={14} />
					{:else}
						<Icon name="volumeOn" size={14} />
					{/if}
				</button>

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
		border-top-color: rgba(var(--accent-rgb), 0.2);
	}

	.player-bar.playing::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--accent), transparent);
		opacity: 0.3;
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
		background: var(--accent);
		border-radius: 2px;
		transition: width 0.1s linear;
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

	.player-cover {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		object-fit: cover;
		flex-shrink: 0;
		transition: transform var(--duration-normal) var(--ease-out);
	}

	.player-bar.playing .player-cover {
		animation: play-cover-pulse 2s ease-in-out infinite;
	}

	@keyframes play-cover-pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
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
	}

	.player-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.player-artist {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	/* Controls */
	.player-controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);
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
		gap: var(--space-1);
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

		.player-right .ctrl-btn:first-child {
			/* Volume visible on mobile */
		}

		.player-right .ctrl-btn:last-child {
			/* Close visible on mobile */
		}
	}

	@media (max-width: 480px) {
		.player-right {
			gap: 0;
		}

		.player-right .ctrl-btn {
			min-width: 36px;
			min-height: 36px;
		}

		.ctrl-play {
			width: 38px;
			height: 38px;
		}
	}

	@keyframes slideUp {
		from { transform: translateY(100%); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}
</style>
