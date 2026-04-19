<script lang="ts">
	import { onMount } from 'svelte';

	let { children } = $props();

	let scrollProgress = $state(0);
	let navHidden = $state(false);
	let navScrolled = $state(false);
	let lastScrollY = $state(0);
	let loaderVisible = $state(true);
	let cursorX = $state(-500);
	let cursorY = $state(-500);
	let menuOpen = $state(false);
	let isDark = $state(true);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function applyTheme() {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
			document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
		}
	}

	function toggleTheme() {
		isDark = !isDark;
		applyTheme();
	}

	function closeMenu() {
		menuOpen = false;
	}

	onMount(() => {
		const timer = setTimeout(() => { loaderVisible = false; }, 800);

		// Detect system theme preference
		const mq = window.matchMedia('(prefers-color-scheme: light)');
		isDark = !mq.matches;
		applyTheme();
		mq.addEventListener('change', (e) => { isDark = !e.matches; applyTheme(); });

		function onScroll() {
			const y = window.scrollY;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			scrollProgress = max > 0 ? (y / max) * 100 : 0;

			navHidden = y > 100 && y > lastScrollY;
			navScrolled = y > 50;
			lastScrollY = y;

			if (menuOpen) closeMenu();
		}

		function onMouseMove(e: MouseEvent) {
			cursorX = e.clientX;
			cursorY = e.clientY;
		}

		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && menuOpen) closeMenu();
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('keydown', onKeydown);

		// Reveal on scroll
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('vis');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15 }
		);
		document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

		return () => {
			clearTimeout(timer);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('keydown', onKeydown);
			observer.disconnect();
		};
	});
</script>

<svelte:head>
	<meta name="description" content="DACEWAV — Beats que rompen" />
</svelte:head>

<!-- Banner (admin-editable) -->
<div class="site-banner" style="display:none">
	<div class="banner-inner"></div>
</div>

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
		<a href="/" class="nav-brand" onclick={closeMenu}>
			<span>DACEWAV</span><em>.</em>
		</a>

		<!-- Desktop links -->
		<div class="nav-links hide-mobile">
			<a href="/" class="nav-link">Catálogo</a>
			<a href="/admin" class="nav-link">Admin</a>
			<button class="icon-btn" title="Favoritos" aria-label="Favoritos">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
			</button>
			<button class="icon-btn" title="Cambiar tema" aria-label="Cambiar tema" onclick={toggleTheme}>
				{#if isDark}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
				{:else}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
				{/if}
			</button>
		</div>

		<!-- Hamburger (mobile only) -->
		<button
			class="hamburger hide-desktop"
			onclick={toggleMenu}
			aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
			aria-expanded={menuOpen}
		>
			<span class="burger-line" class:open={menuOpen}></span>
			<span class="burger-line" class:open={menuOpen}></span>
			<span class="burger-line" class:open={menuOpen}></span>
		</button>
	</nav>

	<!-- Mobile menu overlay -->
	{#if menuOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="mobile-overlay" onclick={closeMenu} onkeydown={() => {}}></div>
		<div class="mobile-menu">
			<a href="/" class="mobile-link" onclick={closeMenu}>Catálogo</a>
			<a href="/admin" class="mobile-link" onclick={closeMenu}>Admin</a>
			<div class="mobile-actions">
				<button class="icon-btn" title="Favoritos" aria-label="Favoritos" onclick={closeMenu}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
					<span>Favoritos</span>
				</button>
				<button class="icon-btn" title="Cambiar tema" aria-label="Cambiar tema" onclick={() => { toggleTheme(); closeMenu(); }}>
					{#if isDark}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
					{/if}
					<span>Tema</span>
				</button>
			</div>
		</div>
	{/if}

	<!-- Main -->
	<main class="main" id="main-content">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-left">
			<div class="footer-brand">DACE<em>WAV</em></div>
			<div class="footer-sub">Todos los derechos reservados · 2026</div>
		</div>
		<div class="footer-links">
			<a href="https://instagram.com" class="footer-link" target="_blank" rel="noopener">Instagram</a>
			<a href="https://youtube.com" class="footer-link" target="_blank" rel="noopener">YouTube</a>
			<a href="https://wa.me" class="footer-link" target="_blank" rel="noopener">WhatsApp</a>
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

	/* ── Banner ── */
	.site-banner {
		position: relative;
		z-index: var(--z-content);
		overflow: hidden;
		background: var(--red);
		padding: var(--space-2) 0;
	}

	.banner-inner {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text);
		text-align: center;
		white-space: nowrap;
		letter-spacing: 0.05em;
	}

	/* ── Nav ── */
	.nav {
		position: sticky;
		top: 0;
		z-index: var(--z-nav);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem var(--container-padding);
		background: var(--nav-bg);
		backdrop-filter: blur(var(--nav-blur));
		border-bottom: 1px solid var(--border);
		transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
	}

	.nav.n-hidden {
		transform: translateY(-100%);
	}

	.nav.n-scrolled {
		background: var(--nav-bg-scrolled);
		border-bottom-color: var(--nav-border-scrolled);
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
		font-size: var(--text-2xs);
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

	.icon-btn {
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border-radius: 50%;
		border: 1px solid var(--border2);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		padding: 0;
		flex-shrink: 0;
	}

	.icon-btn:hover {
		color: var(--accent);
		border-color: rgba(var(--accent-rgb), 0.3);
		transform: rotate(15deg);
	}

	/* ── Hamburger ── */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 5px;
		width: var(--touch-min);
		height: var(--touch-min);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.burger-line {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--text);
		border-radius: 1px;
		transition: all 0.3s var(--ease-out);
		transform-origin: center;
	}

	.burger-line.open:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.burger-line.open:nth-child(2) {
		opacity: 0;
	}

	.burger-line.open:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* ── Mobile Menu ── */
	.mobile-overlay {
		display: none;
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-nav) - 1);
		background: var(--overlay-bg);
		backdrop-filter: blur(4px);
	}

	.mobile-menu {
		display: none;
		position: fixed;
		top: 0;
		right: 0;
		width: min(300px, 85vw);
		height: 100dvh;
		z-index: var(--z-nav);
		background: var(--bg-secondary);
		border-left: 1px solid var(--border);
		padding: 5rem var(--space-6) var(--space-6);
		flex-direction: column;
		gap: var(--space-2);
		animation: slideInRight 0.3s var(--ease-out);
	}

	.mobile-link {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		transition: all 0.15s;
		min-height: var(--touch-min);
		display: flex;
		align-items: center;
	}

	.mobile-link:hover {
		background: var(--surface);
		color: var(--accent);
	}

	.mobile-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}

	.mobile-actions .icon-btn {
		flex: 1;
		border-radius: var(--radius-md);
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.mobile-actions .icon-btn span {
		font-family: var(--font-body);
	}

	@keyframes slideInRight {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
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
		padding: var(--space-12) var(--container-padding) var(--space-16);
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-8);
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
		font-size: var(--text-2xs);
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
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.15s;
		cursor: pointer;
		min-height: var(--touch-min);
		display: flex;
		align-items: center;
	}

	.footer-link:hover {
		color: var(--accent);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.hamburger {
			display: flex;
		}

		.mobile-overlay,
		.mobile-menu {
			display: flex;
		}

		.footer {
			grid-template-columns: 1fr;
		}
	}
</style>
