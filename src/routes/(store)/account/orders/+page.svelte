<script lang="ts">
	import { settings, analytics } from '$lib/stores';
	import Icon from '$lib/components/Icon.svelte';

	let s = $derived($settings.data);

	let email = $state('');
	let searching = $state(false);
	let orders = $state<Array<{
		sessionId: string;
		items: Array<{
			beatId: string;
			beatName: string;
			licenseName: string;
			priceMXN: number;
			priceUSD: number;
		}>;
		paidAt: number;
		totalMXN: number;
		totalUSD: number;
	}>>([]);
	let searched = $state(false);
	let error = $state('');

	const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

	async function searchOrders() {
		if (!email.trim()) return;
		searching = true;
		error = '';
		orders = [];
		searched = false;

		try {
			const resp = await fetch(
				`${FIREBASE_DB}/paidOrders.json?orderBy="customerEmail"&equalTo="${encodeURIComponent(email.trim())}"`
			);

			if (!resp.ok) {
				error = 'Error al buscar órdenes';
				return;
			}

			const data = await resp.json() as Record<string, {
				sessionId?: string;
				items?: Array<{
					beatId: string;
					beatName: string;
					licenseName: string;
					priceMXN: number;
					priceUSD: number;
				}>;
				paidAt?: number;
				customerEmail?: string;
			}> | null;

			if (data) {
				orders = Object.entries(data)
					.filter(([, o]) => o.customerEmail?.toLowerCase() === email.trim().toLowerCase())
					.map(([id, o]) => ({
						sessionId: o.sessionId || id,
						items: o.items || [],
						paidAt: o.paidAt || 0,
						totalMXN: (o.items || []).reduce((s, i) => s + i.priceMXN, 0),
						totalUSD: (o.items || []).reduce((s, i) => s + i.priceUSD, 0),
					}))
					.sort((a, b) => b.paidAt - a.paidAt);
			}

			searched = true;
			analytics.track('orders', 'search', { lbl: email.trim() });
		} catch {
			error = 'Error de conexión. Intenta de nuevo.';
		} finally {
			searching = false;
		}
	}

	function formatDate(ts: number): string {
		if (!ts) return '';
		return new Date(ts).toLocaleDateString('es-MX', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function downloadBeat(orderId: string, beatId: string, beatName: string) {
		// Use the secure download endpoint
		const url = `/api/download/${orderId}/${beatId}`;
		const a = document.createElement('a');
		a.href = url;
		a.download = `${beatName}.mp3`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		analytics.track('download', 'orders_page', { lbl: beatId });
	}
</script>

<svelte:head>
	<title>Mis órdenes — {s?.brand?.name ?? 'DACEWAV'}</title>
</svelte:head>

<div class="orders-page">
	<h1 class="page-title">Mis órdenes</h1>
	<p class="page-sub">Ingresá tu email para ver tus compras y descargar tus beats.</p>

	<form class="search-form" onsubmit={(e) => { e.preventDefault(); searchOrders(); }}>
		<div class="search-row">
			<input
				type="email"
				class="search-input"
				placeholder="tu@email.com"
				bind:value={email}
				required
			/>
			<button class="search-btn" type="submit" disabled={searching}>
				{#if searching}
					Buscando...
				{:else}
					Buscar órdenes
				{/if}
			</button>
		</div>
	</form>

	{#if error}
		<div class="error-msg">{error}</div>
	{/if}

	{#if searched && orders.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📦</div>
			<h2>Sin órdenes</h2>
			<p>No encontramos compras con ese email. ¿Usaste otro email al pagar?</p>
		</div>
	{/if}

	{#if orders.length > 0}
		<div class="orders-list">
			{#each orders as order}
				<div class="order-card">
					<div class="order-header">
						<div class="order-meta">
							<span class="order-id">#{order.sessionId.slice(0, 8).toUpperCase()}</span>
							<span class="order-date">{formatDate(order.paidAt)}</span>
						</div>
						<div class="order-total">
							<span class="total-mxn">${order.totalMXN} MXN</span>
							<span class="total-usd">${order.totalUSD} USD</span>
						</div>
					</div>

					<div class="order-items">
						{#each order.items as item}
							<div class="order-item">
								<div class="item-info">
									<span class="item-name">{item.beatName}</span>
									<span class="item-license">{item.licenseName}</span>
								</div>
								<button
									class="download-btn"
									onclick={() => downloadBeat(order.sessionId, item.beatId, item.beatName)}
								>
									<Icon name="export" size={14} />
									Descargar
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.orders-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: 720px;
		margin: 0 auto;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-2);
	}

	.page-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-8);
	}

	/* ── Search ── */
	.search-form {
		margin-bottom: var(--space-8);
	}

	.search-row {
		display: flex;
		gap: var(--space-3);
	}

	.search-input {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		outline: none;
		transition: border-color var(--duration-fast);
		min-height: 48px;
	}

	.search-input:focus {
		border-color: var(--accent);
	}

	.search-btn {
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
		min-height: 48px;
		white-space: nowrap;
	}

	.search-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	.search-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-msg {
		padding: var(--space-3) var(--space-4);
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		color: #ef4444;
		font-size: var(--text-sm);
		margin-bottom: var(--space-6);
	}

	/* ── Empty state ── */
	.empty-state {
		text-align: center;
		padding: var(--space-12) var(--space-4);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}

	.empty-state h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		color: var(--text);
		margin-bottom: var(--space-2);
	}

	.empty-state p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	/* ── Orders ── */
	.orders-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.order-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--border);
		background: var(--surface2);
	}

	.order-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.order-id {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		letter-spacing: 0.06em;
	}

	.order-date {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.order-total {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.total-mxn {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--accent);
	}

	.total-usd {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.order-items {
		padding: var(--space-3) var(--space-5);
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

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.item-name {
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-license {
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

	.download-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	@media (max-width: 600px) {
		.search-row {
			flex-direction: column;
		}

		.order-header {
			flex-direction: column;
			gap: var(--space-2);
			align-items: flex-start;
		}

		.order-total {
			align-items: flex-start;
		}

		.order-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
		}

		.download-btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
