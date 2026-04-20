<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';

	let s = $derived($settings.data);
	let brand = $derived((s?.brand ?? {}) as Record<string, any>);
	let loader = $derived((s?.loader ?? {}) as Record<string, any>);

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}
</script>

<div class="editor">
	<h2 class="editor-title">🏢 Brand</h2>
	<p class="editor-desc">Nombre, logo, favicon y metadatos.</p>

	<Card>
		<h3 class="section-title">Identidad</h3>
		<div class="field">
			<label for="b-name">Nombre de marca</label>
			<input id="b-name" type="text" value={brand.name ?? ''} oninput={(e) => update('brand.name', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="b-logo">URL logo (dejar vacío = texto)</label>
			<input id="b-logo" type="text" value={brand.logo ?? ''} oninput={(e) => update('brand.logo', e.currentTarget.value)} placeholder="https://..." />
		</div>
		<div class="field">
			<label for="b-fav">URL favicon (SVG/PNG, vacío = default)</label>
			<input id="b-fav" type="text" value={brand.favicon ?? ''} oninput={(e) => update('brand.favicon', e.currentTarget.value)} placeholder="https://..." />
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Footer y SEO</h3>
		<div class="field">
			<label for="b-ft">Footer texto</label>
			<input id="b-ft" type="text" value={brand.footerText ?? ''} oninput={(e) => update('brand.footerText', e.currentTarget.value)} />
		</div>
		<div class="field">
			<label for="b-meta">Meta description (SEO)</label>
			<input id="b-meta" type="text" value={brand.metaDescription ?? ''} oninput={(e) => update('brand.metaDescription', e.currentTarget.value)} />
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Loader</h3>
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
	</Card>
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }
	.field input[type="text"] { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field input[type="text"]:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
</style>
