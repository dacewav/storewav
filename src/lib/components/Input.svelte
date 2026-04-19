<script lang="ts">
	type InputType = 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';

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

	const inputId = $derived(id || undefined);
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
		color: var(--text-secondary);
	}

	.input {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		min-height: var(--touch-min);
		width: 100%;
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
	}

	.input::placeholder {
		color: var(--text-muted);
	}

	.input:hover:not(:disabled) {
		border-color: var(--border-hover);
	}

	.input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.input.has-error {
		border-color: var(--danger);
	}

	.input.has-error:focus {
		box-shadow: 0 0 0 3px var(--danger-glow);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--danger);
	}
</style>
