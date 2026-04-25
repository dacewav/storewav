<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { AdminTopbar } from '$lib/components';
	import { auth, settings, saveStatus as saveStatusStore, canUndo, canRedo, undoField, redoField } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from '$lib/toastStore';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let authState = $derived($auth);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	// Auth redirect — uses raw subscription, NOT $effect (prevents effect_update_depth_exceeded)
	onMount(() => {
		let done = false;
		const unsub = auth.subscribe((state) => {
			if (done || state.loading || !state.adminChecked) return;
			done = true;
			if (!state.user) {
				goto('/login');
			} else if (!state.isAdmin) {
				console.warn('[Admin] Not admin, UID:', state.user.uid);
				goto('/');
			}
		});
		return unsub;
	});

	let currentSaveStatus = $derived($saveStatusStore);
	let undoEnabled = $derived($canUndo);
	let redoEnabled = $derived($canRedo);

	// Sidebar toggle (mobile)
	let sidebarOpen = $state(false);
	function toggleSidebar() { sidebarOpen = !sidebarOpen; }
	function closeSidebar() { sidebarOpen = false; }

	// Toast on save status changes
	let lastStatus = $state('');
	$effect(() => {
		const s = currentSaveStatus;
		const prev = untrack(() => lastStatus);
		if (s === 'saved' && prev === 'saving') {
			toast.success('Guardado ✓');
		} else if (s === 'error' && prev === 'saving') {
			toast.error('Error al guardar');
		}
		lastStatus = s;
	});

	// Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
	function handleKeydown(e: KeyboardEvent) {
		const tag = (e.target as HTMLElement)?.tagName;
		const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

		// Shortcuts that work even inside inputs
		if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			if (undoEnabled) undoField();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
			e.preventDefault();
			if (redoEnabled) redoField();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			// Settings auto-save, just confirm
			if (currentSaveStatus === 'saving') {
				toast.show('Guardando...');
			} else if (currentSaveStatus === 'error') {
				toast.error('Error al guardar — reintentá');
			} else {
				toast.success('Guardado ✓');
			}
		}

		// Navigation shortcuts (only when not in input)
		if (!isInput && (e.ctrlKey || e.metaKey) && e.key === 'b') {
			e.preventDefault();
			goto('/admin/beats');
		} else if (!isInput && (e.ctrlKey || e.metaKey) && e.key === 'h') {
			e.preventDefault();
			goto('/admin/hero');
		} else if (!isInput && (e.ctrlKey || e.metaKey) && e.key === 't') {
			e.preventDefault();
			goto('/admin/theme');
		} else if (!isInput && (e.ctrlKey || e.metaKey) && e.key === 'd') {
			e.preventDefault();
			goto('/admin');
		} else if (!isInput && (e.ctrlKey || e.metaKey) && e.key === 'g') {
			e.preventDefault();
			goto('/');
		} else if (!isInput && e.key === '/') {
			e.preventDefault();
			document.querySelector<HTMLInputElement>('.search-input')?.focus();
		}
	}

	// Detect active from URL
	let currentPath = $derived(page.url.pathname);

	const navGroups = [
		{
			label: 'Contenido',
			items: [
				{ href: '/admin', label: 'Dashboard', icon: '📊' },
				{ href: '/admin/beats', label: 'Beats', icon: '🎵' },
				{ href: '/admin/hero', label: 'Hero', icon: '🏠' },
				{ href: '/admin/content', label: 'Contenido', icon: '✏️' },
				{ href: '/admin/links', label: 'Links', icon: '🔗' },
				{ href: '/admin/testimonials', label: 'Testimonios', icon: '💬' },
			]
		},
		{
			label: 'Apariencia',
			items: [
				{ href: '/admin/theme', label: 'Tema', icon: '🎨' },
				{ href: '/admin/cardstyle', label: 'Card Style', icon: '🃏' },
				{ href: '/admin/brand', label: 'Brand', icon: '🏢' },
				{ href: '/admin/banner', label: 'Banner', icon: '📢' },
				{ href: '/admin/layout', label: 'Layout', icon: '📐' },
				{ href: '/admin/animations', label: 'Animaciones', icon: '🎬' },
			]
		}
	];

	// Current section label for topbar
	let sectionLabel = $derived.by(() => {
		for (const g of navGroups) {
			for (const item of g.items) {
				if (item.href === currentPath) return item.label;
			}
		}
		return 'Admin';
	});
