<script lang="ts">
	import { settings } from '$lib/stores';
	import { Card , Collapsible} from '$lib/components';

	let s = $derived($settings.data);
	let links = $derived((s?.links ?? []) as { label: string; url: string; icon?: string }[]);

	function updateLinks(newLinks: typeof links) {
		settings.updateField('links', newLinks);
	}

	function addLink() {
		updateLinks([...links, { label: '', url: '', icon: '' }]);
	}

	function removeLink(i: number) {
		updateLinks(links.filter((_, idx) => idx !== i));
	}

	function updateLink(i: number, field: 'label' | 'url' | 'icon', val: string) {
		const updated = [...links];
		updated[i] = { ...updated[i], [field]: val };
		updateLinks(updated);
	}

	function moveLink(i: number, dir: 'up' | 'down') {
		const j = dir === 'up' ? i - 1 : i + 1;
		if (j < 0 || j >= links.length) return;
		const updated = [...links];
		[updated[i], updated[j]] = [updated[j], updated[i]];
		updateLinks(updated);
	}

	const ICONS = [
		{ value: '', label: 'Auto' },
		{ value: 'instagram', label: 'Instagram' },
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'spotify', label: 'Spotify' },
		{ value: 'soundcloud', label: 'SoundCloud' },
		{ value: 'tiktok', label: 'TikTok' },
		{ value: 'twitter', label: 'Twitter/X' },
		{ value: 'whatsapp', label: 'WhatsApp' },
		{ value: 'apple', label: 'Apple Music' },
		{ value: 'external', label: 'Externo' },
	];
</script>

<div class="editor">
	<h2 class="editor-title">🔗 Links</h2>
	<p class="editor-desc">Enlaces de redes sociales y footer. Se muestran en la navegación, footer y página de beats.</p>

	<Collapsible id="links-social" icon="🔗" title="Enlaces ({links.length})" open={true}>
		
		{#if links.length === 0}
			<p class="empty-msg">No hay enlaces. Añade uno para empezar.</p>
		{/if}

		{#each links as link, i}
			<div class="link-row">
				<div class="link-fields">
					<div class="field">
						<label for="link-label-{i}">Label</label>
						<input id="link-label-{i}" type="text" value={link.label} placeholder="Instagram" oninput={(e) => updateLink(i, 'label', e.currentTarget.value)} />
					</div>
					<div class="field" style="flex:2">
						<label for="link-url-{i}">URL</label>
						<input id="link-url-{i}" type="url" value={link.url} placeholder="https://instagram.com/tuusuario" oninput={(e) => updateLink(i, 'url', e.currentTarget.value)} />
					</div>
					<div class="field">
						<label for="link-icon-{i}">Icono</label>
						<select id="link-icon-{i}" value={link.icon ?? ''} onchange={(e) => updateLink(i, 'icon', e.currentTarget.value)}>
							{#each ICONS as ic}<option value={ic.value}>{ic.label}</option>{/each}
						</select>
					</div>
				</div>
				<div class="link-actions">
					<button class="btn-icon" aria-label="Subir" title="Subir" onclick={() => moveLink(i, 'up')} disabled={i === 0}>↑</button>
					<button class="btn-icon" aria-label="Bajar" title="Bajar" onclick={() => moveLink(i, 'down')} disabled={i === links.length - 1}>↓</button>
					<button class="btn-icon btn-icon-del" aria-label="Eliminar" title="Eliminar" onclick={() => removeLink(i)}>✕</button>
				</div>
			</div>
		{/each}

		<button class="btn-add" onclick={addLink}>+ Añadir enlace</button>
	</Collapsible>

	<Collapsible id="links-store" icon="🏪" title="Vista previa" open={false}>
				<p class="preview-desc">Así se verán en el footer:</p>
		<div class="preview-footer">
			{#each links as link}
				{#if link.label && link.url}
					<span class="preview-link">{link.label}</span>
				{/if}
			{/each}
			{#if links.length === 0 || links.every(l => !l.label)}
				<span class="preview-empty">Sin enlaces</span>
			{/if}
		</div>
	</Collapsible>
</div>

<style>
	.editor { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }
	.editor-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.editor-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; }
	.section-title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--text); margin-bottom: var(--space-4); }
	.empty-msg { font-size: var(--text-sm); color: var(--text-muted); font-style: italic; padding: var(--space-4) 0; }

	.link-row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--surface);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-2);
	}

	.link-fields {
		flex: 1;
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.link-fields .field {
		flex: 1;
		min-width: 100px;
		margin-bottom: 0;
	}

	.link-actions {
		display: flex;
		gap: var(--space-1);
		flex-shrink: 0;
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
	}

	.field input[type="text"],
	.field input[type="url"],
	.field select {
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.field input:focus,
	.field select:focus {
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

	.preview-desc {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-bottom: var(--space-3);
	}

	.preview-footer {
		display: flex;
		gap: var(--space-4);
		flex-wrap: wrap;
		padding: var(--space-3);
		background: var(--surface);
		border-radius: var(--radius-md);
	}

	.preview-link {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
	}

	.preview-empty {
		font-size: var(--text-sm);
		color: var(--text-muted);
		font-style: italic;
	}
</style>
