<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	onMount(() => goto('/admin/hero', { replaceState: true }));
</script>

<p>Redirigiendo a Hero & Contenido...</p>
