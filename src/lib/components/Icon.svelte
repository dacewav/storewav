<script lang="ts">
	import type { IconName } from '$lib/icons';

	// Lucide icons — individual imports for tree-shaking
	import Heart from 'lucide-svelte/icons/heart';
	import Play from 'lucide-svelte/icons/play';
	import Pause from 'lucide-svelte/icons/pause';
	import X from 'lucide-svelte/icons/x';
	import Search from 'lucide-svelte/icons/search';
	import Check from 'lucide-svelte/icons/check';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import CircleX from 'lucide-svelte/icons/circle-x';
	import Volume2 from 'lucide-svelte/icons/volume-2';
	import VolumeX from 'lucide-svelte/icons/volume-x';
	import Music from 'lucide-svelte/icons/music';
	import Tag from 'lucide-svelte/icons/tag';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
	import Settings from 'lucide-svelte/icons/settings';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Plus from 'lucide-svelte/icons/plus';
	import Undo2 from 'lucide-svelte/icons/undo-2';
	import Redo2 from 'lucide-svelte/icons/redo-2';
	import Save from 'lucide-svelte/icons/save';
	import Download from 'lucide-svelte/icons/download';
	import Share2 from 'lucide-svelte/icons/share-2';
	import Upload from 'lucide-svelte/icons/upload';
	import LogOut from 'lucide-svelte/icons/log-out';
	import SkipBack from 'lucide-svelte/icons/skip-back';
	import SkipForward from 'lucide-svelte/icons/skip-forward';
	import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
	import Bell from 'lucide-svelte/icons/bell';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const lucideMap: Record<string, any> = {
		heart: Heart,
		play: Play,
		pause: Pause,
		close: X,
		search: Search,
		check: Check,
		warning: TriangleAlert,
		error: CircleX,
		volumeOn: Volume2,
		volumeOff: VolumeX,
		music: Music,
		tag: Tag,
		sun: Sun,
		moon: Moon,
		chevronDown: ChevronDown,
		chevronLeft: ChevronLeft,
		chevronUp: ChevronUp,
		settings: Settings,
		edit: Pencil,
		trash: Trash2,
		plus: Plus,
		undo: Undo2,
		redo: Redo2,
		save: Save,
		export: Download,
		share: Share2,
		import: Upload,
		logout: LogOut,
		skipBack: SkipBack,
		skipForward: SkipForward,
		shoppingCart: ShoppingCart,
		bell: Bell,
	};

	// Brand icons — no Lucide equivalent, kept as inline SVG
	const brandSvgs: Record<string, (s: number) => string> = {
		whatsapp: (s) =>
			`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
		instagram: (s) =>
			`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
		youtube: (s) =>
			`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
	};

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

	let isBrand = $derived(name in brandSvgs);
	let brandSvg = $derived(isBrand ? brandSvgs[name]?.(size) ?? '' : '');
	let LucideComp = $derived(lucideMap[name]);
</script>

<span class="icon {className}" aria-hidden="true">
	{#if isBrand}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html brandSvg}
	{:else if LucideComp}
		<LucideComp {size} strokeWidth={2} fill={filled ? 'var(--accent)' : 'none'} color={filled ? 'var(--accent)' : 'currentColor'} />
	{/if}
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
