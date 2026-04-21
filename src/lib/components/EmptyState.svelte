<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		icon = '🎵',
		title = 'Sin resultados',
		subtitle = '',
		action
	}: {
		icon?: string;
		title?: string;
		subtitle?: string;
		action?: Snippet;
	} = $props();
</script>

<div class="empty">
	<div class="empty-icon">{icon}</div>
	<div class="empty-title">{title}</div>
	{#if subtitle}
		<div class="empty-sub">{subtitle}</div>
	{/if}
	{#if action}
		<div class="empty-action">
			{@render action()}
		</div>
	{/if}
</div>

<style>
	.empty {
		text-align: center;
		padding: var(--space-12) var(--space-4);
		color: var(--text-muted);
	}

	.empty-icon {
		font-size: var(--text-4xl);
		margin-bottom: var(--space-4);
		opacity: 0.3;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-2);
	}

	.empty-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 360px;
		margin: 0 auto;
	}

	.empty-action {
		margin-top: var(--space-4);
	}
</style>
