<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	onMount(() => goto('/admin/features', { replaceState: true }));
</script>
<p>Redirigiendo...</p>
