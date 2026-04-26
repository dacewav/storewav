<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card } from '$lib/components';
	import { ALL_FEATURES, FEATURE_LABELS, type FeatureKey } from '$lib/featureToggles';
	import { toast } from '$lib/toastStore';

	let features = $derived(($settings.data?.features ?? {}) as Record<string, boolean>);

	function isEnabled(key: FeatureKey): boolean {
		// Default: all features ON unless explicitly disabled
		return features[key] !== false;
	}

	function toggle(key: FeatureKey) {
		const current = isEnabled(key);
		settings.updateField(`features.${key}`, !current);
		toast.success(`${FEATURE_LABELS[key].label} ${!current ? 'activado' : 'desactivado'}`);
	}

	function enableAll() {
		const update: Record<string, boolean> = {};
		for (const key of ALL_FEATURES) update[key] = true;
		settings.updateField('features', update);
		toast.success('Todas las features activadas');
	}

	function disableAll() {
		if (!confirm('¿Desactivar todas las features?')) return;
		const update: Record<string, boolean> = {};
		for (const key of ALL_FEATURES) update[key] = false;
		settings.updateField('features', update);
		toast.success('Todas las features desactivadas');
	}

	let enabledCount = $derived(ALL_FEATURES.filter(isEnabled).length);
</script>

<svelte:head>
	<title>Features — Admin</title>
</svelte:head>

<div class="features-page" role="form" aria-label="Editor de features">
	<div class="page-header">
		<div>
			<h2 class="page-title">⚡ Feature Toggles</h2>
			<p class="page-desc">Activá o desactivá secciones de la tienda. {enabledCount}/{ALL_FEATURES.length} activas</p>
		</div>
		<div class="header-actions">
			<button class="btn-ghost" onclick={enableAll}>✓ Todo ON</button>
			<button class="btn-ghost" onclick={disableAll}>✕ Todo OFF</button>
		</div>
	</div>

	<div class="features-grid">
		{#each ALL_FEATURES as key}
			{@const meta = FEATURE_LABELS[key]}
			<button class="feature-row" class:disabled={!isEnabled(key)} onclick={() => toggle(key)}>
				<span class="f-icon">{meta.icon}</span>
				<div class="f-info">
					<span class="f-name">{meta.label}</span>
					<span class="f-desc">{meta.description}</span>
				</div>
				<div class="f-toggle" class:on={isEnabled(key)}>
					<span class="f-toggle-dot"></span>
				</div>
			</button>
		{/each}
	</div>

	<div class="info-card">
		<h4>💡 Cómo funciona</h4>
		<ul>
			<li>Las features están <strong>activadas por defecto</strong>.</li>
			<li>Desactivar una feature la oculta de la tienda pero no borra los datos.</li>
			<li>Los settings se guardan en Firebase en <code>settings/features/</code>.</li>
		</ul>
	</div>
</div>

<style>
	.features-page { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }

	.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
	.page-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.page-desc { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1); }
	.header-actions { display: flex; gap: var(--space-2); flex-shrink: 0; }

	.btn-ghost {
		padding: var(--space-2) var(--space-3); min-height: var(--touch-min);
		background: transparent; border: 1px solid var(--border);
		border-radius: var(--radius-md); color: var(--text-secondary);
		font-size: var(--text-xs); cursor: pointer; transition: all var(--duration-fast);
	}
	.btn-ghost:hover { background: var(--surface-hover); color: var(--text); }

	.features-grid { display: flex; flex-direction: column; gap: var(--space-2); }

	.feature-row {
		display: flex; align-items: center; gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--border); border-radius: var(--radius-md);
		background: var(--surface); cursor: pointer;
		transition: all var(--duration-fast); text-align: left;
	}
	.feature-row:hover { border-color: rgba(var(--accent-rgb), 0.3); background: var(--surface-hover); }
	.feature-row.disabled { opacity: 0.6; }

	.f-icon { font-size: 1.2rem; flex-shrink: 0; }
	.f-info { flex: 1; min-width: 0; }
	.f-name { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text); }
	.f-desc { display: block; font-size: var(--text-2xs); color: var(--text-muted); margin-top: 2px; }

	.f-toggle {
		width: 40px; height: 22px; border-radius: 11px;
		background: var(--border); position: relative; flex-shrink: 0;
		transition: background var(--duration-fast);
	}
	.f-toggle.on { background: var(--accent); }
	.f-toggle-dot {
		position: absolute; top: 3px; left: 3px;
		width: 16px; height: 16px; border-radius: 50%;
		background: #fff; transition: transform var(--duration-fast);
		box-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}
	.f-toggle.on .f-toggle-dot { transform: translateX(18px); }

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
		.feature-grid { grid-template-columns: 1fr; }
		.bulk-actions { flex-direction: column; }
	}
</style>
