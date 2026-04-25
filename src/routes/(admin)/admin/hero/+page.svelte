<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';
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
	<Card>
		<h3 class="section-title">Texto</h3>
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
	</Card>

	<!-- Title Visual -->
	<Card>
		<h3 class="section-title">Título — Estilo</h3>
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
	</Card>

	<!-- Glow Word -->
	<Card>
		<h3 class="section-title">Glow de la palabra</h3>
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
	</Card>

	<!-- Stroke Mode -->
	<Card>
		<h3 class="section-title">Stroke mode (outline)</h3>
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
	</Card>

	<!-- Color Segments -->
	<Card>
		<h3 class="section-title">Colores por palabra</h3>
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
	</Card>

	<!-- Eyebrow -->
	<Card>
		<h3 class="section-title">Eyebrow badge</h3>
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
	</Card>

	<!-- Background Gradient -->
	<Card>
		<h3 class="section-title">Gradiente de fondo</h3>
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
	</Card>
</div>

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
</style>
