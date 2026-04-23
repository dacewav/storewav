<script lang="ts">
	import { Card, Badge } from '$lib/components';
	import { allBeatsList, wishlist, settings, auth } from '$lib/stores';

	let beats = $derived($allBeatsList);
	let wl = $derived($wishlist);
	let settingsData = $derived($settings.data);
	let authState = $derived($auth);
	let brandName = $derived(settingsData?.brand?.name ?? 'DACEWAV');

	const stats = $derived([
		{ label: 'Beats', value: String(beats.length || '—'), icon: '🎵' },
		{ label: 'Wishlist', value: String(wl.length || '—'), icon: '❤️' },
		{ label: 'Géneros', value: String([...new Set(beats.map(b => b.genre))].length || '—'), icon: '🏷️' },
		{ label: 'Licencias', value: String(beats.length > 0 && beats[0].licenses ? Object.keys(beats[0].licenses).length : 4), icon: '📄' }
	]);

	let recentActivity = $derived<{ action: string; time: string; type: 'success' | 'warning' | 'default' }[]>([
		{ action: authState.user ? `Sesión: ${authState.user.email}` : 'Sin sesión', time: 'Ahora', type: authState.user ? 'success' : 'warning' },
		{ action: settingsData ? 'Settings Firebase conectado' : 'Settings pendiente', time: 'Ahora', type: settingsData ? 'success' : 'warning' }
	]);

	// Export all data as JSON
	function handleExport() {
		const data = {
			beats: Object.fromEntries(beats.map(b => [b.id, { ...b }])),
			settings: settingsData,
			exportedAt: new Date().toISOString(),
			version: '1.0'
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `dacewav-backup-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Import data from JSON
	async function handleImport(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const data = JSON.parse(text);
			if (data.settings) {
				await settings.set(data.settings);
			}
			alert('Datos importados correctamente');
		} catch {
			alert('Error al importar: archivo inválido');
		}
		input.value = '';
	}
</script>

<div class="dashboard">
	<div class="dash-header">
		<div>
			<h1 class="dash-title">Dashboard</h1>
			<p class="dash-sub">Panel de control {brandName}</p>
		</div>
		<Badge variant="accent">v0.6.0</Badge>
	</div>

	<!-- Stats grid -->
	<div class="stats-grid">
		{#each stats as stat}
			<Card hoverable>
				<div class="stat-card">
					<div class="stat-icon">{stat.icon}</div>
					<div class="stat-info">
						<div class="stat-value">{stat.value}</div>
						<div class="stat-label">{stat.label}</div>
					</div>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Two column layout -->
	<div class="dash-grid">
		<!-- Recent activity -->
		<Card>
			<div class="card-section">
				<h3 class="section-label">Actividad reciente</h3>
				<div class="activity-list">
					{#each recentActivity as item}
						<div class="activity-item">
							<Badge variant={item.type === 'warning' ? 'warning' : item.type === 'success' ? 'accent' : 'muted'}>
								{item.time}
							</Badge>
							<span class="activity-text">{item.action}</span>
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<!-- Quick actions -->
		<Card>
			<div class="card-section">
				<h3 class="section-label">Acciones rápidas</h3>
				<div class="quick-actions">
					<a href="/admin/beats/new" class="qa-btn" aria-label="Nuevo beat">
						<span class="qa-icon">🎵</span>
						<span>Nuevo beat</span>
					</a>
					<a href="/admin/theme" class="qa-btn" aria-label="Editar tema">
						<span class="qa-icon">🎨</span>
						<span>Editar tema</span>
					</a>
					<a href="/admin/content" class="qa-btn" aria-label="Editar contenido">
						<span class="qa-icon">✏️</span>
						<span>Editar contenido</span>
					</a>
					<a href="/admin/beats" class="qa-btn" aria-label="Gestionar beats">
						<span class="qa-icon">📊</span>
						<span>Gestionar beats</span>
					</a>
					<button class="qa-btn" onclick={handleExport} aria-label="Exportar datos">
						<span class="qa-icon">📤</span>
						<span>Exportar</span>
					</button>
					<label class="qa-btn" aria-label="Importar datos">
						<span class="qa-icon">📥</span>
						<span>Importar</span>
						<input type="file" accept=".json" onchange={handleImport} hidden />
					</label>
				</div>
			</div>
		</Card>
	</div>

	<!-- System info -->
	<div class="system-info">
		<div class="info-row">
			<span class="info-label">Framework</span>
			<span class="info-value">SvelteKit + Cloudflare</span>
		</div>
		<div class="info-row">
			<span class="info-label">Firebase</span>
			<span class="info-value">Conectado</span>
		</div>
		<div class="info-row">
			<span class="info-label">Versión</span>
			<span class="info-value">v0.6.0</span>
		</div>
	</div>
</div>

<style>
	.dashboard {
		max-width: 1000px;
		margin: 0 auto;
	}

	.dash-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-8);
	}

	.dash-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.dash-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	/* Stats */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
	}

	.stat-icon {
		font-size: var(--text-2xl);
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* Two col grid */
	.dash-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}

	.card-section {
		padding: var(--space-4);
	}

	.section-label {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
		letter-spacing: -0.01em;
	}

	/* Activity */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.activity-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	/* Quick actions */
	.quick-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.qa-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		min-height: var(--touch-min);
		background: var(--surface-hover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
		text-align: left;
		text-decoration: none;
	}

	.qa-btn:hover {
		background: rgba(var(--accent-rgb), 0.08);
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--text);
	}

	.qa-btn:visited {
		color: inherit;
	}

	.qa-icon {
		font-size: var(--text-base);
	}

	/* System info */
	.system-info {
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		background: var(--surface);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--border);
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.info-value {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	@media (max-width: 768px) {
		.dash-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}

		.dash-header {
			flex-direction: column;
			gap: var(--space-3);
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.quick-actions {
			grid-template-columns: 1fr;
		}
	}
</style>
