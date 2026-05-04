<script lang="ts">
	import { onMount } from 'svelte';
	import { EmptyState } from '$lib/components';
	import { FIREBASE_DB } from '$lib/firebaseDb';

	type UserProfile = {
		uid: string;
		displayName?: string;
		email?: string;
		artistName?: string;
		username?: string;
		bio?: string;
		avatarURL?: string;
		bannerURL?: string;
		country?: string;
		badges?: string[];
		banned?: boolean;
		createdAt?: number;
		updatedAt?: number;
		totalPurchases?: number;
	};

	const ALL_BADGES = [
		{ id: 'first-beat', emoji: '🎵', label: 'Primer Beat' },
		{ id: 'fan', emoji: '❤️', label: 'Fan' },
		{ id: 'super-fan', emoji: '🔥', label: 'Super Fan' },
		{ id: 'vocal', emoji: '💬', label: 'Vocal' },
		{ id: 'early-bird', emoji: '⭐', label: 'Early Bird' },
		{ id: 'vip', emoji: '👑', label: 'VIP' },
	];

	let users = $state<UserProfile[]>([]);
	let loading = $state(true);
	let search = $state('');
	let sortBy = $state<'recent' | 'name' | 'purchases'>('recent');
	let expandedUid = $state<string | null>(null);

	// Badge editing state
	let editingBadges = $state<string | null>(null);
	let badgeDraft = $state<string[]>([]);

	/** Get auth token for API calls */
	async function getAuthToken(): Promise<string | null> {
		try {
			const { getAuthInstance } = await import('$lib/firebase');
			const auth = await getAuthInstance();
			return await auth?.currentUser?.getIdToken() ?? null;
		} catch {
			return null;
		}
	}

	let filteredUsers = $derived.by(() => {
		let list = [...users];

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			list = list.filter(u =>
				(u.displayName || '').toLowerCase().includes(q) ||
				(u.email || '').toLowerCase().includes(q) ||
				(u.username || '').toLowerCase().includes(q) ||
				(u.artistName || '').toLowerCase().includes(q)
			);
		}

		switch (sortBy) {
			case 'recent':
				list.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
				break;
			case 'name':
				list.sort((a, b) => (a.displayName || a.email || '').localeCompare(b.displayName || b.email || ''));
				break;
			case 'purchases':
				list.sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0));
				break;
		}

		return list;
	});

	let stats = $derived.by(() => {
		const total = users.length;
		const banned = users.filter(u => u.banned).length;
		const withUsername = users.filter(u => u.username).length;
		const withBadges = users.filter(u => u.badges && u.badges.length > 0).length;
		return { total, banned, withUsername, withBadges };
	});

	function toggleExpand(uid: string) {
		expandedUid = expandedUid === uid ? null : uid;
	}

	function formatDate(ts: number): string {
		if (!ts) return '—';
		return new Date(ts).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });
	}

	async function loadUsers() {
		loading = true;
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const resp = await fetch(`${FIREBASE_DB}/users.json${authParam}`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					users = Object.entries(data).map(([uid, val]: [string, any]) => ({
						uid,
						...val,
					}));
				} else {
					users = [];
				}
			}
		} catch (err) {
			console.error('[Admin Users] Failed to load:', err);
		} finally {
			loading = false;
		}
	}

	function startBadgeEdit(user: UserProfile) {
		editingBadges = user.uid;
		badgeDraft = [...(user.badges || [])];
	}

	function toggleBadge(badgeId: string) {
		if (badgeDraft.includes(badgeId)) {
			badgeDraft = badgeDraft.filter(b => b !== badgeId);
		} else {
			badgeDraft = [...badgeDraft, badgeId];
		}
	}

	async function saveBadges(uid: string) {
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			await fetch(`${FIREBASE_DB}/users/${uid}/badges.json${authParam}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(badgeDraft),
			});
			const idx = users.findIndex(u => u.uid === uid);
			if (idx >= 0) users[idx].badges = [...badgeDraft];
			editingBadges = null;
		} catch (err) {
			console.error('[Admin Users] Failed to save badges:', err);
		}
	}

	async function toggleBan(user: UserProfile) {
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const newBanned = !user.banned;
			await fetch(`${FIREBASE_DB}/users/${user.uid}/banned.json${authParam}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newBanned),
			});
			const idx = users.findIndex(u => u.uid === user.uid);
			if (idx >= 0) users[idx].banned = newBanned;
		} catch (err) {
			console.error('[Admin Users] Failed to toggle ban:', err);
		}
	}

	onMount(loadUsers);
</script>

<svelte:head><title>Usuarios — Admin</title></svelte:head>

