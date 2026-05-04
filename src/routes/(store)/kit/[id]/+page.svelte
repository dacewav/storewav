<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { kits, settings, player, cart } from '$lib/stores';
	import { Skeleton, EmptyState } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { onMount } from 'svelte';
	import type { KitSample } from '$lib/stores/kits';

	let kitId = $derived(page.params.id);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');
	let kitsData = $derived($kits);
	let loading = $derived(kitsData.loading);

	let kit = $derived.by(() => {
		if (!kitsData.data || !kitId) return null;
		const k = kitsData.data[kitId];
		return k ? { id: kitId, ...k } : null;
	});

	let inCart = $derived(false);

	$effect(() => {
		if (kitId) {
			const unsub = cart.isInCart(`kit-${kitId}`).subscribe(v => inCart = v);
			return unsub;
		}
	});

	let playingSample = $state<string | null>(null);
	let audioEl = $state<HTMLAudioElement | undefined>();
	let copied = $state(false);

	let totalDuration = $derived(
		kit?.samples?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0
	);

	function playSample(sample: KitSample) {
		if (playingSample === sample.url) {
			// Stop
			audioEl?.pause();
			playingSample = null;
			return;
		}

		// Stop previous
		audioEl?.pause();

		playingSample = sample.url;
		audioEl = new Audio(sample.url);
		audioEl.addEventListener('ended', () => { playingSample = null; });
		audioEl.addEventListener('error', () => { playingSample = null; });
		audioEl.play().catch(() => { playingSample = null; });
	}

	function addToCart() {
		if (!kit) return;
		cart.add({
			beatId: `kit-${kit.id}`,
			beatName: kit.name,
			imageUrl: kit.imageUrl,
			licenseName: 'Drumkit',
			licenseIndex: 0,
			priceMXN: kit.priceMXN,
			priceUSD: kit.priceUSD,
		});
	}

	function goBack() {
		goto('/kits');
	}

	function shareKit() {
		const url = window.location.href;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(url).then(() => {
				copied = true;
				setTimeout(() => { copied = false; }, 2000);
			});
		}
	}

	onMount(() => {
		return () => {
			audioEl?.pause();
			audioEl = undefined;
		};
	});
</script>

