<script lang="ts">
	import { isFullyConnected } from '$lib/stores';
	import Icon from './Icon.svelte';

	let connected = $derived($isFullyConnected);
	let showBanner = $state(false);
	let dismissed = $state(false);
	let retrying = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	// Only show banner after 8s of disconnection (avoids flash during initial load + Firebase auth reconnection)
	$effect(() => {
		if (!connected) {
			if (!timer && !dismissed) {
				timer = setTimeout(() => {
					showBanner = true;
					timer = null;
				}, 8000);
			}
		} else {
			// Connected — hide immediately and reset
			if (timer) { clearTimeout(timer); timer = null; }
			showBanner = false;
			dismissed = false;
			retrying = false;
		}
	});

	function dismiss() {
		dismissed = true;
		showBanner = false;
	}

	function handleRetry() {
		retrying = true;
		// Force a connection check by reloading Firebase
		if (typeof window !== 'undefined') {
			setTimeout(() => {
				// If still offline after 3s, reset retrying state
				if (!connected) retrying = false;
			}, 3000);
		}
	}
</script>

{#if showBanner && !dismissed}
	<div class="offline-banner" role="alert">
		<span class="offline-icon">⚡</span>
		<span class="offline-text">
			{#if retrying}
				Reintentando conexión...
			{:else}
				Sin conexión — algunos datos pueden no estar actualizados
			{/if}
		</span>
		{#if !retrying}
			<button class="offline-retry" onclick={handleRetry} aria-label="Reintentar">
				<Icon name="undo" size={12} />
			</button>
		{:else}
			<span class="retry-spinner"></span>
		{/if}
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

	.offline-retry {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.offline-retry:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.retry-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
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
