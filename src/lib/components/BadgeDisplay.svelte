<script lang="ts">
	/**
	 * BadgeDisplay — Shows earned badges with tooltips
	 * Badges: first-beat, fan, super-fan, vocal, early-bird, vip
	 */

	let {
		badges = [],
		compact = false
	}: {
		badges?: string[];
		compact?: boolean;
	} = $props();

	const BADGE_INFO: Record<string, { emoji: string; label: string; desc: string }> = {
		'first-beat': { emoji: '🎵', label: 'Primer Beat', desc: 'Compró su primer beat' },
		'fan': { emoji: '❤️', label: 'Fan', desc: '10+ likes dados' },
		'super-fan': { emoji: '🔥', label: 'Super Fan', desc: '5+ compras realizadas' },
		'vocal': { emoji: '💬', label: 'Vocal', desc: '10+ comentarios' },
		'early-bird': { emoji: '⭐', label: 'Early Bird', desc: 'Usuario desde el inicio' },
		'vip': { emoji: '👑', label: 'VIP', desc: 'Miembro VIP' },
	};

	let displayBadges = $derived(
		badges
			.filter(b => BADGE_INFO[b])
			.map(b => ({ id: b, ...BADGE_INFO[b] }))
	);
</script>

{#if displayBadges.length > 0}
	<div class="badge-display" class:compact>
		{#each displayBadges as badge (badge.id)}
			<div class="badge-item" title="{badge.label}: {badge.desc}">
				<span class="badge-emoji">{badge.emoji}</span>
				{#if !compact}
					<span class="badge-label">{badge.label}</span>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.badge-display {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.badge-display.compact {
		gap: var(--space-1);
	}

	.badge-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background: rgba(var(--accent-rgb), 0.08);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		transition: all var(--duration-fast);
		cursor: default;
	}

	.badge-item:hover {
		border-color: rgba(var(--accent-rgb), 0.4);
		background: rgba(var(--accent-rgb), 0.12);
		transform: translateY(-1px);
	}

	.badge-emoji {
		font-size: var(--text-sm);
	}

	.badge-label {
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.compact .badge-item {
		padding: 2px 6px;
	}

	.compact .badge-emoji {
		font-size: var(--text-xs);
	}
</style>
