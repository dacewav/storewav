<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, FileUpload, ImageCropper, FontPreview, HelpTip , Collapsible} from '$lib/components';
	import type { BrandSettings, LoaderSettings, ThemeSettings } from '$lib/stores/settings';
	import { generatePalette, generateHarmony, contrastRatio, type PaletteShade } from '$lib/colorPalette';
	import { uploadFile } from '$lib/upload';
	import { toast } from '$lib/toastStore';

	let s = $derived($settings.data);
	let brand = $derived((s?.brand ?? {}) as BrandSettings);
	let loader = $derived((s?.loader ?? {}) as LoaderSettings);
	let theme = $derived((s?.theme ?? {}) as ThemeSettings);

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}

	// ── E1: Logo Crop ──
	let showCropper = $state(false);
	let cropSrc = $state('');
	let cropping = $state(false);

	function handleLogoUpload(url: string) {
		// When FileUpload completes, open cropper with that URL
		cropSrc = url;
		showCropper = true;
	}

	async function handleCrop(blob: Blob, dataUrl: string) {
		cropping = true;
		try {
			// Upload original cropped logo
			const logoPath = `brand/logo-${Date.now()}.png`;
			const file = new File([blob], 'logo.png', { type: 'image/png' });
			const { url } = await uploadFile(logoPath, file);
			update('brand.logo', url);

			// Generate favicon (32×32)
			const favBlob = await resizeBlob(blob, 32, 32);
			const favFile = new File([favBlob], 'favicon.png', { type: 'image/png' });
			const { url: favUrl } = await uploadFile(`brand/favicon-${Date.now()}.png`, favFile);
			update('brand.favicon', favUrl);

			// Generate OG image (1200×630)
			const ogBlob = await resizeBlob(blob, 1200, 630);
			const ogFile = new File([ogBlob], 'og.png', { type: 'image/png' });
			const { url: ogUrl } = await uploadFile(`brand/og-${Date.now()}.png`, ogFile);
			// OG image goes to meta — store in brand for now
			update('brand.ogImage', ogUrl);

			toast.success('Logo + favicon + OG generados ✓');
			showCropper = false;
		} catch (err) {
			toast.error('Error al subir: ' + (err as Error).message);
		} finally {
			cropping = false;
		}
	}

	async function resizeBlob(blob: Blob, w: number, h: number): Promise<Blob> {
		const url = URL.createObjectURL(blob);
		const img = new Image();
		await new Promise<void>((res, rej) => {
			img.onload = () => res();
			img.onerror = rej;
			img.src = url;
		});
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d')!;
		// Fit inside dimensions, centered
		const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
		const dw = img.naturalWidth * scale;
		const dh = img.naturalHeight * scale;
		ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
		URL.revokeObjectURL(url);
		return new Promise<Blob>((resolve) =>
			canvas.toBlob((b) => resolve(b!), 'image/png')
		);
	}

	// ── E2: Palette ──
	let palette = $derived(
		theme.accent ? generatePalette(theme.accent) : []
	);
	let harmony = $derived(
		theme.accent ? generateHarmony(theme.accent) : []
	);

	function applyAccent(hex: string) {
		update('theme.accent', hex);
	}

	// ── E3: Font ──
	let previewSample = $state('Beats que inspiran. Sonido que define.');

	function selectDisplayFont(name: string) {
		update('theme.fontDisplay', name);
	}
	function selectBodyFont(name: string) {
		update('theme.fontBody', name);
	}
</script>

