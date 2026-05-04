<script lang="ts">
	import { onMount } from 'svelte';
	import { EmptyState } from '$lib/components';
	import { FIREBASE_DB } from '$lib/firebaseDb';
	import type { Kit, KitSample } from '$lib/stores/kits';

	let kits = $state<(Kit & { id: string })[]>([]);
	let loading = $state(true);
	let search = $state('');

	// Editor state
	let editing = $state<Kit & { id: string } | null>(null);
	let isNew = $state(false);
	let saving = $state(false);

	const GENRES = ['Trap', 'Drill', 'Reggaeton', 'R&B', 'Hip-Hop', 'Corrido', 'Pop', 'Ambient', 'Lo-Fi', 'Other'];

	/** Get auth token for API calls */
	async function getAuthToken(): Promise<string | null> {
		try {
			const { getAuthInstance } = await import('$lib/firebase');
			const auth = await getAuthInstance();
			return await auth?.currentUser?.getIdToken() ?? null;
		} catch {
			return null;
		}
	}

	let filteredKits = $derived.by(() => {
		if (!search.trim()) return kits;
		const q = search.trim().toLowerCase();
		return kits.filter(k =>
			k.name.toLowerCase().includes(q) ||
			k.genre.toLowerCase().includes(q) ||
			k.description?.toLowerCase().includes(q)
		);
	});

	async function loadKits() {
		loading = true;
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const resp = await fetch(`${FIREBASE_DB}/kits.json${authParam}`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					kits = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
				} else {
					kits = [];
				}
			}
		} catch (err) {
			console.error('[Admin Kits] Failed to load:', err);
		} finally {
			loading = false;
		}
	}

	function startNew() {
		editing = {
			id: '',
			name: '',
			description: '',
			genre: 'Trap',
			imageUrl: '',
			samples: [],
			priceMXN: 350,
			priceUSD: 20,
			active: true,
		};
		isNew = true;
	}

	function startEdit(kit: Kit & { id: string }) {
		editing = { ...kit, samples: [...(kit.samples || [])] };
		isNew = false;
	}

	function cancelEdit() {
		editing = null;
		isNew = false;
	}

	function addSample() {
		if (!editing) return;
		editing.samples = [...editing.samples, { name: '', url: '' }];
	}

	function removeSample(index: number) {
		if (!editing) return;
		editing.samples = editing.samples.filter((_, i) => i !== index);
	}

	function updateSample(index: number, field: keyof KitSample, value: string) {
		if (!editing) return;
		editing.samples = editing.samples.map((s, i) =>
			i === index ? { ...s, [field]: value } : s
		);
	}

	async function saveKit() {
		if (!editing) return;
		saving = true;
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const body = {
				name: editing.name,
				description: editing.description || '',
				genre: editing.genre,
				imageUrl: editing.imageUrl || '',
				samples: editing.samples,
				priceMXN: editing.priceMXN,
				priceUSD: editing.priceUSD,
				active: editing.active,
				updatedAt: Date.now(),
			};

			if (isNew) {
				const resp = await fetch(`${FIREBASE_DB}/kits.json${authParam}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...body, createdAt: Date.now() }),
				});
				const data = await resp.json();
				if (data.name) {
					kits = [...kits, { id: data.name, ...body }];
				}
			} else {
				await fetch(`${FIREBASE_DB}/kits/${editing.id}.json${authParam}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
				kits = kits.map(k => k.id === editing!.id ? { ...k, ...body } : k);
			}
			editing = null;
			isNew = false;
		} catch (err) {
			console.error('[Admin Kits] Save failed:', err);
		} finally {
			saving = false;
		}
	}

	async function toggleActive(kit: Kit & { id: string }) {
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const newActive = !kit.active;
			await fetch(`${FIREBASE_DB}/kits/${kit.id}/active.json${authParam}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newActive),
			});
			kits = kits.map(k => k.id === kit.id ? { ...k, active: newActive } : k);
		} catch (err) {
			console.error('[Admin Kits] Toggle failed:', err);
		}
	}

	async function deleteKit(kit: Kit & { id: string }) {
		if (!confirm(`¿Eliminar "${kit.name}"?`)) return;
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			await fetch(`${FIREBASE_DB}/kits/${kit.id}.json${authParam}`, {
				method: 'DELETE',
			});
			kits = kits.filter(k => k.id !== kit.id);
		} catch (err) {
			console.error('[Admin Kits] Delete failed:', err);
		}
	}

	onMount(loadKits);
</script>

<svelte:head><title>Kits — Admin</title></svelte:head>

<div class="kits-admin">
	<div class="page-header">
		<div>
			<h1 class="page-title">🥁 Drumkits</h1>
			<p class="page-sub">Administra drumkits y sample packs.</p>
		</div>
		<button class="btn-primary" onclick={startNew}>+ Nuevo kit</button>
	</div>

	<!-- Editor -->
	{#if editing}
		<div class="editor-panel">
			<h2 class="editor-title">{isNew ? 'Nuevo kit' : `Editar: ${editing.name}`}</h2>

			<div class="editor-grid">
				<label>
					<span>Nombre</span>
					<input type="text" bind:value={editing.name} placeholder="Trap Kit Vol. 1" />
				</label>
				<label>
					<span>Género</span>
					<select bind:value={editing.genre}>
						{#each GENRES as g}
							<option value={g}>{g}</option>
						{/each}
					</select>
				</label>
				<label class="full">
					<span>Descripción</span>
					<textarea bind:value={editing.description} placeholder="Descripción del kit..." rows="2"></textarea>
				</label>
				<label>
					<span>Imagen URL</span>
					<input type="text" bind:value={editing.imageUrl} placeholder="https://..." />
				</label>
				<label>
					<span>Activo</span>
					<select bind:value={editing.active}>
						<option value={true}>Sí</option>
						<option value={false}>No</option>
					</select>
				</label>
				<label>
					<span>Precio MXN</span>
					<input type="number" bind:value={editing.priceMXN} min="0" />
				</label>
				<label>
					<span>Precio USD</span>
					<input type="number" bind:value={editing.priceUSD} min="0" />
				</label>
			</div>

			<!-- Samples -->
			<div class="samples-editor">
				<div class="samples-header">
					<h3>Samples ({editing.samples.length})</h3>
					<button class="btn-small" onclick={addSample}>+ Agregar sample</button>
				</div>
				{#each editing.samples as sample, i}
					<div class="sample-row">
						<span class="sample-num">{(i + 1).toString().padStart(2, '0')}</span>
						<input type="text" bind:value={sample.name} placeholder="Nombre" oninput={() => updateSample(i, 'name', sample.name)} />
						<input type="text" bind:value={sample.url} placeholder="URL del audio" oninput={() => updateSample(i, 'url', sample.url)} />
						<button class="btn-icon" onclick={() => removeSample(i)} aria-label="Eliminar">✕</button>
					</div>
				{/each}
				{#if editing.samples.length === 0}
					<p class="no-samples">Sin samples. Click "Agregar sample" para añadir.</p>
				{/if}
			</div>

			<div class="editor-actions">
				<button class="btn-primary" onclick={saveKit} disabled={saving || !editing.name}>
					{saving ? '⏳ Guardando...' : '💾 Guardar'}
				</button>
				<button class="btn-secondary" onclick={cancelEdit}>Cancelar</button>
			</div>
		</div>
	{/if}

	<!-- Filters -->
	<div class="filters-bar">
		<div class="search-wrap">
			<span class="search-icon">🔍</span>
			<input type="text" class="search-input" bind:value={search} placeholder="Buscar por nombre o género..." />
			{#if search}
				<button class="search-clear" aria-label="Limpiar" onclick={() => search = ''}>✕</button>
			{/if}
		</div>
		<span class="filter-count">{filteredKits.length} kits</span>
	</div>

	{#if loading}
		<div class="loading-msg">Cargando kits...</div>
	{:else if filteredKits.length === 0}
		<EmptyState icon="🥁" title="Sin kits" subtitle={search ? 'No hay resultados' : 'Crea tu primer drumkit'} />
	{:else}
		<div class="kit-list">
			{#each filteredKits as kit (kit.id)}
				<div class="kit-row" class:inactive={!kit.active}>
					<div class="kit-thumb">
						{#if kit.imageUrl}
							<img src={kit.imageUrl} alt="" loading="lazy" />
						{:else}
							<span class="thumb-ph">🥁</span>
						{/if}
					</div>
					<div class="kit-info">
						<div class="kit-name">{kit.name}</div>
						<div class="kit-meta">
							<span>{kit.genre}</span>
							<span>{kit.samples?.length || 0} samples</span>
							<span>${kit.priceMXN} MXN</span>
						</div>
					</div>
					<div class="kit-actions">
						<button class="btn-small" onclick={() => startEdit(kit)}>Editar</button>
						<button class="btn-small" onclick={() => toggleActive(kit)}>
							{kit.active ? '🔴 Desactivar' : '🟢 Activar'}
						</button>
						<button class="btn-icon danger" onclick={() => deleteKit(kit)} aria-label="Eliminar">🗑️</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.kits-admin { max-width: 900px; margin: 0 auto; }

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
		gap: var(--space-4);
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

	.btn-primary {
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
	}

	.btn-primary:hover { filter: brightness(1.1); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-secondary {
		padding: var(--space-2) var(--space-4);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		cursor: pointer;
	}

	.btn-small {
		padding: var(--space-1) var(--space-3);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-small:hover { border-color: var(--accent); color: var(--accent); }

	.btn-icon {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xs);
	}

	.btn-icon.danger:hover { border-color: #ef4444; color: #ef4444; }

	/* Editor */
	.editor-panel {
		padding: var(--space-4);
		border: 1px solid var(--accent);
		border-radius: var(--radius-md);
		background: rgba(var(--accent-rgb), 0.02);
		margin-bottom: var(--space-6);
	}

	.editor-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.editor-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.editor-grid label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.editor-grid label.full {
		grid-column: 1 / -1;
	}

	.editor-grid label span {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.editor-grid input, .editor-grid select, .editor-grid textarea {
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-size: var(--text-sm);
		outline: none;
	}

	.editor-grid input:focus, .editor-grid select:focus, .editor-grid textarea:focus {
		border-color: var(--accent);
	}

	/* Samples editor */
	.samples-editor {
		margin-bottom: var(--space-4);
	}

	.samples-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}

	.samples-header h3 {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
	}

	.sample-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.sample-num {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		width: 24px;
		flex-shrink: 0;
	}

	.sample-row input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-size: var(--text-sm);
		outline: none;
	}

	.sample-row input:focus { border-color: var(--accent); }

	.no-samples {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
		padding: var(--space-3);
		text-align: center;
	}

	.editor-actions {
		display: flex;
		gap: var(--space-3);
	}

	/* Filters */
	.filters-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.search-wrap {
		flex: 1;
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
		outline: none;
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

	/* Kit list */
	.kit-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--border);
	}

	.kit-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--surface);
	}

	.kit-row.inactive { opacity: 0.5; }

	.kit-thumb {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--surface2);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.kit-thumb img { width: 100%; height: 100%; object-fit: cover; }
	.thumb-ph { font-size: 1.2rem; }

	.kit-info { flex: 1; min-width: 0; }

	.kit-name {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
	}

	.kit-meta {
		display: flex;
		gap: var(--space-3);
		margin-top: 2px;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.kit-actions {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		flex-shrink: 0;
	}

	@media (max-width: 600px) {
		.editor-grid { grid-template-columns: 1fr; }
		.kit-meta { flex-wrap: wrap; }
		.kit-actions { flex-wrap: wrap; }
	}
</style>
