<script lang="ts">
	import { onMount } from 'svelte';
	import { EmptyState } from '$lib/components';
	import { FIREBASE_DB } from '$lib/firebaseDb';

	type OrderItem = {
		beatId: string;
		beatName: string;
		licenseName: string;
		priceMXN: number;
		priceUSD: number;
	};

	type Order = {
		sessionId: string;
		items: OrderItem[];
		customerEmail?: string;
		customerName?: string;
		paidAt?: number;
		discountCode?: string;
	};

	type Customer = {
		email: string;
		name: string;
		orders: Order[];
		totalMXN: number;
		totalUSD: number;
		totalItems: number;
		lastPurchase: number;
		licenses: Record<string, number>;
	};

	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let search = $state('');
	let sortBy = $state<'recent' | 'spent' | 'orders'>('recent');

	let customers = $derived.by(() => {
		const map = new Map<string, Customer>();

		for (const order of orders) {
			const email = order.customerEmail?.toLowerCase() || 'unknown';
			if (!map.has(email)) {
				map.set(email, {
					email,
					name: order.customerName || '',
					orders: [],
					totalMXN: 0,
					totalUSD: 0,
					totalItems: 0,
					lastPurchase: 0,
					licenses: {},
				});
			}
			const customer = map.get(email)!;
			customer.orders.push(order);
			if (order.customerName && !customer.name) customer.name = order.customerName;
			for (const item of order.items) {
				customer.totalMXN += item.priceMXN;
				customer.totalUSD += item.priceUSD;
				customer.totalItems++;
				customer.licenses[item.licenseName] = (customer.licenses[item.licenseName] || 0) + 1;
			}
			if ((order.paidAt || 0) > customer.lastPurchase) {
				customer.lastPurchase = order.paidAt || 0;
			}
		}

		let list = Array.from(map.values());

		// Search filter
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			list = list.filter(c =>
				c.email.includes(q) ||
				c.name.toLowerCase().includes(q) ||
				c.orders.some(o => o.items.some(i => i.beatName.toLowerCase().includes(q)))
			);
		}

		// Sort
		switch (sortBy) {
			case 'recent':
				list.sort((a, b) => b.lastPurchase - a.lastPurchase);
				break;
			case 'spent':
				list.sort((a, b) => b.totalUSD - a.totalUSD);
				break;
			case 'orders':
				list.sort((a, b) => b.orders.length - a.orders.length);
				break;
		}

		return list;
	});

	let stats = $derived.by(() => {
		const totalRevenueMXN = customers.reduce((s, c) => s + c.totalMXN, 0);
		const totalRevenueUSD = customers.reduce((s, c) => s + c.totalUSD, 0);
		const repeatCustomers = customers.filter(c => c.orders.length > 1).length;
		const topLicense = Object.entries(
			customers.reduce((acc, c) => {
				for (const [lic, count] of Object.entries(c.licenses)) {
					acc[lic] = (acc[lic] || 0) + count;
				}
				return acc;
			}, {} as Record<string, number>)
		).sort((a, b) => b[1] - a[1])[0];

		return {
			totalCustomers: customers.length,
			totalRevenueMXN,
			totalRevenueUSD,
			repeatCustomers,
			topLicense: topLicense ? `${topLicense[0]} (${topLicense[1]})` : '—',
		};
	});

	// Expanded customer
	let expandedEmail = $state<string | null>(null);

	function toggleExpand(email: string) {
		expandedEmail = expandedEmail === email ? null : email;
	}

	function formatDate(ts: number): string {
		if (!ts) return '—';
		return new Date(ts).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });
	}

	function formatCurrency(n: number, currency: 'MXN' | 'USD'): string {
		return currency === 'MXN' ? `$${n.toLocaleString()} MXN` : `$${n.toLocaleString()} USD`;
	}

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
		} catch (err) {
			console.error('[Customers] Failed to load orders:', err);
		} finally {
			loading = false;
		}
	}

	onMount(loadOrders);
</script>

<svelte:head><title>Clientes — Admin</title></svelte:head>

