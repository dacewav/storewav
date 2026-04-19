<script lang="ts">
	import type { Beat } from '$lib/stores/beats';
	import { Modal, Badge } from '$lib/components';
	import { player, wishlist } from '$lib/stores';
	import Waveform from './Waveform.svelte';

	let {
		open = $bindable(false),
		beat
	}: {
		open?: boolean;
		beat: (Beat & { id: string }) | null;
	} = $props();

	let inWishlist = $derived(beat ? wishlist.isIn(beat.id) : null);

	function handlePlay() {
		if (!beat) return;
		player.play({
			id: beat.id,
			title: beat.title,
			artist: beat.artist,
			coverUrl: beat.coverUrl,
			audioUrl: beat.audioUrl
		});
	}

	const licenseLabels: Record<string, string> = {
		basic: 'Basic',
		premium: 'Premium',
		unlimited: 'Unlimited',
		exclusive: 'Exclusive'
	};
</script>

{#if beat}
	<Modal bind:open title={beat.title} maxWidth="700px">
		<div class="modal-beat">
			<!-- Cover -->
			<div class="beat-cover">
				{#if beat.coverUrl}
					<img src={beat.coverUrl} alt={beat.title} />
				{:else}
					<div class="beat-cover-placeholder">🎵</div>
				{/if}
			</div>

			<!-- Info -->
			<div class="beat-header">
				<div>
					<h2 class="beat-title">{beat.title}</h2>
					<p class="beat-artist">{beat.artist}</p>
				</div>
				<button class="beat-wish-btn" class:active={$inWishlist} onclick={() => beat && wishlist.toggle(beat.id)} aria-label="Favoritos">
					{#if $inWishlist}
						<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
					{:else}
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
					{/if}
				</button>
			</div>

			<!-- Meta badges -->
			<div class="beat-badges">
				<Badge variant="default">{beat.genre}</Badge>
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
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
				Escuchar preview
			</button>

			<!-- Licenses -->
			{#if beat.licenses}
				<div class="licenses">
					<div class="licenses-title">Licencias</div>
					<div class="licenses-grid">
						{#each Object.entries(beat.licenses) as [key, price]}
							<div class="license-item">
								<div class="license-name">{licenseLabels[key] ?? key}</div>
								<div class="license-price">${price}</div>
							</div>
						{/each}
					</div>
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

	.beat-cover {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--surface2);
	}

	.beat-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.beat-cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		opacity: 0.3;
	}

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
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.beat-wish-btn:hover {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	.beat-wish-btn.active {
		border-color: rgba(var(--accent-rgb), 0.3);
		color: var(--accent);
	}

	.beat-badges {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.beat-waveform {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

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
		transition: all 0.2s;
		min-height: 52px;
	}

	.beat-play-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-accent);
	}

	.licenses {
		border-top: 1px solid var(--border);
		padding-top: var(--space-4);
	}

	.licenses-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-3);
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
		transition: all 0.15s;
		cursor: pointer;
	}

	.license-item:hover {
		border-color: var(--border-hover-accent);
		background: rgba(var(--accent-rgb), 0.05);
	}

	.license-name {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-1);
	}

	.license-price {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 800;
		color: var(--accent);
	}
</style>
