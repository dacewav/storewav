<script lang="ts">
	import { isFullyConnected } from '$lib/stores';

	let connected = $derived($isFullyConnected);
	let showBanner = $state(false);
	let dismissed = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	// Only show banner after 3s of disconnection (avoids flash during initial load)
	$effect(() => {
		if (!connected) {
			if (!timer && !dismissed) {
				timer = setTimeout(() => {
					showBanner = true;
					timer = null;
				}, 3000);
			}
		} else {
			// Connected — hide immediately and reset
			if (timer) { clearTimeout(timer); timer = null; }
			showBanner = false;
			dismissed = false;
		}
	});

	function dismiss() {
		dismissed = true;
		showBanner = false;
	}
</script>

{#if showBanner && !dismissed}
	<div class="offline-banner" role="alert">
		<span class="offline-icon">⚡</span>
		<span class="offline-text">Sin conexión — algunos datos pueden no estar actualizados</span>
		<button class="offline-dismiss" onclick={dismiss} aria-label="Cerrar">✕</button>
	</div>
{/if}

<style>
	.offline-banner {
		position: fixed;
		bottom: var(--space-4);
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--z-toast);
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
		background: var(--surface);
		border: 1px solid var(--warning);
		border-radius: var(--radius-lg);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
		font-size: var(--text-sm);
		color: var(--text);
		animation: slideUp 0.3s var(--ease-out);
	}

	.offline-icon {
		font-size: var(--text-base);
	}

	.offline-text {
		color: var(--text-secondary);
	}

	.offline-dismiss {
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: var(--space-1);
		font-size: var(--text-sm);
		line-height: 1;
		transition: color var(--duration-fast);
	}

	.offline-dismiss:hover {
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
