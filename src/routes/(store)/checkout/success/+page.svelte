<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { cart, settings, analytics } from '$lib/stores';
	import Icon from '$lib/components/Icon.svelte';

	let s = $derived($settings.data);
	let sessionId = $derived(page.url.searchParams.get('session_id'));
	let orderStatus = $state<'loading' | 'success' | 'error'>('loading');
	let orderItems = $state<Array<{
		beatId: string;
		beatName: string;
		licenseName: string;
		downloadUrl?: string;
		downloading?: boolean;
	}>>([]);
	let customerName = $state('');
	let downloadingZip = $state(false);

	onMount(async () => {
		// Clear cart on successful payment
		cart.clear();

		if (sessionId) {
			analytics.track('checkout', 'success', { lbl: sessionId });

			// Fetch order details from Firebase
			try {
				const resp = await fetch(
					`https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/paidOrders/${sessionId}.json`
				);
				if (resp.ok) {
					const data = await resp.json();
					if (data?.items) {
						orderItems = data.items.map((i: {
							beatId?: string;
							beatName?: string;
							licenseName?: string;
						}) => ({
							beatId: i.beatId || '',
							beatName: i.beatName || 'Beat',
							licenseName: i.licenseName || 'Licencia',
						}));
					}
					if (data?.customerName) {
						customerName = data.customerName;
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

	async function handleDownload(item: typeof orderItems[0]) {
		if (!item.beatId || !sessionId) return;
		item.downloading = true;

		try {
			// Use secure download endpoint — serves file directly
			const url = `/api/download/${sessionId}/${item.beatId}`;
			const a = document.createElement('a');
			a.href = url;
			a.download = `${item.beatName}.mp3`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			item.downloadUrl = url;
			analytics.track('download', 'start', { lbl: item.beatId });
		} catch {
			alert('Error al descargar. Intenta de nuevo.');
		} finally {
			item.downloading = false;
		}
	}

	async function handleDownloadZip(beatId: string, beatName: string) {
		if (!beatId || !sessionId) return;
		downloadingZip = true;

		try {
			const url = `/api/download/${sessionId}/${beatId}/zip`;
			const a = document.createElement('a');
			a.href = url;
			a.download = `${beatName}_dacewav.zip`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			analytics.track('download', 'zip', { lbl: beatId });
		} catch {
			alert('Error al descargar el paquete. Intenta de nuevo.');
		} finally {
			downloadingZip = false;
		}
	}
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
			{#if customerName}
				<p class="success-greeting">Gracias, {customerName}</p>
			{/if}
			<p class="success-subtitle">
				Tu compra ha sido procesada correctamente. Descargá tus archivos ahora — también recibirás un email con los links y tu contrato.
			</p>

			{#if orderItems.length > 0}
				<div class="order-items">
					<h2 class="order-title">Tu pedido</h2>
					{#each orderItems as item, i}
						<div class="order-item">
							<div class="order-item-info">
								<span class="order-beat">{item.beatName}</span>
								<span class="order-license">{item.licenseName}</span>
							</div>
							<button
								class="download-btn"
								class:downloaded={!!item.downloadUrl}
								onclick={() => handleDownload(item)}
								disabled={item.downloading}
							>
								{#if item.downloading}
									<span class="dl-spinner"></span>
								{:else if item.downloadUrl}
									<Icon name="check" size={14} />
									Descargado
								{:else}
									<Icon name="export" size={14} />
									Descargar
								{/if}
							</button>
						</div>
					{/each}

					{#if orderItems.length > 0}
						<button
							class="zip-btn"
							onclick={() => handleDownloadZip(orderItems[0].beatId, orderItems[0].beatName)}
							disabled={downloadingZip}
						>
							{#if downloadingZip}
								<span class="dl-spinner"></span>
								Preparando paquete...
							{:else}
								📦 Descargar todo (ZIP) — Beat + Contrato
							{/if}
						</button>
					{/if}
				</div>
			{/if}

			<div class="success-info">
				<div class="info-item">
					<span class="info-icon">📧</span>
					<span>Revisá tu email para el contrato de licencia PDF</span>
				</div>
				<div class="info-item">
					<span class="info-icon">💾</span>
					<span>Guardá los archivos — el link de descarga es por tiempo limitado</span>
				</div>
			</div>

			<div class="success-actions">
				<a href="/" class="action-btn primary">Volver al catálogo</a>
				<a href="/account/orders" class="action-btn secondary">Mis órdenes</a>
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
		margin-bottom: var(--space-2);
	}

	.success-greeting {
		font-size: var(--text-base);
		color: var(--accent);
		font-weight: 600;
		margin-bottom: var(--space-3);
	}

	.success-subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	/* ── Order items ── */
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
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--border);
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.order-item-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.order-beat {
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.order-license {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
	}

	.download-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
		white-space: nowrap;
		min-height: 36px;
	}

	.download-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	.download-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.download-btn.downloaded {
		background: rgba(34, 197, 94, 0.15);
		color: #22c55e;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.dl-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.zip-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-3) var(--space-4);
		margin-top: var(--space-3);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
		min-height: 40px;
	}

	.zip-btn:hover:not(:disabled) {
		background: rgba(var(--accent-rgb), 0.2);
		box-shadow: var(--glow-sm);
	}

	.zip-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* ── Info box ── */
	.success-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
		padding: var(--space-4);
		background: var(--surface2);
		border-radius: var(--radius-lg);
		text-align: left;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.info-icon {
		font-size: 1.2rem;
		flex-shrink: 0;
	}

	/* ── Actions ── */
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
