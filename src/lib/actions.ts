/**
 * Svelte Actions — reusable directives
 *
 * Uso:
 *   <div use:tilt={{ max: 10 }}>
 *   <div use:staggerReveal={{ delay: 100 }}>
 */

import type { Action } from 'svelte/action';

/** 3D tilt on mouse move (desktop only) */
export const tilt: Action<HTMLElement, { max?: number; scale?: number }> = (node, params = {}) => {
	const max = params.max ?? 8;
	const scale = params.scale ?? 1;

	function onMouseMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		node.style.transform = `perspective(600px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(${scale})`;
	}

	function onMouseLeave() {
		node.style.transform = '';
		node.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
		setTimeout(() => { node.style.transition = ''; }, 400);
	}

	// Skip on touch
	const mq = window.matchMedia('(hover: hover)');
	if (mq.matches) {
		node.addEventListener('mousemove', onMouseMove);
		node.addEventListener('mouseleave', onMouseLeave);
	}

	return {
		destroy() {
			node.removeEventListener('mousemove', onMouseMove);
			node.removeEventListener('mouseleave', onMouseLeave);
		}
	};
};

/** Parallax translate on scroll */
export const parallax: Action<HTMLElement, { speed?: number }> = (node, params = {}) => {
	const speed = params.speed ?? 0.3;

	function onScroll() {
		const rect = node.getBoundingClientRect();
		const center = rect.top + rect.height / 2;
		const viewCenter = window.innerHeight / 2;
		const offset = (center - viewCenter) * speed;
		node.style.transform = `translateY(${offset}px)`;
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	return {
		destroy() {
			window.removeEventListener('scroll', onScroll);
		}
	};
};

/** Stagger reveal children on scroll (IntersectionObserver) */
export const staggerReveal: Action<HTMLElement, { delay?: number; threshold?: number }> = (node, params = {}) => {
	const delay = params.delay ?? 80;
	const threshold = params.threshold ?? 0.1;

	const children = Array.from(node.children) as HTMLElement[];
	children.forEach((child, i) => {
		child.style.opacity = '0';
		child.style.transform = 'translateY(20px)';
		child.style.transition = `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * delay}ms`;
	});

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const el = entry.target as HTMLElement;
					el.style.opacity = '1';
					el.style.transform = 'translateY(0)';
					observer.unobserve(el);
				}
			});
		},
		{ threshold }
	);

	children.forEach((child) => observer.observe(child));

	return {
		destroy() {
			observer.disconnect();
		}
	};
};

/** Click ripple effect */
export const ripple: Action<HTMLElement> = (node) => {
	function onClick(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const span = document.createElement('span');
		span.style.cssText = `
			position: absolute;
			left: ${x}px;
			top: ${y}px;
			width: 0;
			height: 0;
			border-radius: 50%;
			background: rgba(var(--accent-rgb), 0.2);
			transform: translate(-50%, -50%);
			pointer-events: none;
			animation: rippleExpand 0.6s ease-out forwards;
		`;
		node.style.position = node.style.position || 'relative';
		node.style.overflow = 'hidden';
		node.appendChild(span);
		setTimeout(() => span.remove(), 600);
	}

	node.addEventListener('click', onClick);

	return {
		destroy() {
			node.removeEventListener('click', onClick);
		}
	};
};
