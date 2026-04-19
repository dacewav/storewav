<script lang="ts">
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
	<div class="toast toast-{type}" role="status" aria-live="polite">
		{#if type === 'success'}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
		{:else if type === 'error'}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
		{:else if type === 'warning'}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
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
