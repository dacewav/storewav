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

/** Sibling hover effect — configurable effect on sibling cards (blur, dim, scale-down, none) */
export const siblingBlur: Action<HTMLElement, {
	blur?: number;
	opacity?: number;
	effect?: 'blur' | 'dim' | 'scale-down' | 'none';
	scale?: number;
	duration?: string;
}> = (node, params = {}) => {
	const blurPx = params.blur ?? 3;
	const opacity = params.opacity ?? 0.6;
	const effect = params.effect ?? 'blur';
	const scale = params.scale ?? 0.95;
	const duration = params.duration ?? '0.3s';

	// Only on devices with hover
	const mq = window.matchMedia('(hover: hover)');
	if (!mq.matches || effect === 'none') return { destroy() {} };

	let activeCard: HTMLElement | null = null;

	function applyEffect(hovered: HTMLElement) {
		if (activeCard === hovered) return;
		activeCard = hovered;
		const cards = node.querySelectorAll<HTMLElement>('.beat-card');
		cards.forEach((c) => {
			c.style.transition = `filter ${duration}, opacity ${duration}, transform ${duration}`;
			if (c !== hovered) {
				switch (effect) {
					case 'blur':
						c.style.filter = `blur(${blurPx}px)`;
						c.style.opacity = String(opacity);
						c.style.transform = '';
						break;
					case 'dim':
						c.style.filter = '';
						c.style.opacity = String(opacity);
						c.style.transform = '';
						break;
					case 'scale-down':
						c.style.filter = '';
						c.style.opacity = String(opacity);
						c.style.transform = `scale(${scale})`;
						break;
				}
			} else {
				c.style.filter = '';
				c.style.opacity = '';
				c.style.transform = '';
			}
		});
	}

	function clearAll() {
		activeCard = null;
		const cards = node.querySelectorAll<HTMLElement>('.beat-card');
		cards.forEach((c) => {
			c.style.filter = '';
			c.style.opacity = '';
			c.style.transform = '';
		});
	}

	function onMouseOver(e: Event) {
		const card = (e.target as HTMLElement)?.closest('.beat-card');
		if (card) applyEffect(card as HTMLElement);
	}

	function onMouseOut(e: Event) {
		const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
		// Clear if leaving the grid or moving to a non-card element
		if (!related || !node.contains(related)) {
			clearAll();
		}
	}

	// Also clear on mouseleave from the grid container
	function onMouseLeave() {
		clearAll();
	}

	node.addEventListener('mouseover', onMouseOver);
	node.addEventListener('mouseout', onMouseOut);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseover', onMouseOver);
			node.removeEventListener('mouseout', onMouseOut);
			node.removeEventListener('mouseleave', onMouseLeave);
			clearAll();
		}
	};
};

/** Animates a number from 0 to target value when element enters viewport */
export const countUp: Action<HTMLElement, number> = (node, initialTarget) => {
	let animated = false;
	let target = initialTarget;
	const duration = 1200;

	function animate(t: number) {
		if (animated || !t || t <= 0) return;
		animated = true;
		const start = performance.now();
		function step(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
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
		{ threshold: 0.1 }
	);
	observer.observe(node);

	return {
		update(newTarget: number) {
			const prev = target;
			target = newTarget;
			if (newTarget > 0 && newTarget !== prev) {
				if (visible) {
					// Already visible (observer already fired) — animate immediately
					animated = false;
					animate(newTarget);
				}
				// If not visible yet, observer will handle it when it fires
			}
		},
		destroy() {
			observer.disconnect();
		}
	};
};
