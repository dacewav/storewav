<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	onMount(() => goto('/admin/floating', { replaceState: true }));
</script>
<p>Redirigiendo a Banner & Floating...</p>
