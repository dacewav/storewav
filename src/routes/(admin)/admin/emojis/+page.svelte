<script lang="ts">
	import { onMount } from 'svelte';
	import { customEmojis, initCustomEmojis, destroyCustomEmojis } from '$lib/stores';
	import { Card } from '$lib/components';
	import { toast } from '$lib/toastStore';

	let emojis = $derived($customEmojis);
	let newName = $state('');
	let newUrl = $state('');

	onMount(() => {
		initCustomEmojis();
		return destroyCustomEmojis;
	});

	async function handleAdd() {
		if (!newName.trim() || !newUrl.trim()) {
			toast.error('Nombre y URL son requeridos');
			return;
		}
		await customEmojis.addEmoji(newName, newUrl);
		newName = '';
		newUrl = '';
	}

	function confirmDelete(id: string, name: string) {
		if (confirm(`¿Eliminar emoji :${name}:?`)) {
			customEmojis.deleteEmoji(id);
		}
	}

	function copyShortcode(name: string) {
		navigator.clipboard.writeText(`:${name}:`);
		toast.success(`:${name}: copiado`);
	}
</script>

<svelte:head>
	<title>Emojis — Admin</title>
</svelte:head>

<div class="emojis-page">
	<div class="page-header">
		<div>
			<h2 class="page-title">😀 Custom Emojis</h2>
			<p class="page-desc">Emojis personalizados para usar en contenido · {emojis.length} emojis</p>
		</div>
	</div>

	<!-- Add form -->
	<Card>
		<div class="add-form">
			<div class="field">
				<label for="emoji-name">Nombre (shortcode)</label>
				<input id="emoji-name" type="text" bind:value={newName} placeholder="ej: fire, star, wave" />
			</div>
			<div class="field">
				<label for="emoji-url">URL de imagen</label>
				<input id="emoji-url" type="url" bind:value={newUrl} placeholder="https://..." />
			</div>
			<button class="btn-add" onclick={handleAdd} disabled={!newName.trim() || !newUrl.trim()}>
				➕ Agregar
			</button>
		</div>
	</Card>

	<!-- Preview of new emoji -->
	{#if newName && newUrl}
		<Card>
			<div class="preview-row">
				<span class="preview-label">Preview:</span>
				<img src={newUrl} alt={newName} class="preview-img" onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'} />
				<span class="preview-code">:{newName}:</span>
			</div>
		</Card>
	{/if}

	<!-- Emoji grid -->
	{#if emojis.length === 0}
		<div class="empty-state">
			<span class="empty-icon">😀</span>
			<span class="empty-text">No hay emojis custom — agregá el primero</span>
		</div>
	{:else}
		<div class="emoji-grid">
			{#each emojis as emoji (emoji.id)}
				<div class="emoji-card">
					<div class="ec-preview">
						<img src={emoji.url} alt={emoji.name} loading="lazy" />
					</div>
					<div class="ec-info">
						<span class="ec-name">:{emoji.name}:</span>
					</div>
					<div class="ec-actions">
						<button class="ec-btn" onclick={() => copyShortcode(emoji.name)} title="Copiar shortcode">📋</button>
						<button class="ec-btn danger" onclick={() => confirmDelete(emoji.id, emoji.name)} title="Eliminar">🗑</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.emojis-page { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }

	.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
	.page-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
	.page-desc { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1); }

	.add-form { display: flex; gap: var(--space-3); align-items: flex-end; flex-wrap: wrap; padding: var(--space-4); }
	.field { display: flex; flex-direction: column; gap: var(--space-1); flex: 1; min-width: 150px; }
	.field label { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
	.field input { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg); color: var(--text); font-size: var(--text-sm); outline: none; }
	.field input:focus { border-color: var(--accent); }

	.btn-add {
		padding: var(--space-2) var(--space-4); min-height: var(--touch-min);
		background: var(--accent); color: #fff; border: none;
		border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600;
		cursor: pointer; transition: opacity var(--duration-fast); white-space: nowrap;
	}
	.btn-add:hover { opacity: 0.9; }
	.btn-add:disabled { opacity: 0.4; cursor: not-allowed; }

	.preview-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); }
	.preview-label { font-size: var(--text-sm); color: var(--text-muted); }
	.preview-img { width: 32px; height: 32px; border-radius: var(--radius-sm); object-fit: cover; }
	.preview-code { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--accent); }

	.empty-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-8); color: var(--text-muted); font-size: var(--text-sm); }
	.empty-icon { font-size: 2rem; }

	.emoji-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-3); }
	.emoji-card { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); overflow: hidden; transition: border-color var(--duration-fast); }
	.emoji-card:hover { border-color: rgba(var(--accent-rgb), 0.3); }

	.ec-preview { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: var(--surface-hover); overflow: hidden; }
	.ec-preview img { max-width: 80%; max-height: 80%; object-fit: contain; }
	.ec-info { padding: var(--space-2) var(--space-3); }
	.ec-name { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); }
	.ec-actions { display: flex; gap: 1px; border-top: 1px solid var(--border); }
	.ec-btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-2); border: none; background: transparent; cursor: pointer; font-size: 13px; transition: background var(--duration-fast); }
	.ec-btn:hover { background: var(--surface-hover); }
	.ec-btn.danger:hover { background: rgba(239, 68, 68, 0.08); }

	@media (max-width: 768px) {
		.add-form { flex-direction: column; align-items: stretch; }
		.emoji-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
	}
</style>
