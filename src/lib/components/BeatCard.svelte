<script lang="ts">
	import type { Beat } from '$lib/stores/beats';
	import { wishlist, settings, player, analytics, incrementPlay, accentRgb as accentRgbStore, cart, likeCounts, subscribeToLikeCount, lowestPrice } from '$lib/stores';
	import { tilt } from '$lib/actions';
	import { toast } from '$lib/toastStore';
	import { genreGradient } from '$lib/visualUtils';
	import Icon from './Icon.svelte';
	import { onMount, onDestroy } from 'svelte';
	import {
		mergeCardStyles,
		cardStyleToCSS,
		cardTitleCSS,
		cardPriceCSS,
		cardTagCSS,
		cardImageCSS,
		cardImageHoverCSS,
		cardLayoutCSS,
		type CardStyleConfig
	} from '$lib/cardStyleEngine';


	let {
		beat,
		onplay,
		onclick,
		labelFrom = 'Desde',
		lazy = false
	}: {
		beat: Beat & { id: string };
		onplay?: (beat: Beat & { id: string }) => void;
		onclick?: (beat: Beat & { id: string }) => void;
		labelFrom?: string;
		lazy?: boolean;
	} = $props();

	let wishIds = $derived($wishlist);
	let inWishlist = $derived(wishIds.includes(beat.id));
	let playing = $state(false);
	let justLiked = $state(false);
	let cartPop = $state(false);
	let flyingThumb: { x: number; y: number; src: string } | null = $state(null);
	let isCurrentBeat = $derived($player.beatId === beat.id && $player.playing);

	// Lazy loading: only render image/waveform when visible
	let isVisible = $state(!lazy);
	let cardEl: HTMLDivElement | null = $state(null);
	let observer: IntersectionObserver | null = null;

	// Swipe gesture state
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let swipeDeltaX = $state(0);
	let swiping = $state(false);
	let swipeAction: 'like' | 'cart' | null = $state(null);

	onMount(() => {
		if (lazy && cardEl) {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							isVisible = true;
							observer?.disconnect();
						}
					}
				},
				{ rootMargin: '200px' }
			);
			observer.observe(cardEl);
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	// Swipe gesture handlers
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		swiping = true;
		swipeDeltaX = 0;
		swipeAction = null;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!swiping) return;
		const dx = e.touches[0].clientX - touchStartX;
		const dy = e.touches[0].clientY - touchStartY;
		// Only swipe horizontally
		if (Math.abs(dy) > Math.abs(dx)) { swiping = false; return; }
		swipeDeltaX = dx;
		if (dx > 60) swipeAction = 'like';
		else if (dx < -60) swipeAction = 'cart';
		else swipeAction = null;
	}

	function handleTouchEnd() {
		if (!swiping) return;
		if (swipeAction === 'like' && !inWishlist) {
			wishlist.toggle(beat.id);
			justLiked = true;
			setTimeout(() => { justLiked = false; }, 500);
			toast.show('❤️ Añadido a favoritos');
		} else if (swipeAction === 'cart') {
			handleAddToCart(new MouseEvent('click'));
		}
		swiping = false;
		swipeDeltaX = 0;
		swipeAction = null;
	}
	let beatLikeCount = $derived($likeCounts[beat.id] ?? 0);

	// Subscribe to like count for this beat (so cards show ❤️ N without needing LikeButton)
	let unsubLikeCount: (() => void) | undefined;
	onMount(() => {
		unsubLikeCount = subscribeToLikeCount(beat.id, () => {});
		return () => { unsubLikeCount?.(); };
	});

	// Card style engine: merge global (from settings) + per-beat
	let accentRgb = $derived($accentRgbStore);
	let globalCardStyle = $derived($settings.data?.cardStyle ?? {});
	// Per-beat animation intensity from cardAnim.intensity (0-200 → 0-100 for CSS var)
	let perBeatOverrides = $derived({
		...(beat.cardStyle ?? {}),
		...(beat.cardAnim?.intensity !== undefined ? { animIntensity: Math.min(100, Math.max(0, (beat.cardAnim.intensity as number) / 2)) } : {})
	} as Partial<CardStyleConfig>);
	let cardStyle = $derived(
		mergeCardStyles(globalCardStyle as Partial<CardStyleConfig>, perBeatOverrides)
	);
	// Hover CSS variables for :hover rule
	let hoverVars = $derived([
		cardStyle.hoverScale ? `--hover-scale: ${cardStyle.hoverScale}` : '',
		cardStyle.hoverScale ? `--hover-translate-y: 0px` : '',
		cardStyle.hoverBrightness ? `--hover-brightness: ${cardStyle.hoverBrightness}` : '',
		cardStyle.hoverSaturate ? `--hover-saturate: ${cardStyle.hoverSaturate}` : '',
		cardStyle.hoverShadowBlur ? `--hover-shadow-blur: ${cardStyle.hoverShadowBlur}px` : '',
		cardStyle.hoverBorderColor ? `--hover-border-color: ${cardStyle.hoverBorderColor}` : '',
		cardStyle.hoverOpacity ? `--hover-opacity: ${cardStyle.hoverOpacity}` : '',
		cardStyle.hoverHueRotate ? `--hover-hue-rotate: ${cardStyle.hoverHueRotate}deg` : '',
		cardStyle.hoverTransition ? `--hover-transition: ${cardStyle.hoverTransition}s` : '',
	].filter(Boolean).join('; '));
	let inlineCSS = $derived([
		cardStyleToCSS(cardStyle, accentRgb),
		cardStyle.imageHoverZoom ? `--image-hover-zoom: ${cardStyle.imageHoverZoom}` : '',
		hoverVars,
	].filter(Boolean).join('; ') || undefined);
	let titleCSS = $derived(cardTitleCSS(cardStyle));
	let priceCSS = $derived(cardPriceCSS(cardStyle));
	let tagCSS = $derived(cardTagCSS(cardStyle));
	let imageCSS = $derived(cardImageCSS(cardStyle));
	let imageHoverCSS = $derived(cardImageHoverCSS(cardStyle));
	let layoutCSS = $derived(cardLayoutCSS(cardStyle));
	let hasShimmer = $derived(cardStyle.shimmer === true);
	let shimmerInlineCSS = $derived(hasShimmer ? [
		`--shimmer-opacity: ${cardStyle.shimmerOpacity ?? 1}`,
		`--shimmer-duration: ${cardStyle.shimmerDuration ?? '2.5s'}`,
		cardStyle.shimmerColor ? `--shimmer-color: ${cardStyle.shimmerColor}` : ''
	].filter(Boolean).join('; ') : '');

	function handleWishlist(e: MouseEvent) {
		e.stopPropagation();
		const wasIn = inWishlist;

		// Set burst BEFORE toggle (toggle triggers re-render that may replace DOM)
		if (!wasIn) {
			justLiked = true;
			setTimeout(() => { justLiked = false; }, 500);
		}

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

	function handleAddToCart(e: MouseEvent) {
		e.stopPropagation();
		if (!beat.licenses?.length) return;
		// Add cheapest license by default
		const cheapest = beat.licenses.reduce((min, l, i) =>
			l.priceUSD < beat.licenses[min].priceUSD ? i : min, 0);
		const lic = beat.licenses[cheapest];
		const alreadyIn = $cart.some(c => c.beatId === beat.id && c.licenseIndex === cheapest);
		if (alreadyIn) {
			toast.show('Ya está en el carrito');
			return;
		}
		cart.add({
			beatId: beat.id,
			beatName: beat.name,
			imageUrl: beat.imageUrl ?? '',
			licenseName: lic.name,
			licenseIndex: cheapest,
			priceMXN: lic.priceMXN,
			priceUSD: lic.priceUSD,
		});

		// Card pop animation
		cartPop = true;
		setTimeout(() => { cartPop = false; }, 400);

		// Flying thumbnail to cart
		if (beat.imageUrl) {
			const card = cardEl?.getBoundingClientRect();
			const cartIcon = document.querySelector('.icon-btn[title="Carrito"], .bottom-nav-item[href="/cart"]');
			if (card && cartIcon) {
				const cartRect = cartIcon.getBoundingClientRect();
				const startX = card.left + card.width / 2 - 24;
				const startY = card.top + card.height / 3 - 24;
				const dx = cartRect.left + cartRect.width / 2 - 24 - startX;
				const dy = cartRect.top + cartRect.height / 2 - 24 - startY;
				flyingThumb = { x: startX, y: startY, src: beat.imageUrl };
				// Set CSS custom properties for the flight path
				requestAnimationFrame(() => {
					const el = document.querySelector('.flying-thumb') as HTMLElement;
					if (el) {
						el.style.setProperty('--fly-dx', `${dx}px`);
						el.style.setProperty('--fly-dy', `${dy}px`);
					}
				});
				setTimeout(() => { flyingThumb = null; }, 700);
			}
		}

		analytics.track('cart', 'add', { lbl: beat.id, val: lic.priceMXN, meta: lic.name });
		toast.show(`🛒 ${lic.name} agregado`);
	}
</script>

<div
	class="beat-card"
	class:has-shimmer={hasShimmer}
	class:play-pulse={playing}
	class:cart-pop={cartPop}
	class:lazy-placeholder={lazy && !isVisible}
	use:tilt={{ max: 6 }}
	onclick={() => onclick?.(beat)}
	onmouseenter={() => {
		// Preload audio metadata on hover for instant playback
		const url = beat.audioUrl || beat.previewUrl;
		if (url) {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'media';
			link.href = url;
			if (!document.querySelector(`link[href="${url}"]`)) {
				document.head.appendChild(link);
			}
		}
	}}
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick?.(beat); } }}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	role="button"
	tabindex="0"
	style={inlineCSS || undefined}
	bind:this={cardEl}
