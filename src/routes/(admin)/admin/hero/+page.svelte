<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, EmojiInput , Collapsible} from '$lib/components';
	import type { HeroVisualSettings, HeroSettings, ThemeSettings, HeroColorSegment } from '$lib/stores/settings';

	let s = $derived($settings.data);
	let hv = $derived((s?.heroVisual ?? {}) as HeroVisualSettings);
	let hero = $derived((s?.hero ?? {}) as HeroSettings);
	let theme = $derived((s?.theme ?? {}) as ThemeSettings);

	let local = $state<Record<string, number>>({});
	let localInit = false;

	$effect(() => {
		if (!hv || !s || localInit) return;
		local = {
			glowInt: hv.glowInt ?? 1,
			glowBlur: hv.glowBlur ?? 20,
			wordBlur: hv.wordBlur ?? 10,
			wordOp: hv.wordOp ?? 0.35,
			strokeW: hv.strokeW ?? 1,
			gradOp: hv.gradOp ?? 0.14,
			titleSize: hv.titleSize ?? 0,
			letterSpacing: hv.letterSpacing ?? -0.04,
			lineHeight: hv.lineHeight ?? 1,
			eyebrowSize: hv.eyebrowSize ?? 0,
		};
		localInit = true;
	});

	function onSlide(dotPath: string, localKey: string, val: number) {
		local[localKey] = val;
		settings.updateFieldDebounced(dotPath, val);
	}

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}

	const LABEL_FIELDS: { key: string; label: string; group: string }[] = [
		{ key: 'search', label: 'Placeholder búsqueda', group: 'Filtros' },
		{ key: 'filterAll', label: 'Botón "Todos"', group: 'Filtros' },
		{ key: 'filterKey', label: 'Label "Tonalidad"', group: 'Filtros' },
		{ key: 'tags', label: 'Label "Tags"', group: 'Filtros' },
		{ key: 'clearAll', label: '"Limpiar todo"', group: 'Filtros' },
		{ key: 'emptyTitle', label: 'Título vacío (sin resultados)', group: 'Estados vacíos' },
		{ key: 'emptySub', label: 'Subtítulo vacío', group: 'Estados vacíos' },
		{ key: 'wishlistEmptyTitle', label: 'Wishlist vacío título', group: 'Estados vacíos' },
		{ key: 'wishlistEmptySub', label: 'Wishlist vacío subtítulo', group: 'Estados vacíos' },
		{ key: 'beatPreview', label: '"Escuchar preview"', group: 'Modal' },
		{ key: 'licenses', label: '"Licencias"', group: 'Modal' },
		{ key: 'priceFrom', label: '"Desde" (precio)', group: 'Beat Card' },
		{ key: 'statBeats', label: 'Stat "beats"', group: 'Hero Stats' },
		{ key: 'statGenres', label: 'Stat "géneros"', group: 'Hero Stats' },
		{ key: 'statLicenses', label: 'Stat "licencias"', group: 'Hero Stats' },
		{ key: 'testimonialsTitle', label: 'Título testimonios', group: 'Testimonios' },
		{ key: 'relatedBeats', label: '"Beats relacionados"', group: 'Beat Page' },
		{ key: 'backToCatalog', label: '"Volver al catálogo"', group: 'Beat Page' },
		{ key: 'preview', label: '"Escuchar preview"', group: 'Beat Page' },
		{ key: 'buy', label: '"Comprar"', group: 'Beat Page' },
		{ key: 'loginTitle', label: 'Login título', group: 'Login' },
		{ key: 'loginSub', label: 'Login subtítulo', group: 'Login' },
		{ key: 'loginBtn', label: 'Login botón', group: 'Login' },
		{ key: 'loginBack', label: 'Login "volver"', group: 'Login' },
		{ key: 'errorTitle', label: 'Error título', group: 'Error' },
		{ key: 'errorBtn', label: 'Error botón', group: 'Error' }
	];

	let labelGroups = $derived.by(() => {
		const groups: Record<string, typeof LABEL_FIELDS> = {};
		for (const f of LABEL_FIELDS) {
			(groups[f.group] ??= []).push(f);
		}
		return groups;
	});

	function fmt(key: string, max: number, unit = '', pct = false): string {
		const n = local[key] ?? 0;
		const clamped = Math.min(n, max);
		if (pct) return `${Math.round(clamped * 100)}%`;
		if (unit) return `${clamped}${unit}`;
		return String(Math.round(clamped * 100) / 100);
	}

	// Color segments editor
	let segments = $derived((hv.segments ?? []) as HeroColorSegment[]);

	function addSegment() {
		const segs = [...segments, { text: '', color: '' }];
		update('heroVisual.segments', segs);
	}

	function removeSegment(i: number) {
		const segs = segments.filter((_: HeroColorSegment, idx: number) => idx !== i);
		update('heroVisual.segments', segs);
	}

	function updateSegment(i: number, field: 'text' | 'color', val: string) {
		const segs = [...segments];
		segs[i] = { ...segs[i], [field]: val };
		update('heroVisual.segments', segs);
	}

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

