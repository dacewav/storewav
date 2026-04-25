<script lang="ts">
	import type { CardStyleConfig, GlowType, CardAnimation } from '$lib/cardStyleEngine';
	import { cardStyleToCSS, getAllKeyframes } from '$lib/cardStyleEngine';

	let {
		value = $bindable({}),
		mode = 'per-beat',
		accentRgb = '220, 38, 38',
		onchange
	}: {
		value?: Partial<CardStyleConfig>;
		mode?: 'per-beat' | 'global';
		accentRgb?: string;
		onchange?: (val: Partial<CardStyleConfig>) => void;
	} = $props();

	// Collapsible sections
	let openSections = $state<Set<string>>(new Set(['glow']));
	function toggleSection(id: string) {
		if (openSections.has(id)) { openSections.delete(id); } else { openSections.add(id); }
		openSections = new Set(openSections); // trigger reactivity
	}

	// Helper: set nested field
	function notify() { onchange?.(value); }

	function set<K extends keyof CardStyleConfig>(key: K, val: CardStyleConfig[K]) {
		if (val === undefined || val === null) { delete value[key]; }
		else { value[key] = val; }
		value = { ...value }; // trigger reactivity
		notify();
	}

	function setOrGlobal<K extends keyof CardStyleConfig>(key: K, val: CardStyleConfig[K]) {
		if (mode === 'per-beat' && (val === undefined || val === null || val === '')) {
			delete value[key];
		} else {
			value[key] = val;
		}
		value = { ...value };
		notify();
	}

	// Build shadow string from parts
	let shadowX = $state(0);
	let shadowY = $state(4);
	let shadowBlur = $state(12);
	let shadowSpread = $state(0);
	let shadowColor = $state('#000000');
	let shadowOpacity = $state(0.35);
	let shadowInset = $state(false);

	// Parse existing boxShadow on mount
	$effect(() => {
		if (value.boxShadow) {
			// Try to parse: "0 4px 12px 0 rgba(0,0,0,0.35)" or inset variant
			const m = value.boxShadow.match(/^(inset\s+)?(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(-?\d+)px\s+(.+)$/);
			if (m) {
				shadowInset = !!m[1];
				shadowX = +m[2]; shadowY = +m[3]; shadowBlur = +m[4]; shadowSpread = +m[5];
				// Try parse color
				const c = m[6];
				const rgba = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
				if (rgba) {
					const r = (+rgba[1]).toString(16).padStart(2, '0');
					const g = (+rgba[2]).toString(16).padStart(2, '0');
					const b = (+rgba[3]).toString(16).padStart(2, '0');
					shadowColor = `#${r}${g}${b}`;
					if (rgba[4]) shadowOpacity = +rgba[4];
				}
			}
		}
	});

	function buildShadow() {
		const r = parseInt(shadowColor.slice(1, 3), 16);
		const g = parseInt(shadowColor.slice(3, 5), 16);
		const b = parseInt(shadowColor.slice(5, 7), 16);
		const rgba = `rgba(${r},${g},${b},${shadowOpacity})`;
		const inset = shadowInset ? 'inset ' : '';
		const s = `${inset}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${rgba}`;
		set('boxShadow', s === '0px 4px 12px 0px rgba(0,0,0,0.35)' ? undefined : s);
	}

	// Build skew string
	let skewX = $state(0);
	let skewY = $state(0);
	$effect(() => {
		if (value.skew) {
			const parts = value.skew.replace('deg', '').split(',');
			skewX = +(parts[0] ?? 0);
			skewY = +(parts[1] ?? 0);
		}
	});
	function buildSkew() {
		if (skewX === 0 && skewY === 0) { set('skew', undefined); }
		else { set('skew', `${skewX}deg, ${skewY}deg`); }
	}

	// Presets
	const globalLabel = $derived(mode === 'per-beat' ? '(usar global)' : 'Ninguno');
	const GLOW_TYPES: { value: GlowType | ''; label: string }[] = $derived([
		{ value: '', label: globalLabel },
		{ value: 'none', label: 'Ninguno' },
		{ value: 'active', label: 'Activo' },
		{ value: 'rgb', label: 'RGB' },
		{ value: 'pulse', label: 'Pulse' },
		{ value: 'breathe', label: 'Breathe' },
		{ value: 'neon', label: 'Neon' },
	]);

	const globalAnimLabel = $derived(mode === 'per-beat' ? '(usar global)' : 'Ninguna');
	const ANIMATIONS: { value: CardAnimation | ''; label: string; group: string }[] = $derived([
		{ value: '', label: globalAnimLabel, group: '' },
		{ value: 'none', label: 'Ninguna', group: '' },
		// Suaves
		{ value: 'float', label: 'Float', group: 'Suaves' },
		{ value: 'drift', label: 'Drift', group: 'Suaves' },
		{ value: 'driftSlow', label: 'Drift Slow', group: 'Suaves' },
		{ value: 'sway', label: 'Sway', group: 'Suaves' },
		{ value: 'breathe', label: 'Breathe', group: 'Suaves' },
		{ value: 'pulse', label: 'Pulse', group: 'Suaves' },
		{ value: 'fadeIn', label: 'Fade In', group: 'Suaves' },
		{ value: 'slideUp', label: 'Slide Up', group: 'Suaves' },
		{ value: 'slideDown', label: 'Slide Down', group: 'Suaves' },
		{ value: 'scaleIn', label: 'Scale In', group: 'Suaves' },
		// Energéticas
		{ value: 'bounce', label: 'Bounce', group: 'Energéticas' },
		{ value: 'shake', label: 'Shake', group: 'Energéticas' },
		{ value: 'headShake', label: 'Head Shake', group: 'Energéticas' },
		{ value: 'jello', label: 'Jello', group: 'Energéticas' },
		{ value: 'wobble', label: 'Wobble', group: 'Energéticas' },
		{ value: 'rubberBand', label: 'Rubber Band', group: 'Energéticas' },
		{ value: 'swing', label: 'Swing', group: 'Energéticas' },
		{ value: 'tada', label: 'Tada', group: 'Energéticas' },
		{ value: 'flash', label: 'Flash', group: 'Energéticas' },
		// 3D
		{ value: 'rotate3d', label: 'Rotate 3D', group: '3D' },
		{ value: 'tilt', label: 'Tilt', group: '3D' },
		{ value: 'flip', label: 'Flip', group: '3D' },
		{ value: 'flipX', label: 'Flip X', group: '3D' },
		{ value: 'flipY', label: 'Flip Y', group: '3D' },
		{ value: 'hologram', label: 'Hologram', group: '3D' },
		{ value: 'glitch', label: 'Glitch', group: '3D' },
		// Especiales
		{ value: 'shimmer', label: 'Shimmer', group: 'Especiales' },
		{ value: 'borderGlow', label: 'Border Glow', group: 'Especiales' },
		{ value: 'colorShift', label: 'Color Shift', group: 'Especiales' },
		{ value: 'neonFlicker', label: 'Neon Flicker', group: 'Especiales' },
		{ value: 'heartbeat', label: 'Heartbeat', group: 'Especiales' },
		{ value: 'lightSpeed', label: 'Light Speed', group: 'Especiales' },
		{ value: 'blurIn', label: 'Blur In', group: 'Especiales' },
		{ value: 'zoomPulse', label: 'Zoom Pulse', group: 'Especiales' },
		{ value: 'gradientBorder', label: 'Gradient Border', group: 'Especiales' },
		{ value: 'popIn', label: 'Pop In', group: 'Especiales' },
		{ value: 'elastic', label: 'Elastic', group: 'Especiales' },
		{ value: 'dropIn', label: 'Drop In', group: 'Especiales' },
		{ value: 'riseUp', label: 'Rise Up', group: 'Especiales' },
		{ value: 'spin', label: 'Spin', group: 'Especiales' },
		{ value: 'spinReverse', label: 'Spin Reverse', group: 'Especiales' },
		{ value: 'rubber', label: 'Rubber', group: 'Especiales' },
		{ value: 'squeeze', label: 'Squeeze', group: 'Especiales' },
	]);

	const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double'];

	// Group animations by category
	let animGroups = $derived.by(() => {
		const groups: Record<string, typeof ANIMATIONS> = {};
		for (const a of ANIMATIONS) {
			const g = a.group || 'General';
			if (!groups[g]) groups[g] = [];
			groups[g].push(a);
		}
		return groups;
	});

	// Live preview
	let previewCSS = $derived(cardStyleToCSS({ ...value } as any, accentRgb));
	let allKeyframes = $derived(getAllKeyframes());

	// Shorthand
	function getNum(key: keyof CardStyleConfig, def: number): number {
		return (value[key] as number) ?? def;
	}
	function getStr(key: keyof CardStyleConfig, def: string): string {
		return (value[key] as string) ?? def;
	}
</script>

<div class="cse" style="--accent-rgb: {accentRgb}">
	<!-- Live Preview -->
	<div class="preview-row">
		<div class="preview-card" style={previewCSS}>
			<div class="preview-cover">
				<div class="preview-gradient"></div>
				{#if value.coverOverlay}
					<div class="preview-overlay" style="background: {value.coverOverlay};"></div>
				{/if}
				{#if value.shimmer}
					<div class="preview-shimmer"></div>
				{/if}
			</div>
			<div class="preview-info">
				<div class="preview-title">Preview Beat</div>
				<div class="preview-meta">140 BPM · Am</div>
			</div>
		</div>
		<div class="preview-actions">
			<button class="btn-reset" onclick={() => { value = {}; notify(); }}>
				↺ Reset{mode === 'per-beat' ? ' (usar global)' : ''}
			</button>
		</div>
	</div>

	<!-- Sections -->
	{#each [
		{ id: 'glow', icon: '🌟', title: 'Glow' },
		{ id: 'filters', icon: '🎨', title: 'Filtros CSS' },
		{ id: 'border', icon: '🖼️', title: 'Borde' },
		{ id: 'shadow', icon: '🌑', title: 'Sombra' },
		{ id: 'transform', icon: '🔄', title: 'Transform' },
		{ id: 'hover', icon: '🖱️', title: 'Hover' },
		{ id: 'animation', icon: '✨', title: 'Animación' },
		{ id: 'shimmer', icon: '💫', title: 'Shimmer' },
		{ id: 'cover', icon: '🖼️', title: 'Cover Effects' },
		{ id: 'background', icon: '🎭', title: 'Fondo' },
		{ id: 'typography', icon: '🔤', title: 'Tipografía' },
		{ id: 'tags', icon: '🏷️', title: 'Tags' },
		{ id: 'image', icon: '🖼️', title: 'Imagen' },
		{ id: 'layout', icon: '📐', title: 'Layout' },
	] as section}
		<div class="section" class:open={openSections.has(section.id)}>
			<button class="section-header" onclick={() => toggleSection(section.id)} aria-expanded={openSections.has(section.id)}>
				<span class="section-icon">{section.icon}</span>
				<span class="section-title">{section.title}</span>
				<span class="section-arrow">{openSections.has(section.id) ? '▾' : '▸'}</span>
			</button>

			{#if openSections.has(section.id)}
				<div class="section-body">
					<!-- ═══ GLOW ═══ -->
					{#if section.id === 'glow'}
						<div class="field">
							<label for="cse-glow">Tipo</label>
							<select id="cse-glow" onchange={(e) => setOrGlobal('glow', (e.currentTarget.value || undefined) as GlowType)}>
								{#each GLOW_TYPES as g}<option value={g.value} selected={value.glow === g.value || (!value.glow && g.value === '')}>{g.label}</option>{/each}
							</select>
						</div>
						{#if value.glow && value.glow !== 'none'}
							<div class="field">
								<label for="cse-glow-color">Color</label>
								<div class="color-row">
									<input id="cse-glow-color" type="color" value={value.glowColor || '#dc2626'} oninput={(e) => set('glowColor', e.currentTarget.value)} />
									<input type="text" value={value.glowColor ?? ''} placeholder="(accent)" oninput={(e) => set('glowColor', e.currentTarget.value || undefined)} />
								</div>
							</div>
							<div class="field">
								<label for="cse-glow-int">Intensidad ({getNum('glowIntensity', 1)})</label>
								<input id="cse-glow-int" type="range" min="0" max="3" step="0.1" value={getNum('glowIntensity', 1)} oninput={(e) => set('glowIntensity', +e.currentTarget.value)} />
							</div>
						{/if}
					{/if}

					<!-- ═══ FILTERS ═══ -->
					{#if section.id === 'filters'}
						<div class="field">
							<label for="cse-brightness">Brightness ({getNum('brightness', 1)})</label>
							<input id="cse-brightness" type="range" min="0" max="2" step="0.05" value={getNum('brightness', 1)} oninput={(e) => set('brightness', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="field">
							<label for="cse-contrast">Contrast ({getNum('contrast', 1)})</label>
							<input id="cse-contrast" type="range" min="0" max="2" step="0.05" value={getNum('contrast', 1)} oninput={(e) => set('contrast', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="field">
							<label for="cse-saturate">Saturate ({getNum('saturate', 1)})</label>
							<input id="cse-saturate" type="range" min="0" max="3" step="0.1" value={getNum('saturate', 1)} oninput={(e) => set('saturate', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="field">
							<label for="cse-grayscale">Grayscale ({getNum('grayscale', 0)})</label>
							<input id="cse-grayscale" type="range" min="0" max="1" step="0.05" value={getNum('grayscale', 0)} oninput={(e) => set('grayscale', +e.currentTarget.value || undefined)} />
						</div>
						<div class="field">
							<label for="cse-sepia">Sepia ({getNum('sepia', 0)})</label>
							<input id="cse-sepia" type="range" min="0" max="1" step="0.05" value={getNum('sepia', 0)} oninput={(e) => set('sepia', +e.currentTarget.value || undefined)} />
						</div>
						<div class="field">
							<label for="cse-hue">Hue Rotate ({getNum('hueRotate', 0)}°)</label>
							<input id="cse-hue" type="range" min="0" max="360" step="5" value={getNum('hueRotate', 0)} oninput={(e) => set('hueRotate', +e.currentTarget.value || undefined)} />
						</div>
						<div class="field">
							<label for="cse-invert">Invert ({getNum('invert', 0)})</label>
							<input id="cse-invert" type="range" min="0" max="1" step="0.05" value={getNum('invert', 0)} oninput={(e) => set('invert', +e.currentTarget.value || undefined)} />
						</div>
					{/if}

					<!-- ═══ BORDER ═══ -->
					{#if section.id === 'border'}
						<div class="row">
							<div class="field">
								<label for="cse-bw">Width ({value.borderWidth ?? '0'})</label>
								<input id="cse-bw" type="range" min="0" max="5" step="1" value={parseInt(value.borderWidth ?? '0')} oninput={(e) => set('borderWidth', +e.currentTarget.value ? `${e.currentTarget.value}px` : undefined)} />
							</div>
							<div class="field">
								<label for="cse-br">Radius ({value.borderRadius ?? '0'})</label>
								<input id="cse-br" type="range" min="0" max="24" step="1" value={parseInt(value.borderRadius ?? '0')} oninput={(e) => set('borderRadius', +e.currentTarget.value ? `${e.currentTarget.value}px` : undefined)} />
							</div>
						</div>
						<div class="field">
							<label for="cse-bs">Style</label>
							<select id="cse-bs" onchange={(e) => set('borderStyle', e.currentTarget.value !== 'none' ? e.currentTarget.value : undefined)}>
								<option value="none" selected={!value.borderStyle}>Ninguno</option>
								{#each BORDER_STYLES.filter(s => s !== 'none') as s}<option value={s} selected={value.borderStyle === s}>{s}</option>{/each}
							</select>
						</div>
						{#if value.borderStyle && value.borderStyle !== 'none'}
							<div class="field">
								<label for="cse-bc">Color</label>
								<div class="color-row">
									<input id="cse-bc" type="color" value={value.borderColor || '#333333'} oninput={(e) => set('borderColor', e.currentTarget.value)} />
									<input type="text" value={value.borderColor ?? ''} placeholder="#333" oninput={(e) => set('borderColor', e.currentTarget.value || undefined)} />
								</div>
							</div>
						{/if}
					{/if}

					<!-- ═══ SHADOW ═══ -->
					{#if section.id === 'shadow'}
						<div class="row">
							<div class="field">
								<label for="cse-sx">X ({shadowX}px)</label>
								<input id="cse-sx" type="range" min="-20" max="20" step="1" bind:value={shadowX} oninput={buildShadow} />
							</div>
							<div class="field">
								<label for="cse-sy">Y ({shadowY}px)</label>
								<input id="cse-sy" type="range" min="-20" max="20" step="1" bind:value={shadowY} oninput={buildShadow} />
							</div>
						</div>
						<div class="row">
							<div class="field">
								<label for="cse-sb">Blur ({shadowBlur}px)</label>
								<input id="cse-sb" type="range" min="0" max="60" step="1" bind:value={shadowBlur} oninput={buildShadow} />
							</div>
							<div class="field">
								<label for="cse-ss">Spread ({shadowSpread}px)</label>
								<input id="cse-ss" type="range" min="-20" max="20" step="1" bind:value={shadowSpread} oninput={buildShadow} />
							</div>
						</div>
						<div class="row">
							<div class="field">
								<label for="cse-sc">Color</label>
								<div class="color-row">
									<input id="cse-sc" type="color" bind:value={shadowColor} oninput={buildShadow} />
									<input type="text" bind:value={shadowColor} oninput={buildShadow} />
								</div>
							</div>
							<div class="field">
								<label for="cse-so">Opacity ({shadowOpacity})</label>
								<input id="cse-so" type="range" min="0" max="1" step="0.05" bind:value={shadowOpacity} oninput={buildShadow} />
							</div>
						</div>
						<div class="field">
							<label class="check-label">
								<input type="checkbox" bind:checked={shadowInset} oninput={buildShadow} />
								Inset
							</label>
						</div>
					{/if}

					<!-- ═══ TRANSFORM ═══ -->
					{#if section.id === 'transform'}
						<div class="field">
							<label for="cse-rotate">Rotate ({getNum('rotate', 0)}°)</label>
							<input id="cse-rotate" type="range" min="-180" max="180" step="1" value={getNum('rotate', 0)} oninput={(e) => set('rotate', +e.currentTarget.value || undefined)} />
						</div>
						<div class="field">
							<label for="cse-scale">Scale ({getNum('scale', 1)})</label>
							<input id="cse-scale" type="range" min="0.5" max="1.5" step="0.01" value={getNum('scale', 1)} oninput={(e) => set('scale', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="row">
							<div class="field">
								<label for="cse-skx">Skew X ({skewX}°)</label>
								<input id="cse-skx" type="range" min="-30" max="30" step="1" bind:value={skewX} oninput={buildSkew} />
							</div>
							<div class="field">
								<label for="cse-sky">Skew Y ({skewY}°)</label>
								<input id="cse-sky" type="range" min="-30" max="30" step="1" bind:value={skewY} oninput={buildSkew} />
							</div>
						</div>
						<div class="field">
							<label for="cse-ty">Translate Y</label>
							<input id="cse-ty" type="text" value={value.translateY ?? ''} placeholder="0px" oninput={(e) => set('translateY', e.currentTarget.value || undefined)} />
						</div>
					{/if}

					<!-- ═══ HOVER ═══ -->
					{#if section.id === 'hover'}
						<div class="field">
							<label for="cse-hs">Scale ({getNum('hoverScale', 1.02)})</label>
							<input id="cse-hs" type="range" min="0.8" max="1.3" step="0.01" value={getNum('hoverScale', 1.02)} oninput={(e) => set('hoverScale', +e.currentTarget.value !== 1.02 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="field">
							<label for="cse-hb">Brightness ({getNum('hoverBrightness', 1.05)})</label>
							<input id="cse-hb" type="range" min="0.5" max="2" step="0.05" value={getNum('hoverBrightness', 1.05)} oninput={(e) => set('hoverBrightness', +e.currentTarget.value !== 1.05 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="field">
							<label for="cse-hbl">Blur ({getNum('hoverBlur', 0)}px)</label>
							<input id="cse-hbl" type="range" min="0" max="10" step="0.5" value={getNum('hoverBlur', 0)} oninput={(e) => set('hoverBlur', +e.currentTarget.value || undefined)} />
						</div>
						<div class="field">
							<label for="cse-hsat">Saturate ({getNum('hoverSaturate', 1)})</label>
							<input id="cse-hsat" type="range" min="0" max="3" step="0.1" value={getNum('hoverSaturate', 1)} oninput={(e) => set('hoverSaturate', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
						</div>
					{/if}

					<!-- ═══ ANIMATION ═══ -->
					{#if section.id === 'animation'}
						<div class="field">
							<label for="cse-anim">Tipo</label>
							<select id="cse-anim" onchange={(e) => setOrGlobal('animation', (e.currentTarget.value || undefined) as CardAnimation)}>
								{#each Object.entries(animGroups) as [groupName, anims]}
									<optgroup label={groupName}>
										{#each anims as a}<option value={a.value} selected={value.animation === a.value}>{a.label}</option>{/each}
									</optgroup>
								{/each}
							</select>
						</div>
						{#if value.animation && value.animation !== 'none'}
							<div class="field">
								<label for="cse-adur">Duration</label>
								<input id="cse-adur" type="text" value={value.animationDuration ?? ''} placeholder="3s" oninput={(e) => set('animationDuration', e.currentTarget.value || undefined)} />
							</div>
							<div class="field">
								<label for="cse-adel">Delay</label>
								<input id="cse-adel" type="text" value={value.animationDelay ?? ''} placeholder="0s" oninput={(e) => set('animationDelay', e.currentTarget.value || undefined)} />
							</div>
						{/if}
					{/if}

					<!-- ═══ SHIMMER ═══ -->
					{#if section.id === 'shimmer'}
						<div class="field">
							<label class="check-label">
								<input type="checkbox" checked={value.shimmer === true} onchange={(e) => set('shimmer', e.currentTarget.checked || undefined)} />
								Shimmer activo
							</label>
						</div>
						{#if value.shimmer}
							<div class="field">
								<label for="cse-shc">Color</label>
								<div class="color-row">
									<input id="cse-shc" type="color" value={value.shimmerColor || '#ffffff'} oninput={(e) => set('shimmerColor', e.currentTarget.value)} />
									<input type="text" value={value.shimmerColor ?? ''} placeholder="rgba(255,255,255,0.12)" oninput={(e) => set('shimmerColor', e.currentTarget.value || undefined)} />
								</div>
							</div>
							<div class="field">
								<label for="cse-sho">Opacity ({getNum('shimmerOpacity', 1)})</label>
								<input id="cse-sho" type="range" min="0" max="1" step="0.05" value={getNum('shimmerOpacity', 1)} oninput={(e) => set('shimmerOpacity', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
							</div>
							<div class="field">
								<label for="cse-shd">Duration</label>
								<input id="cse-shd" type="text" value={value.shimmerDuration ?? ''} placeholder="2.5s" oninput={(e) => set('shimmerDuration', e.currentTarget.value || undefined)} />
							</div>
						{/if}
					{/if}

					<!-- ═══ COVER EFFECTS ═══ -->
					{#if section.id === 'cover'}
						<div class="field">
							<label for="cse-co">Overlay (CSS gradient)</label>
							<textarea id="cse-co" rows="2" value={value.coverOverlay ?? ''} placeholder="linear-gradient(to top, rgba(0,0,0,0.7), transparent)" oninput={(e) => set('coverOverlay', e.currentTarget.value || undefined)}></textarea>
						</div>
						<div class="field">
							<label for="cse-cb">Blur ({getNum('coverBlur', 0)}px)</label>
							<input id="cse-cb" type="range" min="0" max="20" step="1" value={getNum('coverBlur', 0)} oninput={(e) => set('coverBlur', +e.currentTarget.value || undefined)} />
						</div>
					{/if}

					<!-- ═══ FONDO ═══ -->
					{#if section.id === 'background'}
						<div class="field">
							<label for="cse-cbg">Color de fondo</label>
							<div class="color-row">
								<input id="cse-cbg" type="color" value={value.cardBg ?? '#000000'} oninput={(e) => set('cardBg', e.currentTarget.value)} />
								<input type="text" value={value.cardBg ?? ''} placeholder="ej: #0f0f0f o gradient" oninput={(e) => set('cardBg', e.currentTarget.value || undefined)} />
								{#if value.cardBg}<button class="clear-btn" onclick={() => set('cardBg', undefined)}>✕</button>{/if}
							</div>
						</div>
						<div class="field">
							<label for="cse-cbgo">Opacidad ({Math.round((value.cardBgOpacity ?? 1) * 100)}%)</label>
							<input id="cse-cbgo" type="range" min="0" max="1" step="0.01" value={value.cardBgOpacity ?? 1} oninput={(e) => set('cardBgOpacity', +e.currentTarget.value || undefined)} />
						</div>
					{/if}

					<!-- ═══ TIPOGRAFÍA ═══ -->
					{#if section.id === 'typography'}
						<div class="field">
							<label for="cse-ts">Título tamaño</label>
							<select id="cse-ts" onchange={(e) => set('titleSize', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.titleSize}>Auto</option>
								<option value="0.75rem" selected={value.titleSize === '0.75rem'}>XS (0.75rem)</option>
								<option value="0.875rem" selected={value.titleSize === '0.875rem'}>SM (0.875rem)</option>
								<option value="1rem" selected={value.titleSize === '1rem'}>Base (1rem)</option>
								<option value="1.125rem" selected={value.titleSize === '1.125rem'}>LG (1.125rem)</option>
								<option value="1.25rem" selected={value.titleSize === '1.25rem'}>XL (1.25rem)</option>
							</select>
						</div>
						<div class="field">
							<label for="cse-tw">Título peso ({value.titleWeight ?? 'auto'})</label>
							<input id="cse-tw" type="range" min="100" max="900" step="100" value={value.titleWeight ?? 400} oninput={(e) => set('titleWeight', +e.currentTarget.value || undefined)} />
						</div>
						<div class="field">
							<label for="cse-tc">Título color</label>
							<div class="color-row">
								<input id="cse-tc" type="color" value={value.titleColor ?? '#ffffff'} oninput={(e) => set('titleColor', e.currentTarget.value)} />
								<input type="text" value={value.titleColor ?? ''} placeholder="(default)" oninput={(e) => set('titleColor', e.currentTarget.value || undefined)} />
								{#if value.titleColor}<button class="clear-btn" onclick={() => set('titleColor', undefined)}>✕</button>{/if}
							</div>
						</div>
						<div class="field">
							<label for="cse-ta">Título alineación</label>
							<select id="cse-ta" onchange={(e) => set('titleAlign', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.titleAlign}>Izquierda</option>
								<option value="center" selected={value.titleAlign === 'center'}>Centro</option>
								<option value="right" selected={value.titleAlign === 'right'}>Derecha</option>
							</select>
						</div>
						<div class="field">
							<label for="cse-ps">Precio tamaño</label>
							<select id="cse-ps" onchange={(e) => set('priceSize', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.priceSize}>Auto</option>
								<option value="0.75rem" selected={value.priceSize === '0.75rem'}>XS (0.75rem)</option>
								<option value="0.875rem" selected={value.priceSize === '0.875rem'}>SM (0.875rem)</option>
								<option value="1rem" selected={value.priceSize === '1rem'}>Base (1rem)</option>
								<option value="1.25rem" selected={value.priceSize === '1.25rem'}>XL (1.25rem)</option>
							</select>
						</div>
						<div class="field">
							<label for="cse-pc">Precio color</label>
							<div class="color-row">
								<input id="cse-pc" type="color" value={value.priceColor ?? '#ffffff'} oninput={(e) => set('priceColor', e.currentTarget.value)} />
								<input type="text" value={value.priceColor ?? ''} placeholder="(default)" oninput={(e) => set('priceColor', e.currentTarget.value || undefined)} />
								{#if value.priceColor}<button class="clear-btn" onclick={() => set('priceColor', undefined)}>✕</button>{/if}
							</div>
						</div>
					{/if}

					<!-- ═══ TAGS ═══ -->
					{#if section.id === 'tags'}
						<div class="field">
							<label for="cse-tgb">Fondo tag</label>
							<div class="color-row">
								<input id="cse-tgb" type="color" value={value.tagBg ?? '#333333'} oninput={(e) => set('tagBg', e.currentTarget.value)} />
								<input type="text" value={value.tagBg ?? ''} placeholder="ej: rgba(255,255,255,0.1)" oninput={(e) => set('tagBg', e.currentTarget.value || undefined)} />
								{#if value.tagBg}<button class="clear-btn" onclick={() => set('tagBg', undefined)}>✕</button>{/if}
							</div>
						</div>
						<div class="field">
							<label for="cse-tgc">Color tag</label>
							<div class="color-row">
								<input id="cse-tgc" type="color" value={value.tagColor ?? '#ffffff'} oninput={(e) => set('tagColor', e.currentTarget.value)} />
								<input type="text" value={value.tagColor ?? ''} placeholder="(default)" oninput={(e) => set('tagColor', e.currentTarget.value || undefined)} />
								{#if value.tagColor}<button class="clear-btn" onclick={() => set('tagColor', undefined)}>✕</button>{/if}
							</div>
						</div>
						<div class="field">
							<label for="cse-tgr">Radio tag</label>
							<select id="cse-tgr" onchange={(e) => set('tagRadius', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.tagRadius}>Default</option>
								<option value="0" selected={value.tagRadius === '0'}>Cuadrado</option>
								<option value="4px" selected={value.tagRadius === '4px'}>Suave (4px)</option>
								<option value="999px" selected={value.tagRadius === '999px'}>Píldora</option>
							</select>
						</div>
						<div class="field">
							<label for="cse-tgs">Tamaño tag</label>
							<select id="cse-tgs" onchange={(e) => set('tagSize', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.tagSize}>Auto</option>
								<option value="0.625rem" selected={value.tagSize === '0.625rem'}>XS (0.625rem)</option>
								<option value="0.75rem" selected={value.tagSize === '0.75rem'}>SM (0.75rem)</option>
								<option value="0.875rem" selected={value.tagSize === '0.875rem'}>Base (0.875rem)</option>
							</select>
						</div>
					{/if}

					<!-- ═══ IMAGEN ═══ -->
					{#if section.id === 'image'}
						<div class="field">
							<label for="cse-ia">Aspect ratio</label>
							<select id="cse-ia" onchange={(e) => set('imageAspect', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.imageAspect}>Default (1/1)</option>
								<option value="1/1" selected={value.imageAspect === '1/1'}>Cuadrado (1/1)</option>
								<option value="4/3" selected={value.imageAspect === '4/3'}>Horizontal (4/3)</option>
								<option value="16/9" selected={value.imageAspect === '16/9'}>Widescreen (16/9)</option>
								<option value="3/4" selected={value.imageAspect === '3/4'}>Vertical (3/4)</option>
								<option value="2/3" selected={value.imageAspect === '2/3'}>Portrait (2/3)</option>
							</select>
						</div>
						<div class="field">
							<label for="cse-ihz">Zoom hover ({((value.imageHoverZoom ?? 1) * 100).toFixed(0)}%)</label>
							<input id="cse-ihz" type="range" min="1" max="1.2" step="0.01" value={value.imageHoverZoom ?? 1} oninput={(e) => set('imageHoverZoom', +e.currentTarget.value !== 1 ? +e.currentTarget.value : undefined)} />
						</div>
						<div class="field">
							<label for="cse-iof">Object fit</label>
							<select id="cse-iof" onchange={(e) => set('imageObjectFit', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.imageObjectFit}>Cover (default)</option>
								<option value="cover" selected={value.imageObjectFit === 'cover'}>Cover</option>
								<option value="contain" selected={value.imageObjectFit === 'contain'}>Contain</option>
							</select>
						</div>
					{/if}

					<!-- ═══ LAYOUT ═══ -->
					{#if section.id === 'layout'}
						<div class="field">
							<label for="cse-cp">Padding interno</label>
							<select id="cse-cp" onchange={(e) => set('cardPadding', e.currentTarget.value || undefined)}>
								<option value="" selected={!value.cardPadding}>Default</option>
								<option value="0" selected={value.cardPadding === '0'}>Sin padding</option>
								<option value="0.5rem" selected={value.cardPadding === '0.5rem'}>Pequeño (0.5rem)</option>
								<option value="1rem" selected={value.cardPadding === '1rem'}>Medio (1rem)</option>
								<option value="1.5rem" selected={value.cardPadding === '1.5rem'}>Grande (1.5rem)</option>
							</select>
						</div>
						<div class="field">
							<label for="cse-ib">Fondo info</label>
							<div class="color-row">
								<input id="cse-ib" type="color" value={value.infoBg ?? '#000000'} oninput={(e) => set('infoBg', e.currentTarget.value)} />
								<input type="text" value={value.infoBg ?? ''} placeholder="(default)" oninput={(e) => set('infoBg', e.currentTarget.value || undefined)} />
								{#if value.infoBg}<button class="clear-btn" onclick={() => set('infoBg', undefined)}>✕</button>{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

<!-- Inject keyframes for preview -->
<svelte:head>
	{@html `<style>${allKeyframes}</style>`}
</svelte:head>

<style>
	.cse { display: flex; flex-direction: column; gap: var(--space-4); }

	/* Preview */
	.preview-row { display: flex; align-items: flex-start; gap: var(--space-4); }
	.preview-card {
		width: 200px; flex-shrink: 0;
		background: var(--surface); border: 1px solid var(--border);
		border-radius: var(--card-radius, 8px); overflow: hidden;
		transition: all 0.3s ease;
	}
	.preview-cover {
		position: relative; aspect-ratio: 16/9; overflow: hidden;
		background: var(--surface2);
	}
	.preview-gradient {
		width: 100%; height: 100%;
		background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.3), rgba(var(--accent-rgb), 0.05));
	}
	.preview-overlay { position: absolute; inset: 0; pointer-events: none; }
	.preview-shimmer {
		position: absolute; inset: 0; pointer-events: none;
		background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%);
		animation: cardShimmer 2.5s ease-in-out infinite;
	}
	.preview-info { padding: var(--space-3); }
	.preview-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); }
	.preview-meta { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); }
	.preview-actions { display: flex; flex-direction: column; gap: var(--space-2); }
	.btn-reset {
		padding: var(--space-2) var(--space-3); background: transparent;
		border: 1px solid var(--border); border-radius: var(--radius-md);
		color: var(--text-muted); font-size: var(--text-xs); cursor: pointer;
		transition: all var(--duration-fast); white-space: nowrap;
	}
	.btn-reset:hover { color: var(--danger); border-color: var(--danger); }

	/* Sections */
	.section { border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
	.section.open { border-color: rgba(var(--accent-rgb), 0.3); }
	.section-header {
		display: flex; align-items: center; gap: var(--space-3); width: 100%;
		padding: var(--space-3) var(--space-4); background: var(--surface);
		border: none; color: var(--text); cursor: pointer; transition: all var(--duration-fast);
		min-height: var(--touch-min);
	}
	.section-header:hover { background: var(--surface-hover); }
	.section-icon { font-size: var(--text-sm); }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 600; flex: 1; text-align: left; }
	.section-arrow { font-size: var(--text-xs); color: var(--text-muted); }
	.section-body { padding: var(--space-4); background: var(--bg-secondary); border-top: 1px solid var(--border); }

	/* Fields */
	.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
	.field:last-child { margin-bottom: 0; }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
	.field input[type="text"], .field select, .field textarea {
		padding: var(--space-2) var(--space-3); background: var(--surface);
		border: 1px solid var(--border); border-radius: var(--radius-md);
		color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min);
		outline: none; transition: border-color var(--duration-fast); font-family: inherit;
	}
	.field textarea { min-height: 60px; resize: vertical; }
	.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; }
	.row { display: flex; gap: var(--space-3); }
	.row .field { flex: 1; min-width: 0; }
	.color-row { display: flex; gap: var(--space-2); align-items: center; }
	.color-row input[type="color"] { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; padding: 2px; }
	.color-row input[type="text"] { flex: 1; }
	.check-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); color: var(--text); text-transform: none; letter-spacing: 0; }

	@keyframes cardShimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	@media (max-width: 640px) {
		.preview-row { flex-direction: column; }
		.preview-card { width: 100%; }
		.row { flex-direction: column; gap: 0; }
	}
</style>
