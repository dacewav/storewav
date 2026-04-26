<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';
	import type { AnimationSettings } from '$lib/stores/settings';

	let s = $derived($settings.data);
	let anim = $derived((s?.animations ?? {}) as AnimationSettings);

	/** Local slider state — updates instantly on drag */
	let local = $state<Record<string, number>>({});
	let localInit = false;

	$effect(() => {
		if (!anim || !s || localInit) return;
		local = {
			animDuration: anim.animDuration ?? 2,
			animDelay: anim.animDelay ?? 0,
			// Per-element timing (falls back to global)
			animLogoDur: anim.animLogoDur ?? anim.animDuration ?? 2,
			animLogoDel: anim.animLogoDel ?? anim.animDelay ?? 0,
			animTitleDur: anim.animTitleDur ?? anim.animDuration ?? 2,
			animTitleDel: anim.animTitleDel ?? anim.animDelay ?? 0,
			animCardsDur: anim.animCardsDur ?? anim.animDuration ?? 2,
			animCardsDel: anim.animCardsDel ?? anim.animDelay ?? 0,
			animButtonsDur: anim.animButtonsDur ?? anim.animDuration ?? 2,
			animButtonsDel: anim.animButtonsDel ?? anim.animDelay ?? 0,
			animPlayerDur: anim.animPlayerDur ?? anim.animDuration ?? 2,
			animPlayerDel: anim.animPlayerDel ?? anim.animDelay ?? 0,
			animWaveformDur: anim.animWaveformDur ?? anim.animDuration ?? 2,
			animWaveformDel: anim.animWaveformDel ?? anim.animDelay ?? 0,
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

	const PRESETS = [
		{ value: 'none', label: 'Ninguna' },
		{ value: 'float', label: 'Float (flotar)' },
		{ value: 'pulse', label: 'Pulse (pulsar)' },
		{ value: 'bounce', label: 'Bounce (rebotar)' },
		{ value: 'spin', label: 'Spin (girar)' },
		{ value: 'shake', label: 'Shake (sacudir)' },
		{ value: 'glow', label: 'Glow (resplandor)' },
		{ value: 'slide-up', label: 'Slide Up' },
		{ value: 'slide-down', label: 'Slide Down' },
		{ value: 'fade-in', label: 'Fade In' }
	];

	const EASINGS = [
		{ value: 'ease-in-out', label: 'Ease In-Out' },
		{ value: 'ease', label: 'Ease' },
		{ value: 'ease-in', label: 'Ease In' },
		{ value: 'ease-out', label: 'Ease Out' },
		{ value: 'linear', label: 'Linear' },
		{ value: 'cubic-bezier(0.16, 1, 0.3, 1)', label: 'Spring' },
		{ value: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)', label: 'Bouncy' }
	];

	const ANIM_ITEMS = [
		{ key: 'animLogo', label: 'Logo / Brand', icon: '🏷️', durKey: 'animLogoDur', delKey: 'animLogoDel', easeKey: 'animLogoEase' },
		{ key: 'animTitle', label: 'Título Hero', icon: '✨', durKey: 'animTitleDur', delKey: 'animTitleDel', easeKey: 'animTitleEase' },
		{ key: 'animCards', label: 'Beat Cards', icon: '🃏', durKey: 'animCardsDur', delKey: 'animCardsDel', easeKey: 'animCardsEase' },
		{ key: 'animButtons', label: 'Botones CTA', icon: '🔘', durKey: 'animButtonsDur', delKey: 'animButtonsDel', easeKey: 'animButtonsEase' },
		{ key: 'animPlayer', label: 'Player Bar', icon: '🎵', durKey: 'animPlayerDur', delKey: 'animPlayerDel', easeKey: 'animPlayerEase' },
		{ key: 'animWaveform', label: 'Waveform', icon: '📊', durKey: 'animWaveformDur', delKey: 'animWaveformDel', easeKey: 'animWaveformEase' }
	];

	/** Get per-element easing or global fallback */
	function getEase(key: string): string {
		return (anim as Record<string, unknown>)[key] as string ?? anim.animEasing ?? 'ease-in-out';
	}
</script>

<div class="editor">
	<h2 class="editor-title">🎬 Animaciones</h2>
	<p class="editor-desc">Asigna animaciones preset a cada elemento de la tienda.</p>

	{#each ANIM_ITEMS as item}
		<Card>
			<div class="anim-row">
				<div class="anim-label">
					<span class="anim-icon">{item.icon}</span>
					<span>{item.label}</span>
				</div>
				<div class="field">
					<select value={(anim as Record<string, unknown>)[item.key] ?? 'none'} onchange={(e) => update(`animations.${item.key}`, e.currentTarget.value)}>
						{#each PRESETS as p}
							<option value={p.value}>{p.label}</option>
						{/each}
					</select>
				</div>
			</div>
			{#if (anim as Record<string, unknown>)[item.key] && (anim as Record<string, unknown>)[item.key] !== 'none'}
				<div class="anim-timing">
					<div class="timing-row">
						<div class="timing-field">
							<span class="timing-label">Dur: {fmt(item.durKey, 10, 's')}</span>
							<input type="range" min="0.2" max="10" step="0.1" value={local[item.durKey] ?? 2} oninput={(e) => onSlide(`animations.${item.durKey}`, item.durKey, +e.currentTarget.value)} onkeydown={handleShiftArrows} />
						</div>
						<div class="timing-field">
							<span class="timing-label">Del: {fmt(item.delKey, 5, 's')}</span>
							<input type="range" min="0" max="5" step="0.1" value={local[item.delKey] ?? 0} oninput={(e) => onSlide(`animations.${item.delKey}`, item.delKey, +e.currentTarget.value)} onkeydown={handleShiftArrows} />
						</div>
						<div class="timing-field">
							<select value={getEase(item.easeKey)} onchange={(e) => update(`animations.${item.easeKey}`, e.currentTarget.value)}>
								{#each EASINGS as ea}<option value={ea.value}>{ea.label}</option>{/each}
							</select>
						</div>
					</div>
				</div>
			{/if}
		</Card>
	{/each}

	<!-- Global timing controls -->
	<Card>
		<h3 class="section-title">⏱️ Timing global</h3>
		<p class="field-desc">Duración, delay y easing aplicados a todas las animaciones.</p>
		<div class="row">
			<div class="field">
				<label for="anim-dur">Duración ({fmt('animDuration', 10, 's')})</label>
				<input id="anim-dur" type="range" min="0.2" max="10" step="0.1" value={local.animDuration ?? 2} oninput={(e) => onSlide('animations.animDuration', 'animDuration', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
			<div class="field">
				<label for="anim-delay">Delay ({fmt('animDelay', 5, 's')})</label>
				<input id="anim-delay" type="range" min="0" max="5" step="0.1" value={local.animDelay ?? 0} oninput={(e) => onSlide('animations.animDelay', 'animDelay', +e.currentTarget.value)} onkeydown={handleShiftArrows} />
			</div>
		</div>
		<div class="field">
			<label for="anim-ease">Easing</label>
			<select id="anim-ease" value={anim.animEasing ?? 'ease-in-out'} onchange={(e) => update('animations.animEasing', e.currentTarget.value)}>
				{#each EASINGS as e}<option value={e.value}>{e.label}</option>{/each}
			</select>
		</div>
	</Card>

	<!-- Custom CSS keyframes -->
	<Card>
		<h3 class="section-title">🎨 Keyframes personalizados</h3>
		<p class="field-desc">Define CSS @keyframes custom. Úsalos como nombre de animación en los selectores.</p>
		<div class="field">
			<textarea
				value={anim.animCustomCSS ?? ''}
				oninput={(e) => update('animations.animCustomCSS', e.currentTarget.value)}
				placeholder={"@keyframes mi-anim {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n  100% { transform: scale(1); }\n}"}
				rows={8}
			></textarea>
		</div>
	</Card>

	<!-- Live Preview: each element with its assigned animation -->
	<Card>
		<h3 class="section-title">👁️ Preview en Vivo</h3>
		<p class="field-desc">Cada elemento muestra la animación que tiene asignada. Ajustá timing arriba y se actualiza acá.</p>
		<div class="live-grid">
			{#each ANIM_ITEMS as item}
				{@const animType = (anim as Record<string, unknown>)[item.key] as string}
				<div class="live-card">
					<span class="live-label">{item.icon} {item.label}</span>
					{#if animType && animType !== 'none'}
						<div class="live-demo-wrap">
							{#if item.key === 'animLogo'}
								<div class="live-logo anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {local[item.delKey] ?? local.animDelay ?? 0}s; animation-timing-function: {getEase(item.easeKey)}">
									<span class="live-logo-icon">🎵</span>
									<span class="live-logo-text">storewav</span>
								</div>
							{:else if item.key === 'animTitle'}
								<div class="live-title anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {local[item.delKey] ?? local.animDelay ?? 0}s; animation-timing-function: {getEase(item.easeKey)}">
									Beats que suenan diferente
								</div>
							{:else if item.key === 'animCards'}
								<div class="live-card-row">
									<div class="live-beat-card anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {local[item.delKey] ?? local.animDelay ?? 0}s; animation-timing-function: {getEase(item.easeKey)}">
										<div class="live-beat-img"></div>
										<div class="live-beat-info">
											<div class="live-beat-name">Midnight Flow</div>
											<div class="live-beat-meta">Trap · 140 BPM</div>
										</div>
									</div>
									<div class="live-beat-card anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {(local[item.delKey] ?? local.animDelay ?? 0) + 0.15}s; animation-timing-function: {getEase(item.easeKey)}">
										<div class="live-beat-img"></div>
										<div class="live-beat-info">
											<div class="live-beat-name">Neon Dreams</div>
											<div class="live-beat-meta">Lo-Fi · 85 BPM</div>
										</div>
									</div>
								</div>
							{:else if item.key === 'animButtons'}
								<div class="live-btn-row">
									<button class="live-cta anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {local[item.delKey] ?? local.animDelay ?? 0}s; animation-timing-function: {getEase(item.easeKey)}">
										💬 Pedir por WhatsApp
									</button>
								</div>
							{:else if item.key === 'animPlayer'}
								<div class="live-player anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {local[item.delKey] ?? local.animDelay ?? 0}s; animation-timing-function: {getEase(item.easeKey)}">
									<div class="live-player-btn">▶</div>
									<div class="live-player-bars">
										{#each Array(12) as _, i}
											<div class="live-bar" style="height: {10 + Math.sin(i * 0.8) * 14}px"></div>
										{/each}
									</div>
									<div class="live-player-time">1:23</div>
								</div>
							{:else if item.key === 'animWaveform'}
								<div class="live-waveform anim-{animType}" style="animation-duration: {local[item.durKey] ?? local.animDuration ?? 2}s; animation-delay: {local[item.delKey] ?? local.animDelay ?? 0}s; animation-timing-function: {getEase(item.easeKey)}">
									{#each Array(20) as _, i}
										<div class="live-wave-bar" style="height: {8 + Math.sin(i * 0.6) * 16}px; opacity: {i < 8 ? 0.8 : 0.3}"></div>
									{/each}
								</div>
							{/if}
						</div>
						<span class="live-anim-name">{animType}</span>
					{:else}
						<div class="live-empty">Sin animación</div>
					{/if}
				</div>
			{/each}
		</div>
	</Card>

	<!-- All Presets Gallery -->
	<Card>
		<h3 class="section-title">📚 Galería de Presets</h3>
		<p class="field-desc">Todos los presets disponibles — click para ver la animación en loop.</p>
		<div class="preset-grid">
			{#each PRESETS.filter(p => p.value !== 'none') as p}
				<div class="preset-card">
					<div class="preset-demo anim-{p.value}">♦</div>
					<span class="preset-name">{p.label}</span>
				</div>
			{/each}
		</div>
	</Card>
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }

	.anim-row { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-2); }
	.anim-label { display: flex; align-items: center; gap: var(--space-3); flex: 1; font-size: var(--text-sm); color: var(--text); }
	.anim-icon { font-size: var(--text-lg); }
	.field select { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-sm); min-height: var(--touch-min); outline: none; min-width: 160px; }
	.field textarea { padding: var(--space-2) var(--space-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text); font-size: var(--text-xs); font-family: var(--font-mono); min-height: 100px; resize: vertical; outline: none; width: 100%; }
	.field textarea:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.field select:focus-visible { border-color: rgba(var(--accent-rgb), 0.5); }
	.field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.field input[type="range"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
	.field-desc { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-3); }
	.row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
	.row .field { flex: 1; min-width: 120px; }

	/* Per-element timing */
	.anim-timing { padding: var(--space-2) var(--space-2) 0; border-top: 1px solid var(--border); margin-top: var(--space-2); animation: fadeIn 0.2s ease; }
	.timing-row { display: flex; gap: var(--space-3); align-items: end; }
	.timing-field { flex: 1; min-width: 80px; display: flex; flex-direction: column; gap: var(--space-1); }
	.timing-label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-hint); text-transform: uppercase; letter-spacing: 0.06em; }
	.timing-field input[type="range"] { width: 100%; accent-color: var(--accent); }
	.timing-field select { padding: var(--space-1) var(--space-2); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: var(--text-xs); min-height: 28px; outline: none; }
	.timing-field select:focus-visible { border-color: rgba(var(--accent-rgb), 0.5); }

	@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

	.preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-3); }
	.preset-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
	.preset-demo { font-size: var(--text-2xl); color: var(--accent); }
	.preset-name { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; }

	/* Live Preview Grid */
	.live-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-3); }
	.live-card { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); min-height: 140px; }
	.live-label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: var(--space-2); }
	.live-anim-name { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--accent); text-align: center; }
	.live-empty { font-size: var(--text-xs); color: var(--text-muted); text-align: center; padding: var(--space-4); }
	.live-demo-wrap { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }

	/* Logo preview */
	.live-logo { display: flex; align-items: center; gap: var(--space-2); }
	.live-logo-icon { font-size: var(--text-xl); }
	.live-logo-text { font-family: var(--font-display, sans-serif); font-size: var(--text-sm); font-weight: 700; color: var(--text); }

	/* Title preview */
	.live-title { font-family: var(--font-display, sans-serif); font-size: var(--text-sm); font-weight: 800; color: var(--text); text-align: center; line-height: 1.3; }

	/* Beat cards preview */
	.live-card-row { display: flex; gap: var(--space-2); }
	.live-beat-card { width: 80px; border-radius: var(--radius-sm); overflow: hidden; background: var(--surface-hover); border: 1px solid var(--border); flex-shrink: 0; }
	.live-beat-img { width: 100%; height: 50px; background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.3), rgba(var(--accent-rgb), 0.1)); }
	.live-beat-info { padding: 4px; }
	.live-beat-name { font-size: 8px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.live-beat-meta { font-size: 7px; color: var(--text-muted); }

	/* Button preview */
	.live-btn-row { display: flex; justify-content: center; }
	.live-cta { padding: var(--space-2) var(--space-3); background: var(--accent, #25d366); border: none; border-radius: var(--radius-md); color: #fff; font-size: var(--text-2xs); font-weight: 600; cursor: default; white-space: nowrap; }

	/* Player preview */
	.live-player { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2); background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); width: 100%; }
	.live-player-btn { width: 24px; height: 24px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
	.live-player-bars { display: flex; align-items: flex-end; gap: 2px; flex: 1; height: 24px; }
	.live-bar { width: 4px; background: var(--accent); border-radius: 1px; min-height: 3px; }
	.live-player-time { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); flex-shrink: 0; }

	/* Waveform preview */
	.live-waveform { display: flex; align-items: flex-end; gap: 2px; height: 36px; width: 100%; justify-content: center; }
	.live-wave-bar { width: 5px; background: var(--accent); border-radius: 1px; min-height: 3px; }

	/* Animation demos */
	@keyframes anim-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
	@keyframes anim-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
	@keyframes anim-bounce { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-12px); } 60% { transform: translateY(-6px); } }
	@keyframes anim-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
	@keyframes anim-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
	@keyframes anim-glow { 0%, 100% { opacity: 0.6; filter: brightness(1); } 50% { opacity: 1; filter: brightness(1.5); } }
	@keyframes anim-slide-up { from { transform: translateY(10px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
	@keyframes anim-slide-down { from { transform: translateY(-10px); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
	@keyframes anim-fade-in { from { opacity: 0; } to { opacity: 1; } }

	.anim-float { animation: anim-float 2s ease-in-out infinite; }
	.anim-pulse { animation: anim-pulse 1.5s ease-in-out infinite; }
	.anim-bounce { animation: anim-bounce 1s ease-in-out infinite; }
	.anim-spin { animation: anim-spin 2s linear infinite; }
	.anim-shake { animation: anim-shake 0.5s ease-in-out infinite; }
	.anim-glow { animation: anim-glow 2s ease-in-out infinite; }
	.anim-slide-up { animation: anim-slide-up 1s ease-out infinite; }
	.anim-slide-down { animation: anim-slide-down 1s ease-out infinite; }
	.anim-fade-in { animation: anim-fade-in 2s ease-in-out infinite; }
</style>
