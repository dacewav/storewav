<script lang="ts">
	import { Button } from '$lib/components';
	import { settings } from '$lib/stores';
	import { page } from '$app/state';

	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');
</script>

<svelte:head>
	<title>404 — {brandName}</title>
</svelte:head>

<div class="error-page">
	<div class="error-code">404</div>
	<div class="error-title">Página no encontrada</div>
	<p class="error-sub">
		La ruta <code>{page.url.pathname}</code> no existe.
	</p>
	<Button variant="primary" onclick={() => window.location.href = '/'}>
		Volver al inicio
	</Button>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-height: 70dvh;
		padding: var(--container-padding);
		gap: var(--space-4);
	}

	.error-code {
		font-family: var(--font-display);
		font-size: clamp(4rem, 15vw, 10rem);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--accent);
		text-shadow: var(--glow-md);
		opacity: 0.8;
	}

	.error-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
	}

	.error-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-4);
	}

	.error-sub code {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		background: var(--surface);
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		color: var(--accent);
	}
</style>
