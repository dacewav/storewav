<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { cart, settings, analytics } from '$lib/stores';
	import { Icon } from '$lib/components';

	let s = $derived($settings.data);
	let sessionId = $derived(page.url.searchParams.get('session_id'));
	let orderStatus = $state<'loading' | 'success' | 'error'>('loading');
	let orderItems = $state<Array<{ beatName: string; licenseName: string }>>([]);

	onMount(async () => {
		// Clear cart on successful payment
		cart.clear();

		if (sessionId) {
			analytics.track('checkout', 'success', { lbl: sessionId });

			// Try to fetch order details
			try {
				const resp = await fetch(
					`https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/paidOrders/${sessionId}.json`
				);
				if (resp.ok) {
					const data = await resp.json();
					if (data?.items) {
						orderItems = data.items.map((i: { beatName?: string; licenseName?: string }) => ({
							beatName: i.beatName || 'Beat',
							licenseName: i.licenseName || 'Licencia',
						}));
					}
				}
			} catch {
				// Non-critical
			}

			orderStatus = 'success';
		} else {
			orderStatus = 'error';
		}
	});
</script>

<svelte:head>
	<title>Pago exitoso — {s?.brand?.name ?? 'DACEWAV'}</title>
</svelte:head>

<div class="success-page">
	{#if orderStatus === 'loading'}
		<div class="success-loading">
			<div class="spinner"></div>
			<p>Verificando pago...</p>
		</div>
	{:else if orderStatus === 'success'}
		<div class="success-card">
			<div class="success-icon">✅</div>
			<h1 class="success-title">¡Pago exitoso!</h1>
			<p class="success-subtitle">
				Tu compra ha sido procesada correctamente. Recibirás los archivos por email en los próximos minutos.
			</p>

			{#if orderItems.length > 0}
				<div class="order-items">
					<h2 class="order-title">Tu pedido</h2>
					{#each orderItems as item}
						<div class="order-item">
							<span class="order-beat">{item.beatName}</span>
							<span class="order-license">{item.licenseName}</span>
						</div>
					{/each}
				</div>
			{/if}

			<div class="success-actions">
				<a href="/" class="action-btn primary">Volver al catálogo</a>
				<a href="/cart" class="action-btn secondary">Ver carrito</a>
			</div>

			<p class="success-note">
				Si no recibes el email en 10 minutos, revisa tu carpeta de spam o
				<a href="https://wa.me/{s?.brand?.whatsapp ?? ''}?text=Hola, acabo de comprar un beat y no recibí los archivos">contáctanos por WhatsApp</a>.
			</p>
		</div>
	{:else}
		<div class="success-card error">
			<div class="success-icon">⚠️</div>
			<h1 class="success-title">Error</h1>
			<p class="success-subtitle">
				No se pudo verificar tu pago. Si ya completaste el pago, contáctanos.
			</p>
			<a href="/" class="action-btn primary">Volver al catálogo</a>
		</div>
	{/if}
</div>

<style>
	.success-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		min-height: 60vh;
	}

	.success-loading {
		text-align: center;
		width: 100%;
		color: var(--text-muted);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto var(--space-4);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.success-card {
		width: 100%;
		text-align: center;
		padding: var(--space-8);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
	}

	.success-card.error {
		border-color: rgba(239, 68, 68, 0.3);
	}

	.success-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}

	.success-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-3);
	}

	.success-subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	.order-items {
		text-align: left;
		margin-bottom: var(--space-6);
		padding: var(--space-4);
		background: rgba(var(--accent-rgb), 0.04);
		border: 1px solid rgba(var(--accent-rgb), 0.15);
		border-radius: var(--radius-lg);
	}

	.order-title {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-3);
	}

	.order-item {
		display: flex;
		justify-content: space-between;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--border);
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.order-beat {
		font-weight: 600;
		color: var(--text);
	}

	.order-license {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
	}

	.success-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: center;
		margin-bottom: var(--space-6);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
		transition: all var(--duration-normal) var(--ease-out);
		min-height: 44px;
	}

	.action-btn.primary {
		background: var(--accent);
		color: var(--bg);
	}

	.action-btn.primary:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	.action-btn.secondary {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text);
	}

	.action-btn.secondary:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.success-note {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		line-height: var(--leading-relaxed);
	}

	.success-note a {
		color: var(--accent);
		text-decoration: underline;
	}
</style>
