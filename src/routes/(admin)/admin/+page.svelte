<script lang="ts">
	import { Card, Badge, Skeleton } from '$lib/components';
	import { allBeatsList, wishlist, settings, auth, beats as beatsStore, beatsStats, createBeat, updateBeat } from '$lib/stores';
	import { seedDemoBeats, SEED_COUNT } from '$lib/seed';
	import { toast } from '$lib/toastStore';
	import type { Beat } from '$lib/stores/beats';

	let beatsData = $derived($beatsStore);
	let beats = $derived($allBeatsList);
	let wl = $derived($wishlist);
	let stats = $derived($beatsStats);
	let settingsData = $derived($settings.data);
	let authState = $derived($auth);
	let brandName = $derived(settingsData?.brand?.name ?? 'DACEWAV');
	let loading = $derived(beatsData.loading);

	let topBeatName = $derived(stats.topBeat?.name ?? '—');
	let topBeatPlays = $derived(stats.topBeat?.plays ?? 0);

	const statCards = $derived([
		{ label: 'Beats', value: String(stats.total || '—'), icon: '🎵' },
		{ label: 'Activos', value: String(stats.active || '—'), icon: '✅' },
		{ label: 'Plays totales', value: stats.totalPlays > 0 ? stats.totalPlays.toLocaleString() : '—', icon: '🔥' },
		{ label: 'Top beat', value: topBeatPlays > 0 ? `${topBeatName} (${topBeatPlays})` : '—', icon: '👑' }
	]);

	let seeding = $state(false);
	let seedResult = $state<string | null>(null);

	async function handleSeed() {
		if (!confirm(`¿Crear ${SEED_COUNT} beats de demo en Firebase?`)) return;
		seeding = true;
		seedResult = null;
		try {
			const count = await seedDemoBeats();
			seedResult = `✅ ${count} beats creados`;
			toast.success(`${count} beats de demo creados`);
		} catch (err) {
			seedResult = `❌ Error: ${err instanceof Error ? err.message : String(err)}`;
			toast.error('Error al crear beats de demo');
		} finally {
			seeding = false;
		}
	}

	let recentActivity = $derived<{ action: string; time: string; type: 'success' | 'warning' | 'default' }[]>([
		{ action: authState.user ? `Sesión: ${authState.user.email}` : 'Sin sesión', time: 'Ahora', type: authState.user ? 'success' : 'warning' },
		{ action: settingsData ? 'Settings Firebase conectado' : 'Settings pendiente', time: 'Ahora', type: settingsData ? 'success' : 'warning' }
	]);

	// ── Export: include beats + settings (with theme) ──
	function handleExport() {
		const data = {
			beats: Object.fromEntries(beats.map(b => [b.id, { ...b }])),
			settings: settingsData,
			exportedAt: new Date().toISOString(),
			version: '1.1'
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `dacewav-backup-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Exportación completada');
	}

	// ── Import: validation + preview + duplicate handling ──
	const REQUIRED_BEAT_FIELDS = ['name', 'genre', 'bpm', 'key'] as const;

	type ImportPreview = {
		beats: { id: string; name: string; isDuplicate: boolean }[];
		hasSettings: boolean;
		settingsSections: string[];
		errors: string[];
	};

	let importPreview = $state<ImportPreview | null>(null);
	let importFileData = $state<{ beats: Record<string, unknown>; settings: Record<string, unknown> | null } | null>(null);
	let importDuplicateMode = $state<'skip' | 'overwrite'>('skip');
	let importing = $state(false);

	/** Validate a single beat object, return list of missing fields */
	function validateBeat(beat: Record<string, unknown>): string[] {
		const missing: string[] = [];
		for (const field of REQUIRED_BEAT_FIELDS) {
			if (beat[field] === undefined || beat[field] === null || beat[field] === '') {
				missing.push(field);
			}
		}
		return missing;
	}

	/** Parse file and show preview modal */
	async function handleImportSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const data = JSON.parse(text);

			if (typeof data !== 'object' || data === null) {
				toast.error('Archivo inválido: no es un JSON válido');
				input.value = '';
				return;
			}

			const errors: string[] = [];
			const beatsPreview: ImportPreview['beats'] = [];
			const existingIds = new Set(beats.map(b => b.id));

			// Validate beats
			if (data.beats && typeof data.beats === 'object') {
				for (const [id, beatData] of Object.entries(data.beats)) {
					const beat = beatData as Record<string, unknown>;
					const missing = validateBeat(beat);
					if (missing.length > 0) {
						errors.push(`Beat "${beat.name ?? id}": falta ${missing.join(', ')}`);
					} else {
						beatsPreview.push({
							id,
							name: String(beat.name),
							isDuplicate: existingIds.has(id)
						});
					}
				}
			}

			// Detect settings sections
			const settingsSections: string[] = [];
			if (data.settings && typeof data.settings === 'object') {
				for (const key of Object.keys(data.settings)) {
					if (key !== 'exportedAt' && key !== 'version') {
						settingsSections.push(key);
					}
				}
			}

			// Store parsed data for import execution
			importFileData = {
				beats: (data.beats && typeof data.beats === 'object') ? data.beats as Record<string, unknown> : {},
				settings: (data.settings && typeof data.settings === 'object') ? data.settings as Record<string, unknown> : null
			};

			importPreview = {
				beats: beatsPreview,
				hasSettings: settingsSections.length > 0,
				settingsSections,
				errors
			};
		} catch {
			toast.error('Error al leer el archivo: JSON inválido');
		}
		input.value = '';
	}

	/** Execute import after preview confirmation */
	async function executeImport() {
		if (!importFileData || !importPreview) return;

		importing = true;
		let imported = 0;
		let skipped = 0;

		try {
			// Import settings
			if (importFileData.settings && importPreview.hasSettings) {
				const { exportedAt, version, ...settingsPayload } = importFileData.settings;
				await settings.set(settingsPayload as Parameters<typeof settings.set>[0]);
				imported++;
			}

			// Import beats
			for (const beatPreview of importPreview.beats) {
				const beatData = importFileData.beats[beatPreview.id] as Record<string, unknown> | undefined;
				if (!beatData) continue;

				if (beatPreview.isDuplicate) {
					if (importDuplicateMode === 'skip') {
						skipped++;
						continue;
					}
					// Overwrite: update existing beat
					const { id, date, ...rest } = beatData;
					try {
						await updateBeat(beatPreview.id, rest as Partial<Beat>);
						imported++;
					} catch (err) {
						console.error('[Import] Error updating beat:', beatPreview.id, err);
					}
				} else {
					// New beat
					const { id, date, ...rest } = beatData;
					try {
						await createBeat(rest as Parameters<typeof createBeat>[0]);
						imported++;
					} catch (err) {
						console.error('[Import] Error creando beat:', err);
					}
				}
			}

			const msg = skipped > 0
				? `Importados: ${imported} · Omitidos: ${skipped}`
				: `Importados: ${imported} elemento(s)`;
			toast.success(msg);
		} catch (err) {
			toast.error(`Error al importar: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			importing = false;
			importPreview = null;
			importFileData = null;
		}
	}

	function cancelImport() {
		importPreview = null;
		importFileData = null;
	}
