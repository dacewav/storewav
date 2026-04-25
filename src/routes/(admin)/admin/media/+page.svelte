<script lang="ts">
	import { onMount } from 'svelte';
	import { gallery, galleryLoading, initGallery, destroyGallery, beats as beatsStore, updateBeat, type GalleryImage } from '$lib/stores';
	import { Card, Badge } from '$lib/components';
	import { toast } from '$lib/toastStore';

	let images = $derived($gallery);
	let loading = $derived($galleryLoading);
	let beatsData = $derived($beatsStore);
	let beats = $derived(beatsData?.data ? Object.entries(beatsData.data).map(([id, b]: [string, any]) => ({ id, name: b.name ?? '(Sin nombre)' })) : []);

	let uploading = $state(false);
	let uploadProgress = $state(0);
	let dragOver = $state(false);
	let search = $state('');
	let selectedImage = $state<GalleryImage | null>(null);
	let showAssignModal = $state(false);

	let filteredImages = $derived(
		search.trim()
			? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()))
			: images
	);

	onMount(() => {
		initGallery();
		return destroyGallery;
	});

	async function handleFiles(files: FileList | null) {
		if (!files?.length) return;
		uploading = true;
		uploadProgress = 0;
		for (const file of Array.from(files)) {
			if (!file.type.startsWith('image/')) {
				toast.error(`"${file.name}" no es una imagen`);
				continue;
			}
			await gallery.uploadImage(file, (pct) => (uploadProgress = pct));
		}
		uploading = false;
		uploadProgress = 0;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function confirmDelete(img: GalleryImage) {
		if (confirm(`¿Eliminar "${img.name}"?`)) {
			gallery.deleteImage(img.id);
		}
	}

	function openAssign(img: GalleryImage) {
		selectedImage = img;
		showAssignModal = true;
	}

	async function assignToBeat(beatId: string) {
		if (!selectedImage) return;
		try {
			await updateBeat(beatId, { imageUrl: selectedImage.url });
			toast.success('Imagen asignada al beat');
			showAssignModal = false;
			selectedImage = null;
		} catch (e) {
			toast.error('Error al asignar imagen');
		}
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<svelte:head>
	<title>Media — Admin</title>
</svelte:head>

<div class="media-page">
	<div class="media-header">
		<div>
			<h1 class="media-title">Media</h1>
			<p class="media-sub">{images.length} imágenes · {formatSize(images.reduce((a, i) => a + i.size, 0))} total</p>
		</div>
	</div>

	<!-- Upload zone -->
	<div
		class="upload-zone"
		class:drag-over={dragOver}
		class:uploading
		role="button"
		tabindex="0"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={() => document.getElementById('media-file-input')?.click()}
		onkeydown={(e) => e.key === 'Enter' && document.getElementById('media-file-input')?.click()}
		aria-label="Zona de subida de imágenes"
	>
		<input id="media-file-input" type="file" accept="image/*" multiple onchange={(e) => handleFiles((e.target as HTMLInputElement).files)} hidden />
		{#if uploading}
			<div class="upload-progress">
				<div class="progress-ring">
					<svg viewBox="0 0 36 36">
						<circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" stroke-width="2" />
						<circle cx="18" cy="18" r="16" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="{uploadProgress} 100" stroke-linecap="round" transform="rotate(-90 18 18)" />
					</svg>
					<span class="progress-text">{uploadProgress}%</span>
				</div>
				<span class="upload-text">Subiendo...</span>
			</div>
		{:else}
			<span class="upload-icon">🖼️</span>
			<span class="upload-text">Arrastrá imágenes acá o hacé click</span>
			<span class="upload-hint">JPG, PNG, WebP · Máx 100MB</span>
		{/if}
	</div>

	<!-- Search -->
	<div class="media-toolbar">
		<input type="text" class="search-input" placeholder="Buscar por nombre..." bind:value={search} />
		<span class="result-count">{filteredImages.length} resultado{filteredImages.length !== 1 ? 's' : ''}</span>
	</div>

	<!-- Image grid -->
	{#if loading}
		<div class="loading-state">Cargando imágenes...</div>
	{:else if filteredImages.length === 0}
		<div class="empty-state">
			<span class="empty-icon">📁</span>
			<span class="empty-text">{search ? 'Sin resultados' : 'No hay imágenes — subí la primera'}</span>
		</div>
	{:else}
		<div class="image-grid">
			{#each filteredImages as img (img.id)}
				<div class="image-card">
					<div class="img-wrap">
						<img src={img.url} alt={img.name} loading="lazy" decoding="async" />
					</div>
					<div class="img-info">
						<span class="img-name">{img.name}</span>
						<span class="img-meta">{formatSize(img.size)} · {new Date(img.uploadedAt).toLocaleDateString()}</span>
					</div>
					<div class="img-actions">
						<button class="ia-btn" onclick={() => openAssign(img)} title="Asignar a beat">🎵</button>
						<button class="ia-btn" onclick={() => navigator.clipboard.writeText(img.url).then(() => toast.success('URL copiada'))} title="Copiar URL">📋</button>
						<button class="ia-btn danger" onclick={() => confirmDelete(img)} title="Eliminar">🗑</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Assign modal -->
	{#if showAssignModal && selectedImage}
		<div class="modal-backdrop" onclick={() => (showAssignModal = false)} onkeydown={(e) => e.key === 'Escape' && (showAssignModal = false)} role="dialog" aria-modal="true" aria-label="Asignar imagen a beat" tabindex="-1">
			<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
				<h3 class="modal-title">🎵 Asignar a beat</h3>
				<div class="modal-preview">
					<img src={selectedImage.url} alt={selectedImage.name} />
					<span>{selectedImage.name}</span>
				</div>
				{#if beats.length === 0}
					<p class="modal-empty">No hay beats. Creá uno primero.</p>
				{:else}
					<div class="beat-list">
						{#each beats as beat}
							<button class="beat-option" onclick={() => assignToBeat(beat.id)}>
								<span class="bo-name">{beat.name}</span>
								<span class="bo-assign">Asignar →</span>
							</button>
						{/each}
					</div>
				{/if}
				<div class="modal-actions">
					<button class="btn-cancel" onclick={() => (showAssignModal = false)}>Cancelar</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.media-page { max-width: 1100px; margin: 0 auto; }

	.media-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.media-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.media-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
		font-family: var(--font-mono);
	}

	/* Upload zone */
	.upload-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-4);
		border: 2px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		cursor: pointer;
		transition: all var(--duration-fast);
		margin-bottom: var(--space-6);
		min-height: 120px;
	}

	.upload-zone:hover, .upload-zone.drag-over {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.04);
	}

	.upload-zone.uploading {
		pointer-events: none;
		border-color: var(--accent);
	}

	.upload-icon { font-size: 2rem; }

	.upload-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.upload-hint {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.upload-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.progress-ring {
		position: relative;
		width: 56px;
		height: 56px;
	}

	.progress-ring svg { width: 100%; height: 100%; }

	.progress-ring circle:last-child {
		transition: stroke-dasharray 0.2s ease;
	}

	.progress-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--accent);
	}

	/* Toolbar */
	.media-toolbar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.search-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--text);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.search-input:focus { border-color: var(--accent); }

	.result-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* States */
	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-8);
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	.empty-icon { font-size: 2rem; }

	/* Grid */
	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--space-4);
	}

	.image-card {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		overflow: hidden;
		transition: all var(--duration-fast);
	}

	.image-card:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
	}

	.img-wrap {
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--surface-hover);
	}

	.img-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.image-card:hover .img-wrap img {
		transform: scale(1.05);
	}

	.img-info {
		padding: var(--space-2) var(--space-3);
	}

	.img-name {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.img-meta {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		margin-top: 2px;
	}

	.img-actions {
		display: flex;
		gap: 1px;
		border-top: 1px solid var(--border);
	}

	.ia-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 13px;
		transition: background var(--duration-fast);
	}

	.ia-btn:hover { background: var(--surface-hover); }
	.ia-btn.danger:hover { background: rgba(239, 68, 68, 0.08); }

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 480px;
		width: 100%;
		max-height: 70vh;
		overflow-y: auto;
	}

	.modal-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.modal-preview {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
	}

	.modal-preview img {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-sm);
		object-fit: cover;
	}

	.modal-preview span {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.modal-empty {
		font-size: var(--text-sm);
		color: var(--text-muted);
		text-align: center;
		padding: var(--space-4);
	}

	.beat-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-height: 300px;
		overflow-y: auto;
	}

	.beat-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.beat-option:hover {
		background: rgba(var(--accent-rgb), 0.06);
		border-color: rgba(var(--accent-rgb), 0.3);
	}

	.bo-name {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text);
	}

	.bo-assign {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--accent);
		opacity: 0;
		transition: opacity var(--duration-fast);
	}

	.beat-option:hover .bo-assign { opacity: 1; }

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}

	.btn-cancel {
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.btn-cancel:hover { background: var(--surface-hover); }

	@media (max-width: 768px) {
		.image-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: var(--space-3);
		}

		.media-toolbar { flex-direction: column; align-items: stretch; }
	}
</style>
