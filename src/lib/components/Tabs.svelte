<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tab = { id: string; label: string };

	let {
		tabs,
		active = $bindable(tabs[0]?.id ?? ''),
		children
	}: {
		tabs: Tab[];
		active?: string;
		children: Snippet<[string]>;
	} = $props();
</script>

<div class="tabs">
	<div class="tab-bar" role="tablist">
		{#each tabs as tab}
			<button
				class="tab"
				class:active={active === tab.id}
				role="tab"
				aria-selected={active === tab.id}
				onclick={() => active = tab.id}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	<div class="tab-panel" role="tabpanel">
		{@render children(active)}
	</div>
</div>

<style>
	.tabs {
		width: 100%;
	}

	.tab-bar {
		display: flex;
		gap: 0;
		border-bottom: 1px solid var(--border);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tab-bar::-webkit-scrollbar {
		display: none;
	}

	.tab {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
		background: transparent;
		border: none;
		padding: var(--space-3) var(--space-4);
		cursor: pointer;
		white-space: nowrap;
		position: relative;
		transition: color 0.15s;
		min-height: var(--touch-min);
	}

	.tab:hover {
		color: var(--text);
	}

	.tab::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--accent);
		transform: scaleX(0);
		transition: transform 0.2s var(--ease-out);
	}

	.tab.active {
		color: var(--text);
	}

	.tab.active::after {
		transform: scaleX(1);
	}

	.tab-panel {
		padding-top: var(--space-4);
	}
</style>
