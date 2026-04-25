<script lang="ts">
	/**
	 * AdminSkeleton — shimmer placeholder for admin settings pages.
	 * Shows realistic layout with cards, sliders, and inputs.
	 */
	let {
		variant = 'full' // 'full' | 'card' | 'sliders'
	}: {
		variant?: 'full' | 'card' | 'sliders';
	} = $props();
</script>

{#if variant === 'full'}
	<div class="skel-admin">
		<div class="skel-title"></div>
		<div class="skel-desc"></div>
		{#each [1, 2, 3] as _}
			<div class="skel-card">
				<div class="skel-card-title"></div>
				{#each [1, 2, 3] as _}
					<div class="skel-field">
						<div class="skel-label"></div>
						<div class="skel-input"></div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
{:else if variant === 'card'}
	<div class="skel-card">
		<div class="skel-card-title"></div>
		{#each [1, 2] as _}
			<div class="skel-field">
				<div class="skel-label"></div>
				<div class="skel-input"></div>
			</div>
		{/each}
	</div>
{:else}
	<div class="skel-card">
		{#each [1, 2, 3, 4] as _}
			<div class="skel-field">
				<div class="skel-label"></div>
				<div class="skel-slider"></div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.skel-admin { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-4); }

	.skel-title {
		height: 28px; width: 200px; border-radius: var(--radius-md);
		background: linear-gradient(90deg, var(--surface2, #222) 25%, rgba(var(--accent-rgb), 0.04) 50%, var(--surface2, #222) 75%);
		background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
	}
	.skel-desc {
		height: 14px; width: 350px; border-radius: var(--radius-sm);
		background: linear-gradient(90deg, var(--surface2, #222) 25%, rgba(var(--accent-rgb), 0.04) 50%, var(--surface2, #222) 75%);
		background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
	}

	.skel-card {
		background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg, 12px);
		padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4);
	}
	.skel-card-title {
		height: 16px; width: 120px; border-radius: var(--radius-sm);
		background: linear-gradient(90deg, var(--surface2, #222) 25%, rgba(var(--accent-rgb), 0.04) 50%, var(--surface2, #222) 75%);
		background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
	}

	.skel-field { display: flex; flex-direction: column; gap: var(--space-2); }
	.skel-label {
		height: 10px; width: 80px; border-radius: var(--radius-sm);
		background: linear-gradient(90deg, var(--surface2, #222) 25%, rgba(var(--accent-rgb), 0.04) 50%, var(--surface2, #222) 75%);
		background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
	}
	.skel-input {
		height: 40px; border-radius: var(--radius-md);
		background: linear-gradient(90deg, var(--surface2, #222) 25%, rgba(var(--accent-rgb), 0.04) 50%, var(--surface2, #222) 75%);
		background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
	}
	.skel-slider {
		height: 8px; border-radius: 4px; margin-top: var(--space-2);
		background: linear-gradient(90deg, var(--surface2, #222) 25%, rgba(var(--accent-rgb), 0.04) 50%, var(--surface2, #222) 75%);
		background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: -200% 0; }
		100% { background-position: 200% 0; }
	}
</style>
