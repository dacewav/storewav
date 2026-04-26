	<svelte:head><title>Testimonials — Admin</title></svelte:head>
<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card, FileUpload , Collapsible} from '$lib/components';

	let s = $derived($settings.data);
	let testimonials = $derived((s?.testimonials ?? []) as { name: string; text: string; stars?: number; avatar?: string; role?: string }[]);
	let title = $derived(s?.labels?.testimonialsTitle ?? 'Lo que dicen');

	function updateTestimonials(newItems: typeof testimonials) {
		settings.updateField('testimonials', newItems);
	}

	function addTestimonial() {
		updateTestimonials([...testimonials, { name: '', text: '', stars: 5, role: '' }]);
	}

	function removeTestimonial(i: number) {
		updateTestimonials(testimonials.filter((_, idx) => idx !== i));
	}

	function updateField(i: number, field: string, val: string | number) {
		const updated = [...testimonials];
		updated[i] = { ...updated[i], [field]: val };
		updateTestimonials(updated);
	}

	function moveItem(i: number, dir: 'up' | 'down') {
		const j = dir === 'up' ? i - 1 : i + 1;
		if (j < 0 || j >= testimonials.length) return;
		const updated = [...testimonials];
		[updated[i], updated[j]] = [updated[j], updated[i]];
		updateTestimonials(updated);
	}

	function updateTitle(val: string) {
		settings.updateField('labels.testimonialsTitle', val);
	}
</script>

<div class="editor" role="form" aria-label="Editor de testimonials">
	<h2 class="editor-title">💬 Testimonios</h2>
	<p class="editor-desc">Reseñas y opiniones de clientes. Se muestran en la página principal.</p>

	<Collapsible id="test-list" icon="💬" title="General" open={true}>
				<div class="field">
			<label for="test-title">Título de la sección</label>
			<input id="test-title" type="text" value={title} oninput={(e) => updateTitle(e.currentTarget.value)} />
		</div>
	</Collapsible>

	<Collapsible id="test-settings" icon="⚙️" title="Testimonios ({testimonials.length})" open={false}>
		
		{#if testimonials.length === 0}
			<p class="empty-msg">No hay testimonios. Añade uno para empezar.</p>
		{/if}

		{#each testimonials as t, i}
			<div class="testimonial-row">
				<div class="testimonial-fields">
					<div class="row">
						<div class="field" style="flex:2">
							<label for="test-name-{i}">Nombre</label>
							<input id="test-name-{i}" type="text" value={t.name} placeholder="Juan Pérez" oninput={(e) => updateField(i, 'name', e.currentTarget.value)} />
						</div>
						<div class="field">
							<label for="test-role-{i}">Rol</label>
							<input id="test-role-{i}" type="text" value={t.role ?? ''} placeholder="Productor" oninput={(e) => updateField(i, 'role', e.currentTarget.value)} />
						</div>
						<div class="field">
							<label for="test-stars-{i}">Estrellas</label>
							<select id="test-stars-{i}" value={t.stars ?? 5} onchange={(e) => updateField(i, 'stars', +e.currentTarget.value)}>
								<option value={5}>★★★★★</option>
								<option value={4}>★★★★☆</option>
								<option value={3}>★★★☆☆</option>
								<option value={2}>★★☆☆☆</option>
								<option value={1}>★☆☆☆☆</option>
							</select>
						</div>
					</div>
					<div class="field">
						<label for="test-text-{i}">Texto</label>
						<textarea id="test-text-{i}" value={t.text} placeholder="Excelente calidad, beats profesionales..." rows={2} oninput={(e) => updateField(i, 'text', e.currentTarget.value)}></textarea>
					</div>
					<div class="field">
						<label>Avatar (opcional)</label>
						<FileUpload
							value={t.avatar ?? ''}
							folder="testimonials"
							beatId="avatar"
							accept="image/*"
							label="Avatar"
							type="image"
							maxSizeMB={5}
							onUploadComplete={(url) => updateField(i, 'avatar', url)}
							onRemove={() => updateField(i, 'avatar', '')}
						/>
						<div class="url-fallback">
							<label for="test-avatar-{i}">O pega una URL:</label>
							<input id="test-avatar-{i}" type="url" value={t.avatar ?? ''} placeholder="https://..." oninput={(e) => updateField(i, 'avatar', e.currentTarget.value)} />
						</div>
					</div>
				</div>
				<div class="testimonial-actions">
					<button class="btn-icon" aria-label="Subir" title="Subir" onclick={() => moveItem(i, 'up')} disabled={i === 0}>↑</button>
					<button class="btn-icon" aria-label="Bajar" title="Bajar" onclick={() => moveItem(i, 'down')} disabled={i === testimonials.length - 1}>↓</button>
					<button class="btn-icon btn-icon-del" aria-label="Eliminar" title="Eliminar" onclick={() => removeTestimonial(i)}>✕</button>
				</div>
			</div>
		{/each}

		<button class="btn-add" onclick={addTestimonial}>+ Añadir testimonio</button>
	</Collapsible>
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.empty-msg { font-size: var(--text-sm); color: var(--text-muted); font-style: italic; padding: var(--space-4) 0; }

	.testimonial-row {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--surface);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
	}

	.testimonial-fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.testimonial-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex-shrink: 0;
	}

	.row {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.row .field {
		flex: 1;
		min-width: 80px;
		margin-bottom: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
	}

	.url-fallback {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-top: var(--space-1);
	}

	.url-fallback label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.url-fallback input {
		padding: var(--space-1) var(--space-2);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.url-fallback input:focus {
		border-color: rgba(var(--accent-rgb), 0.5);
	}

	.field label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.field input[type="text"],
	.field input[type="url"],
	.field select,
	.field textarea {
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
		font-family: var(--font-body);
		resize: vertical;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus {
		border-color: rgba(var(--accent-rgb), 0.5);
	}

	.btn-icon {
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: all var(--duration-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon:hover:not(:disabled) {
		background: var(--surface-hover);
		color: var(--text);
	}

	.btn-icon:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.btn-icon-del:hover:not(:disabled) {
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
		width: 100%;
	}

	.btn-add:hover {
		border-color: rgba(var(--accent-rgb), 0.5);
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.05);
	}

	@media (max-width: 768px) {
		.testimonial-row { flex-direction: column; }
		.testimonial-actions { flex-direction: row; }
		.row { flex-direction: column; }
	}
</style>
