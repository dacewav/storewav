<svelte:head>
	<title>Admin — DACEWAV</title>
</svelte:head>

<section class="admin-placeholder">
	<div class="admin-icon">🔧</div>
	<h1>Admin Panel</h1>
	<p>Bloque 6 — en construcción</p>
	<a href="/" class="back-link">← Volver a la tienda</a>
</section>

<style>
	.admin-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
		gap: var(--space-4);
		padding: var(--container-padding);
	}

	.admin-icon {
		font-size: 3rem;
	}

	h1 {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 800;
		color: var(--text);
	}

	p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	.back-link {
		font-size: var(--text-sm);
		color: var(--accent);
		margin-top: var(--space-4);
	}

	.back-link:hover {
		color: var(--accent-dim);
	}
</style>
