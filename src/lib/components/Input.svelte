<script lang="ts">
	type InputType = 'text' | 'number' | 'email' | 'password' | 'search';

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		label = '',
		error = '',
		disabled = false,
		id = ''
	}: {
		type?: InputType;
		value?: string | number;
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		id?: string;
	} = $props();

	const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="field">
	{#if label}
		<label class="label" for={inputId}>{label}</label>
	{/if}
	<input
		class="input"
		class:has-error={!!error}
		{type}
		bind:value
		{placeholder}
		{disabled}
		id={inputId}
	/>
	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	.label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.input {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		height: 40px;
		width: 100%;
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.input:hover:not(:disabled) {
		border-color: var(--color-border-hover);
	}

	.input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-glow);
	}

	.input.has-error {
		border-color: var(--color-danger);
	}

	.input.has-error:focus {
		box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.15);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--color-danger);
	}
</style>
