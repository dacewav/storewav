<script lang="ts">
	import { auth } from '$lib/stores';

	let authState = $derived($auth);
	let user = $derived(authState.user);
</script>

<div class="profile-section">
	<h2>Mi perfil</h2>

	<div class="profile-card">
		<div class="profile-field">
			<span class="field-label">Nombre</span>
			<span class="field-value">{user?.displayName || '—'}</span>
		</div>
		<div class="profile-field">
			<span class="field-label">Email</span>
			<span class="field-value">{user?.email || '—'}</span>
		</div>
		<div class="profile-field">
			<span class="field-label">UID</span>
			<span class="field-value mono">{user?.uid?.slice(0, 12) || '—'}...</span>
		</div>
	</div>

	<div class="profile-note">
		<p>Para editar tu nombre o avatar, actualizá tu perfil de Google.</p>
	</div>
</div>

<style>
	.profile-section h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.profile-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.profile-field {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--border);
	}

	.profile-field:last-child {
		border-bottom: none;
	}

	.field-label {
		font-size: var(--text-sm);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.field-value {
		font-size: var(--text-sm);
		color: var(--text);
		font-weight: 600;
	}

	.field-value.mono {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.profile-note {
		margin-top: var(--space-4);
		padding: var(--space-3);
		background: var(--surface);
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
	}

	.profile-note p {
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin: 0;
	}
</style>
