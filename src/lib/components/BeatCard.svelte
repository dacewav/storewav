<script lang="ts">
	import { onMount } from 'svelte';
	import type { Beat } from '$lib/stores/beats';
	import { wishlist, settings, player, analytics, incrementPlay } from '$lib/stores';
	import { tilt } from '$lib/actions';
	import { toast } from '$lib/toastStore';
	import Icon from './Icon.svelte';
	import {
		mergeCardStyles,
		cardStyleToCSS,
		type CardStyleConfig
	} from '$lib/cardStyleEngine';

	let {
		beat,
		onplay,
		onclick,
		labelFrom = 'Desde'
	}: {
		beat: Beat & { id: string };
		onplay?: (beat: Beat & { id: string }) => void;
		onclick?: (beat: Beat & { id: string }) => void;
		labelFrom?: string;
	} = $props();

	let inWishlist = $derived(wishlist.isIn(beat.id));
	let playing = $state(false);
	let isCurrentBeat = $derived($player.beatId === beat.id && $player.playing);

	// Card style engine: merge global (from settings) + per-beat
	let accentRgb = $state('220, 38, 38');
	onMount(() => {
		const val = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
		if (val) accentRgb = val;
	});
	let globalCardStyle = $derived($settings.data?.cardStyle ?? {});
	let cardStyle = $derived(
		mergeCardStyles(globalCardStyle as Partial<CardStyleConfig>, (beat.cardStyle ?? {}) as Partial<CardStyleConfig>)
	);
	let inlineCSS = $derived(cardStyleToCSS(cardStyle, accentRgb));
	let hasShimmer = $derived(cardStyle.shimmer === true);

	function lowestPrice(beat: Beat & { id: string }): number {
		if (!beat.licenses?.length) return 0;
		return Math.min(...beat.licenses.map(l => l.priceMXN));
	}

	function handleWishlist(e: MouseEvent) {
		e.stopPropagation();
		const wasIn = wishlist.isIn(beat.id);
		wishlist.toggle(beat.id);
		analytics.track('wishlist', 'toggle', { lbl: beat.id, val: wasIn ? 0 : 1, meta: beat.name });
		toast.show(wasIn ? 'Quitado de favoritos' : '❤️ Añadido a favoritos');
	}

	function handlePlay(e: MouseEvent) {
		e.stopPropagation();
		// Play pulse effect
		playing = true;
		setTimeout(() => { playing = false; }, 600);
		incrementPlay(beat.id);
		analytics.track('beat', 'play', { lbl: beat.id, meta: beat.name });
		onplay?.(beat);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="beat-card"
	class:has-shimmer={hasShimmer}
	class:play-pulse={playing}
	use:tilt={{ max: 6 }}
	onclick={() => onclick?.(beat)}
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick?.(beat); } }}
	role="button"
	tabindex="0"
	style={inlineCSS || undefined}
