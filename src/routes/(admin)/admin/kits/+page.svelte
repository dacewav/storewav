<script lang="ts">
	import { onMount } from 'svelte';
	import { EmptyState, ImageCropper } from '$lib/components';
	import Icon from '$lib/components/Icon.svelte';
	import { FIREBASE_DB } from '$lib/firebaseDb';
	import type { Kit, KitSample } from '$lib/stores/kits';

	let kits = $state<(Kit & { id: string })[]>([]);
	let loading = $state(true);
	let search = $state('');

	// Editor state
	let editing = $state<Kit & { id: string } | null>(null);
	let isNew = $state(false);
	let saving = $state(false);
	let uploadingImage = $state(false);
	let uploadingZip = $state(false);
	let zipProgress = $state('');
	let imagePreview = $state<string | null>(null);
	let dragOver = $state(false);
	let driveUrl = $state('');
	let driveName = $state('');
	let showDriveForm = $state(false);
	let cropSrc = $state<string | null>(null);

	const GENRES = ['Trap', 'Drill', 'Reggaeton', 'R&B', 'Hip-Hop', 'Corrido', 'Pop', 'Ambient', 'Lo-Fi', 'Other'];

	async function getAuthToken(): Promise<string | null> {
		try {
			const { getAuthInstance } = await import('$lib/firebase');
			const auth = await getAuthInstance();
			if (!auth?.currentUser) return null;
			// Force refresh to avoid stale token (tokens expire after 1h)
			return await auth.currentUser.getIdToken(true);
		} catch {
			return null;
		}
	}

	let filteredKits = $derived.by(() => {
		if (!search.trim()) return kits;
		const q = search.trim().toLowerCase();
		return kits.filter(k =>
			k.name.toLowerCase().includes(q) ||
			k.genre.toLowerCase().includes(q) ||
			k.description?.toLowerCase().includes(q)
		);
	});

	/* ───── Load kits ───── */
	async function loadKits() {
		loading = true;
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const resp = await fetch(`${FIREBASE_DB}/kits.json${authParam}`);
			if (resp.ok) {
				const data = await resp.json();
				kits = data ? Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })) : [];
			}
		} catch (err) {
			console.error('[Admin Kits] Load failed:', err);
		} finally {
			loading = false;
		}
	}

	/* ───── Editor ───── */
	function startNew() {
		// Generate stable ID upfront so uploads and Firebase save use the same path
		const stableId = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
		editing = {
			id: stableId, name: '', description: '', genre: 'Trap',
			imageUrl: '', samples: [], priceMXN: 350, priceUSD: 20, active: true,
		};
		imagePreview = null;
		isNew = true;
	}

	function startEdit(kit: Kit & { id: string }) {
		editing = { ...kit, samples: [...(kit.samples || [])] };
		imagePreview = kit.imageUrl || null;
		isNew = false;
	}

	function cancelEdit() {
		editing = null;
		imagePreview = null;
		cropSrc = null;
		isNew = false;
	}

	/* ───── Image upload ───── */
	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !editing) return;
		if (!file.type.startsWith('image/')) { alert('Solo imágenes'); return; }
		if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
		// Show cropper instead of direct upload
		cropSrc = URL.createObjectURL(file);
	}

	function handleCropCancel() {
		cropSrc = null;
	}

	async function handleCropExport(blob: Blob, dataUrl: string) {
		cropSrc = null;
		imagePreview = dataUrl;
		// Upload cropped image
		uploadingImage = true;
		try {
			const token = await getAuthToken();
			if (!token) {
				alert('Sesión expirada. Recarga la página e inicia sesión de nuevo.');
				uploadingImage = false;
				return;
			}
			const fd = new FormData();
			fd.append('file', new File([blob], 'cover.jpg', { type: 'image/jpeg' }));
			fd.append('kitId', editing!.id);

			const resp = await fetch('/api/upload/kit-image', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: fd,
			});
			const data = await resp.json();
			if (data.ok && data.url) {
				editing!.imageUrl = data.url;
			} else {
				alert(data.error || 'Error al subir imagen');
			}
		} catch (err) {
			console.error('[Image Upload]', err);
			alert('Error al subir imagen');
		} finally {
			uploadingImage = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/') && editing) {
			if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
			cropSrc = URL.createObjectURL(file);
		}
	}

	/* ───── ZIP upload ───── */
	async function handleZipUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !editing) return;
		await uploadZip(file);
	}

	async function uploadZip(file: File) {
		if (!editing) return;
		if (!file.name.toLowerCase().endsWith('.zip')) { alert('Solo archivos .zip'); return; }
		if (file.size > 200 * 1024 * 1024) { alert('Máximo 200MB'); return; }

		uploadingZip = true;
		zipProgress = 'Procesando ZIP...';
		try {
			const token = await getAuthToken();
			if (!token) {
				alert('Sesión expirada. Recarga la página e inicia sesión de nuevo.');
				uploadingZip = false;
				zipProgress = '';
				return;
			}
			const kitId = editing!.id;
			const fd = new FormData();
			fd.append('file', file);
			fd.append('kitId', kitId);

			const resp = await fetch('/api/upload/kit-zip', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: fd,
			});
			const data = await resp.json();
			if (data.ok && data.samples) {
				// Merge new samples (avoid duplicates by URL)
				const existingUrls = new Set(editing!.samples.map(s => s.url));
				const newSamples = data.samples.filter((s: KitSample) => !existingUrls.has(s.url));
				editing!.samples = [...editing!.samples, ...newSamples];
				zipProgress = `${newSamples.length} samples extraídos`;
				if (data.errors?.length) {
					zipProgress += ` (${data.errors.length} archivos ignorados)`;
				}
			} else {
				alert(data.error || 'Error al procesar ZIP');
				zipProgress = '';
			}
		} catch (err) {
			console.error('[ZIP Upload]', err);
			alert('Error al subir ZIP');
			zipProgress = '';
		} finally {
			uploadingZip = false;
			setTimeout(() => { zipProgress = ''; }, 3000);
		}
	}

	/* ───── Drive link ───── */
	function addDriveLink() {
		if (!editing || !driveUrl.trim()) return;
		const name = driveName.trim() || `Sample ${editing.samples.length + 1}`;
		editing.samples = [...editing.samples, { name, url: driveUrl.trim() }];
		driveUrl = '';
		driveName = '';
		showDriveForm = false;
	}

	/* ───── Sample management ───── */
	function addSample() {
		if (!editing) return;
		editing.samples = [...editing.samples, { name: '', url: '' }];
	}

	function removeSample(index: number) {
		if (!editing) return;
		editing.samples = editing.samples.filter((_, i) => i !== index);
	}

	function updateSample(index: number, field: keyof KitSample, value: string) {
		if (!editing) return;
		editing.samples = editing.samples.map((s, i) =>
			i === index ? { ...s, [field]: value } : s
		);
	}

	function moveSample(index: number, dir: -1 | 1) {
		if (!editing) return;
		const newIdx = index + dir;
		if (newIdx < 0 || newIdx >= editing.samples.length) return;
		const arr = [...editing.samples];
		[arr[index], arr[newIdx]] = [arr[newIdx], arr[index]];
		editing.samples = arr;
	}

	/* ───── Save / Delete ───── */
	async function saveKit() {
		if (!editing || !editing.name.trim()) return;
		saving = true;
		try {
			const token = await getAuthToken();
			if (!token) {
				alert('Sesión expirada. Recarga la página e inicia sesión de nuevo.');
				saving = false;
				return;
			}
			const authParam = `?auth=${token}`;
			const body = {
				name: editing.name.trim(),
				description: editing.description?.trim() || '',
				genre: editing.genre,
				imageUrl: editing.imageUrl || '',
				samples: editing.samples,
				priceMXN: editing.priceMXN,
				priceUSD: editing.priceUSD,
				active: editing.active,
				updatedAt: Date.now(),
			};

			if (isNew) {
				// Use PUT with the pre-generated stable ID (same ID used for uploads)
				await fetch(`${FIREBASE_DB}/kits/${editing!.id}.json${authParam}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...body, createdAt: Date.now() }),
				});
				kits = [...kits, { id: editing!.id, ...body }];
			} else {
				await fetch(`${FIREBASE_DB}/kits/${editing.id}.json${authParam}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});
				kits = kits.map(k => k.id === editing!.id ? { ...k, ...body } : k);
			}
			editing = null;
			imagePreview = null;
			isNew = false;
		} catch (err) {
			console.error('[Admin Kits] Save failed:', err);
		} finally {
			saving = false;
		}
	}

	async function toggleActive(kit: Kit & { id: string }) {
		try {
			const token = await getAuthToken();
			if (!token) { alert('Sesión expirada.'); return; }
			const newActive = !kit.active;
			await fetch(`${FIREBASE_DB}/kits/${kit.id}/active.json?auth=${token}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newActive),
			});
			kits = kits.map(k => k.id === kit.id ? { ...k, active: newActive } : k);
		} catch (err) {
			console.error('[Admin Kits] Toggle failed:', err);
		}
	}

	async function deleteKit(kit: Kit & { id: string }) {
		if (!confirm(`¿Eliminar "${kit.name}"? Esta acción no se puede deshacer.`)) return;
		try {
			const token = await getAuthToken();
			if (!token) { alert('Sesión expirada.'); return; }
			await fetch(`${FIREBASE_DB}/kits/${kit.id}.json?auth=${token}`, { method: 'DELETE' });
			kits = kits.filter(k => k.id !== kit.id);
		} catch (err) {
			console.error('[Admin Kits] Delete failed:', err);
		}
	}

	/* ───── Preview audio ───── */
	let previewAudio = $state<HTMLAudioElement | null>(null);
	let previewIdx = $state<number | null>(null);

	function togglePreview(url: string, idx: number) {
		if (previewIdx === idx) {
			previewAudio?.pause();
			previewAudio = null;
			previewIdx = null;
			return;
		}
		previewAudio?.pause();
		previewAudio = new Audio(url);
		previewIdx = idx;
		previewAudio.addEventListener('ended', () => { previewIdx = null; });
		previewAudio.addEventListener('error', () => { previewIdx = null; });
		previewAudio.play().catch(() => { previewIdx = null; });
	}

	onMount(() => {
		loadKits();
		return () => { previewAudio?.pause(); };
	});
</script>

<svelte:head><title>🥁 Kits — Admin</title></svelte:head>

<div class="kits-admin">
	<div class="page-header">
		<div>
			<h1 class="page-title">🥁 Drumkits</h1>
			<p class="page-sub">Administra drumkits y sample packs.</p>
		</div>
		<button class="btn-primary" onclick={startNew}>
			<Icon name="plus" size={14} /> Nuevo kit
		</button>
	</div>

	<!-- ═══════════ EDITOR ═══════════ -->
	{#if editing}
		<div class="editor-panel">
			<h2 class="editor-title">{isNew ? '✨ Nuevo kit' : `✏️ ${editing.name}`}</h2>

			<!-- Image upload -->
			<div class="image-section">
				<div
					class="image-dropzone"
					class:has-image={imagePreview}
					class:dragover={dragOver}
					role="button"
					tabindex="0"
					ondragover={(e) => { e.preventDefault(); dragOver = true; }}
					ondragleave={() => dragOver = false}
					ondrop={handleDrop}
					onclick={() => document.getElementById('kit-image-input')?.click()}
					onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('kit-image-input')?.click(); }}
				>
					{#if imagePreview}
						<img src={imagePreview} alt="Preview" class="image-preview" />
						<div class="image-overlay">
							{#if uploadingImage}
								<span class="upload-spinner">⏳</span>
							{:else}
								<span>📷 Cambiar imagen</span>
							{/if}
						</div>
					{:else}
						<div class="image-placeholder">
							{#if uploadingImage}
								<span class="upload-spinner">⏳ Subiendo...</span>
							{:else}
								<span class="upload-icon">🖼️</span>
								<span>Click o arrastra una imagen</span>
								<span class="upload-hint">JPG, PNG, WebP · Máx 5MB</span>
							{/if}
						</div>
					{/if}
				</div>
				<input id="kit-image-input" type="file" accept="image/*" hidden onchange={handleImageUpload} />
				{#if editing.imageUrl && !imagePreview}
					<input type="text" class="url-input" bind:value={editing.imageUrl} placeholder="O pega una URL de imagen..." />
				{/if}
			</div>

			<!-- Info fields -->
			<div class="editor-grid">
				<label class="field">
					<span class="field-label">Nombre</span>
					<input type="text" bind:value={editing.name} placeholder="Trap Kit Vol. 1" />
				</label>
				<label class="field">
					<span class="field-label">Género</span>
					<select bind:value={editing.genre}>
						{#each GENRES as g}<option value={g}>{g}</option>{/each}
					</select>
				</label>
				<label class="field full">
					<span class="field-label">Descripción</span>
					<textarea bind:value={editing.description} placeholder="Descripción del kit..." rows="2"></textarea>
				</label>
				<label class="field">
					<span class="field-label">Precio MXN</span>
					<input type="number" bind:value={editing.priceMXN} min="0" step="50" />
				</label>
				<label class="field">
					<span class="field-label">Precio USD</span>
					<input type="number" bind:value={editing.priceUSD} min="0" step="5" />
				</label>
				<label class="field">
					<span class="field-label">Activo</span>
					<select bind:value={editing.active}>
						<option value={true}>✅ Visible en tienda</option>
						<option value={false}>🔴 Oculto</option>
					</select>
				</label>
			</div>

			<!-- ═══════════ SAMPLES ═══════════ -->
			<div class="samples-section">
				<div class="samples-header">
					<h3>🎧 Samples ({editing.samples.length})</h3>
					<div class="samples-actions">
						<label class="btn-small upload-zip-btn">
							{#if uploadingZip}
								⏳ {zipProgress || 'Subiendo...'}
							{:else}
								📁 Subir ZIP
							{/if}
							<input type="file" accept=".zip" hidden onchange={handleZipUpload} disabled={uploadingZip} />
						</label>
						<button class="btn-small" onclick={() => showDriveForm = !showDriveForm}>
							🔗 Link Drive
						</button>
						<button class="btn-small" onclick={addSample}>
							<Icon name="plus" size={12} /> Manual
						</button>
					</div>
				</div>

				{#if zipProgress && !uploadingZip}
					<div class="zip-success">{zipProgress}</div>
				{/if}

				<!-- Drive link form -->
				{#if showDriveForm}
					<div class="drive-form">
						<input type="text" bind:value={driveName} placeholder="Nombre del sample (opcional)" />
						<input type="text" bind:value={driveUrl} placeholder="https://drive.google.com/... o cualquier URL de audio" />
						<button class="btn-primary btn-sm" onclick={addDriveLink} disabled={!driveUrl.trim()}>
							Agregar
						</button>
						<button class="btn-icon" onclick={() => { showDriveForm = false; driveUrl = ''; driveName = ''; }}>✕</button>
					</div>
				{/if}

				<!-- Sample list -->
				{#if editing.samples.length > 0}
					<div class="sample-list">
						{#each editing.samples as sample, i}
							<div class="sample-item">
								<span class="sample-num">{(i + 1).toString().padStart(2, '0')}</span>
								{#if sample.url}
									<button
										class="sample-play-btn"
										class:playing={previewIdx === i}
										onclick={() => togglePreview(sample.url, i)}
										aria-label="Preview"
									>
										<Icon name={previewIdx === i ? 'pause' : 'play'} size={12} />
									</button>
								{:else}
									<span class="sample-play-btn empty">—</span>
								{/if}
								<input
									type="text"
									class="sample-name-input"
									bind:value={sample.name}
									placeholder="Nombre"
									oninput={() => updateSample(i, 'name', sample.name)}
								/>
								<input
									type="text"
									class="sample-url-input"
									bind:value={sample.url}
									placeholder="URL del audio"
									oninput={() => updateSample(i, 'url', sample.url)}
								/>
								<div class="sample-controls">
									<button class="btn-icon-tiny" onclick={() => moveSample(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
									<button class="btn-icon-tiny" onclick={() => moveSample(i, 1)} disabled={i === editing.samples.length - 1} aria-label="Bajar">↓</button>
									<button class="btn-icon-tiny danger" onclick={() => removeSample(i)} aria-label="Eliminar">✕</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-samples">
						<span>Sin samples</span>
						<span class="hint">Sube un ZIP, pega un link de Drive, o agrégalo manualmente</span>
					</div>
				{/if}
			</div>

			<!-- Actions -->
			<div class="editor-actions">
				<button class="btn-primary btn-lg" onclick={saveKit} disabled={saving || !editing.name.trim()}>
					{saving ? '⏳ Guardando...' : '💾 Guardar kit'}
				</button>
				<button class="btn-secondary" onclick={cancelEdit}>Cancelar</button>
			</div>
		</div>
	{/if}

	<!-- ═══════════ IMAGE CROP MODAL ═══════════ -->
	{#if cropSrc}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="crop-modal" role="dialog" aria-modal="true" aria-label="Recortar imagen"
			onkeydown={(e) => { if (e.key === 'Escape') handleCropCancel(); }}
			onclick={(e) => { if (e.target === e.currentTarget) handleCropCancel(); }}
			tabindex="-1"
		>
			<div class="crop-modal-content">
				<ImageCropper
					src={cropSrc}
					aspectRatio={1}
					oncrop={handleCropExport}
					oncancel={handleCropCancel}
				/>
			</div>
		</div>
	{/if}

	<!-- ═══════════ LIST ═══════════ -->
	<div class="filters-bar">
		<div class="search-wrap">
			<span class="search-icon"><Icon name="search" size={14} /></span>
			<input type="text" class="search-input" bind:value={search} placeholder="Buscar por nombre o género..." />
			{#if search}
				<button class="search-clear" aria-label="Limpiar" onclick={() => search = ''}>
					<Icon name="close" size={12} />
				</button>
			{/if}
		</div>
		<span class="filter-count">{filteredKits.length} kits</span>
	</div>

	{#if loading}
		<div class="loading-msg">Cargando kits...</div>
	{:else if filteredKits.length === 0}
		<EmptyState icon="🥁" title="Sin kits" subtitle={search ? 'No hay resultados' : 'Crea tu primer drumkit'} />
	{:else}
		<div class="kit-list">
			{#each filteredKits as kit (kit.id)}
				<div class="kit-row" class:inactive={!kit.active}>
					<div class="kit-thumb">
						{#if kit.imageUrl}
							<img src={kit.imageUrl} alt="" loading="lazy" />
						{:else}
							<span class="thumb-ph">🥁</span>
						{/if}
					</div>
					<div class="kit-info">
						<div class="kit-name">{kit.name}</div>
						<div class="kit-meta">
							<span class="genre-tag">{kit.genre}</span>
							<span>{kit.samples?.length || 0} samples</span>
							<span>${kit.priceMXN} MXN / ${kit.priceUSD} USD</span>
							{#if !kit.active}<span class="inactive-tag">OCULTO</span>{/if}
						</div>
					</div>
					<div class="kit-actions">
						<button class="btn-small" onclick={() => startEdit(kit)}>✏️ Editar</button>
						<button class="btn-small" onclick={() => toggleActive(kit)}>
							{kit.active ? '🔴 Ocultar' : '🟢 Mostrar'}
						</button>
						<button class="btn-icon danger" onclick={() => deleteKit(kit)} aria-label="Eliminar">🗑️</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.kits-admin { max-width: 960px; margin: 0 auto; }

	/* ─── Header ─── */
	.page-header {
		display: flex; align-items: flex-start; justify-content: space-between;
		margin-bottom: var(--space-6); gap: var(--space-4);
	}
	.page-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); }
	.page-sub { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1); }

	/* ─── Buttons ─── */
	.btn-primary {
		display: inline-flex; align-items: center; gap: var(--space-2);
		padding: var(--space-2) var(--space-4); background: var(--accent); color: var(--bg);
		border: none; border-radius: var(--radius-md);
		font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600;
		cursor: pointer; transition: all var(--duration-fast); white-space: nowrap;
	}
	.btn-primary:hover { filter: brightness(1.1); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-lg { padding: var(--space-3) var(--space-6); font-size: var(--text-sm); }
	.btn-sm { padding: var(--space-1) var(--space-3); font-size: var(--text-2xs); }

	.btn-secondary {
		padding: var(--space-2) var(--space-4); background: transparent;
		border: 1px solid var(--border); border-radius: var(--radius-md);
		font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); cursor: pointer;
	}

	.btn-small {
		display: inline-flex; align-items: center; gap: var(--space-1);
		padding: var(--space-1) var(--space-3); background: transparent;
		border: 1px solid var(--border); border-radius: var(--radius-sm);
		font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary);
		cursor: pointer; transition: all var(--duration-fast); white-space: nowrap;
	}
	.btn-small:hover { border-color: var(--accent); color: var(--accent); }

	.btn-icon {
		width: 28px; height: 28px; border-radius: var(--radius-sm);
		background: transparent; border: 1px solid var(--border);
		color: var(--text-muted); cursor: pointer;
		display: flex; align-items: center; justify-content: center; font-size: var(--text-xs);
	}
	.btn-icon.danger:hover { border-color: #ef4444; color: #ef4444; }

	.btn-icon-tiny {
		width: 22px; height: 22px; border-radius: 4px;
		background: transparent; border: 1px solid var(--border);
		color: var(--text-muted); cursor: pointer; font-size: 10px;
		display: flex; align-items: center; justify-content: center;
	}
	.btn-icon-tiny:hover { border-color: var(--accent); color: var(--accent); }
	.btn-icon-tiny.danger:hover { border-color: #ef4444; color: #ef4444; }
	.btn-icon-tiny:disabled { opacity: 0.3; cursor: default; }

	/* ─── Editor ─── */
	.editor-panel {
		padding: var(--space-5); border: 1px solid rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-lg); background: var(--surface);
		margin-bottom: var(--space-6);
	}
	.editor-title {
		font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700;
		color: var(--text); margin-bottom: var(--space-4);
	}

	/* ─── Image upload ─── */
	.image-section { margin-bottom: var(--space-4); }
	.image-dropzone {
		width: 100%; max-width: 300px; aspect-ratio: 1;
		border: 2px dashed var(--border); border-radius: var(--radius-md);
		cursor: pointer; overflow: hidden; position: relative;
		transition: all var(--duration-fast); background: var(--bg);
	}
	.image-dropzone:hover, .image-dropzone.dragover {
		border-color: var(--accent); background: rgba(var(--accent-rgb), 0.03);
	}
	.image-dropzone.has-image { border-style: solid; }

	.image-preview { width: 100%; height: 100%; object-fit: cover; }
	.image-overlay {
		position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
		background: rgba(0,0,0,0.5); opacity: 0; transition: opacity var(--duration-fast);
		color: white; font-size: var(--text-sm); font-family: var(--font-mono);
	}
	.image-dropzone:hover .image-overlay { opacity: 1; }

	.image-placeholder {
		width: 100%; height: 100%; display: flex; flex-direction: column;
		align-items: center; justify-content: center; gap: var(--space-2);
		color: var(--text-muted); font-size: var(--text-sm);
	}
	.upload-icon { font-size: 2rem; }
	.upload-hint { font-size: var(--text-2xs); color: var(--text-muted); }
	.upload-spinner { font-size: 1.5rem; animation: pulse 1s infinite; }
	@keyframes pulse { 50% { opacity: 0.5; } }

	.url-input {
		width: 100%; max-width: 400px; margin-top: var(--space-2);
		padding: var(--space-2) var(--space-3); background: var(--bg);
		border: 1px solid var(--border); border-radius: var(--radius-sm);
		color: var(--text); font-size: var(--text-xs); font-family: var(--font-mono);
	}

	/* ─── Fields ─── */
	.editor-grid {
		display: grid; grid-template-columns: 1fr 1fr;
		gap: var(--space-3); margin-bottom: var(--space-5);
	}
	.field { display: flex; flex-direction: column; gap: var(--space-1); }
	.field.full { grid-column: 1 / -1; }
	.field-label {
		font-family: var(--font-mono); font-size: var(--text-2xs);
		color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
	}
	.field input, .field select, .field textarea {
		padding: var(--space-2) var(--space-3); background: var(--bg);
		border: 1px solid var(--border); border-radius: var(--radius-sm);
		color: var(--text); font-size: var(--text-sm); outline: none;
		transition: border-color var(--duration-fast);
	}
	.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--accent); }

	/* ─── Samples ─── */
	.samples-section {
		padding: var(--space-4); border: 1px solid var(--border);
		border-radius: var(--radius-md); background: rgba(var(--accent-rgb), 0.01);
		margin-bottom: var(--space-4);
	}
	.samples-header {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);
	}
	.samples-header h3 {
		font-family: var(--font-mono); font-size: var(--text-sm);
		font-weight: 600; color: var(--text);
	}
	.samples-actions { display: flex; gap: var(--space-2); }

	.zip-success {
		padding: var(--space-2) var(--space-3); margin-bottom: var(--space-3);
		background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);
		border-radius: var(--radius-sm); font-size: var(--text-xs);
		color: #22c55e; font-family: var(--font-mono);
	}

	/* Drive form */
	.drive-form {
		display: flex; gap: var(--space-2); margin-bottom: var(--space-3);
		padding: var(--space-3); background: var(--bg); border-radius: var(--radius-sm);
		border: 1px solid var(--border); align-items: center; flex-wrap: wrap;
	}
	.drive-form input {
		flex: 1; min-width: 150px; padding: var(--space-2) var(--space-3);
		background: var(--surface); border: 1px solid var(--border);
		border-radius: var(--radius-sm); color: var(--text); font-size: var(--text-xs);
	}

	/* Sample list */
	.sample-list {
		display: flex; flex-direction: column; gap: 1px;
		border: 1px solid var(--border); border-radius: var(--radius-sm);
		overflow: hidden; background: var(--border);
	}
	.sample-item {
		display: flex; align-items: center; gap: var(--space-2);
		padding: var(--space-2) var(--space-3); background: var(--bg);
	}
	.sample-num {
		font-family: var(--font-mono); font-size: var(--text-2xs);
		color: var(--text-muted); width: 24px; flex-shrink: 0; text-align: center;
	}
	.sample-play-btn {
		width: 28px; height: 28px; border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.1); border: none;
		color: var(--accent); cursor: pointer; flex-shrink: 0;
		display: flex; align-items: center; justify-content: center;
		transition: all var(--duration-fast);
	}
	.sample-play-btn:hover { background: var(--accent); color: var(--bg); }
	.sample-play-btn.playing { background: var(--accent); color: var(--bg); }
	.sample-play-btn.empty { background: transparent; color: var(--text-muted); cursor: default; }

	.sample-name-input {
		width: 140px; flex-shrink: 0; padding: var(--space-1) var(--space-2);
		background: transparent; border: 1px solid transparent;
		border-radius: 4px; color: var(--text); font-size: var(--text-xs);
	}
	.sample-name-input:focus { border-color: var(--accent); background: var(--surface); }

	.sample-url-input {
		flex: 1; min-width: 0; padding: var(--space-1) var(--space-2);
		background: transparent; border: 1px solid transparent;
		border-radius: 4px; color: var(--text-muted); font-size: var(--text-2xs);
		font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis;
	}
	.sample-url-input:focus { border-color: var(--accent); background: var(--surface); color: var(--text); }

	.sample-controls { display: flex; gap: 2px; flex-shrink: 0; }

	.empty-samples {
		padding: var(--space-6); text-align: center;
		color: var(--text-muted); font-size: var(--text-sm);
		display: flex; flex-direction: column; gap: var(--space-1);
	}
	.empty-samples .hint { font-size: var(--text-2xs); }

	/* ─── Editor actions ─── */
	.editor-actions { display: flex; gap: var(--space-3); margin-top: var(--space-4); }

	/* ─── Crop modal ─── */
	.crop-modal {
		position: fixed; inset: 0; z-index: 1000;
		display: flex; align-items: center; justify-content: center;
		background: rgba(0,0,0,0.8); padding: var(--space-4);
	}
	.crop-modal-content {
		max-width: 640px; width: 100%;
		background: var(--surface); border-radius: var(--radius-lg);
		padding: var(--space-4); border: 1px solid var(--border);
	}

	/* ─── Filters ─── */
	.filters-bar {
		display: flex; align-items: center; gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.search-wrap { flex: 1; position: relative; }
	.search-icon {
		position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
		color: var(--text-muted); pointer-events: none; display: flex;
	}
	.search-input {
		width: 100%; padding: var(--space-2) var(--space-3) var(--space-2) 36px;
		background: var(--surface); border: 1px solid var(--border);
		border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); outline: none;
	}
	.search-input:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.search-clear {
		position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
		background: transparent; border: none; color: var(--text-muted); cursor: pointer;
		display: flex;
	}
	.filter-count {
		font-family: var(--font-mono); font-size: var(--text-2xs);
		color: var(--text-muted); white-space: nowrap;
	}
	.loading-msg { text-align: center; padding: var(--space-10); color: var(--text-muted); }

	/* ─── Kit list ─── */
	.kit-list {
		display: flex; flex-direction: column; gap: 1px;
		border: 1px solid var(--border); border-radius: var(--radius-md);
		overflow: hidden; background: var(--border);
	}
	.kit-row {
		display: flex; align-items: center; gap: var(--space-3);
		padding: var(--space-3); background: var(--surface);
	}
	.kit-row.inactive { opacity: 0.5; }
	.kit-thumb {
		width: 48px; height: 48px; border-radius: var(--radius-sm);
		overflow: hidden; background: var(--surface2); flex-shrink: 0;
		display: flex; align-items: center; justify-content: center;
	}
	.kit-thumb img { width: 100%; height: 100%; object-fit: cover; }
	.thumb-ph { font-size: 1.2rem; }
	.kit-info { flex: 1; min-width: 0; }
	.kit-name { font-size: var(--text-sm); font-weight: 600; color: var(--text); }
	.kit-meta {
		display: flex; gap: var(--space-3); margin-top: 2px;
		font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted);
		flex-wrap: wrap;
	}
	.genre-tag {
		padding: 1px 6px; background: rgba(var(--accent-rgb), 0.1);
		border-radius: 3px; color: var(--accent); font-weight: 600;
	}
	.inactive-tag {
		padding: 1px 6px; background: rgba(239,68,68,0.1);
		border-radius: 3px; color: #ef4444; font-weight: 600;
	}
	.kit-actions { display: flex; gap: var(--space-2); align-items: center; flex-shrink: 0; }

	/* ─── Mobile ─── */
	@media (max-width: 600px) {
		.editor-grid { grid-template-columns: 1fr; }
		.drive-form { flex-direction: column; }
		.drive-form input { min-width: 100%; }
		.sample-item { flex-wrap: wrap; }
		.sample-name-input { width: 100%; }
		.sample-url-input { width: 100%; }
		.kit-actions { flex-wrap: wrap; }
	}
</style>