<div class="editor">
	<h2 class="editor-title">🎨 Hero — Visual</h2>
	<p class="editor-desc">Personaliza la apariencia del título hero. Todos los cambios se guardan en Firebase en tiempo real.</p>

	<!-- Hero Text -->
	<Collapsible id="hero-text" icon="🏠" title="Texto" open={true}>
				<div class="field">
			<label for="hero-title">Título principal</label>
			<input id="hero-title" type="text" value={hero.title ?? ''} oninput={(e) => update('hero.title', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="hero-glow">Palabra glow (última línea)</label>
			<input id="hero-glow" type="text" value={hero.glowWord ?? ''} oninput={(e) => update('hero.glowWord', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="hero-sub">Subtítulo</label>
			<input id="hero-sub" type="text" value={hero.subtitle ?? ''} oninput={(e) => update('hero.subtitle', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="hero-eyebrow">Eyebrow (badge superior)</label>
			<input id="hero-eyebrow" type="text" value={hero.eyebrow ?? ''} oninput={(e) => update('hero.eyebrow', e.currentTarget.value)} />
		</div>
	</Collapsible>

	<!-- Title Visual -->
	<Collapsible id="hero-glow" icon="💫" title="Título — Estilo" open={false}>
				<div class="row">
			<div class="field">
				<label for="hv-size">Tamaño (rem, 0=default)</label>
				<input id="hv-size" type="number" step="0.1" min="0" max="12" value={hv.titleSize ?? 0} oninput={(e) => update('heroVisual.titleSize', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="hv-ls">Letter spacing (em)</label>
				<input id="hv-ls" type="number" step="0.01" min="-0.2" max="0.5" value={hv.letterSpacing ?? -0.04} oninput={(e) => update('heroVisual.letterSpacing', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="hv-lh">Line height</label>
				<input id="hv-lh" type="number" step="0.05" min="0.5" max="2" value={hv.lineHeight ?? 1} oninput={(e) => update('heroVisual.lineHeight', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="hv-tc">Color texto hero</label>
				<div class="color-row">
					<input id="hv-tc" type="color" value={hv.textClr || theme.textColor || '#f5eeee'} oninput={(e) => update('heroVisual.textClr', e.currentTarget.value)} />
					<input type="text" value={hv.textClr ?? ''} placeholder="(usa texto global)" oninput={(e) => update('heroVisual.textClr', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="hv-ltg">Logo-text gap ({hv.logoTextGap ?? 0}px)</label>
				<input id="hv-ltg" type="range" min="-20" max="50" step="1" value={hv.logoTextGap ?? 0} oninput={(e) => update('heroVisual.logoTextGap', +e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>

	<!-- Glow Word -->
	<Collapsible id="hero-stroke" icon="✏️" title="Glow de la palabra" open={false}>
				<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={hv.glowOn !== false} onchange={(e) => update('heroVisual.glowOn', e.currentTarget.checked)} />
					Glow activado
				</label>
			</div>
			<div class="field">
				<label for="hv-gi">Intensidad ({fmt("glowInt", 3)})</label>
				<input id="hv-gi" type="range" min="0" max="3" step="0.1" value={local.glowInt ?? 1} oninput={(e) => onSlide('heroVisual.glowInt', 'glowInt', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="hv-gb">Blur ({fmt("glowBlur", 60, "px")})</label>
				<input id="hv-gb" type="range" min="0" max="60" step="1" value={local.glowBlur ?? 20} oninput={(e) => onSlide('heroVisual.glowBlur', 'glowBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="hv-gc">Color glow</label>
				<div class="color-row">
					<input id="hv-gc" type="color" value={hv.glowClr || theme.accent || '#dc2626'} oninput={(e) => update('heroVisual.glowClr', e.currentTarget.value)} />
					<input type="text" value={hv.glowClr ?? ''} placeholder="(usa accent)" oninput={(e) => update('heroVisual.glowClr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="hv-wb">Word blur ({fmt("wordBlur", 40, "px")})</label>
				<input id="hv-wb" type="range" min="0" max="40" step="1" value={local.wordBlur ?? 10} oninput={(e) => onSlide('heroVisual.wordBlur', 'wordBlur', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="hv-wo">Word opacity ({fmt("wordOp", 1, "", true)})</label>
				<input id="hv-wo" type="range" min="0" max="1" step="0.05" value={local.wordOp ?? 0.35} oninput={(e) => onSlide('heroVisual.wordOp', 'wordOp', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<!-- Stroke Mode -->
	<Collapsible id="hero-eyebrow" icon="👁️" title="Stroke mode (outline)" open={false}>
				<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={hv.strokeOn === true} onchange={(e) => update('heroVisual.strokeOn', e.currentTarget.checked)} />
					Stroke activado
				</label>
			</div>
			<div class="field">
				<label for="hv-sw">Grosor ({fmt("strokeW", 5, "px")})</label>
				<input id="hv-sw" type="range" min="0.5" max="5" step="0.5" value={local.strokeW ?? 1} oninput={(e) => onSlide('heroVisual.strokeW', 'strokeW', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="hv-sc">Color stroke</label>
				<div class="color-row">
					<input id="hv-sc" type="color" value={hv.strokeClr || theme.accent || '#dc2626'} oninput={(e) => update('heroVisual.strokeClr', e.currentTarget.value)} />
					<input type="text" value={hv.strokeClr ?? ''} placeholder="(usa accent)" oninput={(e) => update('heroVisual.strokeClr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
	</Collapsible>

	<!-- Color Segments -->
	<Collapsible id="hero-gradient" icon="🌈" title="Colores por palabra" open={false}>
				<p class="field-desc">Define segmentos de texto con colores individuales. Si hay segmentos, reemplaza el título normal.</p>
		{#each segments as seg, i}
			<div class="row segment-row">
				<div class="field" style="flex:2">
					<input type="text" value={seg.text} placeholder="Texto del segmento" oninput={(e) => updateSegment(i, 'text', e.currentTarget.value)} />
				</div>
				<div class="field">
					<div class="color-row">
						<input type="color" value={seg.color || '#ffffff'} oninput={(e) => updateSegment(i, 'color', e.currentTarget.value)} />
						<input type="text" value={seg.color} placeholder="Color" oninput={(e) => updateSegment(i, 'color', e.currentTarget.value)} />
					</div>
				</div>
				<button class="btn-remove" onclick={() => removeSegment(i)} aria-label="Eliminar segmento" title="Eliminar">✕</button>
			</div>
		{/each}
		<button class="btn-add" onclick={addSegment}>+ Añadir segmento</button>
	</Collapsible>

	<!-- Eyebrow -->
	<Collapsible id="hero-segments" icon="📊" title="Eyebrow badge" open={false}>
				<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={hv.eyebrowOn !== false} onchange={(e) => update('heroVisual.eyebrowOn', e.currentTarget.checked)} />
					Mostrar eyebrow
				</label>
			</div>
			<div class="field">
				<label for="hv-ec">Color</label>
				<div class="color-row">
					<input id="hv-ec" type="color" value={hv.eyebrowClr || theme.accent || '#dc2626'} oninput={(e) => update('heroVisual.eyebrowClr', e.currentTarget.value)} />
					<input type="text" value={hv.eyebrowClr ?? ''} placeholder="(usa accent)" oninput={(e) => update('heroVisual.eyebrowClr', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="hv-es">Tamaño (px, 0=default)</label>
				<input id="hv-es" type="number" min="0" max="30" value={hv.eyebrowSize ?? 0} oninput={(e) => update('heroVisual.eyebrowSize', +e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>

	<!-- Background Gradient -->
	<Collapsible id="hero-visual" icon="🎨" title="Gradiente de fondo" open={false}>
				<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={hv.gradOn !== false} onchange={(e) => update('heroVisual.gradOn', e.currentTarget.checked)} />
					Gradiente activado
				</label>
			</div>
			<div class="field">
				<label for="hv-gcl">Color gradiente</label>
				<div class="color-row">
					<input id="hv-gcl" type="color" value={hv.gradClr || theme.accent || '#dc2626'} oninput={(e) => update('heroVisual.gradClr', e.currentTarget.value)} />
					<input type="text" value={hv.gradClr ?? ''} placeholder="(usa accent)" oninput={(e) => update('heroVisual.gradClr', e.currentTarget.value)} />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="hv-go">Opacidad ({fmt("gradOp", 1, "", true)})</label>
				<input id="hv-go" type="range" min="0" max="1" step="0.01" value={local.gradOp ?? 0.14} oninput={(e) => onSlide('heroVisual.gradOp', 'gradOp', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="hv-gw">Ancho ({Math.min(hv.gradW ?? 80, 100)}%)</label>
				<input id="hv-gw" type="range" min="10" max="100" step="5" value={hv.gradW ?? 80} oninput={(e) => update('heroVisual.gradW', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="hv-gh">Alto ({Math.min(hv.gradH ?? 60, 100)}%)</label>
				<input id="hv-gh" type="range" min="10" max="100" step="5" value={hv.gradH ?? 60} oninput={(e) => update('heroVisual.gradH', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="field">
			<label for="hv-pt">Padding top (rem, 0=default)</label>
			<input id="hv-pt" type="number" step="0.5" min="0" max="20" value={hv.padTop ?? 0} oninput={(e) => update('heroVisual.padTop', +e.currentTarget.value)} />
		</div>
	</Collapsible>
</div>


	<!-- ════════════════════════════════════════════
	     SECCIÓN CATÁLOGO & CTA (antes en /admin/content)
	     ════════════════════════════════════════════ -->

	<div class="section-divider">
		<span class="divider-text">📋 Contenido de secciones</span>
	</div>

	<Collapsible id="catalog-section" icon="📋" title="Sección Catálogo" open={false}>
		<div class="field">
			<label for="sec-title">Título sección</label>
			<input id="sec-title" type="text" value={section.title ?? ''} oninput={(e) => update('section.title', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="sec-div">Divider título (HTML + emojis permitido)</label>
			<EmojiInput
				value={section.dividerTitle ?? ''}
				placeholder="Todo fire. :fire: Zero filler."
				multiline={false}
				oninput={(val) => update('section.dividerTitle', val)}
			/>
		</div>
		<div class="field">
			<label for="sec-divs">Divider subtítulo</label>
			<EmojiInput
				value={section.dividerSub ?? ''}
				placeholder="Subtítulo del divider (usa :emoji_name:)"
				multiline={false}
				oninput={(val) => update('section.dividerSub', val)}
			/>
		</div>
	</Collapsible>

	<Collapsible id="divider-style" icon="🎨" title="Estilo del Divider" open={false}>
		<div class="row">
			<div class="field">
				<label for="div-ts">Tamaño título</label>
				<select id="div-ts" onchange={(e) => update('section.dividerTitleSize', +e.currentTarget.value || undefined)}>
					<option value="" selected={!section.dividerTitleSize}>Default</option>
					<option value="1">1rem</option>
					<option value="1.25">1.25rem</option>
					<option value="1.5">1.5rem</option>
					<option value="2">2rem</option>
					<option value="2.5">2.5rem</option>
					<option value="3">3rem</option>
					<option value="4">4rem</option>
				</select>
			</div>
			<div class="field">
				<label for="div-ls">Letter spacing ({section.dividerLetterSpacing ?? 0}em)</label>
				<input id="div-ls" type="range" min="-0.2" max="0.5" step="0.01" value={section.dividerLetterSpacing ?? 0} oninput={(e) => update('section.dividerLetterSpacing', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="div-sc">Color subtítulo</label>
				<div class="color-row">
					<input id="div-sc" type="color" value={section.dividerSubColor || '#ffffff'} oninput={(e) => update('section.dividerSubColor', e.currentTarget.value)} />
					<input type="text" value={section.dividerSubColor ?? ''} placeholder="(default)" oninput={(e) => update('section.dividerSubColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="div-ss">Tamaño subtítulo ({section.dividerSubSize ?? 14}px)</label>
				<input id="div-ss" type="range" min="6" max="30" step="1" value={section.dividerSubSize ?? 14} oninput={(e) => update('section.dividerSubSize', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label>
					<input type="checkbox" checked={section.dividerGlowOn === true} onchange={(e) => update('section.dividerGlowOn', e.currentTarget.checked)} />
					Glow en divider
				</label>
			</div>
			<div class="field">
				<label for="div-gi">Glow intensidad ({section.dividerGlowInt ?? 1})</label>
				<input id="div-gi" type="range" min="0" max="10" step="0.5" value={section.dividerGlowInt ?? 1} oninput={(e) => update('section.dividerGlowInt', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="div-gb">Glow blur ({section.dividerGlowBlur ?? 20}px)</label>
				<input id="div-gb" type="range" min="0" max="200" step="5" value={section.dividerGlowBlur ?? 20} oninput={(e) => update('section.dividerGlowBlur', +e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>

	<Collapsible id="cta" icon="💬" title="CTA (Call to Action)" open={false}>
		<div class="field">
			<label for="cta-t">Título</label>
			<input id="cta-t" type="text" value={cta.title ?? ''} oninput={(e) => update('cta.title', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="cta-s">Subtítulo</label>
			<EmojiInput
				value={cta.subtitle ?? ''}
				placeholder="Subtítulo del CTA"
				multiline={false}
				oninput={(val) => update('cta.subtitle', val)}
			/>
		</div>
		<div class="row">
			<div class="field">
				<label for="cta-b">Texto botón</label>
				<input id="cta-b" type="text" value={cta.buttonText ?? ''} oninput={(e) => update('cta.buttonText', e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="cta-u">URL botón</label>
				<input id="cta-u" type="text" value={cta.buttonUrl ?? ''} oninput={(e) => update('cta.buttonUrl', e.currentTarget.value)} />
			</div>
		</div>
	</Collapsible>

	{#each Object.entries(labelGroups) as [group, fields]}
		<Collapsible id="labels-{group.toLowerCase().replace(/\s/g, '-')}" icon="🏷️" title="Labels — {group}" open={false}>
			{#each fields as f}
				<div class="field">
					<label for="lbl-{f.key}">{f.label}</label>
					<input id="lbl-{f.key}" type="text" value={(labels as Record<string, unknown>)[f.key] ?? ''} oninput={(e) => update(`labels.${f.key}`, e.currentTarget.value)} />
				</div>
			{/each}
		</Collapsible>
	{/each}
<style>
	.editor {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.editor-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.editor-desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.field-desc {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-bottom: var(--space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}

	.field label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.field input[type="text"],
	.field input[type="number"] {
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.field input[type="text"]:focus,
	.field input[type="number"]:focus {
		border-color: rgba(var(--accent-rgb), 0.5);
	}

	.field input[type="range"] {
		width: 100%;
		accent-color: var(--accent);
	}
	.field input[type="range"]:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.field input[type="checkbox"] {
		accent-color: var(--accent);
		width: 16px;
		height: 16px;
	}

	.row {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.row .field {
		flex: 1;
		min-width: 120px;
	}

	.color-row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.color-row input[type="color"] {
		width: 36px;
		height: 36px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		cursor: pointer;
		padding: 2px;
	}

	.color-row input[type="text"] {
		flex: 1;
	}

	.segment-row {
		align-items: flex-end;
		padding: var(--space-2);
		background: var(--surface);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
	}

	.btn-remove {
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: all var(--duration-fast);
		flex-shrink: 0;
	}

	.btn-remove:hover {
		color: var(--danger);
		border-color: var(--danger);
		background: var(--danger-glow);
	}

	.btn-add {
		padding: var(--space-2) var(--space-4);
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: all var(--duration-fast);
		min-height: var(--touch-min);
	}

	.btn-add:hover {
		border-color: rgba(var(--accent-rgb), 0.5);
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.05);
	}

	.section-divider {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin: var(--space-6) 0 var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
	}
	.divider-text {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}
</style>
