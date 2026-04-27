<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart, cartCount, cartTotalMXN, cartTotalUSD, settings, analytics } from '$lib/stores';
	import type { CartItem } from '$lib/stores/cart';
	import { Icon, EmptyState } from '$lib/components';

	let s = $derived($settings.data);
	let items = $derived($cart);
	let count = $derived($cartCount);
	let totalMXN = $derived($cartTotalMXN);
	let totalUSD = $derived($cartTotalUSD);

	let checkingOut = $state(false);
	let checkoutError = $state('');

	// Discount code state
	let discountCode = $state('');
	let discountLoading = $state(false);
	let discountError = $state('');
	let appliedDiscount = $state<{ code: string; type: 'percent' | 'fixed'; amount: number } | null>(null);

	function removeItem(item: CartItem) {
		cart.remove(item.beatId, item.licenseIndex);
		analytics.track('cart', 'remove', { lbl: item.beatId, meta: item.licenseName });
	}

	function removeDiscount() {
		discountCode = '';
		appliedDiscount = null;
		discountError = '';
	}

	function formatDiscount(d: { type: 'percent' | 'fixed'; amount: number }): string {
		if (d.type === 'percent') return `${d.amount}% OFF`;
		return `$${d.amount} USD OFF`;
	}

	async function handleCheckout() {
		if (count === 0) return;
		checkingOut = true;
		checkoutError = '';

		try {
			const body: Record<string, unknown> = { items };
			if (discountCode.trim()) {
				body.discountCode = discountCode.trim();
			}

			const resp = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const data = await resp.json() as { ok?: boolean; url?: string; error?: string };

			if (!resp.ok || !data.ok || !data.url) {
				checkoutError = data.error || 'Error al iniciar el pago';
				return;
			}

			analytics.track('checkout', 'start', { val: totalMXN });
			// Redirect to Stripe Checkout
			window.location.href = data.url;
		} catch {
			checkoutError = 'Error de conexión. Intenta de nuevo.';
		} finally {
			checkingOut = false;
		}
	}

	$effect(() => {
		analytics.track('cart', 'view', { val: count });
	});
</script>

<svelte:head>
	<title>Carrito — {s?.brand?.name ?? 'DACEWAV'}</title>
</svelte:head>

