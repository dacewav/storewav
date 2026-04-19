<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		onclick,
		children
	}: {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

<button
	class="btn btn-{variant} btn-{size}"
	{disabled}
	{type}
	onclick={onclick}
>
	{#if loading}
		<span class="spinner"></span>
	{/if}
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--font-body);
		font-weight: 500;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		white-space: nowrap;
		user-select: none;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── Sizes ── */
	.btn-sm {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		height: 32px;
	}

	.btn-md {
		font-size: var(--text-sm);
		padding: var(--space-2) var(--space-4);
		height: 40px;
	}

	.btn-lg {
		font-size: var(--text-base);
		padding: var(--space-3) var(--space-6);
		height: 48px;
	}

	/* ── Primary ── */
	.btn-primary {
		background: var(--color-accent);
		color: var(--color-bg);
		font-weight: 600;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-accent-dim);
		box-shadow: var(--glow-accent);
	}

	.btn-primary:active:not(:disabled) {
		transform: scale(0.97);
	}

	/* ── Secondary ── */
	.btn-secondary {
		background: var(--color-surface);
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-surface-hover);
		border-color: var(--color-border-hover);
	}

	.btn-secondary:active:not(:disabled) {
		transform: scale(0.97);
	}

	/* ── Ghost ── */
	.btn-ghost {
		background: transparent;
		color: var(--color-text-secondary);
	}

	.btn-ghost:hover:not(:disabled) {
		background: var(--color-surface);
		color: var(--color-text);
	}

	/* ── Danger ── */
	.btn-danger {
		background: var(--color-danger);
		color: var(--color-text);
		font-weight: 600;
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--color-danger-dim);
		box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
	}

	.btn-danger:active:not(:disabled) {
		transform: scale(0.97);
	}

	/* ── Spinner ── */
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: var(--radius-full);
		animation: spin 600ms linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
