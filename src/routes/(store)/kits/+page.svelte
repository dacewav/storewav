<script lang="ts">
	import { kits as kitsStore, kitsList, kitGenres, settings, player } from '$lib/stores';
	import { KitCard, EmptyState, Skeleton } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { goto } from '$app/navigation';
	import type { KitWithId } from '$lib/stores/kits';

	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');
	let kitsData = $derived($kitsStore);
	let kitsLoading = $derived(kitsData.loading);
	let kits = $derived($kitsList);
	let genres = $derived($kitGenres);

	let search = $state('');
	let filterGenre = $state('');

	let filteredKits = $derived.by(() => {
		let list = [...kits];

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			list = list.filter(k =>
				k.name.toLowerCase().includes(q) ||
				k.description?.toLowerCase().includes(q) ||
				k.genre.toLowerCase().includes(q)
			);
		}

		if (filterGenre) {
			list = list.filter(k => k.genre === filterGenre);
		}

		return list;
	});

	function handlePlay(kit: KitWithId) {
		// Play first preview sample if available
		if (kit.samples?.length && kit.samples[0].url) {
			player.play({
				id: `kit-${kit.id}`,
				name: kit.name,
				artist: 'Drumkit',
				imageUrl: kit.imageUrl,
				audioUrl: kit.samples[0].url,
				genre: kit.genre,
			});
		}
	}

	function handleKitClick(kit: KitWithId) {
		goto(`/kit/${kit.id}`);
	}
</script>

<svelte:head>
	<title>Drumkits — {brandName}</title>
	<meta name="description" content="Drumkits y sample packs profesionales. Explora sonidos de {brandName} para tu producción musical." />
</svelte:head>

<div class="kits-page">
	<!-- Header -->
	<header class="kits-header">
		<h1 class="kits-title">🥁 Drumkits</h1>
		<p class="kits-sub">Sample packs y drumkits para tu producción.</p>
		<div class="kits-count">{filteredKits.length} {filteredKits.length === 1 ? 'kit' : 'kits'}</div>
	</header>

	<!-- Filters -->
	{#if kits.length > 0}
		<div class="kits-filters">
			<div class="search-wrap">
				<span class="search-icon"><Icon name="search" size={14} /></span>
				<input
					type="text"
					class="search-input"
					bind:value={search}
					placeholder="Buscar kits..."
				/>
				{#if search}
					<button class="search-clear" aria-label="Limpiar" onclick={() => search = ''}>
						<Icon name="close" size={12} />
					</button>
				{/if}
			</div>

			{#if genres.length > 0}
				<div class="genre-pills">
					<button
						class="genre-pill"
						class:active={!filterGenre}
						onclick={() => filterGenre = ''}
					>
						Todos
					</button>
					{#each genres as genre}
						<button
							class="genre-pill"
							class:active={filterGenre === genre}
							onclick={() => filterGenre = filterGenre === genre ? '' : genre}
						>
							{genre}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Grid -->
	{#if kitsLoading}
		<div class="kits-loading">
			{#each Array(4) as _}
				<Skeleton variant="card" />
			{/each}
		</div>
	{:else if kits.length === 0}
		<EmptyState
			icon="🥁"
			title="Sin kits"
			subtitle="Próximamente habrá drumkits disponibles"
		/>
	{:else if filteredKits.length === 0}
		<EmptyState
			icon="🥁"
			title="Sin kits"
			subtitle="No hay kits que coincidan con tu búsqueda"
		/>
	{:else}
		<div class="kits-grid">
			{#each filteredKits as kit (kit.id)}
				<KitCard {kit} onplay={handlePlay} onclick={handleKitClick} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.kits-page {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-6) var(--container-padding) var(--space-16);
	}

	.kits-header {
		margin-bottom: var(--space-6);
	}

	.kits-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		margin: 0;
	}

	.kits-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	.kits-count {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-top: var(--space-2);
	}

	/* Filters */
	.kits-filters {
		margin-bottom: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.search-wrap {
		position: relative;
		max-width: 320px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
		display: flex;
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3) var(--space-2) 36px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.search-input:focus {
		border-color: rgba(var(--accent-rgb), 0.5);
	}

	.search-clear {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		padding: 4px;
	}

	/* Genre pills */
	.genre-pills {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding-bottom: var(--space-1);
		-webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
		mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent);
	}

	.genre-pills::-webkit-scrollbar {
		display: none;
	}

	.genre-pill {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.genre-pill:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--text);
	}

	.genre-pill.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--bg);
	}

	/* Grid */
	.kits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--space-4);
	}

	.kits-loading {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--space-4);
	}

	@media (max-width: 480px) {
		.kits-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-3);
		}
	}
</style>
