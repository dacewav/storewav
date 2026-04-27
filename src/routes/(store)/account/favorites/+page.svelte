<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, beatsList, player, settings, analytics, userLikes } from '$lib/stores';
	import type { LabelSettings } from '$lib/stores/settings';
	import { BeatCard, EmptyState, Skeleton } from '$lib/components';

	let authState = $derived($auth);
	let uid = $derived(authState.user?.uid);
	let allBeats = $derived($beatsList);
	let likedIds = $derived($userLikes);
	let labels = $derived(($settings.data?.labels ?? {}) as LabelSettings);

	let likedBeats = $derived(
		allBeats.filter(b => likedIds.has(b.id))
	);

	function handlePlay(beat: typeof allBeats[0]) {
		player.play({
			id: beat.id,
			name: beat.name,
			artist: beat.artist ?? '',
			imageUrl: beat.imageUrl ?? '',
			audioUrl: beat.audioUrl ?? '',
		});
		analytics.track('beat', 'play', { lbl: beat.id, meta: beat.name });
	}
</script>

<div class="favorites-section">
	<h2>❤️ Mis favoritos</h2>

	{#if !uid}
		<EmptyState
			icon="🔐"
			title="Iniciá sesión"
			subtitle="Necesitás una cuenta para ver tus favoritos"
		/>
	{:else if likedBeats.length === 0}
		<EmptyState
			icon="🤍"
			title="Sin favoritos todavía"
			subtitle="Dale ❤️ a los beats que te gusten y aparecerán acá"
		/>
		<a href="/" class="back-link">Explorar catálogo</a>
	{:else}
		<p class="favorites-count">{likedBeats.length} beat{likedBeats.length !== 1 ? 's' : ''} con like</p>
		<div class="favorites-grid">
			{#each likedBeats as beat (beat.id)}
				<BeatCard
					{beat}
					onplay={() => handlePlay(beat)}
					onclick={() => goto(`/beat/${beat.id}`)}
					labelFrom={labels.priceFrom ?? 'Desde'}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.favorites-section h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.favorites-count {
		font-size: var(--text-sm);
		color: var(--text-muted);
		font-family: var(--font-mono);
		margin-bottom: var(--space-4);
	}

	.favorites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-4);
	}

	.back-link {
		display: inline-block;
		margin-top: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--accent);
		text-decoration: none;
	}
</style>
