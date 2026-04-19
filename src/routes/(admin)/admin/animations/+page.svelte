<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';

	let s = $derived($settings.data);
	let anim = $derived(s?.animations ?? {});

	function update(path: string, value: unknown) {
		settings.updateField(path, value);
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

	const ANIM_ITEMS = [
		{ key: 'animLogo', label: 'Logo / Brand', icon: '🏷️' },
		{ key: 'animTitle', label: 'Título Hero', icon: '✨' },
		{ key: 'animPlayer', label: 'Player Bar', icon: '🎵' },
		{ key: 'animCards', label: 'Beat Cards', icon: '🃏' },
		{ key: 'animButtons', label: 'Botones', icon: '🔘' },
		{ key: 'animWaveform', label: 'Waveform', icon: '📊' }
	];
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
					<select value={anim[item.key] ?? 'none'} onchange={(e) => update(`animations.${item.key}`, e.currentTarget.value)}>
						{#each PRESETS as p}
							<option value={p.value}>{p.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</Card>
	{/each}

	<Card>
		<h3 class="section-title">Referencia de presets</h3>
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

	.preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-3); }
	.preset-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
	.preset-demo { font-size: var(--text-2xl); color: var(--accent); }
	.preset-name { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-secondary); text-transform: uppercase; }

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
