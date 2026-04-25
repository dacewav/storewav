<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';
	import type { ThemeSettings } from '$lib/stores/settings';

	let s = $derived($settings.data);
	let t = $derived((s?.theme ?? {}) as ThemeSettings);

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}

	const ANIMS = ['none', 'float', 'pulse', 'bounce', 'spin', 'shake', 'glow', 'slide-up', 'slide-down', 'fade-in'];
	const PARTICLE_TYPES = ['circle', 'square', 'line', 'text', 'image'];
	const BLEND_MODES = ['normal', 'screen', 'overlay', 'multiply', 'soft-light', 'hard-light', 'color-dodge'];
	const GLOW_ANIMS = ['none', 'pulse', 'breathe', 'spin'];
</script>

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
		<h3 class="section-title">Colores</h3>
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

	<!-- Glow System -->
	<Card>
		<h3 class="section-title">Sistema de Glow</h3>
		<div class="field">
			<label>
				<input type="checkbox" checked={t.glowActive === true} onchange={(e) => update('theme.glowActive', e.currentTarget.checked)} />
				Glow global activado
			</label>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-gi">Intensidad ({t.glowIntensity ?? 1})</label>
				<input id="t-gi" type="range" min="0" max="3" step="0.1" value={t.glowIntensity ?? 1} oninput={(e) => update('theme.glowIntensity', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-gb">Blur ({t.glowBlur ?? 20}px)</label>
				<input id="t-gb" type="range" min="0" max="60" step="1" value={t.glowBlur ?? 20} oninput={(e) => update('theme.glowBlur', +e.currentTarget.value)} />
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
				<label for="t-gas">Velocidad anim ({t.glowAnimSpeed ?? 2}s)</label>
				<input id="t-gas" type="range" min="0.5" max="10" step="0.5" value={t.glowAnimSpeed ?? 2} oninput={(e) => update('theme.glowAnimSpeed', +e.currentTarget.value)} />
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
				<label for="t-fw">Font weight ({t.fontWeight ?? 400})</label>
				<input id="t-fw" type="range" min="100" max="900" step="100" value={t.fontWeight ?? 400} oninput={(e) => update('theme.fontWeight', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-fs">Base font size ({t.fontSize ?? 14}px)</label>
				<input id="t-fs" type="range" min="10" max="20" step="1" value={t.fontSize ?? 14} oninput={(e) => update('theme.fontSize', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-flh">Line height ({t.lineHeight ?? 1.6})</label>
				<input id="t-flh" type="range" min="1" max="2.5" step="0.1" value={t.lineHeight ?? 1.6} oninput={(e) => update('theme.lineHeight', +e.currentTarget.value)} />
			</div>
		</div>
	</Card>

	<!-- Spacing & Shape -->
	<Card>
		<h3 class="section-title">Espaciado y Forma</h3>
		<div class="row">
			<div class="field">
				<label for="t-r">Border radius ({t.radiusGlobal ?? 12}px)</label>
				<input id="t-r" type="range" min="0" max="30" step="1" value={t.radiusGlobal ?? 12} oninput={(e) => update('theme.radiusGlobal', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-sp">Section padding ({t.sectionPadding ?? 4}rem)</label>
				<input id="t-sp" type="range" min="1" max="10" step="0.5" value={t.sectionPadding ?? 4} oninput={(e) => update('theme.sectionPadding', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-bg">Beat gap ({t.beatGap ?? 16}px)</label>
				<input id="t-bg" type="range" min="4" max="40" step="2" value={t.beatGap ?? 16} oninput={(e) => update('theme.beatGap', +e.currentTarget.value)} />
			</div>
		</div>
	</Card>

	<!-- Card Effects -->
	<Card>
		<h3 class="section-title">Efectos de Card</h3>
		<div class="row">
			<div class="field">
				<label for="t-co">Card opacity ({t.cardOpacity ?? 0.85})</label>
				<input id="t-co" type="range" min="0" max="1" step="0.05" value={t.cardOpacity ?? 0.85} oninput={(e) => update('theme.cardOpacity', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-blr">Blur fondo ({t.blurBg ?? 20}px)</label>
				<input id="t-blr" type="range" min="0" max="40" step="1" value={t.blurBg ?? 20} oninput={(e) => update('theme.blurBg', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-gr">Grain ({t.grainOpacity ?? 0.03})</label>
				<input id="t-gr" type="range" min="0" max="0.2" step="0.01" value={t.grainOpacity ?? 0.03} oninput={(e) => update('theme.grainOpacity', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-csi">Shadow intensidad ({t.cardShadowIntensity ?? 0.3})</label>
				<input id="t-csi" type="range" min="0" max="1" step="0.05" value={t.cardShadowIntensity ?? 0.3} oninput={(e) => update('theme.cardShadowIntensity', +e.currentTarget.value)} />
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
				<label for="t-no">Nav ({t.navOpacity ?? 0.95})</label>
				<input id="t-no" type="range" min="0" max="1" step="0.05" value={t.navOpacity ?? 0.95} oninput={(e) => update('theme.navOpacity', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-ho">Hero bg ({t.heroBgOpacity ?? 1})</label>
				<input id="t-ho" type="range" min="0" max="1" step="0.05" value={t.heroBgOpacity ?? 1} oninput={(e) => update('theme.heroBgOpacity', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-so">Sections ({t.sectionOpacity ?? 1})</label>
				<input id="t-so" type="range" min="0" max="1" step="0.05" value={t.sectionOpacity ?? 1} oninput={(e) => update('theme.sectionOpacity', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bio">Beat images ({t.beatImgOpacity ?? 1})</label>
				<input id="t-bio" type="range" min="0" max="1" step="0.05" value={t.beatImgOpacity ?? 1} oninput={(e) => update('theme.beatImgOpacity', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-to">Text ({t.textOpacity ?? 1})</label>
				<input id="t-to" type="range" min="0" max="1" step="0.05" value={t.textOpacity ?? 1} oninput={(e) => update('theme.textOpacity', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-bo">Btn normal ({t.btnOpacityNormal ?? 1})</label>
				<input id="t-bo" type="range" min="0" max="1" step="0.05" value={t.btnOpacityNormal ?? 1} oninput={(e) => update('theme.btnOpacityNormal', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-bh">Btn hover ({t.btnOpacityHover ?? 1})</label>
				<input id="t-bh" type="range" min="0" max="1" step="0.05" value={t.btnOpacityHover ?? 1} oninput={(e) => update('theme.btnOpacityHover', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-bgo">Background ({t.bgOpacity ?? 1})</label>
				<input id="t-bgo" type="range" min="0" max="1" step="0.05" value={t.bgOpacity ?? 1} oninput={(e) => update('theme.bgOpacity', +e.currentTarget.value)} />
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
				<label for="t-wh">Alto ({t.wbarHeight ?? 64}px)</label>
				<input id="t-wh" type="range" min="48" max="100" step="4" value={t.wbarHeight ?? 64} oninput={(e) => update('theme.wbarHeight', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-wr">Border radius ({t.wbarRadius ?? 0}px)</label>
				<input id="t-wr" type="range" min="0" max="30" step="1" value={t.wbarRadius ?? 0} oninput={(e) => update('theme.wbarRadius', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-woo">Wave off ({t.waveOpacityOff ?? 0.3})</label>
				<input id="t-woo" type="range" min="0" max="1" step="0.05" value={t.waveOpacityOff ?? 0.3} oninput={(e) => update('theme.waveOpacityOff', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-won">Wave on ({t.waveOpacityOn ?? 0.8})</label>
				<input id="t-won" type="range" min="0" max="1" step="0.05" value={t.waveOpacityOn ?? 0.8} oninput={(e) => update('theme.waveOpacityOn', +e.currentTarget.value)} />
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
				<label for="t-hgi">Intensidad ({t.heroGlowInt ?? 1})</label>
				<input id="t-hgi" type="range" min="0" max="3" step="0.1" value={t.heroGlowInt ?? 1} oninput={(e) => update('theme.heroGlowInt', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-hgb">Blur ({t.heroGlowBlur ?? 20}px)</label>
				<input id="t-hgb" type="range" min="0" max="60" step="1" value={t.heroGlowBlur ?? 20} oninput={(e) => update('theme.heroGlowBlur', +e.currentTarget.value)} />
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
				<label for="t-pc">Cantidad ({t.particlesCount ?? 50})</label>
				<input id="t-pc" type="range" min="10" max="200" step="10" value={t.particlesCount ?? 50} oninput={(e) => update('theme.particlesCount', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="t-ps">Velocidad ({t.particlesSpeed ?? 1})</label>
				<input id="t-ps" type="range" min="0.1" max="5" step="0.1" value={t.particlesSpeed ?? 1} oninput={(e) => update('theme.particlesSpeed', +e.currentTarget.value)} />
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
				<label for="t-pcl">Color</label>
				<div class="color-row">
					<input id="t-pcl" type="color" value={t.particlesColor || '#dc2626'} oninput={(e) => update('theme.particlesColor', e.currentTarget.value)} />
					<input type="text" value={t.particlesColor ?? ''} placeholder="(accent)" oninput={(e) => update('theme.particlesColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-pop">Opacidad ({t.particlesOpacity ?? 0.3})</label>
				<input id="t-pop" type="range" min="0" max="1" step="0.05" value={t.particlesOpacity ?? 0.3} oninput={(e) => update('theme.particlesOpacity', +e.currentTarget.value)} />
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
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }
	.field input[type="text"], .field select { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field input[type="text"]:focus, .field select:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
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
