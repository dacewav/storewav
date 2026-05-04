<script lang="ts">
	import { auth } from '$lib/stores';
	import { settings } from '$lib/stores';
	import { FIREBASE_DB } from '$lib/firebaseDb';

	let authState = $derived($auth);
	let user = $derived(authState.user);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	/** Get auth token for API calls */
	async function getAuthToken(): Promise<string | null> {
		try {
			const { getAuthInstance } = await import('$lib/firebase');
			const auth = await getAuthInstance();
			return await auth?.currentUser?.getIdToken() ?? null;
		} catch {
			return null;
		}
	}

	let profile = $state({
		artistName: '',
		username: '',
		bio: '',
		country: '',
		instagram: '',
		youtube: '',
		spotify: '',
		phone: '',
		avatarURL: '',
		bannerURL: '',
	});

	let loading = $state(true);
	let saving = $state(false);
	let saveMsg = $state('');
	let saveMsgType = $state<'success' | 'error' | ''>('');
	let usernameError = $state('');
	let checkingUsername = $state(false);

	// Avatar upload state
	let avatarUploading = $state(false);
	let avatarPreview = $state('');
	let avatarFileInput: HTMLInputElement | undefined = $state();

	// Banner upload state
	let bannerUploading = $state(false);
	let bannerPreview = $state('');
	let bannerFileInput: HTMLInputElement | undefined = $state();

	// Derived avatar: uploaded > profile > Google > placeholder
	let displayAvatar = $derived(
		avatarPreview || profile.avatarURL || user?.photoURL || ''
	);

	let displayBanner = $derived(bannerPreview || profile.bannerURL || '');

	let originalUsername = $state('');

	async function loadProfile() {
		if (!user) return;
		loading = true;
		try {
			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const resp = await fetch(`${FIREBASE_DB}/users/${user.uid}.json${authParam}`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					profile.artistName = data.artistName || '';
					profile.username = data.username || '';
					originalUsername = data.username || '';
					profile.bio = data.bio || '';
					profile.country = data.country || '';
					profile.instagram = data.socials?.instagram || '';
					profile.youtube = data.socials?.youtube || '';
					profile.spotify = data.socials?.spotify || '';
					profile.phone = data.phone || '';
					profile.avatarURL = data.avatarURL || '';
					profile.bannerURL = data.bannerURL || '';
				}
			}
		} catch (err) {
			console.error('[Profile] Load failed:', err);
		} finally {
			loading = false;
		}
	}

	/** Resize image to square (center crop) via canvas */
	function cropToSquare(file: File): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const size = Math.min(img.width, img.height);
				const sx = (img.width - size) / 2;
				const sy = (img.height - size) / 2;
				const canvas = document.createElement('canvas');
				canvas.width = 400;
				canvas.height = 400;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
				canvas.toBlob((blob) => {
					if (blob) resolve(blob);
					else reject(new Error('Canvas conversion failed'));
				}, 'image/jpeg', 0.85);
			};
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = URL.createObjectURL(file);
		});
	}

	/** Resize image to banner aspect (3:1 center crop) via canvas */
	function cropToBanner(file: File): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const targetRatio = 3;
				const imgRatio = img.width / img.height;
				let sx = 0, sy = 0, sw = img.width, sh = img.height;
				if (imgRatio > targetRatio) {
					// Too wide — crop sides
					sw = img.height * targetRatio;
					sx = (img.width - sw) / 2;
				} else {
					// Too tall — crop top/bottom
					sh = img.width / targetRatio;
					sy = (img.height - sh) / 2;
				}
				const canvas = document.createElement('canvas');
				canvas.width = 1200;
				canvas.height = 400;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1200, 400);
				canvas.toBlob((blob) => {
					if (blob) resolve(blob);
					else reject(new Error('Canvas conversion failed'));
				}, 'image/jpeg', 0.85);
			};
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = URL.createObjectURL(file);
		});
	}

	async function handleAvatarSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		avatarPreview = URL.createObjectURL(file);
		avatarUploading = true;
		try {
			const cropped = await cropToSquare(file);
			const croppedFile = new File([cropped], 'avatar.jpg', { type: 'image/jpeg' });

			const { getAuthInstance } = await import('$lib/firebase');
			const authInstance = await getAuthInstance();
			const token = await authInstance?.currentUser?.getIdToken();
			if (!token) throw new Error('No autenticado');

			const formData = new FormData();
			formData.append('file', croppedFile);
			const resp = await fetch('/api/upload/avatar', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});

			const data = await resp.json();
			if (!data.ok) throw new Error(data.error || 'Upload falló');

			profile.avatarURL = data.url;
			avatarPreview = data.url;

			const authToken = await getAuthToken();
			const authP = authToken ? `?auth=${authToken}` : '';
			await fetch(`${FIREBASE_DB}/users/${user!.uid}/avatarURL.json${authP}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data.url),
			});

			saveMsg = 'Avatar actualizado';
			saveMsgType = 'success';
		} catch (err) {
			saveMsg = err instanceof Error ? err.message : 'Error al subir avatar';
			saveMsgType = 'error';
			avatarPreview = '';
		} finally {
			avatarUploading = false;
			setTimeout(() => { saveMsg = ''; }, 3000);
		}
	}

	async function handleBannerSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		bannerPreview = URL.createObjectURL(file);
		bannerUploading = true;
		try {
			const cropped = await cropToBanner(file);
			const croppedFile = new File([cropped], 'banner.jpg', { type: 'image/jpeg' });

			const { getAuthInstance } = await import('$lib/firebase');
			const authInstance = await getAuthInstance();
			const token = await authInstance?.currentUser?.getIdToken();
			if (!token) throw new Error('No autenticado');

			const formData = new FormData();
			formData.append('file', croppedFile);
			const resp = await fetch('/api/upload/banner', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});

			const data = await resp.json();
			if (!data.ok) throw new Error(data.error || 'Upload falló');

			profile.bannerURL = data.url;
			bannerPreview = data.url;

			const authToken = await getAuthToken();
			const authP = authToken ? `?auth=${authToken}` : '';
			await fetch(`${FIREBASE_DB}/users/${user!.uid}/bannerURL.json${authP}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data.url),
			});

			saveMsg = 'Banner actualizado';
			saveMsgType = 'success';
		} catch (err) {
			saveMsg = err instanceof Error ? err.message : 'Error al subir banner';
			saveMsgType = 'error';
			bannerPreview = '';
		} finally {
			bannerUploading = false;
			setTimeout(() => { saveMsg = ''; }, 3000);
		}
	}

	/** Check username uniqueness against Firebase */
	async function checkUsernameUnique(username: string): Promise<boolean> {
		if (!username || username === originalUsername) return true;
		try {
			const resp = await fetch(`${FIREBASE_DB}/users.json?orderBy="username"&equalTo="${username}"&limitToFirst=1`);
			if (resp.ok) {
				const data = await resp.json();
				return !data || Object.keys(data).length === 0;
			}
		} catch {}
		return true;
	}

	let usernameDebounce: ReturnType<typeof setTimeout> | undefined;

	function onUsernameInput() {
		usernameError = '';
		clearTimeout(usernameDebounce);
		const val = profile.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
		profile.username = val;

		if (val.length < 3) {
			if (val.length > 0) usernameError = 'Mínimo 3 caracteres';
			return;
		}

		checkingUsername = true;
		usernameDebounce = setTimeout(async () => {
			const unique = await checkUsernameUnique(val);
			usernameError = unique ? '' : 'Este username ya está en uso';
			checkingUsername = false;
		}, 500);
	}

	async function saveProfile() {
		if (!user) return;

		// Validate username before save
		if (profile.username && profile.username !== originalUsername) {
			const unique = await checkUsernameUnique(profile.username);
			if (!unique) {
				usernameError = 'Este username ya está en uso';
				return;
			}
		}

		saving = true;
		saveMsg = '';
		try {
			const data = {
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				avatarURL: profile.avatarURL || null,
				bannerURL: profile.bannerURL || null,
				artistName: profile.artistName.trim(),
				username: profile.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
				bio: profile.bio.trim().slice(0, 160),
				country: profile.country.trim(),
				phone: profile.phone.trim(),
				socials: {
					instagram: profile.instagram.trim(),
					youtube: profile.youtube.trim(),
					spotify: profile.spotify.trim(),
				},
				updatedAt: Date.now(),
			};

			const token = await getAuthToken();
			const authParam = token ? `?auth=${token}` : '';
			const resp = await fetch(`${FIREBASE_DB}/users/${user.uid}.json${authParam}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (resp.ok) {
				originalUsername = data.username;
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
		<!-- Banner section -->
		<div class="banner-section">
			<button class="banner-wrapper" onclick={() => bannerFileInput?.click()} disabled={bannerUploading}>
				{#if displayBanner}
					<img src={displayBanner} alt="" class="banner-img" loading="lazy" decoding="async" />
				{:else}
					<div class="banner-placeholder">
						<span>🖼️ Click para subir banner</span>
					</div>
				{/if}
				{#if bannerUploading}
					<div class="banner-overlay">⏳ Subiendo...</div>
				{:else}
					<div class="banner-overlay">📷 Cambiar banner</div>
				{/if}
			</button>
			<input
				type="file"
				accept="image/*"
				class="hidden-input"
				bind:this={bannerFileInput}
				onchange={handleBannerSelect}
			/>
			<span class="banner-hint">3:1 ratio recomendado (1200×400px). Máx 4MB.</span>
		</div>

		<!-- Avatar section -->
		<div class="avatar-section">
			<button class="avatar-wrapper" onclick={() => avatarFileInput?.click()} disabled={avatarUploading}>
				{#if displayAvatar}
					<img src={displayAvatar} alt="Avatar" class="avatar-img" loading="lazy" decoding="async" />
				{:else}
					<div class="avatar-placeholder">
						{(profile.artistName || user?.displayName || user?.email || '?')[0].toUpperCase()}
					</div>
				{/if}
				{#if avatarUploading}
					<div class="avatar-overlay">⏳</div>
				{:else}
					<div class="avatar-overlay">📷</div>
				{/if}
			</button>
			<input
				type="file"
				accept="image/*"
				class="hidden-input"
				bind:this={avatarFileInput}
				onchange={handleAvatarSelect}
			/>
			<div class="avatar-info">
				<span class="avatar-name">{user?.displayName || 'Usuario'}</span>
				<span class="avatar-hint">Click para cambiar avatar</span>
			</div>
		</div>

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
						<span>Username (@handle)</span>
						<div class="username-input-wrap">
							<span class="username-prefix">@</span>
							<input
								type="text"
								class="username-input"
								bind:value={profile.username}
								oninput={onUsernameInput}
								placeholder="dacewav"
								maxlength="24"
								pattern="[a-z0-9_-]+"
							/>
							{#if checkingUsername}
								<span class="username-status checking">⏳</span>
							{:else if usernameError}
								<span class="username-status error">✕</span>
							{:else if profile.username && profile.username.length >= 3}
								<span class="username-status ok">✓</span>
							{/if}
						</div>
						{#if usernameError}
							<span class="field-error">{usernameError}</span>
						{:else}
							<span class="field-hint">Solo letras, números, guiones. Se usa para tu URL pública.</span>
						{/if}
					</label>
					<label>
						<span>Bio (máx. 160 chars)</span>
						<textarea bind:value={profile.bio} placeholder="Contá quién sos..." maxlength="160" rows="2"></textarea>
						<span class="field-hint">{profile.bio.length}/160</span>
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
				<button class="save-btn" type="submit" disabled={saving || !!usernameError}>
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

	input, textarea {
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

	textarea {
		resize: vertical;
		min-height: 60px;
	}

	input:focus, textarea:focus {
		border-color: var(--accent);
	}

	.field-hint {
		font-size: var(--text-2xs);
		color: var(--text-hint);
		font-family: var(--font-mono);
	}

	.field-error {
		font-size: var(--text-2xs);
		color: #ef4444;
		font-family: var(--font-mono);
	}

	/* Username input */
	.username-input-wrap {
		display: flex;
		align-items: center;
		gap: 0;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		transition: border-color var(--duration-fast);
	}

	.username-input-wrap:focus-within {
		border-color: var(--accent);
	}

	.username-prefix {
		padding-left: var(--space-3);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		user-select: none;
	}

	.username-input {
		border: none !important;
		background: transparent !important;
		padding-left: var(--space-1);
		flex: 1;
	}

	.username-status {
		padding-right: var(--space-3);
		font-size: var(--text-sm);
	}

	.username-status.checking { color: var(--text-muted); }
	.username-status.ok { color: #22c55e; }
	.username-status.error { color: #ef4444; }

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

	/* Banner */
	.banner-section {
		margin-bottom: var(--space-4);
	}

	.banner-wrapper {
		position: relative;
		width: 100%;
		height: 160px;
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		border: 2px dashed var(--border);
		background: var(--surface);
		padding: 0;
		transition: border-color var(--duration-fast);
	}

	.banner-wrapper:hover {
		border-color: var(--accent);
	}

	.banner-wrapper:disabled {
		cursor: wait;
	}

	.banner-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.banner-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}

	.banner-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		opacity: 0;
		transition: opacity var(--duration-fast);
		font-size: var(--text-sm);
		color: white;
		font-family: var(--font-mono);
	}

	.banner-wrapper:hover .banner-overlay {
		opacity: 1;
	}

	.banner-hint {
		display: block;
		margin-top: var(--space-1);
		font-size: var(--text-2xs);
		color: var(--text-hint);
		font-family: var(--font-mono);
	}

	/* Avatar */
	.avatar-section {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
		padding: var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.avatar-wrapper {
		position: relative;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid var(--border);
		background: var(--bg);
		padding: 0;
		flex-shrink: 0;
		transition: border-color var(--duration-fast);
	}

	.avatar-wrapper:hover {
		border-color: var(--accent);
	}

	.avatar-wrapper:disabled {
		cursor: wait;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
		font-size: var(--text-2xl);
		font-weight: 700;
		font-family: var(--font-mono);
	}

	.avatar-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		opacity: 0;
		transition: opacity var(--duration-fast);
		font-size: 1.5rem;
	}

	.avatar-wrapper:hover .avatar-overlay {
		opacity: 1;
	}

	.avatar-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.avatar-name {
		font-weight: 600;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.avatar-hint {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.hidden-input {
		display: none;
	}
</style>