<div class="editor">
	<h2 class="editor-title">🏢 Brand & Media</h2>
	<p class="editor-desc">Logo, colores, fuentes — la identidad visual de tu tienda.</p>

	<!-- ═══ E1: Logo Upload + Crop ═══ -->
	<Collapsible id="brand-logo" icon="🖼️" title="🖼️ Logo" open={true}>
				<p class="section-desc">Sube tu logo, recórtalo, y genera automáticamente favicon + OG image.</p>

		{#if showCropper && cropSrc}
			<div class="crop-section">
				<ImageCropper
					src={cropSrc}
					oncrop={handleCrop}
					oncancel={() => (showCropper = false)}
				/>
				{#if cropping}
					<div class="uploading-overlay">
						<span class="spinner"></span> Generando logo, favicon y OG…
					</div>
				{/if}
			</div>
		{:else}
			<div class="field">
				<span class="upload-label">Logo principal</span>
				<FileUpload
					value={brand.logo ?? ''}
					folder="brand"
					beatId="logo"
					accept="image/*"
					label="Logo de marca"
					type="image"
					onUploadComplete={handleLogoUpload}
					onRemove={() => {
						update('brand.logo', '');
						update('brand.favicon', '');
					}}
				/>
				<div class="url-fallback">
					<label for="b-logo">O pega una URL:</label>
					<input id="b-logo" type="text" value={brand.logo ?? ''} oninput={(e) => update('brand.logo', e.currentTarget.value)} placeholder="https://..." />
				</div>
			</div>

			<div class="logo-previews">
				<div class="logo-preview-card">
					<span class="preview-label">Nav / Header</span>
					<div class="preview-frame nav-preview">
						{#if brand.logo}
							<img src={brand.logo} alt="Logo nav" class="preview-logo-sm" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
						{:else}
							<span class="no-logo">{brand.name || 'Tu Marca'}</span>
						{/if}
					</div>
				</div>
				<div class="logo-preview-card">
					<span class="preview-label">Favicon</span>
					<div class="preview-frame favicon-preview">
						{#if brand.favicon}
							<img src={brand.favicon} alt="Favicon" class="preview-favicon" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
						{:else}
							<span class="no-logo">?</span>
						{/if}
					</div>
				</div>
				<div class="logo-preview-card">
					<span class="preview-label">Footer</span>
					<div class="preview-frame footer-preview">
						{#if brand.logo}
							<img src={brand.logo} alt="Logo footer" class="preview-logo-xs" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
							<span class="footer-text">{brand.footerText || '© 2026'}</span>
						{:else}
							<span class="no-logo">{brand.footerText || 'Footer'}</span>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</Collapsible>

	<!-- ═══ Identity ═══ -->
	<Collapsible id="brand-favicon" icon="⭐" title="🏷️ Identidad" open={false}>
				<div class="field">
			<label for="b-name">Nombre de marca</label>
			<input id="b-name" type="text" value={brand.name ?? ''} oninput={(e) => update('brand.name', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="b-wa">WhatsApp (con código de país)</label>
			<input id="b-wa" type="text" value={brand.whatsapp ?? ''} oninput={(e) => update('brand.whatsapp', e.currentTarget.value)} placeholder="5215512345678" />
		</div>
		<div class="field">
			<label for="b-ft">Footer texto</label>
			<input id="b-ft" type="text" value={brand.footerText ?? ''} oninput={(e) => update('brand.footerText', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="b-meta">Meta description (SEO)</label>
			<input id="b-meta" type="text" value={brand.metaDescription ?? ''} oninput={(e) => update('brand.metaDescription', e.currentTarget.value)} />
		</div>
	</Collapsible>

	<!-- ═══ E2: Color Palette Generator ═══ -->
	<Collapsible id="brand-name" icon="📝" title="🎨 Paleta de colores" open={false}>
				<p class="section-desc">Generada automáticamente desde tu color accent ({theme.accent || '#dc2626'}). Edita el accent en Theme.</p>

		{#if palette.length}
			<div class="palette-shades">
				{#each palette as shade}
					<button
						class="shade-chip"
						style="background: {shade.hex}"
						title="{shade.name}: {shade.hex}"
						onclick={() => applyAccent(shade.hex)}
					>
						<span class="shade-name" style="color: {contrastRatio(shade.hex, '#000') > 4 ? '#000' : '#fff'}">{shade.name}</span>
					</button>
				{/each}
			</div>

			<div class="palette-info">
				{#each palette as shade}
					<span class="shade-label">{shade.hex}</span>
				{/each}
			</div>
		{/if}

		<h4 class="sub-section-title">Armonías</h4>
		<div class="harmony-row">
			{#each harmony as h}
				<button
					class="harmony-chip"
					style="background: {h.hex}"
					title={h.name}
					onclick={() => applyAccent(h.hex)}
				>
					<span class="harmony-name" style="color: {contrastRatio(h.hex, '#000') > 4 ? '#000' : '#fff'}">{h.name}</span>
				</button>
			{/each}
		</div>
	</Collapsible>

	<!-- ═══ E3: Font Preview ═══ -->
	<Collapsible id="brand-colors" icon="🎨" title="🔤 Tipografía" open={false}>
				<p class="section-desc">Escribe un Google Font y previsualízalo en tiempo real.</p>

		<div class="field">
			<span class="upload-label">Font display (títulos)</span>
			<FontPreview
				fontName={theme.fontDisplay ?? ''}
				sampleText={previewSample}
				onselect={selectDisplayFont}
			/>
		</div>

		<div class="field">
			<span class="upload-label">Font body (cuerpo)</span>
			<FontPreview
				fontName={theme.fontBody ?? ''}
				sampleText={previewSample}
				onselect={selectBodyFont}
			/>
		</div>

		<div class="font-combined-preview">
			<span class="preview-label">Preview combinado</span>
			<div class="combined-frame" style="font-family: '{theme.fontDisplay}', sans-serif">
				<h4 style="font-family: '{theme.fontDisplay}', sans-serif; font-weight: 800; margin: 0 0 0.5rem">{brand.name || 'Tu Marca'}</h4>
				<p style="font-family: '{theme.fontBody}', sans-serif; margin: 0; color: var(--text-secondary); font-size: 0.875rem">
					Beats premium, sonido profesional. Descubre nuestra colección y encuentra tu próximo hit.
				</p>
			</div>
		</div>
	</Collapsible>

	<!-- ═══ Loader ═══ -->
	<Collapsible id="brand-fonts" icon="🔤" title="⏳ Loader" open={false}>
				<div class="field">
			<label>
				<input type="checkbox" checked={loader.enabled !== false} onchange={(e) => update('loader.enabled', e.currentTarget.checked)} />
				Mostrar loader al cargar
			</label>
		</div>
		<div class="field">
			<label for="b-lt">Texto loader</label>
			<input id="b-lt" type="text" value={loader.brandText ?? ''} oninput={(e) => update('loader.brandText', e.currentTarget.value)} />
		</div>
	</Collapsible>
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-3); }
	.section-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); line-height: 1.5; }
	.sub-section-title { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin: var(--space-3) 0 var(--space-2); }
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }
	.field input[type="text"] { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field input[type="text"]:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.url-fallback { margin-top: var(--space-2); }
	.url-fallback label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); margin-bottom: var(--space-1); display: block; }
	.upload-label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: var(--space-1); }
	.preview-label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

	/* ── E1: Logo crop + previews ── */
	.crop-section { position: relative; }
	.uploading-overlay {
		position: absolute; inset: 0;
		display: flex; align-items: center; justify-content: center; gap: var(--space-2);
		background: rgba(0,0,0,0.7); border-radius: var(--radius-md);
		color: #fff; font-family: var(--font-mono); font-size: var(--text-sm);
		z-index: 5;
	}
	.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.logo-previews { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-top: var(--space-3); }
	.logo-preview-card { display: flex; flex-direction: column; gap: var(--space-1); }
	.preview-frame {
		background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);
		display: flex; align-items: center; justify-content: center; overflow: hidden;
	}
	.nav-preview { height: 48px; padding: 0 var(--space-3); justify-content: flex-start; }
	.preview-logo-sm { height: 28px; width: auto; object-fit: contain; }
	.favicon-preview { width: 48px; height: 48px; }
	.preview-favicon { width: 24px; height: 24px; object-fit: contain; }
	.footer-preview { height: 48px; flex-direction: column; gap: 2px; }
	.preview-logo-xs { height: 18px; width: auto; object-fit: contain; }
	.footer-text { font-size: 10px; color: var(--text-muted); }
	.no-logo { font-family: var(--font-display); font-size: var(--text-sm); color: var(--text-muted); font-weight: 700; }

	/* ── E2: Palette ── */
	.palette-shades { display: flex; gap: 2px; border-radius: var(--radius-md); overflow: hidden; }
	.shade-chip {
		flex: 1; height: 48px; border: none; cursor: pointer;
		display: flex; align-items: flex-end; justify-content: center;
		padding-bottom: var(--space-1); transition: transform var(--duration-fast), box-shadow var(--duration-fast);
		position: relative;
	}
	.shade-chip:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
	.shade-chip:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
	.shade-chip:hover { transform: scaleY(1.15); z-index: 2; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
	.shade-name { font-family: var(--font-mono); font-size: 9px; font-weight: 700; opacity: 0.8; }
	.palette-info { display: flex; gap: 2px; margin-top: var(--space-1); }
	.shade-label { flex: 1; text-align: center; font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); }
	.harmony-row { display: flex; gap: var(--space-2); flex-wrap: wrap; }
	.harmony-chip {
		width: 80px; height: 56px; border: none; border-radius: var(--radius-md); cursor: pointer;
		display: flex; align-items: flex-end; justify-content: center;
		padding-bottom: var(--space-1); transition: transform var(--duration-fast);
	}
	.harmony-chip:hover { transform: scale(1.08); }
	.harmony-name { font-family: var(--font-mono); font-size: 9px; font-weight: 600; opacity: 0.85; }

	/* ── E3: Font combined preview ── */
	.font-combined-preview { margin-top: var(--space-3); }
	.combined-frame {
		padding: var(--space-4); background: var(--surface);
		border: 1px solid var(--border); border-radius: var(--radius-md);
	}

	/* ── Mobile responsive ── */
	@media (max-width: 640px) {
		.logo-previews { grid-template-columns: 1fr 1fr; }
		.palette-shades { flex-wrap: wrap; }
		.shade-chip { min-width: 28%; }
		.harmony-row { flex-wrap: wrap; }
		.harmony-chip { width: 64px; height: 48px; }
	}
</style>
