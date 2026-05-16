<script lang="ts">
	import { isFirebaseBlocked } from '$lib/stores/_firebaseStore';
	import { settings } from '$lib/stores/settings';
	import Icon from './Icon.svelte';

	let blocked = $state(false);
	let dismissed = $state(false);
	let showBanner = $state(false);
	let hasCachedData = $state(false);

	// Check if Firebase is blocked after a short delay (let Firebase try first)
	$effect(() => {
		const timer = setTimeout(async () => {
			blocked = await isFirebaseBlocked();
			if (blocked) {
				// Check if we have cached data (site still looks good)
				const unsub = settings.subscribe((s) => {
					hasCachedData = s.stale === true;
				});
				unsub();
				showBanner = true;
			}
		}, 3000); // Wait 3s for Firebase to attempt connection

		return () => clearTimeout(timer);
	});

	function dismiss() {
		dismissed = true;
		showBanner = false;
		// Remember dismissal for this session
		try { sessionStorage.setItem('oc_adblock_dismissed', '1'); } catch {}
	}

	// Check if already dismissed this session
	$effect(() => {
		try {
			if (sessionStorage.getItem('oc_adblock_dismissed') === '1') {
				dismissed = true;
				showBanner = false;
			}
		} catch {}
	});
</script>

{#if showBanner && !dismissed && blocked}
	<div class="adblock-banner" role="alert">
		<span class="adblock-icon">🛡️</span>
		<div class="adblock-content">
			<span class="adblock-text">
				{#if hasCachedData}
					Datos cargados desde caché. Desactiva tu ad blocker para ver la versión más reciente.
				{:else}
					Parece que un ad blocker está bloqueando la conexión con la tienda.
					Desactívalo en este sitio para ver todos los beats y funciones.
				{/if}
			</span>
		</div>
		<button class="adblock-dismiss" onclick={dismiss} aria-label="Cerrar">
			<Icon name="close" size={14} />
		</button>
	</div>
{/if}

<style>
	.adblock-banner {
		position: fixed;
		bottom: var(--space-4);
		left: 50%;
		transform: translateX(-50%);
		z-index: calc(var(--z-toast) - 1);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
		max-width: min(520px, 90vw);
		background: var(--surface);
		border: 1px solid var(--warning);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
		font-size: var(--text-sm);
		color: var(--text);
		animation: slideUp 0.3s var(--ease-out);
	}

	.adblock-icon {
		font-size: var(--text-lg);
		flex-shrink: 0;
	}

	.adblock-content {
		flex: 1;
		min-width: 0;
	}

	.adblock-text {
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.adblock-dismiss {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: var(--space-1);
		flex-shrink: 0;
		transition: color var(--duration-fast);
	}

	.adblock-dismiss:hover {
		color: var(--text);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
