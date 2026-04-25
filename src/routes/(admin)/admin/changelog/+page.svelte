<script lang="ts">
	import { onMount } from 'svelte';
	import { changelog, initChangelog, destroyChangelog, type ChangelogEntry } from '$lib/stores';
	import { Card } from '$lib/components';

	let entries = $derived($changelog);
	let filter = $state<'all' | 'update' | 'create' | 'delete'>('all');

	let filtered = $derived(
		filter === 'all' ? entries : entries.filter((e) => e.action === filter)
	);

	onMount(() => {
		initChangelog();
		return destroyChangelog;
	});

	function formatDate(ts: number): string {
		const d = new Date(ts);
		const now = new Date();
		const diff = now.getTime() - ts;
		if (diff < 60000) return 'Ahora';
		if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)}m`;
		if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
		return d.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	}

	function actionIcon(action: string): string {
		switch (action) {
			case 'update': return '✏️';
			case 'create': return '➕';
			case 'delete': return '🗑️';
			case 'restore': return '♻️';
			default: return '📝';
		}
	}

	function actionLabel(action: string): string {
		switch (action) {
			case 'update': return 'Actualizado';
			case 'create': return 'Creado';
			case 'delete': return 'Eliminado';
			case 'restore': return 'Restaurado';
			default: return action;
		}
	}
</script>

<svelte:head>
	<title>Changelog — Admin</title>
</svelte:head>

<div class="changelog-page">
	<div class="page-header">
		<div>
			<h2 class="page-title">📋 Changelog</h2>
			<p class="page-desc">Historial de cambios · {entries.length} entradas</p>
		</div>
		<div class="filters">
			{#each ['all', 'update', 'create', 'delete'] as f}
				<button class="filter-btn" class:active={filter === f} onclick={() => filter = f as any}>
					{f === 'all' ? 'Todos' : actionLabel(f)}
				</button>
			{/each}
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">
			<span class="empty-icon">📋</span>
			<span class="empty-text">Sin cambios registrados</span>
		</div>
	{:else}
		<div class="entries-list">
			{#each filtered as entry (entry.id)}
				<div class="entry-row">
					<span class="e-icon">{actionIcon(entry.action)}</span>
					<div class="e-info">
						<span class="e-field">{entry.field}</span>
						{#if entry.oldValue && entry.newValue}
							<span class="e-change">
								<span class="e-old">{entry.oldValue}</span>
								→
								<span class="e-new">{entry.newValue}</span>
							</span>
						{/if}
					</div>
					<span class="e-time">{formatDate(entry.date)}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.changelog-page { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }

	.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
	.page-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.page-desc { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1); }

	.filters { display: flex; gap: var(--space-1); flex-shrink: 0; }
	.filter-btn {
		padding: var(--space-1) var(--space-3); border: 1px solid var(--border);
		border-radius: var(--radius-md); background: transparent;
		color: var(--text-muted); font-size: var(--text-2xs); cursor: pointer;
		transition: all var(--duration-fast);
	}
	.filter-btn:hover { background: var(--surface-hover); color: var(--text); }
	.filter-btn.active { background: rgba(var(--accent-rgb), 0.1); border-color: rgba(var(--accent-rgb), 0.3); color: var(--accent); }

	.empty-state {
		display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
		padding: var(--space-8); color: var(--text-muted); font-size: var(--text-sm);
	}
	.empty-icon { font-size: 2rem; }

	.entries-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border-radius: var(--radius-md); overflow: hidden; }

	.entry-row {
		display: flex; align-items: center; gap: var(--space-3);
		padding: var(--space-3) var(--space-4); background: var(--surface);
	}
	.e-icon { font-size: 1rem; flex-shrink: 0; }
	.e-info { flex: 1; min-width: 0; }
	.e-field { display: block; font-size: var(--text-sm); font-weight: 500; color: var(--text); }
	.e-change { display: block; font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); margin-top: 2px; }
	.e-old { text-decoration: line-through; opacity: 0.6; }
	.e-new { color: var(--accent); }
	.e-time { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-hint); white-space: nowrap; flex-shrink: 0; }
</style>
