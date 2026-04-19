<svelte:head>
	<title>DACEWAV — Beats que rompen</title>
</svelte:head>

<!-- Hero -->
<section class="hero">
	<div class="hero-eyebrow">
		<span class="dot"></span>
		En vivo · Producción profesional
	</div>
	<h1 class="hero-title">
		Beats que<br>
		<span class="glow-word">rompen.</span>
	</h1>
	<p class="hero-sub">Trap · R&B · Drill · Beats profesionales para tu próximo hit</p>
	<div class="hero-stats">
		<div class="stat">
			<div class="stat-num">—</div>
			<div class="stat-label">beats</div>
		</div>
		<div class="stat">
			<div class="stat-num">—</div>
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
		<div class="section-badge">Próximamente</div>
	</div>

	<div class="beat-grid">
		{#each Array(6) as _, i}
			<div class="skeleton-card">
				<div class="skeleton-img"></div>
				<div class="skeleton-body">
					<div class="skeleton-line w60"></div>
					<div class="skeleton-line w40"></div>
					<div class="skeleton-line w80"></div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	/* ── Hero ── */
	.hero {
		position: relative;
		z-index: 1;
		padding: 7rem 2.5rem 5rem;
		text-align: center;
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 255, 136, 0.08), transparent);
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
			radial-gradient(at 80% 20%, rgba(0, 204, 106, 0.3) 0, transparent 50%);
		background-size: 200% 200%;
		animation: gradientShift 12s ease infinite;
	}

	.hero-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 1.5rem;
		border: 1px solid rgba(0, 255, 136, 0.2);
		padding: 4px 14px;
		border-radius: var(--radius-full);
		background: rgba(0, 255, 136, 0.06);
		position: relative;
		z-index: 1;
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
		font-size: clamp(2.8rem, 8vw, 6.5rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 1;
		color: var(--text);
	}

	.glow-word {
		display: inline-block;
		color: var(--accent);
		position: relative;
		text-shadow: var(--glow-md);
	}

	.hero-sub {
		font-size: 14px;
		color: var(--text-secondary);
		max-width: 520px;
		margin: 0 auto 2rem;
		line-height: 1.9;
		position: relative;
		z-index: 1;
		letter-spacing: 0.02em;
	}

	.hero-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 3rem;
		flex-wrap: wrap;
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
		position: relative;
		z-index: 1;
	}

	.stat-num {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 800;
		color: var(--text);
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--text-secondary);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	/* ── Section Divider ── */
	.section-divider {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 5rem 2.5rem;
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
		font-size: clamp(2rem, 6vw, 4.5rem);
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
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 1rem;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
		position: relative;
		line-height: 1.8;
	}

	/* ── Section ── */
	.section {
		position: relative;
		z-index: 1;
		padding: var(--space-16) 2.5rem;
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
		font-size: 10px;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		border: 1px solid rgba(0, 255, 136, 0.3);
		background: rgba(0, 255, 136, 0.08);
		color: var(--accent);
		letter-spacing: 0.06em;
	}

	/* ── Beat Grid ── */
	.beat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
		align-items: start;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.hero {
			padding: 4rem 1.25rem 3rem;
		}

		.section {
			padding: 2.5rem 1.25rem;
		}

		.section-divider {
			padding: 3rem 1.25rem;
		}
	}
</style>
