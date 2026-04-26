	<svelte:head><title>Cardstyle — Admin</title></svelte:head>
<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, HelpTip } from '$lib/components';
	import CardStyleEditor from '$lib/components/CardStyleEditor.svelte';
	import { accentRgb as accentRgbStore } from '$lib/stores';
	import { getAllPresets, type CardPreset, type PresetId } from '$lib/cardStyleEngine';

	let cardStyle = $state<Record<string, unknown>>($settings.data?.cardStyle ?? {});
	let accentRgb = $state('220, 38, 38');
	accentRgbStore.subscribe(v => { accentRgb = v; });

	function updateCardStyle(newStyle: Record<string, unknown>) {
		cardStyle = newStyle;
		settings.updateField('cardStyle', newStyle);
	}

	function applyPreset(preset: CardPreset) {
		if (!confirm(`¿Aplicar preset "${preset.name}"? Sobreescribirá el estilo actual.`)) return;
		updateCardStyle({ ...cardStyle, ...preset.config });
	}

	function resetToDefaults() {
		if (!confirm('¿Restaurar estilo de cards a los defaults?')) return;
		updateCardStyle({});
	}

	const PRESET_ICONS: Record<PresetId, string> = {
		none: '⬜', film: '🎬', noir: '🖤', vintage: '🎞️', ember: '🔥',
		frost: '❄️', crystal: '💎', hologram: '🌈', float: '☁️',
		glitch: '📺', ghost: '👻', pop: '🎨', deep: '🌊',
	};

	const presets = getAllPresets();
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h2 class="page-title">🎨 Card Style Global</h2>
			<p class="page-desc">Estilo base aplicado a todas las cards del store. Los beats pueden sobreescribir individualmente. <HelpTip text="Estos estilos se aplican como base a TODAS las cards. Cada beat puede tener overrides individuales en su pestaña Card Style. Los presets cargan combinaciones pre-diseñadas." /></p>
		</div>
		<div class="header-actions">
			<button class="btn-ghost" onclick={resetToDefaults}>↺ Reset defaults</button>
		</div>
	</div>

	<!-- Presets -->
	<div class="presets-section">
		<h3 class="presets-title">Presets premium</h3>
		<div class="presets-grid">
			{#each presets as preset}
				<button class="preset-card" onclick={() => applyPreset(preset)} title={preset.desc}>
					<span class="preset-icon">{PRESET_ICONS[preset.id]}</span>
					<span class="preset-name">{preset.name}</span>
					<span class="preset-desc">{preset.desc}</span>
				</button>
			{/each}
		</div>
	</div>

	<Card>
		<CardStyleEditor
			bind:value={cardStyle}
			mode="global"
			{accentRgb}
			onchange={updateCardStyle}
		/>
	</Card>

	<div class="info-card">
		<h4>💡 Cómo funciona</h4>
		<ul>
			<li><strong>Este estilo</strong> es la base que se aplica a todas las cards del store.</li>
			<li><strong>Per-beat overrides</strong> en el BeatEditor → tab "Card Style" sobreescriben estos valores.</li>
			<li>El merge es: <code>global + per-beat = resultado final</code></li>
			<li>Dejar un campo en "(usar global)" en un beat usa el valor de aquí.</li>
		</ul>
	</div>
</div>

<style>
	.page { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
	.page-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.page-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-top: var(--space-1); }
	.header-actions { display: flex; gap: var(--space-2); flex-shrink: 0; }

	/* Presets */
	.presets-section { margin-bottom: var(--space-2); }
	.presets-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-3); }
	.presets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-3); }
	.preset-card {
		display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
		padding: var(--space-4) var(--space-3);
		border: 1px solid var(--border); border-radius: var(--radius-md);
		background: var(--surface); cursor: pointer; transition: all var(--duration-fast);
		text-align: center;
	}
	.preset-card:hover {
		border-color: rgba(var(--accent-rgb), 0.4);
		background: rgba(var(--accent-rgb), 0.06);
		transform: translateY(-2px);
	}
	.preset-icon { font-size: 1.5rem; }
	.preset-name { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); }
	.preset-desc { font-size: var(--text-2xs); color: var(--text-muted); line-height: 1.3; }
	.btn-ghost {
		padding: var(--space-2) var(--space-3); min-height: var(--touch-min);
		background: transparent; border: 1px solid var(--border);
		border-radius: var(--radius-md); color: var(--text-secondary);
		font-size: var(--text-xs); cursor: pointer; transition: all var(--duration-fast);
	}
	.btn-ghost:hover { background: var(--surface-hover); color: var(--text); }
	.info-card {
		padding: var(--space-4); background: var(--surface);
		border: 1px solid var(--border); border-radius: var(--radius-md);
		font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.7;
	}
	.info-card h4 { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-2); }
	.info-card ul { margin: 0; padding-left: var(--space-5); }
	.info-card li { margin-bottom: var(--space-1); }
	.info-card code { font-family: var(--font-mono); font-size: var(--text-xs); background: var(--surface2); padding: 1px 5px; border-radius: 3px; }

	@media (max-width: 768px) {
		.page-header { flex-direction: column; gap: var(--space-2); }
		.presets-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }
	}
</style>
