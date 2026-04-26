<script lang="ts">
	/**
	 * EmojiInput — textarea/input with Discord-style emoji autocomplete.
	 *
	 * Fixes applied:
	 * - Reactive picker: re-runs updatePicker when emojis load from Firebase
	 * - Preview always shows when text contains potential shortcodes
	 * - Picker shows "no results" state when query has no matches
	 * - Robust cursor tracking across blur/focus cycles
	 */
	import { customEmojis } from '$lib/stores';
	import { findEmojiQuery, insertEmoji, renderEmojis } from '$lib/emojiUtils';
	import EmojiPicker from './EmojiPicker.svelte';
	import type { CustomEmoji } from '$lib/stores/customEmojis';
	import type { Snippet } from 'svelte';

	let {
		value = $bindable(''),
		placeholder = '',
		rows = 3,
		multiline = true,
		disabled = false,
		oninput,
		label
	}: {
		value?: string;
		placeholder?: string;
		rows?: number;
		multiline?: boolean;
		disabled?: boolean;
		oninput?: (value: string) => void;
		label?: Snippet;
	} = $props();

	let inputEl: HTMLTextAreaElement | HTMLInputElement | undefined = $state();
	let emojis = $derived($customEmojis);

	// LOCAL VALUE: independent from parent's Firebase-derived prop.
	// The parent passes `value` from a Firebase store that may not update
	// if writes fail (e.g. anonymous users without permissions). We manage
	// our own `inputValue` so the DOM never reverts typed text.
	let inputValue = $state(value);

	// Sync parent → local ONLY when input is not focused (e.g. Firebase update)
	$effect(() => {
		const parentVal = value;
		if (inputEl && inputEl !== document.activeElement) {
			inputValue = parentVal;
		}
	});

	// Picker state
	let pickerVisible = $state(false);
	let pickerQuery = $state('');
	let pickerRect = $state({ top: 0, left: 0, bottom: 0 });
	let lastColonPos = $state(-1);
	let lastQueryEnd = $state(-1); // track end pos of the query when picker opens
	let isSelecting = $state(false); // prevent blur from closing picker during selection
	let lastSelectTime = $state(0); // debounce double-fire from pointerdown+click

	// Preview — show whenever text has ":" (potential shortcode being typed)
	let hasShortcodes = $derived(/:[a-zA-Z0-9_+-]+:?/.test(inputValue));
	let renderedPreview = $derived(
		hasShortcodes && emojis.length > 0 ? renderEmojis(inputValue, emojis) : ''
	);

	// Show raw text with styled shortcodes when emojis aren't loaded yet
	let previewHtml = $derived(
		renderedPreview || (hasShortcodes
			? inputValue.replace(/:([a-zA-Z0-9_+-]+):?/g, '<span class="emoji-pending">:$1:</span>')
			: '')
	);

	// KEY FIX: re-run picker logic when emojis array changes (Firebase loads late)
	$effect(() => {
		void emojis.length; // track dependency
		if (inputEl && inputEl === document.activeElement) {
			updatePicker();
		}
	});

	function handleInput() {
		// Sync local → parent
		value = inputValue;
		oninput?.(inputValue);
		updatePicker();
	}

	function updatePicker() {
		if (!inputEl) return;
		const pos = inputEl.selectionStart ?? 0;
		const query = findEmojiQuery(inputValue, pos);

		if (query && emojis.length > 0) {
			pickerQuery = query.query;
			lastColonPos = query.start;
			lastQueryEnd = query.end;
			pickerVisible = true;
			positionPicker(query.start);
		} else if (query && emojis.length === 0) {
			// Has query but emojis not loaded yet — keep tracking
			pickerQuery = query.query;
			lastColonPos = query.start;
			lastQueryEnd = query.end;
			pickerVisible = false;
		} else {
			closePicker();
		}
	}

	function positionPicker(colonPos: number) {
		if (!inputEl) return;

		const rect = inputEl.getBoundingClientRect();
		const style = getComputedStyle(inputEl);

		const mirror = document.createElement('div');
		mirror.style.cssText = `
			position: absolute; visibility: hidden; white-space: pre-wrap; word-wrap: break-word;
			font: ${style.font}; padding: ${style.padding}; width: ${style.width};
			line-height: ${style.lineHeight}; border: ${style.border};
		`;
		mirror.textContent = inputValue.slice(0, colonPos);
		const span = document.createElement('span');
		span.textContent = inputValue.slice(colonPos, colonPos + 1) || '.';
		mirror.appendChild(span);
		document.body.appendChild(mirror);

		const spanRect = span.getBoundingClientRect();
		const mirrorRect = mirror.getBoundingClientRect();
		const offsetX = spanRect.left - mirrorRect.left;
		const offsetY = spanRect.top - mirrorRect.top;

		document.body.removeChild(mirror);

		const lineHeight = parseFloat(style.lineHeight) || 20;

		pickerRect = {
			top: rect.top + parseFloat(style.paddingTop || '0') + offsetY,
			left: rect.left + parseFloat(style.paddingLeft || '0') + offsetX,
			bottom: rect.top + parseFloat(style.paddingTop || '0') + offsetY + lineHeight + 4
		};
	}

	function handleSelect(emoji: CustomEmoji) {
		// Debounce: onpointerdown + onclick both fire onselect — skip duplicates
		const now = Date.now();
		if (now - lastSelectTime < 150) return;
		lastSelectTime = now;

		// Block blur handler from closing picker during selection
		isSelecting = true;

		// CRITICAL: Read from DOM directly, not from `inputValue` state.
		// The `inputValue` may be stale if the parent's Firebase write failed
		// (no optimistic update) — but the DOM textarea/input always has the
		// user's actual typed text.
		const currentText = inputEl?.value ?? inputValue;
		const colonPos = lastColonPos;
		const queryEnd = lastQueryEnd >= 0 ? lastQueryEnd : (inputEl?.selectionStart ?? currentText.length);

		// Build query from saved state (most reliable — set when picker opened)
		let query = null;
		if (colonPos >= 0) {
			query = {
				start: colonPos,
				end: queryEnd,
				query: currentText.slice(colonPos + 1, queryEnd)
			};
		}
		// Fallback: try findEmojiQuery with current cursor
		if (!query) {
			const cursorPos = inputEl?.selectionStart ?? currentText.length;
			query = findEmojiQuery(currentText, cursorPos);
		}

		if (!query) {
			isSelecting = false;
			return;
		}

		const result = insertEmoji(currentText, query.end, query, emoji.name);
		// Update both the local state AND the DOM directly
		inputValue = result.text;
		value = result.text;
		if (inputEl) inputEl.value = result.text;
		closePicker();
		oninput?.(result.text);

		// Refocus input and set cursor position
		requestAnimationFrame(() => {
			if (inputEl) {
				inputEl.focus();
				inputEl.setSelectionRange(result.cursor, result.cursor);
			}
			// Allow blur to work again after focus is restored
			setTimeout(() => { isSelecting = false; }, 50);
		});
	}

	function closePicker() {
		pickerVisible = false;
		pickerQuery = '';
		lastColonPos = -1;
		lastQueryEnd = -1;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (pickerVisible && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
			if (e.key === 'Tab' || (e.key === 'Enter' && pickerVisible)) {
				e.preventDefault();
			}
		}
	}

	function handleBlur() {
		// Longer delay — pointerdown/click on picker must fire first.
		// The picker uses onpointerdown with preventDefault which should keep
		// focus on the input, but this timeout is a safety net.
		setTimeout(() => {
			if (!isSelecting) {
				closePicker();
			}
		}, 300);
	}
