<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores';

	let hash = $derived(page.params.hash);
	let s = $derived($settings.data);
	let result = $state<{ ok: boolean; verified?: boolean; contract?: { orderId?: string; beatName?: string; licenseName?: string; buyerName?: string; createdAt?: number }; error?: string } | null>(null);
	let loading = $state(true);
	let fetched = $state(false);

	onMount(async () => {
		if (!hash) { loading = false; return; }
		try {
			const resp = await fetch(`/verify/${hash}`);
			result = await resp.json();
		} catch {
			result = { ok: false, error: 'Error de conexión' };
		} finally {
			loading = false;
			fetched = true;
		}
	});
</script>

<svelte:head>
	<title>Verificar Contrato — {s?.brand?.name ?? 'DACEWAV'}</title>
</svelte:head>

<div class="verify-page">
	<h1 class="verify-title">🔍 Verificar Contrato</h1>

	{#if loading}
		<div class="verify-loading">
			<div class="spinner"></div>
			<p>Verificando...</p>
		</div>
	{:else if result?.verified}
		<div class="verify-result success">
			<h2>✅ Contrato Verificado</h2>
			<div class="verify-details">
				{#if result.contract?.orderId}
					<p><strong>Orden:</strong> {result.contract.orderId}</p>
				{/if}
				{#if result.contract?.beatName}
					<p><strong>Beat:</strong> {result.contract.beatName}</p>
				{/if}
				{#if result.contract?.licenseName}
					<p><strong>Licencia:</strong> {result.contract.licenseName}</p>
				{/if}
				{#if result.contract?.buyerName}
					<p><strong>Comprador:</strong> {result.contract.buyerName}</p>
				{/if}
				{#if result.contract?.createdAt}
					<p><strong>Fecha:</strong> {new Date(result.contract.createdAt).toLocaleDateString('es-MX')}</p>
				{/if}
			</div>
		</div>
	{:else}
		<div class="verify-result error">
			<h2>❌ No Verificado</h2>
			<p>{result?.error || 'Contrato no encontrado'}</p>
		</div>
	{/if}

	<a href="/" class="verify-back">← Volver al inicio</a>
</div>

<style>
	.verify-page {
		max-width: 600px;
		margin: 0 auto;
		padding: var(--space-8) var(--container-padding) var(--space-16);
	}

	.verify-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-6);
	}

	.verify-loading {
		text-align: center;
		padding: var(--space-10);
		color: var(--text-muted);
	}

	.spinner {
		width: 28px;
		height: 28px;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto var(--space-4);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.verify-result {
		padding: var(--space-6);
		border-radius: var(--radius-xl);
		margin-bottom: var(--space-6);
	}

	.verify-result.success {
		background: rgba(34, 197, 94, 0.06);
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.verify-result.error {
		background: rgba(239, 68, 68, 0.06);
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.verify-result h2 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.verify-details p {
		margin: var(--space-2) 0;
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.verify-details strong {
		color: var(--text);
	}

	.verify-back {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-decoration: none;
		letter-spacing: 0.04em;
		transition: color var(--duration-fast);
	}

	.verify-back:hover {
		color: var(--accent);
	}
</style>
