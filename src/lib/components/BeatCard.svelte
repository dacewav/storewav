<script lang="ts">
	import type { Beat } from '$lib/stores/beats';
	import { wishlist } from '$lib/stores';
	import { tilt } from '$lib/actions';

	let {
		beat,
		onplay,
		onclick
	}: {
		beat: Beat & { id: string };
		onplay?: (beat: Beat & { id: string }) => void;
		onclick?: (beat: Beat & { id: string }) => void;
	} = $props();

	let inWishlist = $derived(wishlist.isIn(beat.id));

	function handleWishlist(e: MouseEvent) {
		e.stopPropagation();
		wishlist.toggle(beat.id);
	}

	function handlePlay(e: MouseEvent) {
		e.stopPropagation();
		onplay?.(beat);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<article class="beat-card" use:tilt={{ max: 6 }} onclick={() => onclick?.(beat)} onkeydown={(e) => { if (e.key === 'Enter') onclick?.(beat); }} role="button" tabindex="0">
	<!-- Cover -->
	<div class="beat-cover">
		{#if beat.coverUrl}
			<img src={beat.coverUrl} alt={beat.title} loading="lazy" />
		{:else}
			<div class="beat-cover-placeholder">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
			</div>
		{/if}

		<!-- Play overlay -->
		<button class="beat-play" onclick={handlePlay} aria-label="Reproducir {beat.title}">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
		</button>

		<!-- Wishlist -->
		<button class="beat-wish" class:active={$inWishlist} onclick={handleWishlist} aria-label="{$inWishlist ? 'Quitar de' : 'Añadir a'} favoritos">
			{#if $inWishlist}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
			{/if}
		</button>

		<!-- Genre badge -->
		<span class="beat-genre">{beat.genre}</span>
	</div>

	<!-- Info -->
	<div class="beat-info">
		<div class="beat-title">{beat.title}</div>
		<div class="beat-meta">
			<span>{beat.bpm} BPM</span>
			<span class="meta-dot">·</span>
			<span>{beat.key}</span>
		</div>
		{#if beat.tags?.length}
			<div class="beat-tags">
				{#each beat.tags.slice(0, 3) as tag}
					<span class="beat-tag">{tag}</span>
				{/each}
			</div>
		{/if}
		<div class="beat-price">
			<span class="price-from">Desde</span>
			<span class="price-amount">${beat.licenses?.basic ?? 29.99}</span>
		</div>
	</div>
</article>

<style>
	.beat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		overflow: hidden;
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
	}

	.beat-card:hover {
		border-color: var(--border-hover-accent);
		box-shadow: var(--shadow-lg), 0 0 30px rgba(var(--accent-rgb), 0.08);
		transform: translateY(-3px);
	}

	/* ── Cover ── */
	.beat-cover {
		position: relative;
		aspect-ratio: 16/9;
		overflow: hidden;
		background: var(--surface2);
	}

	.beat-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s var(--ease-out);
	}

	.beat-card:hover .beat-cover img {
		transform: scale(1.05);
	}

	.beat-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	/* Play button */
	.beat-play {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0.8);
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transition: all 0.25s var(--ease-out);
		box-shadow: var(--glow-accent);
	}

	.beat-card:hover .beat-play {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}

	.beat-play:hover {
		transform: translate(-50%, -50%) scale(1.1) !important;
	}

	/* Wishlist */
	.beat-wish {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		opacity: 0;
	}

	.beat-card:hover .beat-wish,
	.beat-wish.active {
		opacity: 1;
	}

	.beat-wish:hover {
		background: rgba(0, 0, 0, 0.7);
		color: var(--accent);
		transform: scale(1.1);
	}

	.beat-wish.active {
		color: var(--accent);
	}

	/* Genre badge */
	.beat-genre {
		position: absolute;
		bottom: var(--space-3);
		left: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		color: var(--text);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	/* ── Info ── */
	.beat-info {
		padding: var(--space-4) var(--space-5);
	}

	.beat-title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-1);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.beat-meta {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		margin-bottom: var(--space-2);
	}

	.meta-dot {
		color: var(--text-muted);
	}

	.beat-tags {
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
		margin-bottom: var(--space-3);
	}

	.beat-tag {
		font-family: var(--font-mono);
		font-size: 10px;
		padding: 1px 6px;
		border-radius: var(--radius-full);
		background: var(--surface2);
		color: var(--text-muted);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.beat-price {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.price-from {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.price-amount {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--accent);
	}
</style>
