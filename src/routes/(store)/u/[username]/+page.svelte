<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { beatsList, player, settings } from '$lib/stores';
	import { BeatCard, EmptyState, Skeleton, BadgeDisplay } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { getBeatSlug } from '$lib/slug';
	import { FIREBASE_DB } from '$lib/firebaseDb';
	import { onMount } from 'svelte';
	import type { Beat } from '$lib/stores/beats';

	let username = $derived(page.params.username);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	let profile = $state<{
		artistName: string;
		username: string;
		bio: string;
		avatarURL: string;
		bannerURL: string;
		country: string;
		badges: string[];
		socials: { instagram: string; youtube: string; spotify: string };
		createdAt: number;
	} | null>(null);

	let loading = $state(true);
	let notFound = $state(false);
	let userBeats = $derived($beatsList);

	// Find beats by this user (match artist name)
	let profileBeats = $derived.by(() => {
		if (!profile?.artistName) return [];
		return userBeats.filter(b =>
			b.artist?.toLowerCase() === profile!.artistName.toLowerCase()
		);
	});

	async function loadProfile() {
		loading = true;
		notFound = false;
		try {
			// Query Firebase for user with this username
			const resp = await fetch(`${FIREBASE_DB}/users.json?orderBy="username"&equalTo="${username}"&limitToFirst=1`);
			if (resp.ok) {
				const data = await resp.json();
				if (data && Object.keys(data).length > 0) {
					const uid = Object.keys(data)[0];
					profile = data[uid];
				} else {
					notFound = true;
				}
			} else {
				notFound = true;
			}
		} catch {
			notFound = true;
		} finally {
			loading = false;
		}
	}

	function handlePlay(beat: Beat & { id: string }) {
		player.play({
			id: beat.id,
			name: beat.name,
			artist: beat.artist ?? '',
			imageUrl: beat.imageUrl ?? '',
			audioUrl: beat.audioUrl || beat.previewUrl || '',
			genre: beat.genre
		});
	}

	function handleBeatClick(beat: Beat & { id: string }) {
		goto(`/beat/${getBeatSlug(beat)}`);
	}

	function formatJoinDate(ts: number): string {
		if (!ts) return '';
		return new Date(ts).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
	}

	onMount(loadProfile);
</script>

