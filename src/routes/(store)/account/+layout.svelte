<script lang="ts">
	import { page } from '$app/state';
	import { auth } from '$lib/stores';
	import Icon from '$lib/components/Icon.svelte';

	let { children } = $props();

	let authState = $derived($auth);
	let user = $derived(authState.user);

	const tabs: Array<{ href: string; label: string; icon: 'export' | 'shoppingCart' | 'heart' | 'music' }> = [
		{ href: '/account/profile', label: 'Perfil', icon: 'export' },
		{ href: '/account/orders', label: 'Órdenes', icon: 'shoppingCart' },
		{ href: '/account/favorites', label: 'Favoritos', icon: 'heart' },
		{ href: '/account/playlists', label: 'Playlists', icon: 'music' },
	];

	let currentPath = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>Mi cuenta — DACEWAV</title>
</svelte:head>

<div class="account-page">
	{#if !user}
		<div class="account-login">
			<div class="login-card">
				<div class="login-icon">🔐</div>
				<h1>Iniciá sesión</h1>
				<p>Necesitás una cuenta para ver tu perfil, órdenes y favoritos.</p>
				<a href="/" class="back-btn">Volver al catálogo</a>
			</div>
		</div>
	{:else}
		<!-- Header -->
		<div class="account-header">
			<div class="account-avatar">
				{#if user.photoURL}
					<img src={user.photoURL} alt="" />
				{:else}
					<div class="avatar-placeholder">
						{(user.displayName || user.email || '?')[0].toUpperCase()}
					</div>
				{/if}
			</div>
			<div class="account-info">
				<h1>{user.displayName || 'Usuario'}</h1>
				<p class="account-email">{user.email}</p>
			</div>
		</div>

		<!-- Tabs -->
		<nav class="account-tabs">
			{#each tabs as tab}
				<a
					href={tab.href}
					class="tab"
					class:active={currentPath === tab.href}
				>
					<Icon name={tab.icon} size={14} />
					{tab.label}
				</a>
			{/each}
		</nav>

		<!-- Content -->
		<div class="account-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.account-page {
		padding: var(--space-6) var(--container-padding) var(--space-16);
		max-width: 720px;
		margin: 0 auto;
	}

	.account-login {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.login-card {
		text-align: center;
		padding: var(--space-8);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
	}

	.login-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}

	.login-card h1 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-2);
	}

	.login-card p {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin-bottom: var(--space-6);
	}

	.back-btn {
		display: inline-block;
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--bg);
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		text-decoration: none;
	}

	/* Header */
	.account-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.account-avatar img {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: var(--text-2xl);
		font-family: var(--font-mono);
	}

	.account-info h1 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
	}

	.account-email {
		font-size: var(--text-sm);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	/* Tabs */
	.account-tabs {
		display: flex;
		gap: var(--space-2);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.tab {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
		text-decoration: none;
		transition: all var(--duration-fast);
	}

	.tab:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.tab.active {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
	}

	.account-content {
		min-height: 40vh;
	}
</style>
