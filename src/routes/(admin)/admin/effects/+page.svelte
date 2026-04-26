<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, AdminSkeleton, HelpTip, Collapsible } from '$lib/components';
	import type { ThemeSettings } from '$lib/stores/settings';
	import { fmt, handleShiftArrows, hexToRgb, BLEND_MODES, GLOW_ANIMS, PARTICLE_TYPES } from '$lib/themeShared';

	let s = $derived($settings.data);
	let t = $derived((s?.theme ?? {}) as ThemeSettings);

	/** Local slider state — updates instantly on drag */
	let local = $state<Record<string, number>>({});
	let localInit = false;

	$effect(() => {
		if (!t || !s || localInit) return;
		local = {
			glowIntensity: t.glowIntensity ?? 1,
			glowBlur: t.glowBlur ?? 20,
			glowAnimSpeed: t.glowAnimSpeed ?? 2,
			cardOpacity: t.cardOpacity ?? 0.85,
			blurBg: t.blurBg ?? 20,
			grainOpacity: t.grainOpacity ?? 0.03,
			cardShadowIntensity: t.cardShadowIntensity ?? 0.3,
			heroGlowInt: t.heroGlowInt ?? 1,
			heroGlowBlur: t.heroGlowBlur ?? 20,
			heroStrokeW: t.heroStrokeW ?? 1,
			particlesCount: t.particlesCount ?? 50,
			particlesSpeed: t.particlesSpeed ?? 1,
			particlesSizeMin: t.particlesSizeMin ?? 3,
			particlesSizeMax: t.particlesSizeMax ?? 8,
			particlesOpacity: t.particlesOpacity ?? 0.3,
		};
		localInit = true;
	});

	function onSlide(dotPath: string, localKey: string, val: number) {
		local[localKey] = val;
		settings.updateFieldDebounced(dotPath, val);
	}

	function updateField(path: string, value: unknown) {
		settings.updateField(path, value);
	}

	function f(key: string, max: number, unit = '', pct = false): string {
		return fmt(local, key, max, unit, pct);
	}

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
			updateField('theme.particlesImgUrl', result.url);
		} catch (err) {
			console.error('Upload failed:', err);
		} finally {
			particleUploading = false;
			particleUploadProgress = 0;
			input.value = '';
		}
	}
</script>

