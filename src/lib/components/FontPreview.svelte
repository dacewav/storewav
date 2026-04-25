<script lang="ts">
	/**
	 * FontPreview — loads a Google Font on demand and shows a live preview.
	 * Warns if font fails to load.
	 */
	let {
		fontName = '',
		sampleText = 'The quick brown fox jumps over the lazy wolf.',
		onselect
	}: {
		fontName: string;
		sampleText?: string;
		onselect?: (name: string) => void;
	} = $props();

	let loaded = $state(false);
	let error = $state(false);
	let loading = $state(false);

	// Popular fonts for suggestions
	const popularFonts = [
		'Syne', 'DM Mono', 'Space Grotesk', 'Inter', 'Poppins', 'Montserrat',
		'Roboto', 'Open Sans', 'Lato', 'Nunito', 'Raleway', 'Oswald',
		'Playfair Display', 'Merriweather', 'Source Code Pro', 'JetBrains Mono',
		'Fira Code', 'Work Sans', 'Outfit', 'Manrope', 'Sora', 'Plus Jakarta Sans',
		'Urbanist', 'Cabinet Grotesk', 'Clash Display', 'Satoshi',
	];

	let showSuggestions = $state(false);
	let filteredFonts = $derived(
		fontName
			? popularFonts.filter((f) => f.toLowerCase().includes(fontName.toLowerCase())).slice(0, 8)
			: popularFonts.slice(0, 8)
	);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const name = fontName;
		if (!name || name.length < 2) {
			loaded = false;
			error = false;
			return;
		}

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => loadFont(name), 400);

		return () => clearTimeout(debounceTimer);
	});

	async function loadFont(name: string) {
		loading = true;
		error = false;
		loaded = false;

		try {
			const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@300;400;500;600;700;800;900&display=swap`;
			const resp = await fetch(url);
			if (!resp.ok) throw new Error('Font not found');
			const css = await resp.text();
			if (css.includes('/* Invalid */') || !css.includes('@font-face')) throw new Error('Invalid font');

			// Inject style
			const id = `gfont-${name.replace(/\s+/g, '-').toLowerCase()}`;
			let styleEl = document.getElementById(id) as HTMLStyleElement | null;
			if (!styleEl) {
				styleEl = document.createElement('style');
				styleEl.id = id;
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = css;

			// Wait for font to be ready
			await document.fonts.load(`16px "${name}"`);
			loaded = true;
		} catch {
			error = true;
		} finally {
			loading = false;
		}
	}

	function handlePick(name: string) {
		onselect?.(name);
		showSuggestions = false;
	}
</script>

<div class="font-preview">
	<div class="input-row">
		<input
			type="text"
			value={fontName}
			oninput={(e) => onselect?.(e.currentTarget.value)}
			onfocus={() => (showSuggestions = true)}
			onblur={() => setTimeout(() => (showSuggestions = false), 200)}
			placeholder="Escribe un Google Font…"
			class="font-input"
		/>
		{#if loading}
			<span class="status loading">⏳</span>
		{:else if loaded}
			<span class="status ok">✓</span>
		{:else if error}
			<span class="status err">✗ No encontrado</span>
		{/if}
	</div>

	{#if showSuggestions && filteredFonts.length}
		<div class="suggestions">
			{#each filteredFonts as f}
				<button class="suggestion" onclick={() => handlePick(f)} style="font-family: '{f}', sans-serif">
					{f}
				</button>
			{/each}
		</div>
	{/if}

	{#if loaded && fontName}
		<div class="preview-box" style="font-family: '{fontName}', sans-serif">
			<p class="preview-text sample-lg">{sampleText}</p>
			<p class="preview-text sample-md">{sampleText}</p>
			<p class="preview-text sample-sm">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</p>
			<div class="weights-row">
				{#each [300, 400, 500, 600, 700, 800, 900] as w}
					<span class="weight-chip" style="font-weight: {w}">{w}</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.font-preview { display: flex; flex-direction: column; gap: var(--space-2); position: relative; }
	.input-row { display: flex; align-items: center; gap: var(--space-2); }
	.font-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: border-color var(--duration-fast);
	}
	.font-input:focus { border-color: rgba(var(--accent-rgb), 0.5); }
	.status { font-size: var(--text-xs); font-family: var(--font-mono); white-space: nowrap; }
	.status.ok { color: #22c55e; }
	.status.err { color: #ef4444; }
	.status.loading { color: var(--text-muted); }
	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 10;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px rgba(0,0,0,0.3);
		max-height: 240px;
		overflow-y: auto;
	}
	.suggestion {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--space-2) var(--space-3);
		border: none;
		background: none;
		color: var(--text);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: background var(--duration-fast);
	}
	.suggestion:hover { background: rgba(var(--accent-rgb), 0.1); }
	.preview-box {
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.preview-text { color: var(--text); margin: 0; }
	.sample-lg { font-size: 1.25rem; }
	.sample-md { font-size: 0.875rem; color: var(--text-secondary); }
	.sample-sm { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.02em; }
	.weights-row { display: flex; gap: var(--space-2); margin-top: var(--space-2); flex-wrap: wrap; }
	.weight-chip {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		background: rgba(var(--accent-rgb), 0.08);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
	}
</style>
