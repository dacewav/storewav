<script lang="ts">
	import { Button, Card } from '$lib/components';

	let loading = $state(false);
	let error = $state('');

	async function handleGoogleLogin() {
		loading = true;
		error = '';
		// Block 2: connect to Firebase Auth
		// const provider = new GoogleAuthProvider();
		// await signInWithPopup(auth, provider);
		error = 'Firebase Auth — conectar en Bloque 2';
		loading = false;
	}
</script>

<svelte:head>
	<title>Login — DACEWAV</title>
</svelte:head>

<div class="login-page">
	<div class="login-bg">
		<div class="login-orb login-orb-1"></div>
		<div class="login-orb login-orb-2"></div>
	</div>

	<div class="login-card">
		<div class="login-brand">
			<span class="brand-text">DACE<em>WAV</em></span>
			<span class="brand-dot">.</span>
		</div>

		<div class="login-header">
			<h1 class="login-title">Admin</h1>
			<p class="login-sub">Inicia sesión para acceder al panel</p>
		</div>

		{#if error}
			<div class="login-error" role="alert">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
				{error}
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleGoogleLogin(); }}>
			<button class="google-btn" type="submit" disabled={loading}>
				{#if loading}
					<span class="g-spinner"></span>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24">
						<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
						<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
						<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
						<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
					</svg>
				{/if}
				<span>Continuar con Google</span>
			</button>
		</form>

		<div class="login-footer">
			<a href="/" class="back-link">← Volver a la tienda</a>
		</div>

		<div class="login-note">
			<span class="note-dot"></span>
			Solo administradores autorizados
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
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		margin-bottom: var(--space-8);
	}

	.login-brand em {
		color: var(--accent);
		font-style: normal;
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
		transition: all 0.2s;
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
		transition: color 0.15s;
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
