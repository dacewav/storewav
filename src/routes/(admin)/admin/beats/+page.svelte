<script lang="ts">
	import { Card, Badge, EmptyState } from '$lib/components';
	import { allBeatsList, beatsStats, deleteBeat, duplicateBeat, swapBeatOrders, genres } from '$lib/stores';
	import type { BeatWithId } from '$lib/stores/beats';

	let beats = $derived($allBeatsList);
	let stats = $derived($beatsStats);
	let genreList = $derived($genres);

	// Filters
	let search = $state('');
	let filterGenre = $state('');
	let sortBy = $state('newest');

	let filteredBeats = $derived.by(() => {
		let list = [...beats];

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			list = list.filter(b =>
				b.title?.toLowerCase().includes(q) ||
				b.artist?.toLowerCase().includes(q) ||
				b.genre?.toLowerCase().includes(q) ||
				b.tags?.some(t => t.toLowerCase().includes(q))
			);
		}

		if (filterGenre) {
			list = list.filter(b => b.genre === filterGenre);
		}

		switch (sortBy) {
			case 'newest': list.sort((a, b) => b.createdAt - a.createdAt); break;
			case 'oldest': list.sort((a, b) => a.createdAt - b.createdAt); break;
			case 'name-az': list.sort((a, b) => a.title.localeCompare(b.title)); break;
			case 'name-za': list.sort((a, b) => b.title.localeCompare(a.title)); break;
			case 'bpm-asc': list.sort((a, b) => a.bpm - b.bpm); break;
			case 'bpm-desc': list.sort((a, b) => b.bpm - a.bpm); break;
			case 'price-asc': list.sort((a, b) => (a.licenses?.basic ?? 0) - (b.licenses?.basic ?? 0)); break;
			case 'price-desc': list.sort((a, b) => (b.licenses?.basic ?? 0) - (a.licenses?.basic ?? 0)); break;
		}

		return list;
	});

	let deleting = $state<string | null>(null);
	let deleteTarget = $state<BeatWithId | null>(null);

	async function handleDelete(beat: BeatWithId) {
		deleteTarget = beat;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		await deleteBeat(deleteTarget.id);
		deleteTarget = null;
	}

	function cancelDelete() {
		deleteTarget = null;
	}

	async function moveBeat(beat: BeatWithId, direction: 'up' | 'down') {
		const list = filteredBeats;
		const idx = list.findIndex(b => b.id === beat.id);
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= list.length) return;
		const other = list[swapIdx];
		await swapBeatOrders(beat.id, beat.order ?? 0, other.id, other.order ?? 0);
	}

	async function handleDuplicate(beat: BeatWithId) {
		await duplicateBeat(beat.id);
	}

	function formatPrice(n: number) {
		return n > 0 ? `$${n.toLocaleString()}` : 'Gratis';
	}

	function formatDate(ts: number) {
		return new Date(ts).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });
	}
</script>

