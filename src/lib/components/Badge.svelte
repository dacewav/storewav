<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'accent' | 'danger' | 'warning' | 'muted';

	let {
		variant = 'default',
		children
	}: {
		variant?: Variant;
		children: Snippet;
	} = $props();
</script>

<span class="badge badge-{variant}">
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		white-space: nowrap;
	}

	.badge-default {
		background: var(--surface);
		color: var(--text-secondary);
		border: 1px solid var(--border);
	}

	.badge-accent {
		background: var(--accent-glow);
		color: var(--accent);
		border: 1px solid var(--accent-dim);
	}

	.badge-danger {
		background: var(--danger-glow);
		color: var(--danger);
		border: 1px solid var(--danger-dim);
	}

	.badge-warning {
		background: var(--warning-glow);
		color: var(--warning);
		border: 1px solid var(--warning-dim);
	}

	.badge-muted {
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
	}
</style>