<svelte:head>
	{#if kit}
		<title>{kit.name} — Drumkits — {brandName}</title>
		<meta name="description" content={kit.description || `${kit.name} drumkit. ${kit.samples?.length || 0} samples de ${kit.genre}.`} />
	{:else}
		<title>Kit — {brandName}</title>
	{/if}
</svelte:head>

<div class="kit-detail">
	{#if loading}
		<div class="kit-skeleton">
			<Skeleton variant="card" aspectRatio="1" />
			<Skeleton variant="compact" lines={4} />
		</div>
	{:else if !kit}
		<EmptyState
			icon="🥁"
			title="Kit no encontrado"
			subtitle="Este drumkit no existe o fue eliminado"
		>
			{#snippet action()}
				<button class="back-btn" onclick={goBack}>Volver a drumkits</button>
			{/snippet}
		</EmptyState>
	{:else}
		<!-- Back -->
		<button class="back-link" onclick={goBack}>
			<Icon name="chevronLeft" size={14} /> Drumkits
		</button>

		<div class="kit-layout">
			<!-- Cover -->
			<div class="kit-cover">
				{#if kit.imageUrl}
					<img src={kit.imageUrl} alt={kit.name} loading="lazy" decoding="async" />
				{:else}
					<div class="cover-ph">
						<Icon name="music" size={64} />
					</div>
				{/if}
			</div>

			<!-- Info -->
			<div class="kit-info">
				<span class="kit-genre">{kit.genre}</span>
				<h1 class="kit-name">{kit.name}</h1>
				{#if kit.description}
					<p class="kit-desc">{kit.description}</p>
				{/if}

				<div class="kit-meta">
					{#if kit.samples?.length}
						<span class="meta-item">🎵 {kit.samples.length} samples</span>
					{/if}
					{#if totalDuration > 0}
						<span class="meta-item">⏱️ {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</span>
					{/if}
				</div>

				<div class="kit-pricing">
					<div class="price-row">
						<span class="price-label">Precio</span>
						<span class="price-val">${kit.priceMXN} MXN / ${kit.priceUSD} USD</span>
					</div>
					<div class="price-actions">
						<button class="cart-btn" class:in-cart={inCart} onclick={addToCart}>
							<Icon name={inCart ? 'check' : 'shoppingCart'} size={16} />
							{inCart ? 'En el carrito' : 'Agregar al carrito'}
						</button>
						<button class="share-btn" onclick={shareKit} aria-label="Compartir">
							<Icon name={copied ? 'check' : 'share'} size={16} />
							{copied ? 'Copiado' : 'Compartir'}
						</button>
					</div>
					<p class="download-info">Descarga instantánea · WAV/Mp3 · Uso comercial incluido</p>
				</div>
			</div>
		</div>

		<!-- Samples -->
		{#if kit.samples?.length}
			<section class="samples-section">
				<h2 class="section-title">🎧 Samples</h2>
				<div class="samples-list">
					{#each kit.samples as sample, i}
						<button
							class="sample-row"
							class:playing={playingSample === sample.url}
							onclick={() => playSample(sample)}
						>
							<span class="sample-num">{(i + 1).toString().padStart(2, '0')}</span>
							<span class="sample-play">
								{#if playingSample === sample.url}
									<Icon name="pause" size={14} />
								{:else}
									<Icon name="play" size={14} />
								{/if}
							</span>
							<span class="sample-name">{sample.name}</span>
							{#if sample.duration}
								<span class="sample-duration">{Math.round(sample.duration)}s</span>
							{/if}
						</button>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.kit-detail {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-6) var(--container-padding) var(--space-16);
	}

	.kit-skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.back-btn {
		display: inline-block;
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--bg);
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		border: none;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		margin-bottom: var(--space-4);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.back-link:hover {
		color: var(--accent);
	}

	/* Layout */
	.kit-layout {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: var(--space-6);
		margin-bottom: var(--space-8);
	}

	.kit-cover {
		aspect-ratio: 1;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--surface);
	}

	.kit-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-ph {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.kit-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.kit-genre {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.kit-name {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		margin: 0;
	}

	.kit-desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-normal);
		margin: 0;
	}

	.kit-meta {
		display: flex;
		gap: var(--space-3);
	}

	.meta-item {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	/* Pricing */
	.kit-pricing {
		margin-top: auto;
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.price-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.price-val {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--accent);
	}

	.cart-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
		align-self: flex-start;
	}

	.cart-btn:hover {
		filter: brightness(1.1);
	}

	.cart-btn.in-cart {
		background: #22c55e;
	}

	.price-actions {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.share-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.download-info {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		margin: 0;
	}

	/* Samples */
	.samples-section {
		margin-top: var(--space-4);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.samples-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: var(--border);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.sample-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border: none;
		cursor: pointer;
		transition: background var(--duration-fast);
		font: inherit;
		color: var(--text);
		text-align: left;
		width: 100%;
	}

	.sample-row:hover {
		background: var(--surface-hover);
	}

	.sample-row.playing {
		background: rgba(var(--accent-rgb), 0.08);
	}

	.sample-num {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		width: 24px;
		flex-shrink: 0;
	}

	.sample-play {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		flex-shrink: 0;
		transition: all var(--duration-fast);
	}

	.sample-row.playing .sample-play {
		background: var(--accent);
		color: var(--bg);
	}

	.sample-name {
		flex: 1;
		font-size: var(--text-sm);
		font-weight: 500;
	}

	.sample-duration {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	@media (max-width: 600px) {
		.kit-layout {
			grid-template-columns: 1fr;
		}

		.kit-cover {
			max-width: 300px;
		}
	}
</style>