</script>

<div class="dashboard">
	<div class="dash-header">
		<div>
			<h1 class="dash-title">Dashboard</h1>
			<p class="dash-sub">Panel de control {brandName}</p>
		</div>
		<Badge variant="accent">v1.0.0</Badge>
	</div>

	<!-- Stats grid -->
	{#if loading}
		<div class="stats-grid">
			{#each Array(4) as _}
				<Card>
					<div class="stat-card">
						<Skeleton variant="compact" lines={2} />
					</div>
				</Card>
			{/each}
		</div>
	{:else}
	<div class="stats-grid">
		{#each statCards as stat}
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
	{/if}

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
						<input type="file" accept=".json" onchange={handleImportSelect} hidden />
					</label>
					<button class="qa-btn" onclick={handleSeed} disabled={seeding} aria-label="Seed demo beats">
						<span class="qa-icon">{seeding ? '⏳' : '🌱'}</span>
						<span>{seeding ? 'Creando...' : `Seed ${SEED_COUNT} beats`}</span>
					</button>
					{#if seedResult}
						<div class="seed-result">{seedResult}</div>
					{/if}
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
			<span class="info-value">v1.0.0</span>
		</div>
	</div>

	<!-- Import preview modal -->
	{#if importPreview}
		<div class="modal-backdrop" onclick={cancelImport} onkeydown={(e) => e.key === 'Escape' && cancelImport()} role="dialog" aria-modal="true" aria-label="Vista previa de importación" tabindex="-1">
			<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" tabindex="-1" aria-label="Vista previa de importación">
				<h3 class="modal-title">📥 Vista previa de importación</h3>

				<!-- Beats preview -->
				{#if importPreview.beats.length > 0}
					<div class="preview-section">
						<h4 class="preview-label">Beats ({importPreview.beats.length})</h4>
						<div class="preview-list">
							{#each importPreview.beats as beat}
								<div class="preview-item" class:duplicate={beat.isDuplicate}>
									<span class="preview-name">{beat.name}</span>
									{#if beat.isDuplicate}
										<Badge variant="warning">duplicado</Badge>
									{:else}
										<Badge variant="accent">nuevo</Badge>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<p class="preview-empty">No hay beats en el archivo</p>
				{/if}

				<!-- Settings preview -->
				{#if importPreview.hasSettings}
					<div class="preview-section">
						<h4 class="preview-label">Settings</h4>
						<div class="preview-tags">
							{#each importPreview.settingsSections as section}
								<span class="preview-tag">{section}</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Validation errors -->
				{#if importPreview.errors.length > 0}
					<div class="preview-errors">
						<h4 class="preview-label error">⚠️ Errores de validación</h4>
						{#each importPreview.errors as error}
							<p class="error-text">{error}</p>
						{/each}
					</div>
				{/if}

				<!-- Duplicate mode selector -->
				{#if importPreview.beats.some(b => b.isDuplicate)}
					<div class="dup-mode">
						<h4 class="preview-label">Beats duplicados</h4>
						<div class="dup-options">
							<label class="dup-option">
								<input type="radio" bind:group={importDuplicateMode} value="skip" />
								<span>Omitir (no sobreescribir)</span>
							</label>
							<label class="dup-option">
								<input type="radio" bind:group={importDuplicateMode} value="overwrite" />
								<span>Sobreescribir con datos nuevos</span>
							</label>
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<div class="modal-actions">
					<button class="btn-cancel" onclick={cancelImport}>Cancelar</button>
					<button class="btn-import" onclick={executeImport} disabled={importing}>
						{importing ? 'Importando...' : 'Confirmar importación'}
					</button>
				</div>
			</div>
		</div>
	{/if}
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

	.seed-result {
		grid-column: 1 / -1;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		background: rgba(var(--accent-rgb), 0.08);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		color: var(--accent);
		text-align: center;
	}

	.qa-btn:disabled {
		opacity: 0.5;
		cursor: wait;
	}

	/* ── Import Preview Modal ── */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 560px;
		width: 100%;
		max-height: 80vh;
		overflow-y: auto;
	}

	.modal-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-5);
	}

	.preview-section {
		margin-bottom: var(--space-4);
	}

	.preview-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-2);
	}

	.preview-label.error {
		color: #ef4444;
	}

	.preview-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-2);
	}

	.preview-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.preview-item.duplicate {
		background: rgba(234, 179, 8, 0.08);
	}

	.preview-name {
		color: var(--text);
		font-weight: 500;
	}

	.preview-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.preview-tag {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--surface-hover);
		border: 1px solid var(--border);
		color: var(--text-secondary);
	}

	.preview-empty {
		font-size: var(--text-sm);
		color: var(--text-muted);
		font-style: italic;
	}

	.preview-errors {
		margin-bottom: var(--space-4);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.error-text {
		font-size: var(--text-sm);
		color: #ef4444;
		margin-top: var(--space-1);
	}

	.dup-mode {
		margin-bottom: var(--space-4);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: rgba(234, 179, 8, 0.06);
		border: 1px solid rgba(234, 179, 8, 0.2);
	}

	.dup-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.dup-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		cursor: pointer;
	}

	.dup-option input[type="radio"] {
		accent-color: var(--accent);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-5);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}

	.btn-cancel {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		min-height: var(--touch-min);
	}

	.btn-cancel:hover {
		background: var(--surface-hover);
	}

	.btn-import {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		border: none;
		background: var(--accent);
		color: #fff;
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		min-height: var(--touch-min);
	}

	.btn-import:hover {
		opacity: 0.9;
	}

	.btn-import:disabled {
		opacity: 0.5;
		cursor: wait;
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
