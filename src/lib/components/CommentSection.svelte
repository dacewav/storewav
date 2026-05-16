<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, comments, commentsLoading, postComment, initComments, destroyComments, customEmojis } from '$lib/stores';
	import { renderEmojis, findEmojiQuery, insertEmoji } from '$lib/emojiUtils';
	import CommentCard from './CommentCard.svelte';
	import EmojiPicker from './EmojiPicker.svelte';
	import type { CustomEmoji } from '$lib/stores/customEmojis';

	let { beatId }: { beatId: string } = $props();

	let authState = $derived($auth);
	let user = $derived(authState.user);
	let commentsList = $derived($comments);
	let loading = $derived($commentsLoading);
	let commentText = $state('');
	let posting = $state(false);
	let postError = $state('');
	let charCount = $derived(commentText.length);
	let emojis = $derived($customEmojis);

	// Emoji picker state
	let pickerVisible = $state(false);
	let pickerQuery = $state('');
	let pickerRect = $state({ top: 0, left: 0, bottom: 0 });
	let inputEl: HTMLTextAreaElement | undefined = $state();

	onMount(() => {
		initComments(beatId);
		return () => destroyComments();
	});

	// Re-init comments when beatId changes
	$effect(() => {
		const id = beatId;
		initComments(id);
		return () => destroyComments();
	});

	// Detect :shortcode: typing for autocomplete
	function handleInput() {
		if (!inputEl) return;
		const cursorPos = inputEl.selectionStart ?? 0;
		const query = findEmojiQuery(commentText, cursorPos);
		if (query && query.query.length >= 0) {
			pickerQuery = query.query;
			pickerVisible = true;
			updatePickerRect(query.start);
		} else {
			pickerVisible = false;
		}
	}

	function updatePickerRect(colonIndex: number) {
		if (!inputEl) return;
		// Approximate position from the colon
		const rect = inputEl.getBoundingClientRect();
		// Simple approximation: position picker near cursor
		pickerRect = {
			top: rect.top,
			left: Math.min(rect.left + 40, rect.right - 320),
			bottom: rect.top - 4
		};
	}

	function handleEmojiSelect(emoji: CustomEmoji) {
		if (!inputEl) return;
		const cursorPos = inputEl.selectionStart ?? 0;
		const query = findEmojiQuery(commentText, cursorPos);
		if (query) {
			const result = insertEmoji(commentText, cursorPos, query, emoji.name);
			commentText = result.text;
			// Set cursor position after update
			setTimeout(() => {
				if (inputEl) {
					inputEl.selectionStart = result.cursor;
					inputEl.selectionEnd = result.cursor;
					inputEl.focus();
				}
			}, 0);
		} else {
			// Insert at cursor
			const before = commentText.slice(0, cursorPos);
			const after = commentText.slice(cursorPos);
			commentText = `${before}:${emoji.name}: ${after}`;
			setTimeout(() => inputEl?.focus(), 0);
		}
		pickerVisible = false;
	}

	function openPicker(e: MouseEvent) {
		e.preventDefault();
		if (!inputEl) return;
		pickerQuery = '';
		pickerVisible = !pickerVisible;
		const rect = inputEl.getBoundingClientRect();
		pickerRect = {
			top: rect.top,
			left: Math.min(rect.left, rect.right - 320),
			bottom: rect.top - 4
		};
	}

	async function handleSubmit() {
		if (!user || !commentText.trim()) return;
		posting = true;
		postError = '';

		const result = await postComment(
			beatId,
			user.uid,
			user.displayName || user.email || 'Anónimo',
			user.photoURL,
			commentText
		);

		if (result.ok) {
			commentText = '';
			pickerVisible = false;
		} else {
			postError = result.error || 'Error al publicar';
		}
		posting = false;
	}
</script>

