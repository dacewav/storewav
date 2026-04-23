<script lang="ts">
	import type { Testimonial } from '$lib/stores/settings';
	import { reveal } from '$lib/actions';

	let {
		items = [],
		title = 'Lo que dicen'
	}: {
		items?: Testimonial[];
		title?: string;
	} = $props();

	function renderStars(count: number): string {
		return '★'.repeat(Math.min(count, 5)) + '☆'.repeat(Math.max(5 - count, 0));
	}
</script>

{#if items.length > 0}
<section class="testimonials" use:reveal={{}}>
	{#if title}
		<div class="test-header">
			<h3 class="test-title">{title}</h3>
			<div class="test-line"></div>
		</div>
	{/if}
	<div class="test-grid">
		{#each items as t, i (i)}
			<div class="test-card">
				{#if t.stars}
					<div class="test-stars">{renderStars(t.stars)}</div>
				{:else if t.role}
					<div class="test-role">{t.role}</div>
				{/if}
				<p class="test-text">"{t.text}"</p>
				<div class="test-author">
					{#if t.avatar}
						<img class="test-avatar" src={t.avatar} alt={t.name} loading="lazy" />
					{:else}
						<div class="test-avatar-placeholder">{t.name.charAt(0)}</div>
					{/if}
					<span class="test-name">{t.name}</span>
				</div>
			</div>
		{/each}
	</div>
</section>
{/if}

<style>
	.testimonials {
		position: relative;
		z-index: var(--z-content);
		padding: var(--section-padding) var(--container-padding);
		border-top: 1px solid var(--border);
	}

	.test-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.test-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.test-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, var(--border), rgba(var(--accent-rgb), 0.08));
	}

	.test-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--beat-gap);
	}

	.test-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--card-radius);
		padding: var(--space-5);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.test-card:hover {
		border-color: var(--border-hover-accent);
		transform: translateY(-2px);
	}

	.test-stars {
		font-size: var(--text-sm);
		color: var(--accent);
		letter-spacing: 2px;
		margin-bottom: var(--space-3);
	}

	.test-role {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--accent);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: var(--space-3);
	}

	.test-text {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.8;
		margin-bottom: var(--space-4);
		font-style: italic;
	}

	.test-author {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.test-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.test-avatar-placeholder {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
	}

	.test-name {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	@media (max-width: 480px) {
		.test-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
