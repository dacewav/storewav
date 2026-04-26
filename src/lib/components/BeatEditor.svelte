<script lang="ts">
	import { Card, Badge, EmojiInput } from '$lib/components';
	import FileUpload from './FileUpload.svelte';
	import type { Beat } from '$lib/stores/beats';

	let {
		beat = $bindable(),
		beatId = 'temp',
		onSave,
		onDelete,
		saveStatus = $bindable('saved')
	}: {
		beat: Partial<Beat>;
		beatId?: string;
		onSave?: () => void;
		onDelete?: () => void;
		saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
	} = $props();

	let activeTab = $state('info');
	let deleteConfirm = $state(false);
	let tagInput = $state('');
	let tagInputEl: HTMLInputElement | undefined = $state();

	// Inline audio preview
	let previewAudioEl: HTMLAudioElement | undefined = $state();
	let previewPlaying = $state(false);
	let previewTime = $state(0);
	let previewDuration = $state(0);
	let previewProgress = $derived(previewDuration > 0 ? (previewTime / previewDuration) * 100 : 0);

	function togglePreview() {
		if (!previewAudioEl || !beat.audioUrl) return;
		if (previewPlaying) { previewAudioEl.pause(); } else { previewAudioEl.play(); }
		previewPlaying = !previewPlaying;
	}

	function seekPreview(e: MouseEvent) {
		if (!previewAudioEl || !previewDuration) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		previewAudioEl.currentTime = ((e.clientX - rect.left) / rect.width) * previewDuration;
	}

	function formatTime(s: number) {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	const GENRES = ['Trap', 'R&B', 'Drill', 'Corrido', 'Ambient', 'Pop', 'Hip-Hop', 'Reggaeton', 'Otro'];
	const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
		'Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'];

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			// Cancel pending auto-save to prevent double-save
			if (autoSaveTimer) { clearTimeout(autoSaveTimer); autoSaveTimer = null; }
			if (saveStatus !== 'saving') onSave?.();
		}
	}

	// Tags
	function addTag(tag: string) {
		const t = tag.trim();
		if (!t || (beat.tags ?? []).includes(t)) return;
		beat.tags = [...(beat.tags ?? []), t];
		tagInput = '';
	}

	function removeTag(tag: string) {
		beat.tags = (beat.tags ?? []).filter(t => t !== tag);
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag(tagInput);
		} else if (e.key === 'Backspace' && !tagInput && (beat.tags ?? []).length > 0) {
			beat.tags = beat.tags!.slice(0, -1);
		}
	}

	// Licenses — array format matching deployed rules
	function updateLicensePrice(index: number, field: 'priceMXN' | 'priceUSD', val: number) {
		if (!beat.licenses) beat.licenses = [];
		beat.licenses = beat.licenses.map((l, i) => i === index ? { ...l, [field]: val } : l);
	}

	function updateLicenseField(index: number, field: 'name' | 'description', val: string) {
		if (!beat.licenses) beat.licenses = [];
		beat.licenses = beat.licenses.map((l, i) => i === index ? { ...l, [field]: val } : l);
	}

	function addLicense() {
		beat.licenses = [...(beat.licenses ?? []), { name: '', description: '', priceMXN: 0, priceUSD: 0 }];
	}

	function removeLicense(index: number) {
		beat.licenses = (beat.licenses ?? []).filter((_, i) => i !== index);
	}

	function loadDefaultLics() {
		beat.licenses = [
			{ name: 'Basic', description: 'MP3 · 1 uso', priceMXN: 350, priceUSD: 20 },
			{ name: 'Premium', description: 'WAV · Sin tag', priceMXN: 750, priceUSD: 45 },
			{ name: 'Unlimited', description: 'WAV + Stems', priceMXN: 1500, priceUSD: 90 },
			{ name: 'Exclusive', description: 'Exclusivo total', priceMXN: 5000, priceUSD: 300 }
		];
	}

	// Delete confirm
	function handleDelete() { deleteConfirm = true; }
	function confirmDelete() { deleteConfirm = false; onDelete?.(); }
	function cancelDelete() { deleteConfirm = false; }

	// Validation
	let validationErrors = $derived.by(() => {
		const errs: string[] = [];
		if (!beat.name?.trim()) errs.push('Nombre es obligatorio');
		if (!beat.genre) errs.push('Género es obligatorio');
		if (beat.bpm && (beat.bpm < 40 || beat.bpm > 300)) errs.push('BPM debe estar entre 40 y 300');
		return errs;
	});
	let isValid = $derived(validationErrors.length === 0);
	let fieldErrors = $derived.by(() => ({
		name: !beat.name?.trim() ? 'Nombre requerido' : '',
		genre: !beat.genre ? 'Género requerido' : '',
		bpm: beat.bpm != null && beat.bpm !== 0 && (beat.bpm < 40 || beat.bpm > 300) ? '40-300' : ''
	}));

	// Auto-save with debounce (1s after last change)
	let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
	let mounted = $state(false);
	let saving = $state(false);

	// Skip initial reactive chain
	$effect(() => {
		const timer = setTimeout(() => { mounted = true; }, 500);
		return () => clearTimeout(timer);
	});

	// Track beat changes — only mark dirty AFTER user interaction (not on mount)
	let initialSnapshot = $state('');
	let userInteracted = $state(false);

	$effect(() => {
		// Capture initial snapshot after mount
		if (mounted && !initialSnapshot) {
			initialSnapshot = `${beat.name}|${beat.genre}|${beat.bpm}|${beat.key}|${beat.artist}|${beat.description}|${beat.active}|${beat.featured}|${beat.imageUrl}|${beat.audioUrl}|${beat.spotify}|${beat.youtube}|${beat.soundcloud}|${JSON.stringify(beat.licenses)}|${JSON.stringify(beat.tags)}|${JSON.stringify(beat.cardStyle)}`;
		}
	});

	// Watch for REAL changes (not mount)
	$effect(() => {
		const current = `${beat.name}|${beat.genre}|${beat.bpm}|${beat.key}|${beat.artist}|${beat.description}|${beat.active}|${beat.featured}|${beat.imageUrl}|${beat.audioUrl}|${beat.spotify}|${beat.youtube}|${beat.soundcloud}|${JSON.stringify(beat.licenses)}|${JSON.stringify(beat.tags)}|${JSON.stringify(beat.cardStyle)}`;
		if (mounted && initialSnapshot && current !== initialSnapshot && !userInteracted) {
			userInteracted = true;
		}
		if (userInteracted && mounted && saveStatus === 'saved') {
			saveStatus = 'unsaved';
		}
	});

	// Auto-save when status is unsaved (only after real user interaction)
	$effect(() => {
		const status = saveStatus;
		if (mounted && status === 'unsaved' && userInteracted && onSave && isValid && !saving) {
			if (autoSaveTimer) clearTimeout(autoSaveTimer);
			autoSaveTimer = setTimeout(() => {
				if (!saving) onSave?.();
			}, 1000);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="editor">
	<!-- Tabs -->
	<div class="tabs">
		<button class="tab" class:active={activeTab === 'info'} onclick={() => activeTab = 'info'}>
			<span class="tab-icon">📝</span> Info
		</button>
		<button class="tab" class:active={activeTab === 'lics'} onclick={() => activeTab = 'lics'}>
			<span class="tab-icon">📄</span> Licencias
		</button>
		<button class="tab" class:active={activeTab === 'media'} onclick={() => activeTab = 'media'}>
			<span class="tab-icon">🎵</span> Media
		</button>
		<button class="tab" class:active={activeTab === 'plat'} onclick={() => activeTab = 'plat'}>
			<span class="tab-icon">🔗</span> Plataformas
		</button>
		<button class="tab" class:active={activeTab === 'style'} onclick={() => activeTab = 'style'}>
			<span class="tab-icon">🎨</span> Card Style
		</button>
	</div>

	<!-- Save bar (sticky) -->
	<div class="save-bar">
		<div class="save-left">
			<!-- Auto-save indicator with animation -->
			<div class="save-indicator" class:saved={saveStatus === 'saved'} class:saving={saveStatus === 'saving'} class:error={saveStatus === 'error'} class:unsaved={saveStatus === 'unsaved'}>
				<span class="save-dot"></span>
				<span class="save-text">
					{saveStatus === 'saved' ? 'Guardado' : saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'error' ? 'Error' : 'Sin guardar'}
				</span>
			</div>
			{#if !isValid}
				<span class="validation-pill">
					⚠ {validationErrors.length} requerido{validationErrors.length > 1 ? 's' : ''}
				</span>
			{/if}
			<!-- Inline audio preview -->
			{#if beat.audioUrl}
				<div class="inline-preview" role="group" aria-label="Vista previa de audio">
					<button class="preview-play" onclick={togglePreview} aria-label={previewPlaying ? 'Pausar preview' : 'Reproducir preview'}>
						{previewPlaying ? '⏸' : '▶'}
					</button>
					<div class="preview-bar" role="slider" aria-label="Progreso" aria-valuenow={Math.round(previewProgress)} aria-valuemin={0} aria-valuemax={100} tabindex="0"
						onclick={seekPreview}
						onkeydown={(e) => {
							if (!previewAudioEl) return;
							if (e.key === 'ArrowRight') previewAudioEl.currentTime = Math.min(previewDuration, previewAudioEl.currentTime + 5);
							if (e.key === 'ArrowLeft') previewAudioEl.currentTime = Math.max(0, previewAudioEl.currentTime - 5);
						}}
					>
						<div class="preview-fill" style="width: {previewProgress}%"></div>
					</div>
					<span class="preview-time">{formatTime(previewTime)}</span>
					<audio
						bind:this={previewAudioEl}
						src={beat.audioUrl}
						ontimeupdate={() => previewTime = previewAudioEl?.currentTime ?? 0}
						onloadedmetadata={() => previewDuration = previewAudioEl?.duration ?? 0}
						onended={() => { previewPlaying = false; previewTime = 0; }}
					></audio>
				</div>
			{/if}
		</div>
		<div class="save-right">
			{#if onDelete}
				<button class="btn-delete" onclick={handleDelete}>🗑️ Borrar</button>
			{/if}
			{#if onSave}
				<button class="btn-save" class:disabled={!isValid || saveStatus === 'saving'} onclick={() => { if (autoSaveTimer) { clearTimeout(autoSaveTimer); autoSaveTimer = null; } if (saveStatus !== 'saving') onSave?.(); }} title={!isValid ? `Faltan: ${validationErrors.join(', ')}` : ''}>
					{saveStatus === 'saving' ? 'Guardando...' : 'Guardar'} <kbd>Ctrl+S</kbd>
				</button>
			{/if}
		</div>
	</div>

	<!-- ═══ Tab: Info ═══ -->
	{#if activeTab === 'info'}
		<Card>
			<h3 class="section-title">Información básica</h3>
			<div class="grid-2">
				<div class="field" class:required-empty={!beat.name?.trim()}>
					<label for="b-title">Nombre *</label>
					<input id="b-title" type="text" bind:value={beat.name} placeholder="Nombre del beat" />
					{#if fieldErrors.name}<span class="field-error">{fieldErrors.name}</span>{/if}
				</div>
				<div class="field">
					<label for="b-artist">Artista</label>
					<input id="b-artist" type="text" bind:value={beat.artist} placeholder="Productor / Artista" />
				</div>
				<div class="field" class:required-empty={!beat.genre}>
					<label for="b-genre">Género *</label>
					<select id="b-genre" bind:value={beat.genre}>
						<option value="">Seleccionar...</option>
						{#each GENRES as g}<option value={g}>{g}</option>{/each}
					</select>
					{#if fieldErrors.genre}<span class="field-error">{fieldErrors.genre}</span>{/if}
				</div>
				<div class="field">
					<label for="b-bpm">BPM</label>
					<input id="b-bpm" type="number" bind:value={beat.bpm} min="40" max="300" />
					{#if fieldErrors.bpm}<span class="field-error">{fieldErrors.bpm}</span>{/if}
				</div>
				<div class="field">
					<label for="b-key">Key</label>
					<select id="b-key" bind:value={beat.key}>
						{#each KEYS as k}<option value={k}>{k}</option>{/each}
					</select>
				</div>
			</div>

			<!-- Tags -->
			<div class="field">
				<label for="tag-input">Tags</label>
				<div class="tags-wrap" role="group" aria-label="Tags">
					{#each beat.tags ?? [] as tag}
						<span class="tag-chip">
							{tag}
							<button class="tag-remove" onclick={() => removeTag(tag)}>✕</button>
						</span>
					{/each}
					<input
						id="tag-input"
						class="tag-input"
						bind:this={tagInputEl}
						bind:value={tagInput}
						onkeydown={handleTagKeydown}
						onblur={() => addTag(tagInput)}
						placeholder={(beat.tags ?? []).length === 0 ? 'Escribe y Enter para añadir...' : '+ tag'}
					/>
				</div>
			</div>

			<div class="field">
				<label for="b-desc">Descripción</label>
				<EmojiInput
					bind:value={beat.description}
					placeholder="Descripción del beat... (usa :emoji_name: para emojis)"
					rows={3}
					multiline={true}
				/>
			</div>

			<div class="field">
				<label class="toggle-label">
					<input type="checkbox" bind:checked={beat.active} />
					<span class="toggle-text">Beat activo <span class="toggle-hint">(visible en la tienda)</span></span>
				</label>
			</div>
		</Card>
	{/if}

	<!-- ═══ Tab: Licencias ═══ -->
	{#if activeTab === 'lics'}
		<Card>
			<div class="section-header">
				<h3 class="section-title">Licencias y precios</h3>
				<div class="lic-actions">
					<button class="btn-ghost" onclick={loadDefaultLics}>↓ Cargar defaults</button>
					<button class="btn-ghost" onclick={addLicense}>+ Agregar</button>
				</div>
			</div>
			<div class="lic-grid">
				{#each (beat.licenses ?? []) as lic, i}
					<div class="lic-row">
						<div class="lic-header">
							<span class="lic-key">Licencia #{i + 1}</span>
							<button class="btn-lic-remove" onclick={() => removeLicense(i)}>✕</button>
						</div>
						<div class="grid-2">
							<div class="field">
								<label for="lic-name-{i}">Nombre</label>
								<input id="lic-name-{i}" type="text" value={lic.name} oninput={(e) => updateLicenseField(i, 'name', e.currentTarget.value)} placeholder="Basic" />
							</div>
							<div class="field">
								<label for="lic-desc-{i}">Descripción</label>
								<input id="lic-desc-{i}" type="text" value={lic.description ?? ''} oninput={(e) => updateLicenseField(i, 'description', e.currentTarget.value)} placeholder="MP3 · 1 uso" />
							</div>
							<div class="field">
								<label for="lic-mxn-{i}">Precio MXN</label>
								<input id="lic-mxn-{i}" type="number" value={lic.priceMXN} oninput={(e) => updateLicensePrice(i, 'priceMXN', +e.currentTarget.value)} min="0" />
							</div>
							<div class="field">
								<label for="lic-usd-{i}">Precio USD</label>
								<input id="lic-usd-{i}" type="number" value={lic.priceUSD} oninput={(e) => updateLicensePrice(i, 'priceUSD', +e.currentTarget.value)} min="0" />
							</div>
						</div>
					</div>
				{/each}
				{#if (beat.licenses ?? []).length === 0}
					<p class="empty-lics">Sin licencias. Carga defaults o agrega una.</p>
				{/if}
			</div>
		</Card>
	{/if}

	<!-- ═══ Tab: Media ═══ -->
	{#if activeTab === 'media'}
		<Card>
			<h3 class="section-title">Archivos multimedia</h3>

			<div class="media-grid">
				<!-- Cover image -->
				<div class="media-item">
					<div class="media-label">🖼️ Cover</div>
					<FileUpload
						bind:value={beat.imageUrl}
						folder="beats/covers"
						{beatId}
						accept="image/*"
						type="image"
						label="Cover · JPG, PNG, WebP"
					/>
				</div>

				<!-- Audio file -->
				<div class="media-item">
					<div class="media-label">🎵 Audio</div>
					<FileUpload
						bind:value={beat.audioUrl}
						folder="beats/audio"
						{beatId}
						accept="audio/*"
						type="audio"
						maxSizeMB={100}
						label="Audio · MP3, WAV, OGG · máx 100MB"
					/>
				</div>

				<!-- Preview MP3 -->
				<div class="media-item">
					<div class="media-label">🔊 Preview</div>
					<FileUpload
						bind:value={beat.previewUrl}
						folder="beats/previews"
						{beatId}
						accept="audio/*"
						type="audio"
						maxSizeMB={20}
						label="Preview · MP3 (30s tag) · máx 20MB"
					/>
				</div>
			</div>

			<p class="media-note">O puedes pegar URLs directamente:</p>
			<div class="grid-2">
				<div class="field">
					<label for="b-cover-url">Cover URL</label>
					<input id="b-cover-url" type="url" bind:value={beat.imageUrl} placeholder="https://..." />
				</div>
				<div class="field">
					<label for="b-audio-url">Audio URL</label>
					<input id="b-audio-url" type="url" bind:value={beat.audioUrl} placeholder="https://..." />
				</div>
			</div>
		</Card>
	{/if}

	<!-- ═══ Tab: Plataformas ═══ -->
	{#if activeTab === 'plat'}
		<Card>
			<h3 class="section-title">Enlaces a plataformas</h3>
			<div class="field">
				<label for="b-spotify" class="plat-label" style="--plat-color: #1db954">🎵 Spotify</label>
				<input id="b-spotify" type="url" bind:value={beat.spotify} placeholder="https://open.spotify.com/..." />
			</div>
			<div class="field">
				<label for="b-youtube" class="plat-label" style="--plat-color: #ff0000">▶ YouTube</label>
				<input id="b-youtube" type="url" bind:value={beat.youtube} placeholder="https://youtube.com/..." />
			</div>
			<div class="field">
				<label for="b-soundcloud" class="plat-label" style="--plat-color: #ff5500">☁ SoundCloud</label>
				<input id="b-soundcloud" type="url" bind:value={beat.soundcloud} placeholder="https://soundcloud.com/..." />
			</div>
		</Card>
	{/if}

	<!-- ═══ Tab: Card Style ═══ -->
	{#if activeTab === 'style'}
		<Card>
			<h3 class="section-title">Estilo de tarjeta</h3>
			<p class="field-desc">Overrides por encima del estilo global. Dejar en "(usar global)" para no sobreescribir.</p>
			{#await import('$lib/components/CardStyleEditor.svelte') then { default: CardStyleEditor }}
				<CardStyleEditor
					bind:value={beat.cardStyle}
					mode="per-beat"
					accentRgb="220, 38, 38"
				/>
			{/await}
		</Card>
	{/if}
</div>

<!-- Delete confirm modal -->
{#if deleteConfirm}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions — modal overlay backdrop -->
	<div class="modal-overlay" onclick={cancelDelete} onkeydown={(e) => e.key === 'Escape' && cancelDelete()} role="alertdialog" aria-modal="true" aria-label="Confirmar borrado" tabindex="-1">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="document">
			<div class="modal-icon">🗑️</div>
			<h3 class="modal-title">¿Borrar este beat?</h3>
			<p class="modal-text">"{beat.name || 'Sin nombre'}" se eliminará permanentemente. Esta acción no se puede deshacer.</p>
			<div class="modal-actions">
				<button class="btn-cancel" onclick={cancelDelete}>Cancelar</button>
				<button class="btn-confirm-delete" onclick={confirmDelete}>Sí, borrar</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.editor { display: flex; flex-direction: column; gap: var(--space-4); }

	/* Tabs */
	.tabs {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-2);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.tab {
		padding: var(--space-2) var(--space-3);
		min-height: var(--touch-min);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-md) var(--radius-md) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.tab:hover { color: var(--text); background: var(--surface-hover); }
	.tab.active { color: var(--accent); background: rgba(var(--accent-rgb), 0.08); border-color: var(--border); border-bottom-color: transparent; }
	.tab-icon { font-size: var(--text-xs); }

	/* Save bar */
	.save-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) 0;
		position: sticky;
		top: 52px;
		z-index: 10;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		margin-bottom: var(--space-2);
		gap: var(--space-3);
	}

	.save-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
		flex-wrap: wrap;
	}
	.save-right { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }

	/* Save indicator — animated dot */
	.save-indicator {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		border: 1px solid var(--border);
		background: var(--surface);
		transition: all var(--duration-fast);
	}

	.save-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-muted);
		transition: background var(--duration-fast);
	}

	.save-indicator.saved { border-color: rgba(var(--accent-rgb), 0.3); background: rgba(var(--accent-rgb), 0.06); }
	.save-indicator.saved .save-dot { background: #22c55e; }
	.save-indicator.saved .save-text { color: #22c55e; }

	.save-indicator.saving { border-color: rgba(var(--accent-rgb), 0.3); background: rgba(var(--accent-rgb), 0.06); }
	.save-indicator.saving .save-dot { background: var(--accent); animation: pulse-dot 0.8s ease-in-out infinite; }
	.save-indicator.saving .save-text { color: var(--accent); }

	.save-indicator.error { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.06); }
	.save-indicator.error .save-dot { background: #ef4444; }
	.save-indicator.error .save-text { color: #ef4444; }

	.save-indicator.unsaved { border-color: rgba(234, 179, 8, 0.3); background: rgba(234, 179, 8, 0.06); }
	.save-indicator.unsaved .save-dot { background: #eab308; }
	.save-indicator.unsaved .save-text { color: #eab308; }

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.4; transform: scale(0.7); }
	}

	/* Validation pill */
	.validation-pill {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 3px 10px;
		border-radius: var(--radius-full);
		border: 1px solid rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.06);
		color: #ef4444;
		white-space: nowrap;
		animation: fadeIn 0.2s var(--ease-out);
	}

	/* Inline audio preview */
	.inline-preview {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 4px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		flex-shrink: 0;
	}

	.preview-play {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: none;
		background: var(--accent);
		color: var(--bg);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		flex-shrink: 0;
		transition: all var(--duration-fast);
	}

	.preview-play:hover { opacity: 0.85; transform: scale(1.05); }

	.preview-bar {
		width: 80px;
		height: 4px;
		background: var(--border);
		border-radius: 2px;
		cursor: pointer;
		overflow: hidden;
		flex-shrink: 0;
	}

	.preview-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 2px;
		transition: width 0.1s linear;
	}

	.preview-time {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		min-width: 28px;
	}

	.btn-save {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-5);
		min-height: var(--touch-min);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-save:hover:not(.disabled) { opacity: 0.9; transform: translateY(-1px); }
	.btn-save.disabled { opacity: 0.4; cursor: not-allowed; }
	.btn-save kbd { font-family: var(--font-mono); font-size: var(--text-2xs); padding: 1px 5px; border-radius: 3px; background: rgba(0,0,0,0.2); color: inherit; opacity: 0.7; }

	.btn-delete {
		padding: var(--space-2) var(--space-3);
		min-height: var(--touch-min);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-delete:hover { color: var(--danger); border-color: var(--danger); background: var(--danger-glow); }

	/* Section */
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
	.section-header .section-title { margin-bottom: 0; }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); }

	/* Fields */
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
	.field.required-empty input,
	.field.required-empty select { border-color: var(--danger); }
	.field.required-empty label { color: var(--danger); }

	.field-error {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: #ef4444;
		margin-top: 2px;
		animation: fadeIn 0.15s var(--ease-out);
	}

	.field input[type="text"],
	.field input[type="number"],
	.field input[type="url"],
	.field select,
	.field textarea {
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
		font-family: inherit;
	}

	.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }

	.toggle-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
	.toggle-text { font-size: var(--text-sm); color: var(--text); text-transform: none; letter-spacing: 0; }
	.toggle-hint { color: var(--text-muted); font-size: var(--text-xs); }

	.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }

	/* Tags */
	.tags-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		padding: var(--space-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		min-height: var(--touch-min);
		align-items: center;
		cursor: text;
		transition: border-color var(--duration-fast);
	}

	.tags-wrap:focus-within { border-color: rgba(var(--accent-rgb), 0.5); }

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.25);
		color: var(--accent);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		white-space: nowrap;
	}

	.tag-remove {
		display: flex; align-items: center; justify-content: center;
		width: 14px; height: 14px; border-radius: 50%;
		border: none; background: transparent; color: var(--accent);
		cursor: pointer; font-size: var(--text-2xs); padding: 0; opacity: 0.6;
		transition: opacity var(--duration-fast);
	}

	.tag-remove:hover { opacity: 1; background: rgba(var(--accent-rgb), 0.2); }

	.tag-input {
		flex: 1; min-width: 80px; border: none; background: transparent;
		color: var(--text); font-size: var(--text-sm); outline: none; padding: 2px 0;
	}

	/* Licenses */
	.lic-grid { display: flex; flex-direction: column; gap: var(--space-3); }
	.lic-row { padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
	.lic-header { margin-bottom: var(--space-2); }
	.lic-key { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }

	/* Media */
	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.media-item { display: flex; flex-direction: column; gap: var(--space-2); }
	.media-label { font-size: var(--text-sm); font-weight: 600; color: var(--text); }

	.media-note {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-bottom: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--border);
	}

	/* Platforms */
	.plat-label { color: var(--plat-color) !important; }

	/* Buttons */
	.btn-ghost {
		padding: var(--space-1) var(--space-3);
		min-height: var(--touch-min);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-ghost:hover { background: var(--surface-hover); color: var(--text); }

	/* Delete modal */
	.modal-overlay {
		position: fixed; inset: 0; z-index: var(--z-modal);
		background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
		display: flex; align-items: center; justify-content: center;
		animation: fadeIn 0.2s var(--ease-out);
	}

	.modal-box {
		background: var(--bg-secondary); border: 1px solid var(--border);
		border-radius: var(--radius-lg); padding: var(--space-6);
		max-width: 400px; width: 90%; text-align: center;
		animation: scaleIn 0.25s var(--ease-out);
	}

	.modal-icon { font-size: var(--text-4xl); margin-bottom: var(--space-3); }
	.modal-title { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; color: var(--text); margin-bottom: var(--space-2); }
	.modal-text { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-5); }
	.modal-actions { display: flex; gap: var(--space-3); justify-content: center; }

	.btn-cancel {
		padding: var(--space-2) var(--space-5); min-height: var(--touch-min);
		background: transparent; border: 1px solid var(--border);
		border-radius: var(--radius-md); color: var(--text-secondary);
		font-size: var(--text-sm); cursor: pointer; transition: all var(--duration-fast);
	}

	.btn-cancel:hover { background: var(--surface-hover); color: var(--text); }

	.btn-confirm-delete {
		padding: var(--space-2) var(--space-5); min-height: var(--touch-min);
		background: var(--danger); color: white; border: none;
		border-radius: var(--radius-md); font-size: var(--text-sm);
		font-weight: 600; cursor: pointer; transition: all var(--duration-fast);
	}

	.btn-confirm-delete:hover { opacity: 0.9; }

	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
	@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	@media (max-width: 768px) {
		.grid-2 { grid-template-columns: 1fr; }
		.save-bar { flex-direction: column; gap: var(--space-2); align-items: stretch; }
		.save-right { justify-content: flex-end; }
		.media-grid { grid-template-columns: 1fr; }
	}
</style>
