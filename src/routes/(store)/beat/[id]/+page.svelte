<script lang="ts">
	import { page } from '$app/stores';
	import { beatsList, genres, player, wishlist, settings } from '$lib/stores';
	import { Skeleton, Badge, BeatCard, BeatModal, EmptyState } from '$lib/components';
	import Waveform from '$lib/components/Waveform.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { staggerReveal } from '$lib/actions';
	import type { Beat } from '$lib/stores/beats';

	let beatId = $derived($page.params.id);
	let beats = $derived($beatsList);
	let s = $derived($settings.data);

	// Current beat
	let beat = $derived(beats.find(b => b.id === beatId) ?? null);
	let loading = $derived(beats.length === 0 && !beat);

	// Wishlist
	let inWishlist = $derived(beat ? wishlist.isIn(beat.id) : false);

	// Labels from settings
	let labels = $derived(s?.labels ?? {});
	let licenseLabels = $derived({
		basic: labels.licenseBasic ?? 'Basic',
		premium: labels.licensePremium ?? 'Premium',
		unlimited: labels.licenseUnlimited ?? 'Unlimited',
		exclusive: labels.licenseExclusive ?? 'Exclusive'
	});
	let licenseDescs = $derived({
		basic: labels.licenseBasicDesc ?? 'MP3 · 1 uso',
		premium: labels.licensePremiumDesc ?? 'WAV · Sin tag',
		unlimited: labels.licenseUnlimitedDesc ?? 'WAV + Stems',
		exclusive: labels.licenseExclusiveDesc ?? 'Exclusivo total'
	});
	let labelPreview = $derived(labels.preview ?? 'Escuchar preview');
	let labelBuy = $derived(labels.buy ?? 'Comprar');
	let labelFrom = $derived(labels.priceFrom ?? 'Desde');
	let labelBack = $derived(labels.backToCatalog ?? 'Volver al catálogo');

	// Related beats: same genre, exclude current, max 4
	let relatedBeats = $derived(
		beat
			? beats
					.filter(b => b.id !== beat!.id && b.genre === beat!.genre)
					.slice(0, 4)
			: []
	);

	// Fallback: if no same-genre, show random active beats
	let displayRelated = $derived(
		relatedBeats.length > 0
			? relatedBeats
			: beats.filter(b => b.id !== beatId).slice(0, 4)
	);

	// Selected license
	let selectedLicense = $state('');

	// Reset on beat change
	$effect(() => {
		if (beatId) selectedLicense = '';
	});

	function handlePlay() {
		if (!beat) return;
		player.play({
			id: beat.id,
			title: beat.title,
			artist: beat.artist,
			coverUrl: beat.coverUrl,
			audioUrl: beat.audioUrl
		});
	}

	function selectLicense(key: string) {
		selectedLicense = selectedLicense === key ? '' : key;
	}

	function handleRelatedPlay(b: Beat & { id: string }) {
		player.play({
			id: b.id,
			title: b.title,
			artist: b.artist,
			coverUrl: b.coverUrl,
			audioUrl: b.audioUrl
		});
	}

	// Accent RGB for dynamic styles
	let accentRgb = $state('220, 38, 38');
	$effect(() => {
		if (typeof document !== 'undefined') {
			const val = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
			if (val) accentRgb = val;
		}
	});
</script>

