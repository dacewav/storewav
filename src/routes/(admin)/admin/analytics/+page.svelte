<script lang="ts">
	import { onMount } from 'svelte';

	const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

	type Order = {
		sessionId: string;
		status: string;
		items: Array<{
			beatId: string;
			beatName: string;
			licenseName: string;
			priceMXN: number;
			priceUSD: number;
		}>;
		customerEmail?: string;
		customerName?: string;
		paidAt?: number;
		createdAt: number;
		discountCode?: string;
	};

	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let period = $state<'all' | '30d' | '7d' | 'today'>('all');

	// Derived stats
	let filteredOrders = $derived.by(() => {
		const now = Date.now();
		const cutoff = period === 'today' ? now - 86400000
			: period === '7d' ? now - 7 * 86400000
			: period === '30d' ? now - 30 * 86400000
			: 0;
		return orders.filter(o => (o.paidAt || o.createdAt) >= cutoff);
	});

	let stats = $derived.by(() => {
		const ords = filteredOrders;
		const totalMXN = ords.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.priceMXN, 0), 0);
		const totalUSD = ords.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.priceUSD, 0), 0);
		const totalItems = ords.reduce((s, o) => s + o.items.length, 0);
		const uniqueCustomers = new Set(ords.map(o => o.customerEmail).filter(Boolean)).size;

		// Sales by license
		const byLicense: Record<string, { count: number; revenueMXN: number; revenueUSD: number }> = {};
		for (const o of ords) {
			for (const i of o.items) {
				if (!byLicense[i.licenseName]) {
					byLicense[i.licenseName] = { count: 0, revenueMXN: 0, revenueUSD: 0 };
				}
				byLicense[i.licenseName].count++;
				byLicense[i.licenseName].revenueMXN += i.priceMXN;
				byLicense[i.licenseName].revenueUSD += i.priceUSD;
			}
		}

		// Top beats
		const byBeat: Record<string, { count: number; revenueMXN: number; revenueUSD: number }> = {};
		for (const o of ords) {
			for (const i of o.items) {
				const key = i.beatName;
				if (!byBeat[key]) {
					byBeat[key] = { count: 0, revenueMXN: 0, revenueUSD: 0 };
				}
				byBeat[key].count++;
				byBeat[key].revenueMXN += i.priceMXN;
				byBeat[key].revenueUSD += i.priceUSD;
			}
		}

		const topBeats = Object.entries(byBeat)
			.sort((a, b) => b[1].revenueUSD - a[1].revenueUSD)
			.slice(0, 10);

		// Sales by day (last 30 days)
		const byDay: Record<string, { count: number; revenueUSD: number }> = {};
		const now = Date.now();
		for (let i = 0; i < 30; i++) {
			const day = new Date(now - i * 86400000).toISOString().split('T')[0];
			byDay[day] = { count: 0, revenueUSD: 0 };
		}
		for (const o of ords) {
			const day = new Date(o.paidAt || o.createdAt).toISOString().split('T')[0];
			if (byDay[day]) {
				byDay[day].count++;
				byDay[day].revenueUSD += o.items.reduce((s, i) => s + i.priceUSD, 0);
			}
		}

		const dailySales = Object.entries(byDay)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([date, data]) => ({ date, ...data }));

		// Discount usage
		const discountUsage = ords.filter(o => o.discountCode).length;

		return {
			totalMXN,
			totalUSD,
			totalOrders: ords.length,
			totalItems,
			uniqueCustomers,
			avgOrderUSD: ords.length > 0 ? Math.round(totalUSD / ords.length * 100) / 100 : 0,
			byLicense,
			topBeats,
			dailySales,
			discountUsage,
		};
	});

	async function loadOrders() {
		loading = true;
		try {
			const resp = await fetch(`${FIREBASE_DB}/orders.json`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					orders = Object.values(data) as Order[];
				}
			}
		} catch (e) {
			console.error('Failed to load orders:', e);
		} finally {
			loading = false;
		}
	}

	function formatCurrency(amount: number, currency: 'MXN' | 'USD') {
		return currency === 'MXN'
			? `$${amount.toLocaleString()} MXN`
			: `$${amount.toLocaleString()} USD`;
	}

	function getBarWidth(value: number, max: number): string {
		return max > 0 ? `${Math.max(2, (value / max) * 100)}%` : '2%';
	}

	onMount(loadOrders);
</script>

<svelte:head>
	<title>Ventas — Admin</title>
</svelte:head>

