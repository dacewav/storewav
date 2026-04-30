<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { beatsList, settings, player, analytics, beats as beatsStore } from '$lib/stores';
	import { BeatCard, EmptyState, Skeleton } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { getBeatSlug } from '$lib/slug';
	import type { Beat } from '$lib/stores/beats';

	let slug = $derived(page.params.slug ?? '');
	let beats = $derived($beatsList);
	let s = $derived($settings.data);
	let brandName = $derived(s?.brand?.name ?? 'DACEWAV');

	// Decode genre from slug (e.g., "reggaeton" → "Reggaeton", "r-b" → "R&B")
	let genreName = $derived.by(() => {
		const decoded = slug.replace(/-/g, ' ');
		// Try exact match first
		const exact = beats.find(b => b.genre.toLowerCase() === decoded);
		if (exact) return exact.genre;
		// Try with title case
		const titleCase = decoded.replace(/\b\w/g, c => c.toUpperCase());
		const title = beats.find(b => b.genre.toLowerCase() === titleCase.toLowerCase());
		if (title) return title.genre;
		// Fallback: capitalize first letter
		return decoded.charAt(0).toUpperCase() + decoded.slice(1);
	});

	// Beats for this genre
	let genreBeats = $derived(beats.filter(b => b.genre.toLowerCase() === genreName.toLowerCase()));
	let loading = $derived($beatsStore.loading);

	// Other genres for "explore more"
	let otherGenres = $derived.by(() => {
		const genres = new Set(beats.map(b => b.genre));
		genres.delete(genreName);
		return Array.from(genres).sort().slice(0, 6);
	});

	function handlePlay(beat: Beat & { id: string }) {
		player.play({
			id: beat.id,
			name: beat.name,
			artist: beat.artist ?? '',
			imageUrl: beat.imageUrl ?? '',
			audioUrl: beat.audioUrl || beat.previewUrl || ''
		});
		analytics.track('beat', 'play', { lbl: beat.id, meta: beat.name });
	}

	function handleBeatClick(beat: Beat & { id: string }) {
		analytics.track('beat', 'click', { lbl: beat.id, meta: beat.name });
		goto(`/beat/${getBeatSlug(beat)}`);
	}

	// Genre gradient for hero background
	let genreGradient = $derived.by(() => {
		const gradients: Record<string, string> = {
			'Trap': 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
			'Drill': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2d1b69 100%)',
			'Reggaeton': 'linear-gradient(135deg, #2d1b0e 0%, #4a1942 50%, #1a0a2e 100%)',
			'R&B': 'linear-gradient(135deg, #0f1b2d 0%, #1a0a2e 50%, #2d1b69 100%)',
			'Pop': 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4a1942 100%)',
			'Ambient': 'linear-gradient(135deg, #0a1a0a 0%, #0f2027 50%, #203a43 100%)',
			'Corrido': 'linear-gradient(135deg, #1a0f00 0%, #2d1b0e 50%, #4a1942 100%)',
		};
		return gradients[genreName] ?? 'linear-gradient(135deg, #1a0a2e 0%, #0f0f0f 50%, #0a0a1a 100%)';
	});
</script>

<svelte:head>
	<title>{genreName} — {brandName}</title>
	<meta name="description" content="Beats de {genreName}. Explora instrumentales de {genreName.toLowerCase()} profesionales para tu próximo hit." />
	<link rel="canonical" href="https://dacewav.store/genre/{slug}" />
	<meta property="og:title" content="{genreName} — {brandName}" />
	<meta property="og:description" content="Beats de {genreName} profesionales" />
	<meta property="og:url" content="https://dacewav.store/genre/{slug}" />
	<meta property="og:type" content="music.genre" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{genreName} — {brandName}" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'MusicGenre',
		name: genreName,
		url: `https://dacewav.store/genre/${slug}`,
		description: `Beats de ${genreName.toLowerCase()} profesionales`
	})}</script>`}
</svelte:head>

<div class="genre-page">
	<!-- Back link -->
	<a href="/" class="back-link">
		<Icon name="chevronLeft" size={14} />
		<span>Volver al catálogo</span>
	</a>

	<!-- Genre Hero -->
	<section class="genre-hero" style="background: {genreGradient}">
		<div class="genre-hero-content">
			<span class="genre-badge">{genreBeats.length} beats</span>
			<h1 class="genre-title">{genreName}</h1>
			<p class="genre-sub">Explora instrumentales de {genreName.toLowerCase()} para tu próximo proyecto</p>
		</div>
	</section>

	<!-- Beats grid -->
	{#if loading}
		<div class="genre-grid">
			{#each Array(6) as _}
				<Skeleton lines={3} />
			{/each}
		</div>
	{:else if genreBeats.length > 0}
		<div class="genre-grid">
			{#each genreBeats as beat (beat.id)}
				<BeatCard {beat} onplay={handlePlay} onclick={handleBeatClick} labelFrom="Desde" />
			{/each}
		</div>
	{:else}
		<EmptyState
			icon="🎵"
			title="No hay beats de {genreName}"
			subtitle="Pronto habrá contenido disponible para este género"
		/>
	{/if}

	<!-- Explore more genres -->
	{#if otherGenres.length > 0}
		<section class="explore-section">
			<h2 class="explore-title">Explorar otros géneros</h2>
			<div class="genre-pills">
				{#each otherGenres as genre}
					<a href="/genre/{genre.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '-')}" class="genre-pill">
						{genre}
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.genre-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: var(--container-max);
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-6);
		transition: color var(--duration-fast);
	}

	.back-link:hover {
		color: var(--accent);
	}

	/* Genre Hero */
	.genre-hero {
		border-radius: var(--radius-xl);
		padding: clamp(3rem, 8vw, 5rem) clamp(2rem, 5vw, 4rem);
		margin-bottom: var(--space-8);
		position: relative;
		overflow: hidden;
	}

	.genre-hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(var(--accent-rgb), 0.15), transparent);
		pointer-events: none;
	}

	.genre-hero-content {
		position: relative;
		z-index: 1;
	}

	.genre-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 3px 12px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.15);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: var(--space-3);
	}

	.genre-title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.03em;
		margin-bottom: var(--space-2);
	}

	.genre-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 500px;
		line-height: 1.7;
	}

	/* Grid */
	.genre-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--beat-gap);
		margin-bottom: var(--space-12);
	}

	@media (max-width: 1024px) {
		.genre-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.genre-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Explore more */
	.explore-section {
		border-top: 1px solid var(--border);
		padding-top: var(--space-8);
	}

	.explore-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.genre-pills {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.genre-pill {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		text-decoration: none;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition: all var(--duration-fast);
	}

	.genre-pill:hover {
		border-color: rgba(var(--accent-rgb), 0.4);
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.06);
		transform: translateY(-1px);
	}

	@media (max-width: 480px) {
		.genre-hero {
			padding: var(--space-6) var(--space-4);
			border-radius: var(--radius-lg);
		}
	}
</style>
