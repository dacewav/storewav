<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { onNavigate, goto } from '$app/navigation';
	import { settings, wishlist, auth, player, visibleFloatingElements, initCustomEmojis, destroyCustomEmojis, cartCount, unreadCount } from '$lib/stores';
	import { ToastContainer, Player, WishlistPanel, Particles, FloatingElement, InlineEmoji, AuthButton } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { initLikes, destroyLikes } from '$lib/stores/likes';
	import { initWishlistSync, destroyWishlistSync } from '$lib/stores/wishlist';
	import { initNotifications, destroyNotifications } from '$lib/stores/notifications';
	import { initOneTap, signInWithIdToken, dismissOneTap } from '$lib/oneTap';
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
	import { sanitizeCSS } from '$lib/sanitize';

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
	let mobileSearch = $state('');

	// Settings from Firebase
	let settingsData = $derived($settings.data);
	let brandName = $derived(settingsData?.brand?.name ?? 'DACEWAV');
	let brandLogo = $derived(settingsData?.brand?.logo ?? '');
	let logoFailed = $state(false);
	let logoHeight = $derived(settingsData?.layout?.logoHeight ?? 28);

	// Reset logo failure state when URL changes
	$effect(() => {
		if (brandLogo) logoFailed = false;
	});
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
	let customCSS = $derived(sanitizeCSS(settingsData?.theme?.customCSS ?? ''));
	let animCustomCSS = $derived(sanitizeCSS(settingsData?.animations?.animCustomCSS ?? ''));
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

	// Init likes + wishlist sync + cart abandonment tracking when auth changes
	$effect(() => {
		const uid = $auth.user?.uid ?? null;
		initLikes(uid);
		initWishlistSync(uid);
		initNotifications(uid);

		// Google One Tap when not logged in
		if (!uid && !$auth.loading && PUBLIC_GOOGLE_CLIENT_ID) {
			initOneTap(
				async (idToken) => { await signInWithIdToken(idToken); },
				PUBLIC_GOOGLE_CLIENT_ID
			);
		} else {
			dismissOneTap();
		}

		return () => { destroyLikes(); destroyWishlistSync(); destroyNotifications(); };
	});

	// Floating elements
	let floatingEls = $derived($visibleFloatingElements);

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
	let bannerBgImage = $derived(settingsData?.banner?.bgImage ?? '');
	let bannerBgImageOpacity = $derived(settingsData?.banner?.bgImageOpacity ?? 0.3);
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
			try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
		}
	}

	function toggleTheme() {
		isDark = !isDark;
		applyTheme();
	}

	function closeMenu() {
		menuOpen = false;
	}

	function handleMobileSearch() {
		const q = mobileSearch.trim();
		closeMenu();
		if (page.url.pathname === '/') {
			// Already on home — scroll to beats section and dispatch search
			document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth' });
			// Dispatch a custom event that the Filters component can listen to
			window.dispatchEvent(new CustomEvent('mobile-search', { detail: q }));
		} else {
			// Navigate to home with search query
			goto(`/?q=${encodeURIComponent(q)}#beats`);
		}
		mobileSearch = '';
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

	// Page transitions — View Transitions API with CSS fallback
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		// Initialize custom emojis for store rendering
		initCustomEmojis();

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

		// Detect theme: localStorage > system preference
		let cleanupTheme: (() => void) | undefined;
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			isDark = savedTheme === 'dark';
		} else {
			const mq = window.matchMedia('(prefers-color-scheme: light)');
			isDark = !mq.matches;
			function onThemeChange(e: MediaQueryListEvent) { isDark = !e.matches; applyTheme(); }
			mq.addEventListener('change', onThemeChange);
			cleanupTheme = () => mq.removeEventListener('change', onThemeChange);
		}
		applyTheme();

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

			// Player keyboard shortcuts (only when not typing in an input)
			const tag = (e.target as HTMLElement)?.tagName;
			const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
			if (isInput) return;

			// Space = play/pause toggle
			if (e.key === ' ' || e.code === 'Space') {
				e.preventDefault();
				const state = $player;
				if (state.playing) {
					player.pause();
				} else if (state.beatId) {
					player.resume();
				}
			}

			// Left/Right = seek ±5s
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				const audio = player.getAudioElement();
				if (audio && audio.duration) {
					const delta = e.key === 'ArrowLeft' ? -5 : 5;
					player.seek(Math.max(0, Math.min(audio.duration, audio.currentTime + delta)));
				}
			}

			// M = toggle mute
			if (e.key === 'm' || e.key === 'M') {
				player.toggleMute();
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('keydown', onKeydown);

		// Reveal handled by use:reveal action per-element

		return () => {
			destroyCustomEmojis();
			clearTimeout(timeout);
			unsubSettings();
			cleanupTheme?.();
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
<div class="site-banner" style="background: {bannerBg}; {bannerBgImage ? `background-image: url(${bannerBgImage}); background-size: cover; background-position: center;` : ''}">
	{#if bannerBgImage}
		<div class="banner-bg-overlay" style="background: {bannerBg}; opacity: {1 - bannerBgImageOpacity}"></div>
	{/if}
	{#if bannerUrl}
		<a
			href={bannerUrl}
			class="banner-inner"
			style="color: {bannerTxtClr}; {bannerAnim !== 'static' ? `animation: banner-${bannerAnim} ${bannerDuration} ${bannerEasing} ${bannerDelay}s infinite ${bannerDir}` : ''}"
			target="_blank" rel="noopener"
		><InlineEmoji text={bannerText} /></a>
	{:else}
		<div
			class="banner-inner"
			style="color: {bannerTxtClr}; {bannerAnim !== 'static' ? `animation: banner-${bannerAnim} ${bannerDuration} ${bannerEasing} ${bannerDelay}s infinite ${bannerDir}` : ''}"
		><InlineEmoji text={bannerText} /></div>
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

<!-- Floating elements (admin-configured) -->
{#each floatingEls as flEl (flEl.id)}
	<FloatingElement element={flEl} />
{/each}

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
			{#if brandLogo && !logoFailed}
				<img class="nav-logo" src={brandLogo} alt={brandName} decoding="async" style="height: {logoHeight > 0 ? logoHeight : 28}px" onerror={() => { logoFailed = true; }} />
			{:else if brandSplit.last}
				<span>{brandSplit.first}</span><em>{brandSplit.last}</em>.
			{:else}
				<span>{brandName}</span><em>.</em>
			{/if}
		</a>

		<!-- Desktop links -->
		<div class="nav-links hide-mobile">
			<a href="/#beats" class="nav-link" onclick={(e) => { if (page.url.pathname === '/') { e.preventDefault(); document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth' }); closeMenu(); } }}>{sectionTitle}</a>
			{#if isAdmin}
				<a href="/admin" class="nav-link">Admin</a>
			{/if}
			{#each navLinks as link}
				<a href={link.url} class="nav-link" target="_blank" rel="noopener">{link.label}</a>
			{/each}
			<a href="/cart" class="icon-btn" title="Carrito" aria-label="Carrito">
				<Icon name="shoppingCart" size={14} />
				{#if $cartCount > 0}
					<span class="nav-badge">{$cartCount}</span>
				{/if}
			</a>
			<a href="/account/orders" class="icon-btn" title="Mis órdenes" aria-label="Mis órdenes">
				<Icon name="export" size={14} />
			</a>
			<button class="icon-btn" title="Favoritos" aria-label="Favoritos" onclick={() => wishlistOpen = true}>
				<Icon name="heart" size={14} />
				{#if wishCount > 0}
					<span class="nav-badge">{wishCount}</span>
				{/if}
			</button>
			<a href="/account/notifications" class="icon-btn" title="Notificaciones" aria-label="Notificaciones">
				<Icon name="bell" size={14} />
				{#if $unreadCount > 0}
					<span class="nav-badge">{$unreadCount}</span>
				{/if}
			</a>
			<button class="icon-btn" title="Cambiar tema" aria-label="Cambiar tema" onclick={toggleTheme}>
				<Icon name={isDark ? 'sun' : 'moon'} size={14} />
			</button>
			<AuthButton compact />
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
			<!-- Header -->
			<div class="mm-header">
				<span class="mm-brand">{brandSplit.last ? `${brandSplit.first}${brandSplit.last}` : brandName}</span>
				<button class="mm-close" onclick={closeMenu} aria-label="Cerrar menú">
					<Icon name="close" size={18} />
				</button>
			</div>

			<!-- Search bar -->
			<div class="mm-search">
				<input
					type="text"
					class="mm-search-input"
					placeholder="Buscar beats..."
					bind:value={mobileSearch}
					onkeydown={(e) => e.key === 'Enter' && handleMobileSearch()}
				/>
				<button class="mm-search-btn" onclick={handleMobileSearch} aria-label="Buscar">
					<Icon name="search" size={16} />
				</button>
			</div>

			<!-- Main nav links -->
			<div class="mm-nav">
				<a href="/#beats" class="mm-link" onclick={(e) => { if (page.url.pathname === '/') { e.preventDefault(); document.getElementById('beats')?.scrollIntoView({ behavior: 'smooth' }); } closeMenu(); }}>
					<span class="mm-link-icon">🎵</span>
					<span>{sectionTitle}</span>
				</a>
				{#if isAdmin}
					<a href="/admin" class="mm-link" onclick={closeMenu}>
						<span class="mm-link-icon">⚙️</span>
						<span>Admin</span>
					</a>
				{/if}
				{#each navLinks as link}
					<a href={link.url} class="mm-link" target="_blank" rel="noopener" onclick={closeMenu}>
						<span class="mm-link-icon">🔗</span>
						<span>{link.label}</span>
					</a>
				{/each}
			</div>

			<!-- Quick actions -->
			<div class="mm-actions">
				<a href="/cart" class="mm-action" onclick={closeMenu}>
					<span class="mm-action-icon">
						<Icon name="shoppingCart" size={16} />
						{#if $cartCount > 0}<span class="mm-badge">{$cartCount}</span>{/if}
					</span>
					<span>Carrito</span>
				</a>
				<a href="/account/orders" class="mm-action" onclick={closeMenu}>
					<span class="mm-action-icon"><Icon name="export" size={16} /></span>
					<span>Órdenes</span>
				</a>
				<button class="mm-action" onclick={() => { closeMenu(); wishlistOpen = true; }}>
					<span class="mm-action-icon">
						<Icon name="heart" size={16} />
						{#if wishCount > 0}<span class="mm-badge">{wishCount}</span>{/if}
					</span>
					<span>Favoritos</span>
				</button>
				<a href="/account/notifications" class="mm-action" onclick={closeMenu}>
					<span class="mm-action-icon">
						<Icon name="bell" size={16} />
						{#if $unreadCount > 0}<span class="mm-badge">{$unreadCount}</span>{/if}
					</span>
					<span>Notificaciones</span>
				</a>
				<button class="mm-action" onclick={() => { toggleTheme(); closeMenu(); }}>
					<span class="mm-action-icon"><Icon name={isDark ? 'sun' : 'moon'} size={16} /></span>
					<span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
				</button>
			</div>

			<!-- Auth -->
			<div class="mm-footer">
				<AuthButton />
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

	.banner-bg-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.banner-inner {
		position: relative;
		z-index: 1;
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
		animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes badgePop {
		0% { transform: scale(0); opacity: 0; }
		60% { transform: scale(1.2); }
		100% { transform: scale(1); opacity: 1; }
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
		width: 44px;
		height: 44px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		padding: 0;
		transition: all var(--duration-fast);
	}

	.hamburger:hover {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.06);
	}

	.burger-line {
		display: block;
		width: 18px;
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
		transform: scaleX(0);
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
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(6px);
		animation: fadeIn var(--duration-fast) var(--ease-out);
	}

	.mobile-menu {
		display: none;
		position: fixed;
		top: 0;
		right: 0;
		width: min(340px, 88vw);
		height: 100dvh;
		z-index: var(--z-nav);
		background: var(--bg);
		border-left: 1px solid var(--border);
		flex-direction: column;
		animation: slideInRight 0.3s var(--ease-out);
		box-shadow: -12px 0 40px rgba(0, 0, 0, 0.4);
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	/* Mobile menu header */
	.mm-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.mm-brand {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.mm-close {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.mm-close:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* Mobile search */
	.mm-search {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.mm-search-input {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		outline: none;
		min-height: var(--touch-min);
		transition: border-color var(--duration-fast);
	}

	.mm-search-input:focus {
		border-color: var(--accent);
	}

	.mm-search-input::placeholder {
		color: var(--text-muted);
	}

	.mm-search-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--touch-min);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--accent);
		color: var(--bg);
		cursor: pointer;
		flex-shrink: 0;
		transition: all var(--duration-fast);
	}

	.mm-search-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	/* Mobile nav links */
	.mm-nav {
		padding: var(--space-4) var(--space-4);
		border-bottom: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.mm-link {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		transition: all var(--duration-fast) var(--ease-out);
		min-height: 48px;
	}

	.mm-link:hover {
		background: var(--surface);
		color: var(--accent);
		transform: translateX(4px);
	}

	.mm-link-icon {
		font-size: 1.1rem;
		width: 24px;
		text-align: center;
		flex-shrink: 0;
	}

	/* Mobile quick actions grid */
	.mm-actions {
		padding: var(--space-4);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.mm-action {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--duration-fast);
		min-height: 48px;
	}

	.mm-action:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--text);
		background: var(--surface-hover);
	}

	.mm-action-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.mm-badge {
		position: absolute;
		top: -6px;
		right: -8px;
		font-family: var(--font-mono);
		font-size: 9px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: var(--radius-full);
		background: var(--accent);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		line-height: 1;
	}

	/* Mobile auth footer */
	.mm-footer {
		margin-top: auto;
		padding: var(--space-4) var(--space-5);
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: center;
		flex-shrink: 0;
	}

	@keyframes slideInRight {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	/* ── Scroll Progress ── */
	#scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 3px;
		background: var(--accent);
		z-index: calc(var(--z-nav) + 1);
		transition: width 0.1s linear;
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

	/* ── View Transitions ── */
	::view-transition-old(root) {
		animation: fadeOut 0.15s ease-in;
	}

	::view-transition-new(root) {
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeOut {
		from { opacity: 1; transform: scale(1); }
		to { opacity: 0; transform: scale(0.98); }
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: scale(1.01); }
		to { opacity: 1; transform: scale(1); }
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
	@keyframes anim-wobble { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(-5deg); } 30% { transform: rotate(3deg); } 45% { transform: rotate(-3deg); } 60% { transform: rotate(2deg); } 75% { transform: rotate(-1deg); } }
	@keyframes anim-jello { 0%, 100% { transform: skewX(0) skewY(0); } 22% { transform: skewX(-4deg) skewY(-2deg); } 33% { transform: skewX(2deg) skewY(1deg); } 44% { transform: skewX(-1deg) skewY(-0.5deg); } 55% { transform: skewX(0.5deg) skewY(0.25deg); } }
	@keyframes anim-heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.1); } 28% { transform: scale(1); } 42% { transform: scale(1.1); } 70% { transform: scale(1); } }
	@keyframes anim-breathe { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.03); opacity: 1; } }
	@keyframes anim-drift { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(3px, -3px) rotate(1deg); } 50% { transform: translate(-2px, 2px) rotate(-0.5deg); } 75% { transform: translate(1px, -1px) rotate(0.5deg); } }
	@keyframes anim-pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
	@keyframes anim-swing { 0%, 100% { transform: rotate(0); transform-origin: top center; } 20% { transform: rotate(8deg); } 40% { transform: rotate(-5deg); } 60% { transform: rotate(3deg); } 80% { transform: rotate(-1deg); } }
	@keyframes anim-tada { 0%, 100% { transform: scale(1) rotate(0); } 10%, 20% { transform: scale(0.95) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.05) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.05) rotate(-3deg); } }

	.anim-float, .anim-pulse, .anim-bounce, .anim-spin, .anim-shake, .anim-glow, .anim-slide-up, .anim-slide-down, .anim-fade-in, .anim-wobble, .anim-jello, .anim-heartbeat, .anim-breathe, .anim-drift, .anim-pop, .anim-swing, .anim-tada {
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
	.anim-slide-up { animation-name: anim-slide-up; animation-iteration-count: 1; }
	.anim-slide-down { animation-name: anim-slide-down; animation-iteration-count: 1; }
	.anim-fade-in { animation-name: anim-fade-in; animation-iteration-count: 1; }
	.anim-wobble { animation-name: anim-wobble; }
	.anim-jello { animation-name: anim-jello; }
	.anim-heartbeat { animation-name: anim-heartbeat; }
	.anim-breathe { animation-name: anim-breathe; }
	.anim-drift { animation-name: anim-drift; }
	.anim-pop { animation-name: anim-pop; animation-iteration-count: 1; }
	.anim-swing { animation-name: anim-swing; transform-origin: top center; }
	.anim-tada { animation-name: anim-tada; }
</style>