<div class="analytics-page">
	<div class="page-header">
		<div>
			<h1 class="page-title">📊 Ventas</h1>
			<p class="page-sub">Dashboard de revenue y métricas de tu tienda.</p>
		</div>
		<div class="period-selector">
			{#each [['today', 'Hoy'], ['7d', '7 días'], ['30d', '30 días'], ['all', 'Todo']] as [value, label]}
				<button
					class="period-btn"
					class:active={period === value}
					onclick={() => period = value}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<div class="loading">Cargando datos...</div>
	{:else}
		<!-- KPI Cards -->
		<div class="kpi-grid">
			<div class="kpi-card">
				<span class="kpi-label">Revenue</span>
				<span class="kpi-value accent">{formatCurrency(stats.totalMXN, 'MXN')}</span>
				<span class="kpi-sub">{formatCurrency(stats.totalUSD, 'USD')}</span>
			</div>
			<div class="kpi-card">
				<span class="kpi-label">Órdenes</span>
				<span class="kpi-value">{stats.totalOrders}</span>
				<span class="kpi-sub">{stats.totalItems} items</span>
			</div>
			<div class="kpi-card">
				<span class="kpi-label">Ticket promedio</span>
				<span class="kpi-value">{formatCurrency(stats.avgOrderUSD, 'USD')}</span>
			</div>
			<div class="kpi-card">
				<span class="kpi-label">Clientes únicos</span>
				<span class="kpi-value">{stats.uniqueCustomers}</span>
				{#if stats.discountUsage > 0}
					<span class="kpi-sub">{stats.discountUsage} con descuento</span>
				{/if}
			</div>
		</div>

		<!-- Revenue by License -->
		<div class="section">
			<h2 class="section-title">Revenue por licencia</h2>
			<div class="chart-bars">
				{#each Object.entries(stats.byLicense).sort((a, b) => b[1].revenueUSD - a[1].revenueUSD) as [license, data]}
					<div class="bar-row">
						<span class="bar-label">{license}</span>
						<div class="bar-track">
							<div
								class="bar-fill"
								style="width: {getBarWidth(data.revenueUSD, Math.max(...Object.values(stats.byLicense).map(v => v.revenueUSD)))}"
							></div>
						</div>
						<span class="bar-value">{formatCurrency(data.revenueUSD, 'USD')}</span>
						<span class="bar-count">{data.count} ventas</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Top Beats -->
		<div class="section">
			<h2 class="section-title">Top beats vendidos</h2>
			{#if stats.topBeats.length === 0}
				<p class="empty-text">No hay ventas aún.</p>
			{:else}
				<div class="top-list">
					{#each stats.topBeats as [beatName, data], i}
						<div class="top-item">
							<span class="top-rank">#{i + 1}</span>
							<span class="top-name">{beatName}</span>
							<span class="top-revenue">{formatCurrency(data.revenueUSD, 'USD')}</span>
							<span class="top-count">{data.count}x</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Daily Sales Chart (simple text-based) -->
		<div class="section">
			<h2 class="section-title">Ventas últimos 30 días</h2>
			<div class="daily-chart">
				{#each stats.dailySales as day}
					<div class="daily-bar" title="{day.date}: {day.count} ventas, ${day.revenueUSD} USD">
						<div
							class="daily-fill"
							style="height: {getBarWidth(day.revenueUSD, Math.max(...stats.dailySales.map(d => d.revenueUSD)))}"
						></div>
						<span class="daily-label">{day.date.slice(5)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.analytics-page {
		padding: var(--space-6);
		max-width: 900px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-6);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-1);
	}

	.page-sub {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.period-selector {
		display: flex;
		gap: var(--space-1);
	}

	.period-btn {
		padding: var(--space-1) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.period-btn.active {
		background: rgba(var(--accent-rgb), 0.15);
		border-color: var(--accent);
		color: var(--accent);
	}

	.loading {
		text-align: center;
		padding: var(--space-10);
		color: var(--text-muted);
	}

	/* ── KPI Grid ── */
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.kpi-card {
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.kpi-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.kpi-value {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--text);
	}

	.kpi-value.accent { color: var(--accent); }

	.kpi-sub {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	/* ── Sections ── */
	.section {
		margin-bottom: var(--space-8);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	/* ── Bar chart ── */
	.chart-bars {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.bar-row {
		display: grid;
		grid-template-columns: 100px 1fr 100px 60px;
		align-items: center;
		gap: var(--space-3);
	}

	.bar-label {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text);
		font-weight: 600;
	}

	.bar-track {
		height: 24px;
		background: var(--surface2);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: var(--accent);
		border-radius: var(--radius-md);
		transition: width var(--duration-normal) var(--ease-out);
		min-width: 4px;
	}

	.bar-value {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--accent);
		font-weight: 600;
		text-align: right;
	}

	.bar-count {
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-align: right;
	}

	/* ── Top list ── */
	.top-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.top-item {
		display: grid;
		grid-template-columns: 32px 1fr 100px 40px;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.top-rank {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-muted);
		font-weight: 700;
	}

	.top-name {
		font-size: var(--text-sm);
		color: var(--text);
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.top-revenue {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--accent);
		font-weight: 600;
		text-align: right;
	}

	.top-count {
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-align: right;
	}

	/* ── Daily chart ── */
	.daily-chart {
		display: flex;
		gap: 2px;
		align-items: flex-end;
		height: 120px;
		padding: var(--space-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.daily-bar {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		height: 100%;
		gap: 2px;
	}

	.daily-fill {
		width: 100%;
		background: var(--accent);
		border-radius: 2px 2px 0 0;
		min-height: 1px;
		transition: height var(--duration-normal) var(--ease-out);
	}

	.daily-label {
		font-size: 8px;
		color: var(--text-muted);
		writing-mode: vertical-lr;
		text-orientation: mixed;
		transform: rotate(180deg);
		max-height: 30px;
		overflow: hidden;
	}

	.empty-text {
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	@media (max-width: 600px) {
		.page-header { flex-direction: column; gap: var(--space-3); }
		.bar-row { grid-template-columns: 80px 1fr 80px; }
		.bar-count { display: none; }
		.top-item { grid-template-columns: 24px 1fr 80px; }
		.top-count { display: none; }
	}
</style>
