<script lang="ts">
	import { auth } from '$lib/stores';

	let authState = $derived($auth);
	let user = $derived(authState.user);
</script>

<div class="dashboard">
	<h2>👋 Hola, {user?.displayName?.split(' ')[0] || 'artista'}</h2>
	<p class="dashboard-sub">Desde acá podés gestionar tu cuenta, ver tus compras y favoritos.</p>

	<div class="dashboard-cards">
		<a href="/account/profile" class="dash-card">
			<span class="dash-icon">✏️</span>
			<span class="dash-label">Editar perfil</span>
			<span class="dash-desc">Nombre artístico, redes sociales</span>
		</a>
		<a href="/account/orders" class="dash-card">
			<span class="dash-icon">📦</span>
			<span class="dash-label">Mis órdenes</span>
			<span class="dash-desc">Descargas, contratos, historial</span>
		</a>
		<a href="/account/favorites" class="dash-card">
			<span class="dash-icon">❤️</span>
			<span class="dash-label">Favoritos</span>
			<span class="dash-desc">Beats que te gustaron</span>
		</a>
		<a href="/account/playlists" class="dash-card">
			<span class="dash-icon">🎵</span>
			<span class="dash-label">Playlists</span>
			<span class="dash-desc">Colecciones de beats</span>
		</a>
		<a href="/" class="dash-card">
			<span class="dash-icon">🎵</span>
			<span class="dash-label">Catálogo</span>
			<span class="dash-desc">Explorar beats nuevos</span>
		</a>
	</div>
</div>

<style>
	.dashboard h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-1);
	}

	.dashboard-sub {
		font-size: var(--text-sm);
		color: var(--text-muted);
		margin-bottom: var(--space-6);
	}

	.dashboard-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.dash-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: all var(--duration-fast);
	}

	.dash-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}

	.dash-icon {
		font-size: 1.5rem;
	}

	.dash-label {
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.dash-desc {
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	@media (max-width: 480px) {
		.dashboard-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
