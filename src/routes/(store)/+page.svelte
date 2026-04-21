<script lang="ts">
	import { goto } from '$app/navigation';
	import { Skeleton, EmptyState, BeatCard, Filters, Testimonials } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { beatsList, genres, settings, player, analytics } from '$lib/stores';
	import type { HeroVisualSettings, LabelSettings } from '$lib/stores/settings';
	import { staggerReveal, reveal, siblingBlur, countUp } from '$lib/actions';
	import type { Beat } from '$lib/stores/beats';

	let beats = $derived($beatsList);
	let genreList = $derived($genres);
	let s = $derived($settings.data);

	// Hero text
	let heroTitle = $derived(s?.hero?.title ?? s?.brand?.name ?? 'DACEWAV');
	let heroSub = $derived(s?.hero?.subtitle ?? '');
	let heroEyebrow = $derived(s?.hero?.eyebrow ?? '');
	let heroGlow = $derived(s?.hero?.glowWord ?? 'rompen.');

	// Hero Visual
	let hv = $derived((s?.heroVisual ?? {}) as HeroVisualSettings);
	let accent = $derived(s?.theme?.accent ?? '#dc2626');

	// Resolve colors (empty = use accent)
	let glowClr = $derived(hv.glowClr || accent);
	let strokeClr = $derived(hv.strokeClr || accent);
	let eyebrowClr = $derived(hv.eyebrowClr || accent);
	let gradClr = $derived(hv.gradClr || accent);

	// Hero title: color segments or glow-word
	let hasSegments = $derived(hv.segments?.length > 0 && hv.segments.some(sg => sg.color));

	// Hero CSS vars
	let heroGlowStyle = $derived(
		hv.glowOn ? `text-shadow: 0 0 ${hv.glowBlur ?? 20}px ${glowClr}` : 'text-shadow: none'
	);
	let heroTitleStyle = $derived([
		hv.titleSize > 0 ? `font-size: ${hv.titleSize}rem` : '',
		`letter-spacing: ${hv.letterSpacing ?? -0.04}em`,
		`line-height: ${hv.lineHeight ?? 1}`,
	].filter(Boolean).join(';'));

	let heroGradStyle = $derived(
		hv.gradOn
			? `radial-gradient(ellipse ${hv.gradW ?? 80}% ${hv.gradH ?? 60}% at 50% 0%, ${hexToRgba(gradClr, hv.gradOp ?? 0.14)}, transparent)`
			: 'none'
	);

	let eyebrowStyle = $derived([
		`color: ${eyebrowClr}`,
		`border-color: ${hexToRgba(eyebrowClr, 0.3)}`,
		`background: ${hexToRgba(eyebrowClr, 0.08)}`,
		hv.eyebrowSize > 0 ? `font-size: ${hv.eyebrowSize}px` : '',
	].filter(Boolean).join(';'));

	function hexToRgba(hex: string, alpha: number): string {
		if (!hex) hex = accent;
		const h = hex.replace('#', '');
		const r = parseInt(h.substring(0, 2), 16) || 0;
		const g = parseInt(h.substring(2, 4), 16) || 0;
		const b = parseInt(h.substring(4, 6), 16) || 0;
		return `rgba(${r},${g},${b},${alpha})`;
	}

	// Section
	let sectionTitle = $derived(s?.section?.title ?? 'Catálogo');
	let dividerTitle = $derived(s?.section?.dividerTitle ?? '');
	let dividerSub = $derived(s?.section?.dividerSub ?? '');

	// Hero links
	let heroLinks = $derived((s?.links ?? []) as Array<{label: string; url: string; icon: string}>);

	// CTA
	let ctaTitle = $derived(s?.cta?.title ?? '');
	let ctaSub = $derived(s?.cta?.subtitle ?? '');
	let ctaBtn = $derived(s?.cta?.buttonText ?? '');
	let ctaUrl = $derived(s?.cta?.buttonUrl ?? 'https://wa.me');

	// Labels
	let labels = $derived((s?.labels ?? {}) as LabelSettings);

	// License count from first beat (or default 4)
	let licenseCount = $derived(beats.length > 0 && beats[0].licenses ? Object.keys(beats[0].licenses).length : 4);
	let testimonialsTitle = $derived(s?.labels?.testimonialsTitle ?? 'Lo que dicen');

	// Featured beats (for the featured section)
	let featuredBeats = $derived(beats.filter(b => b.featured).slice(0, 4));

	type FilterState = { search: string; genre: string; key: string; sort: string; tags: string[] };
	let filters: FilterState = $state({ search: '', genre: '', key: '', sort: 'newest', tags: [] });

	// Filtered + sorted beats
	let filteredBeats = $derived.by(() => {
		let list = [...beats];

		// Search
		if (filters.search?.trim()) {
			const q = filters.search.trim().toLowerCase();
			list = list.filter(b =>
				b.title?.toLowerCase().includes(q) ||
				b.artist?.toLowerCase().includes(q) ||
				b.genre?.toLowerCase().includes(q)
			);
		}

		// Genre
		if (filters.genre) {
			list = list.filter(b => b.genre === filters.genre);
		}

		// Key
		if (filters.key) {
			list = list.filter(b => b.key === filters.key);
		}

		// Tags
		if (filters.tags.length > 0) {
			list = list.filter(b => filters.tags.some(t => b.tags?.includes(t)));
		}

		// Sort
		switch (filters.sort) {
			case 'newest': list.sort((a, b) => b.createdAt - a.createdAt); break;
			case 'oldest': list.sort((a, b) => a.createdAt - b.createdAt); break;
			case 'name-az': list.sort((a, b) => a.title.localeCompare(b.title)); break;
			case 'name-za': list.sort((a, b) => b.title.localeCompare(a.title)); break;
			case 'bpm-asc': list.sort((a, b) => a.bpm - b.bpm); break;
			case 'bpm-desc': list.sort((a, b) => b.bpm - a.bpm); break;
			case 'price-asc': list.sort((a, b) => (a.licenses?.basic ?? 0) - (b.licenses?.basic ?? 0)); break;
			case 'price-desc': list.sort((a, b) => (b.licenses?.basic ?? 0) - (a.licenses?.basic ?? 0)); break;
		}

		return list;
	});

	function handlePlay(beat: Beat & { id: string }) {
		player.play({
			id: beat.id,
			title: beat.title,
			artist: beat.artist,
			coverUrl: beat.coverUrl,
			audioUrl: beat.audioUrl
		});
		analytics.track('beat_play', { beatId: beat.id, title: beat.title });
	}

	function handleBeatClick(beat: Beat & { id: string }) {
		analytics.track('beat_click', { beatId: beat.id, title: beat.title });
		goto(`/beat/${beat.id}`);
	}
