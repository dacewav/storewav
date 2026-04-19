<script lang="ts">
	import { Card, Badge } from '$lib/components';
	import type { Beat, LicenseNames, Platforms } from '$lib/stores/beats';

	let {
		beat = $bindable(),
		onSave,
		saveStatus = 'saved'
	}: {
		beat: Partial<Beat>;
		onSave?: () => void;
		saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
	} = $props();

	let activeTab = $state('info');

	const GENRES = ['Trap', 'R&B', 'Drill', 'Corrido', 'Ambient', 'Pop', 'Hip-Hop', 'Reggaeton', 'Otro'];
	const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
		'Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'];

	let tagsStr = $derived((beat.tags ?? []).join(', '));

	function updateTags(val: string) {
		beat.tags = val.split(',').map(t => t.trim()).filter(Boolean);
	}

	function updatePlatform(key: keyof Platforms, val: string) {
		if (!beat.platforms) beat.platforms = {};
		beat.platforms[key] = val;
	}

	function updateLicense(key: string, val: number) {
		if (!beat.licenses) beat.licenses = { basic: 0, premium: 0, unlimited: 0, exclusive: 0 };
		(beat.licenses as Record<string, number>)[key] = val;
	}

	function updateLicenseName(key: string, val: string) {
		if (!beat.licenseNames) beat.licenseNames = {};
		(beat.licenseNames as Record<string, string>)[key] = val;
	}

	function updateLicenseDesc(key: string, val: string) {
		if (!beat.licenseDescs) beat.licenseDescs = {};
		(beat.licenseDescs as Record<string, string>)[key] = val;
	}

	const LICENSE_KEYS = ['basic', 'premium', 'unlimited', 'exclusive'] as const;
</script>

