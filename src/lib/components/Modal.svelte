<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		open = $bindable(false),
		title = '',
		maxWidth = '500px',
		children
	}: {
		open?: boolean;
		title?: string;
		maxWidth?: string;
		children: Snippet;
	} = $props();

	let closing = $state(false);
	let scrollY = $state(0);
	let modalEl: HTMLElement | undefined = $state();
	let previouslyFocused: HTMLElement | null = null;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;

	function close() {
		closing = true;
		closeTimer = setTimeout(() => {
			open = false;
			closing = false;
		}, 200);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
		if (e.key === 'Tab' && modalEl) trapFocus(e);
	}

	function trapFocus(e: KeyboardEvent) {
		const focusable = modalEl!.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
			close();
		}
	}

	$effect(() => {
		if (open && typeof document !== 'undefined') {
			previouslyFocused = document.activeElement as HTMLElement;
			scrollY = window.scrollY;
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = '100%';

			// Focus first focusable element after render
			requestAnimationFrame(() => {
				if (modalEl) {
					const first = modalEl.querySelector<HTMLElement>('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])');
					first?.focus();
				}
			});
		} else if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			window.scrollTo(0, scrollY);

			// Restore focus to trigger element
			previouslyFocused?.focus();
		}

		return () => {
			if (closeTimer) clearTimeout(closeTimer);
			// Cleanup body styles if component unmounts while open
			if (typeof document !== 'undefined') {
				document.body.style.overflow = '';
				document.body.style.position = '';
				document.body.style.top = '';
				document.body.style.width = '';
			}
		};
	});
</script>

{#if open}
	<div
		class="modal-backdrop"
		class:closing
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-label={title || 'Modal'}
		tabindex="-1"
		bind:this={modalEl}
	>
		<div class="modal" class:closing style="max-width: {maxWidth};">
			{#if title}
				<div class="modal-header">
					<h2 class="modal-title">{title}</h2>
					<button class="modal-close" onclick={close} aria-label="Cerrar">
						<Icon name="close" size={18} />
					</button>
				</div>
			{/if}
			<div class="modal-body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		background: var(--backdrop);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		animation: fadeIn var(--duration-fast) var(--ease-out);
	}

	.modal-backdrop.closing {
		animation: fadeOut var(--duration-fast) var(--ease-out) forwards;
	}

	.modal {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-height: 85vh;
		overflow-y: auto;
		animation: slideUp var(--duration-normal) var(--ease-out);
		box-shadow: var(--shadow-xl);
	}

	.modal.closing {
		animation: slideDown var(--duration-fast) var(--ease-out) forwards;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-5);
		border-bottom: 1px solid var(--border);
	}

	.modal-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text);
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		padding: 0;
	}

	.modal-close:hover {
		background: var(--surface);
		color: var(--text);
	}

	.modal-body {
		padding: var(--space-5);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes slideDown {
		from {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		to {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
	}
</style>
