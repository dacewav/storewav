<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';
	import type { BannerSettings } from '$lib/stores/settings';

	let s = $derived($settings.data);
	let b = $derived((s?.banner ?? {}) as BannerSettings);

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
	}

	const ANIMS = [
		{ value: 'static', label: 'Estático' },
		{ value: 'scroll', label: 'Scroll horizontal' },
		{ value: 'fade-pulse', label: 'Fade pulse' },
		{ value: 'bounce', label: 'Bounce' },
		{ value: 'glow-pulse', label: 'Glow pulse' }
	];
	const EASINGS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'];
	const DIRS = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'reverse', label: 'Reversa' },
		{ value: 'alternate', label: 'Alterna' }
	];
</script>

<div class="editor">
	<h2 class="editor-title">📢 Banner</h2>
	<p class="editor-desc">Banner superior de la tienda. Actívalo, escribe tu mensaje y personaliza la animación.</p>

	<Card>
		<h3 class="section-title">General</h3>
		<div class="field">
			<label>
				<input type="checkbox" checked={b.enabled === true} onchange={(e) => update('banner.enabled', e.currentTarget.checked)} />
				Banner activado
			</label>
		</div>
		<div class="field">
			<label for="bn-text">Texto del banner</label>
			<input id="bn-text" type="text" value={b.text ?? ''} oninput={(e) => update('banner.text', e.currentTarget.value)} placeholder="🔥 Nuevo beat disponible" />
		</div>
		<div class="field">
			<label for="bn-url">URL (opcional, clickeable)</label>
			<input id="bn-url" type="text" value={b.url ?? ''} oninput={(e) => update('banner.url', e.currentTarget.value)} placeholder="https://wa.me/..." />
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Animación</h3>
		<div class="row">
			<div class="field">
				<label for="bn-anim">Tipo</label>
				<select id="bn-anim" value={b.animation ?? 'static'} onchange={(e) => update('banner.animation', e.currentTarget.value)}>
					{#each ANIMS as a}<option value={a.value}>{a.label}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="bn-speed">Velocidad ({b.speed ?? 20}s)</label>
				<input id="bn-speed" type="range" min="5" max="60" step="1" value={b.speed ?? 20} oninput={(e) => update('banner.speed', +e.currentTarget.value)} />
			</div>
		</div>
		<div class="row">
			<div class="field">
				<label for="bn-ease">Easing</label>
				<select id="bn-ease" value={b.easing ?? 'linear'} onchange={(e) => update('banner.easing', e.currentTarget.value)}>
					{#each EASINGS as e2}<option value={e2}>{e2}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="bn-dir">Dirección</label>
				<select id="bn-dir" value={b.direction ?? 'normal'} onchange={(e) => update('banner.direction', e.currentTarget.value)}>
					{#each DIRS as d}<option value={d.value}>{d.label}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="bn-delay">Delay ({b.delay ?? 0}s)</label>
				<input id="bn-delay" type="range" min="0" max="10" step="0.5" value={b.delay ?? 0} oninput={(e) => update('banner.delay', +e.currentTarget.value)} />
			</div>
		</div>
	</Card>

	<Card>
		<h3 class="section-title">Colores</h3>
		<div class="row">
			<div class="field">
				<label for="bn-bg">Fondo</label>
				<div class="color-row">
					<input id="bn-bg" type="color" value={b.bgColor || '#7f1d1d'} oninput={(e) => update('banner.bgColor', e.currentTarget.value)} />
					<input type="text" value={b.bgColor ?? '#7f1d1d'} oninput={(e) => update('banner.bgColor', e.currentTarget.value)} />
				</div>
			</div>
			<div class="field">
				<label for="bn-tc">Texto</label>
				<div class="color-row">
					<input id="bn-tc" type="color" value={b.textColor || '#ffffff'} oninput={(e) => update('banner.textColor', e.currentTarget.value)} />
					<input type="text" value={b.textColor ?? '#ffffff'} oninput={(e) => update('banner.textColor', e.currentTarget.value)} />
				</div>
			</div>
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
	.field input[type="text"], .field select { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; transition: border-color var(--duration-fast); }
	.field input[type="text"]:focus, .field select:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }
	.color-row { display: flex; gap: var(--space-2); align-items: center; }
	.color-row input[type="color"] { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; padding: 2px; }
	.color-row input[type="text"] { flex: 1; }
</style>
