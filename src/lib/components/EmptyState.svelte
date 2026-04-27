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
		padding: var(--space-16) var(--space-4);
		color: var(--text-muted);
		animation: fadeIn 0.5s var(--ease-out);
	}

	.empty-icon {
		font-size: var(--text-5xl);
		margin-bottom: var(--space-4);
		opacity: 0.25;
		animation: float 3s ease-in-out infinite;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
	}

	.empty-sub {
		font-size: var(--text-sm);
		color: var(--text-muted);
		max-width: 360px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.empty-action {
		margin-top: var(--space-6);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}
</style>
