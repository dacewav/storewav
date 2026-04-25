<script lang="ts">
	let {
		count = 50,
		speed = 1,
		type = 'circle',
		color = '',
		opacity = 0.3,
		text = '',
		imgUrl = '',
		sizeMin = 3,
		sizeMax = 8
	}: {
		count?: number;
		speed?: number;
		type?: string;
		color?: string;
		opacity?: number;
		text?: string;
		imgUrl?: string;
		sizeMin?: number;
		sizeMax?: number;
	} = $props();

	let canvas: HTMLCanvasElement;
	let animId = 0;
	let particles: { x: number; y: number; vx: number; vy: number; size: number; life: number }[] = [];
	let canvasW = 0;
	let canvasH = 0;
	let ctxRef: CanvasRenderingContext2D | null = null;

	const resolvedColor = $derived(color || getComputedAccent());

	function getComputedAccent(): string {
		if (typeof document === 'undefined') return '#dc2626';
		const val = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
		return val || '#dc2626';
	}

	/** Boost dark colors so particles are always visible on dark backgrounds */
	function brighten(hex: string): string {
		const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
		if (!m) return hex;
		const r = parseInt(m[1], 16);
		const g = parseInt(m[2], 16);
		const b = parseInt(m[3], 16);
		const lum = 0.299 * r + 0.587 * g + 0.114 * b;
		if (lum < 150) {
			const s = 150 / Math.max(lum, 1);
			return `rgb(${Math.min(255, Math.round(r * s + 50))},${Math.min(255, Math.round(g * s + 50))},${Math.min(255, Math.round(b * s + 50))})`;
		}
		return `rgb(${r},${g},${b})`;
	}

	const drawColor = $derived(brighten(resolvedColor));

	function initParticles(w: number, h: number) {
		particles = Array.from({ length: count }, () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			vx: (Math.random() - 0.5) * speed,
			vy: (Math.random() - 0.5) * speed,
			size: sizeMin + Math.random() * (sizeMax - sizeMin),
			life: Math.random()
		}));
	}

	function draw() {
		if (!ctxRef || canvasW === 0 || canvasH === 0) return;
		const ctx = ctxRef;
		const w = canvasW;
		const h = canvasH;
		ctx.clearRect(0, 0, w, h);

		for (const p of particles) {
			p.x += p.vx;
			p.y += p.vy;
			p.life += 0.002 * speed;

			if (p.x < 0) p.x = w;
			if (p.x > w) p.x = 0;
			if (p.y < 0) p.y = h;
			if (p.y > h) p.y = 0;

			const breathe = 0.5 + 0.5 * Math.sin(p.life * Math.PI * 2);
			ctx.globalAlpha = opacity + (1 - opacity) * breathe;
			ctx.fillStyle = drawColor;

			if (type === 'circle') {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			} else if (type === 'square') {
				ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
			} else if (type === 'line') {
				ctx.strokeStyle = drawColor;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p.x + p.vx * 12, p.y + p.vy * 12);
				ctx.stroke();
			} else if (type === 'text') {
				// Use a large font to ensure visibility — min 18px
				const fontSize = Math.max(p.size * 4, 18);
				ctx.font = `bold ${fontSize}px sans-serif`;
				ctx.fillText(text || '✦', p.x, p.y);
			} else if (type === 'image' && imgUrl) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.globalAlpha = 1;
		animId = requestAnimationFrame(draw);
	}

	// Re-init when any particle config changes — derived key ensures robust tracking
	const _particleKey = $derived(
		`${count}|${speed}|${type}|${color}|${opacity}|${text}|${imgUrl}|${sizeMin}|${sizeMax}|${resolvedColor}`
	);

	$effect(() => {
		void _particleKey;
		if (canvasW > 0 && canvasH > 0) {
			initParticles(canvasW, canvasH);
		}
	});

	// Canvas setup
	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctxRef = ctx;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			canvasW = window.innerWidth;
			canvasH = window.innerHeight;
			canvas.width = canvasW * dpr;
			canvas.height = canvasH * dpr;
			canvas.style.width = `${canvasW}px`;
			canvas.style.height = `${canvasH}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			initParticles(canvasW, canvasH);
		};

		resize();
		draw();

		const rafId = requestAnimationFrame(() => {
			if (canvasW === 0 || canvasH === 0) resize();
		});

		window.addEventListener('resize', resize);
		return () => {
			cancelAnimationFrame(animId);
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			ctxRef = null;
		};
	});
</script>

<canvas bind:this={canvas} class="particles-canvas"></canvas>

<style>
	.particles-canvas {
		position: fixed;
		inset: 0;
		z-index: var(--z-base);
		pointer-events: none;
		width: 100%;
		height: 100%;
	}
</style>
