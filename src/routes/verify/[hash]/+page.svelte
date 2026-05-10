<script lang="ts">
	import { page } from '$app/state';

	let hash = $derived(page.params.hash);
	let result = $state<{ ok: boolean; verified?: boolean; contract?: { orderId?: string; beatName?: string; licenseName?: string; buyerName?: string; createdAt?: number }; error?: string } | null>(null);
	let loading = $state(true);

	$effect(() => {
		if (!hash) return;
		loading = true;
		fetch(`/verify/${hash}`)
			.then(r => r.json())
			.then(data => { result = data; loading = false; })
			.catch(() => { result = { ok: false, error: 'Error de conexión' }; loading = false; });
	});
</script>

<svelte:head>
	<title>Verificar Contrato — DACEWAV</title>
</svelte:head>

<div class="verify-page">
	<h1>🔍 Verificar Contrato</h1>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Verificando...</p>
		</div>
	{:else if result?.verified}
		<div class="result success">
			<h2>✅ Contrato Verificado</h2>
			<div class="details">
				<p><strong>Orden:</strong> {result.contract?.orderId}</p>
				<p><strong>Beat:</strong> {result.contract?.beatName}</p>
				<p><strong>Licencia:</strong> {result.contract?.licenseName}</p>
				<p><strong>Comprador:</strong> {result.contract?.buyerName}</p>
				{#if result.contract?.createdAt}
					<p><strong>Fecha:</strong> {new Date(result.contract.createdAt).toLocaleDateString('es-MX')}</p>
				{/if}
			</div>
		</div>
	{:else}
		<div class="result error">
			<h2>❌ No Verificado</h2>
			<p>{result?.error || 'Contrato no encontrado'}</p>
		</div>
	{/if}
</div>

<style>
	.verify-page {
		max-width: 600px;
		margin: 80px auto;
		padding: 0 20px;
		font-family: system-ui, -apple-system, sans-serif;
	}
	h1 { font-size: 1.5rem; margin-bottom: 24px; }
	.loading { color: #888; text-align: center; }
	.spinner { width: 24px; height: 24px; border: 3px solid #333; border-top-color: #dc2626; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.result { padding: 24px; border-radius: 12px; }
	.success { background: #0a2a1a; border: 1px solid #1a5a3a; }
	.error { background: #2a0a0a; border: 1px solid #5a1a1a; }
	.result h2 { margin: 0 0 16px; font-size: 1.2rem; }
	.details p { margin: 8px 0; color: #ccc; }
	.details strong { color: #fff; }
</style>