</script>

{#if label}
	{@render label()}
{/if}

{#if multiline}
	<textarea
		bind:this={inputEl as HTMLTextAreaElement}
		bind:value={inputValue}
		{placeholder}
		{rows}
		{disabled}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	></textarea>
{:else}
	<input
		type="text"
		bind:this={inputEl as HTMLInputElement}
		bind:value={inputValue}
		{placeholder}
		{disabled}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	/>
{/if}

<!-- Live preview — always shows when text has potential shortcodes -->
{#if hasShortcodes && previewHtml}
	<div class="emoji-preview">
		<span class="preview-label">Preview:</span>
		<span class="preview-text">{@html previewHtml}</span>
	</div>
{/if}

<EmojiPicker
	emojis={emojis}
	query={pickerQuery}
	visible={pickerVisible}
	rect={pickerRect}
	onselect={handleSelect}
	onclose={closePicker}
/>

<style>
	textarea, input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
		resize: vertical;
	}

	textarea:focus, input:focus {
		border-color: rgba(var(--accent-rgb), 0.5);
	}

	.emoji-preview {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		margin-top: var(--space-1);
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.5;
	}

	.preview-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		flex-shrink: 0;
		padding-top: 2px;
	}

	.preview-text {
		color: var(--text);
		word-break: break-word;
	}

	.preview-text :global(.inline-emoji) {
		display: inline-block;
		width: 1.2em;
		height: 1.2em;
		vertical-align: -0.15em;
		object-fit: contain;
		margin: 0 0.05em;
	}

	.preview-text :global(.emoji-pending) {
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.9em;
		opacity: 0.6;
	}
</style>
