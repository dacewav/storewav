<script lang="ts">
	import { wishlist, beatsList, player, lowestPrice } from '$lib/stores';
	import { EmptyState } from '$lib/components';
	import Icon from './Icon.svelte';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { getBeatSlug } from '$lib/slug';

	let {
		open = $bindable(false),
		emptyTitle = 'Sin favoritos',
		emptySub = 'Añade beats a tu lista para verlos aquí'
	}: {
		open?: boolean;
		emptyTitle?: string;
		emptySub?: string;
	} = $props();

	let wishIds = $derived($wishlist);
	let beats = $derived($beatsList);

	let wishBeats = $derived(
		beats.filter((b) => wishIds.includes(b.id))
	);

	// Track removing items for exit animation
	let removingIds = $state(new Set<string>());

	function removeWithAnimation(id: string) {
		removingIds.add(id);
		removingIds = new Set(removingIds); // trigger reactivity
		setTimeout(() => {
			wishlist.toggle(id);
			removingIds.delete(id);
			removingIds = new Set(removingIds);
		}, 300);
	}

	function playBeat(beat: typeof wishBeats[0]) {
		player.play({
			id: beat.id,
			name: beat.name,
			artist: beat.artist ?? '',
			imageUrl: beat.imageUrl ?? '',
			audioUrl: beat.audioUrl ?? ''
		});
	}

	// Stagger delay per item
	function staggerDelay(index: number): number {
		return Math.min(index * 60, 400);
	}
</script>

{#if open}
	<div class="panel-backdrop" onclick={() => open = false} onkeydown={(e) => { if (e.key === 'Escape') open = false; }} role="button" tabindex="-1" aria-label="Cerrar favoritos" transition:fade={{ duration: 200 }}></div>
	<aside class="wishlist-panel" transition:fly={{ x: 360, duration: 300, easing: quintOut }}>
		<div class="panel-header">
			<h3 class="panel-title">
				Favoritos
				{#if wishBeats.length > 0}
					<span class="wish-count">{wishBeats.length}</span>
				{/if}
			</h3>
			<div class="panel-header-actions">
				{#if wishBeats.length > 0}
					<button class="panel-clear" onclick={() => { if (confirm('¿Limpiar todos los favoritos?')) wishlist.clear(); }} aria-label="Limpiar todo">
						🗑️
					</button>
				{/if}
				<button class="panel-close" onclick={() => open = false} aria-label="Cerrar">
					<Icon name="close" size={16} />
				</button>
			</div>
		</div>

		<div class="panel-body">
			{#if wishBeats.length === 0}
				<EmptyState icon="♡" title={emptyTitle} subtitle={emptySub}>
					{#snippet action()}
						<button class="wish-cta" onclick={() => { open = false; goto('/'); }}>
							Explorar beats
						</button>
					{/snippet}
				</EmptyState>
			{:else}
				{#each wishBeats as beat, i (beat.id)}
					<div
						class="wish-item"
						class:removing={removingIds.has(beat.id)}
						style="animation-delay: {staggerDelay(i)}ms"
					>
						<button class="wish-cover" onclick={() => playBeat(beat)} aria-label="Reproducir {beat.name}">
							{#if beat.imageUrl}
								<img src={beat.imageUrl} alt="{beat.name} cover" loading="lazy" decoding="async" />
							{:else}
								<span>🎵</span>
							{/if}
						</button>
						<div class="wish-info">
							<div class="wish-title">{beat.name}</div>
							<div class="wish-meta">{beat.genre} · {beat.bpm} BPM · Desde ${lowestPrice(beat)}</div>
						</div>
						<div class="wish-actions">
							<button class="wish-view" onclick={() => { open = false; goto(`/beat/${getBeatSlug(beat)}`); }} aria-label="Ver beat" title="Ver beat">
								<Icon name="export" size={12} />
							</button>
								<button class="wish-remove" onclick={() => removeWithAnimation(beat.id)} aria-label="Quitar">
								<Icon name="close" size={12} />
							</button>
						</div>
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
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.wish-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		color: var(--accent);
		letter-spacing: 0.04em;
	}

	.panel-header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.panel-clear {
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
		font-size: 14px;
		transition: all var(--duration-fast);
	}

	.panel-clear:hover {
		background: var(--danger-glow);
		color: var(--danger);
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
		transition: all var(--duration-fast);
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
		transition: all var(--duration-fast) var(--ease-out);
		animation: wishItemIn 0.3s var(--ease-out) both;
	}

	.wish-item.removing {
		animation: wishItemOut 0.3s var(--ease-out) forwards;
	}

	@keyframes wishItemIn {
		from { opacity: 0; transform: translateX(20px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@keyframes wishItemOut {
		from { opacity: 1; transform: translateX(0); height: auto; margin-bottom: 0; }
		to { opacity: 0; transform: translateX(-40px); height: 0; margin-bottom: calc(-1 * var(--space-3)); padding: 0; overflow: hidden; }
	}

	.wish-item:hover {
		background: var(--surface-hover);
		transform: translateX(4px) scale(1.02);
		box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.15);
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
		transition: all var(--duration-fast);
		flex-shrink: 0;
	}

	.wish-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.wish-view {
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
		transition: all var(--duration-fast);
	}

	.wish-view:hover {
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
	}

	.wish-remove:hover {
		background: var(--danger-glow);
		color: var(--danger);
	}

	.wish-cta {
		display: inline-flex;
		align-items: center;
		padding: var(--space-3) var(--space-6);
		min-height: var(--touch-min);
		border: 1px solid rgba(var(--accent-rgb), 0.5);
		border-radius: var(--radius-lg);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.wish-cta:hover {
		background: var(--accent);
		color: var(--bg);
		box-shadow: var(--glow-sm);
	}
</style>
