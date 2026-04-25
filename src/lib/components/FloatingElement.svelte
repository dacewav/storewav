<script lang="ts">
	import type { FloatingElement } from '$lib/stores/floating';

	let { element }: { element: FloatingElement } = $props();

	let animClass = $derived.by(() => {
		switch (element.animation) {
			case 'float': return 'fl-anim-float';
			case 'pulse': return 'fl-anim-pulse';
			case 'bounce': return 'fl-anim-bounce';
			case 'spin': return 'fl-anim-spin';
			case 'drift': return 'fl-anim-drift';
			default: return '';
		}
	});

	let responsiveClass = $derived.by(() => {
		if (element.desktopOnly) return 'fl-desktop-only';
		if (element.mobileOnly) return 'fl-mobile-only';
		return '';
	});

	let style = $derived([
		`left: ${element.x}%`,
		`top: ${element.y}%`,
		`width: ${element.width}px`,
		element.height > 0 ? `height: ${element.height}px` : '',
		`opacity: ${element.opacity}`,
		`transform: translate(-50%, -50%) rotate(${element.rotation}deg)`,
		`z-index: ${element.zIndex}`,
		element.animation !== 'none' ? `animation-duration: ${element.animationDuration}s` : '',
		'pointer-events: none',
	].filter(Boolean).join('; '));
</script>

{#if element.type === 'image'}
	<img
		src={element.content}
		alt=""
		class="floating-el {animClass} {responsiveClass}"
		{style}
		loading="lazy"
		draggable="false"
	/>
{:else}
	<div
		class="floating-el floating-text {animClass} {responsiveClass}"
		{style}
		role="presentation"
	>
		{element.content}
	</div>
{/if}

<style>
	.floating-el {
		position: fixed;
		user-select: none;
		will-change: transform;
	}

	.floating-el img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.floating-text {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: inherit;
		line-height: 1;
	}

	/* Animations */
	@keyframes flFloat {
		0%, 100% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translateY(0); }
		50% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translateY(-12px); }
	}

	@keyframes flPulse {
		0%, 100% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) scale(1); }
		50% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) scale(1.15); }
	}

	@keyframes flBounce {
		0%, 100% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translateY(0); }
		40% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translateY(-18px); }
		60% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translateY(-8px); }
	}

	@keyframes flSpin {
		from { transform: translate(-50%, -50%) rotate(0deg); }
		to { transform: translate(-50%, -50%) rotate(360deg); }
	}

	@keyframes flDrift {
		0% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translate(0, 0); }
		25% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translate(8px, -6px); }
		50% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translate(-4px, -10px); }
		75% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translate(-8px, -3px); }
		100% { transform: translate(-50%, -50%) rotate(var(--fl-rot, 0deg)) translate(0, 0); }
	}

	.fl-anim-float { animation-name: flFloat; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
	.fl-anim-pulse { animation-name: flPulse; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
	.fl-anim-bounce { animation-name: flBounce; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
	.fl-anim-spin { animation-name: flSpin; animation-timing-function: linear; animation-iteration-count: infinite; }
	.fl-anim-drift { animation-name: flDrift; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }

	/* Responsive */
	@media (max-width: 768px) {
		.fl-desktop-only { display: none !important; }
	}

	@media (min-width: 769px) {
		.fl-mobile-only { display: none !important; }
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.fl-anim-float, .fl-anim-pulse, .fl-anim-bounce, .fl-anim-spin, .fl-anim-drift {
			animation: none !important;
		}
	}
</style>
