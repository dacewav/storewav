<script lang="ts">
	let {
		checked = $bindable(false),
		label = '',
		disabled = false
	}: {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
	} = $props();
</script>

<label class="toggle" class:disabled>
	<span class="toggle-switch">
		<input type="checkbox" bind:checked {disabled} />
		<span class="track">
			<span class="thumb"></span>
		</span>
	</span>
	{#if label}
		<span class="toggle-label">{label}</span>
	{/if}
</label>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;
		min-height: var(--touch-min);
		user-select: none;
	}

	.toggle.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-switch {
		position: relative;
		flex-shrink: 0;
	}

	.toggle-switch input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.track {
		display: block;
		width: 40px;
		height: 22px;
		background: var(--surface2);
		border: 1px solid var(--border2);
		border-radius: var(--radius-full);
		transition: all var(--duration-fast) var(--ease-out);
		position: relative;
	}

	.thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: var(--text-secondary);
		border-radius: 50%;
		transition: all var(--duration-fast) var(--ease-out);
	}

	input:checked + .track {
		background: rgba(var(--accent-rgb), 0.3);
		border-color: var(--accent);
	}

	input:checked + .track .thumb {
		left: 20px;
		background: var(--accent);
		box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.4);
	}

	input:focus-visible + .track {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.toggle-label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
</style>