>
	<!-- Shimmer overlay (on outer, covers glow area) -->
	{#if hasShimmer}
		<div class="shimmer-overlay" style={shimmerInlineCSS}></div>
	{/if}

	<!-- Featured badge (on outer, above inner) -->
	{#if beat.featured}
		<span class="featured-badge">TOP</span>
	{/if}

	<div class="beat-card-inner">
		<!-- Now playing indicator -->
		{#if isCurrentBeat}
			<div class="now-playing-indicator">
				<span class="eq-bar"></span>
				<span class="eq-bar"></span>
				<span class="eq-bar"></span>
				<span class="eq-bar"></span>
			</div>
		{/if}

		<!-- Cover -->
		<div class="beat-cover">
			{#if isVisible}
				{#if beat.imageUrl}
					<img src={beat.imageUrl} alt={beat.name} loading="lazy" decoding="async" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={imageCSS || undefined} />
				{:else}
					<div class="beat-cover-placeholder" style="background: {genreGradient(beat.genre)}">
						<span class="placeholder-genre">{beat.genre}</span>
					</div>
				{/if}
			{:else}
				<div class="beat-cover-placeholder" style="background: {genreGradient(beat.genre)}">
					<span class="placeholder-genre">{beat.genre}</span>
				</div>
			{/if}

			<!-- Play overlay -->
			<button class="beat-play" onclick={handlePlay} aria-label="Reproducir {beat.name}">
				<Icon name="play" size={20} />
			</button>

			<!-- Wishlist -->
			<button class="beat-wish" class:active={inWishlist} onclick={handleWishlist} aria-label="{inWishlist ? 'Quitar de' : 'Añadir a'} favoritos" aria-pressed={inWishlist}>
				<Icon name="heart" size={14} filled={inWishlist} />
				{#if justLiked}
					<span class="wish-burst"></span>
					<span class="heart-particle p1">❤️</span>
					<span class="heart-particle p2">💖</span>
					<span class="heart-particle p3">💗</span>
					<span class="heart-particle p4">❤️</span>
					<span class="heart-particle p5">💕</span>
				{/if}
			</button>

			<!-- Quick add to cart -->
			<button class="beat-cart-btn" onclick={handleAddToCart} aria-label="Agregar al carrito" title="Agregar al carrito">
				<Icon name="shoppingCart" size={14} />
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

			<!-- Waveform bars when playing — organic heights with gradient -->
			{#if isCurrentBeat}
				<div class="card-waveform">
					{#each Array(16) as _, i}
						{@const t = i / 15}
						{@const seed = (beat.name?.charCodeAt(i % (beat.name.length || 1)) ?? 0) * 7}
						{@const h = 18 + 15 * Math.sin(t * Math.PI * 2 + seed * 0.1) + (seed % 35)}
						<div class="wave-bar" style="--delay: {i * 0.06}s; --h: {h}%"></div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div class="beat-info" style={layoutCSS || undefined}>
			<div class="beat-title" style={titleCSS || undefined}>{beat.name}</div>
			<div class="beat-meta">
				<span>{beat.bpm} BPM</span>
				<span class="meta-dot">·</span>
				<span>{beat.key}</span>
				{#if beatLikeCount > 0}
					<span class="meta-dot">·</span>
					<span class="meta-likes">❤️ {beatLikeCount}</span>
				{/if}
			</div>
			{#if beat.tags?.length}
				<div class="beat-tags">
					{#each beat.tags.slice(0, 3) as tag}
						<span class="beat-tag" style={tagCSS || undefined}>{tag}</span>
					{/each}
				</div>
			{/if}
			<div class="beat-price" style={priceCSS || undefined}>
				<span class="price-from">{labelFrom}</span>
				<span class="price-amount">${lowestPrice(beat)}</span>
				{#if beat.licenses?.length > 1}
					<span class="price-lic-count">· {beat.licenses.length} licencias</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Swipe gesture overlays (mobile) -->
	{#if swiping && swipeDeltaX !== 0}
		{#if swipeAction === 'like'}
			<div class="swipe-overlay swipe-like">
				<span class="swipe-icon">❤️</span>
			</div>
		{:else if swipeAction === 'cart'}
			<div class="swipe-overlay swipe-cart">
				<span class="swipe-icon">🛒</span>
			</div>
		{/if}
	{/if}
</div>

{#if flyingThumb}
	<img
		class="flying-thumb"
		src={flyingThumb.src}
		alt=""
		style="left: {flyingThumb.x}px; top: {flyingThumb.y}px"
	/>
{/if}

<style>
	/* ── Outer card (glow, transforms, animations) ── */
	.beat-card {
		position: relative;
		border-radius: var(--card-radius);
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
		--hover-scale: 1;
		--hover-translate-y: -3px;
		touch-action: pan-y;
	}

	/* Lazy loading placeholder state */
	.beat-card.lazy-placeholder .beat-card-inner {
		background: var(--surface2);
	}

	.beat-card.lazy-placeholder .beat-info {
		opacity: 0.5;
	}

	/* ── Inner card (background, border, shadow, content) ── */
	.beat-card-inner {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
		transition: border-color var(--duration-normal), box-shadow var(--duration-normal);
		box-shadow: var(--card-shadow);
	}

	.beat-card:hover .beat-card-inner {
		border-color: var(--hover-border-color, rgba(var(--accent-rgb), 0.25));
		box-shadow:
			var(--card-shadow-hover),
			0 0 0 1px rgba(var(--accent-rgb), 0.15),
			0 8px 32px rgba(0,0,0,0.3),
			inset 0 0 20px rgba(var(--accent-rgb), 0.03);
		backdrop-filter: blur(8px);
	}

	.beat-card:hover {
		transform: scale(var(--hover-scale)) translateY(var(--hover-translate-y));
		filter: brightness(var(--hover-brightness, 1)) saturate(var(--hover-saturate, 1)) hue-rotate(var(--hover-hue-rotate, 0deg)) blur(0px) !important;
		opacity: var(--hover-opacity, 1);
		transition-duration: var(--hover-transition, var(--duration-normal));
	}

	/* Tint overlay on inner (CATALOG-style accent wash) */
	.beat-card-inner::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.4s;
		background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.3), transparent);
		mix-blend-mode: overlay;
		border-radius: inherit;
	}

	.beat-card:hover .beat-card-inner::after {
		opacity: 0.15;
	}

	/* ── Play Pulse Ring ── */
	.beat-card.play-pulse {
		animation: playPulseRing 0.6s ease-out !important;
	}

	@keyframes playPulseRing {
		0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
		70% { box-shadow: 0 0 0 12px rgba(var(--accent-rgb), 0); }
		100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
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

	/* Now Playing Indicator */
	.now-playing-indicator {
		position: absolute;
		bottom: var(--space-3);
		left: var(--space-3);
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 16px;
		z-index: 3;
	}

	.eq-bar {
		width: 3px;
		background: var(--accent);
		border-radius: 1px;
		animation: eqBounce 0.8s ease-in-out infinite alternate;
	}

	.eq-bar:nth-child(1) { height: 60%; animation-delay: 0s; }
	.eq-bar:nth-child(2) { height: 100%; animation-delay: 0.15s; }
	.eq-bar:nth-child(3) { height: 40%; animation-delay: 0.3s; }
	.eq-bar:nth-child(4) { height: 80%; animation-delay: 0.45s; }

	@keyframes eqBounce {
		0% { transform: scaleY(0.3); }
		100% { transform: scaleY(1); }
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
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: var(--shimmer-opacity, 1);
		background: linear-gradient(
			105deg,
			transparent 20%,
			var(--shimmer-color, rgba(255, 255, 255, 0.08)) 35%,
			var(--shimmer-color, rgba(255, 255, 255, 0.2)) 50%,
			var(--shimmer-color, rgba(255, 255, 255, 0.08)) 65%,
			transparent 80%
		);
		transform: translateX(-100%);
		animation: cardShimmer var(--shimmer-duration, 2.5s) ease-in-out infinite;
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
		transform: scale(var(--image-hover-zoom, 1.05));
	}

	.beat-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.placeholder-genre {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
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
		background: linear-gradient(to top, rgba(var(--accent-rgb), 0.9), rgba(var(--accent-rgb), 0.3));
		border-radius: 2px 2px 0 0;
		height: 30%;
		animation: waveAnim 0.9s ease-in-out var(--delay, 0s) infinite alternate;
		filter: drop-shadow(0 0 2px rgba(var(--accent-rgb), 0.3));
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
		transform: translate(-50%, -50%) scale(0.85);
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
		opacity: 0.35;
		transition: all var(--duration-normal) var(--ease-out);
		box-shadow: var(--glow-accent);
		z-index: 2;
	}

	.beat-card:hover .beat-play,
	.beat-card:focus-within .beat-play {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}

	/* Always show action buttons on touch devices */
	@media (hover: none), (max-width: 640px) {
		.beat-play,
		.beat-wish,
		.beat-cart-btn {
			opacity: 1 !important;
		}
		.beat-play {
			transform: translate(-50%, -50%) scale(1) !important;
			width: 48px;
			height: 48px;
		}
		.beat-wish,
		.beat-cart-btn {
			width: 36px;
			height: 36px;
		}
		.beat-wish {
			top: var(--space-2);
			right: var(--space-2);
		}
		.beat-cart-btn {
			top: calc(var(--space-2) + 40px);
			right: var(--space-2);
		}
	}

	/* Mobile-specific beat card refinements */
	@media (max-width: 640px) {
		.beat-cover {
			aspect-ratio: 16/10;
		}

		.beat-info {
			padding: var(--space-3) var(--space-4);
		}

		.beat-title {
			font-size: var(--text-lg);
			white-space: normal;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			display: -webkit-box;
			-webkit-box-orient: vertical;
		}

		.beat-price {
			margin-top: var(--space-2);
		}

		.price-amount {
			font-size: var(--text-xl);
		}
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
	.beat-card:focus-within .beat-wish,
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

	/* Wishlist burst effect */
	.wish-burst {
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(var(--accent-rgb), 0.4), transparent 70%);
		animation: wishBurst 0.5s ease-out forwards;
		pointer-events: none;
	}

	@keyframes wishBurst {
		0% { transform: scale(0.5); opacity: 1; }
		100% { transform: scale(2.5); opacity: 0; }
	}

	/* Quick add to cart */
	.beat-cart-btn {
		position: absolute;
		top: calc(var(--space-3) + 40px);
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

	.beat-card:hover .beat-cart-btn,
	.beat-card:focus-within .beat-cart-btn {
		opacity: 1;
	}

	.beat-cart-btn:hover {
		background: var(--surface-hover);
		color: var(--accent);
		transform: scale(1.1);
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

	.meta-likes {
		color: #ef4444;
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

	.price-lic-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}

	/* ── Cart Pop Animation ── */
	.beat-card.cart-pop {
		animation: cartPopAnim 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes cartPopAnim {
		0% { transform: scale(1); }
		40% { transform: scale(1.06); }
		100% { transform: scale(1); }
	}

	/* ── Heart Particles ── */
	.heart-particle {
		position: absolute;
		font-size: 12px;
		pointer-events: none;
		z-index: 10;
		animation: heartFly 0.6s ease-out forwards;
	}

	.heart-particle.p1 { animation-delay: 0s; --hx: -18px; --hy: -24px; --hr: -25deg; }
	.heart-particle.p2 { animation-delay: 0.05s; --hx: 14px; --hy: -28px; --hr: 20deg; }
	.heart-particle.p3 { animation-delay: 0.1s; --hx: -10px; --hy: -18px; --hr: -15deg; }
	.heart-particle.p4 { animation-delay: 0.08s; --hx: 20px; --hy: -16px; --hr: 30deg; }
	.heart-particle.p5 { animation-delay: 0.12s; --hx: -6px; --hy: -30px; --hr: -10deg; }

	@keyframes heartFly {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(0.5);
			opacity: 1;
		}
		60% {
			opacity: 1;
		}
		100% {
			transform: translate(var(--hx), var(--hy)) rotate(var(--hr)) scale(1.2);
			opacity: 0;
		}
	}

	/* ── Flying Thumbnail ── */
	.flying-thumb {
		position: fixed;
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		object-fit: cover;
		z-index: 9999;
		pointer-events: none;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		animation: flyToCart 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}

	@keyframes flyToCart {
		0% {
			transform: translate(0, 0) scale(1) rotate(0deg);
			opacity: 1;
		}
		50% {
			transform: translate(60px, -120px) scale(0.7) rotate(10deg);
			opacity: 0.9;
		}
		100% {
			transform: translate(var(--fly-dx, 200px), var(--fly-dy, -400px)) scale(0.2) rotate(20deg);
			opacity: 0;
		}
	}

	/* ── Swipe Gesture Overlays ── */
	.swipe-overlay {
		position: absolute;
		inset: 0;
		border-radius: var(--card-radius);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		pointer-events: none;
		transition: opacity 0.15s;
	}

	.swipe-like {
		background: rgba(239, 68, 68, 0.15);
		border: 2px solid rgba(239, 68, 68, 0.4);
	}

	.swipe-cart {
		background: rgba(var(--accent-rgb), 0.15);
		border: 2px solid rgba(var(--accent-rgb), 0.4);
	}

	.swipe-icon {
		font-size: 2rem;
		animation: swipePop 0.2s ease-out;
	}

	@keyframes swipePop {
		0% { transform: scale(0.5); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}
</style>
