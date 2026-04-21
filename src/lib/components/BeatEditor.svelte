<script lang="ts">
	import { Card, Badge } from '$lib/components';
	import FileUpload from './FileUpload.svelte';
	import type { Beat, Platforms } from '$lib/stores/beats';

	let {
		beat = $bindable(),
		beatId = 'temp',
		onSave,
		onDelete,
		saveStatus = 'saved'
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

	const GENRES = ['Trap', 'R&B', 'Drill', 'Corrido', 'Ambient', 'Pop', 'Hip-Hop', 'Reggaeton', 'Otro'];
	const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
		'Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'];
	const LICENSE_KEYS = ['basic', 'premium', 'unlimited', 'exclusive'] as const;

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			onSave?.();
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

	// Platforms
	function updatePlatform(key: keyof Platforms, val: string) {
		if (!beat.platforms) beat.platforms = {};
		beat.platforms[key] = val;
	}

	// Licenses
	function updateLicense(key: string, val: number) {
		if (!beat.licenses) beat.licenses = { basic: 0, premium: 0, unlimited: 0, exclusive: 0 };
		(beat.licenses as Record<string, number>)[key] = val;
	}

	function updateLicenseField(key: string, field: 'name' | 'desc', val: string) {
		if (field === 'name') {
			if (!beat.licenseNames) beat.licenseNames = {};
			(beat.licenseNames as Record<string, string>)[key] = val;
		} else {
			if (!beat.licenseDescs) beat.licenseDescs = {};
			(beat.licenseDescs as Record<string, string>)[key] = val;
		}
	}

	function loadDefaultLics() {
		beat.licenseNames = { basic: 'Basic', premium: 'Premium', unlimited: 'Unlimited', exclusive: 'Exclusive' };
		beat.licenseDescs = { basic: 'MP3 · 1 uso', premium: 'WAV · Sin tag', unlimited: 'WAV + Stems', exclusive: 'Exclusivo total' };
	}

	// Delete confirm
	function handleDelete() { deleteConfirm = true; }
	function confirmDelete() { deleteConfirm = false; onDelete?.(); }
	function cancelDelete() { deleteConfirm = false; }

	// Auto-save with debounce (1s after last change)
	let autoSaveTimer: ReturnType<typeof setTimeout> | null = $state(null);
	let lastSaved = $state(Date.now());

	$effect(() => {
		// Track beat changes to trigger auto-save
		const _ = JSON.stringify(beat);
		if (saveStatus === 'unsaved' && onSave) {
			if (autoSaveTimer) clearTimeout(autoSaveTimer);
			autoSaveTimer = setTimeout(() => {
				onSave?.();
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
			<Badge variant={saveStatus === 'saved' ? 'accent' : saveStatus === 'saving' ? 'warning' : saveStatus === 'error' ? 'danger' : 'muted'}>
				{saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'error' ? 'Error al guardar' : '● Sin guardar'}
			</Badge>
		</div>
		<div class="save-right">
			{#if onDelete}
				<button class="btn-delete" onclick={handleDelete}>🗑️ Borrar</button>
			{/if}
			{#if onSave}
				<button class="btn-save" onclick={onSave}>
					Guardar <kbd>Ctrl+S</kbd>
				</button>
			{/if}
		</div>
	</div>

	<!-- ═══ Tab: Info ═══ -->
	{#if activeTab === 'info'}
		<Card>
			<h3 class="section-title">Información básica</h3>
			<div class="grid-2">
				<div class="field" class:required-empty={!beat.title?.trim()}>
					<label for="b-title">Título *</label>
					<input id="b-title" type="text" bind:value={beat.title} placeholder="Nombre del beat" />
				</div>
				<div class="field">
					<label for="b-artist">Artista</label>
					<input id="b-artist" type="text" bind:value={beat.artist} placeholder="Productor / Artista" />
				</div>
				<div class="field">
					<label for="b-genre">Género *</label>
					<select id="b-genre" bind:value={beat.genre}>
						{#each GENRES as g}<option value={g}>{g}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label for="b-bpm">BPM</label>
					<input id="b-bpm" type="number" bind:value={beat.bpm} min="40" max="300" />
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
				<textarea id="b-desc" bind:value={beat.description} placeholder="Descripción del beat..." rows="3"></textarea>
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
				<button class="btn-ghost" onclick={loadDefaultLics}>↓ Cargar defaults</button>
			</div>
			<div class="lic-grid">
				{#each LICENSE_KEYS as lk}
					<div class="lic-row">
						<div class="lic-header">
							<span class="lic-key">{lk}</span>
						</div>
						<div class="grid-3">
							<div class="field">
								<label for="lic-name-{lk}">Nombre</label>
								<input id="lic-name-{lk}" type="text" value={beat.licenseNames?.[lk] ?? ''} oninput={(e) => updateLicenseField(lk, 'name', e.currentTarget.value)} placeholder={lk.charAt(0).toUpperCase() + lk.slice(1)} />
							</div>
							<div class="field">
								<label for="lic-price-{lk}">Precio (MXN)</label>
								<input id="lic-price-{lk}" type="number" value={beat.licenses?.[lk] ?? 0} oninput={(e) => updateLicense(lk, +e.currentTarget.value)} min="0" />
							</div>
							<div class="field">
								<label for="lic-desc-{lk}">Descripción</label>
								<input id="lic-desc-{lk}" type="text" value={beat.licenseDescs?.[lk] ?? ''} oninput={(e) => updateLicenseField(lk, 'desc', e.currentTarget.value)} placeholder="MP3 · 1 uso" />
							</div>
						</div>
					</div>
				{/each}
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
						bind:value={beat.coverUrl}
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
						label="Audio · MP3, WAV, OGG"
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
						label="Preview · MP3 (30s tag)"
					/>
				</div>
			</div>

			<p class="media-note">O puedes pegar URLs directamente:</p>
			<div class="grid-2">
				<div class="field">
					<label for="b-cover-url">Cover URL</label>
					<input id="b-cover-url" type="url" bind:value={beat.coverUrl} placeholder="https://..." />
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
				<input id="b-spotify" type="url" value={beat.platforms?.spotify ?? ''} oninput={(e) => updatePlatform('spotify', e.currentTarget.value)} placeholder="https://open.spotify.com/..." />
			</div>
			<div class="field">
				<label for="b-youtube" class="plat-label" style="--plat-color: #ff0000">▶ YouTube</label>
				<input id="b-youtube" type="url" value={beat.platforms?.youtube ?? ''} oninput={(e) => updatePlatform('youtube', e.currentTarget.value)} placeholder="https://youtube.com/..." />
			</div>
			<div class="field">
				<label for="b-soundcloud" class="plat-label" style="--plat-color: #ff5500">☁ SoundCloud</label>
				<input id="b-soundcloud" type="url" value={beat.platforms?.soundCloud ?? ''} oninput={(e) => updatePlatform('soundCloud', e.currentTarget.value)} placeholder="https://soundcloud.com/..." />
			</div>
		</Card>
	{/if}

	<!-- ═══ Tab: Card Style ═══ -->
	{#if activeTab === 'style'}
		<Card>
			<h3 class="section-title">Estilo de tarjeta</h3>
			<p class="field-desc">Overrides por encima del estilo global. Dejar en "(usar global)" para no sobreescribir.</p>
			<div class="grid-2">
				<div class="field">
					<label for="b-glow">Glow</label>
					<select id="b-glow" value={beat.cardStyle?.glow ?? ''} onchange={(e) => { if (!beat.cardStyle) beat.cardStyle = {}; beat.cardStyle.glow = e.currentTarget.value || undefined; }}>
						<option value="">(usar global)</option>
						<option value="none">Ninguno</option>
						<option value="soft">Soft</option>
						<option value="strong">Strong</option>
						<option value="neon">Neon</option>
						<option value="custom">Custom</option>
					</select>
				</div>
				<div class="field">
					<label for="b-anim">Animación</label>
					<select id="b-anim" value={beat.cardStyle?.animation ?? ''} onchange={(e) => { if (!beat.cardStyle) beat.cardStyle = {}; beat.cardStyle.animation = e.currentTarget.value || undefined; }}>
						<option value="">(usar global)</option>
						<option value="none">Ninguna</option>
						<option value="float">Float</option>
						<option value="hologram">Hologram</option>
						<option value="glitch">Glitch</option>
						<option value="shimmer">Shimmer</option>
						<option value="borderGlow">Border Glow</option>
					</select>
				</div>
				<div class="field">
					<label>
						<input type="checkbox" checked={beat.cardStyle?.shimmer === true} onchange={(e) => { if (!beat.cardStyle) beat.cardStyle = {}; beat.cardStyle.shimmer = e.currentTarget.checked || undefined; }} />
						Shimmer overlay
					</label>
				</div>
			</div>
		</Card>
	{/if}
</div>

<!-- Delete confirm modal -->
{#if deleteConfirm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={cancelDelete}>
		<div class="modal-box" onclick={(e) => e.stopPropagation()}>
			<div class="modal-icon">🗑️</div>
			<h3 class="modal-title">¿Borrar este beat?</h3>
			<p class="modal-text">"{beat.title || 'Sin título'}" se eliminará permanentemente. Esta acción no se puede deshacer.</p>
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
	}

	.save-left { display: flex; align-items: center; gap: var(--space-2); }
	.save-right { display: flex; align-items: center; gap: var(--space-2); }

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

	.btn-save:hover { opacity: 0.9; transform: translateY(-1px); }
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
	.field.required-empty input { border-color: var(--danger); }
	.field.required-empty label { color: var(--danger); }

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
	.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3); }

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
		.grid-2, .grid-3 { grid-template-columns: 1fr; }
		.save-bar { flex-direction: column; gap: var(--space-2); align-items: stretch; }
		.save-right { justify-content: flex-end; }
		.media-grid { grid-template-columns: 1fr; }
	}
</style>
