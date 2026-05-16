<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart, cartCount, cartTotalMXN, cartTotalUSD, settings, analytics, allBeatsList, allKitsList } from '$lib/stores';
	import type { CartItem } from '$lib/stores/cart';
	import { Icon, EmptyState } from '$lib/components';
	import { getBeatSlug } from '$lib/slug';

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
	let discountJustApplied = $state(false);

	// Cart validation: check if beats/kits still exist and are active
	let allBeats = $derived($allBeatsList);
	let allKits = $derived($allKitsList);
	let invalidItems = $derived(
		items.filter(item => {
			if (item.beatId.startsWith('kit-')) {
				const kitId = item.beatId.slice(4);
				return !allKits.some(k => k.id === kitId);
			}
			return !allBeats.some(b => b.id === item.beatId);
		})
	);
	let hasInvalidItems = $derived(invalidItems.length > 0);

	function removeInvalidItems() {
		for (const item of invalidItems) {
			cart.remove(item.beatId, item.licenseIndex);
		}
	}

	async function applyDiscount() {
		if (!discountCode.trim()) return;
		discountLoading = true;
		discountError = '';

		try {
			const resp = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items, discountCode: discountCode.trim(), validateOnly: true }),
			});

			const data = await resp.json() as { ok?: boolean; discount?: { code: string; type: 'percent' | 'fixed'; amount: number }; error?: string };

			if (data.ok && data.discount) {
				appliedDiscount = data.discount;
				discountJustApplied = true;
				setTimeout(() => { discountJustApplied = false; }, 1500);
				analytics.track('discount', 'apply', { lbl: discountCode.trim() });
			} else {
				discountError = data.error ?? 'Código inválido';
			}
		} catch {
			discountError = 'Error de conexión';
		} finally {
			discountLoading = false;
		}
	}

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

		// Validate: remove inactive beats before checkout
		if (hasInvalidItems) {
			removeInvalidItems();
			checkoutError = 'Algunos beats ya no están disponibles y fueron removidos del carrito.';
			return;
		}

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
		>
			{#snippet action()}
				<a href="/" class="cart-back">Explorar beats</a>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="cart-layout">
			<!-- Continue shopping -->
			<a href="/" class="continue-shopping">
				← Seguir comprando
			</a>

			<!-- Items list -->
			<div class="cart-items">
				{#if hasInvalidItems}
					<div class="cart-warning">
						<Icon name="warning" size={14} />
						<span>Algunos beats ya no están disponibles. Se removerán al iniciar el pago.</span>
						<button onclick={removeInvalidItems}>Remover ahora</button>
					</div>
				{/if}
				{#each items as item (item.beatId + '-' + item.licenseIndex)}
					{@const isInvalid = item.beatId.startsWith('kit-') ? !allKits.some(k => k.id === item.beatId.slice(4)) : !allBeats.some(b => b.id === item.beatId)}
					<div class="cart-item" class:invalid={isInvalid}>
						<div class="item-image">
							{#if item.imageUrl}
								<img src={item.imageUrl} alt={item.beatName} loading="lazy" decoding="async" />
							{:else}
								<div class="item-image-placeholder">
									<Icon name="music" size={24} />
								</div>
							{/if}
						</div>
						<div class="item-info">
							<a href={item.beatId.startsWith('kit-') ? `/kit/${item.beatId.slice(4)}` : (() => { const b = allBeats.find(x => x.id === item.beatId); return b ? `/beat/${getBeatSlug(b)}` : `/beat/${item.beatId}`; })()} class="item-name" class:invalid-name={isInvalid}>{item.beatName}</a>
							<span class="item-license">{item.licenseName}</span>
							{#if isInvalid}
								<span class="item-invalid-badge">No disponible</span>
							{/if}
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
						<div class="discount-applied" class:just-applied={discountJustApplied}>
							<span class="discount-check">✓</span>
							<span class="discount-badge">🏷️ {formatDiscount(appliedDiscount)}</span>
							<span class="discount-code-label">{appliedDiscount.code}</span>
							<button class="discount-remove" onclick={removeDiscount}>✕</button>
						</div>
						{#if discountJustApplied}
							<div class="discount-savings">
								{#if appliedDiscount.type === 'percent'}
									Ahorras {appliedDiscount.amount}%
								{:else}
									Ahorras ${appliedDiscount.amount} USD
								{/if}
							</div>
						{/if}
					{:else}
						<div class="discount-input-row">
							<input
								type="text"
								class="discount-input"
								placeholder="Código de descuento"
								bind:value={discountCode}
								disabled={discountLoading}
								maxlength={30}
								onkeydown={(e) => e.key === 'Enter' && applyDiscount()}
							/>
							<button
								class="discount-apply-btn"
								onclick={applyDiscount}
								disabled={discountLoading || !discountCode.trim()}
							>
								{discountLoading ? '...' : 'Aplicar'}
							</button>
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

<!-- Sticky mobile checkout bar -->
{#if count > 0}
	<div class="mobile-checkout-bar">
		<div class="mcb-info">
			<span class="mcb-count">{count} item{count !== 1 ? 's' : ''}</span>
			<span class="mcb-total">${totalMXN} MXN</span>
		</div>
		<button class="mcb-btn" onclick={handleCheckout} disabled={checkingOut}>
			{checkingOut ? 'Procesando...' : 'Pagar con Stripe'}
		</button>
	</div>
{/if}

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
		text-decoration: none;
		transition: all var(--duration-fast);
	}

	.cart-back:hover {
		background: var(--accent);
		color: var(--bg);
		box-shadow: var(--glow-sm);
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

	.continue-shopping {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-decoration: none;
		letter-spacing: 0.04em;
		transition: color var(--duration-fast);
		margin-top: var(--space-2);
		margin-bottom: var(--space-4);
		grid-column: 1 / -1;
	}

	.continue-shopping:hover {
		color: var(--accent);
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

	/* Cart validation */
	.cart-warning {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: rgba(245, 158, 11, 0.08);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: var(--radius-lg);
		color: #f59e0b;
		font-size: var(--text-sm);
		margin-bottom: var(--space-4);
		flex-wrap: wrap;
	}

	.cart-warning button {
		margin-left: auto;
		padding: 4px 12px;
		background: rgba(245, 158, 11, 0.15);
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: var(--radius-sm);
		color: #f59e0b;
		font-size: var(--text-xs);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.cart-warning button:hover {
		background: rgba(245, 158, 11, 0.25);
	}

	.cart-item.invalid {
		opacity: 0.6;
		background: rgba(239, 68, 68, 0.03);
	}

	.item-name.invalid-name {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.item-invalid-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: #ef4444;
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.15);
		border-radius: var(--radius-sm);
		padding: 2px 8px;
		margin-top: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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

	.discount-apply-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all var(--duration-fast);
		min-height: 36px;
	}

	.discount-apply-btn:hover:not(:disabled) {
		background: var(--accent-dim);
	}

	.discount-apply-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.discount-applied {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: rgba(34, 197, 94, 0.08);
		border: 1px solid rgba(34, 197, 94, 0.2);
		border-radius: var(--radius-sm);
		transition: all var(--duration-fast);
	}

	.discount-applied.just-applied {
		animation: discountPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		border-color: #22c55e;
		box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
	}

	@keyframes discountPop {
		0% { transform: scale(0.95); opacity: 0.5; }
		50% { transform: scale(1.03); }
		100% { transform: scale(1); opacity: 1; }
	}

	.discount-check {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #22c55e;
		color: white;
		font-size: 11px;
		font-weight: 700;
		animation: checkIn 0.3s var(--ease-out) 0.1s both;
	}

	@keyframes checkIn {
		from { transform: scale(0) rotate(-45deg); opacity: 0; }
		to { transform: scale(1) rotate(0); opacity: 1; }
	}

	.discount-savings {
		margin-top: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: #22c55e;
		text-align: center;
		animation: savingsIn 0.3s var(--ease-out) 0.2s both;
	}

	@keyframes savingsIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
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

	/* ── Mobile Checkout Bar ── */
	.mobile-checkout-bar {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-nav);
		background: var(--bg);
		border-top: 1px solid var(--border);
		padding: var(--space-3) var(--container-padding);
		padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
		backdrop-filter: blur(16px);
		gap: var(--space-3);
		align-items: center;
		animation: slideUp 0.25s var(--ease-out);
	}

	@keyframes slideUp {
		from { transform: translateY(100%); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	.mcb-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2);
	}

	.mcb-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.mcb-total {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--accent);
	}

	.mcb-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		min-height: 48px;
		transition: all var(--duration-normal) var(--ease-out);
	}

	.mcb-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	.mcb-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 900px) {
		.mobile-checkout-bar {
			display: flex;
			flex-direction: column;
		}

		/* Add bottom padding so content isn't hidden behind sticky bar */
		.cart-page {
			padding-bottom: calc(var(--space-16) + 120px);
		}
	}
</style>