</script>

<svelte:head>
	<title>Admin — {brandName}</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="admin-layout">
	{#if authState.loading}
		<div class="auth-loading">
			<div class="auth-spinner"></div>
			<span>Conectando...</span>
		</div>
	{:else if authState.error}
		<div class="auth-error" role="alert">
			⚠️ Error de autenticación: {authState.error}
		</div>
	{/if}
	<AdminTopbar {brandName} saveStatus={currentSaveStatus} onSave={() => { if (currentSaveStatus === 'saving') { toast.show('Guardando...'); } else { toast.success('Guardado ✓'); } }} onUndo={undoEnabled ? undoField : undefined} onRedo={redoEnabled ? redoField : undefined} onToggleSidebar={toggleSidebar}>
		<span class="admin-section-label">{sectionLabel}</span>
	</AdminTopbar>

	<div class="admin-body">
		{#if sidebarOpen}
			<div class="sidebar-backdrop" onclick={closeSidebar} onkeydown={(e) => e.key === 'Escape' && closeSidebar()} role="button" tabindex="-1" aria-label="Cerrar menú"></div>
		{/if}
		<aside class="sidebar" class:open={sidebarOpen}>
			{#each navGroups as group, gi}
				{#if gi > 0}
					<div class="sep"></div>
				{/if}
				<div class="group-label">{group.label}</div>
				{#each group.items as item}
					<a
						href={item.href}
						class="si"
						class:active={item.href === '/admin' ? currentPath === '/admin' : currentPath.startsWith(item.href)}
						title={item.label}
						onclick={closeSidebar}
					>
						<span class="si-icon">{item.icon}</span>
						<span class="si-label">{item.label}</span>
					</a>
				{/each}
			{/each}
		</aside>

		<main class="admin-content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.admin-layout {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		background: var(--bg);
	}

	.admin-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.admin-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
	}

	.admin-section-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* Sidebar */
	.sidebar {
		width: 200px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		background: var(--bg-secondary);
		padding: var(--space-4) 0;
		overflow-y: auto;
		height: 100%;
	}

	.sep {
		height: 1px;
		background: var(--border);
		margin: var(--space-3) var(--space-4);
	}

	.group-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		font-weight: 500;
		color: var(--text-hint);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: var(--space-2) var(--space-4);
	}

	.si {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-4);
		min-height: var(--touch-min);
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
		text-align: left;
		text-decoration: none;
	}

	.si:hover {
		color: var(--text);
		background: var(--surface-hover);
	}

	.si.active {
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.08);
	}

	.si-icon {
		font-size: var(--text-sm);
		width: 20px;
		text-align: center;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.admin-content {
			padding: var(--space-4);
		}

		.sidebar {
			position: fixed;
			top: 52px;
			left: 0;
			bottom: 0;
			width: 220px;
			z-index: 100;
			transform: translateX(-100%);
			transition: transform 0.2s ease;
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.sidebar-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			top: 52px;
			background: rgba(0, 0, 0, 0.5);
			z-index: 99;
		}
	}

	.auth-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.auth-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.auth-error {
		padding: var(--space-3) var(--space-4);
		background: var(--danger-glow);
		border-bottom: 1px solid var(--danger-dim);
		color: var(--danger);
		font-size: var(--text-sm);
		text-align: center;
		font-family: var(--font-mono);
	}
</style>
