<script lang="ts">
	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		label = '',
		showValue = true,
		unit = '',
		disabled = false
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		showValue?: boolean;
		unit?: string;
		disabled?: boolean;
	} = $props();

	const pct = $derived(max > min ? ((value - min) / (max - min)) * 100 : 0);
</script>

<div class="field">
	{#if label || showValue}
		<div class="header">
			{#if label}
				<span class="label">{label}</span>
			{/if}
			{#if showValue}
				<span class="value">{value}{unit}</span>
			{/if}
		</div>
	{/if}
	<div class="track-wrap">
		<div class="fill" style="width: {pct}%"></div>
		<input
			type="range"
			class="range"
			bind:value
			{min}
			{max}
			{step}
			{disabled}
		/>
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.value {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
	}

	.track-wrap {
		position: relative;
		height: var(--touch-min);
		display: flex;
		align-items: center;
	}

	.fill {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		height: 4px;
		background: var(--accent);
		border-radius: 2px;
		pointer-events: none;
		transition: width 0.05s;
	}

	.range {
		width: 100%;
		height: 4px;
		background: var(--surface2);
		border-radius: 2px;
		appearance: none;
		outline: none;
		cursor: pointer;
		position: relative;
		z-index: 1;
	}

	.range::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		transition: transform var(--duration-fast);
	}

	.range::-webkit-slider-thumb:hover {
		transform: scale(1.2);
	}

	.range::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bg);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
	}

	.range:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
