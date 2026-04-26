<script lang="ts">
	/**
	 * InlineEmoji — renders text with :shortcode: replaced by <img> tags.
	 * Use in store pages for beat descriptions, banners, etc.
	 */
	import { customEmojis } from '$lib/stores';
	import { renderEmojis, stripEmojis } from '$lib/emojiUtils';

	let {
		text = '',
		as = 'span',
		strip = false,
		class: className = ''
	}: {
		text?: string;
		as?: string;
		strip?: boolean;
		class?: string;
	} = $props();

	let emojis = $derived($customEmojis);
	let rendered = $derived(
		strip ? stripEmojis(text) : renderEmojis(text, emojis)
	);
</script>

{#if as === 'p'}
	<p class={className}>{@html rendered}</p>
{:else if as === 'div'}
	<div class={className}>{@html rendered}</div>
{:else}
	<span class={className}>{@html rendered}</span>
{/if}

<style>
	:global(.inline-emoji) {
		display: inline-block;
		width: 1.2em;
		height: 1.2em;
		vertical-align: -0.15em;
		object-fit: contain;
		margin: 0 0.05em;
	}
</style>
