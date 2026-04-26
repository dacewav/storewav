<script lang="ts">
	import { settings } from '$lib/stores';
	import Icon from '$lib/components/Icon.svelte';

	let s = $derived($settings.data);
</script>

<svelte:head>
	<title>Pago cancelado — {s?.brand?.name ?? 'DACEWAV'}</title>
</svelte:head>

<div class="cancel-page">
	<div class="cancel-card">
		<div class="cancel-icon">😔</div>
		<h1 class="cancel-title">Pago cancelado</h1>
		<p class="cancel-subtitle">
			No se realizó ningún cargo. Tu carrito sigue intacto — podés completar la compra cuando quieras.
		</p>
		<div class="cancel-actions">
			<a href="/cart" class="action-btn primary">
				<Icon name="shoppingCart" size={16} />
				Volver al carrito
			</a>
			<a href="/" class="action-btn secondary">
				Explorar beats
			</a>
		</div>
	</div>
</div>

<style>
	.cancel-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		min-height: 60vh;
	}

	.cancel-card {
		width: 100%;
		text-align: center;
		padding: var(--space-8);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
	}

	.cancel-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}

	.cancel-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-3);
	}

	.cancel-subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	.cancel-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: center;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
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
</style>
