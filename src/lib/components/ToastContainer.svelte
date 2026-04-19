<script lang="ts">
	import { toasts, type ToastItem } from '$lib/toastStore';

	let items = $derived($toasts);
</script>

{#if items.length > 0}
	<div class="toast-container" role="region" aria-label="Notificaciones">
		{#each items as item (item.id)}
			<div class="toast toast-{item.type}" role="status" aria-live="polite" aria-atomic="true">
				{#if item.type === 'success'}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
				{:else if item.type === 'error'}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
				{:else if item.type === 'warning'}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
				{/if}
				<span>{item.message}</span>
				<button class="toast-close" onclick={() => toasts.remove(item.id)} aria-label="Cerrar">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
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
		transition: all 0.15s;
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
