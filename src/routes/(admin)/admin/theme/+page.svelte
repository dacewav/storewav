<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, AdminSkeleton, HelpTip } from '$lib/components';
	import type { ThemeSettings } from '$lib/stores/settings';

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
</script>

{#if $settings.loading}
	<div class="editor">
		<AdminSkeleton variant="full" />
	</div>
{:else}
<div class="editor">
	<h2 class="editor-title">🎨 Tema Global</h2>
	<p class="editor-desc">Colores, glow, tipografía y efectos visuales de toda la tienda.</p>

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
		<h3 class="section-title">Partículas</h3>
		<div class="field">
			<label>
				<input type="checkbox" checked={t.particlesOn === true} onchange={(e) => update('theme.particlesOn', e.currentTarget.checked)} />
				Partículas activadas
			</label>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-pc">Cantidad ({fmt("particlesCount", 200)})</label>
				<input id="t-pc" type="range" min="10" max="200" step="10" value={local.particlesCount ?? 50} oninput={(e) => onSlide('theme.particlesCount', 'particlesCount', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-ps">Velocidad ({fmt("particlesSpeed", 5)})</label>
				<input id="t-ps" type="range" min="0.1" max="5" step="0.1" value={local.particlesSpeed ?? 1} oninput={(e) => onSlide('theme.particlesSpeed', 'particlesSpeed', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-pt">Tipo</label>
				<select id="t-pt" value={t.particlesType ?? 'circle'} onchange={(e) => update('theme.particlesType', e.currentTarget.value)}>
					{#each PARTICLE_TYPES as p}<option value={p}>{p}</option>{/each}
				</select>
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
		<div class="row">
			<div class="field">
				<label for="t-pcl">Color</label>
				<div class="color-row">
					<input id="t-pcl" type="color" value={t.particlesColor || '#dc2626'} oninput={(e) => update('theme.particlesColor', e.currentTarget.value)} />
					<input type="text" value={t.particlesColor ?? ''} placeholder="(accent)" oninput={(e) => update('theme.particlesColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-pop">Opacidad ({fmt("particlesOpacity", 1, "", true)})</label>
				<input id="t-pop" type="range" min="0" max="1" step="0.05" value={local.particlesOpacity ?? 0.3} oninput={(e) => onSlide('theme.particlesOpacity', 'particlesOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		{#if t.particlesType === 'text'}
			<div class="field">
				<label for="t-ptx">Texto partícula</label>
				<input id="t-ptx" type="text" value={t.particlesText ?? ''} oninput={(e) => update('theme.particlesText', e.currentTarget.value)} />
			</div>
		{/if}
		{#if t.particlesType === 'image'}
			<div class="field">
				<label for="t-piu">URL imagen</label>
				<input id="t-piu" type="text" value={t.particlesImgUrl ?? ''} oninput={(e) => update('theme.particlesImgUrl', e.currentTarget.value)} />
			</div>
		{/if}
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
</div>
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
</style>
