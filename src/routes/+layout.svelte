<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initStores } from '$lib/stores/init';
	import { settings } from '$lib/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let faviconUrl = $derived($settings.data?.brand?.favicon || favicon);

	onMount(() => {
		initStores();
	});
</script>

<svelte:head>
	<link rel="icon" href={faviconUrl} />
	<meta name="theme-color" content="#060404" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<a href="#main-content" class="sr-only" style="z-index: var(--z-toast);">
	Saltar al contenido
</a>

{@render children()}
