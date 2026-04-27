<script lang="ts">
	import { Icon } from '$lib/components';
	import { auth, loginWithGoogle, loginWithEmailLink, completeEmailLinkSignIn, loginAnonymously, settings } from '$lib/stores';
	import { goto } from '$app/navigation';
	import type { LabelSettings } from '$lib/stores/settings';

	let loading = $state(false);
	let error = $state('');
	let emailMode = $state(false);
	let email = $state('');
	let emailSent = $state(false);
	let authState = $derived($auth);
	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');
	let labels = $derived(($settings.data?.labels ?? {}) as LabelSettings);

	// Login labels (from settings or defaults)
	let loginTitle = $derived(labels.loginTitle ?? 'Admin');
	let loginSub = $derived(labels.loginSub ?? 'Inicia sesión para acceder al panel');
	let loginBtn = $derived(labels.loginBtn ?? 'Continuar con Google');
	let loginBack = $derived(labels.loginBack ?? '← Volver a la tienda');
	let loginNote = $derived(labels.loginNote ?? 'Solo administradores autorizados');

	// Check for email link completion on mount
	let emailLinkChecked = $state(false);
	$effect(() => {
		if (emailLinkChecked) return;
		emailLinkChecked = true;
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('complete') === 'email') {
			completeEmailLinkSignIn().then((email) => {
				if (email) {
					emailSent = false;
					// User is now logged in, auth state will redirect
				}
			});
		}
	});

	// Si ya está logueado, redirigir al admin (run once)
	let redirected = $state(false);
	$effect(() => {
		if (!redirected && authState.user && authState.isAdmin) {
			redirected = true;
			goto('/admin');
		}
	});

	async function handleGoogleLogin() {
		loading = true;
		error = '';
		try {
			await loginWithGoogle();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al iniciar sesión';
		}
		loading = false;
	}

	async function handleAnonLogin() {
		loading = true;
		error = '';
		try {
			await loginAnonymously();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al iniciar sesión anónima';
		}
		loading = false;
	}

	async function handleEmailLogin() {
		if (!email.trim()) return;
		loading = true;
		error = '';
		try {
			await loginWithEmailLink(email.trim());
			emailSent = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error al enviar el link';
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Login — {brandName}</title>
	<meta name="description" content="Inicia sesión en {brandName} para comprar beats, gestionar tu biblioteca y acceder a contenido exclusivo." />
	<meta property="og:title" content="Login — {brandName}" />
	<meta property="og:description" content="Accede a tu cuenta de {brandName}." />
</svelte:head>

<div class="login-page">
	<div class="login-bg">
		<div class="login-orb login-orb-1"></div>
		<div class="login-orb login-orb-2"></div>
	</div>

	<div class="login-card">
		<div class="login-brand">
			<span class="brand-text">{brandName}</span>
			<span class="brand-dot">.</span>
		</div>

		<div class="login-header">
			<h1 class="login-title">{loginTitle}</h1>
			<p class="login-sub">{loginSub}</p>
		</div>

		{#if error}
			<div class="login-error" role="alert">
				<Icon name="error" size={14} />
				{error}
			</div>
		{/if}

		{#if authState.user && !authState.isAdmin}
			<div class="uid-display">
				<p class="uid-label">Tu UID (copialo y agregalo como admin):</p>
				<code class="uid-code">{authState.user.uid}</code>
			</div>
		{/if}

		{#if authState.user && authState.isAdmin}
			<div class="uid-display" style="border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.08);">
				<p class="uid-label" style="color: #22c55e;">✅ Sos admin — </p>
				<a href="/admin" class="uid-link">Ir al panel →</a>
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleGoogleLogin(); }}>
			<button class="google-btn" type="submit" disabled={loading}>
				{#if loading && !emailMode}
					<span class="g-spinner"></span>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
					</svg>
				{/if}
				<span>{loginBtn}</span>
			</button>
		</form>

		<!-- Divider -->
		<div class="login-divider">
			<span>o</span>
		</div>

		<!-- Email link (passwordless) -->
		{#if emailSent}
			<div class="email-sent">
				<div class="email-sent-icon">📧</div>
				<p>Te enviamos un link a <strong>{email}</strong></p>
				<p class="email-sent-hint">Revisá tu bandeja de entrada y hacé click en el link para ingresar.</p>
			</div>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); emailMode = true; handleEmailLogin(); }}>
				<div class="email-row">
					<input
						type="email"
						class="email-input"
						placeholder="tu@email.com"
						bind:value={email}
						disabled={loading}
						required
					/>
					<button class="email-btn" type="submit" disabled={loading || !email.trim()}>
						{#if loading && emailMode}
							<span class="g-spinner"></span>
						{:else}
							📧 Link
						{/if}
					</button>
				</div>
			</form>
		{/if}

		<button class="anon-btn" onclick={handleAnonLogin} disabled={loading}>
			🧪 Entrar como tester (anónimo)
		</button>

		<div class="login-footer">
			<a href="/" class="back-link">{loginBack}</a>
		</div>

		<div class="login-note">
			<span class="note-dot"></span>
			{loginNote}
		</div>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--container-padding);
		position: relative;
		overflow: hidden;
	}

	.login-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.login-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
	}

	.login-orb-1 {
		width: 500px;
		height: 500px;
		background: var(--accent-glow-strong);
		top: -200px;
		right: -100px;
		opacity: 0.15;
	}

	.login-orb-2 {
		width: 400px;
		height: 400px;
		background: var(--accent-glow);
		bottom: -150px;
		left: -100px;
		opacity: 0.1;
	}

	.login-card {
		position: relative;
		z-index: var(--z-content);
		width: 100%;
		max-width: 380px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		padding: var(--space-10) var(--space-8);
		text-align: center;
		box-shadow: var(--shadow-xl);
	}

	.login-brand {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		margin-bottom: var(--space-8);
	}

	.brand-dot {
		color: var(--accent);
	}

	.login-header {
		margin-bottom: var(--space-6);
	}

	.login-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.login-sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-2);
	}

	.login-error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
		background: var(--danger-glow);
		border: 1px solid rgba(255, 68, 68, 0.2);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		color: var(--danger);
	}

	.google-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-4);
		min-height: 52px;
		background: var(--bg);
		border: 1px solid var(--border2);
		border-radius: var(--radius-lg);
		color: var(--text);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.google-btn:hover:not(:disabled) {
		background: var(--surface-hover);
		border-color: var(--border-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.google-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.google-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.g-spinner {
		width: 18px;
		height: 18px;
		border: 2px solid var(--border2);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.anon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-3);
		margin-top: var(--space-3);
		min-height: var(--touch-min);
		background: rgba(var(--accent-rgb), 0.08);
		border: 1px dashed rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-lg);
		color: var(--accent);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.anon-btn:hover:not(:disabled) {
		background: rgba(var(--accent-rgb), 0.15);
		border-color: var(--accent);
	}

	.anon-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Email login */
	.login-divider {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin: var(--space-4) 0;
	}

	.login-divider::before,
	.login-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.login-divider span {
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
		text-transform: uppercase;
	}

	.email-row {
		display: flex;
		gap: var(--space-2);
	}

	.email-input {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		background: var(--bg);
		border: 1px solid var(--border2);
		border-radius: var(--radius-lg);
		color: var(--text);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		outline: none;
		min-height: 48px;
	}

	.email-input:focus {
		border-color: var(--accent);
	}

	.email-input:disabled {
		opacity: 0.5;
	}

	.email-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background: rgba(var(--accent-rgb), 0.1);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-lg);
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		min-height: 48px;
		white-space: nowrap;
		transition: all var(--duration-fast);
	}

	.email-btn:hover:not(:disabled) {
		background: rgba(var(--accent-rgb), 0.2);
	}

	.email-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.email-sent {
		text-align: center;
		padding: var(--space-4);
		background: rgba(34, 197, 94, 0.08);
		border: 1px solid rgba(34, 197, 94, 0.2);
		border-radius: var(--radius-lg);
	}

	.email-sent-icon {
		font-size: 2rem;
		margin-bottom: var(--space-2);
	}

	.email-sent p {
		font-size: var(--text-sm);
		color: var(--text);
		margin: 0;
	}

	.email-sent strong {
		color: var(--accent);
	}

	.email-sent-hint {
		font-size: var(--text-xs) !important;
		color: var(--text-muted) !important;
		margin-top: var(--space-1) !important;
	}

	.uid-display {
		margin-top: var(--space-4);
		padding: var(--space-3);
		border: 1px dashed rgba(var(--accent-rgb), 0.3);
		border-radius: var(--radius-md);
		background: rgba(var(--accent-rgb), 0.05);
		text-align: center;
	}

	.uid-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
	}

	.uid-code {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--accent);
		word-break: break-all;
		user-select: all;
		padding: var(--space-2);
		background: rgba(0,0,0,0.2);
		border-radius: var(--radius-sm);
	}

	.uid-link {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: #22c55e;
		text-decoration: underline;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.login-footer {
		margin-top: var(--space-8);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border);
	}

	.back-link {
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--duration-fast);
	}

	.back-link:hover {
		color: var(--accent);
	}

	.login-note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		margin-top: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-hint);
		letter-spacing: 0.04em;
	}

	.note-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--accent);
		opacity: 0.5;
	}

	@media (max-width: 480px) {
		.login-card {
			padding: var(--space-8) var(--space-6);
		}
	}
</style>
