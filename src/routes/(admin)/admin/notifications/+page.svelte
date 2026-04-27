/**
 * /admin/notifications — Admin panel for sending/broadcasting notifications
 */

<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores';
	import { beatsList, type BeatWithId } from '$lib/stores/beats';
	import { toast } from '$lib/toastStore';
	import { sendNotification, notifyWishlistDiscount, notifyNewBeat, notifyPriceChange } from '$lib/stores/notifications';

	let targetType = $state<'broadcast_wishlist' | 'broadcast_all' | 'specific'>('broadcast_wishlist');
	let selectedBeatId = $state('');
	let customTitle = $state('');
	let customMessage = $state('');
	let specificUid = $state('');
	let discountPercent = $state(20);
	let sending = $state(false);
	let lastResult = $state('');

	let beats = $state<BeatWithId[]>([]);
	onMount(() => {
		const unsub = beatsList.subscribe((list) => (beats = list));
		return unsub;
	});

	let selectedBeat = $derived(beats.find((b) => b.id === selectedBeatId));

	async function handleSend() {
		if (sending) return;
		sending = true;
		lastResult = '';

		try {
			let result: number | string | null = null;

			if (targetType === 'broadcast_wishlist' && selectedBeatId) {
				result = await notifyWishlistDiscount(
					selectedBeatId,
					selectedBeat?.name || 'Beat',
					discountPercent
				);
				lastResult = `✅ Notificación enviada a ${result} usuarios con este beat en su wishlist.`;
			} else if (targetType === 'broadcast_all' && selectedBeatId) {
				result = await notifyNewBeat(selectedBeatId, selectedBeat?.name || 'Beat');
				lastResult = `✅ Notificación de nuevo beat enviada a ${result} usuarios.`;
			} else if (targetType === 'specific' && specificUid && customTitle && customMessage) {
				result = await sendNotification(specificUid, {
					type: 'system',
					title: customTitle,
					message: customMessage,
					beatId: selectedBeatId || undefined,
				});
				lastResult = result ? '✅ Notificación enviada.' : '❌ Error al enviar.';
			} else {
				lastResult = '⚠️ Completá todos los campos requeridos.';
			}
		} catch (err) {
			lastResult = `❌ Error: ${err instanceof Error ? err.message : 'unknown'}`;
		} finally {
			sending = false;
		}
		toast.show(lastResult);
	}
</script>

<svelte:head>
	<title>Notificaciones — Admin</title>
</svelte:head>

<div class="admin-notif">
	<h1>🔔 Notificaciones</h1>
	<p class="subtitle">Enviar notificaciones a usuarios.</p>

	<!-- Type selector -->
	<div class="section">
		<label class="label">Tipo de envío</label>
		<div class="radio-group">
			<label class="radio-option">
				<input type="radio" bind:group={targetType} value="broadcast_wishlist" />
				<span>🔥 Descuento en wishlist</span>
				<span class="radio-hint">Notifica a usuarios que tienen un beat en su wishlist</span>
			</label>
			<label class="radio-option">
				<input type="radio" bind:group={targetType} value="broadcast_all" />
				<span>🎵 Nuevo beat</span>
				<span class="radio-hint">Broadcast a todos los usuarios registrados</span>
			</label>
			<label class="radio-option">
				<input type="radio" bind:group={targetType} value="specific" />
				<span>⚙️ Manual / Específico</span>
				<span class="radio-hint">Enviar a un usuario específico por UID</span>
			</label>
		</div>
	</div>

	<!-- Beat selector (for wishlist + new beat) -->
	{#if targetType !== 'specific'}
		<div class="section">
			<label class="label" for="beat-select">Beat</label>
			<select id="beat-select" bind:value={selectedBeatId} class="select">
				<option value="">Seleccionar beat...</option>
				{#each beats as beat}
					<option value={beat.id}>{beat.name} — ${beat.licenses?.[0]?.priceMXN ?? 'N/A'} MXN</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Discount percent (for wishlist discount) -->
	{#if targetType === 'broadcast_wishlist'}
		<div class="section">
			<label class="label" for="discount">Porcentaje de descuento</label>
			<div class="input-row">
				<input id="discount" type="number" bind:value={discountPercent} min="5" max="90" class="input-sm" />
				<span class="input-suffix">%</span>
			</div>
			{#if selectedBeat}
				<p class="preview-text">
					🔥 "{selectedBeat.name}" con {discountPercent}% de descuento →
					${Math.round((selectedBeat.licenses?.[0]?.priceMXN ?? 0) * (1 - discountPercent / 100))} MXN
				</p>
			{/if}
		</div>
	{/if}

	<!-- Custom fields (for specific) -->
	{#if targetType === 'specific'}
		<div class="section">
			<label class="label" for="uid">UID del usuario</label>
			<input id="uid" type="text" bind:value={specificUid} class="input" placeholder="Firebase UID..." />
		</div>
		<div class="section">
			<label class="label" for="title">Título</label>
			<input id="title" type="text" bind:value={customTitle} class="input" placeholder="🔔 Título de la notificación" />
		</div>
		<div class="section">
			<label class="label" for="message">Mensaje</label>
			<textarea id="message" bind:value={customMessage} class="textarea" rows="3" placeholder="Mensaje..."></textarea>
		</div>
		<div class="section">
			<label class="label" for="beat-optional">Beat (opcional)</label>
			<select id="beat-optional" bind:value={selectedBeatId} class="select">
				<option value="">Sin beat vinculado</option>
				{#each beats as beat}
					<option value={beat.id}>{beat.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Send button -->
	<button class="send-btn" onclick={handleSend} disabled={sending}>
		{sending ? '⏳ Enviando...' : '📤 Enviar notificación'}
	</button>

	{#if lastResult}
		<div class="result" class:error={lastResult.startsWith('❌') || lastResult.startsWith('⚠️')}>
			{lastResult}
		</div>
	{/if}
</div>

<style>
	.admin-notif {
		max-width: 640px;
	}

	h1 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-1);
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin-bottom: var(--space-6);
	}

	.section {
		margin-bottom: var(--space-5);
	}

	.label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: var(--space-2);
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.radio-option {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.radio-option:hover {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.04);
	}

	.radio-option input[type="radio"] {
		accent-color: var(--accent);
	}

	.radio-hint {
		width: 100%;
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-left: calc(var(--space-2) + 16px);
	}

	.select, .input, .textarea {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--text);
		font-size: var(--text-sm);
		transition: border-color var(--duration-fast);
	}

	.select:focus, .input:focus, .textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.input-sm {
		width: 100px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--text);
		font-size: var(--text-sm);
	}

	.input-suffix {
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	.preview-text {
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		color: var(--accent);
		font-weight: 500;
	}

	.send-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-5);
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: opacity var(--duration-fast);
	}

	.send-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.send-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.result {
		margin-top: var(--space-4);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		background: rgba(var(--accent-rgb), 0.08);
		border: 1px solid rgba(var(--accent-rgb), 0.2);
	}

	.result.error {
		background: var(--danger-glow);
		border-color: var(--danger-dim);
	}
</style>