<div class="users-page">
	<div class="page-header">
		<div>
			<h1 class="page-title">👤 Usuarios</h1>
			<p class="page-sub">Gestiona perfiles, badges y bans.</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="stats-row">
		<div class="stat-card">
			<div class="stat-val">{stats.total}</div>
			<div class="stat-lbl">Usuarios</div>
		</div>
		<div class="stat-card">
			<div class="stat-val">{stats.withUsername}</div>
			<div class="stat-lbl">Con perfil</div>
		</div>
		<div class="stat-card">
			<div class="stat-val">{stats.withBadges}</div>
			<div class="stat-lbl">Con badges</div>
		</div>
		<div class="stat-card">
			<div class="stat-val" class:warn={stats.banned > 0}>{stats.banned}</div>
			<div class="stat-lbl">Baneados</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters-bar">
		<div class="search-wrap">
			<span class="search-icon">🔍</span>
			<input type="text" class="search-input" bind:value={search} placeholder="Buscar por nombre, email o username..." />
			{#if search}
				<button class="search-clear" aria-label="Limpiar" onclick={() => search = ''}>✕</button>
			{/if}
		</div>
		<select class="filter-select" bind:value={sortBy}>
			<option value="recent">Más recientes</option>
			<option value="name">Nombre A-Z</option>
			<option value="purchases">Más compras</option>
		</select>
		<span class="filter-count">{filteredUsers.length} usuarios</span>
	</div>

	{#if loading}
		<div class="loading-msg">Cargando usuarios...</div>
	{:else if filteredUsers.length === 0}
		<EmptyState icon="👤" title="Sin usuarios" subtitle={search ? 'No hay resultados para esta búsqueda' : 'Aún no hay usuarios registrados'} />
	{:else}
		<div class="user-list">
			{#each filteredUsers as user (user.uid)}
				<div class="user-card" class:expanded={expandedUid === user.uid} class:banned={user.banned}>
					<button class="user-row" onclick={() => toggleExpand(user.uid)}>
						<div class="user-avatar">
							{#if user.avatarURL}
								<img src={user.avatarURL} alt="" loading="lazy" decoding="async" />
							{:else}
								<span class="avatar-letter">{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
							{/if}
						</div>
						<div class="user-info">
							<div class="user-name">
								{user.displayName || user.artistName || '(Sin nombre)'}
								{#if user.banned}
									<span class="ban-badge">🚫 Baneado</span>
								{/if}
							</div>
							<div class="user-meta">
								{#if user.username}
									<span class="meta-handle">@{user.username}</span>
								{/if}
								<span class="meta-email">{user.email}</span>
							</div>
						</div>
						<div class="user-stats">
							{#if user.badges?.length}
								<span class="badge-count">{user.badges.length} 🏷️</span>
							{/if}
							{#if user.country}
								<span class="user-country">📍 {user.country}</span>
							{/if}
							<span class="user-date">{formatDate(user.createdAt || user.updatedAt || 0)}</span>
						</div>
						<span class="expand-icon" class:rotated={expandedUid === user.uid}>▼</span>
					</button>

					{#if expandedUid === user.uid}
						<div class="user-detail">
							<!-- Profile preview -->
							<div class="detail-section">
								<h3>Perfil</h3>
								<div class="detail-grid">
									{#if user.artistName}
										<div class="detail-item">
											<span class="dl">Artista</span>
											<span class="dv">{user.artistName}</span>
										</div>
									{/if}
									{#if user.username}
										<div class="detail-item">
											<span class="dl">Username</span>
											<span class="dv">@{user.username}</span>
										</div>
									{/if}
									{#if user.bio}
										<div class="detail-item">
											<span class="dl">Bio</span>
											<span class="dv">{user.bio}</span>
										</div>
									{/if}
									{#if user.country}
										<div class="detail-item">
											<span class="dl">País</span>
											<span class="dv">{user.country}</span>
										</div>
									{/if}
									<div class="detail-item">
										<span class="dl">UID</span>
										<span class="dv mono">{user.uid}</span>
									</div>
									<div class="detail-item">
										<span class="dl">Email</span>
										<span class="dv">{user.email}</span>
									</div>
								</div>
								{#if user.username}
									<a href="/u/{user.username}" target="_blank" rel="noopener" class="profile-link">Ver perfil público →</a>
								{/if}
							</div>

							<!-- Badges -->
							<div class="detail-section">
								<h3>Badges</h3>
								{#if editingBadges === user.uid}
									<div class="badge-editor">
										{#each ALL_BADGES as badge}
											<button
												class="badge-toggle"
												class:active={badgeDraft.includes(badge.id)}
												onclick={() => toggleBadge(badge.id)}
											>
												{badge.emoji} {badge.label}
											</button>
										{/each}
										<div class="badge-actions">
											<button class="btn-save" onclick={() => saveBadges(user.uid)}>Guardar</button>
											<button class="btn-cancel" onclick={() => editingBadges = null}>Cancelar</button>
										</div>
									</div>
								{:else}
									<div class="badge-display">
										{#if user.badges?.length}
											{#each ALL_BADGES.filter(b => user.badges?.includes(b.id)) as badge}
												<span class="badge-pill">{badge.emoji} {badge.label}</span>
											{/each}
										{:else}
											<span class="no-badges">Sin badges</span>
										{/if}
										<button class="btn-edit" onclick={() => startBadgeEdit(user)}>Editar</button>
									</div>
								{/if}
							</div>

							<!-- Actions -->
							<div class="detail-actions">
								<button
									class="btn-ban"
									class:banned={user.banned}
									onclick={() => toggleBan(user)}
								>
									{user.banned ? '✅ Desbanear' : '🚫 Banear'}
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.users-page { max-width: 900px; margin: 0 auto; }

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
	}

	.page-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	/* Stats */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.stat-card {
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		text-align: center;
	}

	.stat-val {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--text);
	}

	.stat-val.warn { color: #ef4444; }

	.stat-lbl {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-top: var(--space-1);
	}

	/* Filters */
	.filters-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		flex-wrap: wrap;
	}

	.search-wrap {
		flex: 1;
		min-width: 200px;
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--text-sm);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-2) var(--space-3) var(--space-2) 36px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	.search-input:focus { border-color: rgba(var(--accent-rgb), 0.5); }

	.search-clear {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: 4px;
	}

	.filter-select {
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
	}

	.filter-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.loading-msg {
		text-align: center;
		padding: var(--space-10);
		color: var(--text-muted);
	}

	/* User list */
	.user-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--border);
	}

	.user-card { background: var(--surface); }
	.user-card.banned { opacity: 0.7; }

	.user-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-4);
		width: 100%;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background var(--duration-fast);
		text-align: left;
		color: var(--text);
		font: inherit;
	}

	.user-row:hover { background: var(--surface-hover); }

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.user-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-letter {
		color: var(--accent);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--text-lg);
	}

	.user-info { flex: 1; min-width: 0; }

	.user-name {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.ban-badge {
		font-size: var(--text-2xs);
		padding: 1px 6px;
		border-radius: var(--radius-full);
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.user-meta {
		display: flex;
		gap: var(--space-3);
		margin-top: 2px;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
	}

	.meta-handle { color: var(--accent); }

	.user-stats {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.badge-count { color: var(--accent); }

	.expand-icon {
		font-size: 10px;
		color: var(--text-muted);
		transition: transform var(--duration-fast);
		flex-shrink: 0;
	}

	.expand-icon.rotated { transform: rotate(180deg); }

	/* Detail */
	.user-detail {
		padding: var(--space-4);
		border-top: 1px solid var(--border);
		background: rgba(var(--accent-rgb), 0.02);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.detail-section h3 {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: var(--space-2);
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.dl {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.dv {
		font-size: var(--text-sm);
		color: var(--text);
	}

	.dv.mono {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		word-break: break-all;
	}

	.profile-link {
		display: inline-block;
		margin-top: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
		text-decoration: none;
	}

	.profile-link:hover { text-decoration: underline; }

	/* Badges */
	.badge-display {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.badge-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.08);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
	}

	.no-badges {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.btn-edit {
		padding: var(--space-1) var(--space-3);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-edit:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.badge-editor {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		align-items: center;
	}

	.badge-toggle {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: var(--surface);
		border: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.badge-toggle.active {
		background: rgba(var(--accent-rgb), 0.15);
		border-color: var(--accent);
		color: var(--accent);
	}

	.badge-toggle:hover {
		border-color: rgba(var(--accent-rgb), 0.5);
	}

	.badge-actions {
		display: flex;
		gap: var(--space-2);
		width: 100%;
		margin-top: var(--space-2);
	}

	.btn-save, .btn-cancel {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: all var(--duration-fast);
	}

	.btn-save {
		background: var(--accent);
		color: var(--bg);
	}

	.btn-save:hover { filter: brightness(1.1); }

	.btn-cancel {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-secondary);
	}

	.btn-cancel:hover { border-color: var(--text-muted); }

	/* Actions */
	.detail-actions {
		display: flex;
		gap: var(--space-3);
		padding-top: var(--space-2);
		border-top: 1px solid var(--border);
	}

	.btn-ban {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		border: 1px solid rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.05);
		color: #ef4444;
		transition: all var(--duration-fast);
	}

	.btn-ban:hover {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.5);
	}

	.btn-ban.banned {
		border-color: rgba(34, 197, 94, 0.3);
		background: rgba(34, 197, 94, 0.05);
		color: #22c55e;
	}

	.btn-ban.banned:hover {
		background: rgba(34, 197, 94, 0.1);
		border-color: rgba(34, 197, 94, 0.5);
	}

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: 1fr 1fr; }
		.user-stats { display: none; }
		.detail-grid { grid-template-columns: 1fr; }
	}
</style>
