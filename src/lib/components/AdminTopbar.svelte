<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Icon } from '$lib/components';

	let {
		brandName = 'DACEWAV',
		saveStatus = 'saved',
		pendingCount = 0,
		previewOpen = false,
		adminTheme = 'dark',
		onSave,
		onExport,
		onImport,
		onUndo,
		onRedo,
		onLogout,
		onToggleSidebar,
		onTogglePreview,
		onToggleTheme,
		onOpenPalette,
		children
	}: {
		brandName?: string;
		saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
		pendingCount?: number;
		previewOpen?: boolean;
		adminTheme?: 'dark' | 'light';
		onSave?: () => void;
		onExport?: () => void;
		onImport?: () => void;
		onUndo?: () => void;
		onRedo?: () => void;
		onLogout?: () => void;
		onToggleSidebar?: () => void;
		onTogglePreview?: () => void;
		onToggleTheme?: () => void;
		onOpenPalette?: () => void;
		children?: Snippet;
	} = $props();
</script>

<header class="topbar">
	<button class="tb-btn hamburger" onclick={onToggleSidebar} title="Menú" aria-label="Toggle sidebar">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
	</button>
	<div class="topbar-brand">{brandName}<em>·</em> Admin</div>

	<div class="save-status" class:saving={saveStatus === 'saving'} class:error={saveStatus === 'error'}>
		{#if saveStatus === 'saving'}
			<span class="sdot saving-dot"></span>
			<span class="status-text">Guardando...</span>
		{:else if saveStatus === 'error'}
			<span class="sdot error-dot"></span>
			<span class="status-text">Error</span>
			<button class="retry-btn" onclick={onSave} title="Reintentar">↻</button>
		{:else if saveStatus === 'saved'}
			<span class="sdot saved-dot">✓</span>
			<span class="status-text">Guardado</span>
		{:else}
			<span class="sdot" style="background: var(--warning)"></span>
			<span class="status-text">Sin guardar</span>
		{/if}
		{#if pendingCount > 0}
			<span class="pending-badge" title="{pendingCount} escrituras pendientes">{pendingCount}</span>
		{/if}
	</div>

	<div class="topbar-center">
		<button class="palette-trigger" onclick={onOpenPalette} title="Buscar (Ctrl+K)">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
			<span class="palette-placeholder">Buscar…</span>
			<kbd class="palette-kbd">⌘K</kbd>
		</button>
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
		<button class="tb-btn" class:tb-active={previewOpen} onclick={onTogglePreview} title="Preview split (Ctrl+P)" aria-label="Toggle preview">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
		</button>
		<button class="tb-btn" onclick={() => window.open('/', '_blank')} title="Abrir tienda" aria-label="Abrir tienda">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
		</button>
		<button class="tb-btn" onclick={() => window.open('/', 'preview-mobile', 'width=375,height=812,toolbar=no,menubar=no,scrollbars=yes')} title="Preview mobile" aria-label="Preview mobile">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
		</button>
		<div class="tb-sep"></div>
		<button class="tb-btn" onclick={onToggleTheme} title="Tema admin ({adminTheme === 'dark' ? 'oscuro' : 'claro'})" aria-label="Toggle admin theme">
			{#if adminTheme === 'dark'}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
			{/if}
		</button>
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
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.saved-dot {
		width: 18px;
		height: 18px;
		background: var(--accent);
		color: #fff;
		font-size: 10px;
		font-weight: 700;
		border-radius: 50%;
		animation: popIn 0.3s ease;
	}

	.saving-dot {
		width: 8px;
		height: 8px;
		background: var(--warning);
		border-radius: 50%;
		animation: pulse 1s ease-in-out infinite;
	}

	.error-dot {
		width: 8px;
		height: 8px;
		background: var(--danger);
		border-radius: 50%;
		animation: shake 0.4s ease;
	}

	.retry-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1px solid var(--danger-dim);
		background: var(--danger-glow);
		color: var(--danger);
		font-size: 12px;
		cursor: pointer;
		transition: all var(--duration-fast);
		padding: 0;
	}

	.retry-btn:hover {
		background: var(--danger);
		color: #fff;
		border-color: var(--danger);
	}

	.pending-badge {
		font-family: var(--font-mono);
		font-size: 9px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: 8px;
		background: var(--warning);
		color: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		animation: popIn 0.2s ease;
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

	.tb-active {
		color: var(--accent);
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

	/* Command palette trigger */
	.palette-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg-secondary, rgba(255,255,255,0.03));
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
		min-height: 32px;
		font-size: var(--text-sm);
	}

	.palette-trigger:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--text-secondary);
		background: rgba(var(--accent-rgb), 0.05);
	}

	.palette-placeholder {
		font-family: var(--font-body);
		font-size: var(--text-sm);
	}

	.palette-kbd {
		font-family: var(--font-mono);
		font-size: 10px;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		margin-left: var(--space-4);
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

		/* Floating save pill on mobile */
		.save-status {
			position: fixed;
			bottom: 72px;
			right: 12px;
			z-index: calc(var(--z-nav) + 1);
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 999px;
			padding: 4px 10px;
			box-shadow: 0 2px 12px rgba(0,0,0,0.25);
			gap: var(--space-1);
		}

		.save-status .status-text {
			display: inline;
			font-size: 10px;
		}

		.topbar-actions .tb-sep,
		.topbar-actions .tb-btn:not(.tb-save):not(.tb-danger) {
			display: none;
		}

		/* Show palette trigger on mobile */
		.palette-trigger {
			display: flex;
		}

		.palette-placeholder {
			display: none;
		}

		.palette-kbd {
			display: none;
		}
	}

	@media (min-width: 769px) {
		.palette-trigger {
			display: flex;
		}
	}

	@keyframes popIn {
		0% { transform: scale(0); opacity: 0; }
		60% { transform: scale(1.2); }
		100% { transform: scale(1); opacity: 1; }
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-3px); }
		75% { transform: translateX(3px); }
	}
</style>
