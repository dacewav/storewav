<script lang="ts">
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores';

	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	type Comment = {
		id: string;
		beatId: string;
		beatName?: string;
		uid: string;
		displayName: string;
		text: string;
		createdAt: number;
	};

	let comments = $state<Comment[]>([]);
	let loading = $state(true);
	let deleting = $state<string | null>(null);

	const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

	async function loadComments() {
		loading = true;
		try {
			// Load all comments from all beats
			const resp = await fetch(`${FIREBASE_DB}/beatComments.json`);
			if (!resp.ok) return;

			const data = await resp.json() as Record<string, Record<string, any>> | null;
			if (!data) { comments = []; return; }

			const all: Comment[] = [];
			for (const [beatId, beatComments] of Object.entries(data)) {
				if (!beatComments) continue;
				for (const [id, c] of Object.entries(beatComments)) {
					all.push({
						id,
						beatId,
						beatName: c.beatName || beatId,
						uid: c.uid || '',
						displayName: c.displayName || 'Anónimo',
						text: c.text || '',
						createdAt: c.createdAt || 0,
					});
				}
			}

			// Sort by newest first
			comments = all.sort((a, b) => b.createdAt - a.createdAt);
		} catch (err) {
			console.error('[Admin Comments] Load failed:', err);
		} finally {
			loading = false;
		}
	}

	async function deleteComment(beatId: string, commentId: string) {
		if (!confirm('¿Eliminar este comentario?')) return;
		deleting = commentId;

		try {
			await fetch(`${FIREBASE_DB}/beatComments/${beatId}/${commentId}.json`, {
				method: 'DELETE',
			});
			comments = comments.filter(c => c.id !== commentId);
		} catch (err) {
			console.error('[Admin Comments] Delete failed:', err);
		} finally {
			deleting = null;
		}
	}

	function timeAgo(ts: number): string {
		const diff = Date.now() - ts;
		const seconds = Math.floor(diff / 1000);
		if (seconds < 60) return 'ahora';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h`;
		const days = Math.floor(hours / 24);
		return `${days}d`;
	}

	onMount(loadComments);
</script>

<svelte:head>
	<title>Comentarios — {brandName} Admin</title>
</svelte:head>

<div class="comments-admin">
	<div class="page-header">
		<h1>💬 Comentarios</h1>
		<p>Moderación de comentarios en beats. {comments.length} comentario{comments.length !== 1 ? 's' : ''} total.</p>
	</div>

	{#if loading}
		<div class="loading">Cargando comentarios...</div>
	{:else if comments.length === 0}
		<div class="empty">
			<div class="empty-icon">💬</div>
			<p>No hay comentarios todavía</p>
		</div>
	{:else}
		<div class="comments-list">
			{#each comments as comment (comment.id)}
				<div class="comment-card" class:deleting={deleting === comment.id}>
					<div class="comment-header">
						<span class="comment-author">{comment.displayName}</span>
						<span class="comment-beat">en {comment.beatName}</span>
						<span class="comment-time">{timeAgo(comment.createdAt)}</span>
					</div>
					<p class="comment-text">{comment.text}</p>
					<div class="comment-footer">
						<span class="comment-uid">UID: {comment.uid.slice(0, 8)}...</span>
						<button
							class="delete-btn"
							onclick={() => deleteComment(comment.beatId, comment.id)}
							disabled={deleting === comment.id}
						>
							{deleting === comment.id ? 'Eliminando...' : '🗑️ Eliminar'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.comments-admin {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-6);
	}

	.page-header {
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-2);
	}

	.page-header p {
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.loading,
	.empty {
		text-align: center;
		padding: var(--space-12);
		color: var(--text-muted);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: var(--space-3);
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.comment-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		transition: opacity var(--duration-fast);
	}

	.comment-card.deleting {
		opacity: 0.4;
	}

	.comment-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
		flex-wrap: wrap;
	}

	.comment-author {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.comment-beat {
		font-size: var(--text-xs);
		color: var(--accent);
		font-family: var(--font-mono);
	}

	.comment-time {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
		margin-left: auto;
	}

	.comment-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0 0 var(--space-2);
	}

	.comment-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.comment-uid {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.delete-btn {
		padding: var(--space-1) var(--space-3);
		background: none;
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: var(--radius-sm);
		color: #ef4444;
		font-size: var(--text-2xs);
		font-family: var(--font-mono);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.delete-btn:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.08);
	}

	.delete-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
