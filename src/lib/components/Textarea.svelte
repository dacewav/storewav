<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = '',
		label = '',
		error = '',
		rows = 3,
		disabled = false,
		id = ''
	}: {
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		rows?: number;
		disabled?: boolean;
		id?: string;
	} = $props();

	const textareaId = $derived(id || undefined);
</script>

<div class="field">
	{#if label}
		<label class="label" for={textareaId}>{label}</label>
	{/if}
	<textarea
		class="textarea"
		class:has-error={!!error}
		id={textareaId}
		bind:value
		{placeholder}
		{rows}
		{disabled}
	></textarea>
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

	.textarea {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		width: 100%;
		resize: vertical;
		min-height: calc(var(--touch-min) * 1.5);
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
		line-height: 1.6;
	}

	.textarea::placeholder {
		color: var(--text-muted);
	}

	.textarea:hover:not(:disabled) {
		border-color: var(--border-hover);
	}

	.textarea:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.textarea.has-error {
		border-color: var(--danger);
	}

	.textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--danger);
	}
</style>