<svelte:head>
	{#if beat}
		<title>{beat.title} — {beat.artist}</title>
		<meta name="description" content={beat.description || `${beat.title} de ${beat.artist}. ${beat.bpm} BPM, ${beat.key}, ${beat.genre}.`} />
		<meta property="og:title" content="{beat.title} — {beat.artist}" />
		<meta property="og:description" content={beat.description || `${beat.bpm} BPM · ${beat.key} · ${beat.genre}`} />
		{#if beat.coverUrl}
			<meta property="og:image" content={beat.coverUrl} />
		{/if}
		<meta property="og:type" content="music.song" />
	{:else}
		<title>Beat — DACEWAV</title>
	{/if}
</svelte:head>

<div class="beat-page">
	<!-- Back link -->
	<a href="/" class="back-link">
		<Icon name="chevronUp" size={14} />
		<span>{labelBack}</span>
	</a>

	{#if loading}
		<!-- Loading skeleton -->
		<div class="beat-layout">
			<div class="beat-main">
				<Skeleton variant="card" aspectRatio="1/1" lines={0} />
			</div>
			<div class="beat-sidebar">
				<Skeleton variant="compact" lines={5} />
			</div>
		</div>
	{:else if !beat}
		<!-- Not found -->
		<EmptyState
			icon="🎵"
			title="Beat no encontrado"
			subtitle="Este beat puede haber sido eliminado o la URL es incorrecta"
		/>
		<a href="/" class="back-cta">{labelBack}</a>
	{:else}
		<!-- ── Main Layout ── -->
		<div class="beat-layout">
			<!-- Left: Cover + Waveform -->
			<div class="beat-main">
				<!-- Cover -->
				<div class="beat-cover">
					{#if beat.coverUrl}
						<img src={beat.coverUrl} alt={beat.title} />
					{:else}
						<div class="beat-cover-placeholder">
							<Icon name="music" size={64} />
						</div>
					{/if}
					<span class="cover-genre">{beat.genre}</span>
				</div>

				<!-- Waveform -->
				<div class="beat-waveform">
					<Waveform bars={80} height={48} />
				</div>

				<!-- Play button -->
				<button class="beat-play-btn" onclick={handlePlay}>
					<Icon name="play" size={18} />
					{labelPreview}
				</button>
			</div>

			<!-- Right: Info + Licenses -->
			<div class="beat-sidebar">
				<!-- Header -->
				<div class="beat-header" use:staggerReveal={{ delay: 60 }}>
					<div class="beat-title-row">
						<h1 class="beat-title">{beat.title}</h1>
						<button
							class="beat-wish-btn"
							class:active={inWishlist}
							onclick={() => beat && wishlist.toggle(beat.id)}
							aria-label={inWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
						>
							<Icon name="heart" size={18} filled={inWishlist} />
						</button>
					</div>
					<p class="beat-artist">{beat.artist}</p>
				</div>

				<!-- Meta badges -->
				<div class="beat-badges">
					<Badge variant="default">{beat.bpm} BPM</Badge>
					<Badge variant="default">{beat.key}</Badge>
					{#each beat.tags ?? [] as tag}
						<Badge variant="muted">{tag}</Badge>
					{/each}
				</div>

				<!-- Description -->
				{#if beat.description}
					<p class="beat-description">{beat.description}</p>
				{/if}

				<!-- Platforms -->
				{#if beat.platforms && (beat.platforms.spotify || beat.platforms.youtube || beat.platforms.soundCloud)}
					<div class="beat-platforms">
						{#if beat.platforms.spotify}
							<a class="plat-link plat-spotify" href={beat.platforms.spotify} target="_blank" rel="noopener" aria-label="Spotify">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
								<span>Spotify</span>
							</a>
						{/if}
						{#if beat.platforms.youtube}
							<a class="plat-link plat-youtube" href={beat.platforms.youtube} target="_blank" rel="noopener" aria-label="YouTube">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
								<span>YouTube</span>
							</a>
						{/if}
						{#if beat.platforms.soundCloud}
							<a class="plat-link plat-soundcloud" href={beat.platforms.soundCloud} target="_blank" rel="noopener" aria-label="SoundCloud">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.282c.013.06.045.094.104.094.059 0 .09-.037.104-.094l.199-1.282-.199-1.332c-.014-.057-.045-.094-.104-.094m1.79-.85c-.063 0-.109.048-.116.109l-.217 2.1.217 2.043c.007.064.053.109.116.109.063 0 .109-.045.116-.109l.248-2.043-.248-2.1c-.007-.061-.053-.109-.116-.109m.89-.556c-.074 0-.12.056-.127.124l-.2 2.656.2 2.554c.007.067.053.123.127.123.073 0 .12-.056.127-.123l.227-2.554-.227-2.656c-.007-.068-.054-.124-.127-.124m.896-.271c-.084 0-.134.065-.14.138l-.184 2.927.184 2.707c.006.076.056.138.14.138.083 0 .134-.062.14-.138l.209-2.707-.209-2.927c-.006-.073-.057-.138-.14-.138m.904-.184c-.094 0-.145.074-.152.152l-.168 3.111.168 2.786c.007.08.058.152.152.152.093 0 .145-.072.152-.152l.19-2.786-.19-3.111c-.007-.078-.059-.152-.152-.152m.9-.283c-.104 0-.156.083-.162.165l-.153 3.394.153 2.82c.006.086.058.165.162.165.103 0 .156-.079.163-.165l.172-2.82-.172-3.394c-.007-.082-.06-.165-.163-.165m.915-.163c-.114 0-.168.092-.173.178l-.138 3.557.138 2.836c.005.09.059.178.173.178.113 0 .168-.088.174-.178l.155-2.836-.155-3.557c-.006-.086-.061-.178-.174-.178m.916-.072c-.124 0-.18.101-.185.19l-.122 3.629.122 2.842c.005.094.061.19.185.19.123 0 .18-.096.186-.19l.138-2.842-.138-3.629c-.006-.089-.063-.19-.186-.19m.92.028c-.134 0-.192.11-.197.202l-.107 3.601.107 2.843c.005.098.063.202.197.202.133 0 .192-.104.198-.202l.12-2.843-.12-3.601c-.006-.092-.065-.202-.198-.202m2.783-1.069c-.196 0-.356.164-.367.374l-.075 4.67.075 2.807c.011.21.171.374.367.374.195 0 .356-.164.367-.374l.085-2.807-.085-4.67c-.011-.21-.172-.374-.367-.374m.937-.155c-.145 0-.208.118-.213.214l-.09 4.825.09 2.803c.005.102.068.214.213.214.144 0 .208-.112.214-.214l.101-2.803-.101-4.825c-.006-.096-.07-.214-.214-.214m2.901-.109c-.019-.006-.037-.006-.056-.006-.155 0-.223.127-.228.226l-.075 4.94.075 2.79c.005.105.073.226.228.226.019 0 .037 0 .056-.006.173-.035.265-.164.26-.32l-.086-2.69.086-4.94c.005-.156-.087-.286-.26-.32m-.945.176c-.165 0-.235.136-.24.243l-.082 4.764.082 2.792c.005.112.075.243.24.243.164 0 .235-.131.24-.243l.093-2.792-.093-4.764c-.005-.107-.076-.243-.24-.243m.942-.019c-.174 0-.244.145-.249.256l-.068 4.783.068 2.787c.005.117.075.256.249.256.173 0 .244-.139.25-.256l.076-2.787-.076-4.783c-.006-.111-.077-.256-.25-.256m5.855 1.371c-.424 0-.827.082-1.204.229-.196-2.205-2.07-3.924-4.359-3.924-.565 0-1.112.109-1.618.305-.193.075-.242.148-.244.293v7.521c.002.15.114.272.264.286h7.161c1.341 0 2.428-1.087 2.428-2.428 0-1.342-1.087-2.428-2.428-2.428"/></svg>
								<span>SoundCloud</span>
							</a>
						{/if}
					</div>
				{/if}

				<!-- Licenses -->
				{#if beat.licenses}
					<div class="licenses">
						<div class="licenses-header">
							<h3 class="licenses-title">Licencias</h3>
							{#if selectedLicense}
								<span class="selected-badge">
									{licenseLabels[selectedLicense]} · ${beat.licenses[selectedLicense]}
								</span>
							{/if}
						</div>
						<div class="licenses-grid">
							{#each Object.entries(beat.licenses) as [key, price]}
								<button
									class="license-item"
									class:selected={selectedLicense === key}
									onclick={() => selectLicense(key)}
								>
									<div class="license-name">{licenseLabels[key] ?? key}</div>
									<div class="license-price">${price}</div>
									{#if licenseDescs[key]}
										<div class="license-desc">{licenseDescs[key]}</div>
									{/if}
								</button>
							{/each}
						</div>
						{#if selectedLicense}
							<a
								class="buy-btn"
								href="https://wa.me?text={encodeURIComponent(`Quiero la licencia ${licenseLabels[selectedLicense]} de ${beat.title}`)}"
								target="_blank"
								rel="noopener"
							>
								{labelBuy} {licenseLabels[selectedLicense]} — ${beat.licenses[selectedLicense]}
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- ── Related Beats ── -->
		{#if displayRelated.length > 0}
			<section class="related-section">
				<h2 class="related-title">Beats relacionados</h2>
				<div class="related-grid" use:staggerReveal={{ delay: 80 }}>
					{#each displayRelated as rb (rb.id)}
						<BeatCard
							beat={rb}
							onplay={() => handleRelatedPlay(rb)}
							onclick={() => {}}
							labelFrom={labelFrom}
						/>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.beat-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: var(--max-width);
		margin: 0 auto;
	}

	/* ── Back Link ── */
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-6);
		transition: color var(--duration-fast);
	}

	.back-link:hover {
		color: var(--accent);
	}

	.back-link :global(.icon) {
		transform: rotate(-90deg);
	}

	.back-cta {
		display: inline-block;
		margin-top: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--accent);
	}

	/* ── Layout ── */
	.beat-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		align-items: start;
	}

	/* ── Left: Cover + Waveform ── */
	.beat-main {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		position: sticky;
		top: calc(var(--space-6) + 60px);
	}

	.beat-cover {
		width: 100%;
		aspect-ratio: 1/1;
		border-radius: var(--radius-xl);
		overflow: hidden;
		background: var(--surface2);
		position: relative;
	}

	.beat-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-slow) var(--ease-out);
	}

	.beat-cover:hover img {
		transform: scale(1.03);
	}

	.beat-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.cover-genre {
		position: absolute;
		bottom: var(--space-4);
		left: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 3px 12px;
		border-radius: var(--radius-full);
		background: var(--overlay-bg);
		backdrop-filter: blur(8px);
		color: var(--text);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.beat-waveform {
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.beat-play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
		min-height: 52px;
	}

	.beat-play-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-accent);
		transform: translateY(-2px);
	}

	.beat-play-btn:active {
		transform: translateY(0);
	}

	/* ── Right: Sidebar ── */
	.beat-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	/* Header */
	.beat-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.beat-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.beat-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
		line-height: var(--leading-tight);
	}

	.beat-artist {
		font-size: var(--text-base);
		color: var(--text-secondary);
	}

	.beat-wish-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 48px;
		min-height: 48px;
		border: 1px solid var(--border);
		border-radius: 50%;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
		flex-shrink: 0;
	}

	.beat-wish-btn:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		transform: scale(1.05);
	}

	.beat-wish-btn.active {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	/* Badges */
	.beat-badges {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	/* Description */
	.beat-description {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
	}

	/* Platforms */
	.beat-platforms {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.plat-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		text-decoration: none;
		letter-spacing: 0.02em;
		transition: all var(--duration-fast);
		border: 1px solid var(--border);
	}

	.plat-link:hover {
		transform: translateY(-1px);
	}

	.plat-spotify {
		color: #1db954;
		border-color: rgba(29, 185, 84, 0.2);
		background: rgba(29, 185, 84, 0.06);
	}

	.plat-spotify:hover {
		background: rgba(29, 185, 84, 0.12);
		border-color: rgba(29, 185, 84, 0.4);
		color: #1db954;
	}

	.plat-youtube {
		color: #ff0000;
		border-color: rgba(255, 0, 0, 0.2);
		background: rgba(255, 0, 0, 0.06);
	}

	.plat-youtube:hover {
		background: rgba(255, 0, 0, 0.12);
		border-color: rgba(255, 0, 0, 0.4);
		color: #ff0000;
	}

	.plat-soundcloud {
		color: #ff5500;
		border-color: rgba(255, 85, 0, 0.2);
		background: rgba(255, 85, 0, 0.06);
	}

	.plat-soundcloud:hover {
		background: rgba(255, 85, 0, 0.12);
		border-color: rgba(255, 85, 0, 0.4);
		color: #ff5500;
	}

	/* ── Licenses ── */
	.licenses {
		border-top: 1px solid var(--border);
		padding-top: var(--space-5);
	}

	.licenses-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.licenses-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
	}

	.selected-badge {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 10px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		letter-spacing: 0.04em;
	}

	.licenses-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	.license-item {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		text-align: center;
		transition: all var(--duration-fast) var(--ease-out);
		cursor: pointer;
		font-family: inherit;
		color: inherit;
	}

	.license-item:hover {
		border-color: var(--border-hover-accent);
		background: rgba(var(--accent-rgb), 0.04);
		transform: translateY(-1px);
	}

	.license-item.selected {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.08);
		box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.15);
	}

	.license-name {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-1);
	}

	.license-item.selected .license-name {
		color: var(--accent);
	}

	.license-price {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--accent);
	}

	.license-desc {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		margin-top: var(--space-1);
	}

	/* Buy button */
	.buy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-top: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-decoration: none;
		min-height: 48px;
		transition: all var(--duration-normal) var(--ease-out);
	}

	.buy-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
		color: var(--bg);
		transform: translateY(-1px);
	}

	/* ── Related ── */
	.related-section {
		margin-top: var(--space-16);
		border-top: 1px solid var(--border);
		padding-top: var(--space-8);
	}

	.related-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-6);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--space-4);
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.beat-layout {
			grid-template-columns: 1fr;
			gap: var(--space-6);
		}

		.beat-main {
			position: static;
		}

		.beat-title {
			font-size: var(--text-2xl);
		}

		.licenses-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.beat-cover {
			aspect-ratio: 1/1;
			border-radius: var(--radius-lg);
		}

		.related-grid {
			grid-template-columns: 1fr;
		}

		.licenses-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
