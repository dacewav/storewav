<script lang="ts">
	import { Button } from '$lib/components';
	import { settings } from '$lib/stores';
	import { page } from '$app/state';
	import type { LabelSettings } from '$lib/stores/settings';

	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');
	let labels = $derived(($settings.data?.labels ?? {}) as LabelSettings);
	let errorBtn = $derived(labels.errorBtn ?? 'Volver al inicio');

	// Dynamic error info based on status code
	let status = $derived(page.status ?? 500);
	let is404 = $derived(status === 404);
	let errorTitle = $derived(
		is404
			? (labels.errorTitle ?? 'Página no encontrada')
			: status >= 500
				? 'Error del servidor'
					: 'Algo salió mal'
	);
	let errorMessage = $derived(
		is404
			? `La ruta <code>${page.url.pathname}</code> no existe.`
			: status >= 500
				? 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
					: 'Ocurrió un error inesperado. Intenta de nuevo.'
	);
</script>

<svelte:head>
	<title>{status} — {brandName}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="error-page">
	<div class="error-code">{status}</div>
	<div class="error-title">{errorTitle}</div>
	<p class="error-sub">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html errorMessage}
	</p>
	<div class="error-actions">
		<Button variant="primary" onclick={() => window.location.href = '/'}>
			{errorBtn}
		</Button>
		<Button variant="ghost" onclick={() => window.location.reload()}>
			Recargar
		</Button>
	</div>
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

	.error-actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
