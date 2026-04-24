<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initStores } from '$lib/stores/init';
	import { settings } from '$lib/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let s = $derived($settings.data);
	let faviconUrl = $derived(s?.brand?.favicon || favicon);
	let t = $derived(s?.theme as Record<string, any> | null);

	// Load fonts dynamically from Firebase theme
	$effect(() => {
		if (typeof document === 'undefined' || !t) return;

		if (t.fontDisplay) {
			const id = 'gf-display-dyn';
			if (!document.getElementById(id)) {
				const link = document.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = `https://fonts.googleapis.com/css2?family=${t.fontDisplay.replace(/ /g, '+')}:wght@400;700;800&display=swap`;
				document.head.appendChild(link);
			}
		}
		if (t.fontBody) {
			const id = 'gf-body-dyn';
			if (!document.getElementById(id)) {
				const link = document.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = `https://fonts.googleapis.com/css2?family=${t.fontBody.replace(/ /g, '+')}:wght@400;500&display=swap`;
				document.head.appendChild(link);
			}
		}
	});

	onMount(() => {
		initStores();
	});
</script>

<svelte:head>
	<link rel="icon" href={faviconUrl} />
	<meta name="theme-color" content={s?.theme?.accent || '#060404'} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<a href="#main-content" class="sr-only" style="z-index: var(--z-toast);">
	Saltar al contenido
</a>

{@render children()}