<div class="beats-admin">
	<div class="header">
		<div>
			<h1 class="title">🎵 Beats</h1>
			<p class="sub">Gestiona tu catálogo de beats</p>
		</div>
		<a href="/admin/beats/new" class="btn-new">+ Nuevo beat</a>
	</div>

	<!-- Stats -->
	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-val">{stats.total}</div>
			<div class="stat-lbl">Total</div>
		</div>
		<div class="stat-card">
			<div class="stat-val accent">{stats.active}</div>
			<div class="stat-lbl">Activos</div>
		</div>
		<div class="stat-card">
			<div class="stat-val muted">{stats.inactive}</div>
			<div class="stat-lbl">Inactivos</div>
		</div>
		<div class="stat-card">
			<div class="stat-val">{stats.genres}</div>
			<div class="stat-lbl">Géneros</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters-bar">
		<div class="search-wrap">
			<span class="search-icon">🔍</span>
			<input type="text" class="search-input" bind:value={search} placeholder="Buscar beats..." />
			{#if search}
				<button class="search-clear" onclick={() => search = ''}>✕</button>
			{/if}
		</div>
		<select class="filter-select" bind:value={filterGenre}>
			<option value="">Todos los géneros</option>
			{#each genreList as g}<option value={g}>{g}</option>{/each}
		</select>
		<select class="filter-select" bind:value={sortBy}>
			<option value="newest">Más recientes</option>
			<option value="oldest">Más antiguos</option>
			<option value="name-az">Nombre A-Z</option>
			<option value="name-za">Nombre Z-A</option>
			<option value="bpm-asc">BPM ↑</option>
			<option value="bpm-desc">BPM ↓</option>
			<option value="price-asc">Precio ↑</option>
			<option value="price-desc">Precio ↓</option>
		</select>
		<span class="filter-count">{filteredBeats.length} de {beats.length}</span>
	</div>

	<!-- Beat list -->
	{#if filteredBeats.length > 0}
		<div class="beat-list">
			{#each filteredBeats as beat (beat.id)}
				<div class="beat-row" class:inactive={!beat.active}>
					<!-- Cover -->
					<div class="beat-cover">
						{#if beat.coverUrl}
							<img src={beat.coverUrl} alt={beat.title} />
						{:else}
							<div class="cover-ph">♦</div>
						{/if}
					</div>

					<!-- Info -->
					<div class="beat-info">
						<div class="beat-name">
							{beat.title || '(Sin título)'}
							{#if !beat.active}
								<Badge variant="muted">Inactivo</Badge>
							{/if}
						</div>
						<div class="beat-meta">
							<span>{beat.artist || '—'}</span>
							<span class="sep">·</span>
							<span>{beat.genre}</span>
							<span class="sep">·</span>
							<span>{beat.bpm} BPM</span>
							<span class="sep">·</span>
							<span>{beat.key}</span>
							<span class="sep">·</span>
							<span>{formatDate(beat.createdAt)}</span>
						</div>
						<div class="beat-tags">
							{#if beat.tags?.length}
								{#each beat.tags.slice(0, 4) as tag}
									<span class="tag">{tag}</span>
								{/each}
								{#if beat.tags.length > 4}
									<span class="tag more">+{beat.tags.length - 4}</span>
								{/if}
							{/if}
						</div>
					</div>

					<!-- Price -->
					<div class="beat-price">
						<span class="price-from">Desde</span>
						<span class="price-val">{formatPrice(beat.licenses?.basic ?? 0)}</span>
					</div>

					<!-- Actions -->
					<div class="beat-actions">
						<button class="btn-action btn-move" title="Subir" onclick={() => moveBeat(beat, 'up')} disabled={filteredBeats.indexOf(beat) === 0}>↑</button>
						<button class="btn-action btn-move" title="Bajar" onclick={() => moveBeat(beat, 'down')} disabled={filteredBeats.indexOf(beat) === filteredBeats.length - 1}>↓</button>
						<a href="/admin/beats/{beat.id}" class="btn-action btn-edit" title="Editar">✏️</a>
						<button class="btn-action" title="Duplicar" onclick={() => handleDuplicate(beat)}>📋</button>
						<button
							class="btn-action btn-del"
							title="Borrar"
							onclick={() => handleDelete(beat)}
						>🗑️</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<EmptyState
			icon={search || filterGenre ? '🔍' : '🎵'}
			title={search || filterGenre ? 'Sin resultados' : 'Sin beats'}
			subtitle={search || filterGenre ? 'Prueba con otros filtros' : 'Crea tu primer beat para empezar'}
		>
			{#snippet action()}
				{#if !search && !filterGenre}
					<a href="/admin/beats/new" class="btn-new-inline">+ Crear primer beat</a>
				{/if}
			{/snippet}
		</EmptyState>
	{/if}
</div>

<!-- Delete confirm modal -->
{#if deleteTarget}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={cancelDelete}>
		<div class="modal-box" onclick={(e) => e.stopPropagation()}>
			<div class="modal-icon">🗑️</div>
			<h3 class="modal-title">¿Borrar este beat?</h3>
			<p class="modal-text">"{deleteTarget.title || 'Sin título'}" se eliminará permanentemente.</p>
			<div class="modal-actions">
				<button class="btn-cancel" onclick={cancelDelete}>Cancelar</button>
				<button class="btn-confirm-delete" onclick={confirmDelete}>Sí, borrar</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.beats-admin { max-width: 1000px; margin: 0 auto; }

	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	.btn-new {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-5);
		min-height: var(--touch-min);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
		text-decoration: none;
		white-space: nowrap;
	}

	.btn-new:hover { opacity: 0.9; transform: translateY(-1px); }

	.btn-new-inline {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		min-height: var(--touch-min);
		border: 1px solid rgba(var(--accent-rgb), 0.5);
		border-radius: var(--radius-md);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		font-size: var(--text-sm);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-new-inline:hover { background: var(--accent); color: var(--bg); }

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
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--text);
	}

	.stat-val.accent { color: var(--accent); }
	.stat-val.muted { color: var(--text-muted); }

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

	/* Beat list */
	.beat-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--border);
	}

	.beat-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		transition: background var(--duration-fast);
	}

	.beat-row:hover { background: var(--surface-hover); }
	.beat-row.inactive { opacity: 0.5; }

	.beat-cover {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		flex-shrink: 0;
		background: var(--surface-hover);
	}

	.beat-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-ph {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		color: var(--text-muted);
	}

	.beat-info {
		flex: 1;
		min-width: 0;
	}

	.beat-name {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.beat-meta {
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		margin-top: 2px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.sep { color: var(--text-muted); }

	.beat-tags {
		display: flex;
		gap: 4px;
		margin-top: 4px;
		flex-wrap: wrap;
	}

	.tag {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 1px 6px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.08);
		color: var(--accent);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
	}

	.tag.more { background: var(--surface-hover); color: var(--text-muted); border-color: var(--border); }

	.beat-price {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.price-from {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.price-val {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
	}

	.beat-actions {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.btn-action {
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		transition: all var(--duration-fast);
		text-decoration: none;
	}

	.btn-action:hover { background: var(--surface-hover); border-color: var(--border); }
	.btn-edit:hover { background: rgba(var(--accent-rgb), 0.1); border-color: rgba(var(--accent-rgb), 0.3); }
	.btn-del:hover { background: var(--danger-glow); border-color: var(--danger); }
	.btn-move { font-size: 12px; font-weight: 700; color: var(--text-muted); }
	.btn-move:hover:not(:disabled) { color: var(--accent); background: rgba(var(--accent-rgb), 0.1); border-color: rgba(var(--accent-rgb), 0.3); }
	.btn-move:disabled { opacity: 0.3; cursor: default; }

	/* Delete modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		background: rgba(0,0,0,0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.2s var(--ease-out);
	}

	.modal-box {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 400px;
		width: 90%;
		text-align: center;
		animation: scaleIn 0.25s var(--ease-out);
	}

	.modal-icon { font-size: 2.5rem; margin-bottom: var(--space-3); }
	.modal-title { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; color: var(--text); margin-bottom: var(--space-2); }
	.modal-text { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-5); }
	.modal-actions { display: flex; gap: var(--space-3); justify-content: center; }

	.btn-cancel {
		padding: var(--space-2) var(--space-5);
		min-height: var(--touch-min);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-cancel:hover { background: var(--surface-hover); color: var(--text); }

	.btn-confirm-delete {
		padding: var(--space-2) var(--space-5);
		min-height: var(--touch-min);
		background: var(--danger);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-confirm-delete:hover { opacity: 0.9; }

	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
	@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: 1fr 1fr; }
		.beat-row { flex-wrap: wrap; }
		.beat-price { flex-direction: row; gap: var(--space-2); align-items: center; }
		.filters-bar { flex-direction: column; }
		.search-wrap { min-width: auto; width: 100%; }
		.filter-select { width: 100%; }
	}
</style>
