<script lang="ts">
	import { auth, beats as beatsStore } from '$lib/stores';
	import { playlists, initPlaylists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, type Playlist } from '$lib/stores/playlists';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let authState = $derived($auth);
	let user = $derived(authState.user);
	let allBeats = $derived($beatsStore);
	let playlistList = $derived($playlists);

	let creating = $state(false);
	let newPlaylistName = $state('');
	let newPlaylistDesc = $state('');
	let selectedPlaylist = $state<Playlist | null>(null);
	let showAddBeat = $state(false);
	let addBeatSearch = $state('');

	onMount(() => {
		if (user) initPlaylists(user.uid);
	});

	let filteredBeatsForAdd = $derived(
		addBeatSearch
			? allBeats.filter(b =>
					b.name.toLowerCase().includes(addBeatSearch.toLowerCase()) ||
					b.genre.toLowerCase().includes(addBeatSearch.toLowerCase())
				).slice(0, 20)
			: allBeats.slice(0, 20)
	);

	function getBeatById(id: string) {
		return allBeats.find(b => b.id === id);
	}

	async function handleCreate() {
		if (!newPlaylistName.trim()) return;
		creating = true;
		const pl = await createPlaylist({ name: newPlaylistName, description: newPlaylistDesc });
		if (pl) {
			newPlaylistName = '';
			newPlaylistDesc = '';
			selectedPlaylist = pl;
		}
		creating = false;
	}

	async function handleDelete(playlist: Playlist) {
		if (!confirm(`¿Eliminar "${playlist.name}"?`)) return;
		await deletePlaylist(playlist.id);
		if (selectedPlaylist?.id === playlist.id) selectedPlaylist = null;
	}

	async function handleAddBeat(beatId: string) {
		if (!selectedPlaylist) return;
		await addToPlaylist(selectedPlaylist.id, beatId);
		// Re-fetch selected
		selectedPlaylist = playlistList.find(p => p.id === selectedPlaylist!.id) ?? selectedPlaylist;
	}

	async function handleRemoveBeat(beatId: string) {
		if (!selectedPlaylist) return;
		await removeFromPlaylist(selectedPlaylist.id, beatId);
		selectedPlaylist = playlistList.find(p => p.id === selectedPlaylist!.id) ?? selectedPlaylist;
	}
</script>

