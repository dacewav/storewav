<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="DACEWAV — Beats que rompen" />
	<meta name="theme-color" content="#0a0a0a" />
</svelte:head>

<div class="app">
	<header class="header">
		<div class="header-inner">
			<a href="/" class="logo">
				<span class="logo-text">DACEWAV</span>
				<span class="logo-dot">.</span>
			</a>
			<nav class="nav">
				<a href="/" class="nav-link active">Beats</a>
				<a href="/admin" class="nav-link">Admin</a>
			</nav>
		</div>
	</header>

	<main class="main">
		{@render children()}
	</main>

	<footer class="footer">
		<p class="footer-text">© 2026 DACEWAV — Todos los derechos reservados</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	/* ── Header ── */
	.header {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
		backdrop-filter: blur(12px);
		background: rgba(10, 10, 10, 0.8);
		border-bottom: 1px solid var(--color-border);
	}

	.header-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--space-6);
		height: var(--header-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: baseline;
		text-decoration: none;
		cursor: pointer;
	}

	.logo-text {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.logo:hover .logo-text {
		color: var(--color-accent);
	}

	.logo-dot {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--color-accent);
	}

	/* ── Nav ── */
	.nav {
		display: flex;
		gap: var(--space-1);
	}

	.nav-link {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		transition: all var(--duration-fast) var(--ease-out);
		cursor: pointer;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}

	.nav-link.active {
		color: var(--color-accent);
		background: var(--color-accent-glow);
	}

	/* ── Main ── */
	.main {
		flex: 1;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		width: 100%;
	}

	/* ── Footer ── */
	.footer {
		border-top: 1px solid var(--color-border);
		padding: var(--space-8) var(--space-6);
		text-align: center;
	}

	.footer-text {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
	}

	/* ── Responsive ── */
	@media (max-width: 640px) {
		.header-inner {
			padding: 0 var(--space-4);
		}

		.logo-text {
			font-size: var(--text-xl);
		}

		.logo-dot {
			font-size: var(--text-xl);
		}

		.main {
			padding: var(--space-6) var(--space-4);
		}
	}
</style>
