<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error — Admin</title>
</svelte:head>

<div class="error-page">
	<div class="error-icon">⚠️</div>
	<div class="error-code">{page.status ?? 500}</div>
	<div class="error-title">
		{page.status === 404 ? 'Página no encontrada' : 'Error del servidor'}
	</div>
	<p class="error-sub">
		{#if page.status === 404}
			La ruta <code>{page.url.pathname}</code> no existe en el admin.
		{:else}
			Ocurrió un error inesperado en el panel de administración.
		{/if}
	</p>
	<div class="error-actions">
		<a href="/admin" class="btn-primary">← Volver al Dashboard</a>
		<button class="btn-ghost" onclick={() => window.location.reload()}>Recargar</button>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-height: 60dvh;
		padding: var(--space-6);
		gap: var(--space-3);
	}

	.error-icon { font-size: 3rem; }

	.error-code {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: 900;
		color: var(--accent);
		line-height: 1;
	}

	.error-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
	}

	.error-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		max-width: 400px;
	}

	.error-sub code {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		background: var(--surface);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		color: var(--accent);
	}

	.error-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}

	.btn-primary {
		padding: var(--space-2) var(--space-5);
		min-height: var(--touch-min);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		transition: opacity var(--duration-fast);
	}

	.btn-primary:hover { opacity: 0.9; }

	.btn-ghost {
		padding: var(--space-2) var(--space-5);
		min-height: var(--touch-min);
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-ghost:hover { background: var(--surface-hover); color: var(--text); }
</style>
