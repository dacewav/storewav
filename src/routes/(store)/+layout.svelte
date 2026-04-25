<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { settings, wishlist, auth, player } from '$lib/stores';
	import { ToastContainer, Player, WishlistPanel, Particles } from '$lib/components';
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
	let cursorLerpX = $state(-500);
	let cursorLerpY = $state(-500);
	let menuOpen = $state(false);
	let isDark = $state(true);
	let mobileMenuEl: HTMLElement | undefined = $state();
	let wishlistOpen = $state(false);

	// Settings from Firebase
	let settingsData = $derived($settings.data);
	let brandName = $derived(settingsData?.brand?.name ?? 'DACEWAV');
	let brandLogo = $derived(settingsData?.brand?.logo ?? '');
	let logoHeight = $derived(settingsData?.layout?.logoHeight ?? 28);
	let brandSplit = $derived.by(() => {
		const name = brandName;
		if (name.length > 4) {
			return { first: name.slice(0, -3), last: name.slice(-3) };
		}
		return { first: name, last: '' };
	});
	let loaderText = $derived(settingsData?.loader?.brandText ?? brandName);
	let loaderEnabled = $derived(settingsData?.loader?.enabled !== false);
	let footerText = $derived(settingsData?.brand?.footerText ?? 'Todos los derechos reservados');
	let metaDesc = $derived(settingsData?.brand?.metaDescription ?? 'Beats que rompen');
	let navLinks = $derived(settingsData?.links ?? []);
	let sectionTitle = $derived(settingsData?.section?.title ?? 'Catálogo');
	let accent = $derived(settingsData?.theme?.accent ?? '#dc2626');
	let wishCount = $derived($wishlist.length);
	let hasPlayer = $derived($player.beatId !== null);

	// Particles
	let particlesOn = $derived(settingsData?.theme?.particlesOn === true);
	let particlesCount = $derived(settingsData?.theme?.particlesCount ?? 50);
	let particlesSpeed = $derived(settingsData?.theme?.particlesSpeed ?? 1);
	let particlesType = $derived(settingsData?.theme?.particlesType ?? 'circle');
	let particlesColor = $derived(settingsData?.theme?.particlesColor ?? '');
	let particlesOpacity = $derived(settingsData?.theme?.particlesOpacity ?? 0.3);
	let particlesText = $derived(settingsData?.theme?.particlesText ?? '');
	let particlesImgUrl = $derived(settingsData?.theme?.particlesImgUrl ?? '');
	let particlesSizeMin = $derived(settingsData?.theme?.particlesSizeMin ?? 3);
	let particlesSizeMax = $derived(settingsData?.theme?.particlesSizeMax ?? 8);
	let customCSS = $derived(settingsData?.theme?.customCSS ?? '');
	let animCustomCSS = $derived(settingsData?.animations?.animCustomCSS ?? '');
	let bgPattern = $derived(settingsData?.theme?.bgPattern ?? 'none');
	let bgPatternColor = $derived(settingsData?.theme?.bgPatternColor ?? '');
	let bgPatternOpacity = $derived(settingsData?.theme?.bgPatternOpacity ?? 0.05);
	let scrollbarThin = $derived(settingsData?.theme?.scrollbarThin ?? false);
	let scrollbarColor = $derived(settingsData?.theme?.scrollbarColor ?? '');
	let footerVisible = $derived(settingsData?.layout?.footerVisible !== false);
	let navHeight = $derived(settingsData?.layout?.navHeight ?? 64);

	// Animations
	let animLogo = $derived(settingsData?.animations?.animLogo ?? 'none');

	// Check if current user is admin
	let isAdmin = $derived($auth.isAdmin);

	// Banner
	let bannerEnabled = $derived(settingsData?.banner?.enabled && settingsData?.banner?.text && settingsData?.layout?.showBanner !== false);
	let bannerText = $derived(settingsData?.banner?.text ?? '');
	let bannerUrl = $derived(settingsData?.banner?.url ?? '');
	let bannerAnim = $derived(settingsData?.banner?.animation ?? 'static');
	let bannerSpeed = $derived(settingsData?.banner?.speed ?? 20);
	let bannerEasing = $derived(settingsData?.banner?.easing ?? 'linear');
	let bannerDir = $derived(settingsData?.banner?.direction ?? 'normal');
	let bannerDelay = $derived(settingsData?.banner?.delay ?? 0);
	let bannerBg = $derived(settingsData?.banner?.bgColor ?? '#7f1d1d');
	let bannerTxtClr = $derived(settingsData?.banner?.textColor ?? '#ffffff');
	let bannerDuration = $derived.by(() => {
		const s = bannerSpeed;
		switch (bannerAnim) {
			case 'scroll': return `${s}s`;
			case 'fade-pulse': return `${s / 5}s`;
			case 'bounce': return `${s / 10}s`;
			case 'glow-pulse': return `${s / 5}s`;
			default: return '0s';
		}
	});

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
		// Loader: wait for settings OR timeout at 3s
		function startLoaderFade() {
			if (loaderFading) return;
			loaderFading = true;
			setTimeout(() => { loaderVisible = false; }, 500);
		}

		// Fade when settings load
		const unsubSettings = settings.subscribe((s) => {
			if (s.data && !s.loading) startLoaderFade();
		});

		// Hard timeout: max 3s loader
		const timeout = setTimeout(startLoaderFade, 3000);

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

			// Hero parallax — translateY + opacity fade
			const hero = document.querySelector('.hero') as HTMLElement | null;
			if (hero) {
				const heroH = hero.offsetHeight;
				if (y < heroH * 1.5) {
					hero.style.transform = `translateY(${y * 0.15}px)`;
					const title = hero.querySelector('.hero-title') as HTMLElement | null;
					if (title) title.style.transform = `translateY(${y * 0.08}px)`;
					const op = 1 - y / (heroH * 1.2);
					hero.style.opacity = String(Math.max(0.3, op));
				}
			}

			if (menuOpen) closeMenu();
		}

		function onMouseMove(e: MouseEvent) {
			cursorX = e.clientX;
			cursorY = e.clientY;
		}

		// Cursor glow lerp — smooth follow (0.08 factor)
		let cursorRaf: number;
		function lerpCursor() {
			cursorLerpX += (cursorX - cursorLerpX) * 0.08;
			cursorLerpY += (cursorY - cursorLerpY) * 0.08;
			const glow = document.getElementById('cursor-glow');
			if (glow) {
				glow.style.transform = `translate(${cursorLerpX - 200}px, ${cursorLerpY - 200}px)`;
			}
			cursorRaf = requestAnimationFrame(lerpCursor);
		}
		lerpCursor();

		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && menuOpen) closeMenu();
			trapFocus(e);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('keydown', onKeydown);

		// Reveal handled by use:reveal action per-element

		return () => {
			clearTimeout(timeout);
			unsubSettings();
			mq.removeEventListener('change', onThemeChange);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('keydown', onKeydown);
			cancelAnimationFrame(cursorRaf);
		};
	});
