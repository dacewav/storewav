<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		hoverable = false,
		padding = true,
		children
	}: {
		hoverable?: boolean;
		padding?: boolean;
		children: Snippet;
	} = $props();
</script>

<article class="card" class:hoverable class:padding>
	{@render children()}
</article>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition:
			transform var(--duration-normal) var(--ease-out),
			border-color var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out);
	}

	.card.padding {
		padding: var(--space-5);
	}

	.card.hoverable {
		cursor: pointer;
	}

	.card.hoverable:hover {
		border-color: var(--border-hover-accent);
		box-shadow:
			var(--shadow-lg),
			0 0 30px rgba(var(--accent-rgb), 0.08);
		transform: translateY(-2px);
	}

	.card.hoverable:active {
		transform: translateY(0);
	}
</style>
