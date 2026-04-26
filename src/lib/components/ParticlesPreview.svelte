<script lang="ts">
	/**
	 * ParticlesPreview — standalone particles canvas for admin preview.
	 * All values are passed as props, no Firebase dependency.
	 * Renders a small preview canvas that updates instantly.
	 */
	let {
		count = 50,
		speed = 1,
		type = 'circle',
		color = '',
		opacity = 0.3,
		text = '',
		imgUrl = '',
		sizeMin = 3,
		sizeMax = 8,
		accent = '#dc2626'
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
		accent?: string;
	} = $props();

	let canvas: HTMLCanvasElement;
	let animId = 0;
	let particles: { x: number; y: number; vx: number; vy: number; size: number; life: number }[] = [];
	let ctxRef: CanvasRenderingContext2D | null = null;
	let loadedImage: HTMLImageElement | null = null;
	let loadedImageUrl = '';
	let w = 320;
	let h = 180;

	const resolvedColor = $derived(color || accent);

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

	function initParticles() {
		particles = Array.from({ length: Math.min(count, 60) }, () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			vx: (Math.random() - 0.5) * speed,
			vy: (Math.random() - 0.5) * speed,
			size: sizeMin + Math.random() * (sizeMax - sizeMin),
			life: Math.random()
		}));
	}

	function draw() {
		if (!ctxRef) return;
		const ctx = ctxRef;
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
				const fontSize = Math.max(p.size * 4, 14);
				ctx.font = `bold ${fontSize}px sans-serif`;
				ctx.fillText(text || '✦', p.x, p.y);
			} else if (type === 'image' && loadedImage && loadedImageUrl === imgUrl) {
				const s = p.size * 3;
				ctx.drawImage(loadedImage, p.x - s / 2, p.y - s / 2, s, s);
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.globalAlpha = 1;
		animId = requestAnimationFrame(draw);
	}

	// Re-init when config changes
	const _key = $derived(`${count}|${speed}|${type}|${color}|${opacity}|${text}|${imgUrl}|${sizeMin}|${sizeMax}|${resolvedColor}`);
	$effect(() => { void _key; initParticles(); });

	// Preload image
	$effect(() => {
		const url = imgUrl;
		if (type === 'image' && url && url !== loadedImageUrl) {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => { loadedImage = img; loadedImageUrl = url; };
			img.onerror = () => { loadedImage = null; loadedImageUrl = ''; };
			img.src = url;
		} else if (!url) {
			loadedImage = null;
			loadedImageUrl = '';
		}
	});

	// Canvas setup
	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctxRef = ctx;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		canvas.style.width = `${w}px`;
		canvas.style.height = `${h}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		initParticles();
		draw();

		return () => {
			cancelAnimationFrame(animId);
			ctxRef = null;
		};
	});
</script>

<canvas bind:this={canvas} class="particles-preview-canvas"></canvas>

<style>
	.particles-preview-canvas {
		border-radius: var(--radius-md);
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid var(--border);
		width: 100%;
		max-width: 320px;
	}
</style>
