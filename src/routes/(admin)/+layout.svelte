<script lang="ts">
	import { AdminTopbar } from '$lib/components';
	import { auth, settings, saveStatus as saveStatusStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let authState = $derived($auth);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	// Redirect a login si no está autenticado, o a / si no es admin
	$effect(() => {
		if (!authState.loading && !authState.user) {
			goto('/login');
		} else if (!authState.loading && authState.user && !authState.isAdmin) {
			goto('/');
		}
	});

	let currentSaveStatus = $derived($saveStatusStore);

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
			]
		},
		{
			label: 'Apariencia',
			items: [
				{ href: '/admin/theme', label: 'Tema', icon: '🎨' },
				{ href: '/admin/brand', label: 'Brand', icon: '🏢' },
				{ href: '/admin/banner', label: 'Banner', icon: '📢' },
				{ href: '/admin/layout', label: 'Layout', icon: '📐' },
				{ href: '/admin/animations', label: 'Animaciones', icon: '🎬' },
			]
		}
	];

	// Current section label for topbar
	let sectionLabel = $derived(() => {
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

<div class="admin-layout">
	<AdminTopbar {brandName} saveStatus={currentSaveStatus} onSave={() => {}}>
		<span class="admin-section-label">{sectionLabel()}</span>
	</AdminTopbar>

	<div class="admin-body">
		<aside class="sidebar">
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
			width: 56px;
		}

		.group-label,
		.si-label {
			display: none;
		}

		.si {
			justify-content: center;
			padding: var(--space-3);
		}

		.si-icon {
			width: auto;
		}
	}
</style>
