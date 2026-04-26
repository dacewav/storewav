<script lang="ts">
	import { settings, themePresets as themePresetsStore, savePreset, loadPreset, deletePreset, renamePreset } from '$lib/stores';
	import { Card, AdminSkeleton, Collapsible } from '$lib/components';
	import type { ThemeSettings } from '$lib/stores/settings';
	import type { ThemePreset } from '$lib/stores';
	import { fmt, handleShiftArrows, hexToRgb } from '$lib/themeShared';

	let s = $derived($settings.data);
	let t = $derived((s?.theme ?? {}) as ThemeSettings);

	/** Local slider state — updates instantly on drag, syncs from store */
	let local = $state<Record<string, number>>({});
	let localInit = false;

	/** Sync local values from store when store changes (but not during drag) */
	$effect(() => {
		if (!t || !s) return;
		if (!localInit) {
			// First load: populate all local values from store
			local = {
				fontWeight: t.fontWeight ?? 400,
				fontSize: t.fontSize ?? 14,
				lineHeight: t.lineHeight ?? 1.6,
				radiusGlobal: t.radiusGlobal ?? 12,
				sectionPadding: t.sectionPadding ?? 4,
				beatGap: t.beatGap ?? 16,
				navBlur: t.navBlur ?? 24,
				ctaBtnRadius: t.ctaBtnRadius ?? 12,
				containerMaxWidth: t.containerMaxWidth ?? 1200,
				navOpacity: t.navOpacity ?? 0.95,
				heroBgOpacity: t.heroBgOpacity ?? 1,
				sectionOpacity: t.sectionOpacity ?? 1,
				beatImgOpacity: t.beatImgOpacity ?? 1,
				textOpacity: t.textOpacity ?? 1,
				btnOpacityNormal: t.btnOpacityNormal ?? 1,
				btnOpacityHover: t.btnOpacityHover ?? 1,
				bgOpacity: t.bgOpacity ?? 1,
				wbarHeight: t.wbarHeight ?? 64,
				wbarRadius: t.wbarRadius ?? 0,
				waveOpacityOff: t.waveOpacityOff ?? 0.3,
				waveOpacityOn: t.waveOpacityOn ?? 0.8,
			};
			localInit = true;
		}
	});

	/** Update local instantly + debounced save to Firebase (batches rapid changes) */
	function onSlide(dotPath: string, localKey: string, val: number) {
		local[localKey] = val;
		settings.updateFieldDebounced(dotPath, val);
	}

	// Theme presets
	let presetName = $state('');
	let editingPresetId = $state<string | null>(null);
	let editingPresetName = $state('');

	async function handleSavePreset() {
		if (!presetName.trim()) return;
		await savePreset(presetName.trim());
		presetName = '';
	}

	async function handleLoadPreset(preset: ThemePreset) {
		await loadPreset(preset);
	}

	async function handleDeletePreset(preset: ThemePreset) {
		if (!confirm(`¿Eliminar preset "${preset.name}"?`)) return;
		await deletePreset(preset.id);
	}

	function startRename(preset: ThemePreset) {
		editingPresetId = preset.id;
		editingPresetName = preset.name;
	}

	async function handleRenamePreset(id: string) {
		if (editingPresetName.trim()) {
			await renamePreset(id, editingPresetName.trim());
		}
		editingPresetId = null;
		editingPresetName = '';
	}

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}

	/** Wrapper for shared fmt with local state */
	function f(key: string, max: number, unit = '', pct = false): string {
		return fmt(local, key, max, unit, pct);
	}

	// Preview panel toggle
	let showPreview = $state(true);

	/** Build live preview CSS vars from current theme state */
	let previewStyle = $derived.by(() => {
		const accent = t.accent || '#dc2626';
		const bg = t.bgColor || (t.lightMode ? '#f5f5f5' : '#060404');
		const surface = t.surfaceColor || (t.lightMode ? '#ffffff' : '#0f0808');
		const text = t.textColor || (t.lightMode ? '#1a1a1a' : '#f5eeee');
		return [
			`--accent: ${accent}`,
			`--accent-rgb: ${hexToRgb(accent)}`,
			`--pbg: ${bg}`,
			`--psurface: ${surface}`,
			`--ptext: ${text}`,
			`--ptext-secondary: ${t.lightMode ? '#666' : '#999'}`,
			`--radius: ${t.radiusGlobal ?? 12}px`,
			`--card-opacity: ${t.cardOpacity ?? 0.85}`,
			`--blur: ${t.blurBg ?? 20}px`,
			`--shadow-intensity: ${t.cardShadowIntensity ?? 0.3}`,
			`--shadow-color: ${t.cardShadowColor || '#000'}`,
			`--btn-radius: ${t.ctaBtnRadius ?? 12}px`,
			`--btn-bg: ${t.ctaBtnBg || '#25d366'}`,
			`--btn-color: ${t.ctaBtnClr || '#fff'}`,
			`--glow-color: ${t.glowColor || accent}`,
			`--glow-intensity: ${t.glowIntensity ?? 1}`,
			`--glow-blur: ${t.glowBlur ?? 20}px`,
		].join('; ');
	});


</script>

