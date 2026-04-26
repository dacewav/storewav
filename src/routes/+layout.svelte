<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { initStores } from '$lib/stores/init';
	import { settings } from '$lib/stores';
	import { OfflineBanner } from '$lib/components';
	import type { Snippet } from 'svelte';
	import type { ThemeSettings } from '$lib/stores/settings';

	let { children }: { children: Snippet } = $props();

	let s = $derived($settings.data);
	let faviconUrl = $derived(s?.brand?.favicon || favicon);
	let t = $derived(s?.theme as ThemeSettings | null);

	// Load fonts dynamically from Firebase theme
	$effect(() => {
		if (typeof document === 'undefined' || !t) return;

		if (t.fontDisplay) {
			const id = 'gf-display-dyn';
			const href = `https://fonts.googleapis.com/css2?family=${t.fontDisplay.replace(/ /g, '+')}:wght@400;700;800&display=swap`;
			let el = document.getElementById(id) as HTMLLinkElement | null;
			if (!el) {
				el = document.createElement('link');
				el.id = id;
				el.rel = 'stylesheet';
				document.head.appendChild(el);
			}
			if (el.href !== href) el.href = href;
		}
		if (t.fontBody) {
			const id = 'gf-body-dyn';
			const href = `https://fonts.googleapis.com/css2?family=${t.fontBody.replace(/ /g, '+')}:wght@400;500&display=swap`;
			let el = document.getElementById(id) as HTMLLinkElement | null;
			if (!el) {
				el = document.createElement('link');
				el.id = id;
				el.rel = 'stylesheet';
				document.head.appendChild(el);
			}
			if (el.href !== href) el.href = href;
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

<OfflineBanner />
