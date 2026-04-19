<script lang="ts">
	import { BeatEditor } from '$lib/components';
	import { createBeat, emptyBeat } from '$lib/stores';
	import { goto } from '$app/navigation';

	let beat = $state(emptyBeat());
	let tempId = $state(`new-${Date.now()}`);
	let saveStatus = $state<'saved' | 'saving' | 'unsaved' | 'error'>('unsaved');

	async function handleSave() {
		if (!beat.title?.trim()) {
			saveStatus = 'error';
			return;
		}

		saveStatus = 'saving';
		try {
			const id = await createBeat(beat as Parameters<typeof createBeat>[0]);
			saveStatus = 'saved';
			if (id) goto(`/admin/beats/${id}`);
		} catch (err) {
			console.error(err);
			saveStatus = 'error';
		}
	}
</script>

<div class="new-beat">
	<div class="header">
		<a href="/admin/beats" class="back-link">← Volver a beats</a>
		<h1 class="title">+ Nuevo beat</h1>
	</div>

	<BeatEditor bind:beat beatId={tempId} onSave={handleSave} {saveStatus} />
</div>

<style>
	.new-beat { max-width: 800px; margin: 0 auto; }

	.header { margin-bottom: var(--space-6); }

	.back-link {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.2s;
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
</style>