{#if $settings.loading}
	<div class="editor">
		<AdminSkeleton variant="full" />
	</div>
{:else}
<div class="theme-layout">
<div class="editor">
	<div class="editor-header">
		<div>
			<h2 class="editor-title">🎨 Tema Global</h2>
			<p class="editor-desc">Colores, glow, tipografía y efectos visuales de toda la tienda.</p>
		</div>
		<button class="preview-toggle" onclick={() => showPreview = !showPreview}>
			{showPreview ? '👁️ Ocultar preview' : '👁️‍🗨️ Ver preview'}
		</button>
	</div>

	<!-- Quick Actions -->
	<Card>
		<div class="quick-actions">
			<button
				class="mode-toggle"
				onclick={() => {
					const isLight = t.lightMode === true;
					update('theme.lightMode', !isLight);
					if (typeof document !== 'undefined') {
						document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
						document.documentElement.style.colorScheme = isLight ? 'dark' : 'light';
					}
				}}
			>
				<span class="mode-icon">{t.lightMode === true ? '☀️' : '🌙'}</span>
				<span class="mode-label">{t.lightMode === true ? 'Modo Claro activo' : 'Modo Oscuro activo'}</span>
			</button>
			<button
				class="reset-btn"
				onclick={() => {
					if (!confirm('¿Restaurar todos los valores del tema a los defaults?')) return;
					const defaults: [string, unknown][] = [
						['theme.accent', '#dc2626'],
						['theme.glowColor', ''],
						['theme.glowIntensity', 1],
						['theme.glowBlur', 20],
						['theme.glowAnim', 'none'],
						['theme.glowAnimSpeed', 2],
						['theme.fontDisplay', 'Syne'],
						['theme.fontBody', 'Space Grotesk'],
						['theme.fontWeight', 400],
						['theme.fontSize', 14],
						['theme.lineHeight', 1.6],
						['theme.radiusGlobal', 12],
						['theme.sectionPadding', 4],
						['theme.beatGap', 16],
						['theme.cardOpacity', 0.85],
						['theme.blurBg', 20],
						['theme.grainOpacity', 0.03],
						['theme.cardShadowIntensity', 0.3],
						['theme.cardShadowColor', '#000000'],
						['theme.navOpacity', 0.95],
						['theme.heroBgOpacity', 1],
						['theme.sectionOpacity', 1],
						['theme.beatImgOpacity', 1],
						['theme.textOpacity', 1],
						['theme.btnOpacityNormal', 1],
						['theme.wbarColor', ''],
						['theme.wbarActive', ''],
						['theme.wbarHeight', 64],
						['theme.orbBlendMode', 'screen'],
						['theme.grainBlendMode', 'overlay'],
						['theme.particlesOn', false],
						['theme.particlesCount', 50],
						['theme.particlesSpeed', 1],
						['theme.particlesType', 'circle'],
						['theme.particlesColor', ''],
						['theme.particlesOpacity', 0.3],
						['theme.particlesText', ''],
						['theme.particlesImgUrl', ''],
						['theme.particlesSizeMin', 3],
						['theme.particlesSizeMax', 8],
						['theme.lightMode', false],
						['theme.heroGlowOn', false],
						['theme.heroGlowClr', ''],
						['theme.heroGlowInt', 1],
						['theme.heroGlowBlur', 20],
						['theme.heroStrokeOn', false],
						['theme.heroStrokeClr', ''],
						['theme.heroStrokeW', 1],
						['theme.glowActive', false],
						['theme.glowAnim', 'none'],
						['theme.glowAnimSpeed', 2],
						['theme.btnOpacityHover', 1],
						['theme.bgOpacity', 1],
						['theme.wbarRadius', 0],
						['theme.waveOpacityOff', 0.3],
						['theme.waveOpacityOn', 0.8],
						['theme.btnLicBg', ''],
						['theme.btnLicClr', ''],
						['theme.btnLicBdr', ''],
						['theme.customCSS', ''],
						['theme.bgColor', ''],
						['theme.surfaceColor', ''],
						['theme.textColor', ''],
						['theme.navBgColor', ''],
						['theme.navBlur', 24],
						['theme.ctaBtnBg', ''],
						['theme.ctaBtnClr', ''],
						['theme.ctaBtnHoverBg', ''],
						['theme.ctaBtnRadius', 12],
						['theme.containerMaxWidth', 1200],
					];
					for (const [path, val] of defaults) {
						settings.updateField(path, val);
					}
					if (typeof document !== 'undefined') {
						document.documentElement.setAttribute('data-theme', 'dark');
						document.documentElement.style.colorScheme = 'dark';
					}
				}}
			>
				<span>↺</span>
				<span>Restaurar defaults</span>
			</button>
		</div>
	</Card>

	<!-- Colors -->
	<Collapsible id="colors" icon="🎨" title="Colores" badge={t.accent || '#dc2626'} badgeVariant="active" open={true}>
		{#snippet preview()}
			<div class="color-swatches-row">
				<span class="mini-swatch" style="background:{t.accent || '#dc2626'}" title="Accent"></span>
				<span class="mini-swatch" style="background:{t.glowColor || t.accent || '#dc2626'}" title="Glow"></span>
				<span class="mini-swatch" style="background:{t.bgColor || '#060404'}" title="BG"></span>
				<span class="mini-swatch" style="background:{t.surfaceColor || '#0f0808'}" title="Surface"></span>
				<span class="mini-swatch" style="background:{t.textColor || '#f5eeee'}" title="Text"></span>
			</div>
		{/snippet}
		<p class="field-desc">El accent es el color principal — botones, links, highlights. El glow es el resplandor.</p>
		<!-- Live Palette Preview -->
		<div class="palette-preview">
			<div class="palette-strip">
				<div class="palette-chip" style="background:{t.accent || '#dc2626'}">
					<span class="chip-label">Accent</span>
					<span class="chip-hex">{t.accent || '#dc2626'}</span>
				</div>
				<div class="palette-chip" style="background:{t.glowColor || t.accent || '#dc2626'}">
					<span class="chip-label">Glow</span>
					<span class="chip-hex">{t.glowColor || 'auto'}</span>
				</div>
				<div class="palette-chip" style="background:{t.bgColor || '#060404'}">
					<span class="chip-label">BG</span>
					<span class="chip-hex">{t.bgColor || '#060404'}</span>
				</div>
				<div class="palette-chip" style="background:{t.surfaceColor || '#0f0808'}">
					<span class="chip-label">Surface</span>
					<span class="chip-hex">{t.surfaceColor || '#0f0808'}</span>
				</div>
				<div class="palette-chip" style="background:{t.textColor || '#f5eeee'}; color:{t.bgColor || '#060404'}">
					<span class="chip-label">Text</span>
					<span class="chip-hex">{t.textColor || '#f5eeee'}</span>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-accent">Accent (color principal)</label>
				<div class="color-row">
					<input id="t-accent" type="color" value={t.accent || '#dc2626'} oninput={(e) => update('theme.accent', e.currentTarget.value)} />
					<input type="text" value={t.accent ?? '#dc2626'} oninput={(e) => update('theme.accent', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-gc">Glow color (vacío = accent)</label>
				<div class="color-row">
					<input id="t-gc" type="color" value={t.glowColor || t.accent || '#dc2626'} oninput={(e) => update('theme.glowColor', e.currentTarget.value)} />
					<input type="text" value={t.glowColor ?? ''} placeholder="(usa accent)" oninput={(e) => update('theme.glowColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- Background & Surfaces -->
	<Collapsible id="surfaces" icon="🖼️" title="Fondo y Superficies" open={false}>
		{#snippet preview()}
			<div class="mini-surface-preview">
				<div class="msp-bg" style="background:{t.bgColor || '#060404'}">
					<div class="msp-card" style="background:{t.surfaceColor || '#0f0808'}; border-color:{t.accent || '#dc2626'}33">
						<span class="msp-text" style="color:{t.textColor || '#f5eeee'}">Aa</span>
					</div>
				</div>
			</div>
		{/snippet}
		<p class="field-desc">Colores base de la tienda. Vacío = default del tema (dark/light).</p>
		<div class="row">
			<div class="field">
				<label for="t-bgc">Background principal</label>
				<div class="color-row">
					<input id="t-bgc" type="color" value={t.bgColor || '#060404'} oninput={(e) => update('theme.bgColor', e.currentTarget.value)} />
					<input type="text" value={t.bgColor ?? ''} placeholder="(#060404)" oninput={(e) => update('theme.bgColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-sfc">Superficie (cards/paneles)</label>
				<div class="color-row">
					<input id="t-sfc" type="color" value={t.surfaceColor || '#0f0808'} oninput={(e) => update('theme.surfaceColor', e.currentTarget.value)} />
					<input type="text" value={t.surfaceColor ?? ''} placeholder="(#0f0808)" oninput={(e) => update('theme.surfaceColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-txc">Texto principal</label>
				<div class="color-row">
					<input id="t-txc" type="color" value={t.textColor || '#f5eeee'} oninput={(e) => update('theme.textColor', e.currentTarget.value)} />
					<input type="text" value={t.textColor ?? ''} placeholder="(#f5eeee)" oninput={(e) => update('theme.textColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- Advanced Colors -->
	<Collapsible id="advanced-colors" icon="🎨" title="Colores Avanzados" open={false}>
		<p class="field-desc">Colores secundarios, bordes y estados. Vacío = default del tema.</p>
		<div class="row">
			<div class="field">
				<label for="t-bgsec">Background secundario</label>
				<div class="color-row">
					<input id="t-bgsec" type="color" value={t.bgSecondary || '#0a0a0a'} oninput={(e) => update('theme.bgSecondary', e.currentTarget.value)} />
					<input type="text" value={t.bgSecondary ?? ''} placeholder="(#0a0a0a)" oninput={(e) => update('theme.bgSecondary', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-sfc2">Superficie alternativa</label>
				<div class="color-row">
					<input id="t-sfc2" type="color" value={t.surfaceColor2 || '#1a0c0c'} oninput={(e) => update('theme.surfaceColor2', e.currentTarget.value)} />
					<input type="text" value={t.surfaceColor2 ?? ''} placeholder="(#1a0c0c)" oninput={(e) => update('theme.surfaceColor2', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-sfh">Superficie hover</label>
				<div class="color-row">
					<input id="t-sfh" type="color" value={t.surfaceHover || '#161010'} oninput={(e) => update('theme.surfaceHover', e.currentTarget.value)} />
					<input type="text" value={t.surfaceHover ?? ''} placeholder="(#161010)" oninput={(e) => update('theme.surfaceHover', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-sfa">Superficie active</label>
				<div class="color-row">
					<input id="t-sfa" type="color" value={t.surfaceActive || '#1e1414'} oninput={(e) => update('theme.surfaceActive', e.currentTarget.value)} />
					<input type="text" value={t.surfaceActive ?? ''} placeholder="(#1e1414)" oninput={(e) => update('theme.surfaceActive', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bdr">Borde principal</label>
				<div class="color-row">
					<input type="text" value={t.borderColor ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.borderColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-bdr2">Borde secundario</label>
				<div class="color-row">
					<input type="text" value={t.borderColor2 ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.borderColor2', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-txth">Texto hint/sutil</label>
				<div class="color-row">
					<input type="text" value={t.textHint ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.textHint', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-txtm">Texto muted</label>
				<div class="color-row">
					<input type="text" value={t.textMuted ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.textMuted', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-danger">Danger (error)</label>
				<div class="color-row">
					<input id="t-danger" type="color" value={t.dangerColor || '#ff4444'} oninput={(e) => update('theme.dangerColor', e.currentTarget.value)} />
					<input type="text" value={t.dangerColor ?? ''} placeholder="(#ff4444)" oninput={(e) => update('theme.dangerColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-warning">Warning (advertencia)</label>
				<div class="color-row">
					<input id="t-warning" type="color" value={t.warningColor || '#ffaa00'} oninput={(e) => update('theme.warningColor', e.currentTarget.value)} />
					<input type="text" value={t.warningColor ?? ''} placeholder="(#ffaa00)" oninput={(e) => update('theme.warningColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-selbg">Selección texto bg</label>
				<div class="color-row">
					<input id="t-selbg" type="color" value={t.selectionBg || '#dc2626'} oninput={(e) => update('theme.selectionBg', e.currentTarget.value)} />
					<input type="text" value={t.selectionBg ?? ''} placeholder="(accent)" oninput={(e) => update('theme.selectionBg', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-selcl">Selección texto color</label>
				<div class="color-row">
					<input id="t-selcl" type="color" value={t.selectionColor || '#ffffff'} oninput={(e) => update('theme.selectionColor', e.currentTarget.value)} />
					<input type="text" value={t.selectionColor ?? ''} placeholder="(#ffffff)" oninput={(e) => update('theme.selectionColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- Transitions & Shadows -->
	<Collapsible id="transitions" icon="⚡" title="Transiciones y Sombras" open={false}>
		<p class="field-desc">Controla la velocidad de las transiciones y sombras globales.</p>
		<div class="row">
			<div class="field">
				<label for="t-df">Duración rápida ({t.durationFast ?? 150}ms)</label>
				<input id="t-df" type="range" min="50" max="500" step="25" value={t.durationFast ?? 150} oninput={(e) => update('theme.durationFast', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-dn">Duración normal ({t.durationNormal ?? 300}ms)</label>
				<input id="t-dn" type="range" min="100" max="1000" step="50" value={t.durationNormal ?? 300} oninput={(e) => update('theme.durationNormal', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-ds">Duración lenta ({t.durationSlow ?? 500}ms)</label>
				<input id="t-ds" type="range" min="200" max="2000" step="100" value={t.durationSlow ?? 500} oninput={(e) => update('theme.durationSlow', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="field">
			<label for="t-ease">Easing global</label>
			<select id="t-ease" onchange={(e) => update('theme.easeDefault', e.currentTarget.value)}>
				<option value="" selected={!t.easeDefault}>Default (ease-out)</option>
				<option value="ease-out" selected={t.easeDefault === 'ease-out'}>Ease Out</option>
				<option value="ease-in-out" selected={t.easeDefault === 'ease-in-out'}>Ease In-Out</option>
				<option value="cubic-bezier(0.16, 1, 0.3, 1)" selected={t.easeDefault?.includes('0.16')}>Spring</option>
				<option value="cubic-bezier(0.34, 1.56, 0.64, 1)" selected={t.easeDefault?.includes('1.56')}>Bouncy</option>
				<option value="linear" selected={t.easeDefault === 'linear'}>Linear</option>
			</select>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-shsm">Sombra pequeña</label>
				<input id="t-shsm" type="text" value={t.shadowSm ?? ''} placeholder="0 2px 8px rgba(0,0,0,0.3)" oninput={(e) => update('theme.shadowSm', e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-shmd">Sombra mediana</label>
				<input id="t-shmd" type="text" value={t.shadowMd ?? ''} placeholder="0 4px 16px rgba(0,0,0,0.4)" oninput={(e) => update('theme.shadowMd', e.currentTarget.value)} />
			</div>
		</div>
		<div class="field">
			<label for="t-shlg">Sombra grande</label>
			<input id="t-shlg" type="text" value={t.shadowLg ?? ''} placeholder="0 8px 32px rgba(0,0,0,0.5)" oninput={(e) => update('theme.shadowLg', e.currentTarget.value)} />
		</div>
	</Collapsible>

	<!-- Navigation -->
	<Collapsible id="navigation" icon="🧭" title="Navegación" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-nbc">Color fondo nav</label>
				<div class="color-row">
					<input id="t-nbc" type="color" value={t.navBgColor || '#060404'} oninput={(e) => update('theme.navBgColor', e.currentTarget.value)} />
					<input type="text" value={t.navBgColor ?? ''} placeholder="(auto)" oninput={(e) => update('theme.navBgColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-nbl">Blur nav ({f("navBlur", 40, "px")})</label>
				<input id="t-nbl" type="range" min="0" max="40" step="2" value={local.navBlur ?? 24} oninput={(e) => onSlide('theme.navBlur', 'navBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- CTA Button -->
	<Collapsible id="cta-btn" icon="💬" title="Botón CTA (WhatsApp)" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-ctbg">Fondo botón</label>
				<div class="color-row">
					<input id="t-ctbg" type="color" value={t.ctaBtnBg || '#25d366'} oninput={(e) => update('theme.ctaBtnBg', e.currentTarget.value)} />
					<input type="text" value={t.ctaBtnBg ?? ''} placeholder="(default)" oninput={(e) => update('theme.ctaBtnBg', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-ctbc">Texto botón</label>
				<div class="color-row">
					<input id="t-ctbc" type="color" value={t.ctaBtnClr || '#ffffff'} oninput={(e) => update('theme.ctaBtnClr', e.currentTarget.value)} />
					<input type="text" value={t.ctaBtnClr ?? ''} placeholder="(default)" oninput={(e) => update('theme.ctaBtnClr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-cthh">Hover fondo</label>
				<div class="color-row">
					<input id="t-cthh" type="color" value={t.ctaBtnHoverBg || '#1da851'} oninput={(e) => update('theme.ctaBtnHoverBg', e.currentTarget.value)} />
					<input type="text" value={t.ctaBtnHoverBg ?? ''} placeholder="(default)" oninput={(e) => update('theme.ctaBtnHoverBg', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-ctr">Radio ({f("ctaBtnRadius", 50, "px")})</label>
				<input id="t-ctr" type="range" min="0" max="50" step="2" value={local.ctaBtnRadius ?? 12} oninput={(e) => onSlide('theme.ctaBtnRadius', 'ctaBtnRadius', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Container -->
	<Collapsible id="container" icon="📐" title="Contenedor" open={false}>
		<div class="field">
			<label for="t-cmw">Ancho máximo ({f("containerMaxWidth", 1800, "px")})</label>
			<input id="t-cmw" type="range" min="800" max="1800" step="50" value={local.containerMaxWidth ?? 1200} oninput={(e) => onSlide('theme.containerMaxWidth', 'containerMaxWidth', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
		</div>
	</Collapsible>

	<!-- Typography -->
	<Collapsible id="typography" icon="🔤" title="Tipografía" open={true}>
		{#snippet preview()}
			<span class="typo-preview" style="font-family:'{t.fontDisplay || 'Syne'}',sans-serif; font-weight:{t.fontWeight ?? 400}">Aa</span>
		{/snippet}
		<!-- Font Preview -->
		<div class="font-preview-box" style="font-family:'{t.fontDisplay || 'Syne'}',sans-serif; font-weight:{t.fontWeight ?? 400}; font-size:{Math.min((local.fontSize ?? 14) * 1.5, 28)}px; line-height:{local.lineHeight ?? 1.6}">
			<span class="fp-display">Display: {t.fontDisplay || 'Syne'}</span>
			<span class="fp-body" style="font-family:'{t.fontBody || 'DM Mono'}',monospace; font-size:{local.fontSize ?? 14}px">Body: {t.fontBody || 'DM Mono'}</span>
			<span class="fp-sample" style="font-family:'{t.fontBody || 'DM Mono'}',monospace; font-size:{local.fontSize ?? 14}px">Beats que suenan diferente</span>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-fd">Font display (Google Font)</label>
				<input id="t-fd" type="text" value={t.fontDisplay ?? 'Syne'} oninput={(e) => update('theme.fontDisplay', e.currentTarget.value)} placeholder="Syne" />
			</div>
			<div class="field">
				<label for="t-fb">Font body (Google Font)</label>
				<input id="t-fb" type="text" value={t.fontBody ?? 'DM Mono'} oninput={(e) => update('theme.fontBody', e.currentTarget.value)} placeholder="DM Mono" />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-fw">Font weight ({f("fontWeight", 900)})</label>
				<input id="t-fw" type="range" min="100" max="900" step="100" value={local.fontWeight ?? 400} oninput={(e) => onSlide('theme.fontWeight', 'fontWeight', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-fs">Base font size ({t.fontSize ?? 14}px)</label>
				<input id="t-fs" type="range" min="10" max="20" step="1" value={local.fontSize ?? 14} oninput={(e) => onSlide('theme.fontSize', 'fontSize', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-flh">Line height ({t.lineHeight ?? 1.6})</label>
				<input id="t-flh" type="range" min="1" max="2.5" step="0.1" value={local.lineHeight ?? 1.6} oninput={(e) => onSlide('theme.lineHeight', 'lineHeight', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Spacing & Shape -->
	<Collapsible id="spacing" icon="📏" title="Espaciado y Forma" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-r">Border radius ({t.radiusGlobal ?? 12}px)</label>
				<input id="t-r" type="range" min="0" max="30" step="1" value={local.radiusGlobal ?? 12} oninput={(e) => onSlide('theme.radiusGlobal', 'radiusGlobal', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-sp">Section padding ({t.sectionPadding ?? 4}rem)</label>
				<input id="t-sp" type="range" min="1" max="10" step="0.5" value={local.sectionPadding ?? 4} oninput={(e) => onSlide('theme.sectionPadding', 'sectionPadding', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-bg">Beat gap ({t.beatGap ?? 16}px)</label>
				<input id="t-bg" type="range" min="4" max="40" step="2" value={local.beatGap ?? 16} oninput={(e) => onSlide('theme.beatGap', 'beatGap', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Opacities -->
	<Collapsible id="opacities" icon="🔲" title="Opacidades" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-no">Nav ({f("navOpacity", 1, "", true)})</label>
				<input id="t-no" type="range" min="0" max="1" step="0.05" value={local.navOpacity ?? 0.95} oninput={(e) => onSlide('theme.navOpacity', 'navOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-ho">Hero bg ({f("heroBgOpacity", 1, "", true)})</label>
				<input id="t-ho" type="range" min="0" max="1" step="0.05" value={local.heroBgOpacity ?? 1} oninput={(e) => onSlide('theme.heroBgOpacity', 'heroBgOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-so">Sections ({f("sectionOpacity", 1, "", true)})</label>
				<input id="t-so" type="range" min="0" max="1" step="0.05" value={local.sectionOpacity ?? 1} oninput={(e) => onSlide('theme.sectionOpacity', 'sectionOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bio">Beat images ({f("beatImgOpacity", 1, "", true)})</label>
				<input id="t-bio" type="range" min="0" max="1" step="0.05" value={local.beatImgOpacity ?? 1} oninput={(e) => onSlide('theme.beatImgOpacity', 'beatImgOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-to">Text ({f("textOpacity", 1, "", true)})</label>
				<input id="t-to" type="range" min="0" max="1" step="0.05" value={local.textOpacity ?? 1} oninput={(e) => onSlide('theme.textOpacity', 'textOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-bo">Btn normal ({f("btnOpacityNormal", 1, "", true)})</label>
				<input id="t-bo" type="range" min="0" max="1" step="0.05" value={local.btnOpacityNormal ?? 1} oninput={(e) => onSlide('theme.btnOpacityNormal', 'btnOpacityNormal', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bh">Btn hover ({f("btnOpacityHover", 1, "", true)})</label>
				<input id="t-bh" type="range" min="0" max="1" step="0.05" value={local.btnOpacityHover ?? 1} oninput={(e) => onSlide('theme.btnOpacityHover', 'btnOpacityHover', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-bgo">Background ({f("bgOpacity", 1, "", true)})</label>
				<input id="t-bgo" type="range" min="0" max="1" step="0.05" value={local.bgOpacity ?? 1} oninput={(e) => onSlide('theme.bgOpacity', 'bgOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Player Bar -->
	<Collapsible id="player-bar" icon="🎵" title="Player Bar" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-wc">Color barra</label>
				<div class="color-row">
					<input id="t-wc" type="color" value={t.wbarColor || '#1a1a1a'} oninput={(e) => update('theme.wbarColor', e.currentTarget.value)} />
					<input type="text" value={t.wbarColor ?? ''} placeholder="(default)" oninput={(e) => update('theme.wbarColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-wa">Color activo</label>
				<div class="color-row">
					<input id="t-wa" type="color" value={t.wbarActive || '#dc2626'} oninput={(e) => update('theme.wbarActive', e.currentTarget.value)} />
					<input type="text" value={t.wbarActive ?? ''} placeholder="(accent)" oninput={(e) => update('theme.wbarActive', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-wh">Alto ({f("wbarHeight", 100, "px")})</label>
				<input id="t-wh" type="range" min="48" max="100" step="4" value={local.wbarHeight ?? 64} oninput={(e) => onSlide('theme.wbarHeight', 'wbarHeight', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-wr">Border radius ({f("wbarRadius", 30, "px")})</label>
				<input id="t-wr" type="range" min="0" max="30" step="1" value={local.wbarRadius ?? 0} oninput={(e) => onSlide('theme.wbarRadius', 'wbarRadius', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-woo">Wave off ({f("waveOpacityOff", 1, "", true)})</label>
				<input id="t-woo" type="range" min="0" max="1" step="0.05" value={local.waveOpacityOff ?? 0.3} oninput={(e) => onSlide('theme.waveOpacityOff', 'waveOpacityOff', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-won">Wave on ({f("waveOpacityOn", 1, "", true)})</label>
				<input id="t-won" type="range" min="0" max="1" step="0.05" value={local.waveOpacityOn ?? 0.8} oninput={(e) => onSlide('theme.waveOpacityOn', 'waveOpacityOn', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Section Titles -->
	<Collapsible id="section-titles" icon="📝" title="Títulos de Sección" open={false}>
		<p class="field-desc">Personaliza la apariencia de los títulos de sección (Destacados, Catálogo, etc.)</p>
		<div class="field">
			<label for="t-sts">Tamaño</label>
			<select id="t-sts" onchange={(e) => update('theme.sectionTitleSize', e.currentTarget.value)}>
				<option value="" selected={!t.sectionTitleSize}>Default</option>
				<option value="1.25rem" selected={t.sectionTitleSize === '1.25rem'}>SM (1.25rem)</option>
				<option value="1.5rem" selected={t.sectionTitleSize === '1.5rem'}>MD (1.5rem)</option>
				<option value="2rem" selected={t.sectionTitleSize === '2rem'}>LG (2rem)</option>
				<option value="2.5rem" selected={t.sectionTitleSize === '2.5rem'}>XL (2.5rem)</option>
			</select>
		</div>
		<div class="field">
			<label for="t-stw">Peso ({t.sectionTitleWeight || 'auto'})</label>
			<input id="t-stw" type="range" min="100" max="900" step="100" value={t.sectionTitleWeight || 700} oninput={(e) => update('theme.sectionTitleWeight', +e.currentTarget.value || 0)} />
		</div>
		<div class="field">
			<label for="t-sta">Alineación</label>
			<select id="t-sta" onchange={(e) => update('theme.sectionTitleAlign', e.currentTarget.value)}>
				<option value="" selected={!t.sectionTitleAlign}>Izquierda</option>
				<option value="center" selected={t.sectionTitleAlign === 'center'}>Centro</option>
				<option value="right" selected={t.sectionTitleAlign === 'right'}>Derecha</option>
			</select>
		</div>
		<div class="field">
			<label for="t-stc">Color</label>
			<div class="color-row">
				<input id="t-stc" type="color" value={t.sectionTitleColor || '#ffffff'} oninput={(e) => update('theme.sectionTitleColor', e.currentTarget.value)} />
				<input type="text" value={t.sectionTitleColor ?? ''} placeholder="(default)" oninput={(e) => update('theme.sectionTitleColor', e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>
	<!-- Background Pattern -->
	<Collapsible id="bg-pattern" icon="🎨" title="Fondo" open={false}>
		<div class="field">
			<label for="t-bgp">Patrón de fondo</label>
			<select id="t-bgp" onchange={(e) => update('theme.bgPattern', e.currentTarget.value)}>
				<option value="none" selected={t.bgPattern === 'none' || !t.bgPattern}>Ninguno</option>
				<option value="dots" selected={t.bgPattern === 'dots'}>Puntos</option>
				<option value="lines" selected={t.bgPattern === 'lines'}>Líneas</option>
				<option value="grid" selected={t.bgPattern === 'grid'}>Cuadrícula</option>
			</select>
		</div>
		{#if t.bgPattern && t.bgPattern !== 'none'}
			<div class="field">
				<label for="t-bgc">Color patrón</label>
				<div class="color-row">
					<input id="t-bgc" type="color" value={t.bgPatternColor || '#ffffff'} oninput={(e) => update('theme.bgPatternColor', e.currentTarget.value)} />
					<input type="text" value={t.bgPatternColor ?? ''} placeholder="(default)" oninput={(e) => update('theme.bgPatternColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-bgo">Opacidad patrón ({Math.round((t.bgPatternOpacity ?? 0.05) * 100)}%)</label>
				<input id="t-bgo" type="range" min="0" max="0.3" step="0.01" value={t.bgPatternOpacity ?? 0.05} oninput={(e) => update('theme.bgPatternOpacity', +e.currentTarget.value)} />
			</div>
		{/if}
	</Collapsible>
	<!-- Scrollbar -->
	<Collapsible id="scrollbar" icon="📏" title="Scrollbar" open={false}>
		<div class="field">
			<label>
				<input type="checkbox" checked={t.scrollbarThin ?? false} onchange={(e) => update('theme.scrollbarThin', e.currentTarget.checked)} />
				Scrollbar delgado
			</label>
		</div>
		<div class="field">
			<label for="t-sbc">Color scrollbar</label>
			<div class="color-row">
				<input id="t-sbc" type="color" value={t.scrollbarColor || '#666666'} oninput={(e) => update('theme.scrollbarColor', e.currentTarget.value)} />
				<input type="text" value={t.scrollbarColor ?? ''} placeholder="(default)" oninput={(e) => update('theme.scrollbarColor', e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>
	<!-- Custom CSS -->
	<Collapsible id="custom-css" icon="💻" title="CSS Personalizado" open={false}>
		<p class="field-desc">Inyecta CSS custom que se aplica a toda la tienda. Úsalo para overrides avanzados.</p>
		<div class="field">
			<label for="t-css">CSS</label>
			<textarea
				id="t-css"
				value={t.customCSS ?? ''}
				oninput={(e) => update('theme.customCSS', e.currentTarget.value)}
				placeholder={"/* .mi-clase { color: red; } */"}
				rows={6}
			></textarea>
		</div>
	</Collapsible>

	<!-- Theme Presets -->
	<Collapsible id="presets" icon="💾" title="Presets de Tema" open={false}>
		<p class="field-desc">Guarda y carga configuraciones completas de tema.</p>

		<!-- Save current as preset -->
		<div class="field">
			<label for="preset-name">Guardar tema actual como preset</label>
			<div class="row">
				<div class="field" style="flex:2">
					<input id="preset-name" type="text" bind:value={presetName} placeholder="Ej: Dark Neon, Minimal, etc." />
				</div>
				<div class="field" style="flex:0">
					<button class="preset-save-btn" onclick={handleSavePreset} disabled={!presetName.trim()}>
						💾 Guardar
					</button>
				</div>
			</div>
		</div>

		<!-- Saved presets -->
		{#if $themePresetsStore.length > 0}
			<div class="presets-grid">
				{#each $themePresetsStore as preset}
					<div class="preset-card">
						<div class="preset-colors">
							<span class="preset-dot" style="background: {preset.theme.accent ?? '#dc2626'}"></span>
							<span class="preset-dot" style="background: {(preset.theme as Record<string, unknown>).bgColor ?? (preset.theme as Record<string, unknown>).bg ?? '#0f0c0b'}"></span>
							<span class="preset-dot" style="background: {(preset.theme as Record<string, unknown>).surfaceColor ?? (preset.theme as Record<string, unknown>).surface ?? '#1a1a2e'}"></span>
						</div>
						<div class="preset-info">
							{#if editingPresetId === preset.id}
								<input type="text" class="preset-rename" bind:value={editingPresetName} onkeydown={(e) => e.key === 'Enter' && handleRenamePreset(preset.id)} onblur={() => handleRenamePreset(preset.id)} />
							{:else}
								<span class="preset-name" ondblclick={() => startRename(preset)}>{preset.name}</span>
							{/if}
							<span class="preset-date">{new Date(preset.createdAt).toLocaleDateString()}</span>
						</div>
						<div class="preset-actions">
							<button class="preset-btn" onclick={() => handleLoadPreset(preset)} title="Aplicar">✓</button>
							<button class="preset-btn" onclick={() => startRename(preset)} title="Renombrar">✏️</button>
							<button class="preset-btn preset-btn-danger" onclick={() => handleDeletePreset(preset)} title="Eliminar">✕</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="field-desc">No hay presets guardados. Guarda tu tema actual para poder cargarlo después.</p>
		{/if}
	</Collapsible>
</div>

<!-- Live Preview Panel -->
{#if showPreview}
<div class="preview-panel" style={previewStyle}>
	<div class="preview-header">
		<span class="preview-label">📱 Preview en Vivo</span>
		<button class="preview-close" onclick={() => showPreview = false}>✕</button>
	</div>
	<div class="preview-device" style="background: var(--pbg); color: var(--ptext);">
		<!-- Mini Nav -->
		<div class="pv-nav" style="background: var(--pbg); border-color: rgba(var(--accent-rgb), 0.2);">
			<span class="pv-logo" style="color: var(--accent);">🎵 storewav</span>
			<span class="pv-nav-links">
				<span>Beats</span>
				<span style="color: var(--accent);">Contacto</span>
			</span>
		</div>
		<!-- Mini Hero -->
		<div class="pv-hero">
			<div class="pv-hero-glow" style="background: var(--glow-color); opacity: {t.glowActive ? 0.3 : 0}; filter: blur({t.glowBlur ?? 20}px);"></div>
			<h1 class="pv-hero-title" style="font-size: {Math.min((t.fontSize ?? 14) * 1.8, 24)}px;">Beats que suenan diferente</h1>
			<p class="pv-hero-sub" style="color: var(--ptext-secondary);">Producción profesional para tu próximo hit</p>
		</div>
		<!-- Mini Cards -->
		<div class="pv-section">
			<h2 class="pv-section-title" style="color: var(--ptext);">Catálogo</h2>
			<div class="pv-cards">
				{#each [{name: 'Midnight Flow', genre: 'Trap', bpm: 140}, {name: 'Neon Dreams', genre: 'Lo-Fi', bpm: 85}, {name: 'Dark Matter', genre: 'Drill', bpm: 145}] as beat}
					<div class="pv-card" style="background: var(--psurface); opacity: {t.cardOpacity ?? 0.85}; border-radius: var(--radius); box-shadow: 0 4px 12px rgba(0,0,0, {t.cardShadowIntensity ?? 0.3});">
						<div class="pv-card-img" style="background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.4), rgba(var(--accent-rgb), 0.1)); border-radius: var(--radius) var(--radius) 0 0;"></div>
						<div class="pv-card-info">
							<span class="pv-card-name">{beat.name}</span>
							<span class="pv-card-meta" style="color: var(--ptext-secondary);">{beat.genre} · {beat.bpm} BPM</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<!-- Mini CTA Button -->
		<div class="pv-cta-wrap">
			<button class="pv-cta" style="background: var(--btn-bg); color: var(--btn-color); border-radius: var(--btn-radius);">
				💬 Pedir por WhatsApp
			</button>
		</div>
	</div>
</div>
{/if}

</div><!-- /theme-layout -->
{/if}

<style>
	/* === Admin UX: Visual Preview Elements === */
	.color-swatches-row { display: flex; gap: 3px; align-items: center; }
	.mini-swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0; }

	.palette-preview { margin-bottom: var(--space-4); padding: var(--space-3); background: var(--surface-hover); border-radius: var(--radius-md); border: 1px solid var(--border); }
	.palette-strip { display: flex; gap: 2px; border-radius: var(--radius-sm); overflow: hidden; }
	.palette-chip { flex: 1; padding: var(--space-2) var(--space-3); display: flex; flex-direction: column; gap: 2px; min-height: 48px; justify-content: center; }
	.chip-label { font-family: var(--font-mono); font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.8; }
	.chip-hex { font-family: var(--font-mono); font-size: 9px; opacity: 0.9; word-break: break-all; }

	.mini-surface-preview { width: 44px; height: 32px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); }
	.msp-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; }
	.msp-card { width: 100%; height: 100%; border-radius: 3px; border: 1px solid; display: flex; align-items: center; justify-content: center; }
	.msp-text { font-size: 10px; font-weight: 700; }

	.typo-preview { font-size: 16px; font-weight: 700; color: var(--text); line-height: 1; }

	.font-preview-box { display: flex; flex-direction: column; gap: var(--space-1); padding: var(--space-3); background: var(--surface-hover); border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: var(--space-4); }
	.fp-display { font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.fp-body { color: var(--text-secondary); }
	.fp-sample { color: var(--accent); font-weight: 500; margin-top: var(--space-1); }

	.mini-card-preview { border: 1px solid var(--border); overflow: hidden; }

	/* === Existing styles === */
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }
	.field input[type="text"], .field select, .field textarea { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field textarea { min-height: 80px; resize: vertical; font-family: var(--font-mono); font-size: var(--text-xs); }
	.field input[type="text"]:focus, .field select:focus, .field textarea:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="range"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }
	.color-row { display: flex; gap: var(--space-2); align-items: center; }
	.color-row input[type="color"] { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; padding: 2px; }
	.color-row input[type="text"] { flex: 1; }
	.quick-actions { display: flex; gap: var(--space-3); padding: var(--space-4); flex-wrap: wrap; }
	.mode-toggle { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text); font-size: var(--text-sm); cursor: pointer; transition: all var(--duration-fast); min-height: var(--touch-min); flex: 1; }
	.mode-toggle:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.08); }
	.mode-icon { font-size: var(--text-lg); }
	.mode-label { font-weight: 500; }
	.reset-btn { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3) var(--space-5); background: transparent; border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text-muted); font-size: var(--text-sm); cursor: pointer; transition: all var(--duration-fast); min-height: var(--touch-min); }
	.reset-btn:hover { color: var(--danger); border-color: var(--danger-dim); background: var(--danger-glow); }

	/* Presets */
	.presets-grid { display: flex; flex-direction: column; gap: var(--space-2); }
	.preset-card { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-md); transition: all var(--duration-fast); }
	.preset-card:hover { border-color: rgba(var(--accent-rgb), 0.3); }
	.preset-colors { display: flex; gap: 2px; flex-shrink: 0; }
	.preset-dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); }
	.preset-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
	.preset-name { font-size: var(--text-sm); color: var(--text); font-weight: 500; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.preset-date { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); }
	.preset-rename { padding: var(--space-1) var(--space-2); background: var(--surface); border: 1px solid var(--accent); border-radius: var(--radius-sm); color: var(--text); font-size: var(--text-sm); outline: none; }
	.preset-actions { display: flex; gap: var(--space-1); flex-shrink: 0; }
	.preset-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--duration-fast); }
	.preset-btn:hover { background: var(--surface-hover); color: var(--text); }
	.preset-btn-danger:hover { background: var(--danger-glow); color: var(--danger); border-color: var(--danger-dim); }
	.preset-save-btn { padding: var(--space-2) var(--space-4); min-height: var(--touch-min); background: var(--accent); border: none; border-radius: var(--radius-md); color: #fff; font-size: var(--text-sm); font-weight: 600; cursor: pointer; transition: all var(--duration-fast); white-space: nowrap; }
	.preset-save-btn:hover:not(:disabled) { opacity: 0.9; }
	.preset-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	/* Theme Layout — Split View */
	.theme-layout { display: flex; gap: var(--space-4); max-width: 1200px; margin: 0 auto; align-items: flex-start; }
	.theme-layout > .editor { flex: 1; min-width: 0; max-width: none; margin: 0; }

	.editor-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
	.preview-toggle { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-secondary); font-size: var(--text-xs); cursor: pointer; transition: all var(--duration-fast); white-space: nowrap; min-height: var(--touch-min); }
	.preview-toggle:hover { border-color: var(--accent); color: var(--text); }

	/* Preview Panel */
	.preview-panel { position: sticky; top: var(--space-4); width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); }
	.preview-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--surface-hover); border-bottom: 1px solid var(--border); }
	.preview-label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
	.preview-close { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--text-muted); cursor: pointer; border-radius: var(--radius-sm); font-size: 12px; }
	.preview-close:hover { background: var(--surface-hover); color: var(--text); }

	/* Preview Device Mockup */
	.preview-device { padding: 0; overflow: hidden; font-size: 10px; line-height: 1.4; }
	.pv-nav { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid; font-size: 9px; }
	.pv-logo { font-weight: 700; font-size: 10px; }
	.pv-nav-links { display: flex; gap: 8px; font-size: 8px; opacity: 0.7; }
	.pv-hero { position: relative; padding: 16px 10px; text-align: center; overflow: hidden; }
	.pv-hero-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 80px; border-radius: 50%; pointer-events: none; transition: all 0.3s; }
	.pv-hero-title { position: relative; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.02em; }
	.pv-hero-sub { position: relative; font-size: 9px; margin: 0; }
	.pv-section { padding: 8px 10px; }
	.pv-section-title { font-size: 11px; font-weight: 700; margin: 0 0 6px; }
	.pv-cards { display: flex; flex-direction: column; gap: 6px; }
	.pv-card { overflow: hidden; transition: all 0.2s; }
	.pv-card-img { height: 36px; }
	.pv-card-info { padding: 5px 6px; display: flex; flex-direction: column; gap: 1px; }
	.pv-card-name { font-size: 9px; font-weight: 600; }
	.pv-card-meta { font-size: 7px; }
	.pv-cta-wrap { padding: 8px 10px; display: flex; justify-content: center; }
	.pv-cta { padding: 5px 12px; font-size: 9px; font-weight: 600; border: none; cursor: default; }

	/* Responsive: hide preview on small screens */
	@media (max-width: 1100px) {
		.preview-panel { display: none; }
		.theme-layout { max-width: 800px; }
		.preview-toggle { display: none; }
	}


</style>
