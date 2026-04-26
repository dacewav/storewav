<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		id = '',
		title,
		icon = '',
		badge = '',
		badgeVariant = 'default',
		open = $bindable(true),
		preview,
		children
	}: {
		id?: string;
		title: string;
		icon?: string;
		badge?: string;
		badgeVariant?: 'default' | 'active' | 'accent' | 'warning';
		open?: boolean;
		preview?: Snippet;
		children: Snippet;
	} = $props();

	// Persist collapsed state to localStorage
	const storageKey = $derived(id ? `admin-collapse-${id}` : '');

	$effect(() => {
		if (!storageKey || typeof window === 'undefined') return;
		const saved = localStorage.getItem(storageKey);
		if (saved !== null) {
			open = saved === 'true';
		}
	});

	function toggle() {
		open = !open;
		if (storageKey && typeof window !== 'undefined') {
			localStorage.setItem(storageKey, String(open));
		}
	}
</script>

<div class="collapsible" class:collapsed={!open}>
	<button class="header" onclick={toggle} aria-expanded={open}>
		<div class="header-left">
			{#if icon}
				<span class="section-icon">{icon}</span>
			{/if}
			<span class="title">{title}</span>
		</div>
		<div class="header-right">
			{#if badge}
				<span class="badge badge-{badgeVariant}">{badge}</span>
			{/if}
			{#if preview}
				<div class="header-preview" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
					{@render preview()}
				</div>
			{/if}
			<span class="chevron" class:rotated={open}><Icon name="chevronDown" size={14} /></span>
		</div>
	</button>
	<div class="body-wrap" class:open>
		<div class="body">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.collapsible {
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		overflow: hidden;
		transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
	}
	.collapsible:hover {
		border-color: rgba(var(--accent-rgb), 0.15);
	}
	.collapsible:not(.collapsed) {
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-3) var(--space-4);
		min-height: 48px;
		background: transparent;
		border: none;
		color: var(--text);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background var(--duration-fast);
		text-align: left;
		gap: var(--space-3);
	}

	.header:hover {
		background: rgba(var(--accent-rgb), 0.04);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.section-icon {
		font-size: 1.15rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.title {
		font-family: var(--font-display);
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.header-preview {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.badge {
		font-family: var(--font-mono);
		font-size: 9px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.badge-default {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text-muted);
	}
	.badge-active {
		background: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
	}
	.badge-accent {
		background: var(--accent);
		color: #fff;
	}
	.badge-warning {
		background: rgba(255, 170, 0, 0.15);
		color: #ffaa00;
	}

	.chevron {
		color: var(--text-muted);
		transition: transform var(--duration-fast) var(--ease-out);
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.body-wrap {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--duration-normal) var(--ease-out);
	}

	.body-wrap.open {
		grid-template-rows: 1fr;
	}

	.body {
		overflow: hidden;
		padding: 0 var(--space-4);
	}

	.body-wrap.open .body {
		padding: var(--space-4);
		border-top: 1px solid var(--border);
	}
</style>
