<script lang="ts">
	/**
	 * EmojiPicker — Discord-style floating emoji picker.
	 *
	 * Features:
	 * - onmousedown on each button (not container) for reliable click
	 * - "No results" state when query has no matches
	 * - "No emojis" state when store is empty
	 * - Keyboard navigation (↑↓ Enter Tab Esc)
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

	let hasResults = $derived(filtered.length > 0);
	let showNoResults = $derived(visible && emojis.length > 0 && filtered.length === 0 && query.length > 0);
	let showNoEmojis = $derived(visible && emojis.length === 0);

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
		if (!visible) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			onclose?.();
			return;
		}

		if (!hasResults) return;

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

{#if visible && (hasResults || showNoResults || showNoEmojis)}
	<div
		class="emoji-picker"
		style="top: {rect.bottom + 4}px; left: {rect.left}px;"
		role="listbox"
		aria-label="Emojis personalizados"
		bind:this={pickerEl}
	>
		<div class="picker-header">
			<span class="picker-title">Emojis</span>
			<span class="picker-count">{emojis.length}</span>
		</div>

		{#if showNoEmojis}
			<div class="picker-empty">
				<span class="picker-empty-icon">😶</span>
				<span class="picker-empty-text">No hay emojis custom</span>
				<span class="picker-empty-hint">Creá emojis en Admin → Emojis</span>
			</div>
		{:else if showNoResults}
			<div class="picker-empty">
				<span class="picker-empty-icon">🔍</span>
				<span class="picker-empty-text">Sin resultados para ":{query}:"</span>
			</div>
		{:else}
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
		{/if}

		{#if hasResults}
			<div class="picker-hint">
				<span>↑↓ navegar</span>
				<span>↵ seleccionar</span>
				<span>esc cerrar</span>
			</div>
		{/if}
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

	.picker-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 20px 12px;
	}

	.picker-empty-icon {
		font-size: 24px;
		opacity: 0.5;
	}

	.picker-empty-text {
		font-family: var(--font-mono, monospace);
		font-size: 11px;
		color: var(--text-muted, #888);
		text-align: center;
	}

	.picker-empty-hint {
		font-family: var(--font-mono, monospace);
		font-size: 10px;
		color: var(--text-hint, #666);
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
