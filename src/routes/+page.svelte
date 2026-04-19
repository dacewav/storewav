<svelte:head>
	<title>DACEWAV — Beats que rompen</title>
</svelte:head>

<section class="hero">
	<h1 class="hero-title">Beats que <span class="accent">rompen</span></h1>
	<p class="hero-sub">Producción profesional para tu próximo hit</p>
</section>

<section class="coming-soon">
	<p class="coming-soon-text">Bloque 1 en progreso — Design System</p>
	<p class="coming-soon-sub">Próximo: componentes base + beat grid</p>
</section>

<style>
	.hero {
		text-align: center;
		padding: var(--space-20) 0 var(--space-16);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: var(--text-6xl);
		font-weight: 800;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text);
	}

	.accent {
		color: var(--color-accent);
		text-shadow: var(--glow-accent);
	}

	.hero-sub {
		font-family: var(--font-body);
		font-size: var(--text-xl);
		color: var(--color-text-secondary);
		margin-top: var(--space-4);
		letter-spacing: var(--tracking-wide);
	}

	.coming-soon {
		text-align: center;
		padding: var(--space-16) 0;
		border-top: 1px solid var(--color-border);
	}

	.coming-soon-text {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-accent);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
	}

	.coming-soon-sub {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}

	@media (max-width: 640px) {
		.hero {
			padding: var(--space-12) 0 var(--space-8);
		}

		.hero-title {
			font-size: var(--text-4xl);
		}

		.hero-sub {
			font-size: var(--text-base);
		}
	}
</style>
