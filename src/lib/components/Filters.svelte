<script lang="ts">
	import { genres, allTags } from '$lib/stores';
	import Icon from './Icon.svelte';

	type FilterState = { search: string; genre: string; key: string; sort: string; tags: string[] };

	let {
		filters = $bindable({ search: '', genre: '', key: '', sort: 'newest', tags: [] as string[] }),
		onchange,
		total = 0,
		filtered = 0,
		placeholder = 'Buscar beats...',
		labelAll = 'Todos',
		labelKey = 'Tonalidad',
		labelTags = 'Tags',
		labelClear = 'Limpiar todo'
	}: {
		filters?: FilterState;
		onchange?: (filters: FilterState) => void;
		total?: number;
		filtered?: number;
		placeholder?: string;
		labelAll?: string;
		labelKey?: string;
		labelTags?: string;
		labelClear?: string;
	} = $props();

	let genreList = $derived($genres);
	let tagList = $derived($allTags);
	let showTags = $state(false);

	// Match BeatEditor's key list exactly
	const allKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
		'Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'];

	const sortOptions = [
		{ value: 'newest', label: 'Más recientes' },
		{ value: 'oldest', label: 'Más antiguos' },
		{ value: 'name-az', label: 'Nombre A-Z' },
		{ value: 'name-za', label: 'Nombre Z-A' },
		{ value: 'bpm-asc', label: 'BPM ↑' },
		{ value: 'bpm-desc', label: 'BPM ↓' },
		{ value: 'price-asc', label: 'Precio ↑' },
		{ value: 'price-desc', label: 'Precio ↓' }
	];

	function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
		filters[key] = value;
		onchange?.(filters);
	}

	function toggleTag(tag: string) {
		const idx = filters.tags.indexOf(tag);
		if (idx === -1) {
			filters.tags = [...filters.tags, tag];
		} else {
			filters.tags = filters.tags.filter(t => t !== tag);
		}
		onchange?.(filters);
	}

	function clearAll() {
		filters = { search: '', genre: '', key: '', sort: 'newest', tags: [] };
		onchange?.(filters);
	}

	let hasActive = $derived(filters.search || filters.genre || filters.key || filters.tags.length > 0 || filters.sort !== 'newest');
</script>

