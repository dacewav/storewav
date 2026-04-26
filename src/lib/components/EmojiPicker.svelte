<script lang="ts">
	/**
	 * EmojiPicker — Discord-style floating emoji picker.
	 * Prevents blur by intercepting mousedown on the picker container.
	 */
	import type { CustomEmoji } from '$lib/stores/customEmojis';

	let {
		emojis = [],
		query = '',
		visible = false,
		rect = { top: 0, left: 0, bottom: 0 },
		onselect,
		onclose
	}: {
		emojis?: CustomEmoji[];
		query?: string;
		visible?: boolean;
		rect?: { top: number; left: number; bottom: number };
		onselect?: (emoji: CustomEmoji) => void;
		onclose?: () => void;
	} = $props();

	let selectedIndex = $state(0);
	let listEl: HTMLDivElement | undefined = $state();
	let pickerEl: HTMLDivElement | undefined = $state();

	let filtered = $derived(
		query.length === 0
			? emojis.slice(0, 24)
			: emojis
				.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 24)
	);

	$effect(() => {
		void filtered.length;
		selectedIndex = 0;
	});

	$effect(() => {
		if (!listEl) return;
		void selectedIndex;
		const item = listEl.children[selectedIndex] as HTMLElement | undefined;
		item?.scrollIntoView({ block: 'nearest' });
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!visible || filtered.length === 0) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % filtered.length;
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
				break;
			case 'Enter':
			case 'Tab':
				e.preventDefault();
				if (filtered[selectedIndex]) {
					onselect?.(filtered[selectedIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				onclose?.();
				break;
		}
	}

	/**
	 * CRITICAL: onmousedown on each button (not container) to:
	 * 1. Prevent input blur (e.preventDefault)
	 * 2. Stop event from reaching container's mousedown (e.stopPropagation)
	 * 3. Fire onselect immediately — click events are unreliable after preventDefault
	 */
	function handleEmojiMousedown(e: MouseEvent, emoji: CustomEmoji) {
		e.preventDefault();
		e.stopPropagation();
		onselect?.(emoji);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible && filtered.length > 0}
	<div
		class="emoji-picker"
		style="top: {rect.bottom + 4}px; left: {rect.left}px;"
		role="listbox"
		aria-label="Emojis personalizados"
		bind:this={pickerEl}
	>
		<div class="picker-header">
			<span class="picker-title">Emojis</span>
			<span class="picker-count">{filtered.length}</span>
		</div>
		<div class="picker-grid" bind:this={listEl}>
			{#each filtered as emoji, i}
				<button
					class="picker-emoji"
					class:selected={i === selectedIndex}
					onmousedown={(e) => handleEmojiMousedown(e, emoji)}
					role="option"
					aria-selected={i === selectedIndex}
					title=":{emoji.name}:"
					tabindex="-1"
				>
					<img src={emoji.url} alt=":{emoji.name}:" loading="lazy" />
					<span class="picker-name">:{emoji.name}:</span>
				</button>
			{/each}
		</div>
		<div class="picker-hint">
			<span>↑↓ navegar</span>
			<span>↵ seleccionar</span>
			<span>esc cerrar</span>
		</div>
	</div>
{/if}

<style>
	.emoji-picker {
		position: fixed;
		z-index: 1000;
		width: 320px;
		max-height: 280px;
		background: var(--surface, #1a1a2e);
		border: 1px solid var(--border, #333);
		border-radius: var(--radius-md, 8px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		animation: pickerIn 0.12s ease-out;
		user-select: none;
	}

	@keyframes pickerIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		border-bottom: 1px solid var(--border, #333);
	}

	.picker-title {
		font-family: var(--font-mono, monospace);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted, #888);
	}

	.picker-count {
		font-family: var(--font-mono, monospace);
		font-size: 10px;
		color: var(--text-hint, #666);
	}

	.picker-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2px;
		padding: 6px;
		overflow-y: auto;
		flex: 1;
	}

	.picker-emoji {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 6px 4px;
		border: none;
		background: transparent;
		border-radius: var(--radius-sm, 4px);
		cursor: pointer;
		transition: background 0.1s;
	}

	.picker-emoji:hover,
	.picker-emoji.selected {
		background: rgba(var(--accent-rgb, 220, 38, 38), 0.12);
	}

	.picker-emoji img {
		width: 28px;
		height: 28px;
		object-fit: contain;
	}

	.picker-name {
		font-family: var(--font-mono, monospace);
		font-size: 9px;
		color: var(--text-muted, #888);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.picker-hint {
		display: flex;
		gap: var(--space-3, 12px);
		justify-content: center;
		padding: 4px 10px;
		border-top: 1px solid var(--border, #333);
		font-family: var(--font-mono, monospace);
		font-size: 9px;
		color: var(--text-hint, #666);
	}
</style>
