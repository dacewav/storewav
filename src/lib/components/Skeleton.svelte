<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'card' | 'list' | 'compact' | 'beatcard';

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

{#if variant === 'beatcard'}
	<div class="skeleton-beatcard">
		<div class="skeleton-bc-cover">
			<div class="skeleton-bc-genre"></div>
			<div class="skeleton-bc-play"></div>
			<div class="skeleton-bc-wish"></div>
			<div class="skeleton-bc-cart"></div>
		</div>
		<div class="skeleton-bc-info">
			<div class="skeleton-bc-title"></div>
			<div class="skeleton-bc-meta">
				<div class="skeleton-line w40"></div>
				<div class="skeleton-dot"></div>
				<div class="skeleton-line w20"></div>
			</div>
			<div class="skeleton-bc-tags">
				<div class="skeleton-tag"></div>
				<div class="skeleton-tag w60"></div>
			</div>
			<div class="skeleton-bc-price">
				<div class="skeleton-line w30"></div>
			</div>
		</div>
	</div>
{:else if variant === 'card'}
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
	/* ── BeatCard skeleton ── */
	.skeleton-beatcard {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		overflow: hidden;
	}

	.skeleton-bc-cover {
		position: relative;
		aspect-ratio: 16/9;
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(var(--accent-rgb), 0.06) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	.skeleton-bc-genre {
		position: absolute;
		top: 8px;
		left: 8px;
		width: 60px;
		height: 18px;
		border-radius: var(--radius-full);
		background: var(--surface2);
		opacity: 0.6;
	}

	.skeleton-bc-play {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--surface2);
		opacity: 0.5;
	}

	.skeleton-bc-wish {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--surface2);
		opacity: 0.4;
	}

	.skeleton-bc-cart {
		position: absolute;
		bottom: 8px;
		right: 8px;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--surface2);
		opacity: 0.4;
	}

	.skeleton-bc-info {
		padding: var(--space-3) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.skeleton-bc-title {
		width: 70%;
		height: 14px;
		border-radius: var(--radius-sm);
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(var(--accent-rgb), 0.06) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	.skeleton-bc-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.skeleton-dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--surface2);
	}

	.skeleton-bc-tags {
		display: flex;
		gap: var(--space-2);
	}

	.skeleton-tag {
		width: 48px;
		height: 20px;
		border-radius: var(--radius-full);
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(var(--accent-rgb), 0.06) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	.skeleton-bc-price {
		margin-top: var(--space-1);
	}

	/* ── Generic card ── */
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
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(var(--accent-rgb), 0.08) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
	}

	.skeleton-compact {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.skeleton-img {
		width: 100%;
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(var(--accent-rgb), 0.08) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
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
		background: linear-gradient(90deg, var(--surface2) 25%, rgba(var(--accent-rgb), 0.08) 50%, var(--surface2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
		margin-bottom: var(--space-2);
	}

	.skeleton-line:last-child {
		margin-bottom: 0;
	}

	.w20 { width: 20%; }
	.w30 { width: 30%; }
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
