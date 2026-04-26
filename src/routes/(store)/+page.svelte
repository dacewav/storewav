<script lang="ts">
	import { goto } from '$app/navigation';
	import { Skeleton, EmptyState, BeatCard, Filters, Testimonials, InlineEmoji } from '$lib/components';
	import { renderEmojis, stripEmojis } from '$lib/emojiUtils';
	import Icon from '$lib/components/Icon.svelte';
	import { beatsList, genres, settings, player, analytics, customEmojis } from '$lib/stores';
	import { sanitizeHtml } from '$lib/sanitize';
	import type { HeroVisualSettings, LabelSettings, AnimationSettings } from '$lib/stores/settings';
	import type { IconName } from '$lib/icons';
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

	// Sibling hover config from global cardStyle
	let cardStyle = $derived((s?.cardStyle ?? {}) as Record<string, unknown>);
	let siblingHoverEffect = $derived((cardStyle.siblingHoverEffect ?? 'blur') as 'blur' | 'dim' | 'scale-down' | 'none');
	let siblingHoverBlur = $derived(Number(cardStyle.siblingHoverBlur ?? 3));
	let siblingHoverOpacity = $derived(Number(cardStyle.siblingHoverOpacity ?? 0.6));
	let siblingHoverScale = $derived(Number(cardStyle.siblingHoverScale ?? 0.95));
	let siblingHoverDuration = $derived(String(cardStyle.siblingHoverDuration ?? '0.3s'));

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
	let sectionTitleStyle = $derived([
		s?.theme?.sectionTitleSize ? `font-size: ${s.theme.sectionTitleSize}` : '',
		s?.theme?.sectionTitleWeight ? `font-weight: ${s.theme.sectionTitleWeight}` : '',
		s?.theme?.sectionTitleAlign ? `text-align: ${s.theme.sectionTitleAlign}` : '',
		s?.theme?.sectionTitleColor ? `color: ${s.theme.sectionTitleColor}` : ''
	].filter(Boolean).join('; ') || undefined);
	let dividerTitle = $derived(s?.section?.dividerTitle ?? '');
	let dividerSub = $derived(s?.section?.dividerSub ?? '');

	// Hero links
	let heroLinks = $derived((s?.links ?? []) as Array<{label: string; url: string; icon: IconName}>);

	// CTA
	let ctaTitle = $derived(s?.cta?.title ?? '');
	let ctaSub = $derived(s?.cta?.subtitle ?? '');
	let ctaBtn = $derived(s?.cta?.buttonText ?? '');
	let ctaUrl = $derived(s?.cta?.buttonUrl ?? 'https://wa.me');

	// Labels
	let labels = $derived((s?.labels ?? {}) as LabelSettings);

	// Animations
	let anim = $derived((s?.animations ?? {}) as AnimationSettings);
	let animDuration = $derived(anim.animDuration ?? 2);
	let animDelay = $derived(anim.animDelay ?? 0);
	let animEasing = $derived(anim.animEasing ?? 'ease-in-out');
	let animCards = $derived(anim.animCards ?? 'none');
	let animCardsDur = $derived(anim.animCardsDur ?? animDuration);
	let animCardsDel = $derived(anim.animCardsDel ?? animDelay);
	let animCardsEase = $derived(anim.animCardsEase ?? animEasing);
	let animButtons = $derived(anim.animButtons ?? 'none');
	let animButtonsDur = $derived(anim.animButtonsDur ?? animDuration);
	let animButtonsDel = $derived(anim.animButtonsDel ?? animDelay);
	let animButtonsEase = $derived(anim.animButtonsEase ?? animEasing);

	// License count from first beat (or default 4)
	let licenseCount = $derived(beats.length > 0 && beats[0].licenses ? beats[0].licenses.length : 4);
	let testimonialsTitle = $derived(s?.labels?.testimonialsTitle ?? 'Lo que dicen');

	// Featured beats (for the featured section)
	let featuredBeats = $derived(beats.filter(b => b.featured).slice(0, 4));

	type FilterState = { search: string; genre: string; key: string; sort: string; tags: string[] };
	let filters: FilterState = $state({ search: '', genre: '', key: '', sort: 'newest', tags: [] });

	// ── Show More batching ──
	const BATCH_SIZE = 8;
	let visibleCount = $state(BATCH_SIZE);
	let backToTopVisible = $state(false);

	// ── Genre tabs ──
	let activeGenre = $state('');

	// Reset visible count when filters change
	$effect(() => {
		void filters.search;
		void filters.genre;
		void filters.key;
		void filters.sort;
		void filters.tags.length;
		void activeGenre;
		visibleCount = BATCH_SIZE;
	});

	// Back to top detection
	$effect(() => {
		if (typeof window === 'undefined') return;
		function onScroll() { backToTopVisible = window.scrollY > 600; }
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Genre counts for tabs
	let genreCounts = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const b of beats) {
			if (b.genre) counts[b.genre] = (counts[b.genre] ?? 0) + 1;
		}
		return counts;
	});

	let sortedGenres = $derived(
		Object.entries(genreCounts)
			.sort(([, a], [, b]) => b - a)
			.map(([genre, count]) => ({ genre, count }))
	);

	function lowestPrice(beat: Beat & { id: string }): number {
		if (!beat.licenses?.length) return 0;
		return Math.min(...beat.licenses.map(l => l.priceMXN));
	}

	// Filtered + sorted beats — excludes featured from main grid
	let filteredBeats = $derived.by(() => {
		let list = [...beats];

		// Exclude featured (they have their own section)
		list = list.filter(b => !b.featured);

		// Genre tabs (takes priority over dropdown filter)
		const genreFilter = activeGenre || filters.genre;
		if (genreFilter) {
			list = list.filter(b => b.genre === genreFilter);
		}

		// Search
		if (filters.search?.trim()) {
			const q = filters.search.trim().toLowerCase();
			list = list.filter(b =>
				b.name?.toLowerCase().includes(q) ||
				b.artist?.toLowerCase().includes(q) ||
				b.genre?.toLowerCase().includes(q)
			);
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
			case 'newest': list.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')); break;
			case 'oldest': list.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')); break;
			case 'name-az': list.sort((a, b) => a.name.localeCompare(b.name)); break;
			case 'name-za': list.sort((a, b) => b.name.localeCompare(a.name)); break;
			case 'bpm-asc': list.sort((a, b) => a.bpm - b.bpm); break;
			case 'bpm-desc': list.sort((a, b) => b.bpm - a.bpm); break;
			case 'price-asc': list.sort((a, b) => lowestPrice(a) - lowestPrice(b)); break;
			case 'price-desc': list.sort((a, b) => lowestPrice(b) - lowestPrice(a)); break;
		}

		return list;
	});

	// Visible beats (batched)
	let visibleBeats = $derived(filteredBeats.slice(0, visibleCount));
	let hasMore = $derived(visibleCount < filteredBeats.length);
	let remainingCount = $derived(filteredBeats.length - visibleCount);

	function showMore() {
		visibleCount = Math.min(visibleCount + BATCH_SIZE, filteredBeats.length);
	}

	function showAll() {
		visibleCount = filteredBeats.length;
	}

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
		goto(`/beat/${beat.id}`);
	}

	/** Sanitize HTML from Firebase — only allow safe inline tags */
	// sanitizeHtml imported from $lib/sanitize