</script>

<svelte:head>
	<title>{heroTitle} — {s?.brand?.metaDescription ?? 'Beats que rompen'}</title>
</svelte:head>

<!-- Hero -->
<section class="hero" style={hv.gradOn ? `--hero-grad: ${heroGradStyle}` : ''}>
	{#if heroEyebrow && hv.eyebrowOn !== false}
	<div class="hero-eyebrow" style={eyebrowStyle}>
		<span class="dot" style="background: {eyebrowClr}"></span>
		{heroEyebrow}
	</div>
	{/if}
	<h1 class="hero-title" style="{heroGlowStyle}; {heroTitleStyle}">
		{#if hasSegments}
			<!-- Color segments mode -->
			{#each hv.segments as seg}
				{#if seg.color}
					<span style="color: {seg.color}">{seg.text}</span>
				{:else}
					{seg.text}
				{/if}
			{/each}
		{:else}
			<!-- Default: title + glow word -->
			<span>{heroTitle}</span><br>
			{#if hv.strokeOn}
				<span
					class="glow-word stroke-mode"
					data-t={heroGlow}
					style="-webkit-text-stroke: {hv.strokeW ?? 1}px {strokeClr}; --hw-blur: {hv.wordBlur ?? 10}px; --hw-op: {hv.wordOp ?? 0.35}"
				>{heroGlow}</span>
			{:else}
				<span
					class="glow-word"
					data-t={heroGlow}
					style="color: {glowClr}; --hw-blur: {hv.wordBlur ?? 10}px; --hw-op: {hv.wordOp ?? 0.35}"
				>{heroGlow}</span>
			{/if}
		{/if}
	</h1>
	{#if heroSub}
	<p class="hero-sub">{heroSub}</p>
	{/if}
	{#if heroLinks.length > 0}
	<div class="hero-links">
		{#each heroLinks as link}
			<a class="hero-link" href={link.url} target="_blank" rel="noopener">
				{#if link.icon}<span class="hero-link-icon">{link.icon}</span>{/if}
				{link.label}
			</a>
		{/each}
	</div>
	{/if}
	<div class="hero-stats">
		<div class="stat">
			<div class="stat-num" use:countUp={beats.length || 0}>0</div>
			<div class="stat-label">{labels.statBeats ?? 'beats'}</div>
		</div>
		<div class="stat">
			<div class="stat-num" use:countUp={genreList.length || 0}>0</div>
			<div class="stat-label">{labels.statGenres ?? 'géneros'}</div>
		</div>
		<div class="stat">
			<div class="stat-num" use:countUp={licenseCount}>0</div>
			<div class="stat-label">{labels.statLicenses ?? 'licencias'}</div>
		</div>
	</div>
</section>

<!-- Featured beats -->
{#if featuredBeats.length > 0}
<section class="featured-section" use:reveal={{}}>
	<div class="section-header">
		<h2 class="section-title">🔥 Destacados</h2>
		<div class="section-line"></div>
		<div class="section-badge">{featuredBeats.length} beats</div>
	</div>
	<div class="beat-grid" use:staggerReveal={{ delay: 60 }}>
		{#each featuredBeats as beat (beat.id)}
			<BeatCard {beat} onplay={handlePlay} onclick={handleBeatClick} labelFrom={labels.priceFrom ?? 'Desde'} />
		{/each}
	</div>
</section>
{/if}

<!-- Section divider -->
{#if dividerTitle}
<div class="section-divider" use:reveal={{}}>
	<div class="section-divider-text">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html dividerTitle}
	</div>
	{#if dividerSub}
	<div class="section-divider-sub">
		{dividerSub}
	</div>
	{/if}
</div>
{/if}

<!-- Beats section -->
<section class="section" use:reveal={{}} id="beats">
	<div class="section-header">
		<h2 class="section-title">{sectionTitle}</h2>
		<div class="section-line"></div>
		<div class="section-badge">{beats.length ? `${beats.length} beats` : '—'}</div>
	</div>

	<!-- Filters -->
	{#if beats.length > 0}
		<div class="filters-wrap">
			<Filters
				bind:filters
				total={beats.length}
				filtered={filteredBeats.length}
				placeholder={labels.search ?? 'Buscar beats...'}
				labelAll={labels.filterAll ?? 'Todos'}
				labelKey={labels.filterKey ?? 'Tonalidad'}
				labelTags={labels.tags ?? 'Tags'}
				labelClear={labels.clearAll ?? 'Limpiar todo'}
			/>
		</div>
	{/if}

	<!-- Beat grid -->
	{#if beats.length > 0}
		{#if filteredBeats.length > 0}
			<div class="beat-grid" use:staggerReveal={{ delay: 60 }} use:siblingBlur={{ blur: 3, opacity: 0.5 }}>
				{#each filteredBeats as beat (beat.id)}
					<BeatCard {beat} onplay={handlePlay} onclick={handleBeatClick} labelFrom={labels.priceFrom ?? 'Desde'} />
				{/each}
			</div>
		{:else}
			<EmptyState icon="🔍" title={labels.emptyTitle ?? 'Sin resultados'} subtitle={labels.emptySub ?? ''} />
		{/if}
	{:else}
		<div class="beat-grid" use:staggerReveal={{ delay: 80 }}>
			{#each Array(6) as _}
				<Skeleton lines={3} />
			{/each}
		</div>
	{/if}
</section>

<!-- Testimonials -->
{#if s?.testimonials?.length}
<Testimonials items={s.testimonials} title={testimonialsTitle} />
{/if}

<!-- CTA Section -->
{#if ctaTitle}
<div class="cta-section" use:reveal={{}}>
	<div class="cta-title">{ctaTitle}</div>
	{#if ctaSub}
	<div class="cta-sub">{ctaSub}</div>
	{/if}
	<a class="cta-btn" href={ctaUrl} target="_blank" rel="noopener">
		<Icon name="whatsapp" size={16} />
		{ctaBtn}
	</a>
</div>
{/if}

<style>
	/* ── Hero ── */
	.hero {
		position: relative;
		z-index: var(--z-content);
		padding: clamp(4rem, 12vw, 7rem) var(--container-padding) clamp(2.5rem, 8vw, 5rem);
		text-align: center;
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--hero-grad, radial-gradient(ellipse 80% 60% at 50% 0%, var(--accent-glow), transparent));
		pointer-events: none;
		transition: background 0.6s ease;
	}

	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.04;
		background:
			radial-gradient(at 20% 80%, var(--accent) 0, transparent 50%),
			radial-gradient(at 80% 20%, var(--accent-glow-strong) 0, transparent 50%),
			radial-gradient(at 50% 50%, var(--red) 0, transparent 60%);
		background-size: 200% 200%;
		animation: gradientShift 12s ease infinite;
	}

	.hero-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 1.5rem;
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		padding: 4px 14px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.06);
		position: relative;
		z-index: var(--z-content);
		animation: fadeInUp 0.6s var(--ease-out) 1.4s both;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		animation: glowPulse 2s ease-in-out infinite;
		position: relative;
	}

	.dot::after {
		content: '';
		position: absolute;
		inset: -3px;
		border-radius: 50%;
		background: var(--accent);
		animation: pulseRing 2s ease-out infinite;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2.4rem, 8vw, 6.5rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
		margin-bottom: 1.5rem;
		position: relative;
		z-index: var(--z-content);
		color: var(--text);
		animation: fadeInUp 0.7s var(--ease-out) 1.55s both;
		overflow-wrap: break-word;
	}

	.glow-word {
		display: inline-block;
		position: relative;
	}

	.glow-word::after {
		content: attr(data-t);
		position: absolute;
		inset: 0;
		color: inherit;
		filter: blur(calc(var(--hw-blur, 10) * 1px));
		opacity: var(--hw-op, 0.35);
		pointer-events: none;
	}

	.glow-word.stroke-mode {
		color: transparent;
		-webkit-text-stroke: var(--hero-stroke-w, 1px) currentColor;
	}

	.glow-word.stroke-mode::after {
		display: none;
	}

	.hero-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 520px;
		margin: 0 auto 2rem;
		line-height: 1.9;
		position: relative;
		z-index: var(--z-content);
		letter-spacing: 0.02em;
		animation: fadeInUp 0.6s var(--ease-out) 1.7s both;
	}

	/* Hero links */
	.hero-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: center;
		margin-top: var(--space-4);
		margin-bottom: var(--space-2);
		position: relative;
		z-index: var(--z-content);
		animation: fadeInUp 0.6s var(--ease-out) 1.8s both;
	}

	.hero-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		color: var(--text);
		font-size: var(--text-sm);
		text-decoration: none;
		transition: all var(--duration-fast);
	}

	.hero-link:hover {
		border-color: rgba(var(--accent-rgb), 0.5);
		background: rgba(var(--accent-rgb), 0.08);
		color: var(--accent);
		transform: translateY(-1px);
	}

	.hero-link-icon { font-size: var(--text-base); }

	.hero-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(1.5rem, 5vw, 3rem);
		flex-wrap: wrap;
		margin-top: clamp(2rem, 5vw, 3rem);
		padding-top: 2rem;
		border-top: 1px solid var(--border);
		position: relative;
		z-index: var(--z-content);
		animation: fadeInUp 0.6s var(--ease-out) 1.85s both;
	}

	.stat-num {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 800;
		color: var(--text);
		transition: all 0.3s var(--ease-out);
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	/* ── Section Divider ── */
	.section-divider {
		position: relative;
		z-index: var(--z-content);
		text-align: center;
		padding: clamp(3rem, 8vw, 5rem) var(--container-padding);
		overflow: hidden;
	}

	.section-divider::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent, var(--bg) 20%, var(--bg) 80%, transparent);
		pointer-events: none;
	}

	.section-divider::after {
		content: '';
		position: absolute;
		left: 20%;
		right: 20%;
		bottom: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.15), transparent);
		pointer-events: none;
	}

	.section-divider-text {
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 6vw, 4.5rem);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1.1;
		max-width: 800px;
		margin: 0 auto;
		position: relative;
		color: var(--text);
	}

	.section-divider-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: 1rem;
		max-width: 500px;
		margin-inline: auto;
		position: relative;
		line-height: 1.8;
	}

	/* ── Featured beats ── */
	.featured-section {
		position: relative;
		z-index: var(--z-content);
		padding: var(--space-8) var(--container-padding);
		max-width: var(--container-max);
		margin: 0 auto;
	}

	/* ── Section ── */
	.section {
		position: relative;
		z-index: var(--z-content);
		padding: var(--section-padding) var(--container-padding);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.section-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, var(--border), rgba(var(--accent-rgb), 0.08));
	}

	.section-badge {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 3px 10px;
		border-radius: var(--radius-full);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		background: rgba(var(--accent-rgb), 0.08);
		color: var(--accent);
		letter-spacing: 0.06em;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.section-badge:hover {
		background: rgba(var(--accent-rgb), 0.15);
		box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.15);
	}

	/* ── Filters ── */
	.filters-wrap {
		margin-bottom: var(--space-6);
	}

	/* ── Beat Grid ── */
	.beat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--beat-gap);
		align-items: start;
	}

	/* ── CTA Section ── */
	.cta-section {
		position: relative;
		z-index: var(--z-content);
		text-align: center;
		padding: var(--space-16) var(--container-padding);
		border-top: 1px solid var(--border);
		overflow: hidden;
	}

	.cta-section::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 60% 50% at 50% 100%, rgba(var(--accent-rgb), 0.06), transparent);
		pointer-events: none;
	}

	.cta-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4vw, 2.25rem);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-3);
		position: relative;
	}

	.cta-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 480px;
		margin: 0 auto var(--space-6);
		line-height: 1.8;
		position: relative;
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-lg);
		border: 1px solid rgba(var(--accent-rgb), 0.5);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		text-decoration: none;
		letter-spacing: 0.04em;
		transition: all var(--duration-normal) var(--ease-out);
		min-height: var(--touch-min);
		opacity: var(--btn-opacity);
		position: relative;
	}

	.cta-btn:hover {
		background: var(--accent);
		color: var(--bg);
		box-shadow: var(--glow-sm);
		opacity: var(--btn-opacity-hover);
		transform: translateY(-2px);
	}

	@media (max-width: 1024px) {
		.beat-grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
			gap: var(--space-3);
		}
	}

	@media (max-width: 480px) {
		.beat-grid {
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.hero-title {
			font-size: clamp(2rem, 10vw, 2.8rem);
		}

		.section-header {
			flex-wrap: wrap;
		}
	}
</style>
