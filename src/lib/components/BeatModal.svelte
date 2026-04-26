<script lang="ts">
	import type { Beat } from '$lib/stores/beats';
	import { Modal, Badge } from '$lib/components';
	import { player, wishlist } from '$lib/stores';
	import Waveform from './Waveform.svelte';
	import Icon from './Icon.svelte';

	let {
		open = $bindable(false),
		beat,
		labelPreview = 'Escuchar preview',
		labelLicenses = 'Licencias',
		labelBuy = 'Comprar'
	}: {
		open?: boolean;
		beat: (Beat & { id: string }) | null;
		labelPreview?: string;
		labelLicenses?: string;
		labelBuy?: string;
	} = $props();

	let inWishlist = $derived(beat ? wishlist.isIn(beat.id) : null);
	let selectedLicense = $state(-1);

	function handlePlay() {
		if (!beat) return;
		player.play({
			id: beat.id,
			name: beat.name,
			artist: beat.artist ?? '',
			imageUrl: beat.imageUrl ?? '',
			audioUrl: beat.audioUrl || beat.previewUrl || ''
		});
	}

	function selectLicense(index: number) {
		selectedLicense = selectedLicense === index ? -1 : index;
	}

	// Reset selected license when modal opens with new beat
	$effect(() => {
		if (beat) selectedLicense = -1;
	});
</script>

{#if beat}
	<Modal bind:open title={beat.name} maxWidth="700px">
		<div class="modal-beat">
			<!-- Cover -->
			<div class="beat-cover">
				{#if beat.imageUrl}
					<img src={beat.imageUrl} alt={beat.name} decoding="async" />
				{:else}
					<div class="beat-cover-placeholder">
						<Icon name="music" size={48} />
					</div>
				{/if}
				<span class="cover-genre">{beat.genre}</span>
			</div>

			<!-- Info -->
			<div class="beat-header">
				<div>
					<h2 class="beat-title">{beat.name}</h2>
					{#if beat.artist}
						<p class="beat-artist">{beat.artist}</p>
					{/if}
				</div>
				<button class="beat-wish-btn" class:active={$inWishlist} onclick={() => beat && wishlist.toggle(beat.id)} aria-label="Favoritos">
					<Icon name="heart" size={18} filled={!!$inWishlist} />
				</button>
			</div>

			<!-- Meta badges -->
			<div class="beat-badges">
				<Badge variant="default">{beat.bpm} BPM</Badge>
				<Badge variant="default">{beat.key}</Badge>
				{#each beat.tags ?? [] as tag}
					<Badge variant="muted">{tag}</Badge>
				{/each}
			</div>

			<!-- Waveform -->
			<div class="beat-waveform">
				<Waveform bars={80} height={48} />
			</div>

			<!-- Play button -->
			<button class="beat-play-btn" onclick={handlePlay}>
				<Icon name="play" size={18} />
				{labelPreview}
			</button>

			<!-- Licenses -->
			{#if beat.licenses?.length}
				<div class="licenses">
					<div class="licenses-header">
						<div class="licenses-title">{labelLicenses}</div>
						{#if selectedLicense >= 0 && beat.licenses[selectedLicense]}
							<span class="selected-badge">
								{beat.licenses[selectedLicense].name} · ${beat.licenses[selectedLicense].priceMXN}
							</span>
						{/if}
					</div>
					<div class="licenses-grid">
						{#each beat.licenses as lic, i}
							<button
								class="license-item"
								class:selected={selectedLicense === i}
								onclick={() => selectLicense(i)}
							>
								<div class="license-name">{lic.name}</div>
								<div class="license-price">${lic.priceMXN}</div>
								{#if lic.description}
									<div class="license-desc">{lic.description}</div>
								{/if}
							</button>
						{/each}
					</div>
					{#if selectedLicense >= 0 && beat.licenses[selectedLicense]}
						<a
							class="buy-btn"
							href="https://wa.me?text=Quiero%20la%20licencia%20{encodeURIComponent(beat.licenses[selectedLicense].name)}%20de%20{encodeURIComponent(beat.name)}"
							target="_blank"
							rel="noopener"
						>
							{labelBuy} {beat.licenses[selectedLicense].name} — ${beat.licenses[selectedLicense].priceMXN}
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</Modal>
{/if}

<style>
	.modal-beat {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ── Cover ── */
	.beat-cover {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--surface2);
		position: relative;
	}

	.beat-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-slow) var(--ease-out);
	}

	.beat-cover:hover img {
		transform: scale(1.03);
	}

	.beat-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.cover-genre {
		position: absolute;
		bottom: var(--space-3);
		left: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 10px;
		border-radius: var(--radius-full);
		background: var(--overlay-bg);
		backdrop-filter: blur(8px);
		color: var(--text);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	/* ── Header ── */
	.beat-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.beat-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.beat-artist {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-1);
	}

	.beat-wish-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		border: 1px solid var(--border);
		border-radius: 50%;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
		flex-shrink: 0;
	}

	.beat-wish-btn:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		transform: scale(1.05);
	}

	.beat-wish-btn.active {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	/* ── Badges ── */
	.beat-badges {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	/* ── Waveform ── */
	.beat-waveform {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	/* ── Play ── */
	.beat-play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-out);
		min-height: 52px;
		position: relative;
		overflow: hidden;
	}

	.beat-play-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-accent);
		transform: translateY(-1px);
	}

	.beat-play-btn:active {
		transform: translateY(0);
	}

	/* ── Licenses ── */
	.licenses {
		border-top: 1px solid var(--border);
		padding-top: var(--space-4);
	}

	.licenses-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.licenses-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
	}

	.selected-badge {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		padding: 2px 10px;
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
		letter-spacing: 0.04em;
	}

	.licenses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: var(--space-2);
	}

	.license-item {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		text-align: center;
		transition: all var(--duration-fast) var(--ease-out);
		cursor: pointer;
		font-family: inherit;
		color: inherit;
	}

	.license-item:hover {
		border-color: var(--border-hover-accent);
		background: rgba(var(--accent-rgb), 0.04);
		transform: translateY(-1px);
	}

	.license-item.selected {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.08);
		box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.15);
	}

	.license-name {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-1);
	}

	.license-item.selected .license-name {
		color: var(--accent);
	}

	.license-price {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--accent);
	}

	.license-desc {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		margin-top: var(--space-1);
	}

	/* ── Buy button ── */
	.buy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-top: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-lg);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-decoration: none;
		min-height: 44px;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.buy-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
		color: var(--bg);
		transform: translateY(-1px);
	}
</style>
