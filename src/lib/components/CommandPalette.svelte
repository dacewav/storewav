<script lang="ts">
	/**
	 * CommandPalette — Ctrl+K modal to search settings and navigate.
	 * Searches across all admin sections and settings fields.
	 */
	import { goto } from '$app/navigation';

	let {
		open = $bindable(false),
		onclose
	}: {
		open?: boolean;
		onclose?: () => void;
	} = $props();

	let query = $state('');
	let inputEl: HTMLInputElement | undefined = $state();
	let selectedIndex = $state(0);

	type Command = {
		id: string;
		label: string;
		description: string;
		icon: string;
		action: () => void;
		keywords: string[];
	};

	const sections: Command[] = [
		{ id: 'dashboard', label: 'Dashboard', description: 'Vista general', icon: '📊', action: () => goto('/admin'), keywords: ['home', 'inicio', 'overview'] },
		{ id: 'beats', label: 'Beats', description: 'Gestionar beats', icon: '🎵', action: () => goto('/admin/beats'), keywords: ['music', 'canciones', 'pistas'] },
		{ id: 'hero', label: 'Hero', description: 'Sección principal', icon: '🏠', action: () => goto('/admin/hero'), keywords: ['titulo', 'title', 'glow', 'header'] },
		{ id: 'content', label: 'Contenido', description: 'Textos y copy', icon: '✏️', action: () => goto('/admin/content'), keywords: ['textos', 'copy', 'section'] },
		{ id: 'links', label: 'Links', description: 'Enlaces sociales', icon: '🔗', action: () => goto('/admin/links'), keywords: ['social', 'url', 'enlaces'] },
		{ id: 'testimonials', label: 'Testimonios', description: 'Reseñas de clientes', icon: '💬', action: () => goto('/admin/testimonials'), keywords: ['reviews', 'estrellas', 'comments'] },
		{ id: 'theme', label: 'Tema', description: 'Colores, fuentes, glow', icon: '🎨', action: () => goto('/admin/theme'), keywords: ['color', 'accent', 'font', 'glow', 'particles', 'radius'] },
		{ id: 'cardstyle', label: 'Card Style', description: 'Estilo de las cards', icon: '🃏', action: () => goto('/admin/cardstyle'), keywords: ['card', 'border', 'shadow', 'shimmer'] },
		{ id: 'brand', label: 'Brand', description: 'Logo, identidad, paleta', icon: '🏢', action: () => goto('/admin/brand'), keywords: ['logo', 'favicon', 'nombre', 'font', 'palette'] },
		{ id: 'banner', label: 'Banner', description: 'Banner superior', icon: '📢', action: () => goto('/admin/banner'), keywords: ['scroll', 'marquee', 'alert'] },
		{ id: 'layout', label: 'Layout', description: 'Grid, spacing, nav', icon: '📐', action: () => goto('/admin/layout'), keywords: ['grid', 'cards', 'rows', 'padding', 'nav'] },
		{ id: 'animations', label: 'Animaciones', description: 'Timing y presets', icon: '🎬', action: () => goto('/admin/animations'), keywords: ['animation', 'duration', 'easing', 'keyframes'] },
		{ id: 'preview', label: 'Toggle Preview', description: 'Abrir/cerrar preview split', icon: '👁', action: () => { /* handled by parent */ }, keywords: ['preview', 'split', 'vista'] },
		{ id: 'store', label: 'Abrir Tienda', description: 'En nueva pestaña', icon: '↗️', action: () => window.open('/', '_blank'), keywords: ['store', 'tienda', 'open'] },
	];

	let filtered = $derived.by(() => {
		const q = query.toLowerCase().trim();
		if (!q) return sections;
		return sections.filter((s) =>
			s.label.toLowerCase().includes(q) ||
			s.description.toLowerCase().includes(q) ||
			s.keywords.some((k) => k.includes(q))
		);
	});

	$effect(() => {
		if (open) {
			query = '';
			selectedIndex = 0;
			setTimeout(() => inputEl?.focus(), 50);
		}
	});

	$effect(() => {
		// Reset selection when filter changes
		void filtered.length;
		selectedIndex = 0;
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const cmd = filtered[selectedIndex];
			if (cmd) execute(cmd);
		}
	}

	function execute(cmd: Command) {
		cmd.action();
		close();
	}

	function close() {
		open = false;
		onclose?.();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="palette-backdrop" onclick={close} role="presentation">
		<div class="palette-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette" tabindex="-1">
			<div class="palette-input-row">
				<span class="palette-icon">🔍</span>
				<input
					bind:this={inputEl}
					type="text"
					bind:value={query}
					onkeydown={handleKeydown}
					placeholder="Buscar sección o ajuste…"
					class="palette-input"
					autocomplete="off"
				/>
				<kbd class="palette-kbd">ESC</kbd>
			</div>

			<div class="palette-results">
				{#if filtered.length === 0}
					<div class="palette-empty">Sin resultados para "{query}"</div>
				{:else}
					{#each filtered as cmd, i}
						<button
							class="palette-item"
							class:selected={i === selectedIndex}
							onclick={() => execute(cmd)}
							onmouseenter={() => (selectedIndex = i)}
						>
							<span class="pi-icon">{cmd.icon}</span>
							<div class="pi-text">
								<span class="pi-label">{cmd.label}</span>
								<span class="pi-desc">{cmd.description}</span>
							</div>
							{#if i === selectedIndex}
								<kbd class="pi-kbd">↵</kbd>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<div class="palette-footer">
				<span class="pf-hint"><kbd>↑↓</kbd> navegar</span>
				<span class="pf-hint"><kbd>↵</kbd> abrir</span>
				<span class="pf-hint"><kbd>esc</kbd> cerrar</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.palette-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 15vh;
		animation: fadeIn 0.15s ease;
	}

	.palette-modal {
		width: 520px;
		max-width: 90vw;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg, 12px);
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		animation: slideDown 0.15s ease;
	}

	.palette-input-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.palette-icon {
		font-size: 16px;
		flex-shrink: 0;
	}

	.palette-input {
		flex: 1;
		border: none;
		background: transparent;
		color: var(--text);
		font-size: var(--text-base, 15px);
		font-family: var(--font-body);
		outline: none;
	}

	.palette-input::placeholder {
		color: var(--text-muted);
	}

	.palette-kbd {
		font-family: var(--font-mono);
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--bg-secondary, rgba(255,255,255,0.05));
		border: 1px solid var(--border);
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.palette-results {
		max-height: 360px;
		overflow-y: auto;
		padding: var(--space-2);
	}

	.palette-empty {
		padding: var(--space-6);
		text-align: center;
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	.palette-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: none;
		border-radius: var(--radius-md, 8px);
		background: transparent;
		color: var(--text);
		cursor: pointer;
		transition: background 0.1s;
		text-align: left;
	}

	.palette-item.selected {
		background: rgba(var(--accent-rgb), 0.12);
	}

	.pi-icon {
		font-size: 18px;
		width: 24px;
		text-align: center;
		flex-shrink: 0;
	}

	.pi-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.pi-label {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.pi-desc {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.pi-kbd {
		font-family: var(--font-mono);
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--accent);
		color: #fff;
		flex-shrink: 0;
	}

	.palette-footer {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-2) var(--space-4);
		border-top: 1px solid var(--border);
		background: var(--bg-secondary, rgba(255,255,255,0.02));
	}

	.pf-hint {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.pf-hint kbd {
		font-family: var(--font-mono);
		font-size: 9px;
		padding: 1px 4px;
		border-radius: 3px;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-8px) scale(0.98); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	@media (max-width: 640px) {
		.palette-backdrop {
			padding-top: 8vh;
			align-items: flex-start;
		}

		.palette-modal {
			width: 95vw;
			max-height: 70vh;
		}

		.palette-results {
			max-height: 50vh;
		}
	}
</style>
