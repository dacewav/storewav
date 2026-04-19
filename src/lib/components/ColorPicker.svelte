<script lang="ts">
	let {
		value = $bindable('#dc2626'),
		label = ''
	}: {
		value?: string;
		label?: string;
	} = $props();

	let hexInput = $state(value);

	function onColorChange(e: Event) {
		value = (e.target as HTMLInputElement).value;
		hexInput = value;
	}

	function onHexInput() {
		if (/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
			value = hexInput;
		}
	}
</script>

<div class="field">
	{#if label}
		<span class="label">{label}</span>
	{/if}
	<div class="picker-row">
		<div class="swatch-wrap">
			<input
				type="color"
				class="native-picker"
				{value}
				oninput={onColorChange}
			/>
			<div class="swatch" style="background: {value}"></div>
		</div>
		<input
			type="text"
			class="hex-input"
			bind:value={hexInput}
			oninput={onHexInput}
			placeholder="#dc2626"
			maxlength="7"
		/>
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.label {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-secondary);
	}

	.picker-row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.swatch-wrap {
		position: relative;
		width: var(--touch-min);
		height: var(--touch-min);
		flex-shrink: 0;
	}

	.native-picker {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.swatch {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-md);
		border: 2px solid var(--border2);
		pointer-events: none;
		transition: border-color 0.15s;
	}

	.swatch-wrap:hover .swatch {
		border-color: var(--accent);
	}

	.hex-input {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-2) var(--space-3);
		min-height: var(--touch-min);
		width: 100px;
		outline: none;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.hex-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}
</style>
