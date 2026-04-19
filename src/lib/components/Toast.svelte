<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		message = '',
		visible = $bindable(false),
		type = 'default',
		duration = 2800
	}: {
		message?: string;
		visible?: boolean;
		type?: 'default' | 'success' | 'error' | 'warning';
		duration?: number;
	} = $props();

	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (visible && duration > 0) {
			clearTimeout(timer);
			timer = setTimeout(() => { visible = false; }, duration);
		}
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div class="toast toast-{type}" role="status" aria-live="polite" aria-atomic="true">
		{#if type === 'success'}
			<Icon name="check" size={14} />
		{:else if type === 'error'}
			<Icon name="error" size={14} />
		{:else if type === 'warning'}
			<Icon name="warning" size={14} />
		{/if}
		<span>{message}</span>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: var(--space-6);
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--z-toast);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-5);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		font-size: var(--text-sm);
		color: var(--text);
		animation: toastIn 0.3s var(--ease-out);
		max-width: min(90vw, 400px);
		word-break: break-word;
	}

	.toast-success {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	.toast-error {
		border-color: var(--danger-dim);
		color: var(--danger);
	}

	.toast-warning {
		border-color: var(--warning-dim);
		color: var(--warning);
	}

	@keyframes toastIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
