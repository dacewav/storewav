<script lang="ts">
	/**
	 * ImageCropper — canvas-based crop tool.
	 * Shows image, user drags a crop rectangle, exports cropped region.
	 */
	let {
		src = '',
		oncrop,
		oncancel,
		aspectRatio = 0 // 0 = free, >0 = fixed (w/h)
	}: {
		src: string;
		oncrop: (blob: Blob, dataUrl: string) => void;
		oncancel?: () => void;
		aspectRatio?: number;
	} = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let imgEl: HTMLImageElement | undefined = $state();
	let containerEl: HTMLDivElement | undefined = $state();

	let imgLoaded = $state(false);
	let imgW = $state(0);
	let imgH = $state(0);

	// Crop rect in image coordinates
	let cropX = $state(0);
	let cropY = $state(0);
	let cropW = $state(0);
	let cropH = $state(0);

	// Drag state
	let dragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragMode = $state<'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'create' | null>(null);
	let dragOffsetX = $state(0);
	let dragOffsetY = $state(0);

	// Display scale
	let scale = $state(1);
	let maxDisplayW = 600;

	$effect(() => {
		if (!src) return;
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			imgEl = img;
			imgW = img.naturalWidth;
			imgH = img.naturalHeight;
			scale = Math.min(1, maxDisplayW / imgW);
			imgLoaded = true;

			// Default crop: center 80%
			const margin = 0.1;
			cropX = imgW * margin;
			cropY = imgH * margin;
			cropW = imgW * (1 - 2 * margin);
			cropH = imgH * (1 - 2 * margin);
			if (aspectRatio > 0) {
				cropH = cropW / aspectRatio;
				if (cropH > imgH * (1 - 2 * margin)) {
					cropH = imgH * (1 - 2 * margin);
					cropW = cropH * aspectRatio;
				}
			}
			draw();
		};
		img.src = src;
	});

	function draw() {
		const canvas = canvasEl;
		if (!canvas || !imgEl) return;
		const dw = imgW * scale;
		const dh = imgH * scale;
		canvas.width = dw;
		canvas.height = dh;
		const ctx = canvas.getContext('2d')!;

		// Draw image
		ctx.drawImage(imgEl, 0, 0, dw, dh);

		// Dark overlay
		ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
		ctx.fillRect(0, 0, dw, dh);

		// Clear crop area
		const cx = cropX * scale, cy = cropY * scale;
		const cw = cropW * scale, ch = cropH * scale;
		ctx.clearRect(cx, cy, cw, ch);
		ctx.drawImage(imgEl, cropX, cropY, cropW, cropH, cx, cy, cw, ch);

		// Crop border
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.strokeRect(cx, cy, cw, ch);

		// Grid (rule of thirds)
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		ctx.lineWidth = 1;
		for (let i = 1; i < 3; i++) {
			ctx.beginPath();
			ctx.moveTo(cx + (cw * i) / 3, cy);
			ctx.lineTo(cx + (cw * i) / 3, cy + ch);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(cx, cy + (ch * i) / 3);
			ctx.lineTo(cx + cw, cy + (ch * i) / 3);
			ctx.stroke();
		}

		// Corner handles
		const hs = 8;
		ctx.fillStyle = '#fff';
		[[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]].forEach(([hx, hy]) => {
			ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
		});

		// Dimensions label
		ctx.fillStyle = 'rgba(0,0,0,0.7)';
		ctx.fillRect(cx, cy + ch + 4, cw, 20);
		ctx.fillStyle = '#fff';
		ctx.font = '11px monospace';
		ctx.textAlign = 'center';
		ctx.fillText(`${Math.round(cropW)} × ${Math.round(cropH)}`, cx + cw / 2, cy + ch + 17);
	}

	function toCanvasCoords(e: MouseEvent): [number, number] {
		const rect = canvasEl!.getBoundingClientRect();
		return [
			(e.clientX - rect.left) / scale,
			(e.clientY - rect.top) / scale
		];
	}

	function handleMousedown(e: MouseEvent) {
		const [mx, my] = toCanvasCoords(e);
		const margin = 12 / scale;

		// Check corners first
		const corners: Array<{ x: number; y: number; mode: typeof dragMode }> = [
			{ x: cropX, y: cropY, mode: null },
			{ x: cropX + cropW, y: cropY, mode: null },
			{ x: cropX, y: cropY + cropH, mode: null },
			{ x: cropX + cropW, y: cropY + cropH, mode: 'resize-br' },
		];

		// Check if clicking on resize handles (bottom-right primarily)
		for (const c of corners) {
			if (Math.abs(mx - c.x) < margin && Math.abs(my - c.y) < margin) {
				dragMode = 'resize-br';
				dragging = true;
				dragStartX = mx;
				dragStartY = my;
				return;
			}
		}

		// Check if inside crop → move
		if (mx >= cropX && mx <= cropX + cropW && my >= cropY && my <= cropY + cropH) {
			dragMode = 'move';
			dragging = true;
			dragOffsetX = mx - cropX;
			dragOffsetY = my - cropY;
			return;
		}

		// Outside → create new crop
		dragMode = 'create';
		dragging = true;
		cropX = mx;
		cropY = my;
		cropW = 0;
		cropH = 0;
		dragStartX = mx;
		dragStartY = my;
	}

	function handleMousemove(e: MouseEvent) {
		if (!dragging) return;
		const [mx, my] = toCanvasCoords(e);

		if (dragMode === 'move') {
			cropX = Math.max(0, Math.min(imgW - cropW, mx - dragOffsetX));
			cropY = Math.max(0, Math.min(imgH - cropH, my - dragOffsetY));
		} else if (dragMode === 'resize-br') {
			const newW = Math.max(20, mx - cropX);
			const newH = aspectRatio > 0 ? newW / aspectRatio : Math.max(20, my - cropY);
			cropW = Math.min(newW, imgW - cropX);
			cropH = aspectRatio > 0 ? cropW / aspectRatio : Math.min(newH, imgH - cropY);
		} else if (dragMode === 'create') {
			let x1 = Math.min(dragStartX, mx);
			let y1 = Math.min(dragStartY, my);
			let w = Math.abs(mx - dragStartX);
			let h = Math.abs(my - dragStartY);
			if (aspectRatio > 0) h = w / aspectRatio;
			cropX = Math.max(0, x1);
			cropY = Math.max(0, y1);
			cropW = Math.min(w, imgW - cropX);
			cropH = aspectRatio > 0 ? cropW / aspectRatio : Math.min(h, imgH - cropY);
		}

		draw();
	}

	function handleMouseup() {
		dragging = false;
		dragMode = null;
	}

	async function handleExport() {
		if (!imgEl) return;
		const offscreen = document.createElement('canvas');
		offscreen.width = Math.round(cropW);
		offscreen.height = Math.round(cropH);
		const ctx = offscreen.getContext('2d')!;
		ctx.drawImage(imgEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

		const blob = await new Promise<Blob>((resolve) =>
			offscreen.toBlob((b) => resolve(b!), 'image/png')
		);
		const dataUrl = offscreen.toDataURL('image/png');
		oncrop(blob, dataUrl);
	}

	function handleReset() {
		const margin = 0.1;
		cropX = imgW * margin;
		cropY = imgH * margin;
		cropW = imgW * (1 - 2 * margin);
		cropH = imgH * (1 - 2 * margin);
		if (aspectRatio > 0) cropH = cropW / aspectRatio;
		draw();
	}
</script>

<div class="cropper" bind:this={containerEl}>
	{#if imgLoaded}
		<div class="canvas-wrap">
			<canvas
				bind:this={canvasEl}
				onmousedown={handleMousedown}
				onmousemove={handleMousemove}
				onmouseup={handleMouseup}
				onmouseleave={handleMouseup}
			></canvas>
		</div>
		<div class="actions">
			<button class="btn-secondary" onclick={oncancel ?? handleReset}>✕ Cancelar</button>
			<button class="btn-secondary" onclick={handleReset}>↺ Reset</button>
			<button class="btn-primary" onclick={handleExport}>✂️ Recortar</button>
		</div>
	{:else}
		<div class="loading">Cargando imagen…</div>
	{/if}
</div>

<style>
	.cropper { display: flex; flex-direction: column; gap: var(--space-3); }
	.canvas-wrap { overflow: auto; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface-alt, #111); }
	canvas { display: block; cursor: crosshair; max-width: 100%; }
	.actions { display: flex; gap: var(--space-2); justify-content: flex-end; }
	.btn-primary, .btn-secondary {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--border);
		transition: all var(--duration-fast);
		min-height: var(--touch-min);
	}
	.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn-primary:hover { filter: brightness(1.1); }
	.btn-secondary { background: var(--surface); color: var(--text); }
	.btn-secondary:hover { background: var(--surface-hover, rgba(255,255,255,0.05)); }
	.loading { padding: var(--space-8); text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-sm); }
</style>
