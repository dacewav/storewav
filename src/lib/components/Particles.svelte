<script lang="ts">
	let {
		count = 50,
		speed = 1,
		type = 'circle',
		color = '',
		opacity = 0.3,
		text = '',
		imgUrl = ''
	}: {
		count?: number;
		speed?: number;
		type?: string;
		color?: string;
		opacity?: number;
		text?: string;
		imgUrl?: string;
	} = $props();

	let canvas: HTMLCanvasElement;
	let animId = 0;
	let particles: { x: number; y: number; vx: number; vy: number; size: number; life: number }[] = [];
	let canvasW = 0;
	let canvasH = 0;
	let ctxRef: CanvasRenderingContext2D | null = null;

	const resolvedColor = $derived(color || getComputedAccent());

	/** Resolve CSS variable --accent to actual hex for canvas */
	function getComputedAccent(): string {
		if (typeof document === 'undefined') return '#dc2626';
		const val = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
		return val || '#dc2626';
	}

	function initParticles(w: number, h: number) {
		particles = Array.from({ length: count }, () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			vx: (Math.random() - 0.5) * speed,
			vy: (Math.random() - 0.5) * speed,
			size: 2 + Math.random() * 3,
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

			const alpha = opacity * (0.5 + 0.5 * Math.sin(p.life * Math.PI * 2));
			ctx.globalAlpha = alpha;

			if (type === 'circle') {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = resolvedColor;
				ctx.fill();
			} else if (type === 'square') {
				ctx.fillStyle = resolvedColor;
				ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
			} else if (type === 'line') {
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p.x + p.vx * 8, p.y + p.vy * 8);
				ctx.strokeStyle = resolvedColor;
				ctx.lineWidth = 1;
				ctx.stroke();
			} else if (type === 'text') {
				ctx.fillStyle = resolvedColor;
				ctx.font = `${p.size * 3}px sans-serif`;
				ctx.fillText(text || '✦', p.x, p.y);
			} else if (type === 'image' && imgUrl) {
				ctx.fillStyle = resolvedColor;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.globalAlpha = 1;
		animId = requestAnimationFrame(draw);
	}

	// Re-initialize particles when config changes
	$effect(() => {
		// Read all particle props to create dependencies
		void count;
		void speed;
		void type;
		void color;
		void opacity;
		void text;
		void imgUrl;
		void resolvedColor;

		if (canvasW > 0 && canvasH > 0) {
			initParticles(canvasW, canvasH);
		}
	});

	// Canvas setup — runs once when canvas mounts
	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctxRef = ctx;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			// Canvas is position:fixed → always use viewport dimensions
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

		// Re-check after first paint — canvas may not be laid out yet
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
		z-index: 0;
		pointer-events: none;
		width: 100%;
		height: 100%;
	}
</style>