<div class="editor">
	<!-- Tabs -->
	<div class="tabs">
		<button class="tab" class:active={activeTab === 'info'} onclick={() => activeTab = 'info'}>Info</button>
		<button class="tab" class:active={activeTab === 'lics'} onclick={() => activeTab = 'lics'}>Licencias</button>
		<button class="tab" class:active={activeTab === 'media'} onclick={() => activeTab = 'media'}>Media</button>
		<button class="tab" class:active={activeTab === 'plat'} onclick={() => activeTab = 'plat'}>Plataformas</button>
		<button class="tab" class:active={activeTab === 'style'} onclick={() => activeTab = 'style'}>Card Style</button>
	</div>

	<!-- Save bar -->
	<div class="save-bar">
		<Badge variant={saveStatus === 'saved' ? 'accent' : saveStatus === 'saving' ? 'warning' : saveStatus === 'error' ? 'danger' : 'muted'}>
			{saveStatus === 'saved' ? '✓ Guardado' : saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'error' ? 'Error' : 'Sin guardar'}
		</Badge>
		{#if onSave}
			<button class="btn-save" onclick={onSave}>Guardar</button>
		{/if}
	</div>

	<!-- Tab: Info -->
	{#if activeTab === 'info'}
		<Card>
			<h3 class="section-title">Información básica</h3>
			<div class="grid-2">
				<div class="field">
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
				<div class="field">
					<label for="b-tags">Tags (separados por coma)</label>
					<input id="b-tags" type="text" value={tagsStr} oninput={(e) => updateTags(e.currentTarget.value)} placeholder="Trap, Dark, Cinematic" />
				</div>
			</div>
			<div class="field">
				<label for="b-desc">Descripción</label>
				<textarea id="b-desc" bind:value={beat.description} placeholder="Descripción del beat..." rows="3"></textarea>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" bind:checked={beat.active} />
					Beat activo (visible en la tienda)
				</label>
			</div>
		</Card>
	{/if}

	<!-- Tab: Licencias -->
	{#if activeTab === 'lics'}
		<Card>
			<h3 class="section-title">Licencias y precios</h3>
			<div class="lic-grid">
				{#each LICENSE_KEYS as lk}
					<div class="lic-row">
						<div class="lic-header">
							<span class="lic-key">{lk}</span>
						</div>
						<div class="grid-3">
							<div class="field">
								<label for="lic-name-{lk}">Nombre</label>
								<input id="lic-name-{lk}" type="text" value={beat.licenseNames?.[lk] ?? ''} oninput={(e) => updateLicenseName(lk, e.currentTarget.value)} placeholder={lk.charAt(0).toUpperCase() + lk.slice(1)} />
							</div>
							<div class="field">
								<label for="lic-price-{lk}">Precio (MXN)</label>
								<input id="lic-price-{lk}" type="number" value={beat.licenses?.[lk] ?? 0} oninput={(e) => updateLicense(lk, +e.currentTarget.value)} min="0" />
							</div>
							<div class="field">
								<label for="lic-desc-{lk}">Descripción</label>
								<input id="lic-desc-{lk}" type="text" value={beat.licenseDescs?.[lk] ?? ''} oninput={(e) => updateLicenseDesc(lk, e.currentTarget.value)} placeholder="MP3 · 1 uso" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	{/if}

	<!-- Tab: Media -->
	{#if activeTab === 'media'}
		<Card>
			<h3 class="section-title">Archivos multimedia</h3>
			<p class="field-desc">Por ahora ingresa URLs directas. El upload de archivos llega en el Bloque 6.</p>
			<div class="field">
				<label for="b-cover">Cover URL (imagen)</label>
				<input id="b-cover" type="url" bind:value={beat.coverUrl} placeholder="https://..." />
				{#if beat.coverUrl}
					<img class="preview-img" src={beat.coverUrl} alt="Cover preview" />
				{/if}
			</div>
			<div class="field">
				<label for="b-audio">Audio URL (WAV/MP3)</label>
				<input id="b-audio" type="url" bind:value={beat.audioUrl} placeholder="https://..." />
			</div>
			<div class="field">
				<label for="b-preview">Preview URL (MP3, opcional)</label>
				<input id="b-preview" type="url" bind:value={beat.previewUrl} placeholder="https://..." />
			</div>
		</Card>
	{/if}

	<!-- Tab: Plataformas -->
	{#if activeTab === 'plat'}
		<Card>
			<h3 class="section-title">Enlaces a plataformas</h3>
			<div class="field">
				<label for="b-spotify" style="color: #1db954">🎵 Spotify</label>
				<input id="b-spotify" type="url" value={beat.platforms?.spotify ?? ''} oninput={(e) => updatePlatform('spotify', e.currentTarget.value)} placeholder="https://open.spotify.com/..." />
			</div>
			<div class="field">
				<label for="b-youtube" style="color: #ff0000">▶ YouTube</label>
				<input id="b-youtube" type="url" value={beat.platforms?.youtube ?? ''} oninput={(e) => updatePlatform('youtube', e.currentTarget.value)} placeholder="https://youtube.com/..." />
			</div>
			<div class="field">
				<label for="b-soundcloud" style="color: #ff5500">☁ SoundCloud</label>
				<input id="b-soundcloud" type="url" value={beat.platforms?.soundCloud ?? ''} oninput={(e) => updatePlatform('soundCloud', e.currentTarget.value)} placeholder="https://soundcloud.com/..." />
			</div>
		</Card>
	{/if}

	<!-- Tab: Card Style -->
	{#if activeTab === 'style'}
		<Card>
			<h3 class="section-title">Estilo de tarjeta (override)</h3>
			<p class="field-desc">Overrides por encima del estilo global de tarjeta. Dejar vacío para usar el global.</p>
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

<style>
	.editor { display: flex; flex-direction: column; gap: var(--space-4); }

	.tabs {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-2);
		overflow-x: auto;
	}

	.tab {
		padding: var(--space-2) var(--space-4);
		min-height: var(--touch-min);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-md) var(--radius-md) 0 0;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
		white-space: nowrap;
	}

	.tab:hover { color: var(--text); background: var(--surface-hover); }
	.tab.active { color: var(--accent); background: rgba(var(--accent-rgb), 0.08); border-color: var(--border); border-bottom-color: transparent; }

	.save-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2) 0;
	}

	.btn-save {
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

	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); }

	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }

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
		transition: border-color 0.2s;
		font-family: inherit;
	}

	.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }

	.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
	.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3); }

	.lic-grid { display: flex; flex-direction: column; gap: var(--space-4); }
	.lic-row { padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
	.lic-header { margin-bottom: var(--space-2); }
	.lic-key { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }

	.preview-img {
		width: 100%;
		max-width: 200px;
		height: auto;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		margin-top: var(--space-2);
		object-fit: cover;
	}

	@media (max-width: 768px) {
		.grid-2, .grid-3 { grid-template-columns: 1fr; }
	}
</style>
