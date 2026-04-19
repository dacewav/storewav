<script lang="ts">
	type NavItem = { id: string; label: string; icon: string };
	type NavGroup = { label: string; items: NavItem[] };

	let {
		groups,
		active = $bindable(groups[0]?.items[0]?.id ?? '')
	}: {
		groups: NavGroup[];
		active?: string;
	} = $props();
</script>

<aside class="sidebar">
	{#each groups as group, gi}
		{#if gi > 0}
			<div class="sep"></div>
		{/if}
		<div class="group-label">{group.label}</div>
		{#each group.items as item}
			<button
				class="si"
				class:active={active === item.id}
				onclick={() => active = item.id}
				title={item.label}
				aria-label={item.label}
			>
				<span class="si-icon">{item.icon}</span>
				<span class="si-label">{item.label}</span>
			</button>
		{/each}
	{/each}
</aside>

<style>
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

	.si-label {
		font-family: var(--font-body);
	}

	@media (max-width: 768px) {
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