<div class="playlists-section">
	<h2>🎵 Mis Playlists</h2>
	<p class="section-desc">Creá colecciones de beats para tus proyectos.</p>

	<!-- Create new playlist -->
	<div class="create-form">
		<input
			type="text"
			placeholder="Nombre de la playlist"
			bind:value={newPlaylistName}
			disabled={creating}
			maxlength={100}
		/>
		<input
			type="text"
			placeholder="Descripción (opcional)"
			bind:value={newPlaylistDesc}
			disabled={creating}
			maxlength={300}
		/>
		<button class="create-btn" onclick={handleCreate} disabled={creating || !newPlaylistName.trim()}>
			{#if creating}
				⏳ Creando...
			{:else}
				➕ Crear playlist
			{/if}
		</button>
	</div>

	{#if playlistList.length === 0}
		<div class="empty-state">
			<span class="empty-icon">🎶</span>
			<p>No tenés playlists todavía.</p>
			<p class="empty-hint">Creá una arriba para empezar a guardar beats.</p>
		</div>
	{:else}
		<div class="playlist-layout">
			<!-- Playlist list -->
			<div class="playlist-list">
				{#each playlistList as pl (pl.id)}
					<div
						class="playlist-item"
						class:active={selectedPlaylist?.id === pl.id}
						onclick={() => selectedPlaylist = pl}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && (selectedPlaylist = pl)}
					>
						<div class="playlist-info">
							<span class="playlist-name">{pl.name}</span>
							<span class="playlist-count">{pl.beatIds.length} beats</span>
						</div>
						<button class="delete-btn" onclick={(e) => { e.stopPropagation(); handleDelete(pl); }} title="Eliminar">
							🗑️
						</button>
					</div>
				{/each}
			</div>

			<!-- Selected playlist detail -->
			{#if selectedPlaylist}
				<div class="playlist-detail">
					<div class="detail-header">
						<h3>{selectedPlaylist.name}</h3>
						{#if selectedPlaylist.description}
							<p class="detail-desc">{selectedPlaylist.description}</p>
						{/if}
						<button class="add-beat-btn" onclick={() => showAddBeat = !showAddBeat}>
							{showAddBeat ? '✕ Cerrar' : '➕ Agregar beats'}
						</button>
					</div>

					{#if showAddBeat}
						<div class="add-beat-panel">
							<input
								type="text"
								placeholder="Buscar beats..."
								bind:value={addBeatSearch}
								class="search-input"
							/>
							<div class="add-beat-list">
								{#each filteredBeatsForAdd as beat (beat.id)}
									{@const inPlaylist = selectedPlaylist.beatIds.includes(beat.id)}
									<button
										class="add-beat-item"
										class:in-playlist={inPlaylist}
										onclick={() => inPlaylist ? handleRemoveBeat(beat.id) : handleAddBeat(beat.id)}
									>
										<span class="beat-name">{beat.name}</span>
										<span class="beat-meta">{beat.genre} · {beat.bpm} BPM</span>
										<span class="beat-action">{inPlaylist ? '✓' : '+'}</span>
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Beats in playlist -->
					{#if selectedPlaylist.beatIds.length === 0}
						<div class="empty-detail">
							<p>Playlist vacía. Agregá beats con el botón de arriba.</p>
						</div>
					{:else}
						<div class="playlist-beats">
							{#each selectedPlaylist.beatIds as beatId, idx (beatId)}
								{@const beat = getBeatById(beatId)}
								{#if beat}
									<div class="playlist-beat-item">
										<span class="beat-num">{idx + 1}</span>
										<div class="beat-info">
											<span class="beat-name">{beat.name}</span>
											<span class="beat-meta">{beat.genre} · {beat.bpm} BPM · {beat.key}</span>
										</div>
										<button class="remove-btn" onclick={() => handleRemoveBeat(beatId)} title="Quitar">
											✕
										</button>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.playlists-section h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-1);
	}

	.section-desc {
		font-size: var(--text-sm);
		color: var(--text-muted);
		margin-bottom: var(--space-6);
	}

	.create-form {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
	}

	.create-form input {
		flex: 1;
		min-width: 150px;
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
	}

	.create-form input:focus {
		border-color: var(--accent);
	}

	.create-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.create-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--text-muted);
	}

	.empty-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: var(--space-2);
	}

	.empty-hint {
		font-size: var(--text-xs);
		color: var(--text-hint);
		margin-top: var(--space-1);
	}

	.playlist-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: var(--space-4);
	}

	@media (max-width: 640px) {
		.playlist-layout {
			grid-template-columns: 1fr;
		}
	}

	.playlist-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.playlist-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
		text-align: left;
		color: var(--text);
	}

	.playlist-item:hover {
		border-color: var(--accent);
	}

	.playlist-item.active {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.08);
	}

	.playlist-info {
		display: flex;
		flex-direction: column;
	}

	.playlist-name {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.playlist-count {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.delete-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
		opacity: 0.5;
		transition: opacity var(--duration-fast);
	}

	.delete-btn:hover {
		opacity: 1;
	}

	.playlist-detail {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.detail-header {
		margin-bottom: var(--space-4);
	}

	.detail-header h3 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.detail-desc {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin: var(--space-1) 0;
	}

	.add-beat-btn {
		margin-top: var(--space-2);
		padding: var(--space-1) var(--space-3);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-sm);
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		cursor: pointer;
	}

	.add-beat-panel {
		margin-bottom: var(--space-4);
		padding: var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-size: var(--text-sm);
		outline: none;
		margin-bottom: var(--space-2);
	}

	.add-beat-list {
		max-height: 200px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.add-beat-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-align: left;
		color: var(--text);
		font-size: var(--text-xs);
		transition: background var(--duration-fast);
	}

	.add-beat-item:hover {
		background: var(--surface);
	}

	.add-beat-item.in-playlist {
		opacity: 0.6;
	}

	.add-beat-item .beat-name {
		flex: 1;
		font-weight: 500;
	}

	.add-beat-item .beat-meta {
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
	}

	.add-beat-item .beat-action {
		font-weight: 700;
		color: var(--accent);
	}

	.empty-detail {
		text-align: center;
		padding: var(--space-6);
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	.playlist-beats {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.playlist-beat-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border-radius: var(--radius-sm);
	}

	.beat-num {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		min-width: 20px;
	}

	.beat-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.beat-info .beat-name {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.beat-info .beat-meta {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: var(--text-xs);
		padding: var(--space-1);
		transition: color var(--duration-fast);
	}

	.remove-btn:hover {
		color: var(--danger);
	}
</style>
