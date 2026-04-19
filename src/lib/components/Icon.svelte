<script lang="ts">
	import { icons, type IconName } from '$lib/icons';

	let {
		name,
		size = 14,
		filled = false,
		class: className = ''
	}: {
		name: IconName;
		size?: number;
		filled?: boolean;
		class?: string;
	} = $props();

	function getSvg(iconName: IconName, s: number, f: boolean): string {
		if (iconName === 'heart') return icons.heart(f, s);
		if (iconName === 'play') return icons.play(s);
		if (iconName === 'pause') return icons.pause(s);
		const fn = icons[iconName] as ((s: number) => string) | undefined;
		return fn?.(s) ?? '';
	}

	let svg = $derived(getSvg(name, size, filled));
</script>

<span class="icon {className}" aria-hidden="true">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html svg}
</span>

<style>
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		line-height: 0;
	}
</style>
