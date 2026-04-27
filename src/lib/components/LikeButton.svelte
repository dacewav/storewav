<script lang="ts">
	import { auth, toggleLike, isLiked, subscribeToLikeCount } from '$lib/stores';
	import { onMount } from 'svelte';

	let {
		beatId,
		showCount = true,
		compact = false,
	}: {
		beatId: string;
		showCount?: boolean;
		compact?: boolean;
	} = $props();

	let authState = $derived($auth);
	let uid = $derived(authState.user?.uid);
	let liked = $derived(isLiked(beatId));
	let isLikedVal = $derived($liked);
	let likeCount = $state(0);
	let animating = $state(false);
	let loading = $state(false);

	async function handleToggle() {
		if (!uid) {
			// Prompt login — could add a toast here
			return;
		}
		if (loading) return;
		loading = true;

		// Optimistic update
		animating = true;
		setTimeout(() => { animating = false; }, 400);

		await toggleLike(beatId, uid);
		loading = false;
	}

	onMount(() => {
		const unsub = subscribeToLikeCount(beatId, (count) => {
			likeCount = count;
		});
		return unsub;
	});
</script>

<button
	class="like-btn"
	class:liked={isLikedVal}
	class:compact
	class:animating
	onclick={handleToggle}
	disabled={!uid}
	title={uid ? (isLikedVal ? 'Quitar de favoritos' : 'Agregar a favoritos') : 'Iniciá sesión para guardar'}
	aria-label={isLikedVal ? 'Quitar like' : 'Dar like'}
>
	<span class="like-icon">
		{isLikedVal ? '❤️' : '🤍'}
	</span>
	{#if showCount && likeCount > 0}
		<span class="like-count">{likeCount}</span>
	{/if}
</button>

<style>
	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		background: none;
		border: none;
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--duration-fast);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.like-btn:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.08);
	}

	.like-btn:disabled {
		cursor: default;
		opacity: 0.6;
	}

	.like-btn.compact {
		padding: 0;
	}

	.like-icon {
		font-size: 14px;
		line-height: 1;
		transition: transform var(--duration-fast);
	}

	.like-btn.animating .like-icon {
		animation: heartBurst 0.4s ease-out;
	}

	.like-count {
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.like-btn.liked .like-count {
		color: #ef4444;
	}

	@keyframes heartBurst {
		0% { transform: scale(1); }
		30% { transform: scale(1.4); }
		60% { transform: scale(0.9); }
		100% { transform: scale(1); }
	}
</style>
