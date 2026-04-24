<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';

	let s = $derived($settings.data);
	let section = $derived((s?.section ?? {}) as Record<string, any>);
	let cta = $derived((s?.cta ?? {}) as Record<string, any>);
	let labels = $derived((s?.labels ?? {}) as Record<string, any>);

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

	let labelGroups = $derived(() => {
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
			<label for="sec-div">Divider título (HTML permitido)</label>
			<input id="sec-div" type="text" value={section.dividerTitle ?? ''} oninput={(e) => update('section.dividerTitle', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="sec-divs">Divider subtítulo</label>
			<input id="sec-divs" type="text" value={section.dividerSub ?? ''} oninput={(e) => update('section.dividerSub', e.currentTarget.value)} />
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
			<input id="cta-s" type="text" value={cta.subtitle ?? ''} oninput={(e) => update('cta.subtitle', e.currentTarget.value)} />
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
	{#each Object.entries(labelGroups()) as [group, fields]}
		<Card>
			<h3 class="section-title">Labels — {group}</h3>
			{#each fields as f}
				<div class="field">
					<label for="lbl-{f.key}">{f.label}</label>
					<input id="lbl-{f.key}" type="text" value={labels[f.key] ?? ''} oninput={(e) => update(`labels.${f.key}`, e.currentTarget.value)} />
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
</style>
