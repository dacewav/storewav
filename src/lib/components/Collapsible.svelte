<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		open = $bindable(true),
		children
	}: {
		title: string;
		open?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="collapsible">
	<button class="header" onclick={() => open = !open} aria-expanded={open}>
		<span class="title">{title}</span>
		<svg class="chevron" class:rotated={open} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M6 9l6 6 6-6"/>
		</svg>
	</button>
	{#if open}
		<div class="body">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.collapsible {
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		overflow: hidden;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-3) var(--space-4);
		min-height: var(--touch-min);
		background: transparent;
		border: none;
		color: var(--text);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
		text-align: left;
	}

	.header:hover {
		background: var(--surface-hover);
	}

	.title {
		font-family: var(--font-body);
	}

	.chevron {
		color: var(--text-muted);
		transition: transform 0.2s var(--ease-out);
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.body {
		padding: var(--space-4);
		border-top: 1px solid var(--border);
	}
</style>
