<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { kits, settings, cart, player as globalPlayer } from '$lib/stores';
	import { Skeleton, EmptyState } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { onMount } from 'svelte';
	import type { KitSample, KitWithId } from '$lib/stores/kits';

	let kitId = $derived(page.params.id);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');
	let kitsData = $derived($kits);
	let loading = $derived(kitsData.loading);

	let kit = $derived.by(() => {
		if (!kitsData.data || !kitId) return null;
		const k = kitsData.data[kitId];
		return k ? { id: kitId, ...k } : null;
	});

	/** Related kits: same genre, excluding current */
	let relatedKits = $derived.by(() => {
		if (!kitsData.data || !kit) return [];
		return Object.entries(kitsData.data)
			.filter(([id, k]) => id !== kitId && k.active && k.genre === kit.genre)
			.slice(0, 4)
			.map(([id, k]) => ({ id, ...k }));
	});

	let inCart = $derived(false);

	$effect(() => {
		if (kitId) {
			const unsub = cart.isInCart(`kit-${kitId}`).subscribe(v => inCart = v);
			return unsub;
		}
	});

	// Player state
	let playingSampleUrl = $state<string | null>(null);
	let playingSampleIdx = $state<number>(-1);
	let audioEl = $state<HTMLAudioElement | undefined>();
	let currentTime = $state(0);
	let duration = $state(0);
	let copied = $state(false);
	let rafId = $state<number | null>(null);

	let totalDuration = $derived(
		kit?.samples?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0
	);

	function formatTime(sec: number): string {
		if (!sec || !isFinite(sec)) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function tickProgress() {
		if (audioEl && playingSampleUrl) {
			currentTime = audioEl.currentTime || 0;
			duration = audioEl.duration || 0;
			rafId = requestAnimationFrame(tickProgress);
		}
	}

	function playSample(sample: KitSample, idx: number) {
		if (playingSampleUrl === sample.url) {
			// Toggle pause/play
			if (audioEl?.paused) {
				audioEl.play();
				rafId = requestAnimationFrame(tickProgress);
			} else {
				audioEl?.pause();
				if (rafId) cancelAnimationFrame(rafId);
			}
			return;
		}

		// Stop previous + pause global player
		stopPlayback();
		globalPlayer.pause();

		playingSampleUrl = sample.url;
		playingSampleIdx = idx;
		currentTime = 0;
		duration = sample.duration || 0;
		audioEl = new Audio(sample.url);
		audioEl.addEventListener('ended', onEnded);
		audioEl.addEventListener('error', onEnded);
		audioEl.addEventListener('loadedmetadata', () => {
			duration = audioEl?.duration || sample.duration || 0;
		});
		audioEl.play().then(() => {
			rafId = requestAnimationFrame(tickProgress);
		}).catch(() => { onEnded(); });
	}

	function onEnded() {
		// Auto-play next sample
		if (kit?.samples && playingSampleIdx >= 0 && playingSampleIdx < kit.samples.length - 1) {
			const nextIdx = playingSampleIdx + 1;
			playSample(kit.samples[nextIdx], nextIdx);
			return;
		}
		stopPlayback();
	}

	function stopPlayback() {
		if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
		audioEl?.removeEventListener('ended', onEnded);
		audioEl?.removeEventListener('error', onEnded);
		audioEl?.pause();
		audioEl = undefined;
		playingSampleUrl = null;
		playingSampleIdx = -1;
		currentTime = 0;
		duration = 0;
	}

	function seekTo(e: MouseEvent, sample: KitSample) {
		if (!audioEl || playingSampleUrl !== sample.url || !duration) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		audioEl.currentTime = pct * duration;
		currentTime = audioEl.currentTime;
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
			if (rafId) cancelAnimationFrame(rafId);
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
						<span class="meta-item">⏱️ {formatTime(totalDuration)}</span>
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
				<div class="samples-header">
					<h2 class="section-title">🎧 Samples</h2>
					{#if playingSampleUrl}
						<button class="stop-btn" onclick={stopPlayback} aria-label="Detener">
							<Icon name="pause" size={12} /> Detener
						</button>
					{/if}
				</div>
				<div class="samples-list">
					{#each kit.samples as sample, i}
						{@const isPlaying = playingSampleUrl === sample.url}
						{@const progressPct = isPlaying && duration > 0 ? (currentTime / duration) * 100 : 0}
						<button
							class="sample-row"
							class:playing={isPlaying}
							class:paused={isPlaying && audioEl?.paused}
							onclick={() => playSample(sample, i)}
						>
							<span class="sample-num">{(i + 1).toString().padStart(2, '0')}</span>
							<span class="sample-play">
								{#if isPlaying && !audioEl?.paused}
									<Icon name="pause" size={14} />
								{:else}
									<Icon name="play" size={14} />
								{/if}
							</span>
							<span class="sample-name">{sample.name}</span>
							{#if isPlaying}
								<span class="sample-time">{formatTime(currentTime)} / {formatTime(duration || sample.duration || 0)}</span>
							{:else if sample.duration}
								<span class="sample-duration">{formatTime(sample.duration)}</span>
							{/if}
						</button>
						{#if isPlaying && duration > 0}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div
								class="progress-bar"
								role="slider"
								tabindex="0"
								aria-label="Progreso"
								aria-valuenow={Math.round(progressPct)}
								aria-valuemin={0}
								aria-valuemax={100}
								onclick={(e) => seekTo(e, sample)}
								onkeydown={(e) => { if (e.key === 'ArrowRight' && audioEl) { audioEl.currentTime = Math.min(duration, audioEl.currentTime + 5); } if (e.key === 'ArrowLeft' && audioEl) { audioEl.currentTime = Math.max(0, audioEl.currentTime - 5); } }}
							>
								<div class="progress-fill" style="width: {progressPct}%"></div>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- Related kits -->
		{#if relatedKits.length > 0}
			<section class="related-section">
				<h2 class="section-title">🔥 Más de {kit.genre}</h2>
				<div class="related-grid">
					{#each relatedKits as related (related.id)}
						<button class="related-card" onclick={() => goto(`/kit/${related.id}`)}>
							<div class="related-cover">
								{#if related.imageUrl}
									<img src={related.imageUrl} alt={related.name} loading="lazy" />
								{:else}
									<div class="related-ph">🥁</div>
								{/if}
							</div>
							<div class="related-info">
								<span class="related-name">{related.name}</span>
								<span class="related-meta">{related.samples?.length || 0} samples · ${related.priceMXN} MXN</span>
							</div>
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

	.samples-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.stop-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-sm);
		color: #ef4444;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		cursor: pointer;
		transition: all var(--duration-fast);
	}
	.stop-btn:hover {
		background: rgba(239, 68, 68, 0.2);
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
		position: relative;
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
		animation: pulse-ring 1.5s ease-in-out infinite;
	}

	@keyframes pulse-ring {
		0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.3); }
		50% { box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0); }
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

	.sample-time {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--accent);
		font-weight: 600;
	}

	/* Progress bar */
	.progress-bar {
		height: 3px;
		background: var(--border);
		cursor: pointer;
		position: relative;
		transition: height var(--duration-fast);
	}
	.progress-bar:hover {
		height: 6px;
	}
	.progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 0 2px 2px 0;
		transition: width 0.1s linear;
		position: relative;
	}
	.progress-fill::after {
		content: '';
		position: absolute;
		right: -3px;
		top: 50%;
		transform: translateY(-50%);
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		opacity: 0;
		transition: opacity var(--duration-fast);
	}
	.progress-bar:hover .progress-fill::after {
		opacity: 1;
	}

	/* Related kits */
	.related-section {
		margin-top: var(--space-10);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-3);
	}

	.related-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: all var(--duration-fast);
		text-align: left;
		padding: 0;
		font: inherit;
		color: inherit;
		width: 100%;
	}
	.related-card:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.related-cover {
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--surface2);
	}
	.related-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-normal);
	}
	.related-card:hover .related-cover img {
		transform: scale(1.05);
	}
	.related-ph {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}

	.related-info {
		padding: var(--space-2) var(--space-3);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.related-name {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.related-meta {
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
		.related-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
