<script lang="ts">
	type Option = { value: string; label: string };

	let {
		value = $bindable(''),
		options = [],
		label = '',
		disabled = false,
		id = ''
	}: {
		value?: string;
		options: Option[];
		label?: string;
		disabled?: boolean;
		id?: string;
	} = $props();

	const selectId = $derived(id || `select-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div class="field">
	{#if label}
		<label class="label" for={selectId}>{label}</label>
	{/if}
	<div class="select-wrap">
		<select
			class="select"
			id={selectId}
			bind:value
			{disabled}
		>
			{#each options as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		<svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M6 9l6 6 6-6"/>
		</svg>
	</div>
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

	.select-wrap {
		position: relative;
	}

	.select {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		padding-right: var(--space-8);
		min-height: var(--touch-min);
		width: 100%;
		appearance: none;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
	}

	.select:hover:not(:disabled) {
		border-color: var(--border-hover);
	}

	.select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.chevron {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}
</style>
