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
	let leaveTimer: ReturnType<typeof setTimeout> | null = null;

	function onMouseMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		node.style.transform = `perspective(600px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(${scale})`;
	}

	function onMouseLeave() {
		node.style.transform = '';
		node.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
		leaveTimer = setTimeout(() => { node.style.transition = ''; }, 400);
	}

	// Skip on touch
	const mq = window.matchMedia('(hover: hover)');
	if (mq.matches) {
		node.addEventListener('mousemove', onMouseMove);
		node.addEventListener('mouseleave', onMouseLeave);
	}

	return {
		destroy() {
			if (leaveTimer) clearTimeout(leaveTimer);
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

/** Reveal element on scroll (replaces .reveal CSS class — works with dynamic content) */
export const reveal: Action<HTMLElement, { threshold?: number }> = (node, params = {}) => {
	const threshold = params.threshold ?? 0.15;
	node.style.opacity = '0';
	node.style.transform = 'translateY(24px)';
	node.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.style.opacity = '1';
				node.style.transform = 'translateY(0)';
				observer.unobserve(node);
			}
		},
		{ threshold }
	);
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};

/** Sibling blur — blur all sibling cards on hover (like catalog) */
export const siblingBlur: Action<HTMLElement, { blur?: number; opacity?: number }> = (node, params = {}) => {
	const blurPx = params.blur ?? 3;
	const opacity = params.opacity ?? 0.6;

	// Only on devices with hover
	const mq = window.matchMedia('(hover: hover)');
	if (!mq.matches) return { destroy() {} };

	function blurOthers(hovered: HTMLElement) {
		const cards = node.querySelectorAll<HTMLElement>('.beat-card');
		cards.forEach((c) => {
			if (c !== hovered) {
				c.style.filter = `blur(${blurPx}px)`;
				c.style.opacity = String(opacity);
				c.style.transition = 'filter 0.3s, opacity 0.3s';
			} else {
				c.style.filter = '';
				c.style.opacity = '';
			}
		});
	}

	function clearAll() {
		const cards = node.querySelectorAll<HTMLElement>('.beat-card');
		cards.forEach((c) => {
			c.style.filter = '';
			c.style.opacity = '';
		});
	}

	function onMouseOver(e: Event) {
		const card = (e.target as HTMLElement)?.closest('.beat-card');
		if (card) blurOthers(card as HTMLElement);
	}

	function onMouseOut(e: Event) {
		const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
		if (!related || !node.contains(related)) {
			clearAll();
		}
	}

	node.addEventListener('mouseover', onMouseOver);
	node.addEventListener('mouseout', onMouseOut);

	return {
		destroy() {
			node.removeEventListener('mouseover', onMouseOver);
			node.removeEventListener('mouseout', onMouseOut);
			clearAll();
		}
	};
};

/** Click ripple effect (requires @keyframes rippleExpand in global CSS) */
export const ripple: Action<HTMLElement> = (node) => {
	let rippleTimer: ReturnType<typeof setTimeout> | null = null;

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
		rippleTimer = setTimeout(() => span.remove(), 600);
	}

	node.addEventListener('click', onClick);

	return {
		destroy() {
			if (rippleTimer) clearTimeout(rippleTimer);
			node.removeEventListener('click', onClick);
		}
	};
};

/** Animates a number from 0 to target value when element enters viewport */
export const countUp: Action<HTMLElement, number> = (node, target) => {
	let animated = false;
	const duration = 1200;

	function animate(t: number) {
		if (animated || !t || t <= 0) return;
		animated = true;

		const start = performance.now();
		function step(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			// Ease out cubic
			const eased = 1 - Math.pow(1 - progress, 3);
			node.textContent = String(Math.round(eased * t));
			if (progress < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	let visible = false;
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) {
				visible = true;
				animate(target);
				observer.disconnect();
			}
		},
		{ threshold: 0.5 }
	);
	observer.observe(node);

	// Animate immediately if target is already set
	if (target && target > 0) {
		// Let the IntersectionObserver handle it
	}

	return {
		update(newTarget: number) {
			if (newTarget === target) return;
			target = newTarget;
			// Re-animate if already visible and new target is valid
			if (visible && newTarget && newTarget > 0) {
				animated = false;
				animate(newTarget);
			} else if (!visible && newTarget && newTarget > 0) {
				// Not yet visible, let observer handle it
			}
		},
		destroy() {
			observer.disconnect();
		}
	};
};
