<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, EmojiInput, Collapsible, FileUpload } from '$lib/components';
	import type { BannerSettings } from '$lib/stores/settings';

	let s = $derived($settings.data);
	let b = $derived((s?.banner ?? {}) as BannerSettings);

	/** Local slider state — updates instantly on drag */
	let local = $state<Record<string, number>>({});
	let localInit = false;

	$effect(() => {
		if (!b || !s || localInit) return;
		local = {
			speed: b.speed ?? 20,
			delay: b.delay ?? 0,
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

	function fmt(key: string, max: number, unit = ''): string {
		const n = local[key] ?? 0;
		return unit ? `${Math.min(n, max)}${unit}` : String(Math.min(n, max));
	}

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

	<Collapsible id="banner-main" icon="📢" title="General" open={true}>
				<div class="field">
			<label>
				<input type="checkbox" checked={b.enabled === true} onchange={(e) => update('banner.enabled', e.currentTarget.checked)} />
				Banner activado
			</label>
		</div>
		<div class="field">
			<label for="bn-text">Texto del banner</label>
			<EmojiInput
				value={b.text ?? ''}
				placeholder="🔥 Nuevo beat disponible (usa :emoji_name:)"
				multiline={false}
				oninput={(val) => update('banner.text', val)}
			/>
		</div>
		<div class="field">
			<label for="bn-url">URL (opcional, clickeable)</label>
			<input id="bn-url" type="text" value={b.url ?? ''} oninput={(e) => update('banner.url', e.currentTarget.value)} placeholder="https://wa.me/..." />
		</div>
	</Collapsible>

	<Collapsible id="banner-style" icon="🎨" title="Animación" open={false}>
				<div class="row">
			<div class="field">
				<label for="bn-anim">Tipo</label>
				<select id="bn-anim" value={b.animation ?? 'static'} onchange={(e) => update('banner.animation', e.currentTarget.value)}>
					{#each ANIMS as a}<option value={a.value}>{a.label}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="bn-speed">Velocidad ({fmt('speed', 60, 's')})</label>
				<input id="bn-speed" type="range" min="5" max="60" step="1" value={local.speed ?? 20} oninput={(e) => onSlide('banner.speed', 'speed', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
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
				<label for="bn-delay">Delay ({fmt('delay', 10, 's')})</label>
				<input id="bn-delay" type="range" min="0" max="10" step="0.5" value={local.delay ?? 0} oninput={(e) => onSlide('banner.delay', 'delay', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
	</Collapsible>

	<Collapsible id="banner-anim" icon="✨" title="Colores" open={false}>
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
	</Collapsible>

	<!-- Background Image -->
	<Collapsible id="banner-bgimg" icon="🖼️" title="Imagen de fondo" open={false}>
		<p class="field-desc">Imagen de fondo del banner (opcional). Se superpone sobre el color de fondo.</p>
		<div class="field">
			<FileUpload
				value={b.bgImage ?? ''}
				folder="banner"
				beatId="bg"
				accept="image/*"
				type="image"
				label="Imagen de fondo"
				maxSizeMB={5}
				onUploadComplete={(url) => update('banner.bgImage', url)}
				onRemove={() => update('banner.bgImage', '')}
			/>
			<div class="url-fallback">
				<label for="bn-bgimg">O pega una URL:</label>
				<input id="bn-bgimg" type="text" value={b.bgImage ?? ''} oninput={(e) => update('banner.bgImage', e.currentTarget.value)} placeholder="https://..." />
			</div>
		</div>
		{#if b.bgImage}
			<div class="field">
				<label for="bn-bgop">Opacidad imagen ({Math.round((b.bgImageOpacity ?? 0.3) * 100)}%)</label>
				<input id="bn-bgop" type="range" min="0" max="1" step="0.05" value={b.bgImageOpacity ?? 0.3} oninput={(e) => update('banner.bgImageOpacity', +e.currentTarget.value)} />
			</div>
		{/if}
	</Collapsible>

	<!-- Live Preview -->
	<Collapsible id="banner-preview" icon="👁" title="Preview" open={false}>
		<div class="banner-preview" style="background: {b.bgColor || '#7f1d1d'}; {b.bgImage ? `background-image: url(${b.bgImage}); background-size: cover; background-position: center;` : ''}">
			{#if b.bgImage}
				<div class="banner-preview-overlay" style="background: {b.bgColor || '#7f1d1d'}; opacity: {1 - (b.bgImageOpacity ?? 0.3)}"></div>
			{/if}
			<span class="banner-preview-text" style="color: {b.textColor || '#ffffff'}">{b.text || 'Tu banner aquí'}</span>
		</div>
	</Collapsible>
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
	.field input[type="range"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }
	.color-row { display: flex; gap: var(--space-2); align-items: center; }
	.color-row input[type="color"] { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; padding: 2px; }
	.color-row input[type="text"] { flex: 1; }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); line-height: 1.5; }
	.url-fallback { margin-top: var(--space-2); }
	.url-fallback label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); margin-bottom: var(--space-1); display: block; }
	.url-fallback input { padding: var(--space-1) var(--space-2); background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-xs); font-family: var(--font-mono); outline: none; transition: border-color var(--duration-fast); }
	.url-fallback input:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.banner-preview { position: relative; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); overflow: hidden; text-align: center; min-height: 48px; display: flex; align-items: center; justify-content: center; }
	.banner-preview-overlay { position: absolute; inset: 0; pointer-events: none; }
	.banner-preview-text { position: relative; z-index: 1; font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.05em; white-space: nowrap; }
</style>
