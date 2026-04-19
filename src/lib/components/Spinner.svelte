<script lang="ts">
	let {
		size = 'md',
		color = 'accent'
	}: {
		size?: 'sm' | 'md' | 'lg';
		color?: 'accent' | 'current';
	} = $props();

	const sizes = { sm: 14, md: 20, lg: 28 };
</script>

<svg
	class="spinner spinner-{color}"
	width={sizes[size]}
	height={sizes[size]}
	viewBox="0 0 24 24"
	fill="none"
>
	<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" opacity="0.2"/>
	<path d="M12 2a10 10 0 0110 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</svg>

<style>
	.spinner {
		animation: spin 700ms linear infinite;
		flex-shrink: 0;
	}

	.spinner-accent {
		color: var(--accent);
	}

	.spinner-current {
		color: currentColor;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