>
	<!-- Shimmer overlay -->
	{#if hasShimmer}
		<div class="shimmer-overlay"></div>
	{/if}

	<!-- Featured badge -->
	{#if beat.featured}
		<span class="featured-badge">TOP</span>
	{/if}

	<!-- Cover -->
	<div class="beat-cover">
		{#if beat.imageUrl}
			<img src={beat.imageUrl} alt={beat.name} loading="lazy" />
		{:else}
			<div class="beat-cover-placeholder">
				<Icon name="music" size={32} />
			</div>
		{/if}

		<!-- Play overlay -->
		<button class="beat-play" onclick={handlePlay} aria-label="Reproducir {beat.name}">
			<Icon name="play" size={20} />
		</button>

		<!-- Wishlist -->
		<button class="beat-wish" class:active={$inWishlist} onclick={handleWishlist} aria-label="{$inWishlist ? 'Quitar de' : 'Añadir a'} favoritos">
			<Icon name="heart" size={14} filled={$inWishlist} />
		</button>

		<!-- Plays badge -->
		{#if (beat.plays ?? 0) > 0}
			<span class="beat-plays">🔥 {beat.plays}</span>
		{/if}

		<!-- Genre badge -->
		<span class="beat-genre">{beat.genre}</span>

		<!-- Cover overlay from style engine -->
		{#if cardStyle.coverOverlay}
			<div class="beat-cover-overlay" style="background: {cardStyle.coverOverlay};"></div>
		{/if}

		<!-- Waveform bars when playing (stable seed per beat) -->
		{#if isCurrentBeat}
			<div class="card-waveform">
				{#each Array(16) as _, i}
					<div class="wave-bar" style="--delay: {i * 0.05}s; --h: {20 + (((beat.name?.charCodeAt(i % (beat.name.length || 1)) ?? 0) * (i + 1) * 7) % 60)}%"></div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Info -->
	<div class="beat-info">
		<div class="beat-title">{beat.name}</div>
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
			<span class="price-from">{labelFrom}</span>
			<span class="price-amount">${lowestPrice(beat)}</span>
		</div>
	</div>
</div>

<style>
	.beat-card {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		overflow: hidden;
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
		box-shadow: var(--card-shadow);
	}

	.beat-card:hover {
		border-color: var(--border-hover-accent);
		box-shadow: var(--card-shadow-hover);
		transform: translateY(-3px);
	}

	/* ── Play Pulse Ring ── */
	.beat-card.play-pulse {
		/* Override inline animation from cardStyleEngine */
		animation: playPulseRing 0.6s ease-out !important;
	}

	@keyframes playPulseRing {
		0% { box-shadow: var(--card-shadow), 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
		70% { box-shadow: var(--card-shadow), 0 0 0 12px rgba(var(--accent-rgb), 0); }
		100% { box-shadow: var(--card-shadow), 0 0 0 0 rgba(var(--accent-rgb), 0); }
	}

	/* ── Featured Badge ── */
	.featured-badge {
		position: absolute;
		top: var(--space-3);
		left: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.9);
		color: var(--bg);
		letter-spacing: 0.14em;
		z-index: 3;
		font-weight: 600;
	}

	/* ── Shimmer overlay ── */
	.shimmer-overlay {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		overflow: hidden;
		border-radius: inherit;
	}

	.shimmer-overlay::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			105deg,
			transparent 40%,
			rgba(255, 255, 255, 0.06) 45%,
			rgba(255, 255, 255, 0.12) 50%,
			rgba(255, 255, 255, 0.06) 55%,
			transparent 60%
		);
		animation: cardShimmer 2.5s ease-in-out infinite;
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
		transition: transform var(--duration-normal) var(--ease-out);
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

	.beat-cover-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
	}

	/* Card waveform bars */
	.card-waveform {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 40px;
		display: flex;
		align-items: flex-end;
		gap: 2px;
		padding: 0 var(--space-2);
		z-index: 3;
		pointer-events: none;
	}

	.wave-bar {
		flex: 1;
		background: rgba(var(--accent-rgb), 0.7);
		border-radius: 2px 2px 0 0;
		height: 30%;
		animation: waveAnim 0.8s ease-in-out var(--delay, 0s) infinite alternate;
	}

	@keyframes waveAnim {
		0% { height: 15%; }
		100% { height: var(--h, 60%); }
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
		transition: all var(--duration-normal) var(--ease-out);
		box-shadow: var(--glow-accent);
		z-index: 2;
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
		background: var(--overlay-bg);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--duration-fast);
		opacity: 0;
		z-index: 2;
	}

	.beat-card:hover .beat-wish,
	.beat-wish.active {
		opacity: 1;
	}

	.beat-wish:hover {
		background: var(--surface-hover);
		color: var(--accent);
		transform: scale(1.1);
	}

	.beat-wish.active {
		color: var(--accent);
	}

	/* Plays badge */
	.beat-plays {
		position: absolute;
		bottom: var(--space-3);
		right: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: var(--overlay-bg);
		backdrop-filter: blur(8px);
		color: var(--text);
		letter-spacing: 0.04em;
		z-index: 2;
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
		background: var(--overlay-bg);
		backdrop-filter: blur(8px);
		color: var(--text);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		z-index: 2;
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
		font-size: var(--text-2xs);
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
