<script lang="ts">
	import { settings, themePresets as themePresetsStore, savePreset, loadPreset, deletePreset, renamePreset } from '$lib/stores';
	import { Card, AdminSkeleton, HelpTip } from '$lib/components';
	import type { ThemeSettings } from '$lib/stores/settings';
	import type { ThemePreset } from '$lib/stores';

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
				glowIntensity: t.glowIntensity ?? 1,
				glowBlur: t.glowBlur ?? 20,
				glowAnimSpeed: t.glowAnimSpeed ?? 2,
				fontWeight: t.fontWeight ?? 400,
				fontSize: t.fontSize ?? 14,
				lineHeight: t.lineHeight ?? 1.6,
				radiusGlobal: t.radiusGlobal ?? 12,
				sectionPadding: t.sectionPadding ?? 4,
				beatGap: t.beatGap ?? 16,
				cardOpacity: t.cardOpacity ?? 0.85,
				blurBg: t.blurBg ?? 20,
				grainOpacity: t.grainOpacity ?? 0.03,
				cardShadowIntensity: t.cardShadowIntensity ?? 0.3,
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
				heroGlowInt: t.heroGlowInt ?? 1,
				heroGlowBlur: t.heroGlowBlur ?? 20,
				heroStrokeW: t.heroStrokeW ?? 1,
				particlesCount: t.particlesCount ?? 50,
				particlesSpeed: t.particlesSpeed ?? 1,
				particlesSizeMin: t.particlesSizeMin ?? 3,
				particlesSizeMax: t.particlesSizeMax ?? 8,
				particlesOpacity: t.particlesOpacity ?? 0.3,
				navBlur: t.navBlur ?? 24,
				ctaBtnRadius: t.ctaBtnRadius ?? 12,
				containerMaxWidth: t.containerMaxWidth ?? 1200,
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

	/** Format slider value for display */
	function fmt(key: string, max: number, unit = '', pct = false): string {
		const n = local[key] ?? 0;
		const clamped = Math.min(n, max);
		if (pct) return `${Math.round(clamped * 100)}%`;
		if (unit === 's') return `${clamped}s`;
		if (unit) return `${clamped}${unit}`;
		return String(Math.round(clamped * 100) / 100);
	}

	const ANIMS = ['none', 'float', 'pulse', 'bounce', 'spin', 'shake', 'glow', 'slide-up', 'slide-down', 'fade-in'];
	const PARTICLE_TYPES = ['circle', 'square', 'line', 'text', 'image'];
	const BLEND_MODES = ['normal', 'screen', 'overlay', 'multiply', 'soft-light', 'hard-light', 'color-dodge'];
	const GLOW_ANIMS = ['none', 'pulse', 'breathe', 'spin'];

	/** Shift+Arrow for 10x step on sliders */
	function handleShiftArrows(e: KeyboardEvent) {
		if (!e.shiftKey) return;
		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
		e.preventDefault();
		const input = e.currentTarget as HTMLInputElement;
		const min = parseFloat(input.min);
		const max = parseFloat(input.max);
		const step = parseFloat(input.step) || 1;
		const dir = (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -1 : 1;
		const newVal = Math.max(min, Math.min(max, parseFloat(input.value) + dir * step * 10));
		const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
		if (nativeSetter) nativeSetter.call(input, String(newVal));
		else input.value = String(newVal);
		input.dispatchEvent(new Event('input', { bubbles: true }));
	}

	// Preview panel toggle
	let showPreview = $state(true);

	// Particle image upload
	let particleUploading = $state(false);
	let particleUploadProgress = $state(0);

	async function handleParticleImageUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		particleUploading = true;
		particleUploadProgress = 0;
		try {
			const { uploadFile } = await import('$lib/upload');
			const ext = file.name.split('.').pop() ?? 'png';
			const filename = `particles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
			const result = await uploadFile(filename, file, (p) => { particleUploadProgress = p.percent; });
			update('theme.particlesImgUrl', result.url);
		} catch (err) {
			console.error('Upload failed:', err);
		} finally {
			particleUploading = false;
			particleUploadProgress = 0;
			input.value = '';
		}
	}

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

	function hexToRgb(hex: string): string {
		const h = hex.replace('#', '');
		if (h.length !== 6) return '220, 38, 38';
		const r = parseInt(h.substring(0, 2), 16);
		const g = parseInt(h.substring(2, 4), 16);
		const b = parseInt(h.substring(4, 6), 16);
		return `${r}, ${g}, ${b}`;
	}
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
	<Card>
		<h3 class="section-title">Colores <HelpTip text="El accent es el color principal de toda la tienda — botones, links, highlights. El glow es el resplandor que lo acompaña." /></h3>
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
	</Card>

	<!-- Background & Surfaces -->
	<Card>
		<h3 class="section-title">Fondo y Superficies</h3>
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
	</Card>

	<!-- Advanced Colors -->
	<Card>
		<h3 class="section-title">🎨 Colores Avanzados</h3>
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
					<input id="t-bdr" type="color" value={t.borderColor || 'rgba(255,255,255,0.06)'} oninput={(e) => update('theme.borderColor', e.currentTarget.value)} />
					<input type="text" value={t.borderColor ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.borderColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-bdr2">Borde secundario</label>
				<div class="color-row">
					<input id="t-bdr2" type="color" value={t.borderColor2 || 'rgba(255,255,255,0.12)'} oninput={(e) => update('theme.borderColor2', e.currentTarget.value)} />
					<input type="text" value={t.borderColor2 ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.borderColor2', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-txth">Texto hint/sutil</label>
				<div class="color-row">
					<input id="t-txth" type="color" value={t.textHint || 'rgba(245,238,238,0.15)'} oninput={(e) => update('theme.textHint', e.currentTarget.value)} />
					<input type="text" value={t.textHint ?? ''} placeholder="(rgba...)" oninput={(e) => update('theme.textHint', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-txtm">Texto muted</label>
				<div class="color-row">
					<input id="t-txtm" type="color" value={t.textMuted || 'rgba(245,238,238,0.25)'} oninput={(e) => update('theme.textMuted', e.currentTarget.value)} />
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
	</Card>

	<!-- Transitions & Shadows -->
	<Card>
		<h3 class="section-title">⚡ Transiciones y Sombras</h3>
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
	</Card>

	<!-- Navigation -->
	<Card>
		<h3 class="section-title">Navegación</h3>
		<div class="row">
			<div class="field">
				<label for="t-nbc">Color fondo nav</label>
				<div class="color-row">
					<input id="t-nbc" type="color" value={t.navBgColor || '#060404'} oninput={(e) => update('theme.navBgColor', e.currentTarget.value)} />
					<input type="text" value={t.navBgColor ?? ''} placeholder="(auto)" oninput={(e) => update('theme.navBgColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-nbl">Blur nav ({fmt("navBlur", 40, "px")})</label>
				<input id="t-nbl" type="range" min="0" max="40" step="2" value={local.navBlur ?? 24} oninput={(e) => onSlide('theme.navBlur', 'navBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Card>

	<!-- CTA Button -->
	<Card>
		<h3 class="section-title">Botón CTA (WhatsApp)</h3>
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
				<label for="t-ctr">Radio ({fmt("ctaBtnRadius", 50, "px")})</label>
				<input id="t-ctr" type="range" min="0" max="50" step="2" value={local.ctaBtnRadius ?? 12} oninput={(e) => onSlide('theme.ctaBtnRadius', 'ctaBtnRadius', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Card>

	<!-- Container -->
	<Card>
		<h3 class="section-title">Contenedor</h3>
		<div class="field">
			<label for="t-cmw">Ancho máximo ({fmt("containerMaxWidth", 1800, "px")})</label>
			<input id="t-cmw" type="range" min="800" max="1800" step="50" value={local.containerMaxWidth ?? 1200} oninput={(e) => onSlide('theme.containerMaxWidth', 'containerMaxWidth', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
		</div>
	</Card>

	<!-- Glow System -->
	<Card>
		<h3 class="section-title">Sistema de Glow <HelpTip text="El glow crea un resplandor alrededor de elementos importantes. Actívalo para un look más llamativo, desactívalo para uno más limpio." /></h3>
		<div class="field">
			<label>
				<input type="checkbox" checked={t.glowActive === true} onchange={(e) => update('theme.glowActive', e.currentTarget.checked)} />
				Glow global activado
			</label>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-gi">Intensidad ({fmt("glowIntensity", 3)})</label>
				<input id="t-gi" type="range" min="0" max="3" step="0.1" value={local.glowIntensity ?? 1} oninput={(e) => onSlide('theme.glowIntensity', 'glowIntensity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-gb">Blur ({fmt("glowBlur", 60, "px")})</label>
				<input id="t-gb" type="range" min="0" max="60" step="1" value={local.glowBlur ?? 20} oninput={(e) => onSlide('theme.glowBlur', 'glowBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-ga">Animación glow</label>
				<select id="t-ga" value={t.glowAnim ?? 'none'} onchange={(e) => update('theme.glowAnim', e.currentTarget.value)}>
					{#each GLOW_ANIMS as a}<option value={a}>{a}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="t-gas">Velocidad anim ({fmt("glowAnimSpeed", 10, "s")})</label>
				<input id="t-gas" type="range" min="0.5" max="10" step="0.5" value={t.glowAnimSpeed ?? 2} oninput={(e) => update('theme.glowAnimSpeed', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Card>

	<!-- Typography -->
	<Card>
		<h3 class="section-title">Tipografía</h3>
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
				<label for="t-fw">Font weight ({fmt("fontWeight", 900)})</label>
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
	</Card>

	<!-- Spacing & Shape -->
	<Card>
		<h3 class="section-title">Espaciado y Forma</h3>
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
	</Card>

	<!-- Card Effects -->
	<Card>
		<h3 class="section-title">Efectos de Card</h3>
		<div class="row">
			<div class="field">
				<label for="t-co">Card opacity ({fmt("cardOpacity", 1, "", true)})</label>
				<input id="t-co" type="range" min="0" max="1" step="0.05" value={local.cardOpacity ?? 0.85} oninput={(e) => onSlide('theme.cardOpacity', 'cardOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-blr">Blur fondo ({t.blurBg ?? 20}px)</label>
				<input id="t-blr" type="range" min="0" max="40" step="1" value={local.blurBg ?? 20} oninput={(e) => onSlide('theme.blurBg', 'blurBg', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-gr">Grain ({fmt("grainOpacity", 0.2, "", true)})</label>
				<input id="t-gr" type="range" min="0" max="0.2" step="0.01" value={local.grainOpacity ?? 0.03} oninput={(e) => onSlide('theme.grainOpacity', 'grainOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-csi">Shadow intensidad ({fmt("cardShadowIntensity", 1, "", true)})</label>
				<input id="t-csi" type="range" min="0" max="1" step="0.05" value={local.cardShadowIntensity ?? 0.3} oninput={(e) => onSlide('theme.cardShadowIntensity', 'cardShadowIntensity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-csc">Shadow color</label>
				<div class="color-row">
					<input id="t-csc" type="color" value={t.cardShadowColor || '#000000'} oninput={(e) => update('theme.cardShadowColor', e.currentTarget.value)} />
					<input type="text" value={t.cardShadowColor ?? '#000000'} oninput={(e) => update('theme.cardShadowColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Card>

	<!-- Opacities -->
	<Card>
		<h3 class="section-title">Opacidades</h3>
		<div class="row">
			<div class="field">
				<label for="t-no">Nav ({fmt("navOpacity", 1, "", true)})</label>
				<input id="t-no" type="range" min="0" max="1" step="0.05" value={local.navOpacity ?? 0.95} oninput={(e) => onSlide('theme.navOpacity', 'navOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-ho">Hero bg ({fmt("heroBgOpacity", 1, "", true)})</label>
				<input id="t-ho" type="range" min="0" max="1" step="0.05" value={local.heroBgOpacity ?? 1} oninput={(e) => onSlide('theme.heroBgOpacity', 'heroBgOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-so">Sections ({fmt("sectionOpacity", 1, "", true)})</label>
				<input id="t-so" type="range" min="0" max="1" step="0.05" value={local.sectionOpacity ?? 1} oninput={(e) => onSlide('theme.sectionOpacity', 'sectionOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bio">Beat images ({fmt("beatImgOpacity", 1, "", true)})</label>
				<input id="t-bio" type="range" min="0" max="1" step="0.05" value={local.beatImgOpacity ?? 1} oninput={(e) => onSlide('theme.beatImgOpacity', 'beatImgOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-to">Text ({fmt("textOpacity", 1, "", true)})</label>
				<input id="t-to" type="range" min="0" max="1" step="0.05" value={local.textOpacity ?? 1} oninput={(e) => onSlide('theme.textOpacity', 'textOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-bo">Btn normal ({fmt("btnOpacityNormal", 1, "", true)})</label>
				<input id="t-bo" type="range" min="0" max="1" step="0.05" value={local.btnOpacityNormal ?? 1} oninput={(e) => onSlide('theme.btnOpacityNormal', 'btnOpacityNormal', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bh">Btn hover ({fmt("btnOpacityHover", 1, "", true)})</label>
				<input id="t-bh" type="range" min="0" max="1" step="0.05" value={local.btnOpacityHover ?? 1} oninput={(e) => onSlide('theme.btnOpacityHover', 'btnOpacityHover', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-bgo">Background ({fmt("bgOpacity", 1, "", true)})</label>
				<input id="t-bgo" type="range" min="0" max="1" step="0.05" value={local.bgOpacity ?? 1} oninput={(e) => onSlide('theme.bgOpacity', 'bgOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Card>

	<!-- Player Bar -->
	<Card>
		<h3 class="section-title">Player Bar</h3>
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
				<label for="t-wh">Alto ({fmt("wbarHeight", 100, "px")})</label>
				<input id="t-wh" type="range" min="48" max="100" step="4" value={local.wbarHeight ?? 64} oninput={(e) => onSlide('theme.wbarHeight', 'wbarHeight', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-wr">Border radius ({fmt("wbarRadius", 30, "px")})</label>
				<input id="t-wr" type="range" min="0" max="30" step="1" value={local.wbarRadius ?? 0} oninput={(e) => onSlide('theme.wbarRadius', 'wbarRadius', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-woo">Wave off ({fmt("waveOpacityOff", 1, "", true)})</label>
				<input id="t-woo" type="range" min="0" max="1" step="0.05" value={local.waveOpacityOff ?? 0.3} oninput={(e) => onSlide('theme.waveOpacityOff', 'waveOpacityOff', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-won">Wave on ({fmt("waveOpacityOn", 1, "", true)})</label>
				<input id="t-won" type="range" min="0" max="1" step="0.05" value={local.waveOpacityOn ?? 0.8} oninput={(e) => onSlide('theme.waveOpacityOn', 'waveOpacityOn', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Card>

	<!-- Blend Modes -->
	<Card>
		<h3 class="section-title">Blend Modes</h3>
		<div class="row">
			<div class="field">
				<label for="t-obm">Orbs blend</label>
				<select id="t-obm" value={t.orbBlendMode ?? 'screen'} onchange={(e) => update('theme.orbBlendMode', e.currentTarget.value)}>
					{#each BLEND_MODES as m}<option value={m}>{m}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="t-gbm">Grain blend</label>
				<select id="t-gbm" value={t.grainBlendMode ?? 'overlay'} onchange={(e) => update('theme.grainBlendMode', e.currentTarget.value)}>
					{#each BLEND_MODES as m}<option value={m}>{m}</option>{/each}
				</select>
			</div>
		</div>
	</Card>

	<!-- Hero Glow -->
	<Card>
		<h3 class="section-title">Hero Glow (fondo)</h3>
		<div class="field">
			<label>
				<input type="checkbox" checked={t.heroGlowOn === true} onchange={(e) => update('theme.heroGlowOn', e.currentTarget.checked)} />
				Hero glow activado
			</label>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-hgi">Intensidad ({fmt("heroGlowInt", 3)})</label>
				<input id="t-hgi" type="range" min="0" max="3" step="0.1" value={local.heroGlowInt ?? 1} oninput={(e) => onSlide('theme.heroGlowInt', 'heroGlowInt', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-hgb">Blur ({fmt("heroGlowBlur", 60, "px")})</label>
				<input id="t-hgb" type="range" min="0" max="60" step="1" value={local.heroGlowBlur ?? 20} oninput={(e) => onSlide('theme.heroGlowBlur', 'heroGlowBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="field">
			<label for="t-hgc">Color glow hero</label>
			<div class="color-row">
				<input id="t-hgc" type="color" value={t.heroGlowClr || t.accent || '#dc2626'} oninput={(e) => update('theme.heroGlowClr', e.currentTarget.value)} />
				<input type="text" value={t.heroGlowClr ?? ''} placeholder="(usa accent)" oninput={(e) => update('theme.heroGlowClr', e.currentTarget.value)} />
			</div>
		</div>
	</Card>

	<!-- Hero Stroke -->
	<Card>
		<h3 class="section-title">Hero Stroke (outline título)</h3>
		<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={t.heroStrokeOn === true} onchange={(e) => update('theme.heroStrokeOn', e.currentTarget.checked)} />
					Stroke activado
				</label>
			</div>
			<div class="field">
				<label for="t-hsw">Grosor ({fmt("heroStrokeW", 5, "px")})</label>
				<input id="t-hsw" type="range" min="0.5" max="5" step="0.5" value={local.heroStrokeW ?? 1} oninput={(e) => onSlide('theme.heroStrokeW', 'heroStrokeW', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-hsc">Color stroke</label>
				<div class="color-row">
					<input id="t-hsc" type="color" value={t.heroStrokeClr || t.accent || '#dc2626'} oninput={(e) => update('theme.heroStrokeClr', e.currentTarget.value)} />
					<input type="text" value={t.heroStrokeClr ?? ''} placeholder="(usa accent)" oninput={(e) => update('theme.heroStrokeClr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Card>

	<!-- License Buttons -->
	<Card>
		<h3 class="section-title">Botones de Licencia</h3>
		<div class="row">
			<div class="field">
				<label for="t-lbg">Fondo</label>
				<div class="color-row">
					<input id="t-lbg" type="color" value={t.btnLicBg || '#1a1a1a'} oninput={(e) => update('theme.btnLicBg', e.currentTarget.value)} />
					<input type="text" value={t.btnLicBg ?? ''} placeholder="(default)" oninput={(e) => update('theme.btnLicBg', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-lbc">Texto</label>
				<div class="color-row">
					<input id="t-lbc" type="color" value={t.btnLicClr || '#ffffff'} oninput={(e) => update('theme.btnLicClr', e.currentTarget.value)} />
					<input type="text" value={t.btnLicClr ?? ''} placeholder="(default)" oninput={(e) => update('theme.btnLicClr', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-lbb">Border</label>
				<div class="color-row">
					<input id="t-lbb" type="color" value={t.btnLicBdr || '#333333'} oninput={(e) => update('theme.btnLicBdr', e.currentTarget.value)} />
					<input type="text" value={t.btnLicBdr ?? ''} placeholder="(default)" oninput={(e) => update('theme.btnLicBdr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Card>

	<!-- Particles -->
	<Card>
		<h3 class="section-title">✨ Partículas</h3>
		<p class="field-desc">Efecto de partículas flotantes sobre el fondo de la tienda.</p>

		<!-- Toggle + Preview side by side -->
		<div class="particles-layout">
			<div class="particles-controls">
				<div class="toggle-row">
					<label class="toggle-label">
						<input type="checkbox" checked={t.particlesOn === true} onchange={(e) => update('theme.particlesOn', e.currentTarget.checked)} />
						<span class="toggle-text">Partículas {t.particlesOn === true ? 'activadas' : 'desactivadas'}</span>
					</label>
					<span class="toggle-badge" class:active={t.particlesOn === true}>{t.particlesOn === true ? 'ON' : 'OFF'}</span>
				</div>

				<!-- Type selector as visual pills -->
				<div class="field">
					<label>Tipo de partícula</label>
					<div class="type-pills">
						{#each PARTICLE_TYPES as pt}
							<button
								class="type-pill"
								class:active={t.particlesType === pt}
								onclick={() => update('theme.particlesType', pt)}
								title={pt}
							>
								<span class="pill-icon">
									{#if pt === 'circle'}●{:else if pt === 'square'}■{:else if pt === 'line'}╱{:else if pt === 'text'}Aa{:else if pt === 'image'}🖼️{/if}
								</span>
								<span class="pill-name">{pt}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Live Preview -->
			<div class="particles-preview-wrap">
				<span class="preview-label">Preview en vivo</span>
				{#await import('$lib/components/ParticlesPreview.svelte') then mod}
					<mod.default
						count={local.particlesCount ?? 50}
						speed={local.particlesSpeed ?? 1}
						type={t.particlesType ?? 'circle'}
						color={t.particlesColor ?? ''}
						opacity={local.particlesOpacity ?? 0.3}
						text={t.particlesText ?? ''}
						imgUrl={t.particlesImgUrl ?? ''}
						sizeMin={local.particlesSizeMin ?? 3}
						sizeMax={local.particlesSizeMax ?? 8}
						accent={t.accent ?? '#dc2626'}
					/>
				{/await}
			</div>
		</div>

		<!-- Size & Speed -->
		<div class="control-group">
			<span class="group-label">📏 Tamaño y Movimiento</span>
			<div class="row">
				<div class="field">
					<label for="t-pc">Cantidad ({fmt("particlesCount", 200)})</label>
					<input id="t-pc" type="range" min="10" max="200" step="10" value={local.particlesCount ?? 50} oninput={(e) => onSlide('theme.particlesCount', 'particlesCount', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
				<div class="field">
					<label for="t-ps">Velocidad ({fmt("particlesSpeed", 5)})</label>
					<input id="t-ps" type="range" min="0.1" max="5" step="0.1" value={local.particlesSpeed ?? 1} oninput={(e) => onSlide('theme.particlesSpeed', 'particlesSpeed', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
			</div>
			<div class="row">
				<div class="field">
					<label for="t-psn">Tamaño min ({fmt("particlesSizeMin", 20, "px")})</label>
					<input id="t-psn" type="range" min="1" max="20" step="1" value={local.particlesSizeMin ?? 3} oninput={(e) => onSlide('theme.particlesSizeMin', 'particlesSizeMin', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
				<div class="field">
					<label for="t-psx">Tamaño max ({fmt("particlesSizeMax", 40, "px")})</label>
					<input id="t-psx" type="range" min="2" max="40" step="1" value={local.particlesSizeMax ?? 8} oninput={(e) => onSlide('theme.particlesSizeMax', 'particlesSizeMax', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
			</div>
		</div>

		<!-- Color & Opacity -->
		<div class="control-group">
			<span class="group-label">🎨 Color y Transparencia</span>
			<div class="row">
				<div class="field">
					<label for="t-pcl">Color</label>
					<div class="color-row">
						<input id="t-pcl" type="color" value={t.particlesColor || '#dc2626'} oninput={(e) => update('theme.particlesColor', e.currentTarget.value)} />
						<input type="text" value={t.particlesColor ?? ''} placeholder="(usa accent)" oninput={(e) => update('theme.particlesColor', e.currentTarget.value)} />
					</div>
				</div>
				<div class="field">
					<label for="t-pop">Opacidad ({fmt("particlesOpacity", 1, "", true)})</label>
					<input id="t-pop" type="range" min="0" max="1" step="0.05" value={local.particlesOpacity ?? 0.3} oninput={(e) => onSlide('theme.particlesOpacity', 'particlesOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
			</div>
		</div>

		<!-- Type-specific options -->
		{#if t.particlesType === 'text'}
			<div class="control-group">
				<span class="group-label">Aa Texto</span>
				<div class="field">
					<label for="t-ptx">Texto de la partícula</label>
					<input id="t-ptx" type="text" value={t.particlesText ?? ''} oninput={(e) => update('theme.particlesText', e.currentTarget.value)} placeholder="✦" />
				</div>
			</div>
		{/if}

		{#if t.particlesType === 'image'}
			<div class="control-group">
				<span class="group-label">🖼️ Imagen</span>
				<div class="field">
					<label for="t-piu">URL de la imagen</label>
					<input id="t-piu" type="text" value={t.particlesImgUrl ?? ''} oninput={(e) => update('theme.particlesImgUrl', e.currentTarget.value)} placeholder="https://cdn.dacewav.store/..." />
				</div>
				<div class="field">
					<label>O subir imagen local</label>
					<label class="upload-zone" class:uploading={particleUploading}>
						<input type="file" accept="image/*" onchange={handleParticleImageUpload} disabled={particleUploading} />
						{#if particleUploading}
							<span class="upload-icon">⏳</span>
							<span class="upload-text">Subiendo... {particleUploadProgress}%</span>
						{:else}
							<span class="upload-icon">📁</span>
							<span class="upload-text">Click o arrastrar imagen aquí</span>
						{/if}
					</label>
				</div>
				{#if t.particlesImgUrl}
					<div class="particle-preview">
						<img src={t.particlesImgUrl} alt="Preview partícula" />
						<button class="btn-clear" onclick={() => update('theme.particlesImgUrl', '')}>✕ Quitar</button>
					</div>
				{/if}
			</div>
		{/if}
	</Card>
	<!-- Hero Height -->
	<Card>
		<h3 class="section-title">🏠 Hero</h3>
		<div class="field">
			<label for="t-hmh">Altura mínima ({t.heroMinHeight ?? 60}vh)</label>
			<input id="t-hmh" type="range" min="30" max="100" step="1" value={t.heroMinHeight ?? 60} oninput={(e) => update('theme.heroMinHeight', +e.currentTarget.value)} />
		</div>
	</Card>
	<!-- Section Titles -->
	<Card>
		<h3 class="section-title">📝 Títulos de Sección</h3>
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
	</Card>
	<!-- Background Pattern -->
	<Card>
		<h3 class="section-title">🎨 Fondo</h3>
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
	</Card>
	<!-- Scrollbar -->
	<Card>
		<h3 class="section-title">📏 Scrollbar</h3>
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
	</Card>
	<!-- Custom CSS -->
	<Card>
		<h3 class="section-title">CSS Personalizado</h3>
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
	</Card>

	<!-- Theme Presets -->
	<Card>
		<h3 class="section-title">💾 Presets de Tema</h3>
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
	</Card>
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

	/* Particle image upload */
	.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-6); border: 2px dashed var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; transition: all var(--duration-fast); min-height: 100px; }
	.upload-zone:hover { border-color: rgba(var(--accent-rgb), 0.5); background: rgba(var(--accent-rgb), 0.04); }
	.upload-zone.uploading { opacity: 0.6; pointer-events: none; }
	.upload-zone input[type="file"] { display: none; }
	.upload-icon { font-size: var(--text-2xl); }
	.upload-text { font-size: var(--text-sm); color: var(--text-secondary); }
	.particle-preview { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); }
	.particle-preview img { width: 48px; height: 48px; object-fit: contain; border-radius: var(--radius-sm); background: rgba(0,0,0,0.2); }
	.btn-clear { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: transparent; color: var(--text-muted); font-size: var(--text-xs); cursor: pointer; transition: all var(--duration-fast); }
	.btn-clear:hover { color: var(--danger); border-color: var(--danger); background: var(--danger-glow); }

	/* Particles visual layout */
	.particles-layout { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); align-items: flex-start; }
	.particles-controls { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-3); }
	.particles-preview-wrap { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: var(--space-2); }
	.preview-label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
	.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--surface-hover); border-radius: var(--radius-md); border: 1px solid var(--border); }
	.toggle-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
	.toggle-text { font-size: var(--text-sm); font-weight: 600; color: var(--text); }
	.toggle-badge { font-family: var(--font-mono); font-size: var(--text-2xs); font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); background: rgba(255,255,255,0.06); color: var(--text-muted); letter-spacing: 0.06em; }
	.toggle-badge.active { background: rgba(var(--accent-rgb), 0.15); color: var(--accent); }
	.type-pills { display: flex; gap: var(--space-2); flex-wrap: wrap; }
	.type-pill { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); color: var(--text-secondary); cursor: pointer; transition: all var(--duration-fast); min-width: 52px; }
	.type-pill:hover { border-color: rgba(var(--accent-rgb), 0.4); color: var(--text); }
	.type-pill.active { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.1); color: var(--accent); box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.15); }
	.pill-icon { font-size: var(--text-lg); line-height: 1; }
	.pill-name { font-family: var(--font-mono); font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
	.control-group { padding: var(--space-3); background: var(--surface-hover); border-radius: var(--radius-md); border: 1px solid var(--border); margin-bottom: var(--space-3); }
	.group-label { display: block; font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-3); }
	.control-group .row { margin-bottom: 0; }
	.control-group .field { margin-bottom: var(--space-2); }
	.control-group .field:last-child { margin-bottom: 0; }

	@media (max-width: 700px) {
		.particles-layout { flex-direction: column-reverse; }
		.particles-preview-wrap { width: 100%; }
	}
</style>
