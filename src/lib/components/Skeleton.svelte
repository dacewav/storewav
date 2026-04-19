<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'card' | 'list' | 'compact';

	let {
		lines = 3,
		aspectRatio = '16/9',
		variant = 'card'
	}: {
		lines?: number;
		aspectRatio?: string;
		variant?: Variant;
	} = $props();

	const widths = ['w60', 'w40', 'w80', 'w70', 'w50'];
</script>

{#if variant === 'card'}
	<div class="skeleton-card">
		<div class="skeleton-img" style="aspect-ratio: {aspectRatio}"></div>
		<div class="skeleton-body">
			{#each Array(lines) as _, i}
				<div class="skeleton-line {widths[i % widths.length]}"></div>
			{/each}
		</div>
	</div>
{:else if variant === 'list'}
	<div class="skeleton-list">
		<div class="skeleton-thumb"></div>
		<div class="skeleton-body">
			{#each Array(lines) as _, i}
				<div class="skeleton-line {widths[i % widths.length]}"></div>
			{/each}
		</div>
	</div>
{:else}
	<div class="skeleton-compact">
		{#each Array(lines) as _, i}
			<div class="skeleton-line {widths[i % widths.length]}"></div>
		{/each}
	</div>
{/if}

<style>
	.skeleton-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		overflow: hidden;
	}

	.skeleton-list {
		display: flex;
		gap: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		align-items: center;
	}

	.skeleton-thumb {
		width: 56px;
		height: 56px;
		flex-shrink: 0;
		border-radius: var(--radius-md);
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(255, 255, 255, 0.04) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	.skeleton-compact {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.skeleton-img {
		width: 100%;
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(255, 255, 255, 0.04) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	.skeleton-body {
		padding: var(--space-4) var(--space-5);
		flex: 1;
		min-width: 0;
	}

	.skeleton-compact .skeleton-body,
	.skeleton-list .skeleton-body {
		padding: 0;
	}

	.skeleton-line {
		height: 12px;
		border-radius: var(--radius-sm);
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(255, 255, 255, 0.04) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		margin-bottom: var(--space-2);
	}

	.skeleton-line:last-child {
		margin-bottom: 0;
	}

	.w40 { width: 40%; }
	.w50 { width: 50%; }
	.w60 { width: 60%; }
	.w70 { width: 70%; }
	.w80 { width: 80%; }

	@keyframes shimmer {
		0% { background-position: -200% 0; }
		100% { background-position: 200% 0; }
	}
</style>