</script>

<svelte:head>
	<title>{heroTitle} — {s?.brand?.metaDescription ?? 'Beats que rompen'}</title>
	<meta property="og:title" content="{heroTitle} — {s?.brand?.metaDescription ?? 'Beats que rompen'}" />
	<meta property="og:description" content={s?.brand?.metaDescription ?? 'Beats profesionales para tu próximo hit. Explora, escucha y compra instrumentales únicos.'} />
	<meta property="og:type" content="website" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: heroTitle,
		url: 'https://dacewav.store',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://dacewav.store/?q={search_term_string}',
			'query-input': 'required name=search_term_string'
		}
	})}</script>`}
</svelte:head>

<!-- Hero -->
<section class="hero" style="{hv.gradOn ? `--hero-grad: ${heroGradStyle}` : ''}; min-height: {s?.theme?.heroMinHeight ?? 60}vh">
	{#if heroEyebrow && hv.eyebrowOn !== false}
	<div class="hero-eyebrow" style={eyebrowStyle}>
		<span class="dot" style="background: {eyebrowClr}"></span>
		{heroEyebrow}
	</div>
	{/if}
	<h1 class="hero-title{anim.animTitle && anim.animTitle !== 'none' ? ` anim-${anim.animTitle}` : ''}" style="{heroGlowStyle}; {heroTitleStyle}; animation-duration: {animDuration}s; animation-delay: {animDelay}s; animation-timing-function: {animEasing}">
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
				<Icon name={link.icon} size={16} />
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
		<h2 class="section-title" style={sectionTitleStyle}>🔥 Destacados</h2>
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
		{@html renderEmojis(sanitizeHtml(dividerTitle), $customEmojis)}
	</div>
	{#if dividerSub}
	<div class="section-divider-sub">
		<InlineEmoji text={dividerSub} />
	</div>
	{/if}
</div>
{/if}

<!-- Beats section -->
<section class="section" use:reveal={{}} id="beats">
	<div class="section-header">
		<h2 class="section-title" style={sectionTitleStyle}>{sectionTitle}</h2>
		<div class="section-line"></div>
		<div class="section-badge">{filteredBeats.length ? `${filteredBeats.length} beats` : '—'}</div>
	</div>

	<!-- Genre tabs -->
	{#if sortedGenres.length > 1}
		<div class="genre-tabs">
			<button class="genre-tab" class:active={!activeGenre} onclick={() => { activeGenre = ''; }}>
				Todos <span class="tab-count">{beats.filter(b => !b.featured).length}</span>
			</button>
			{#each sortedGenres as { genre, count }}
				<button class="genre-tab" class:active={activeGenre === genre} onclick={() => { activeGenre = activeGenre === genre ? '' : genre; }}>
					{genre} <span class="tab-count">{count}</span>
				</button>
			{/each}
		</div>
	{/if}

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

	<!-- Beat grid (batched) -->
	{#if beats.length > 0}
		{#if filteredBeats.length > 0}
			<div class="beat-grid{animCards && animCards !== 'none' ? ` anim-${animCards}` : ''}" use:staggerReveal={{ delay: 60 }} use:siblingBlur={{ effect: siblingHoverEffect, blur: siblingHoverBlur, opacity: siblingHoverOpacity, scale: siblingHoverScale, duration: siblingHoverDuration }} style="{animCards && animCards !== 'none' ? `--anim-dur: ${animCardsDur}s; --anim-del: ${animCardsDel}s; --anim-ease: ${animCardsEase}` : ''}">
				{#each visibleBeats as beat (beat.id)}
					<BeatCard {beat} onplay={handlePlay} onclick={handleBeatClick} labelFrom={labels.priceFrom ?? 'Desde'} />
				{/each}
			</div>

			<!-- Show more -->
			{#if hasMore}
				<div class="show-more">
					<button class="show-more-btn" onclick={showMore}>
						Mostrar más <span class="show-more-count">({remainingCount} restantes)</span>
					</button>
					<button class="show-all-btn" onclick={showAll}>
						Mostrar todos
					</button>
				</div>
			{/if}
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
	<div class="cta-sub"><InlineEmoji text={ctaSub} /></div>
	{/if}
	<a class="cta-btn{animButtons && animButtons !== 'none' ? ` anim-${animButtons}` : ''}" href={ctaUrl} target="_blank" rel="noopener" style="{animButtons && animButtons !== 'none' ? `animation-duration: ${animButtonsDur}s; animation-delay: ${animButtonsDel}s; animation-timing-function: ${animButtonsEase}` : ''}">
		<Icon name="whatsapp" size={16} />
		{ctaBtn}
	</a>
</div>
{/if}

<!-- Back to top -->
{#if backToTopVisible}
	<button class="back-to-top" onclick={scrollToTop} aria-label="Volver arriba">
		<Icon name="chevronUp" size={18} />
	</button>
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
		transition: background var(--duration-normal) var(--ease-out);
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
		transition: all var(--duration-fast) var(--ease-out);
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

	/* ── Genre Tabs ── */
	.genre-tabs {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-bottom: var(--space-5);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.genre-tab {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		min-height: 36px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		white-space: nowrap;
	}

	.genre-tab:hover {
		border-color: rgba(var(--accent-rgb), 0.4);
		color: var(--text);
		background: rgba(var(--accent-rgb), 0.04);
	}

	.genre-tab.active {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.15);
	}

	.tab-count {
		font-size: 10px;
		opacity: 0.6;
	}

	/* ── Show More ── */
	.show-more {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}

	.show-more-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		border: 1px solid rgba(var(--accent-rgb), 0.4);
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.06);
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
		min-height: 44px;
	}

	.show-more-btn:hover {
		background: rgba(var(--accent-rgb), 0.12);
		border-color: var(--accent);
		box-shadow: var(--glow-sm);
		transform: translateY(-1px);
	}

	.show-more-count {
		opacity: 0.7;
		font-size: var(--text-2xs);
	}

	.show-all-btn {
		padding: var(--space-2) var(--space-4);
		border: none;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		cursor: pointer;
		transition: color var(--duration-fast);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.show-all-btn:hover {
		color: var(--text);
	}

	/* ── Back to Top ── */
	.back-to-top {
		position: fixed;
		bottom: 100px;
		right: var(--space-6);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: var(--z-nav);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(8px);
		transition: all var(--duration-fast) var(--ease-out);
		animation: fadeInUp 0.2s var(--ease-out);
	}

	.back-to-top:hover {
		border-color: var(--accent);
		color: var(--accent);
		transform: translateY(-2px);
		box-shadow: var(--glow-sm);
	}

	/* ── Beat Grid ── */
	.beat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--beat-gap);
		align-items: stretch;
	}

	@media (max-width: 1024px) {
		.beat-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-3);
		}
	}

	@media (max-width: 600px) {
		.beat-grid {
			grid-template-columns: 1fr;
		}
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
		border-radius: var(--cta-btn-radius, var(--radius-lg));
		border: 1px solid rgba(var(--accent-rgb), 0.5);
		background: var(--cta-btn-bg, rgba(var(--accent-rgb), 0.1));
		color: var(--cta-btn-clr, var(--accent));
		text-decoration: none;
		letter-spacing: 0.04em;
		transition: all var(--duration-normal) var(--ease-out);
		min-height: var(--touch-min);
		opacity: var(--btn-opacity);
		position: relative;
	}

	.cta-btn:hover {
		background: var(--cta-btn-hover-bg, var(--accent));
		color: var(--bg);
		box-shadow: var(--glow-sm);
		opacity: var(--btn-opacity-hover);
		transform: translateY(-2px);
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

	/* ── Animation presets ── */
	@keyframes anim-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
	@keyframes anim-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
	@keyframes anim-bounce { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-12px); } 60% { transform: translateY(-6px); } }
	@keyframes anim-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
	@keyframes anim-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
	@keyframes anim-glow { 0%, 100% { opacity: 0.6; filter: brightness(1); } 50% { opacity: 1; filter: brightness(1.5); } }
	@keyframes anim-slide-up { from { transform: translateY(10px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
	@keyframes anim-slide-down { from { transform: translateY(-10px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
	@keyframes anim-fade-in { from { opacity: 0; } to { opacity: 1; } }

	.anim-float, .anim-pulse, .anim-bounce, .anim-spin, .anim-shake, .anim-glow, .anim-slide-up, .anim-slide-down, .anim-fade-in {
		animation-fill-mode: both;
		animation-iteration-count: infinite;
	}

	.anim-float { animation-name: anim-float; }
	.anim-pulse { animation-name: anim-pulse; }
	.anim-bounce { animation-name: anim-bounce; }
	.anim-spin { animation-name: anim-spin; }
	.anim-shake { animation-name: anim-shake; }
	.anim-glow { animation-name: anim-glow; }
	.anim-slide-up { animation-name: anim-slide-up; }
	.anim-slide-down { animation-name: anim-slide-down; }
	.anim-fade-in { animation-name: anim-fade-in; }

	/* Card animations — applied via beat-grid class */
	.beat-grid.anim-float > *,
	.beat-grid.anim-pulse > *,
	.beat-grid.anim-bounce > *,
	.beat-grid.anim-spin > *,
	.beat-grid.anim-shake > *,
	.beat-grid.anim-glow > *,
	.beat-grid.anim-slide-up > *,
	.beat-grid.anim-slide-down > *,
	.beat-grid.anim-fade-in > * {
		animation-fill-mode: both;
		animation-iteration-count: infinite;
		animation-duration: var(--anim-dur, 2s);
		animation-timing-function: var(--anim-ease, ease-in-out);
	}
	.beat-grid.anim-float > * { animation-name: anim-float; }
	.beat-grid.anim-pulse > * { animation-name: anim-pulse; }
	.beat-grid.anim-bounce > * { animation-name: anim-bounce; }
	.beat-grid.anim-spin > * { animation-name: anim-spin; }
	.beat-grid.anim-shake > * { animation-name: anim-shake; }
	.beat-grid.anim-glow > * { animation-name: anim-glow; }
	.beat-grid.anim-slide-up > * { animation-name: anim-slide-up; }
	.beat-grid.anim-slide-down > * { animation-name: anim-slide-down; }
	.beat-grid.anim-fade-in > * { animation-name: anim-fade-in; }
	/* Stagger delay for cards */
	.beat-grid[class*="anim-"] > *:nth-child(1) { animation-delay: calc(var(--anim-del, 0s) + 0s); }
	.beat-grid[class*="anim-"] > *:nth-child(2) { animation-delay: calc(var(--anim-del, 0s) + 0.05s); }
	.beat-grid[class*="anim-"] > *:nth-child(3) { animation-delay: calc(var(--anim-del, 0s) + 0.1s); }
	.beat-grid[class*="anim-"] > *:nth-child(4) { animation-delay: calc(var(--anim-del, 0s) + 0.15s); }
	.beat-grid[class*="anim-"] > *:nth-child(5) { animation-delay: calc(var(--anim-del, 0s) + 0.2s); }
	.beat-grid[class*="anim-"] > *:nth-child(6) { animation-delay: calc(var(--anim-del, 0s) + 0.25s); }
	.beat-grid[class*="anim-"] > *:nth-child(n+7) { animation-delay: calc(var(--anim-del, 0s) + 0.3s); }
</style>
