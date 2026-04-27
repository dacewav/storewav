<script lang="ts">
	import { auth, loginWithGoogle, logout } from '$lib/stores';
	import Icon from './Icon.svelte';

	let { compact = false }: { compact?: boolean } = $props();

	let authState = $derived($auth);
	let user = $derived(authState.user);
	let showMenu = $state(false);

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}

	async function handleLogin() {
		closeMenu();
		await loginWithGoogle();
	}

	async function handleLogout() {
		closeMenu();
		await logout();
	}

	function handleClickOutside(e: MouseEvent) {
		if (showMenu && !(e.target as HTMLElement).closest('.auth-wrapper')) {
			closeMenu();
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="auth-wrapper">
	{#if user}
		<button class="auth-btn logged-in" onclick={toggleMenu} title={user.displayName || user.email || 'Cuenta'}>
			{#if user.photoURL}
				<img src={user.photoURL} alt="" class="auth-avatar" />
			{:else}
				<div class="auth-avatar-placeholder">
					{(user.displayName || user.email || '?')[0].toUpperCase()}
				</div>
			{/if}
			{#if !compact}
				<span class="auth-name">{user.displayName?.split(' ')[0] || 'Cuenta'}</span>
			{/if}
		</button>

		{#if showMenu}
			<div class="auth-dropdown">
				<div class="dropdown-header">
					<span class="dropdown-name">{user.displayName || 'Usuario'}</span>
					<span class="dropdown-email">{user.email}</span>
				</div>
				<div class="dropdown-divider"></div>
				<a href="/account" class="dropdown-item" onclick={closeMenu}>
					<Icon name="export" size={14} />
					Mi cuenta
				</a>
				<a href="/account/orders" class="dropdown-item" onclick={closeMenu}>
					<Icon name="shoppingCart" size={14} />
					Mis órdenes
				</a>
				<div class="dropdown-divider"></div>
				<button class="dropdown-item danger" onclick={handleLogout}>
					<Icon name="close" size={14} />
					Cerrar sesión
				</button>
			</div>
		{/if}
	{:else}
		<button class="auth-btn" onclick={handleLogin} title="Iniciar sesión">
			<Icon name="export" size={14} />
			{#if !compact}
				<span class="auth-label">Ingresar</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	.auth-wrapper {
		position: relative;
	}

	.auth-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1);
		background: none;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--duration-fast);
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.auth-btn:hover {
		border-color: var(--accent);
		color: var(--text);
	}

	.auth-btn.logged-in {
		border: none;
		padding: 0;
	}

	.auth-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}

	.auth-avatar-placeholder {
		width: 28px;
		height: 28px;
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

	.auth-name {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		max-width: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.auth-label {
		font-size: var(--text-xs);
	}

	/* Dropdown */
	.auth-dropdown {
		position: absolute;
		top: calc(100% + var(--space-2));
		right: 0;
		min-width: 200px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		z-index: 100;
		overflow: hidden;
	}

	.dropdown-header {
		padding: var(--space-3) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.dropdown-name {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.dropdown-email {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.dropdown-divider {
		height: 1px;
		background: var(--border);
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
		font-family: var(--font-body);
		transition: background var(--duration-fast);
	}

	.dropdown-item:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.dropdown-item.danger:hover {
		color: #ef4444;
	}
</style>
