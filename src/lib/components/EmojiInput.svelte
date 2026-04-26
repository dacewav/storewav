<script lang="ts">
	/**
	 * EmojiInput — textarea/input with Discord-style emoji autocomplete.
	 * Wraps a native input/textarea and adds :shortcode: picker.
	 */
	import { customEmojis } from '$lib/stores';
	import { findEmojiQuery, insertEmoji } from '$lib/emojiUtils';
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

	// Picker state
	let pickerVisible = $state(false);
	let pickerQuery = $state('');
	let pickerRect = $state({ top: 0, left: 0, bottom: 0 });
	let activeEmojiQuery = $state<ReturnType<typeof findEmojiQuery>>(null);

	function handleInput() {
		oninput?.(value);
		updatePicker();
	}

	function updatePicker() {
		if (!inputEl) return;
		const pos = inputEl.selectionStart ?? 0;
		const query = findEmojiQuery(value, pos);

		if (query && emojis.length > 0) {
			activeEmojiQuery = query;
			pickerQuery = query.query;
			pickerVisible = true;
			positionPicker(query.start);
		} else {
			closePicker();
		}
	}

	function positionPicker(colonPos: number) {
		if (!inputEl) return;

		// Create a mirror to measure cursor position
		const rect = inputEl.getBoundingClientRect();
		const style = getComputedStyle(inputEl);

		// Create measurement element
		const mirror = document.createElement('div');
		mirror.style.cssText = `
			position: absolute; visibility: hidden; white-space: pre-wrap; word-wrap: break-word;
			font: ${style.font}; padding: ${style.padding}; width: ${style.width};
			line-height: ${style.lineHeight}; border: ${style.border};
		`;
		mirror.textContent = value.slice(0, colonPos);
		const span = document.createElement('span');
		span.textContent = value.slice(colonPos, colonPos + 1) || '.';
		mirror.appendChild(span);
		document.body.appendChild(mirror);

		const spanRect = span.getBoundingClientRect();
		const mirrorRect = mirror.getBoundingClientRect();
		const offsetX = spanRect.left - mirrorRect.left;
		const offsetY = spanRect.top - mirrorRect.top;

		document.body.removeChild(mirror);

		// Calculate line height approximation
		const lineHeight = parseFloat(style.lineHeight) || 20;
		const linesBefore = (value.slice(0, colonPos).match(/\n/g) || []).length;

		pickerRect = {
			top: rect.top + parseFloat(style.paddingTop || '0') + offsetY,
			left: rect.left + parseFloat(style.paddingLeft || '0') + offsetX,
			bottom: rect.top + parseFloat(style.paddingTop || '0') + offsetY + lineHeight + 4
		};
	}

	function handleSelect(emoji: CustomEmoji) {
		if (!activeEmojiQuery) return;
		const result = insertEmoji(value, inputEl?.selectionStart ?? 0, activeEmojiQuery, emoji.name);
		value = result.text;
		closePicker();

		// Restore cursor position
		requestAnimationFrame(() => {
			if (inputEl) {
				inputEl.focus();
				inputEl.setSelectionRange(result.cursor, result.cursor);
			}
		});
	}

	function closePicker() {
		pickerVisible = false;
		pickerQuery = '';
		activeEmojiQuery = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		// Let the picker handle its own keys when visible
		if (pickerVisible && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
			// Picker handles these via svelte:window — but we need to prevent default for Tab/Enter
			if (e.key === 'Tab' || (e.key === 'Enter' && pickerVisible)) {
				e.preventDefault();
			}
		}
	}

	function handleBlur() {
		// Delay to allow click on picker
		setTimeout(() => { closePicker(); }, 150);
	}
</script>

{#if label}
	{@render label()}
{/if}

{#if multiline}
	<textarea
		bind:this={inputEl as HTMLTextAreaElement}
		bind:value
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
		bind:value
		{placeholder}
		{disabled}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	/>
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
</style>