<svelte:head>
	{#if profile}
		<title>{profile.artistName || profile.username} — {brandName}</title>
		<meta name="description" content={profile.bio || `Perfil de ${profile.artistName || profile.username} en ${brandName}`} />
	{:else}
		<title>Usuario — {brandName}</title>
	{/if}
</svelte:head>

<div class="public-profile">
	{#if loading}
		<div class="profile-skeleton">
			<Skeleton variant="card" aspectRatio="3/1" lines={0} />
			<div class="skel-info">
				<Skeleton variant="compact" lines={3} />
			</div>
		</div>
	{:else if notFound || !profile}
		<EmptyState
			icon="👤"
			title="Usuario no encontrado"
			subtitle="Este perfil no existe o el username es incorrecto"
		>
			{#snippet action()}
				<a href="/" class="back-btn">Volver al catálogo</a>
			{/snippet}
		</EmptyState>
	{:else}
		<!-- Banner -->
		{#if profile.bannerURL}
			<div class="profile-banner">
				<img src={profile.bannerURL} alt="" loading="lazy" decoding="async" />
			</div>
		{:else}
			<div class="profile-banner placeholder"></div>
		{/if}

		<!-- Profile header -->
		<div class="profile-header">
			<div class="profile-avatar">
				{#if profile.avatarURL}
					<img src={profile.avatarURL} alt={profile.artistName || profile.username} loading="lazy" decoding="async" />
				{:else}
					<div class="avatar-ph">
						{(profile.artistName || profile.username || '?')[0].toUpperCase()}
					</div>
				{/if}
			</div>

			<div class="profile-info">
				<h1 class="profile-name">{profile.artistName || profile.username}</h1>
				{#if profile.artistName && profile.username}
					<span class="profile-handle">@{profile.username}</span>
				{/if}
				{#if profile.bio}
					<p class="profile-bio">{profile.bio}</p>
				{/if}

				{#if profile.badges?.length}
					<BadgeDisplay badges={profile.badges} />
				{/if}

				<div class="profile-meta">
					{#if profile.country}
						<span class="meta-item">📍 {profile.country}</span>
					{/if}
					{#if profile.createdAt}
						<span class="meta-item">🗓 {formatJoinDate(profile.createdAt)}</span>
					{/if}
				</div>

				<!-- Social links -->
				{#if profile.socials?.instagram || profile.socials?.youtube || profile.socials?.spotify}
					<div class="profile-socials">
						{#if profile.socials.instagram}
							<a class="social-link" href="https://instagram.com/{profile.socials.instagram}" target="_blank" rel="noopener">
								<Icon name="instagram" size={14} /> Instagram
							</a>
						{/if}
						{#if profile.socials.youtube}
							<a class="social-link" href="https://youtube.com/@{profile.socials.youtube}" target="_blank" rel="noopener">
								<Icon name="youtube" size={14} /> YouTube
							</a>
						{/if}
						{#if profile.socials.spotify}
							<a class="social-link" href="https://open.spotify.com/artist/{profile.socials.spotify}" target="_blank" rel="noopener">
								🎵 Spotify
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- User's beats -->
		{#if profileBeats.length > 0}
			<section class="profile-beats">
				<h2 class="section-title">🎵 Beats de {profile.artistName || profile.username}</h2>
				<div class="beat-grid">
					{#each profileBeats as beat (beat.id)}
						<BeatCard {beat} onplay={handlePlay} onclick={handleBeatClick} labelFrom="Desde" />
					{/each}
				</div>
			</section>
		{:else}
			<div class="no-beats">
				<p>Este usuario aún no tiene beats publicados.</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.public-profile {
		max-width: var(--container-max);
		margin: 0 auto;
		padding-bottom: var(--space-16);
	}

	.profile-skeleton {
		padding: var(--space-6) var(--container-padding);
	}

	.skel-info {
		margin-top: var(--space-4);
	}

	.back-btn {
		display: inline-block;
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--bg);
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
	}

	/* Banner */
	.profile-banner {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: var(--surface2);
	}

	.profile-banner.placeholder {
		background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), var(--surface2));
	}

	.profile-banner img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Header */
	.profile-header {
		display: flex;
		gap: var(--space-5);
		padding: var(--space-6) var(--container-padding);
		margin-top: -40px;
		position: relative;
		z-index: 1;
	}

	.profile-avatar {
		flex-shrink: 0;
	}

	.profile-avatar img {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		object-fit: cover;
		border: 4px solid var(--bg);
		box-shadow: var(--shadow-md);
	}

	.avatar-ph {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-3xl);
		font-weight: 800;
		font-family: var(--font-mono);
		border: 4px solid var(--bg);
		box-shadow: var(--shadow-md);
	}

	.profile-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: 40px;
	}

	.profile-name {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin: 0;
	}

	.profile-handle {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.profile-bio {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-normal);
		max-width: 500px;
	}

	.profile-meta {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.meta-item {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	/* Socials */
	.profile-socials {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-top: var(--space-2);
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-decoration: none;
		transition: all var(--duration-fast);
	}

	.social-link:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		transform: translateY(-1px);
	}

	/* Beats section */
	.profile-beats {
		padding: var(--space-6) var(--container-padding);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.beat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-4);
	}

	.no-beats {
		text-align: center;
		padding: var(--space-10) var(--container-padding);
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	/* Responsive */
	@media (max-width: 600px) {
		.profile-header {
			flex-direction: column;
			align-items: center;
			text-align: center;
			margin-top: -32px;
		}

		.profile-info {
			padding-top: 0;
			align-items: center;
		}

		.profile-socials {
			justify-content: center;
		}

		.profile-banner {
			height: 140px;
		}

		.profile-avatar img, .avatar-ph {
			width: 72px;
			height: 72px;
		}

		.beat-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
