<script lang="ts">
	import { auth } from '$lib/stores';
	import { settings } from '$lib/stores';

	let authState = $derived($auth);
	let user = $derived(authState.user);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

	let profile = $state({
		artistName: '',
		country: '',
		instagram: '',
		youtube: '',
		spotify: '',
		phone: '',
	});

	let loading = $state(true);
	let saving = $state(false);
	let saveMsg = $state('');
	let saveMsgType = $state<'success' | 'error'>('');

	async function loadProfile() {
		if (!user) return;
		loading = true;
		try {
			const resp = await fetch(`${FIREBASE_DB}/users/${user.uid}.json`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					profile.artistName = data.artistName || '';
					profile.country = data.country || '';
					profile.instagram = data.socials?.instagram || '';
					profile.youtube = data.socials?.youtube || '';
					profile.spotify = data.socials?.spotify || '';
					profile.phone = data.phone || '';
				}
			}
		} catch (err) {
			console.error('[Profile] Load failed:', err);
		} finally {
			loading = false;
		}
	}

	async function saveProfile() {
		if (!user) return;
		saving = true;
		saveMsg = '';
		try {
			const data = {
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				artistName: profile.artistName.trim(),
				country: profile.country.trim(),
				phone: profile.phone.trim(),
				socials: {
					instagram: profile.instagram.trim(),
					youtube: profile.youtube.trim(),
					spotify: profile.spotify.trim(),
				},
				updatedAt: Date.now(),
			};

			// Merge with existing (don't overwrite createdAt)
			const resp = await fetch(`${FIREBASE_DB}/users/${user.uid}.json`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (resp.ok) {
				saveMsg = 'Perfil guardado';
				saveMsgType = 'success';
			} else {
				saveMsg = 'Error al guardar';
				saveMsgType = 'error';
			}
		} catch {
			saveMsg = 'Error de conexión';
			saveMsgType = 'error';
		} finally {
			saving = false;
			setTimeout(() => { saveMsg = ''; }, 3000);
		}
	}

	// Load on mount
	$effect(() => {
		if (user) loadProfile();
	});
</script>

<div class="profile-section">
	<h2>✏️ Editar perfil</h2>
	<p class="profile-desc">Completá tu info para que los productores te conozcan.</p>

	{#if loading}
		<div class="profile-loading">Cargando perfil...</div>
	{:else}
		<form class="profile-form" onsubmit={(e) => { e.preventDefault(); saveProfile(); }}>
			<!-- Artist info -->
			<fieldset>
				<legend>🎤 Artista</legend>
				<div class="fields">
					<label>
						<span>Nombre artístico</span>
						<input type="text" bind:value={profile.artistName} placeholder="Ej: JP" />
					</label>
					<label>
						<span>País</span>
						<input type="text" bind:value={profile.country} placeholder="Ej: México" />
					</label>
					<label>
						<span>Teléfono</span>
						<input type="tel" bind:value={profile.phone} placeholder="+52 ..." />
					</label>
				</div>
			</fieldset>

			<!-- Socials -->
			<fieldset>
				<legend>📱 Redes sociales</legend>
				<div class="fields">
					<label>
						<span>Instagram</span>
						<input type="text" bind:value={profile.instagram} placeholder="@usuario" />
					</label>
					<label>
						<span>YouTube</span>
						<input type="text" bind:value={profile.youtube} placeholder="Canal" />
					</label>
					<label>
						<span>Spotify</span>
						<input type="text" bind:value={profile.spotify} placeholder="Artista" />
					</label>
				</div>
			</fieldset>

			<div class="profile-actions">
				<button class="save-btn" type="submit" disabled={saving}>
					{#if saving}
						⏳ Guardando...
					{:else}
						💾 Guardar perfil
					{/if}
				</button>
				{#if saveMsg}
					<span class="save-msg" class:success={saveMsgType === 'success'} class:error={saveMsgType === 'error'}>
						{saveMsg}
					</span>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style>
	.profile-section h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-1);
	}

	.profile-desc {
		font-size: var(--text-sm);
		color: var(--text-muted);
		margin-bottom: var(--space-6);
	}

	.profile-loading {
		text-align: center;
		padding: var(--space-8);
		color: var(--text-muted);
	}

	.profile-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	fieldset {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	legend {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
		padding: 0 var(--space-2);
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	label span {
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	input {
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		outline: none;
		transition: border-color var(--duration-fast);
	}

	input:focus {
		border-color: var(--accent);
	}

	.profile-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.save-btn {
		padding: var(--space-3) var(--space-6);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.save-btn:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.save-msg {
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-sm);
	}

	.save-msg.success {
		color: #22c55e;
		background: rgba(34, 197, 94, 0.1);
	}

	.save-msg.error {
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}
</style>