<div class="comments-section">
	<div class="comments-header">
		<h3>💬 Comentarios ({commentsList.length})</h3>
	</div>

	{#if user}
		<form class="comment-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="comment-input-row">
				{#if user.photoURL}
					<img src={user.photoURL} alt="" class="form-avatar" loading="lazy" decoding="async" />
				{:else}
					<div class="form-avatar-placeholder">
						{(user.displayName || '?')[0].toUpperCase()}
					</div>
				{/if}
				<div class="comment-input-wrap">
					<textarea
						class="comment-input"
						placeholder="Escribe un comentario...  :emoji:"
						bind:value={commentText}
						bind:this={inputEl}
						oninput={handleInput}
						onkeydown={(e) => { if (e.key === 'Escape') pickerVisible = false; }}
						maxlength={500}
						rows={2}
						disabled={posting}
					></textarea>
					<button
						class="emoji-trigger"
						type="button"
						onclick={openPicker}
						title="Emojis"
						aria-label="Abrir picker de emojis"
					>😀</button>
				</div>
				<EmojiPicker
					{emojis}
					query={pickerQuery}
					visible={pickerVisible}
					rect={pickerRect}
					onselect={handleEmojiSelect}
					onclose={() => { pickerVisible = false; }}
				/>
			</div>
			<div class="comment-form-footer">
				<span class="char-count" class:warn={charCount > 450}>
					{charCount}/500
				</span>
				{#if postError}
					<span class="post-error">{postError}</span>
				{/if}
				<button
					class="post-btn"
					type="submit"
					disabled={posting || !commentText.trim()}
				>
					{#if posting}
						⏳
					{:else}
						🎤 Enviar
					{/if}
				</button>
			</div>
		</form>
	{:else}
		<div class="login-prompt">
			<p>Inicia sesión para comentar</p>
		</div>
	{/if}

	<div class="comments-list">
		{#if loading}
			<div class="comments-loading">Cargando comentarios...</div>
		{:else if commentsList.length === 0}
			<div class="comments-empty">
				<p>No hay comentarios todavía. Sé el primero 🎤</p>
			</div>
		{:else}
			{#each commentsList as comment (comment.id)}
				<CommentCard {comment} {beatId} />
			{/each}
		{/if}
	</div>
</div>

<style>
	.comments-section {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border);
	}

	.comments-header h3 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	/* Form */
	.comment-form {
		margin-bottom: var(--space-6);
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.comment-input-row {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.form-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.form-avatar-placeholder {
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
		flex-shrink: 0;
	}

	.comment-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		padding-right: 36px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		resize: vertical;
		min-height: 60px;
		outline: none;
		box-sizing: border-box;
	}

	.comment-input:focus {
		border-color: var(--accent);
	}

	.comment-input:disabled {
		opacity: 0.5;
	}

	.comment-input-wrap {
		flex: 1;
		position: relative;
	}

	.emoji-trigger {
		position: absolute;
		bottom: 8px;
		right: 8px;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--duration-fast);
		opacity: 0.6;
	}

	.emoji-trigger:hover {
		opacity: 1;
		background: rgba(var(--accent-rgb), 0.08);
		transform: scale(1.1);
	}

	.comment-form-footer {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-top: var(--space-2);
		padding-left: calc(32px + var(--space-3));
	}

	.char-count {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.char-count.warn {
		color: #f59e0b;
	}

	.post-error {
		flex: 1;
		font-size: var(--text-2xs);
		color: #ef4444;
		font-family: var(--font-mono);
	}

	.post-btn {
		margin-left: auto;
		padding: var(--space-2) var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.post-btn:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.post-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Login prompt */
	.login-prompt {
		padding: var(--space-4);
		text-align: center;
		background: var(--surface);
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-6);
	}

	.login-prompt p {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	/* List */
	.comments-list {
		max-height: 500px;
		overflow-y: auto;
	}

	.comments-loading,
	.comments-empty {
		padding: var(--space-8) var(--space-4);
		text-align: center;
		font-size: var(--text-sm);
		color: var(--text-muted);
	}
</style>