<div class="cart-page">
	<h1 class="cart-title">Carrito</h1>

	{#if count === 0}
		<EmptyState
			icon="🛒"
			title="Tu carrito está vacío"
			subtitle="Agrega beats desde el catálogo para empezar tu compra"
		/>
		<a href="/" class="cart-back">Volver al catálogo</a>
	{:else}
		<div class="cart-layout">
			<!-- Items list -->
			<div class="cart-items">
				{#each items as item (item.beatId + '-' + item.licenseIndex)}
					<div class="cart-item">
						<div class="item-image">
							{#if item.imageUrl}
								<img src={item.imageUrl} alt={item.beatName} />
							{:else}
								<div class="item-image-placeholder">
									<Icon name="music" size={24} />
								</div>
							{/if}
						</div>
						<div class="item-info">
							<a href="/beat/{item.beatId}" class="item-name">{item.beatName}</a>
							<span class="item-license">{item.licenseName}</span>
						</div>
						<div class="item-price">
							<span class="price-mxn">${item.priceMXN} MXN</span>
							<span class="price-usd">${item.priceUSD} USD</span>
						</div>
						<button
							class="item-remove"
							onclick={() => removeItem(item)}
							aria-label="Quitar del carrito"
						>
							<Icon name="close" size={16} />
						</button>
					</div>
				{/each}
			</div>

			<!-- Summary -->
			<div class="cart-summary">
				<h2 class="summary-title">Resumen</h2>
				<div class="summary-row">
					<span>Items</span>
					<span>{count}</span>
				</div>
				<div class="summary-divider"></div>

				<!-- Discount code -->
				<div class="discount-section">
					{#if appliedDiscount}
						<div class="discount-applied">
							<span class="discount-badge">🏷️ {formatDiscount(appliedDiscount)}</span>
							<span class="discount-code-label">{appliedDiscount.code}</span>
							<button class="discount-remove" onclick={removeDiscount}>✕</button>
						</div>
					{:else}
						<div class="discount-input-row">
							<input
								type="text"
								class="discount-input"
								placeholder="Código de descuento"
								bind:value={discountCode}
								disabled={discountLoading}
								maxlength={30}
							/>
						</div>
						{#if discountError}
							<p class="discount-error">{discountError}</p>
						{/if}
					{/if}
				</div>

				<div class="summary-row summary-total">
					<span>Total</span>
					<div class="total-prices">
						<span class="total-mxn">${totalMXN} MXN</span>
						<span class="total-usd">${totalUSD} USD</span>
					</div>
				</div>

				{#if checkoutError}
					<p class="checkout-error">{checkoutError}</p>
				{/if}

				<button
					class="checkout-btn"
					onclick={handleCheckout}
					disabled={checkingOut}
				>
					{#if checkingOut}
						Procesando...
					{:else}
						Pagar con Stripe
					{/if}
				</button>

				<button class="clear-btn" onclick={() => cart.clear()}>
					Vaciar carrito
				</button>

				<p class="summary-note">
					Pago seguro vía Stripe. Recibe tus archivos al instante.
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.cart-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.cart-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-8);
	}

	.cart-back {
		display: inline-block;
		margin-top: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--accent);
		text-decoration: none;
	}

	.cart-layout {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: var(--space-8);
		align-items: start;
	}

	/* ── Items ── */
	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.cart-item {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		transition: border-color var(--duration-fast);
	}

	.cart-item:hover {
		border-color: var(--border-hover-accent);
	}

	.item-image {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-md);
		overflow: hidden;
		flex-shrink: 0;
		background: var(--surface2);
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.item-info {
		flex: 1;
		min-width: 0;
	}

	.item-name {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-name:hover {
		color: var(--accent);
	}

	.item-license {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.item-price {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
		flex-shrink: 0;
	}

	.price-mxn {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--accent);
	}

	.price-usd {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.item-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		flex-shrink: 0;
		transition: all var(--duration-fast);
	}

	.item-remove:hover {
		border-color: #ef4444;
		color: #ef4444;
		background: rgba(239, 68, 68, 0.08);
	}

	/* ── Summary ── */
	.cart-summary {
		position: sticky;
		top: calc(var(--space-6) + 60px);
		padding: var(--space-6);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
	}

	.summary-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		padding: var(--space-2) 0;
	}

	.summary-divider {
		height: 1px;
		background: var(--border);
		margin: var(--space-3) 0;
	}

	.summary-total {
		font-weight: 700;
		color: var(--text);
		font-size: var(--text-base);
	}

	.total-prices {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.total-mxn {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--accent);
	}

	.total-usd {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.checkout-error {
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: #ef4444;
	}

	.checkout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-top: var(--space-5);
		padding: var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		min-height: 52px;
		transition: all var(--duration-normal) var(--ease-out);
	}

	.checkout-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--glow-accent);
		transform: translateY(-2px);
	}

	.checkout-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.clear-btn {
		display: block;
		width: 100%;
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.clear-btn:hover {
		border-color: #ef4444;
		color: #ef4444;
	}

	.summary-note {
		margin-top: var(--space-4);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-align: center;
		line-height: var(--leading-relaxed);
	}

	/* ── Discount ── */
	.discount-section {
		margin: var(--space-3) 0;
	}

	.discount-input-row {
		display: flex;
		gap: var(--space-2);
	}

	.discount-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		outline: none;
	}

	.discount-input:focus {
		border-color: var(--accent);
	}

	.discount-input:disabled {
		opacity: 0.5;
	}

	.discount-applied {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: rgba(34, 197, 94, 0.08);
		border: 1px solid rgba(34, 197, 94, 0.2);
		border-radius: var(--radius-sm);
	}

	.discount-badge {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 700;
		color: #22c55e;
	}

	.discount-code-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		flex: 1;
	}

	.discount-remove {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1);
	}

	.discount-remove:hover {
		color: #ef4444;
	}

	.discount-error {
		margin-top: var(--space-1);
		font-size: var(--text-2xs);
		color: #ef4444;
		font-family: var(--font-mono);
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.cart-layout {
			grid-template-columns: 1fr;
		}

		.cart-summary {
			position: static;
		}
	}

	@media (max-width: 480px) {
		.cart-item {
			flex-wrap: wrap;
			gap: var(--space-3);
		}

		.item-price {
			align-items: flex-start;
		}
	}
</style>
