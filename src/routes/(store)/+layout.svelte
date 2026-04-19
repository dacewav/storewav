<script lang="ts">
	import { onMount } from 'svelte';
	import { settings, wishlist } from '$lib/stores';
	import { ToastContainer, Player, WishlistPanel } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';

	let { children } = $props();

	let scrollProgress = $state(0);
	let navHidden = $state(false);
	let navScrolled = $state(false);
	let lastScrollY = $state(0);
	let loaderVisible = $state(true);
	let loaderFading = $state(false);
	let cursorX = $state(-500);
	let cursorY = $state(-500);
	let menuOpen = $state(false);
	let isDark = $state(true);
	let mobileMenuEl: HTMLElement | undefined = $state();
	let wishlistOpen = $state(false);

	// Settings from Firebase
	let settingsData = $derived($settings.data);
	let brandName = $derived(settingsData?.brand?.name ?? 'DACEWAV');
	let brandLogo = $derived(settingsData?.brand?.logo ?? '');
	let brandSplit = $derived(() => {
		const name = brandName;
		// Split at last vowel-consonant boundary for the <em> styling
		// Default: split "DACEWAV" into "DACE" + "WAV"
		if (name.length > 4) {
			return { first: name.slice(0, -3), last: name.slice(-3) };
		}
		return { first: name, last: '' };
	});
	let loaderText = $derived(settingsData?.loader?.brandText ?? brandName);
	let loaderEnabled = $derived(settingsData?.loader?.enabled !== false);
	let footerText = $derived(settingsData?.brand?.footerText ?? 'Todos los derechos reservados');
	let metaDesc = $derived(settingsData?.brand?.metaDescription ?? 'Beats que rompen');
	let wishCount = $derived($wishlist.length);

	// Banner
	let bannerEnabled = $derived(settingsData?.banner?.enabled && settingsData?.banner?.text);
	let bannerText = $derived(settingsData?.banner?.text ?? '');
	let bannerUrl = $derived(settingsData?.banner?.url ?? '');
	let bannerAnim = $derived(settingsData?.banner?.animation ?? 'static');

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

	/** Focus trap para mobile menu */
	function trapFocus(e: KeyboardEvent) {
		if (!menuOpen || e.key !== 'Tab' || !mobileMenuEl) return;

		const focusable = mobileMenuEl.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	// Auto-focus primer elemento del menú al abrir
	$effect(() => {
		if (menuOpen && mobileMenuEl) {
			const first = mobileMenuEl.querySelector<HTMLElement>('a, button');
			first?.focus();
		}
	});

	onMount(() => {
		const timer = setTimeout(() => { loaderFading = true; }, 800);
		const removeTimer = setTimeout(() => { loaderVisible = false; }, 1300);

		// Detect system theme preference
		const mq = window.matchMedia('(prefers-color-scheme: light)');
		isDark = !mq.matches;
		applyTheme();
		function onThemeChange(e: MediaQueryListEvent) { isDark = !e.matches; applyTheme(); }
		mq.addEventListener('change', onThemeChange);

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
			trapFocus(e);
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
			clearTimeout(removeTimer);
			mq.removeEventListener('change', onThemeChange);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('keydown', onKeydown);
			observer.disconnect();
		};
	});
</script>

<svelte:head>
	<meta name="description" content="{brandName} — {metaDesc}" />
</svelte:head>

