<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

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
		<span class="chevron" class:rotated={open}><Icon name="chevronDown" size={14} /></span>
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
		transition: background var(--duration-fast);
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

	.body-wrap {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.25s var(--ease-out);
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