{#if $settings.loading}
	<div class="editor" role="form" aria-label="Editor de effects">
		<AdminSkeleton variant="full" />
	</div>
{:else}
<div class="editor" role="form" aria-label="Editor de effects">
	<h2 class="editor-title">✨ Efectos Visuales</h2>
	<p class="editor-desc">Glow, partículas, hero effects y efectos de card. Todo lo que da vida a la tienda.</p>

	<!-- Glow System -->
	<Collapsible id="glow-system" icon="✨" title="Sistema de Glow" open={true}>
		{#snippet preview()}
			<div class="glow-preview-mini" style="box-shadow: 0 0 {(t.glowBlur ?? 20) / 3}px {(t.glowIntensity ?? 1) * 2}px {t.glowColor || t.accent || '#dc2626'}40; border-radius: 50%; width: 20px; height: 20px; background: {t.glowActive ? (t.glowColor || t.accent || '#dc2626') : 'var(--surface)'}; opacity: {t.glowActive ? 1 : 0.3}"></div>
		{/snippet}
		<HelpTip text="El glow crea un resplandor alrededor de elementos importantes. Actívalo para un look más llamativo, desactívalo para uno más limpio." />
		<div class="field">
			<label>
				<input type="checkbox" checked={t.glowActive === true} onchange={(e) => updateField('theme.glowActive', e.currentTarget.checked)} />
				Glow global activado
			</label>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-gi">Intensidad ({f("glowIntensity", 3)})</label>
				<input id="t-gi" type="range" min="0" max="3" step="0.1" value={local.glowIntensity ?? 1} oninput={(e) => onSlide('theme.glowIntensity', 'glowIntensity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-gb">Blur ({f("glowBlur", 60, "px")})</label>
				<input id="t-gb" type="range" min="0" max="60" step="1" value={local.glowBlur ?? 20} oninput={(e) => onSlide('theme.glowBlur', 'glowBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-ga">Animación glow</label>
				<select id="t-ga" value={t.glowAnim ?? 'none'} onchange={(e) => updateField('theme.glowAnim', e.currentTarget.value)}>
					{#each GLOW_ANIMS as a}<option value={a}>{a}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="t-gas">Velocidad anim ({f("glowAnimSpeed", 10, "s")})</label>
				<input id="t-gas" type="range" min="0.5" max="10" step="0.5" value={t.glowAnimSpeed ?? 2} oninput={(e) => updateField('theme.glowAnimSpeed', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Card Effects -->
	<Collapsible id="card-effects" icon="🃏" title="Efectos de Card" open={true}>
		{#snippet preview()}
			<div class="mini-card-preview" style="opacity:{local.cardOpacity ?? 0.85}; backdrop-filter:blur({local.blurBg ?? 20}px); box-shadow:0 4px 12px rgba(0,0,0,{local.cardShadowIntensity ?? 0.3}); border-radius:{t.radiusGlobal ?? 12}px; background:{t.surfaceColor || '#0f0808'}; width:44px; height:32px; border:1px solid {t.accent || '#dc2626'}33">
				<div style="width:100%;height:8px;background:linear-gradient(90deg,{t.accent || '#dc2626'}66,transparent);border-radius:{t.radiusGlobal ?? 12}px {t.radiusGlobal ?? 12}px 0 0"></div>
			</div>
		{/snippet}
		<HelpTip text="Opacidad: transparencia general de las cards. Blur: desenfoque del fondo detrás de las cards (efecto glass). Grain: textura de ruido sutil. Shadow: intensidad y color de la sombra." />
		<div class="row">
			<div class="field">
				<label for="t-co">Card opacity ({f("cardOpacity", 1, "", true)})</label>
				<input id="t-co" type="range" min="0" max="1" step="0.05" value={local.cardOpacity ?? 0.85} oninput={(e) => onSlide('theme.cardOpacity', 'cardOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-blr">Blur fondo ({t.blurBg ?? 20}px)</label>
				<input id="t-blr" type="range" min="0" max="40" step="1" value={local.blurBg ?? 20} oninput={(e) => onSlide('theme.blurBg', 'blurBg', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-gr">Grain ({f("grainOpacity", 0.2, "", true)})</label>
				<input id="t-gr" type="range" min="0" max="0.2" step="0.01" value={local.grainOpacity ?? 0.03} oninput={(e) => onSlide('theme.grainOpacity', 'grainOpacity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-csi">Shadow intensidad ({f("cardShadowIntensity", 1, "", true)})</label>
				<input id="t-csi" type="range" min="0" max="1" step="0.05" value={local.cardShadowIntensity ?? 0.3} oninput={(e) => onSlide('theme.cardShadowIntensity', 'cardShadowIntensity', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-csc">Shadow color</label>
				<div class="color-row">
					<input id="t-csc" type="color" value={t.cardShadowColor || '#000000'} oninput={(e) => updateField('theme.cardShadowColor', e.currentTarget.value)} />
					<input type="text" value={t.cardShadowColor ?? '#000000'} oninput={(e) => updateField('theme.cardShadowColor', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- Blend Modes -->
	<Collapsible id="blend-modes" icon="🎨" title="Blend Modes" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-obm">Orbs blend</label>
				<select id="t-obm" value={t.orbBlendMode ?? 'screen'} onchange={(e) => updateField('theme.orbBlendMode', e.currentTarget.value)}>
					{#each BLEND_MODES as m}<option value={m}>{m}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="t-gbm">Grain blend</label>
				<select id="t-gbm" value={t.grainBlendMode ?? 'overlay'} onchange={(e) => updateField('theme.grainBlendMode', e.currentTarget.value)}>
					{#each BLEND_MODES as m}<option value={m}>{m}</option>{/each}
				</select>
			</div>
		</div>
	</Collapsible>

	<!-- Hero Glow -->
	<Collapsible id="hero-glow" icon="💫" title="Hero Glow" open={false}>
		<HelpTip text="Añade un resplandor de color detrás del hero. Intensidad controla el brillo, blur qué tan difuso es. Color vacío usa el accent." />
		<div class="field">
			<label>
				<input type="checkbox" checked={t.heroGlowOn === true} onchange={(e) => updateField('theme.heroGlowOn', e.currentTarget.checked)} />
				Hero glow activado
			</label>
		</div>
		<div class="row">
			<div class="field">
				<label for="t-hgi">Intensidad ({f("heroGlowInt", 3)})</label>
				<input id="t-hgi" type="range" min="0" max="3" step="0.1" value={local.heroGlowInt ?? 1} oninput={(e) => onSlide('theme.heroGlowInt', 'heroGlowInt', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-hgb">Blur ({f("heroGlowBlur", 60, "px")})</label>
				<input id="t-hgb" type="range" min="0" max="60" step="1" value={local.heroGlowBlur ?? 20} oninput={(e) => onSlide('theme.heroGlowBlur', 'heroGlowBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="field">
			<label for="t-hgc">Color glow hero</label>
			<div class="color-row">
				<input id="t-hgc" type="color" value={t.heroGlowClr || t.accent || '#dc2626'} oninput={(e) => updateField('theme.heroGlowClr', e.currentTarget.value)} />
				<input type="text" value={t.heroGlowClr ?? ''} placeholder="(usa accent)" oninput={(e) => updateField('theme.heroGlowClr', e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>

	<!-- Hero Stroke -->
	<Collapsible id="hero-stroke" icon="✏️" title="Hero Stroke" open={false}>
		<HelpTip text="Añade un borde/stroke alrededor del hero. Grosor controla el ancho del borde en píxeles. Color vacío usa el accent." />
		<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={t.heroStrokeOn === true} onchange={(e) => updateField('theme.heroStrokeOn', e.currentTarget.checked)} />
					Stroke activado
				</label>
			</div>
			<div class="field">
				<label for="t-hsw">Grosor ({f("heroStrokeW", 5, "px")})</label>
				<input id="t-hsw" type="range" min="0.5" max="5" step="0.5" value={local.heroStrokeW ?? 1} oninput={(e) => onSlide('theme.heroStrokeW', 'heroStrokeW', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="t-hsc">Color stroke</label>
				<div class="color-row">
					<input id="t-hsc" type="color" value={t.heroStrokeClr || t.accent || '#dc2626'} oninput={(e) => updateField('theme.heroStrokeClr', e.currentTarget.value)} />
					<input type="text" value={t.heroStrokeClr ?? ''} placeholder="(usa accent)" oninput={(e) => updateField('theme.heroStrokeClr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- License Buttons -->
	<Collapsible id="license-btns" icon="🔘" title="Botones de Licencia" open={false}>
		<div class="row">
			<div class="field">
				<label for="t-lbg">Fondo</label>
				<div class="color-row">
					<input id="t-lbg" type="color" value={t.btnLicBg || '#1a1a1a'} oninput={(e) => updateField('theme.btnLicBg', e.currentTarget.value)} />
					<input type="text" value={t.btnLicBg ?? ''} placeholder="(default)" oninput={(e) => updateField('theme.btnLicBg', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-lbc">Texto</label>
				<div class="color-row">
					<input id="t-lbc" type="color" value={t.btnLicClr || '#ffffff'} oninput={(e) => updateField('theme.btnLicClr', e.currentTarget.value)} />
					<input type="text" value={t.btnLicClr ?? ''} placeholder="(default)" oninput={(e) => updateField('theme.btnLicClr', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="t-lbb">Border</label>
				<div class="color-row">
					<input id="t-lbb" type="color" value={t.btnLicBdr || '#333333'} oninput={(e) => updateField('theme.btnLicBdr', e.currentTarget.value)} />
					<input type="text" value={t.btnLicBdr ?? ''} placeholder="(default)" oninput={(e) => updateField('theme.btnLicBdr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- Particles -->
	<Collapsible id="particles" icon="✨" title="Partículas" open={true}>
		<p class="field-desc">Efecto de partículas flotantes sobre el fondo de la tienda.</p>

		<!-- Toggle + Preview side by side -->
		<div class="particles-layout">
			<div class="particles-controls">
				<div class="toggle-row">
					<label class="toggle-label">
						<input type="checkbox" checked={t.particlesOn === true} onchange={(e) => updateField('theme.particlesOn', e.currentTarget.checked)} />
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
								onclick={() => updateField('theme.particlesType', pt)}
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
			<span class="group-label">📏 Tamaño y Movimiento <HelpTip text="Cantidad: cuántas partículas se muestran a la vez. Velocidad: qué tan rápido se mueven. Tamaño min/max: rango de tamaños posibles para cada partícula." /></span>
			<div class="row">
				<div class="field">
					<label for="t-pc">Cantidad ({f("particlesCount", 200)})</label>
					<input id="t-pc" type="range" min="10" max="200" step="10" value={local.particlesCount ?? 50} oninput={(e) => onSlide('theme.particlesCount', 'particlesCount', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
				<div class="field">
					<label for="t-ps">Velocidad ({f("particlesSpeed", 5)})</label>
					<input id="t-ps" type="range" min="0.1" max="5" step="0.1" value={local.particlesSpeed ?? 1} oninput={(e) => onSlide('theme.particlesSpeed', 'particlesSpeed', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
			</div>
			<div class="row">
				<div class="field">
					<label for="t-psn">Tamaño min ({f("particlesSizeMin", 20, "px")})</label>
					<input id="t-psn" type="range" min="1" max="20" step="1" value={local.particlesSizeMin ?? 3} oninput={(e) => onSlide('theme.particlesSizeMin', 'particlesSizeMin', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
				<div class="field">
					<label for="t-psx">Tamaño max ({f("particlesSizeMax", 40, "px")})</label>
					<input id="t-psx" type="range" min="2" max="40" step="1" value={local.particlesSizeMax ?? 8} oninput={(e) => onSlide('theme.particlesSizeMax', 'particlesSizeMax', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
				</div>
			</div>
		</div>

		<!-- Color & Opacity -->
		<div class="control-group">
			<span class="group-label">🎨 Color y Transparencia <HelpTip text="Color vacío usa el accent del tema. Opacidad controla qué tan transparentes son las partículas (0 = invisibles, 1 = sólidas)." /></span>
			<div class="row">
				<div class="field">
					<label for="t-pcl">Color</label>
					<div class="color-row">
						<input id="t-pcl" type="color" value={t.particlesColor || '#dc2626'} oninput={(e) => updateField('theme.particlesColor', e.currentTarget.value)} />
						<input type="text" value={t.particlesColor ?? ''} placeholder="(usa accent)" oninput={(e) => updateField('theme.particlesColor', e.currentTarget.value)} />
					</div>
				</div>
				<div class="field">
					<label for="t-pop">Opacidad ({f("particlesOpacity", 1, "", true)})</label>
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
					<input id="t-ptx" type="text" value={t.particlesText ?? ''} oninput={(e) => updateField('theme.particlesText', e.currentTarget.value)} placeholder="✦" />
				</div>
			</div>
		{/if}

		{#if t.particlesType === 'image'}
			<div class="control-group">
				<span class="group-label">🖼️ Imagen</span>
				<div class="field">
					<label for="t-piu">URL de la imagen</label>
					<input id="t-piu" type="text" value={t.particlesImgUrl ?? ''} oninput={(e) => updateField('theme.particlesImgUrl', e.currentTarget.value)} placeholder="https://cdn.dacewav.store/..." />
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
						<button class="btn-clear" onclick={() => updateField('theme.particlesImgUrl', '')}>✕ Quitar</button>
					</div>
				{/if}
			</div>
		{/if}
	</Collapsible>

	<!-- Hero Height -->
	<Collapsible id="hero-height" icon="🏠" title="Hero" open={false}>
		<div class="field">
			<label for="t-hmh">Altura mínima ({t.heroMinHeight ?? 60}vh)</label>
			<input id="t-hmh" type="range" min="30" max="100" step="1" value={t.heroMinHeight ?? 60} oninput={(e) => updateField('theme.heroMinHeight', +e.currentTarget.value)} />
		</div>
	</Collapsible>
</div>
{/if}

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }
	.field input[type="text"], .field select { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field input[type="text"]:focus, .field select:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="range"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }
	.color-row { display: flex; gap: var(--space-2); align-items: center; }
	.color-row input[type="color"] { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; padding: 2px; }
	.color-row input[type="text"] { flex: 1; }

	.mini-card-preview { border: 1px solid var(--border); overflow: hidden; }
	.glow-preview-mini { transition: all 0.3s; }

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

	@media (max-width: 768px) {
		.row { flex-direction: column; }
	}
</style>
