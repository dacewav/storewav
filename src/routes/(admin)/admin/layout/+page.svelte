<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';

	let s = $derived($settings.data);
	let layout = $derived((s?.layout ?? {}) as Record<string, any>);

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}
</script>

<div class="editor">
	<h2 class="editor-title">📐 Layout</h2>
	<p class="editor-desc">Espaciado, tamaños y disposición de elementos.</p>

	<Card>
		<h3 class="section-title">Grid</h3>
		<div class="row">
			<div class="field">
				<label for="ly-cards">Cards por fila ({layout.cardsPerRow ?? 3})</label>
				<input id="ly-cards" type="range" min="1" max="6" step="1" value={layout.cardsPerRow ?? 3} oninput={(e) => update('layout.cardsPerRow', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label>
					<input type="checkbox" checked={layout.showWishlist !== false} onchange={(e) => update('layout.showWishlist', e.currentTarget.checked)} />
					Mostrar wishlist
				</label>
			</div>
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Logo</h3>
		<div class="row">
			<div class="field">
				<label for="ly-ls">Escala ({layout.logoScale ?? 1}x)</label>
				<input id="ly-ls" type="range" min="0.3" max="3" step="0.1" value={layout.logoScale ?? 1} oninput={(e) => update('layout.logoScale', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="ly-lw">Ancho (px, 0=auto)</label>
				<input id="ly-lw" type="number" min="0" max="300" step="10" value={layout.logoWidth ?? 80} oninput={(e) => update('layout.logoWidth', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label for="ly-lh">Alto (px, 0=auto)</label>
				<input id="ly-lh" type="number" min="0" max="300" step="10" value={layout.logoHeight ?? 0} oninput={(e) => update('layout.logoHeight', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="ly-lr">Rotación ({layout.logoRotation ?? 0}°)</label>
				<input id="ly-lr" type="range" min="-180" max="180" step="5" value={layout.logoRotation ?? 0} oninput={(e) => update('layout.logoRotation', +e.currentTarget.value)} />
			</div>
			<div class="field">
				<label>
					<input type="checkbox" checked={layout.showLogoText !== false} onchange={(e) => update('layout.showLogoText', e.currentTarget.checked)} />
					Mostrar texto junto al logo
				</label>
			</div>
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Espaciado Hero</h3>
		<div class="field">
			<label for="ly-hpt">Padding top hero (rem, 0=default)</label>
			<input id="ly-hpt" type="number" min="0" max="20" step="0.5" value={layout.heroPadTop ?? 0} oninput={(e) => update('layout.heroPadTop', +e.currentTarget.value)} />
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Player Bar</h3>
		<div class="field">
			<label for="ly-pb">Bottom offset (px)</label>
			<input id="ly-pb" type="number" min="0" max="40" step="4" value={layout.playerBottom ?? 0} oninput={(e) => update('layout.playerBottom', +e.currentTarget.value)} />
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
	.field input[type="text"], .field input[type="number"] { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color 0.2s; }
	.field input[type="text"]:focus, .field input[type="number"]:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }
</style>
