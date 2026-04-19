<script lang="ts">
	import { toasts, type ToastItem } from '$lib/toastStore';
	import Icon from './Icon.svelte';

	let items = $derived($toasts);
</script>

{#if items.length > 0}
	<div class="toast-container" role="region" aria-label="Notificaciones">
		{#each items as item (item.id)}
			<div class="toast toast-{item.type}" role="status" aria-live="polite" aria-atomic="true">
				{#if item.type === 'success'}
					<Icon name="check" size={14} />
				{:else if item.type === 'error'}
					<Icon name="error" size={14} />
				{:else if item.type === 'warning'}
					<Icon name="warning" size={14} />
				{/if}
				<span>{item.message}</span>
				<button class="toast-close" onclick={() => toasts.remove(item.id)} aria-label="Cerrar">
					<Icon name="close" size={12} />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: var(--space-6);
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--z-toast);
		display: flex;
		flex-direction: column-reverse;
		gap: var(--space-2);
		align-items: center;
		width: 100%;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4) var(--space-3) var(--space-5);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		font-size: var(--text-sm);
		color: var(--text);
		animation: toastIn 0.3s var(--ease-out);
		max-width: min(90vw, 400px);
		word-break: break-word;
		pointer-events: auto;
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

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
		margin-left: var(--space-1);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.toast-close:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	@keyframes toastIn {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
