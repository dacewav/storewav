<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Spinner, Icon } from '$lib/components';

	let {
		brandName = 'DACEWAV',
		saveStatus = 'saved',
		onSave,
		onExport,
		onImport,
		onUndo,
		onRedo,
		onLogout,
		onToggleSidebar,
		children
	}: {
		brandName?: string;
		saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
		onSave?: () => void;
		onExport?: () => void;
		onImport?: () => void;
		onUndo?: () => void;
		onRedo?: () => void;
		onLogout?: () => void;
		onToggleSidebar?: () => void;
		children?: Snippet;
	} = $props();

	const statusConfig = {
		saved: { dot: 'var(--accent)', text: 'Guardado' },
		saving: { dot: 'var(--warning)', text: 'Guardando...' },
		unsaved: { dot: 'var(--warning)', text: 'Sin guardar' },
		error: { dot: 'var(--danger)', text: 'Error al guardar' },
	};

	const status = $derived(statusConfig[saveStatus]);
</script>

<header class="topbar">
	<button class="tb-btn hamburger" onclick={onToggleSidebar} title="Menú" aria-label="Toggle sidebar">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
	</button>
	<div class="topbar-brand">{brandName}<em>·</em> Admin</div>

	<div class="save-status">
		{#if saveStatus === 'saving'}
			<Spinner size="sm" />
		{:else}
			<span class="sdot" style="background: {status.dot}"></span>
		{/if}
		<span class="status-text">{status.text}</span>
	</div>

	<div class="topbar-center">
		{#if children}
			{@render children()}
		{/if}
	</div>

	<div class="topbar-actions">
		<button class="tb-btn" onclick={onUndo} title="Deshacer (Ctrl+Z)" aria-label="Deshacer">
			<Icon name="undo" size={14} />
		</button>
		<button class="tb-btn" onclick={onRedo} title="Rehacer (Ctrl+Shift+Z)" aria-label="Rehacer">
			<Icon name="redo" size={14} />
		</button>
		<div class="tb-sep"></div>
		<button class="tb-btn tb-save" onclick={onSave} title="Guardar (Ctrl+S)" aria-label="Guardar">
			<Icon name="save" size={14} />
		</button>
		<button class="tb-btn" onclick={onExport} title="Exportar" aria-label="Exportar">
			<Icon name="export" size={14} />
		</button>
		<button class="tb-btn" onclick={onImport} title="Importar" aria-label="Importar">
			<Icon name="import" size={14} />
		</button>
		<div class="tb-sep"></div>
		<button class="tb-btn tb-danger" onclick={onLogout} title="Salir" aria-label="Cerrar sesión">
			<Icon name="logout" size={14} />
		</button>
	</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: var(--z-nav);
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		min-height: 52px;
	}

	.topbar-brand {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--text);
		flex-shrink: 0;
	}

	.topbar-brand em {
		color: var(--accent);
		font-style: normal;
	}

	.save-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.sdot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.status-text {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.topbar-center {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.tb-sep {
		width: 1px;
		height: 20px;
		background: var(--border);
		margin: 0 var(--space-1);
	}

	.tb-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
		padding: 0;
	}

	.tb-btn:hover {
		color: var(--text);
		background: var(--surface-hover);
		border-color: var(--border);
	}

	.tb-save {
		color: var(--accent);
	}

	.tb-save:hover {
		background: rgba(var(--accent-rgb), 0.1);
		border-color: rgba(var(--accent-rgb), 0.3);
	}

	.tb-danger:hover {
		color: var(--danger);
		background: var(--danger-glow);
		border-color: var(--danger-dim);
	}

	.hamburger {
		display: none;
	}

	@media (max-width: 900px) {
		.topbar-center {
			display: none;
		}

		.status-text {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.hamburger {
			display: flex;
		}

		.save-status {
			display: none;
		}

		.topbar-actions .tb-sep,
		.topbar-actions .tb-btn:not(.tb-save):not(.tb-danger) {
			display: none;
		}
	}
</style>
