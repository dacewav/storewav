<script lang="ts">
	import { Skeleton, EmptyState, BeatCard, Filters, BeatModal, Testimonials } from '$lib/components';
	import { beatsList, genres, settings, player } from '$lib/stores';
	import { staggerReveal } from '$lib/actions';
	import type { Beat } from '$lib/stores/beats';

	let beats = $derived($beatsList);
	let genreList = $derived($genres);
	let s = $derived($settings.data);

	// Hero
	let heroTitle = $derived(s?.hero?.title ?? 'Beats que');
	let heroSub = $derived(s?.hero?.subtitle ?? '');
	let heroEyebrow = $derived(s?.hero?.eyebrow ?? '');
	let heroGlow = $derived(s?.hero?.glowWord ?? 'rompen.');

	// Section
	let sectionTitle = $derived(s?.section?.title ?? 'Catálogo');
	let dividerTitle = $derived(s?.section?.dividerTitle ?? '');
	let dividerSub = $derived(s?.section?.dividerSub ?? '');

	// CTA
	let ctaTitle = $derived(s?.cta?.title ?? '');
	let ctaSub = $derived(s?.cta?.subtitle ?? '');
	let ctaBtn = $derived(s?.cta?.buttonText ?? '');
	let ctaUrl = $derived(s?.cta?.buttonUrl ?? 'https://wa.me');

	// Labels
	let labels = $derived(s?.labels ?? {});

	// License count from first beat (or default 4)
	let licenseCount = $derived(beats.length > 0 && beats[0].licenses ? Object.keys(beats[0].licenses).length : 4);
	type FilterState = { search: string; genre: string; key: string; sort: string; tags: string[] };
	let filters: FilterState = $state({ search: '', genre: '', key: '', sort: 'newest', tags: [] });

	// Modal
	let modalOpen = $state(false);
	let selectedBeat: (Beat & { id: string }) | null = $state(null);

	// Clear selected beat when modal closes
	$effect(() => {
		if (!modalOpen) {
			// Delay to avoid clearing during close animation
			const timer = setTimeout(() => { selectedBeat = null; }, 250);
			return () => clearTimeout(timer);
		}
	});

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
	}

	function handleBeatClick(beat: Beat & { id: string }) {
		selectedBeat = beat;
		modalOpen = true;
	}
</script>

<svelte:head>
	<title>{heroTitle} — {s?.brand?.metaDescription ?? 'Beats que rompen'}</title>
</svelte:head>

<!-- Hero -->
<section class="hero">
	{#if heroEyebrow}
	<div class="hero-eyebrow">
		<span class="dot"></span>
		{heroEyebrow}
	</div>
	{/if}
	<h1 class="hero-title">
		{heroTitle}<br>
		<span class="glow-word">{heroGlow}</span>
	</h1>
	{#if heroSub}
	<p class="hero-sub">{heroSub}</p>
	{/if}
	<div class="hero-stats">
		<div class="stat">
			<div class="stat-num">{beats.length || '—'}</div>
			<div class="stat-label">{labels.statBeats ?? 'beats'}</div>
		</div>
		<div class="stat">
			<div class="stat-num">{genreList.length || '—'}</div>
			<div class="stat-label">{labels.statGenres ?? 'géneros'}</div>
		</div>
		<div class="stat">
			<div class="stat-num">{licenseCount}</div>
			<div class="stat-label">{labels.statLicenses ?? 'licencias'}</div>
		</div>
	</div>
</section>

<!-- Section divider -->
{#if dividerTitle}
<div class="section-divider reveal">
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
<section class="section reveal" id="beats">
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
			<div class="beat-grid" use:staggerReveal={{ delay: 60 }}>
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
<Testimonials items={s.testimonials} title="Lo que dicen" />
{/if}

<!-- CTA Section -->
{#if ctaTitle}
<div class="cta-section reveal">
	<div class="cta-title">{ctaTitle}</div>
	{#if ctaSub}
	<div class="cta-sub">{ctaSub}</div>
	{/if}
	<a class="cta-btn" href={ctaUrl} target="_blank" rel="noopener">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
		{ctaBtn}
	</a>
</div>
{/if}

<!-- Beat Modal -->
<BeatModal
	bind:open={modalOpen}
	beat={selectedBeat}
	labelPreview={labels.beatPreview ?? 'Escuchar preview'}
	labelLicenses={labels.licenses ?? 'Licencias'}
	labelBuy={labels.buyPrefix ?? 'Comprar'}
	licenseLabels={{
		basic: labels.licenseBasic ?? 'Basic',
		premium: labels.licensePremium ?? 'Premium',
		unlimited: labels.licenseUnlimited ?? 'Unlimited',
		exclusive: labels.licenseExclusive ?? 'Exclusive'
	}}
	licenseDescs={{
		basic: labels.licenseBasicDesc ?? 'MP3 · 1 uso',
		premium: labels.licensePremiumDesc ?? 'WAV · Sin tag',
		unlimited: labels.licenseUnlimitedDesc ?? 'WAV + Stems',
		exclusive: labels.licenseExclusiveDesc ?? 'Exclusivo total'
	}}
/>

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
		background: radial-gradient(ellipse 80% 60% at 50% 0%, var(--accent-glow), transparent);
		pointer-events: none;
	}

	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.03;
		background:
			radial-gradient(at 20% 80%, var(--accent) 0, transparent 50%),
			radial-gradient(at 80% 20%, var(--accent-glow-strong) 0, transparent 50%);
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
	}

	.glow-word {
		display: inline-block;
		color: var(--accent);
		position: relative;
		text-shadow: var(--glow-md);
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

	.section-divider-text em {
		color: var(--accent);
		font-style: normal;
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
		font-size: 1.4rem;
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
		transition: all 0.2s var(--ease-out);
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
		transition: all 0.25s var(--ease-out);
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
