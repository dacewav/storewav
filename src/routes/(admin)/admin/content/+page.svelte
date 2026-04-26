<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, EmojiInput } from '$lib/components';
	import type { SectionSettings, CtaSettings, LabelSettings } from '$lib/stores/settings';

	let s = $derived($settings.data);
	let section = $derived((s?.section ?? {}) as SectionSettings);
	let cta = $derived((s?.cta ?? {}) as CtaSettings);
	let labels = $derived((s?.labels ?? {}) as LabelSettings);

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
</script>

<div class="editor">
	<h2 class="editor-title">✏️ Contenido</h2>
	<p class="editor-desc">Textos de secciones, CTAs y labels editables.</p>

	<!-- Section -->
	<Card>
		<h3 class="section-title">Sección Catálogo</h3>
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
	</Card>

	<!-- Divider Styling -->
	<Card>
		<h3 class="section-title">🎨 Estilo del Divider</h3>
		<p class="field-desc">Personaliza la apariencia del divider entre secciones.</p>
		<div class="row">
			<div class="field">
				<label for="div-ts">Tamaño título</label>
				<select id="div-ts" onchange={(e) => update('section.dividerTitleSize', +e.currentTarget.value || undefined)}>
					<option value="" selected={!section.dividerTitleSize}>Default</option>
					<option value="1" selected={section.dividerTitleSize === 1}>1rem</option>
					<option value="1.25" selected={section.dividerTitleSize === 1.25}>1.25rem</option>
					<option value="1.5" selected={section.dividerTitleSize === 1.5}>1.5rem</option>
					<option value="2" selected={section.dividerTitleSize === 2}>2rem</option>
					<option value="2.5" selected={section.dividerTitleSize === 2.5}>2.5rem</option>
					<option value="3" selected={section.dividerTitleSize === 3}>3rem</option>
					<option value="4" selected={section.dividerTitleSize === 4}>4rem</option>
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
	</Card>

	<!-- CTA -->
	<Card>
		<h3 class="section-title">CTA (Call to Action)</h3>
		<div class="field">
			<label for="cta-t">Título</label>
			<input id="cta-t" type="text" value={cta.title ?? ''} oninput={(e) => update('cta.title', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="cta-s">Subtítulo</label>
			<EmojiInput
				value={cta.subtitle ?? ''}
				placeholder="Subtítulo del CTA (usa :emoji_name:)"
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
	</Card>

	<!-- Labels -->
	{#each Object.entries(labelGroups) as [group, fields]}
		<Card>
			<h3 class="section-title">Labels — {group}</h3>
			{#each fields as f}
				<div class="field">
					<label for="lbl-{f.key}">{f.label}</label>
					<input id="lbl-{f.key}" type="text" value={(labels as Record<string, unknown>)[f.key] ?? ''} oninput={(e) => update(`labels.${f.key}`, e.currentTarget.value)} />
				</div>
			{/each}
		</Card>
	{/each}
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
	.field input[type="text"] { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field input[type="text"]:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }
	.color-row { display: flex; gap: var(--space-2); align-items: center; }
	.color-row input[type="color"] { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; padding: 2px; }
	.color-row input[type="text"] { flex: 1; }
	.field select { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; min-width: 120px; }
	.field select:focus-visible { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="range"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); }
</style>
