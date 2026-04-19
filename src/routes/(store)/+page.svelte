<script lang="ts">
	import { Skeleton, EmptyState } from '$lib/components';
	import { beatsList, genres, settings } from '$lib/stores';

	let beats = $derived($beatsList);
	let genreList = $derived($genres);
	let settingsData = $derived($settings.data);
	let heroTitle = $derived(settingsData?.hero?.title ?? 'Beats que');
	let heroSub = $derived(settingsData?.hero?.subtitle ?? 'Trap · R&B · Drill · Beats profesionales para tu próximo hit');
</script>

<svelte:head>
	<title>{settingsData?.hero?.title ?? 'DACEWAV'} — Beats que rompen</title>
</svelte:head>

<!-- Hero -->
<section class="hero">
	<div class="hero-eyebrow">
		<span class="dot"></span>
		En vivo · Producción profesional
	</div>
	<h1 class="hero-title">
		{heroTitle}<br>
		<span class="glow-word">rompen.</span>
	</h1>
	<p class="hero-sub">{heroSub}</p>
	<div class="hero-stats">
		<div class="stat">
			<div class="stat-num">{beats.length || '—'}</div>
			<div class="stat-label">beats</div>
		</div>
		<div class="stat">
			<div class="stat-num">{genreList.length || '—'}</div>
			<div class="stat-label">géneros</div>
		</div>
		<div class="stat">
			<div class="stat-num">4</div>
			<div class="stat-label">licencias</div>
		</div>
	</div>
</section>

<!-- Section divider -->
<div class="section-divider reveal">
	<div class="section-divider-text">
		Todo fire. <em>Zero filler.</em>
	</div>
	<div class="section-divider-sub">
		Beats profesionales. Licencias para todos los niveles — desde bedroom producers hasta majors.
	</div>
</div>

<!-- Beats section -->
<section class="section reveal" id="beats">
	<div class="section-header">
		<h2 class="section-title">Catálogo</h2>
		<div class="section-line"></div>
		<div class="section-badge">{beats.length ? `${beats.length} beats` : 'Próximamente'}</div>
	</div>

	{#if beats.length > 0}
		<div class="beat-grid">
			{#each beats as beat (beat.id)}
				<div class="beat-card">
					<div class="beat-cover">
						{#if beat.coverUrl}
							<img src={beat.coverUrl} alt={beat.title} loading="lazy" />
						{:else}
							<div class="beat-cover-placeholder">🎵</div>
						{/if}
					</div>
					<div class="beat-info">
						<div class="beat-title">{beat.title}</div>
						<div class="beat-meta">
							<span>{beat.genre}</span>
							<span>·</span>
							<span>{beat.bpm} BPM</span>
							<span>·</span>
							<span>{beat.key}</span>
						</div>
						<div class="beat-price">Desde ${beat.licenses?.basic ?? 29.99}</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="beat-grid">
			{#each Array(6) as _, i}
				<Skeleton lines={3} />
			{/each}
		</div>
	{/if}
</section>

<!-- CTA Section -->
<div class="cta-section reveal">
	<div class="cta-title">¿Listo para tu próximo hit?</div>
	<div class="cta-sub">Contáctanos por WhatsApp y te ayudamos a encontrar el beat perfecto para tu proyecto.</div>
	<a class="cta-btn" href="https://wa.me" target="_blank" rel="noopener">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
		Escríbenos
	</a>
</div>

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
		background: var(--border);
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
	}

	/* ── Beat Grid — responsive 3 breakpoints ── */
	.beat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--beat-gap);
		align-items: start;
	}

	/* ── Beat Card ── */
	.beat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		overflow: hidden;
		transition: all var(--duration-normal) var(--ease-out);
		cursor: pointer;
	}

	.beat-card:hover {
		border-color: var(--border-hover-accent);
		box-shadow: var(--shadow-lg), 0 0 30px rgba(var(--accent-rgb), 0.08);
		transform: translateY(-2px);
	}

	.beat-cover {
		aspect-ratio: 16/9;
		overflow: hidden;
		background: var(--surface2);
	}

	.beat-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.beat-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		opacity: 0.3;
	}

	.beat-info {
		padding: var(--space-4) var(--space-5);
	}

	.beat-title {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-1);
	}

	.beat-meta {
		display: flex;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.beat-price {
		margin-top: var(--space-3);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--accent);
	}

	/* ── CTA Section ── */
	.cta-section {
		position: relative;
		z-index: var(--z-content);
		text-align: center;
		padding: var(--space-16) var(--container-padding);
		border-top: 1px solid var(--border);
	}

	.cta-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4vw, 2.25rem);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-3);
	}

	.cta-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 480px;
		margin: 0 auto var(--space-6);
		line-height: 1.8;
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
		transition: all 0.2s;
		min-height: var(--touch-min);
		opacity: var(--btn-opacity);
	}

	.cta-btn:hover {
		background: var(--accent);
		color: var(--bg);
		box-shadow: var(--glow-sm);
		opacity: var(--btn-opacity-hover);
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
