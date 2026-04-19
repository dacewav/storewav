<script lang="ts">
	import { wishlist, beatsList, player } from '$lib/stores';
	import { EmptyState } from '$lib/components';

	let {
		open = $bindable(false)
	}: {
		open?: boolean;
	} = $props();

	let wishIds = $derived($wishlist);
	let beats = $derived($beatsList);

	let wishBeats = $derived(
		beats.filter((b) => wishIds.includes(b.id))
	);

	function playBeat(beat: typeof wishBeats[0]) {
		player.play({
			id: beat.id,
			title: beat.title,
			artist: beat.artist,
			coverUrl: beat.coverUrl,
			audioUrl: beat.audioUrl
		});
	}
</script>

{#if open}
	<div class="panel-backdrop" onclick={() => open = false}></div>
	<aside class="wishlist-panel">
		<div class="panel-header">
			<h3 class="panel-title">Favoritos</h3>
			<button class="panel-close" onclick={() => open = false} aria-label="Cerrar">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
			</button>
		</div>

		<div class="panel-body">
			{#if wishBeats.length === 0}
				<EmptyState icon="♡" title="Sin favoritos" subtitle="Añade beats a tu lista para verlos aquí" />
			{:else}
				{#each wishBeats as beat (beat.id)}
					<div class="wish-item">
						<button class="wish-cover" onclick={() => playBeat(beat)} aria-label="Reproducir {beat.title}">
							{#if beat.coverUrl}
								<img src={beat.coverUrl} alt="" />
							{:else}
								<span>🎵</span>
							{/if}
						</button>
						<div class="wish-info">
							<div class="wish-title">{beat.title}</div>
							<div class="wish-meta">{beat.genre} · {beat.bpm} BPM</div>
						</div>
						<button class="wish-remove" onclick={() => wishlist.toggle(beat.id)} aria-label="Quitar">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</aside>
{/if}

<style>
	.panel-backdrop {
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-overlay) - 1);
		background: var(--overlay-bg);
		backdrop-filter: blur(4px);
	}

	.wishlist-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: min(360px, 90vw);
		height: 100dvh;
		z-index: var(--z-overlay);
		background: var(--bg-secondary);
		border-left: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		animation: slideInRight 0.3s var(--ease-out);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-5) var(--space-5) var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.panel-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
	}

	.panel-close {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s;
	}

	.panel-close:hover {
		background: var(--surface);
		color: var(--text);
	}

	.panel-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-3);
	}

	.wish-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		transition: background 0.15s;
	}

	.wish-item:hover {
		background: var(--surface-hover);
	}

	.wish-cover {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
		background: var(--surface2);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wish-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.wish-info {
		flex: 1;
		min-width: 0;
	}

	.wish-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.wish-meta {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
	}

	.wish-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.15s;
		flex-shrink: 0;
	}

	.wish-remove:hover {
		background: var(--danger-glow);
		color: var(--danger);
	}

	@keyframes slideInRight {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}
</style>
