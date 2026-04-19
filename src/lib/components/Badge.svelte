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
		background: var(--color-surface);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.badge-accent {
		background: var(--color-accent-glow);
		color: var(--color-accent);
		border: 1px solid var(--color-accent-dim);
	}

	.badge-danger {
		background: rgba(255, 68, 68, 0.15);
		color: var(--color-danger);
		border: 1px solid var(--color-danger-dim);
	}

	.badge-warning {
		background: rgba(255, 170, 0, 0.15);
		color: var(--color-warning);
		border: 1px solid rgba(255, 170, 0, 0.3);
	}

	.badge-muted {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}
</style>
