/**
 * /account/notifications — User notifications page
 */

<script lang="ts">
	import { onMount } from 'svelte';
	import { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, initNotifications, destroyNotifications } from '$lib/stores/notifications';
	import { auth } from '$lib/stores';
	import { goto } from '$app/navigation';

	let loading = $state(true);

	onMount(() => {
		const unsub = auth.subscribe((state) => {
			if (state.loading) return;
			if (!state.user) {
				goto('/login?redirect=/account/notifications');
				return;
			}
			initNotifications(state.user.uid).finally(() => (loading = false));
		});

		return () => {
			unsub();
			destroyNotifications();
		};
	});

	function timeAgo(ts: number): string {
		const diff = Date.now() - ts;
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'ahora';
		if (mins < 60) return `hace ${mins}m`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `hace ${hours}h`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `hace ${days}d`;
		return new Date(ts).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
	}

	function typeIcon(type: string): string {
		switch (type) {
			case 'wishlist_discount': return '🔥';
			case 'new_beat': return '🎵';
			case 'price_change': return '💰';
			case 'system': return '⚙️';
			default: return '🔔';
		}
	}

	async function handleClick(n: { id: string; beatId?: string; read: boolean }) {
		if (!n.read) await markAsRead(n.id);
		if (n.beatId) goto(`/beat/${n.beatId}`);
	}
</script>

<svelte:head>
	<title>Notificaciones — DACEWAV</title>
</svelte:head>

<div class="notif-page">
	<header class="notif-header">
		<div class="notif-title-row">
			<h1>🔔 Notificaciones</h1>
			{#if $unreadCount > 0}
				<span class="badge">{$unreadCount}</span>
			{/if}
		</div>
		{#if $unreadCount > 0}
			<button class="mark-all-btn" onclick={markAllAsRead}>
				Marcar todas como leídas
			</button>
		{/if}
	</header>

	{#if loading}
		<div class="notif-loading">
			<div class="spinner"></div>
			<span>Cargando notificaciones...</span>
		</div>
	{:else if $notifications.length === 0}
		<div class="notif-empty">
			<span class="empty-icon">🔕</span>
			<p>No tenés notificaciones</p>
			<p class="empty-hint">Cuando un beat de tu wishlist tenga descuento, vas a verlo acá.</p>
		</div>
	{:else}
		<div class="notif-list">
			{#each $notifications as n (n.id)}
				<div
					class="notif-item"
					class:unread={!n.read}
					onclick={() => handleClick(n)}
					onkeydown={(e) => e.key === 'Enter' && handleClick(n)}
					role="button"
					tabindex="0"
				>
					<span class="notif-icon">{typeIcon(n.type)}</span>
					<div class="notif-body">
						<div class="notif-item-title">{n.title}</div>
						<div class="notif-msg">{n.message}</div>
						<div class="notif-time">{timeAgo(n.createdAt)}</div>
					</div>
					<div class="notif-actions">
						{#if !n.read}
							<span class="unread-dot"></span>
						{/if}
						<button
							class="delete-btn"
							onclick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
							title="Eliminar"
							aria-label="Eliminar notificación"
						>✕</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.notif-page {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
	}

	.notif-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.notif-title-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.notif-title-row h1 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin: 0;
	}

	.badge {
		background: var(--accent);
		color: #fff;
		font-size: var(--text-xs);
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 99px;
		min-width: 20px;
		text-align: center;
	}

	.mark-all-btn {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
		background: none;
		border: 1px solid var(--accent);
		border-radius: var(--radius-md);
		padding: var(--space-1) var(--space-3);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.mark-all-btn:hover {
		background: var(--accent);
		color: #fff;
	}

	/* Loading */
	.notif-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-10);
		color: var(--text-secondary);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Empty */
	.notif-empty {
		text-align: center;
		padding: var(--space-10) var(--space-4);
		color: var(--text-secondary);
	}

	.empty-icon {
		font-size: 48px;
		display: block;
		margin-bottom: var(--space-4);
	}

	.notif-empty p {
		margin: var(--space-2) 0;
	}

	.empty-hint {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	/* List */
	.notif-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.notif-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--surface);
		cursor: pointer;
		transition: background var(--duration-fast);
	}

	.notif-item:hover {
		background: var(--surface-hover);
	}

	.notif-item.unread {
		background: rgba(var(--accent-rgb), 0.04);
	}

	.notif-icon {
		font-size: 20px;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.notif-body {
		flex: 1;
		min-width: 0;
	}

	.notif-item-title {
		font-weight: 600;
		font-size: var(--text-sm);
		margin-bottom: 2px;
	}

	.notif-msg {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.notif-time {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		margin-top: var(--space-1);
	}

	.notif-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.unread-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
	}

	.delete-btn {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		opacity: 0;
		transition: all var(--duration-fast);
	}

	.notif-item:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: var(--danger-glow);
		color: var(--danger);
	}
</style>
