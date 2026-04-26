<script lang="ts">
	/**
	 * EmojiInput — textarea/input with Discord-style emoji autocomplete.
	 * Wraps a native input/textarea and adds :shortcode: picker + live preview.
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

	// Picker state
	let pickerVisible = $state(false);
	let pickerQuery = $state('');
	let pickerRect = $state({ top: 0, left: 0, bottom: 0 });
	let activeEmojiQuery = $state<ReturnType<typeof findEmojiQuery>>(null);

	// Preview: rendered version of the value with emojis
	let hasShortcodes = $derived(/:[a-zA-Z0-9_+-]+:/.test(value));
	let renderedPreview = $derived(
		hasShortcodes ? renderEmojis(value, emojis) : ''
	);

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

		const rect = inputEl.getBoundingClientRect();
		const style = getComputedStyle(inputEl);

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

		const lineHeight = parseFloat(style.lineHeight) || 20;

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
		oninput?.(value);

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
		if (pickerVisible && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
			if (e.key === 'Tab' || (e.key === 'Enter' && pickerVisible)) {
				e.preventDefault();
			}
		}
	}

	function handleBlur() {
		setTimeout(() => { closePicker(); }, 200);
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

<!-- Live preview: rendered emojis -->
{#if hasShortcodes}
	<div class="emoji-preview">
		<span class="preview-label">Preview:</span>
		<span class="preview-text">{@html renderedPreview}</span>
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
</style>
