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
	let t = $derived(s?.theme);

	// Apply theme as CSS vars on <html>
	$effect(() => {
		if (typeof document === 'undefined' || !t) return;
		const r = document.documentElement;
		const theme = t as Record<string, any>;

		// Accent
		if (theme.accent) {
			r.style.setProperty('--accent', theme.accent);
			const h = theme.accent.replace('#', '');
			const rr = parseInt(h.substring(0, 2), 16) || 0;
			const gg = parseInt(h.substring(2, 4), 16) || 0;
			const bb = parseInt(h.substring(4, 6), 16) || 0;
			r.style.setProperty('--accent-rgb', `${rr},${gg},${bb}`);
			r.style.setProperty('--accent-glow', `rgba(${rr},${gg},${bb},0.12)`);
			r.style.setProperty('--accent-glow-strong', `rgba(${rr},${gg},${bb},0.25)`);
		}

		// Glow
		const gc = theme.glowColor || theme.accent || '#dc2626';
		const gi = theme.glowIntensity ?? 1;
		const gb = theme.glowBlur ?? 20;
		const gh = gc.replace('#', '');
		const gr = parseInt(gh.substring(0, 2), 16) || 0;
		const gG = parseInt(gh.substring(2, 4), 16) || 0;
		const gB = parseInt(gh.substring(4, 6), 16) || 0;
		if (gi > 0) {
			r.style.setProperty('--glow-sm', `0 0 ${gb}px rgba(${gr},${gG},${gB},${gi * 0.5})`);
			r.style.setProperty('--glow-md', `0 0 ${gb * 2}px rgba(${gr},${gG},${gB},${gi * 0.25})`);
		}

		// Spacing
		if (theme.radiusGlobal != null) {
			r.style.setProperty('--radius-md', `${theme.radiusGlobal}px`);
			r.style.setProperty('--radius-lg', `${Math.round(theme.radiusGlobal * 1.6)}px`);
		}
		if (theme.sectionPadding != null) r.style.setProperty('--section-padding', `${theme.sectionPadding}rem`);
		if (theme.beatGap != null) r.style.setProperty('--beat-gap', `${theme.beatGap}px`);

		// Fonts
		if (theme.fontDisplay) {
			r.style.setProperty('--font-display', `'${theme.fontDisplay}', sans-serif`);
			// Load font
			const id = 'gf-display-dyn';
			if (!document.getElementById(id)) {
				const link = document.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = `https://fonts.googleapis.com/css2?family=${theme.fontDisplay.replace(/ /g, '+')}:wght@400;700;800&display=swap`;
				document.head.appendChild(link);
			}
		}
		if (theme.fontBody) {
			r.style.setProperty('--font-body', `'${theme.fontBody}', monospace`);
			const id = 'gf-body-dyn';
			if (!document.getElementById(id)) {
				const link = document.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = `https://fonts.googleapis.com/css2?family=${theme.fontBody.replace(/ /g, '+')}:wght@400;500&display=swap`;
				document.head.appendChild(link);
			}
		}
		if (theme.fontSize) r.style.fontSize = `${theme.fontSize}px`;
		if (theme.fontWeight) r.style.setProperty('--font-w', String(theme.fontWeight));

		// Card effects
		if (theme.blurBg != null) r.style.setProperty('--blur-bg', `${theme.blurBg}px`);
		if (theme.grainOpacity != null) r.style.setProperty('--grain-opacity', String(theme.grainOpacity));

		// Player bar
		if (theme.wbarHeight != null) r.style.setProperty('--wbar-h', `${theme.wbarHeight}px`);
		if (theme.wbarRadius != null) r.style.setProperty('--wbar-r', `${theme.wbarRadius}px`);

		// Hero layout
		const ly = s?.layout;
		if (ly?.heroPadTop != null && ly.heroPadTop > 0) r.style.setProperty('--hero-pad-top', `${ly.heroPadTop}rem`);
		if (ly?.logoScale) r.style.setProperty('--logo-scale', String(ly.logoScale));
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
