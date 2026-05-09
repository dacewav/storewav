<script lang="ts">
	import type { KitWithId } from '$lib/stores/kits';
	import { cart } from '$lib/stores';
	import Icon from './Icon.svelte';

	let {
		kit,
		onplay,
		onclick,
	}: {
		kit: KitWithId;
		onplay?: (kit: KitWithId) => void;
		onclick?: (kit: KitWithId) => void;
	} = $props();

	let inCart = $state(false);

	$effect(() => {
		const unsub = cart.isInCart(`kit-${kit.id}`).subscribe(v => inCart = v);
		return unsub;
	});

	function handleAddToCart(e: Event) {
		e.stopPropagation();
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

	function handlePlay(e: Event) {
		e.stopPropagation();
		onplay?.(kit);
	}

	function handleClick() {
		onclick?.(kit);
	}

	let sampleCount = $derived(kit.samples?.length || 0);
</script>

<div class="kit-card" role="button" tabindex="0" onclick={handleClick} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }} aria-label={kit.name}>
	<div class="kit-cover">
		{#if kit.imageUrl}
			<img src={kit.imageUrl} alt={kit.name} loading="lazy" decoding="async" />
		{:else}
			<div class="cover-ph">
				<Icon name="music" size={32} />
			</div>
		{/if}
		<div class="cover-overlay">
			<button class="play-btn" onclick={handlePlay} aria-label="Reproducir preview">
				<Icon name="play" size={20} />
			</button>
		</div>
		<span class="kit-badge">{kit.genre}</span>
		{#if sampleCount > 0}
			<span class="sample-count">{sampleCount} samples</span>
		{/if}
	</div>
	<div class="kit-info">
		<h3 class="kit-name">{kit.name}</h3>
		{#if kit.description}
			<p class="kit-desc">{kit.description}</p>
		{/if}
		<div class="kit-bottom">
			<span class="kit-price">Desde ${kit.priceMXN} MXN</span>
			<button
				class="add-btn"
				class:in-cart={inCart}
				onclick={handleAddToCart}
				aria-label={inCart ? 'En el carrito' : 'Agregar al carrito'}
			>
				<Icon name={inCart ? 'check' : 'shoppingCart'} size={14} />
			</button>
		</div>
	</div>
</div>

<style>
	.kit-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		cursor: pointer;
		transition: all var(--duration-normal);
		text-align: left;
		font: inherit;
		color: inherit;
		width: 100%;
		padding: 0;
	}

	.kit-card:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.kit-cover {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--surface2);
	}

	.kit-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-normal);
	}

	.kit-card:hover .kit-cover img {
		transform: scale(1.05);
	}

	.cover-ph {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.cover-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.4);
		opacity: 0;
		transition: opacity var(--duration-fast);
	}

	.kit-card:hover .cover-overlay {
		opacity: 1;
	}

	.play-btn {
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
		transition: transform var(--duration-fast);
	}

	.play-btn:hover {
		transform: scale(1.1);
	}

	.kit-badge {
		position: absolute;
		top: var(--space-2);
		left: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: rgba(var(--accent-rgb), 0.9);
		color: var(--bg);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		font-weight: 600;
		border-radius: var(--radius-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sample-count {
		position: absolute;
		bottom: var(--space-2);
		right: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: rgba(0, 0, 0, 0.7);
		color: white;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		border-radius: var(--radius-sm);
	}

	.kit-info {
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.kit-name {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		margin: 0;
		line-clamp: 1;
		-webkit-line-clamp: 1;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.kit-desc {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		line-clamp: 2;
		-webkit-line-clamp: 2;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin: 0;
	}

	.kit-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--space-2);
	}

	.kit-price {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--accent);
	}

	.add-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.add-btn:hover {
		background: var(--accent);
		color: var(--bg);
	}

	.add-btn.in-cart {
		background: #22c55e;
		border-color: #22c55e;
		color: white;
	}

	@media (max-width: 480px) {
		.play-btn {
			width: 56px;
			height: 56px;
		}
	}
</style>