</script>

<svelte:head>
	<meta name="description" content="{brandName} — {metaDesc}" />
	<link rel="canonical" href="https://dacewav.store{page.url.pathname}" />
	<meta property="og:url" content="https://dacewav.store{page.url.pathname}" />
	<meta property="og:site_name" content={brandName} />
	<meta property="og:image" content="/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="/og-image.svg" />
	{#if customCSS}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>${customCSS}</style>`}
	{/if}
	{#if animCustomCSS}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>${animCustomCSS}</style>`}
	{/if}
	{#if bgPattern && bgPattern !== 'none'}
		{@html `<style>
			body {
				background-image: ${bgPattern === 'dots' ? `radial-gradient(circle, ${bgPatternColor || 'rgba(255,255,255,' + bgPatternOpacity + ')'} 1px, transparent 1px)` : bgPattern === 'lines' ? `repeating-linear-gradient(0deg, ${bgPatternColor || 'rgba(255,255,255,' + bgPatternOpacity + ')'} 0px, ${bgPatternColor || 'rgba(255,255,255,' + bgPatternOpacity + ')'} 1px, transparent 1px, transparent 40px)` : `linear-gradient(${bgPatternColor || 'rgba(255,255,255,' + bgPatternOpacity + ')'} 1px, transparent 1px), linear-gradient(90deg, ${bgPatternColor || 'rgba(255,255,255,' + bgPatternOpacity + ')'} 1px, transparent 1px)`};
				background-size: ${bgPattern === 'dots' ? '40px 40px' : bgPattern === 'lines' ? '100% 40px' : '40px 40px'};
			}
		</style>`}
	{/if}
	{#if scrollbarThin || scrollbarColor}
		{@html `<style>
			${scrollbarThin ? '::-webkit-scrollbar { width: 6px; height: 6px; }' : ''}
			${scrollbarColor ? `::-webkit-scrollbar-thumb { background: ${scrollbarColor}; border-radius: 3px; }` : ''}
			${scrollbarThin ? 'html { scrollbar-width: thin; }' : ''}
			${scrollbarColor ? `html { scrollbar-color: ${scrollbarColor} transparent; }` : ''}
		</style>`}
	{/if}
</svelte:head>

<!-- Banner (admin-editable) -->
{#if bannerEnabled}
<div class="site-banner" style="background: {bannerBg}">
	{#if bannerUrl}
		<a
			href={bannerUrl}
			class="banner-inner"
			style="color: {bannerTxtClr}; {bannerAnim !== 'static' ? `animation: banner-${bannerAnim} ${bannerDuration} ${bannerEasing} ${bannerDelay}s infinite ${bannerDir}` : ''}"
			target="_blank" rel="noopener"
		>{bannerText}</a>
	{:else}
		<div
			class="banner-inner"
			style="color: {bannerTxtClr}; {bannerAnim !== 'static' ? `animation: banner-${bannerAnim} ${bannerDuration} ${bannerEasing} ${bannerDelay}s infinite ${bannerDir}` : ''}"
		>{bannerText}</div>
	{/if}
</div>
{/if}

<!-- Loader -->
{#if loaderEnabled && loaderVisible}
<div id="loader" class:fading={loaderFading}>
	<div id="loader-brand">
		{#if brandSplit.last}
			{brandSplit.first}<em>{brandSplit.last}</em>
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

<!-- Scroll progress (gradient) -->
<div id="scroll-progress" style="width: {scrollProgress}%"></div>

<!-- Cursor glow (position set by lerp in JS) -->
<div id="cursor-glow"></div>

<!-- Floating orbs -->
<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<!-- Particles -->
{#if particlesOn}
	<Particles
		count={particlesCount}
		speed={particlesSpeed}
		type={particlesType}
		color={particlesColor}
		opacity={particlesOpacity}
		text={particlesText}
		imgUrl={particlesImgUrl}
		sizeMin={particlesSizeMin}
		sizeMax={particlesSizeMax}
	/>
{/if}

<div class="app">
	<!-- Nav -->
	<nav class="nav" class:n-hidden={navHidden} class:n-scrolled={navScrolled} aria-label="Navegación principal" style="min-height: {navHeight}px">
		<a href="/" class="nav-brand{animLogo && animLogo !== 'none' ? ` anim-${animLogo}` : ''}" onclick={closeMenu}>
			{#if brandLogo}
				<img class="nav-logo" src={brandLogo} alt={brandName} decoding="async" style="height: {logoHeight > 0 ? logoHeight : 28}px" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
			{:else if brandSplit.last}
				<span>{brandSplit.first}</span><em>{brandSplit.last}</em>.
			{:else}
				<span>{brandName}</span><em>.</em>
			{/if}
		</a>

		<!-- Desktop links -->
		<div class="nav-links hide-mobile">
			<a href="/" class="nav-link">{sectionTitle}</a>
			{#if isAdmin}
				<a href="/admin" class="nav-link">Admin</a>
			{/if}
			{#each navLinks as link}
				<a href={link.url} class="nav-link" target="_blank" rel="noopener">{link.label}</a>
			{/each}
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
		<div class="mobile-overlay" onclick={closeMenu} onkeydown={(e) => e.key === 'Escape' && closeMenu()} role="button" tabindex="-1" aria-label="Cerrar menú"></div>
		<div class="mobile-menu" bind:this={mobileMenuEl}>
			<a href="/" class="mobile-link" onclick={closeMenu}>{sectionTitle}</a>
			{#if isAdmin}
				<a href="/admin" class="mobile-link" onclick={closeMenu}>Admin</a>
			{/if}
			{#each navLinks as link}
				<a href={link.url} class="mobile-link" target="_blank" rel="noopener" onclick={closeMenu}>{link.label}</a>
			{/each}
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
	<main class="main" class:has-player={hasPlayer} id="main-content">
		{@render children()}
	</main>

	<!-- Footer -->
	{#if footerVisible}
	<footer class="footer">
		<div class="footer-left">
			<div class="footer-brand">
			{#if brandSplit.last}
				{brandSplit.first}<em>{brandSplit.last}</em>
			{:else}
				{brandName}
			{/if}
		</div>
			<div class="footer-sub">{footerText}</div>
		</div>
		<div class="footer-links">
			{#each navLinks as link}
				<a href={link.url} class="footer-link" target="_blank" rel="noopener">{link.label}</a>
			{/each}
		</div>
	</footer>
	{/if}
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
		transition: transform var(--duration-normal) cubic-bezier(0.4, 0, 0.2, 1), background var(--duration-normal);
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
		font-size: var(--text-xl);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
		display: flex;
		align-items: baseline;
		cursor: pointer;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.nav-brand:hover {
		transform: scale(1.03);
	}

	.nav-logo {
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
		transition: color var(--duration-fast);
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
		transition: width var(--duration-normal);
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
		transition: all var(--duration-fast);
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
		transition: all var(--duration-normal) var(--ease-out);
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
		transition: all var(--duration-fast) var(--ease-out);
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
	}

	.main.has-player {
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
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--text);
		transition: color var(--duration-fast);
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
		transition: all var(--duration-fast) var(--ease-out);
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
		transition: width var(--duration-normal) var(--ease-out);
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
		animation-duration: 2s;
		animation-timing-function: ease-in-out;
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
</style>
