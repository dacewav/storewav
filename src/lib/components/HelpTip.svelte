<script lang="ts">
	/**
	 * HelpTip — small "?" icon with tooltip explaining what a section/field does.
	 * Hover or tap to show.
	 */
	let {
		text = '',
		position = 'right' // 'top' | 'right' | 'bottom' | 'left'
	}: {
		text?: string;
		position?: 'top' | 'right' | 'bottom' | 'left';
	} = $props();

	let show = $state(false);
</script>

<button
	class="help-tip"
	class:show
	onmouseenter={() => (show = true)}
	onmouseleave={() => (show = false)}
	onfocus={() => (show = true)}
	onblur={() => (show = false)}
	aria-label="Ayuda"
	title={text}
>
	<span class="help-icon">?</span>
	{#if show}
		<div class="help-tooltip {position}">
			{text}
		</div>
	{/if}
</button>

<style>
	.help-tip {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--surface);
		cursor: help;
		flex-shrink: 0;
		padding: 0;
		transition: all var(--duration-fast);
	}

	.help-tip:hover,
	.help-tip.show {
		border-color: rgba(var(--accent-rgb), 0.4);
		background: rgba(var(--accent-rgb), 0.08);
	}

	.help-icon {
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 700;
		color: var(--text-muted);
		line-height: 1;
	}

	.help-tooltip {
		position: absolute;
		z-index: 100;
		width: 220px;
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		line-height: 1.5;
		pointer-events: none;
		animation: fadeIn 0.15s ease;
	}

	.help-tooltip.right {
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}

	.help-tooltip.left {
		right: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}

	.help-tooltip.top {
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
	}

	.help-tooltip.bottom {
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