<!-- Banner (admin-editable) -->
{#if bannerEnabled}
<div class="site-banner">
	{#if bannerUrl}
		<a href={bannerUrl} class="banner-inner banner-{bannerAnim}" target="_blank" rel="noopener">{bannerText}</a>
	{:else}
		<div class="banner-inner banner-{bannerAnim}">{bannerText}</div>
	{/if}
</div>
{/if}

<!-- Loader -->
{#if loaderEnabled && loaderVisible}
<div id="loader" class:fading={loaderFading}>
	<div id="loader-brand">
		{#if brandSplit().last}
			{brandSplit().first}<em>{brandSplit().last}</em>
		{:else}
			{loaderText}
		{/if}
	</div>
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
	<nav class="nav" class:n-hidden={navHidden} class:n-scrolled={navScrolled} aria-label="Navegación principal">
		<a href="/" class="nav-brand" onclick={closeMenu}>
			{#if brandLogo}
				<img class="nav-logo" src={brandLogo} alt={brandName} />
			{:else if brandSplit().last}
				<span>{brandSplit().first}</span><em>{brandSplit().last}</em>.
			{:else}
				<span>{brandName}</span><em>.</em>
			{/if}
		</a>

		<!-- Desktop links -->
		<div class="nav-links hide-mobile">
			<a href="/" class="nav-link">Catálogo</a>
			<a href="/admin" class="nav-link">Admin</a>
			<button class="icon-btn" title="Favoritos" aria-label="Favoritos" onclick={() => wishlistOpen = true}>
				<Icon name="heart" size={14} />
				{#if wishCount > 0}
					<span class="nav-badge">{wishCount}</span>
				{/if}
			</button>
			<button class="icon-btn" title="Cambiar tema" aria-label="Cambiar tema" onclick={toggleTheme}>
				<Icon name={isDark ? 'sun' : 'moon'} size={14} />
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
		<div class="mobile-menu" bind:this={mobileMenuEl}>
			<a href="/" class="mobile-link" onclick={closeMenu}>Catálogo</a>
			<a href="/admin" class="mobile-link" onclick={closeMenu}>Admin</a>
			<div class="mobile-actions">
				<button class="icon-btn" title="Favoritos" aria-label="Favoritos" onclick={() => { closeMenu(); wishlistOpen = true; }}>
					<Icon name="heart" size={16} />
					<span>Favoritos</span>
					{#if wishCount > 0}
						<span class="nav-badge nav-badge-inline">{wishCount}</span>
					{/if}
				</button>
				<button class="icon-btn" title="Cambiar tema" aria-label="Cambiar tema" onclick={() => { toggleTheme(); closeMenu(); }}>
					<Icon name={isDark ? 'sun' : 'moon'} size={16} />
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
			<div class="footer-brand">
			{#if brandSplit().last}
				{brandSplit().first}<em>{brandSplit().last}</em>
			{:else}
				{brandName}
			{/if}
		</div>
			<div class="footer-sub">{footerText}</div>
		</div>
		<div class="footer-links">
			{#if settingsData?.links?.length}
				{#each settingsData.links as link}
					<a href={link.url} class="footer-link" target="_blank" rel="noopener">{link.label}</a>
				{/each}
			{:else}
				<a href="https://instagram.com" class="footer-link" target="_blank" rel="noopener">Instagram</a>
				<a href="https://youtube.com" class="footer-link" target="_blank" rel="noopener">YouTube</a>
				<a href="https://wa.me" class="footer-link" target="_blank" rel="noopener">WhatsApp</a>
			{/if}
		</div>
	</footer>
</div>

<Player />
<WishlistPanel
	bind:open={wishlistOpen}
	emptyTitle={settingsData?.labels?.wishlistEmptyTitle ?? 'Sin favoritos'}
	emptySub={settingsData?.labels?.wishlistEmptySub ?? 'Añade beats a tu lista para verlos aquí'}
/>
<ToastContainer />

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
		text-decoration: none;
		display: block;
	}

	a.banner-inner:hover {
		color: var(--bg);
	}

	.banner-scroll {
		animation: banner-scroll 12s linear infinite;
	}

	.banner-fade-pulse {
		animation: banner-fade-pulse 3s ease-in-out infinite;
	}

	.banner-bounce {
		animation: banner-bounce 2s ease-in-out infinite;
	}

	.banner-glow-pulse {
		animation: banner-glow-pulse 2.5s ease-in-out infinite;
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

	.nav.n-scrolled::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 10%;
		right: 10%;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.15), transparent);
		pointer-events: none;
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
		transition: transform 0.2s var(--ease-out);
	}

	.nav-brand:hover {
		transform: scale(1.03);
	}

	.nav-logo {
		height: 28px;
		width: auto;
		object-fit: contain;
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
		position: relative;
	}

	.icon-btn:hover {
		color: var(--accent);
		border-color: rgba(var(--accent-rgb), 0.3);
		transform: rotate(15deg);
	}

	.nav-badge {
		position: absolute;
		top: 2px;
		right: 2px;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: var(--radius-full);
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		line-height: 1;
		box-shadow: 0 0 6px rgba(var(--accent-rgb), 0.4);
	}

	.nav-badge-inline {
		position: static;
		margin-left: var(--space-2);
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
		animation: fadeIn var(--duration-fast) var(--ease-out);
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
		box-shadow: var(--shadow-menu);
	}

	.mobile-link {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		transition: all 0.2s var(--ease-out);
		min-height: var(--touch-min);
		display: flex;
		align-items: center;
		animation: fadeInUp 0.3s var(--ease-out) both;
	}

	.mobile-link:nth-child(2) {
		animation-delay: 60ms;
	}

	.mobile-link:hover {
		background: var(--surface);
		color: var(--accent);
		transform: translateX(4px);
	}

	.mobile-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
		animation: fadeInUp 0.3s var(--ease-out) 120ms both;
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
		/* Space for fixed player bar */
		padding-bottom: 80px;
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
		left: 15%;
		right: 15%;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.12), transparent);
		pointer-events: none;
	}

	.footer-brand {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 800;
		color: var(--text);
		transition: color 0.2s;
	}

	.footer-brand:hover {
		color: var(--accent);
	}

	.footer-brand em {
		color: var(--accent);
		font-style: normal;
	}

	.footer-sub {
		font-size: var(--text-2xs);
		color: var(--text-hint);
		margin-top: 4px;
		letter-spacing: 0.02em;
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
		transition: all 0.2s var(--ease-out);
		cursor: pointer;
		min-height: var(--touch-min);
		display: flex;
		align-items: center;
		position: relative;
		letter-spacing: 0.02em;
	}

	.footer-link::after {
		content: '';
		position: absolute;
		bottom: 8px;
		left: 0;
		width: 0;
		height: 1px;
		background: var(--accent);
		transition: width 0.25s var(--ease-out);
	}

	.footer-link:hover {
		color: var(--accent);
	}

	.footer-link:hover::after {
		width: 100%;
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
