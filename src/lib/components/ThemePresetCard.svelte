<script lang="ts">
	import type { ThemePreset } from '$lib/stores/themePresets';

	let {
		preset,
		onApply,
		onDelete,
		onRename
	}: {
		preset: ThemePreset;
		onApply?: (id: string) => void;
		onDelete?: (id: string) => void;
		onRename?: (id: string, name: string) => void;
	} = $props();

	let editing = $state(false);
	let editName = $state(preset.name);

	function startRename() {
		editing = true;
		editName = preset.name;
	}

	function commitRename() {
		if (editName.trim() && editName !== preset.name) {
			onRename?.(preset.id, editName.trim());
		}
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitRename();
		else if (e.key === 'Escape') editing = false;
	}

	function confirmDelete() {
		if (confirm(`¿Eliminar preset "${preset.name}"?`)) {
			onDelete?.(preset.id);
		}
	}

	// Extract color swatches from theme
	let swatches = $derived(() => {
		const t = preset.theme;
		const colors: string[] = [];
		if (t.accent) colors.push(t.accent);
		if (t.bgColor) colors.push(t.bgColor);
		if (t.surfaceColor) colors.push(t.surfaceColor);
		if (t.textColor) colors.push(t.textColor);
		if (t.glowColor) colors.push(t.glowColor);
		return colors.slice(0, 5);
	});

	let dateStr = $derived(new Date(preset.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' }));
</script>

<div class="preset-card">
	<div class="preset-swatches">
		{#each swatches() as color}
			<span class="swatch" style="background: {color}"></span>
		{/each}
	</div>

	<div class="preset-info">
		{#if editing}
			<input
				class="preset-rename-input"
				type="text"
				bind:value={editName}
				onkeydown={handleKeydown}
				onblur={commitRename}
				autofocus
			/>
		{:else}
			<span class="preset-name" ondblclick={startRename} title="Doble click para renombrar">{preset.name}</span>
		{/if}
		<span class="preset-date">{dateStr}</span>
	</div>

	<div class="preset-actions">
		<button class="pa-btn apply" onclick={() => onApply?.(preset.id)} title="Aplicar tema">✓</button>
		<button class="pa-btn rename" onclick={startRename} title="Renombrar">✏️</button>
		<button class="pa-btn delete" onclick={confirmDelete} title="Eliminar">🗑</button>
	</div>
</div>

<style>
	.preset-card {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		transition: all var(--duration-fast);
	}

	.preset-card:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		background: var(--surface-hover);
	}

	.preset-swatches {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	.swatch {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.preset-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.preset-name {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text);
		cursor: default;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.preset-rename-input {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--accent);
		border-radius: var(--radius-sm);
		padding: 2px 6px;
		outline: none;
	}

	.preset-date {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.preset-actions {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.pa-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: transparent;
		cursor: pointer;
		font-size: 12px;
		transition: all var(--duration-fast);
	}

	.pa-btn.apply:hover {
		background: rgba(var(--accent-rgb), 0.1);
		border-color: var(--accent);
	}

	.pa-btn.rename:hover {
		background: var(--surface-hover);
	}

	.pa-btn.delete:hover {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
	}
</style>
