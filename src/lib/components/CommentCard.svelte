<script lang="ts">
	import type { Comment } from '$lib/stores/comments';
	import { auth, deleteComment } from '$lib/stores';

	let {
		comment,
		beatId,
	}: {
		comment: Comment;
		beatId: string;
	} = $props();

	let authState = $derived($auth);
	let isOwner = $derived(authState.user?.uid === comment.uid);
	let isAdmin = $derived(authState.isAdmin);
	let canDelete = $derived(isOwner || isAdmin);
	let deleting = $state(false);

	function timeAgo(ts: number): string {
		const diff = Date.now() - ts;
		const seconds = Math.floor(diff / 1000);
		if (seconds < 60) return 'ahora';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `hace ${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `hace ${hours}h`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `hace ${days}d`;
		return new Date(ts).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
	}

	async function handleDelete() {
		if (!confirm('¿Eliminar este comentario?')) return;
		deleting = true;
		await deleteComment(beatId, comment.id);
		deleting = false;
	}
</script>

<div class="comment-card" class:deleting>
	<div class="comment-avatar">
		{#if comment.photoURL}
			<img src={comment.photoURL} alt="" />
		{:else}
			<div class="avatar-placeholder">
				{(comment.displayName || '?')[0].toUpperCase()}
			</div>
		{/if}
	</div>
	<div class="comment-body">
		<div class="comment-header">
			<span class="comment-author">{comment.displayName}</span>
			<span class="comment-time">{timeAgo(comment.createdAt)}</span>
			{#if comment.editedAt}
				<span class="comment-edited">(editado)</span>
			{/if}
		</div>
		<p class="comment-text">{comment.text}</p>
		{#if canDelete}
			<button class="comment-delete" onclick={handleDelete} disabled={deleting}>
				Eliminar
			</button>
		{/if}
	</div>
</div>

<style>
	.comment-card {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3);
		border-bottom: 1px solid var(--border);
		transition: opacity var(--duration-fast);
	}

	.comment-card.deleting {
		opacity: 0.4;
	}

	.comment-card:last-child {
		border-bottom: none;
	}

	.comment-avatar {
		flex-shrink: 0;
	}

	.comment-avatar img {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: var(--text-xs);
		font-family: var(--font-mono);
	}

	.comment-body {
		flex: 1;
		min-width: 0;
	}

	.comment-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
	}

	.comment-author {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.comment-time {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.comment-edited {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-style: italic;
	}

	.comment-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
		word-break: break-word;
	}

	.comment-delete {
		margin-top: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: none;
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: var(--radius-sm);
		color: #ef4444;
		font-size: var(--text-2xs);
		font-family: var(--font-mono);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.comment-delete:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.08);
	}

	.comment-delete:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
