<script lang="ts">
	import { page } from '$app/state';
	import { BeatEditor, Spinner, EmptyState } from '$lib/components';
	import { beats, updateBeat, deleteBeat } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/toastStore';
	import type { Beat } from '$lib/stores/beats';

	let beatId = $derived(page.params.id ?? '');
	let beatsData = $derived($beats.data);

	let beat = $derived.by(() => {
		if (!beatsData || !beatId) return null;
		const data = beatsData[beatId];
		return data ? { ...data } : null;
	});

	let saveStatus = $state<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

	async function handleSave() {
		if (!beat || !beat.name?.trim()) {
			saveStatus = 'error';
			toast.error('El nombre es obligatorio');
			return;
		}

		if (saveStatus === 'saving') return; // Prevent double-save
		saveStatus = 'saving';
		try {
			await updateBeat(beatId, beat);
			saveStatus = 'saved';
			toast.success('Beat guardado');
		} catch (err) {
			console.error(err);
			saveStatus = 'error';
			toast.error('Error al guardar');
		}
	}

	async function handleDelete() {
		try {
			await deleteBeat(beatId);
			toast.success('Beat eliminado');
			goto('/admin/beats');
		} catch (err) {
			console.error(err);
			toast.error('Error al eliminar');
		}
	}

	function markDirty() {
		if (saveStatus === 'saved') saveStatus = 'unsaved';
	}
</script>

<div class="edit-beat">
	<div class="header">
		<a href="/admin/beats" class="back-link">← Volver a beats</a>
		<h1 class="title">✏️ Editar beat</h1>
	</div>

	{#if $beats.loading}
		<div class="center">
			<Spinner />
			<span class="loading-text">Cargando beat...</span>
		</div>
	{:else if beat}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onchange={markDirty} oninput={markDirty}>
			<BeatEditor bind:beat beatId={beatId} onSave={handleSave} onDelete={handleDelete} bind:saveStatus />
		</div>
	{:else}
		<EmptyState icon="❌" title="Beat no encontrado" subtitle="El beat que buscas no existe o fue eliminado">
			{#snippet action()}
				<a href="/admin/beats" class="back-btn">Volver a beats</a>
			{/snippet}
		</EmptyState>
	{/if}
</div>

<style>
	.edit-beat { max-width: 800px; margin: 0 auto; }

	.header { margin-bottom: var(--space-6); }

	.back-link {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--duration-fast);
		display: inline-block;
		margin-bottom: var(--space-2);
	}

	.back-link:hover { color: var(--accent); }

	.title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.center {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-12);
	}

	.loading-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		min-height: var(--touch-min);
		border: 1px solid rgba(var(--accent-rgb), 0.5);
		border-radius: var(--radius-md);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		font-size: var(--text-sm);
		text-decoration: none;
	}
</style>