<div class="filters">
	<!-- Search -->
	<div class="filter-search">
		<span class="search-icon"><Icon name="search" size={14} /></span>
		<input
			class="search-input"
			type="text"
			placeholder={placeholder}
			bind:value={filters.search}
			oninput={() => onchange?.(filters)}
		/>
		{#if filters.search}
			<button class="search-clear" onclick={() => { update('search', ''); }} aria-label="Limpiar">
				<Icon name="close" size={12} />
			</button>
		{/if}
	</div>

	<!-- Genre pills -->
	{#if genreList.length > 0}
		<div class="filter-pills">
			<button class="pill" class:active={!filters.genre} onclick={() => update('genre', '')}>{labelAll}</button>
			{#each genreList as genre}
				<button class="pill" class:active={filters.genre === genre} onclick={() => update('genre', genre)}>{genre}</button>
			{/each}
		</div>
	{/if}

	<!-- Dropdowns row -->
	<div class="filter-row">
		<div class="filter-select-wrap">
			<select class="filter-select" bind:value={filters.key} onchange={() => onchange?.(filters)}>
				<option value="">{labelKey}</option>
				{#each allKeys as k}
					<option value={k}>{k}</option>
				{/each}
			</select>
		</div>

		<div class="filter-select-wrap">
			<select class="filter-select" bind:value={filters.sort} onchange={() => onchange?.(filters)}>
				{#each sortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>

		<button class="tags-toggle" class:active={showTags} onclick={() => showTags = !showTags}>
			<Icon name="tag" size={14} />
			{labelTags}
			{#if filters.tags.length}
				<span class="tags-count">{filters.tags.length}</span>
			{/if}
		</button>
	</div>

	<!-- Tag cloud -->
	{#if showTags && tagList.length > 0}
		<div class="tag-cloud" role="group" aria-label="Tags">
			{#each tagList as tag (tag)}
				<button class="tag-btn" class:active={filters.tags.includes(tag)} onclick={() => toggleTag(tag)}>
					{tag}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Active filters -->
	{#if hasActive || (total > 0 && filtered !== total)}
		<div class="active-filters">
			<span class="filter-count" class:filtering={hasActive}>
				{filtered} de {total} beats
			</span>
			{#if filters.genre}
				<span class="active-tag">{filters.genre} <button onclick={() => update('genre', '')} aria-label="Quitar filtro {filters.genre}">×</button></span>
			{/if}
			{#if filters.key}
				<span class="active-tag">{filters.key} <button onclick={() => update('key', '')} aria-label="Quitar filtro {filters.key}">×</button></span>
			{/if}
			{#each filters.tags as tag (tag)}
				<span class="active-tag">{tag} <button onclick={() => toggleTag(tag)} aria-label="Quitar tag {tag}">×</button></span>
			{/each}
			{#if hasActive}
				<button class="clear-all" onclick={clearAll} aria-label="Limpiar todos los filtros">{labelClear}</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.filters {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* ── Search ── */
	.filter-search {
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		outline: none;
		transition: all var(--duration-fast);
	}

	.search-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.search-clear {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: var(--space-1);
		display: flex;
	}

	.search-clear:hover {
		color: var(--text);
	}

	/* ── Genre Pills ── */
	.filter-pills {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		scrollbar-width: none;
		padding-bottom: 2px;
	}

	.filter-pills::-webkit-scrollbar {
		display: none;
	}

	.pill {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-full);
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		white-space: nowrap;
		cursor: pointer;
		transition: all var(--duration-fast);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		min-height: var(--touch-min);
	}

	.pill:hover {
		border-color: var(--border-hover);
		color: var(--text);
	}

	.pill.active {
		background: rgba(var(--accent-rgb), 0.1);
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	/* ── Row ── */
	.filter-row {
		display: flex;
		gap: var(--space-2);
	}

	.filter-select-wrap {
		flex: 1;
	}

	.filter-select {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		min-height: var(--touch-min);
		appearance: none;
		cursor: pointer;
		outline: none;
		transition: all var(--duration-fast);
	}

	.filter-select:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.tags-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast);
		white-space: nowrap;
		min-height: var(--touch-min);
	}

	.tags-toggle:hover {
		border-color: var(--border-hover);
		color: var(--text);
	}

	.tags-toggle.active {
		background: rgba(var(--accent-rgb), 0.08);
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	.tags-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		background: var(--accent);
		color: var(--bg);
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ── Tag Cloud ── */
	.tag-cloud {
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
		padding: var(--space-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.tag-btn {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 3px 10px;
		border-radius: var(--radius-full);
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.tag-btn:hover {
		border-color: var(--border-hover);
		color: var(--text-secondary);
	}

	.tag-btn.active {
		background: rgba(var(--accent-rgb), 0.1);
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	/* ── Active Filters ── */
	.active-filters {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		align-items: center;
	}

	.filter-count {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		letter-spacing: 0.04em;
		transition: color var(--duration-fast);
	}

	.filter-count.filtering {
		color: var(--accent);
	}

	.active-tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 3px 8px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		color: var(--accent);
		letter-spacing: 0.04em;
	}

	.active-tag button {
		background: transparent;
		border: none;
		color: var(--accent);
		cursor: pointer;
		padding: 0;
		font-size: var(--text-sm);
		line-height: 1;
	}

	.clear-all {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		padding: var(--space-1);
	}

	.clear-all:hover {
		color: var(--danger);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.filter-row {
			flex-wrap: wrap;
		}

		.filter-select-wrap {
			flex: 1 1 45%;
		}
	}
</style>
