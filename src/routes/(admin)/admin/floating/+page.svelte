<script lang="ts">
	import { Card, Range, Badge, HelpTip } from '$lib/components';
	import {
		floatingElements,
		floatingLoading,
		createFloatingElement,
		updateFloatingElement,
		deleteFloatingElement,
		toggleFloatingVisibility,
		defaultElement,
		type FloatingElement,
		type FloatingAnimation,
	} from '$lib/stores/floating';
	import { toast } from '$lib/toastStore';

	let elements = $derived($floatingElements);
	let loading = $derived($floatingLoading);
	let editingId = $state<string | null>(null);
	let showNew = $state(false);

	// Edit form state
	let form = $state<Partial<FloatingElement>>({});

	function startEdit(el: FloatingElement) {
		editingId = el.id;
		form = { ...el };
		showNew = false;
	}

	function startNew() {
		showNew = true;
		editingId = null;
		form = defaultElement();
	}

	function cancelEdit() {
		editingId = null;
		showNew = false;
		form = {};
	}

	async function saveEdit() {
		if (!editingId) return;
		try {
			await updateFloatingElement(editingId, form);
			toast.success('Elemento actualizado');
			editingId = null;
			form = {};
		} catch (err) {
			toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	async function saveNew() {
		try {
			await createFloatingElement(form);
			toast.success('Elemento creado');
			showNew = false;
			form = {};
		} catch (err) {
			toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	async function handleDelete(id: string, name: string) {
		if (!confirm(`¿Eliminar "${name}"?`)) return;
		try {
			await deleteFloatingElement(id);
			toast.success('Elemento eliminado');
			if (editingId === id) cancelEdit();
		} catch (err) {
			toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	async function handleToggle(id: string, visible: boolean) {
		try {
			await toggleFloatingVisibility(id, visible);
		} catch (err) {
			toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	const animationOptions: { value: FloatingAnimation; label: string }[] = [
		{ value: 'none', label: 'Sin animación' },
		{ value: 'float', label: 'Float (flotar)' },
		{ value: 'pulse', label: 'Pulse (pulsar)' },
		{ value: 'bounce', label: 'Bounce (rebotar)' },
		{ value: 'spin', label: 'Spin (girar)' },
		{ value: 'drift', label: 'Drift (derivar)' },
	];

	let previewElements = $derived(elements.filter((e) => e.visible));
</script>

<div class="floating-admin">
	<div class="page-header">
		<div>
			<h1 class="page-title">✨ Floating Elements</h1>
			<p class="page-sub">Elementos flotantes sobre la tienda (imágenes, emojis, texto)</p>
		</div>
		<button class="btn-primary" onclick={startNew}>+ Nuevo elemento</button>
	</div>

	<!-- Live preview -->
	<Card>
		<div class="preview-section">
			<h3 class="section-title">Preview en vivo <HelpTip text="Los elementos aparecen sobre la tienda. Posición en % del viewport." /></h3>
			<div class="preview-box">
				{#each previewElements as el}
					<div
						class="preview-dot"
						style="left: {el.x}%; top: {el.y}%; opacity: {el.opacity}; width: {Math.max(el.width, 20)}px;"
						title="{el.type === 'text' ? el.content : '🖼️'} ({el.x}%, {el.y}%)"
					>
						{#if el.type === 'text'}
							{el.content}
						{:else}
							🖼️
						{/if}
					</div>
				{/each}
				{#if previewElements.length === 0}
					<div class="preview-empty">Sin elementos visibles</div>
				{/if}
			</div>
		</div>
	</Card>

	<!-- Element list -->
	{#if loading}
		<p class="loading-text">Cargando...</p>
	{:else if elements.length === 0 && !showNew}
		<Card>
			<div class="empty-state">
				<span class="empty-icon">✨</span>
				<p class="empty-text">No hay elementos flotantes</p>
				<p class="empty-hint">Creá uno para agregar imágenes o emojis sobre la tienda</p>
				<button class="btn-primary" onclick={startNew}>+ Crear primer elemento</button>
			</div>
		</Card>
	{:else}
		<div class="elements-list">
			{#each elements as el}
				<Card>
					<div class="element-row">
						<div class="element-info">
							<span class="element-icon">{el.type === 'text' ? el.content : '🖼️'}</span>
							<div class="element-meta">
								<span class="element-type">
									{el.type === 'text' ? 'Texto' : 'Imagen'}
									<Badge variant={el.visible ? 'accent' : 'muted'}>{el.visible ? 'Visible' : 'Oculto'}</Badge>
								</span>
								<span class="element-pos">x:{el.x}% y:{el.y}% · {el.width}px · op:{Math.round(el.opacity * 100)}%</span>
								{#if el.animation !== 'none'}
									<span class="element-anim">🎬 {el.animation} ({el.animationDuration}s)</span>
								{/if}
							</div>
						</div>
						<div class="element-actions">
							<button
								class="btn-icon"
								onclick={() => handleToggle(el.id, !el.visible)}
								title={el.visible ? 'Ocultar' : 'Mostrar'}
								aria-label={el.visible ? 'Ocultar elemento' : 'Mostrar elemento'}
							>
								{el.visible ? '👁' : '👁‍🗨'}
							</button>
							<button class="btn-icon" onclick={() => startEdit(el)} title="Editar" aria-label="Editar elemento">✏️</button>
							<button class="btn-icon btn-danger" onclick={() => handleDelete(el.id, el.content)} title="Eliminar" aria-label="Eliminar elemento">🗑️</button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}

	<!-- Edit / New form -->
	{#if editingId || showNew}
		<div class="form-backdrop" onclick={cancelEdit} onkeydown={(e) => e.key === 'Escape' && cancelEdit()} role="button" tabindex="-1" aria-label="Cerrar formulario"></div>
		<div class="form-panel" role="dialog" aria-modal="true" aria-label={showNew ? 'Nuevo elemento' : 'Editar elemento'}>
			<div class="form-header">
				<h3>{showNew ? '✨ Nuevo elemento' : '✏️ Editar elemento'}</h3>
				<button class="btn-icon" onclick={cancelEdit} aria-label="Cerrar">✕</button>
			</div>

			<div class="form-body">
				<!-- Type -->
				<div class="form-group">
					<label class="form-label">Tipo</label>
					<div class="type-toggle">
						<button
							class="type-btn"
							class:active={form.type === 'text'}
							onclick={() => (form.type = 'text')}
						>📝 Texto / Emoji</button>
						<button
							class="type-btn"
							class:active={form.type === 'image'}
							onclick={() => (form.type = 'image')}
						>🖼️ Imagen URL</button>
					</div>
				</div>

				<!-- Content -->
				<div class="form-group">
					<label class="form-label" for="fl-content">
						{form.type === 'image' ? 'URL de imagen' : 'Texto o emoji'}
					</label>
					<input
						id="fl-content"
						type="text"
						class="form-input"
						value={form.content ?? ''}
						oninput={(e) => (form.content = e.currentTarget.value)}
						placeholder={form.type === 'image' ? 'https://...' : '✨'}
					/>
				</div>

				<!-- Position -->
				<div class="form-row">
					<div class="form-group flex-1">
						<Range
							label="Posición X (%)"
							value={form.x ?? 50}
							min={0} max={100} step={1}
							onSlide={(v: number) => (form.x = v)}
						/>
					</div>
					<div class="form-group flex-1">
						<Range
							label="Posición Y (%)"
							value={form.y ?? 50}
							min={0} max={100} step={1}
							onSlide={(v: number) => (form.y = v)}
						/>
					</div>
				</div>

				<!-- Size & Opacity -->
				<div class="form-row">
					<div class="form-group flex-1">
						<Range
							label="Ancho (px)"
							value={form.width ?? 60}
							min={10} max={400} step={5}
							onSlide={(v: number) => (form.width = v)}
						/>
					</div>
					<div class="form-group flex-1">
						<Range
							label="Opacidad"
							value={Math.round((form.opacity ?? 0.6) * 100)}
							min={5} max={100} step={5}
							onSlide={(v: number) => (form.opacity = v / 100)}
						/>
					</div>
				</div>

				<!-- Rotation & Z-index -->
				<div class="form-row">
					<div class="form-group flex-1">
						<Range
							label="Rotación (°)"
							value={form.rotation ?? 0}
							min={-180} max={180} step={5}
							onSlide={(v: number) => (form.rotation = v)}
						/>
					</div>
					<div class="form-group flex-1">
						<Range
							label="Capa (z-index)"
							value={form.zIndex ?? 5}
							min={1} max={20} step={1}
							onSlide={(v: number) => (form.zIndex = v)}
						/>
					</div>
				</div>

				<!-- Animation -->
				<div class="form-group">
					<label class="form-label">Animación</label>
					<select
						class="form-select"
						value={form.animation ?? 'none'}
						onchange={(e) => (form.animation = e.currentTarget.value as FloatingAnimation)}
					>
						{#each animationOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				{#if form.animation && form.animation !== 'none'}
					<div class="form-group">
						<Range
							label="Duración animación (s)"
							value={form.animationDuration ?? 4}
							min={1} max={20} step={0.5}
							onSlide={(v: number) => (form.animationDuration = v)}
						/>
					</div>
				{/if}

				<!-- Responsive -->
				<div class="form-group">
					<label class="form-label">Visibilidad</label>
					<div class="toggle-row">
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={form.visible ?? true}
								onchange={(e) => (form.visible = e.currentTarget.checked)}
							/>
							<span>Visible</span>
						</label>
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={form.desktopOnly ?? false}
								onchange={(e) => {
									form.desktopOnly = e.currentTarget.checked;
									if (e.currentTarget.checked) form.mobileOnly = false;
								}}
							/>
							<span>Solo desktop</span>
						</label>
						<label class="toggle-label">
							<input
								type="checkbox"
								checked={form.mobileOnly ?? false}
								onchange={(e) => {
									form.mobileOnly = e.currentTarget.checked;
									if (e.currentTarget.checked) form.desktopOnly = false;
								}}
							/>
							<span>Solo mobile</span>
						</label>
					</div>
				</div>
			</div>

			<div class="form-footer">
				{#if editingId}
					<button class="btn-danger-text" onclick={() => handleDelete(editingId!, form.content ?? '')}>Eliminar</button>
				{/if}
				<div class="form-footer-right">
					<button class="btn-secondary" onclick={cancelEdit}>Cancelar</button>
					<button class="btn-primary" onclick={editingId ? saveEdit : saveNew}>
						{showNew ? 'Crear' : 'Guardar'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.floating-admin {
		max-width: 900px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
		gap: var(--space-4);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.page-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	.btn-primary {
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		min-height: var(--touch-min);
		white-space: nowrap;
		transition: opacity var(--duration-fast);
	}

	.btn-primary:hover { opacity: 0.9; }

	/* Preview */
	.preview-section { padding: var(--space-4); }

	.section-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-3);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.preview-box {
		position: relative;
		width: 100%;
		height: 200px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.preview-dot {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		background: rgba(var(--accent-rgb), 0.15);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-sm);
		min-width: 20px;
		min-height: 20px;
		pointer-events: none;
	}

	.preview-empty {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	/* Element list */
	.elements-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.element-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		gap: var(--space-3);
	}

	.element-info {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
	}

	.element-icon {
		font-size: var(--text-xl);
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface);
		border-radius: var(--radius-md);
	}

	.element-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.element-type {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.element-pos, .element-anim {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.element-actions {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.btn-icon {
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		cursor: pointer;
		font-size: var(--text-base);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--duration-fast);
	}

	.btn-icon:hover {
		background: var(--surface);
		border-color: rgba(var(--accent-rgb), 0.3);
	}

	.btn-danger:hover {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.08);
	}

	/* Empty state */
	.empty-state {
		padding: var(--space-10) var(--space-6);
		text-align: center;
	}

	.empty-icon { font-size: 48px; display: block; margin-bottom: var(--space-3); }
	.empty-text { font-size: var(--text-lg); font-weight: 600; color: var(--text); }
	.empty-hint { font-size: var(--text-sm); color: var(--text-muted); margin: var(--space-2) 0 var(--space-4); }

	/* Form panel */
	.form-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 999;
	}

	.form-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: min(480px, 92vw);
		height: 100dvh;
		z-index: 1000;
		background: var(--bg-secondary);
		border-left: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		animation: slideInRight 0.25s var(--ease-out);
		box-shadow: var(--shadow-menu);
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--border);
	}

	.form-header h3 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
	}

	.form-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4) var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.form-input, .form-select {
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

	.form-input:focus, .form-select:focus {
		border-color: var(--accent);
	}

	.form-row {
		display: flex;
		gap: var(--space-4);
	}

	.flex-1 { flex: 1; }

	.type-toggle {
		display: flex;
		gap: var(--space-2);
	}

	.type-btn {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		min-height: var(--touch-min);
		transition: all var(--duration-fast);
	}

	.type-btn.active {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.08);
		color: var(--accent);
		font-weight: 600;
	}

	.toggle-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		cursor: pointer;
	}

	.toggle-label input[type="checkbox"] {
		accent-color: var(--accent);
	}

	.form-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-top: 1px solid var(--border);
	}

	.form-footer-right {
		display: flex;
		gap: var(--space-3);
	}

	.btn-secondary {
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		min-height: var(--touch-min);
	}

	.btn-secondary:hover { background: var(--surface); }

	.btn-danger-text {
		padding: var(--space-2) var(--space-4);
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: #ef4444;
		font-size: var(--text-sm);
		cursor: pointer;
		min-height: var(--touch-min);
	}

	.btn-danger-text:hover { background: rgba(239, 68, 68, 0.08); }

	.loading-text {
		text-align: center;
		padding: var(--space-8);
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	@keyframes slideInRight {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
		}

		.form-row {
			flex-direction: column;
			gap: var(--space-3);
		}
	}
</style>
