<script lang="ts">
	import { uploadFile, generatePath, deleteFile, readFileAsDataUrl, type UploadProgress } from '$lib/upload';
	import { toast } from '$lib/toastStore';

	let {
		value = $bindable(''),
		folder = 'uploads',
		beatId = 'temp',
		accept = 'image/*',
		label = 'Archivo',
		type = 'image', // 'image' | 'audio'
		onUploadStart,
		onUploadComplete,
		onRemove
	}: {
		value?: string;
		folder?: string;
		beatId?: string;
		accept?: string;
		label?: string;
		type?: 'image' | 'audio';
		onUploadStart?: () => void;
		onUploadComplete?: (url: string) => void;
		onRemove?: () => void;
	} = $props();

	let dragging = $state(false);
	let uploading = $state(false);
	let progress = $state<UploadProgress | null>(null);
	let error = $state('');
	let previewUrl = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	// Audio preview
	let audioEl: HTMLAudioElement | undefined = $state();
	let audioPlaying = $state(false);
	let audioTime = $state(0);
	let audioDuration = $state(0);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragging = true;
	}

	function handleDragLeave() {
		dragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		const files = e.dataTransfer?.files;
		if (files?.length) handleFile(files[0]);
	}

	function handleFileSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		if (input.files?.length) handleFile(input.files[0]);
	}

	async function handleFile(file: File) {
		error = '';

		// Validate type
		if (type === 'image' && !file.type.startsWith('image/')) {
			error = 'Solo se permiten imágenes';
			return;
		}
		if (type === 'audio' && !file.type.startsWith('audio/')) {
			error = 'Solo se permiten archivos de audio';
			return;
		}

		// Size limit: 50MB
		if (file.size > 50 * 1024 * 1024) {
			error = 'Máximo 50MB';
			return;
		}

		// Local preview for images
		if (type === 'image') {
			previewUrl = await readFileAsDataUrl(file);
		}

		// Upload
		uploading = true;
		onUploadStart?.();
		progress = { bytesTransferred: 0, totalBytes: file.size, percent: 0 };

		try {
			const path = generatePath(folder, beatId, file.name);
			const result = await uploadFile(path, file, (p) => {
				progress = p;
			});
			value = result.url;
			onUploadComplete?.(result.url);
			previewUrl = '';
			toast.success('Archivo subido');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al subir';
			previewUrl = '';
			toast.error(error);
		} finally {
			uploading = false;
			progress = null;
		}
	}

	async function handleRemove() {
		if (value) {
			try { await deleteFile(value); } catch {}
		}
		value = '';
		previewUrl = '';
		error = '';
		if (fileInput) fileInput.value = '';
		onRemove?.();
	}

	function openFileDialog() {
		fileInput?.click();
	}

	// Audio playback
	function toggleAudio() {
		if (!audioEl) return;
		if (audioPlaying) { audioEl.pause(); } else { audioEl.play(); }
		audioPlaying = !audioPlaying;
	}

	function seekAudio(e: MouseEvent) {
		if (!audioEl || !audioDuration) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
	}

	function formatTime(s: number) {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	// Determine display state
	let hasFile = $derived(!!value);
	let showPreview = $derived(!!previewUrl || (hasFile && type === 'image'));
	let displayUrl = $derived(previewUrl || value);
</script>

<div class="uploader" class:dragging class:uploading>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="drop-zone"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={openFileDialog}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && openFileDialog()}
	>
		<input
			bind:this={fileInput}
			type="file"
			{accept}
			onchange={handleFileSelect}
			class="hidden-input"
		/>

		{#if uploading && progress}
			<!-- Upload progress -->
			<div class="progress-state">
				<div class="progress-ring">
					<svg viewBox="0 0 36 36" class="ring-svg">
						<circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" stroke-width="2" />
						<circle
							cx="18" cy="18" r="15.5"
							fill="none"
							stroke="var(--accent)"
							stroke-width="2"
							stroke-dasharray="{progress.percent} {100 - progress.percent}"
							stroke-linecap="round"
							transform="rotate(-90 18 18)"
						/>
					</svg>
					<span class="progress-pct">{progress.percent}%</span>
				</div>
				<span class="progress-text">Subiendo...</span>
			</div>
		{:else if showPreview && type === 'image'}
			<!-- Image preview -->
			<div class="img-preview">
				<img src={displayUrl} alt="Preview" decoding="async" />
				<div class="img-overlay">
					<span class="img-hint">Click o arrastra para cambiar</span>
				</div>
			</div>
		{:else if hasFile && type === 'audio'}
			<!-- Audio with player -->
			<div class="audio-state" role="presentation" onclick={(e) => e.stopPropagation()}>
				<button class="play-btn" onclick={toggleAudio} aria-label={audioPlaying ? 'Pausar' : 'Reproducir'}>
					{audioPlaying ? '⏸' : '▶'}
				</button>
				<div class="progress-bar" role="slider" aria-label="Progreso del audio" aria-valuenow={audioDuration > 0 ? Math.round((audioTime / audioDuration) * 100) : 0} aria-valuemin={0} aria-valuemax={100} tabindex="0"
					onclick={seekAudio}
					onkeydown={(e) => {
						if (!audioEl) return;
						if (e.key === 'ArrowRight') { audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + 5); }
						if (e.key === 'ArrowLeft') { audioEl.currentTime = Math.max(0, audioEl.currentTime - 5); }
					}}
				>
					<div class="progress-fill" style="width: {audioDuration > 0 ? (audioTime / audioDuration) * 100 : 0}%"></div>
				</div>
				<span class="time">{formatTime(audioTime)} / {formatTime(audioDuration)}</span>
				<audio
					bind:this={audioEl}
					src={value}
					ontimeupdate={() => audioTime = audioEl?.currentTime ?? 0}
					onloadedmetadata={() => audioDuration = audioEl?.duration ?? 0}
					onended={() => { audioPlaying = false; audioTime = 0; }}
				></audio>
			</div>
			<span class="audio-hint">Click o arrastra para cambiar</span>
		{:else}
			<!-- Empty state -->
			<div class="empty-state">
				<div class="empty-icon">{type === 'image' ? '🖼️' : '🎵'}</div>
				<div class="empty-text">
					<span class="empty-main">Arrastra {type === 'image' ? 'una imagen' : 'un audio'} aquí</span>
					<span class="empty-sub">o haz click para seleccionar</span>
				</div>
				<span class="empty-hint">{type === 'image' ? 'JPG, PNG, WebP' : 'MP3, WAV, OGG'} · máx 50MB</span>
			</div>
		{/if}
	</div>

	<!-- Bottom bar -->
	<div class="bottom-bar">
		<span class="label">{label}</span>
		<div class="actions">
			{#if hasFile}
				<button class="btn-action" onclick={openFileDialog} aria-label="Cambiar archivo" title="Cambiar">🔄</button>
				<button class="btn-action btn-remove" onclick={handleRemove} aria-label="Quitar archivo" title="Quitar">✕</button>
			{:else}
				<button class="btn-action" onclick={openFileDialog} aria-label="Seleccionar archivo" title="Seleccionar">📁</button>
			{/if}
		</div>
	</div>

	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.uploader {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: border-color var(--duration-fast);
	}

	.uploader:hover { border-color: rgba(var(--accent-rgb), 0.3); }
	.uploader.dragging { border-color: var(--accent); border-style: dashed; }
	.uploader.uploading { pointer-events: none; }

	.hidden-input { display: none; }

	.drop-zone {
		position: relative;
		min-height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background: var(--surface);
		transition: background var(--duration-fast);
	}

	.drop-zone:hover { background: var(--surface-hover); }

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-4);
		text-align: center;
	}

	.empty-icon { font-size: var(--text-3xl); opacity: 0.5; }
	.empty-main { font-size: var(--text-sm); color: var(--text-secondary); }
	.empty-sub { font-size: var(--text-xs); color: var(--text-muted); }
	.empty-hint { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--text-hint); margin-top: var(--space-1); }

	/* Progress */
	.progress-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-4);
	}

	.progress-ring { position: relative; width: 48px; height: 48px; }

	.ring-svg { width: 100%; height: 100%; }

	.progress-pct {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--accent);
		font-weight: 600;
	}

	.progress-text { font-size: var(--text-xs); color: var(--text-muted); }

	/* Image preview */
	.img-preview {
		width: 100%;
		position: relative;
		aspect-ratio: 1;
		max-height: 250px;
	}

	.img-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.img-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0,0,0,0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity var(--duration-fast);
	}

	.img-preview:hover .img-overlay { opacity: 1; }

	.img-hint {
		font-size: var(--text-xs);
		color: white;
		background: rgba(0,0,0,0.5);
		padding: 4px 12px;
		border-radius: var(--radius-full);
	}

	/* Audio */
	.audio-state {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		width: 100%;
	}

	.audio-hint {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-align: center;
		padding-bottom: var(--space-2);
	}

	.play-btn {
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		border-radius: 50%;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--accent);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		transition: all var(--duration-fast);
		flex-shrink: 0;
	}

	.play-btn:hover { background: rgba(var(--accent-rgb), 0.1); border-color: rgba(var(--accent-rgb), 0.3); }

	.progress-bar {
		flex: 1;
		height: 6px;
		background: var(--border);
		border-radius: 3px;
		cursor: pointer;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 3px;
		transition: width 0.1s linear;
	}

	.time {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Bottom bar */
	.bottom-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-1) var(--space-2);
		border-top: 1px solid var(--border);
		background: var(--surface);
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.actions { display: flex; gap: var(--space-1); }

	.btn-action {
		min-width: 28px;
		min-height: 28px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xs);
		transition: all var(--duration-fast);
	}

	.btn-action:hover { background: var(--surface-hover); }
	.btn-remove:hover { color: var(--danger); border-color: var(--danger); }

	.error {
		display: block;
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--danger);
		background: var(--danger-glow);
	}
</style>
