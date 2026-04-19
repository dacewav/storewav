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
	let t = $derived(s?.theme ?? {});

	// Apply theme as CSS vars on <html>
	$effect(() => {
		if (typeof document === 'undefined' || !t) return;
		const r = document.documentElement;

		// Accent
		if (t.accent) {
			r.style.setProperty('--accent', t.accent);
			const h = t.accent.replace('#', '');
			const rr = parseInt(h.substring(0, 2), 16) || 0;
			const gg = parseInt(h.substring(2, 4), 16) || 0;
			const bb = parseInt(h.substring(4, 6), 16) || 0;
			r.style.setProperty('--accent-rgb', `${rr},${gg},${bb}`);
			r.style.setProperty('--accent-glow', `rgba(${rr},${gg},${bb},0.12)`);
			r.style.setProperty('--accent-glow-strong', `rgba(${rr},${gg},${bb},0.25)`);
		}

		// Glow
		const gc = t.glowColor || t.accent || '#dc2626';
		const gi = t.glowIntensity ?? 1;
		const gb = t.glowBlur ?? 20;
		const gh = gc.replace('#', '');
		const gr = parseInt(gh.substring(0, 2), 16) || 0;
		const gG = parseInt(gh.substring(2, 4), 16) || 0;
		const gB = parseInt(gh.substring(4, 6), 16) || 0;
		if (gi > 0) {
			r.style.setProperty('--glow-sm', `0 0 ${gb}px rgba(${gr},${gG},${gB},${gi * 0.5})`);
			r.style.setProperty('--glow-md', `0 0 ${gb * 2}px rgba(${gr},${gG},${gB},${gi * 0.25})`);
		}

		// Spacing
		if (t.radiusGlobal != null) {
			r.style.setProperty('--radius-md', `${t.radiusGlobal}px`);
			r.style.setProperty('--radius-lg', `${Math.round(t.radiusGlobal * 1.6)}px`);
		}
		if (t.sectionPadding != null) r.style.setProperty('--section-padding', `${t.sectionPadding}rem`);
		if (t.beatGap != null) r.style.setProperty('--beat-gap', `${t.beatGap}px`);

		// Fonts
		if (t.fontDisplay) {
			r.style.setProperty('--font-display', `'${t.fontDisplay}', sans-serif`);
			// Load font
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
			r.style.setProperty('--font-body', `'${t.fontBody}', monospace`);
			const id = 'gf-body-dyn';
			if (!document.getElementById(id)) {
				const link = document.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = `https://fonts.googleapis.com/css2?family=${t.fontBody.replace(/ /g, '+')}:wght@400;500&display=swap`;
				document.head.appendChild(link);
			}
		}
		if (t.fontSize) r.style.fontSize = `${t.fontSize}px`;
		if (t.fontWeight) r.style.setProperty('--font-w', String(t.fontWeight));

		// Card effects
		if (t.blurBg != null) r.style.setProperty('--blur-bg', `${t.blurBg}px`);
		if (t.grainOpacity != null) r.style.setProperty('--grain-opacity', String(t.grainOpacity));

		// Player bar
		if (t.wbarHeight != null) r.style.setProperty('--wbar-h', `${t.wbarHeight}px`);
		if (t.wbarRadius != null) r.style.setProperty('--wbar-r', `${t.wbarRadius}px`);

		// Hero layout
		const ly = s?.layout;
		if (ly?.heroPadTop > 0) r.style.setProperty('--hero-pad-top', `${ly.heroPadTop}rem`);
		if (ly?.logoScale) r.style.setProperty('--logo-scale', String(ly.logoScale));
	});

	onMount(() => {
		initStores();
	});
</script>

<svelte:head>
	<link rel="icon" href={faviconUrl} />
	<meta name="theme-color" content={t?.accent || '#060404'} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<a href="#main-content" class="sr-only" style="z-index: var(--z-toast);">
	Saltar al contenido
</a>

{@render children()}
