<script lang="ts">
	import { AdminTopbar, AdminSidebar } from '$lib/components';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let activeSection = $state('dashboard');
	let saveStatus = $state<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

	const navGroups = [
		{
			label: 'General',
			items: [
				{ id: 'dashboard', label: 'Dashboard', icon: '📊' },
				{ id: 'beats', label: 'Beats', icon: '🎵' },
				{ id: 'orders', label: 'Pedidos', icon: '📦' }
			]
		},
		{
			label: 'Apariencia',
			items: [
				{ id: 'theme', label: 'Tema', icon: '🎨' },
				{ id: 'content', label: 'Contenido', icon: '✏️' },
				{ id: 'banner', label: 'Banner', icon: '📢' }
			]
		},
		{
			label: 'Sistema',
			items: [
				{ id: 'settings', label: 'Ajustes', icon: '⚙️' },
				{ id: 'analytics', label: 'Analytics', icon: '📈' }
			]
		}
	];
</script>

<svelte:head>
	<title>Admin — DACEWAV</title>
</svelte:head>

<div class="admin-layout">
	<AdminTopbar {saveStatus} onSave={() => {}}>
		<span class="admin-section-label">{activeSection}</span>
	</AdminTopbar>

	<div class="admin-body">
		<AdminSidebar groups={navGroups} bind:active={activeSection} />

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

	@media (max-width: 768px) {
		.admin-content {
			padding: var(--space-4);
		}
	}
</style>
