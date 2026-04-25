<script lang="ts">
	/**
	 * AdminOnboard — first-visit welcome modal with quick tips.
	 * Persists "seen" state to localStorage.
	 */
	let {
		open = $bindable(false)
	}: {
		open?: boolean;
	} = $props();

	let step = $state(0);

	const steps = [
		{
			icon: '👋',
			title: '¡Bienvenido al Admin!',
			desc: 'Desde acá controlás toda la apariencia de tu tienda. Colores, fuentes, animaciones, contenido — todo desde un solo lugar.'
		},
		{
			icon: '🎨',
			title: 'Personalización en vivo',
			desc: 'Los sliders y controles actualizan la tienda en tiempo real. Usá el preview split (Ctrl+P) para ver los cambios sin salir del admin.'
		},
		{
			icon: '⌨️',
			title: 'Atajos de teclado',
			shortcuts: [
				{ key: 'Ctrl+K', desc: 'Buscar y navegar' },
				{ key: 'Ctrl+Z', desc: 'Deshacer' },
				{ key: 'Ctrl+P', desc: 'Preview split' },
				{ key: 'Ctrl+B', desc: 'Ir a Beats' },
				{ key: 'Ctrl+T', desc: 'Ir a Tema' },
			]
		},
		{
			icon: '🚀',
			title: '¡Listo para empezar!',
			desc: 'Explorá las secciones desde el menú lateral o usá Ctrl+K para buscar. Los cambios se guardan automáticamente.'
		}
	];

	function next() {
		if (step < steps.length - 1) {
			step++;
		} else {
			close();
		}
	}

	function close() {
		open = false;
		localStorage.setItem('admin-onboard-seen', '1');
	}

	function skip() {
		close();
	}

	// Check if first visit
	$effect(() => {
		if (typeof window !== 'undefined' && !localStorage.getItem('admin-onboard-seen')) {
			// Small delay so the page loads first
			setTimeout(() => (open = true), 800);
		}
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="onboard-backdrop" onclick={skip}>
		<div class="onboard-modal" onclick={(e) => e.stopPropagation()}>
			<div class="onboard-progress">
				{#each steps as _, i}
					<div class="progress-dot" class:active={i === step} class:done={i < step}></div>
				{/each}
			</div>

			<div class="onboard-content">
				<span class="onboard-icon">{steps[step].icon}</span>
				<h3 class="onboard-title">{steps[step].title}</h3>
				{#if steps[step].desc}
					<p class="onboard-desc">{steps[step].desc}</p>
				{/if}
				{#if steps[step].shortcuts}
					<div class="shortcuts-list">
						{#each steps[step].shortcuts as sc}
							<div class="shortcut-row">
								<kbd class="shortcut-key">{sc.key}</kbd>
								<span class="shortcut-desc">{sc.desc}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="onboard-actions">
				<button class="obtn skip" onclick={skip}>Saltar</button>
				<button class="obtn next" onclick={next}>
					{step < steps.length - 1 ? 'Siguiente' : '¡Entendido!'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.onboard-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(6px);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.2s ease;
	}

	.onboard-modal {
		width: 440px;
		max-width: 90vw;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg, 16px);
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		animation: popIn 0.25s ease;
	}

	.onboard-progress {
		display: flex;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-4) 0;
	}

	.progress-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--border);
		transition: all 0.3s ease;
	}

	.progress-dot.active {
		background: var(--accent);
		width: 24px;
		border-radius: 4px;
	}

	.progress-dot.done {
		background: var(--accent);
		opacity: 0.4;
	}

	.onboard-content {
		padding: var(--space-6) var(--space-8);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.onboard-icon {
		font-size: 48px;
		line-height: 1;
		animation: bounceIn 0.4s ease;
	}

	.onboard-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		color: var(--text);
		margin: 0;
	}

	.onboard-desc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
		max-width: 340px;
	}

	.shortcuts-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 100%;
		max-width: 280px;
		margin-top: var(--space-2);
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.shortcut-key {
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 3px 8px;
		border-radius: 4px;
		background: var(--bg-secondary, rgba(255,255,255,0.05));
		border: 1px solid var(--border);
		color: var(--text);
		font-weight: 600;
		flex-shrink: 0;
	}

	.shortcut-desc {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.onboard-actions {
		display: flex;
		justify-content: space-between;
		padding: 0 var(--space-6) var(--space-5);
	}

	.obtn {
		padding: var(--space-2) var(--space-5);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--border);
		transition: all var(--duration-fast);
		min-height: var(--touch-min);
	}

	.obtn.skip {
		background: transparent;
		color: var(--text-muted);
	}

	.obtn.skip:hover {
		color: var(--text);
	}

	.obtn.next {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.obtn.next:hover {
		filter: brightness(1.1);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes popIn {
		from { opacity: 0; transform: scale(0.92); }
		to { opacity: 1; transform: scale(1); }
	}

	@keyframes bounceIn {
		0% { transform: scale(0.3); opacity: 0; }
		50% { transform: scale(1.1); }
		100% { transform: scale(1); opacity: 1; }
	}
</style>
