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

	const resolvedColor = $derived(color || 'var(--accent)');

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

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
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
				// Image particles handled separately
				ctx.fillStyle = resolvedColor;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.globalAlpha = 1;
		animId = requestAnimationFrame(() => draw(ctx, w, h));
	}

	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.parentElement?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight };
			const w = rect.width;
			const h = rect.height;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.scale(dpr, dpr);
			initParticles(w, h);
		};

		resize();
		draw(ctx, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

		window.addEventListener('resize', resize);
		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
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