<div class="customers-page">
	<div class="page-header">
		<div>
			<h1 class="page-title">👥 Clientes</h1>
			<p class="page-sub">Quién compró qué, historial completo por cliente.</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-val">{stats.totalCustomers}</div>
			<div class="stat-lbl">Clientes</div>
		</div>
		<div class="stat-card">
			<div class="stat-val accent">{formatCurrency(stats.totalRevenueUSD, 'USD')}</div>
			<div class="stat-lbl">Revenue total</div>
		</div>
		<div class="stat-card">
			<div class="stat-val">{stats.repeatCustomers}</div>
			<div class="stat-lbl">Recurrentes</div>
		</div>
		<div class="stat-card">
			<div class="stat-val">{stats.topLicense}</div>
			<div class="stat-lbl">Licencia top</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters-bar">
		<div class="search-wrap">
			<span class="search-icon">🔍</span>
			<input type="text" class="search-input" bind:value={search} placeholder="Buscar por email, nombre o beat..." />
			{#if search}
				<button class="search-clear" aria-label="Limpiar" onclick={() => search = ''}>✕</button>
			{/if}
		</div>
		<select class="filter-select" bind:value={sortBy}>
			<option value="recent">Más recientes</option>
			<option value="spent">Mayor gasto</option>
			<option value="orders">Más compras</option>
		</select>
		<span class="filter-count">{customers.length} clientes</span>
	</div>

	{#if loading}
		<div class="loading-msg">Cargando clientes...</div>
	{:else if customers.length === 0}
		<EmptyState icon="👥" title="Sin clientes" subtitle={search ? 'No hay resultados para esta búsqueda' : 'Aún no hay ventas registradas'} />
	{:else}
		<div class="customer-list">
			{#each customers as customer (customer.email)}
				<div class="customer-card" class:expanded={expandedEmail === customer.email}>
					<button class="customer-row" onclick={() => toggleExpand(customer.email)}>
						<div class="customer-avatar">
							{customer.name ? customer.name.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase()}
						</div>
						<div class="customer-info">
							<div class="customer-name">{customer.name || '(Sin nombre)'}</div>
							<div class="customer-email">{customer.email}</div>
						</div>
						<div class="customer-stats">
							<div class="cs-item">
								<span class="cs-val">{customer.orders.length}</span>
								<span class="cs-lbl">órdenes</span>
							</div>
							<div class="cs-item">
								<span class="cs-val accent">{formatCurrency(customer.totalUSD, 'USD')}</span>
								<span class="cs-lbl">total</span>
							</div>
							<div class="cs-item">
								<span class="cs-val">{formatDate(customer.lastPurchase)}</span>
								<span class="cs-lbl">última</span>
							</div>
						</div>
						<span class="expand-icon" class:rotated={expandedEmail === customer.email}>▼</span>
					</button>

					{#if expandedEmail === customer.email}
						<div class="customer-detail">
							<!-- License breakdown -->
							<div class="license-breakdown">
								{#each Object.entries(customer.licenses) as [lic, count]}
									<span class="lic-badge">{lic} ×{count}</span>
								{/each}
							</div>

							<!-- Order history -->
							<div class="order-list">
								{#each customer.orders.sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0)) as order}
									<div class="order-card">
										<div class="order-header">
											<span class="order-id">#{order.sessionId.slice(0, 8)}</span>
											<span class="order-date">{formatDate(order.paidAt || 0)}</span>
											{#if order.discountCode}
												<span class="discount-badge">🏷️ {order.discountCode}</span>
											{/if}
										</div>
										<div class="order-items">
											{#each order.items as item}
												<div class="order-item">
													<span class="oi-name">{item.beatName}</span>
													<span class="oi-license">{item.licenseName}</span>
													<span class="oi-price">{formatCurrency(item.priceUSD, 'USD')}</span>
												</div>
											{/each}
										</div>
										<div class="order-total">
											Total: {formatCurrency(order.items.reduce((s, i) => s + i.priceMXN, 0), 'MXN')}
											/ {formatCurrency(order.items.reduce((s, i) => s + i.priceUSD, 0), 'USD')}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.customers-page { max-width: 900px; margin: 0 auto; }

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
	}

	.page-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	/* Stats */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.stat-card {
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		text-align: center;
	}

	.stat-val {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--text);
	}

	.stat-val.accent { color: var(--accent); }

	.stat-lbl {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-top: var(--space-1);
	}

	/* Filters */
	.filters-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		flex-wrap: wrap;
	}

	.search-wrap {
		flex: 1;
		min-width: 200px;
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--text-sm);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3) var(--space-2) 36px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.search-input:focus { border-color: rgba(var(--accent-rgb), 0.5); }

	.search-clear {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: 4px;
	}

	.filter-select {
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
	}

	.filter-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.loading-msg {
		text-align: center;
		padding: var(--space-10);
		color: var(--text-muted);
	}

	/* Customer list */
	.customer-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--border);
	}

	.customer-card { background: var(--surface); }

	.customer-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-4);
		width: 100%;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background var(--duration-fast);
		text-align: left;
		color: var(--text);
		font: inherit;
	}

	.customer-row:hover { background: var(--surface-hover); }

	.customer-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--text-lg);
		flex-shrink: 0;
	}

	.customer-info { flex: 1; min-width: 0; }

	.customer-name {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
	}

	.customer-email {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		margin-top: 2px;
	}

	.customer-stats {
		display: flex;
		gap: var(--space-5);
		flex-shrink: 0;
	}

	.cs-item { display: flex; flex-direction: column; align-items: center; }
	.cs-val { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); }
	.cs-val.accent { color: var(--accent); }
	.cs-lbl { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); text-transform: uppercase; }

	.expand-icon {
		font-size: 10px;
		color: var(--text-muted);
		transition: transform var(--duration-fast);
		flex-shrink: 0;
	}

	.expand-icon.rotated { transform: rotate(180deg); }

	/* Detail */
	.customer-detail {
		padding: var(--space-4) var(--space-4) var(--space-4) calc(var(--space-4) + 40px + var(--space-4));
		border-top: 1px solid var(--border);
		background: rgba(var(--accent-rgb), 0.02);
	}

	.license-breakdown {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		flex-wrap: wrap;
	}

	.lic-badge {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.08);
		color: var(--accent);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
	}

	.order-list { display: flex; flex-direction: column; gap: var(--space-3); }

	.order-card {
		padding: var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
	}

	.order-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-2);
	}

	.order-id {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.order-date {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.discount-badge {
		font-size: var(--text-2xs);
		padding: 1px 6px;
		border-radius: var(--radius-full);
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.order-items { display: flex; flex-direction: column; gap: 4px; }

	.order-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-sm);
	}

	.oi-name { flex: 1; color: var(--text); font-weight: 500; }
	.oi-license { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); }
	.oi-price { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--accent); font-weight: 600; }

	.order-total {
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		text-align: right;
	}

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: 1fr 1fr; }
		.customer-stats { gap: var(--space-3); }
		.cs-item:last-child { display: none; }
		.customer-detail { padding-left: var(--space-4); }
	}

	@media (max-width: 480px) {
		.customer-stats { display: none; }
	}
</style>
