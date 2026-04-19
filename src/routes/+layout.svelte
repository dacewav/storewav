<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	let scrollProgress = $state(0);
	let navHidden = $state(false);
	let navScrolled = $state(false);
	let lastScrollY = $state(0);
	let loaderVisible = $state(true);
	let cursorX = $state(-500);
	let cursorY = $state(-500);

	onMount(() => {
		// Hide loader after content loads
		const timer = setTimeout(() => { loaderVisible = false; }, 800);

		// Scroll handler
		function onScroll() {
			const y = window.scrollY;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			scrollProgress = max > 0 ? (y / max) * 100 : 0;

			navHidden = y > 100 && y > lastScrollY;
			navScrolled = y > 50;
			lastScrollY = y;
		}

		// Cursor glow
		function onMouseMove(e: MouseEvent) {
			cursorX = e.clientX;
			cursorY = e.clientY;
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('mousemove', onMouseMove, { passive: true });

		return () => {
			clearTimeout(timer);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('mousemove', onMouseMove);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="DACEWAV — Beats que rompen" />
	<meta name="theme-color" content="#060404" />
</svelte:head>

<!-- Loader -->
{#if loaderVisible}
<div id="loader">
	<div id="loader-brand">DACE<em>WAV</em></div>
	<div class="ld-dots">
		<div class="ld"></div>
		<div class="ld"></div>
		<div class="ld"></div>
	</div>
</div>
{/if}

<!-- Scroll progress -->
<div id="scroll-progress" style="width: {scrollProgress}%"></div>

<!-- Cursor glow -->
<div id="cursor-glow" style="left: {cursorX}px; top: {cursorY}px"></div>

<!-- Floating orbs -->
<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<div class="app">
	<!-- Nav -->
	<nav class="nav" class:n-hidden={navHidden} class:n-scrolled={navScrolled}>
		<a href="/" class="nav-brand">
			<span>DACEWAV</span><em>.</em>
		</a>
		<div class="nav-links">
			<a href="/" class="nav-link">Catálogo</a>
			<a href="/admin" class="nav-link">Admin</a>
			<button class="theme-toggle" title="Favoritos">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
			</button>
			<button class="theme-toggle" title="Cambiar tema">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
			</button>
		</div>
	</nav>

	<!-- Main -->
	<main class="main">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-left">
			<div class="footer-brand">DACE<em>WAV</em></div>
			<div class="footer-sub">Todos los derechos reservados · 2026</div>
		</div>
		<div class="footer-links">
			<a href="#" class="footer-link">Instagram</a>
			<a href="#" class="footer-link">YouTube</a>
			<a href="#" class="footer-link">WhatsApp</a>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		position: relative;
		z-index: var(--z-content);
	}

	/* ── Nav ── */
	.nav {
		position: sticky;
		top: 0;
		z-index: var(--z-nav);
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 1rem 2.5rem;
		background: rgba(6, 4, 4, 0.88);
		backdrop-filter: blur(var(--nav-blur));
		border-bottom: 1px solid var(--border);
		transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
	}

	.nav.n-hidden {
		transform: translateY(-100%);
	}

	.nav.n-scrolled {
		background: rgba(6, 4, 4, 0.95);
		border-bottom-color: rgba(0, 255, 136, 0.1);
	}

	.nav-brand {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
		display: flex;
		align-items: baseline;
		cursor: pointer;
	}

	.nav-brand em {
		color: var(--accent);
		font-style: normal;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.nav-link {
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.2s;
		position: relative;
		cursor: pointer;
	}

	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--accent);
		transition: width 0.3s;
	}

	.nav-link:hover {
		color: var(--text);
	}

	.nav-link:hover::after {
		width: 100%;
	}

	.theme-toggle {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--border2);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		transition: all 0.2s;
		padding: 0;
		flex-shrink: 0;
	}

	.theme-toggle:hover {
		color: var(--accent);
		border-color: rgba(0, 255, 136, 0.3);
		transform: rotate(15deg);
	}

	/* ── Main ── */
	.main {
		flex: 1;
	}

	/* ── Footer ── */
	.footer {
		position: relative;
		z-index: var(--z-content);
		border-top: 1px solid var(--border);
		padding: 3rem 2.5rem 4rem;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2rem;
		align-items: end;
	}

	.footer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 10%;
		right: 10%;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--accent), transparent);
		opacity: 0.2;
	}

	.footer-brand {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 800;
		color: var(--text);
	}

	.footer-brand em {
		color: var(--accent);
		font-style: normal;
	}

	.footer-sub {
		font-size: 11px;
		color: var(--text-hint);
		margin-top: 4px;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.footer-link {
		font-size: 11px;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.15s;
		cursor: pointer;
	}

	.footer-link:hover {
		color: var(--accent);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.nav {
			padding: 1rem;
		}

		.footer {
			grid-template-columns: 1fr;
			padding: 2rem 1rem 3rem;
		}

		#cursor-glow {
			display: none;
		}
	}
</style>
