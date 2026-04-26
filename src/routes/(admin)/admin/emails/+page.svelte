<script lang="ts">
	import { onMount } from 'svelte';
	import { analytics } from '$lib/stores';

	const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

	type EmailTemplate = {
		// Branding
		brandName: string;
		accentColor: string;
		logoUrl: string;
		// Header
		headerEmoji: string;
		headerTitle: string;
		headerSubtitle: string;
		// Items section
		downloadBtnText: string;
		downloadBtnColor: string;
		// Contract section
		showContractNote: boolean;
		contractTitle: string;
		contractText: string;
		// Footer
		footerText: string;
		footerSupportText: string;
		footerCopyright: string;
		// Subject
		emailSubject: string;
		// Misc
		showTotal: boolean;
		showOrderNumber: boolean;
	};

	const defaultTemplate: EmailTemplate = {
		brandName: 'DACEWAV',
		accentColor: '#dc2626',
		logoUrl: '',
		headerEmoji: '✅',
		headerTitle: '¡Compra exitosa!',
		headerSubtitle: 'Gracias por tu compra, {{buyerName}}. Aquí están tus archivos:',
		downloadBtnText: '⬇ Descargar',
		downloadBtnColor: '#dc2626',
		showContractNote: true,
		contractTitle: '📄 Contrato de licencia',
		contractText: 'El contrato de licencia está adjunto a este email como PDF. Consérvalo como comprobante de tu compra.',
		footerText: '¿Perdiste los links? Accedé a tus descargas en cualquier momento:',
		footerSupportText: 'Si tienes problemas con la descarga, contáctanos por WhatsApp o responde a este email.',
		footerCopyright: '© 2026 DACEWAV. Todos los derechos reservados.',
		emailSubject: '✅ Tu compra en {{brandName}} — {{beatNames}}',
		showTotal: true,
		showOrderNumber: true,
	};

	let template = $state<EmailTemplate>({ ...defaultTemplate });
	let loading = $state(true);
	let saving = $state(false);
	let previewMode = $state<'desktop' | 'mobile'>('desktop');

	// Sample data for preview
	const sampleData = {
		buyerName: 'Juan Pérez',
		orderId: 'abc12345',
		items: [
			{ beatName: 'Midnight Vibes', licenseName: 'Premium', downloadUrl: '#' },
			{ beatName: 'Summer Heat', licenseName: 'MP3', downloadUrl: '#' },
		],
		totalMXN: 1850,
		totalUSD: 110,
		contractPdfBase64: 'sample',
	};

	function interpolate(text: string, data: Record<string, string>): string {
		return text
			.replace(/\{\{brandName\}\}/g, data.brandName || 'DACEWAV')
			.replace(/\{\{buyerName\}\}/g, data.buyerName || 'Cliente')
			.replace(/\{\{beatNames\}\}/g, data.beatNames || 'Beat')
			.replace(/\{\{orderId\}\}/g, data.orderId || '00000000')
			.replace(/\{\{totalMXN\}\}/g, data.totalMXN || '0')
			.replace(/\{\{totalUSD\}\}/g, data.totalUSD || '0');
	}

	function getPreviewHtml(): string {
		const t = template;
		const itemsHtml = sampleData.items.map(item => `
			<div style="padding: 16px; background: #1a1a1a; border-radius: 8px; margin-bottom: 12px;">
				<div style="font-weight: 700; color: #fff; font-size: 16px; margin-bottom: 4px;">
					${item.beatName}
				</div>
				<div style="color: #888; font-size: 13px; margin-bottom: 12px;">
					Licencia: ${item.licenseName}
				</div>
				<a href="#"
					style="display: inline-block; padding: 10px 24px; background: ${t.downloadBtnColor}; color: #fff;
					text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
					${t.downloadBtnText}
				</a>
			</div>
		`).join('');

		return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
	<div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
		<!-- Header -->
		<div style="text-align: center; margin-bottom: 32px;">
			${t.logoUrl ? `<img src="${t.logoUrl}" alt="${t.brandName}" style="max-height: 40px; margin-bottom: 8px;" />` : ''}
			<div style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">
				${t.brandName}<span style="color: ${t.accentColor};">.</span>
			</div>
		</div>

		<!-- Success -->
		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 48px; margin-bottom: 12px;">${t.headerEmoji}</div>
			<h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
				${t.headerTitle}
			</h1>
			<p style="color: #888; font-size: 14px; margin: 0;">
				${interpolate(t.headerSubtitle, { buyerName: sampleData.buyerName })}
			</p>
		</div>

		${t.showOrderNumber ? `
		<!-- Order ID -->
		<div style="text-align: center; margin-bottom: 24px; padding: 12px; background: #111; border-radius: 8px;">
			<span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
				Pedido
			</span>
			<div style="color: #fff; font-family: monospace; font-size: 14px; margin-top: 4px;">
				#${sampleData.orderId}
			</div>
		</div>
		` : ''}

		<!-- Items -->
		${itemsHtml}

		${t.showContractNote ? `
		<!-- Contract note -->
		<div style="padding: 16px; background: #111; border-radius: 8px; margin-top: 24px; border-left: 3px solid ${t.accentColor};">
			<div style="color: #fff; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
				${t.contractTitle}
			</div>
			<div style="color: #888; font-size: 13px;">
				${t.contractText}
			</div>
		</div>
		` : ''}

		${t.showTotal ? `
		<!-- Total -->
		<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; text-align: right;">
			<span style="color: #888; font-size: 13px;">Total: </span>
			<span style="color: ${t.accentColor}; font-weight: 800; font-size: 18px;">
				$${sampleData.totalMXN} MXN
			</span>
			<span style="color: #666; font-size: 12px; margin-left: 8px;">
				($${sampleData.totalUSD} USD)
			</span>
		</div>
		` : ''}

		<!-- Footer -->
		<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; text-align: center;">
			<p style="color: #888; font-size: 13px; margin-bottom: 12px;">
				${t.footerText}
			</p>
			<a href="https://dacewav.store/account/orders"
				style="display: inline-block; padding: 10px 24px; background: #222; color: #fff;
				text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;
				border: 1px solid #333;">
				📦 Mis órdenes
			</a>
			<p style="color: #555; font-size: 12px; line-height: 1.6; margin-top: 16px;">
				${t.footerSupportText}
			</p>
			<p style="color: #333; font-size: 11px; margin-top: 12px;">
				${t.footerCopyright}
			</p>
		</div>
	</div>
</body>
</html>`;
	}

	let previewHtml = $derived(getPreviewHtml());

	async function loadTemplate() {
		loading = true;
		try {
			const resp = await fetch(`${FIREBASE_DB}/settings/emailTemplates/delivery.json`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					template = { ...defaultTemplate, ...data };
				}
			}
		} catch (e) {
			console.error('Failed to load email template:', e);
		} finally {
			loading = false;
		}
	}

	async function saveTemplate() {
		saving = true;
		try {
			const resp = await fetch(`${FIREBASE_DB}/settings/emailTemplates/delivery.json`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(template),
			});

			if (resp.ok) {
				analytics.track('admin', 'email_template_save');
				alert('Template guardado ✅');
			} else {
				alert('Error al guardar');
			}
		} catch (e) {
			alert('Error: ' + (e as Error).message);
		} finally {
			saving = false;
		}
	}

	function resetToDefault() {
		if (!confirm('¿Resetear el template al default?')) return;
		template = { ...defaultTemplate };
	}

	onMount(loadTemplate);
</script>

<svelte:head>
	<title>Templates de email — Admin</title>
</svelte:head>

<div class="emails-page">
	<div class="page-header">
		<div>
			<h1 class="page-title">✉️ Templates de email</h1>
			<p class="page-sub">Personalizá los emails que reciben tus clientes después de comprar.</p>
		</div>
		<div class="header-actions">
			<button class="reset-btn" onclick={resetToDefault}>Resetear</button>
			<button class="save-btn" onclick={saveTemplate} disabled={saving}>
				{saving ? 'Guardando...' : 'Guardar'}
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Cargando template...</div>
	{:else}
		<div class="editor-layout">
			<!-- Editor Panel -->
			<div class="editor-panel">
				<!-- Branding -->
				<details class="section" open>
					<summary class="section-title">🎨 Branding</summary>
					<div class="fields">
						<div class="field">
							<label for="brandName">Nombre de marca</label>
							<input id="brandName" type="text" bind:value={template.brandName} />
						</div>
						<div class="field">
							<label for="accentColor">Color de acento</label>
							<div class="color-row">
								<input id="accentColor" type="color" bind:value={template.accentColor} />
								<input type="text" bind:value={template.accentColor} class="color-text" />
							</div>
						</div>
						<div class="field">
							<label for="logoUrl">URL del logo (opcional)</label>
							<input id="logoUrl" type="text" bind:value={template.logoUrl} placeholder="https://..." />
						</div>
					</div>
				</details>

				<!-- Header -->
				<details class="section" open>
					<summary class="section-title">📧 Encabezado</summary>
					<div class="fields">
						<div class="field">
							<label for="emailSubject">Asunto del email</label>
							<input id="emailSubject" type="text" bind:value={template.emailSubject} />
							<span class="field-hint">Variables: {{brandName}}, {{buyerName}}, {{beatNames}}</span>
						</div>
						<div class="field">
							<label for="headerEmoji">Emoji</label>
							<input id="headerEmoji" type="text" bind:value={template.headerEmoji} maxlength={4} />
						</div>
						<div class="field">
							<label for="headerTitle">Título</label>
							<input id="headerTitle" type="text" bind:value={template.headerTitle} />
						</div>
						<div class="field">
							<label for="headerSubtitle">Subtítulo</label>
							<textarea id="headerSubtitle" bind:value={template.headerSubtitle} rows={2}></textarea>
							<span class="field-hint">Variable: {{buyerName}}</span>
						</div>
					</div>
				</details>

				<!-- Download Button -->
				<details class="section">
					<summary class="section-title">⬇ Botón de descarga</summary>
					<div class="fields">
						<div class="field">
							<label for="downloadBtnText">Texto del botón</label>
							<input id="downloadBtnText" type="text" bind:value={template.downloadBtnText} />
						</div>
						<div class="field">
							<label for="downloadBtnColor">Color del botón</label>
							<div class="color-row">
								<input id="downloadBtnColor" type="color" bind:value={template.downloadBtnColor} />
								<input type="text" bind:value={template.downloadBtnColor} class="color-text" />
							</div>
						</div>
					</div>
				</details>

				<!-- Contract -->
				<details class="section">
					<summary class="section-title">📄 Contrato</summary>
					<div class="fields">
						<div class="field">
							<label>
								<input type="checkbox" bind:checked={template.showContractNote} />
								Mostrar nota del contrato
							</label>
						</div>
						{#if template.showContractNote}
							<div class="field">
								<label for="contractTitle">Título</label>
								<input id="contractTitle" type="text" bind:value={template.contractTitle} />
							</div>
							<div class="field">
								<label for="contractText">Texto</label>
								<textarea id="contractText" bind:value={template.contractText} rows={2}></textarea>
							</div>
						{/if}
					</div>
				</details>

				<!-- Footer -->
				<details class="section">
					<summary class="section-title">📝 Footer</summary>
					<div class="fields">
						<div class="field">
							<label>
								<input type="checkbox" bind:checked={template.showOrderNumber} />
								Mostrar número de pedido
							</label>
						</div>
						<div class="field">
							<label>
								<input type="checkbox" bind:checked={template.showTotal} />
								Mostrar total
							</label>
						</div>
						<div class="field">
							<label for="footerText">Texto de links perdidos</label>
							<textarea id="footerText" bind:value={template.footerText} rows={2}></textarea>
						</div>
						<div class="field">
							<label for="footerSupportText">Texto de soporte</label>
							<textarea id="footerSupportText" bind:value={template.footerSupportText} rows={2}></textarea>
						</div>
						<div class="field">
							<label for="footerCopyright">Copyright</label>
							<input id="footerCopyright" type="text" bind:value={template.footerCopyright} />
						</div>
					</div>
				</details>
			</div>

			<!-- Preview Panel -->
			<div class="preview-panel">
				<div class="preview-header">
					<span class="preview-title">Vista previa</span>
					<div class="preview-toggle">
						<button
							class="toggle-btn"
							class:active={previewMode === 'desktop'}
							onclick={() => previewMode = 'desktop'}
						>Desktop</button>
						<button
							class="toggle-btn"
							class:active={previewMode === 'mobile'}
							onclick={() => previewMode = 'mobile'}
						>Mobile</button>
					</div>
				</div>
				<div class="preview-frame" class:mobile={previewMode === 'mobile'}>
					<iframe
						srcdoc={previewHtml}
						title="Email preview"
						sandbox="allow-same-origin"
					></iframe>
				</div>

				<!-- Variables reference -->
				<div class="variables-ref">
					<span class="var-title">Variables disponibles:</span>
					<div class="var-list">
						<code>{{brandName}}</code>
						<code>{{buyerName}}</code>
						<code>{{beatNames}}</code>
						<code>{{orderId}}</code>
						<code>{{totalMXN}}</code>
						<code>{{totalUSD}}</code>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.emails-page {
		padding: var(--space-6);
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-6);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-1);
	}

	.page-sub {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.header-actions {
		display: flex;
		gap: var(--space-2);
	}

	.save-btn, .reset-btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.save-btn {
		background: var(--accent);
		color: var(--bg);
		border: none;
	}

	.save-btn:hover:not(:disabled) {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

	.reset-btn {
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
	}

	.loading {
		text-align: center;
		padding: var(--space-10);
		color: var(--text-muted);
	}

	/* ── Layout ── */
	.editor-layout {
		display: grid;
		grid-template-columns: 380px 1fr;
		gap: var(--space-6);
		align-items: start;
	}

	/* ── Editor Panel ── */
	.editor-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-height: calc(100vh - 180px);
		overflow-y: auto;
		padding-right: var(--space-2);
	}

	.section {
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.section-title {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		cursor: pointer;
		user-select: none;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.field label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.field input[type="text"],
	.field input[type="url"],
	.field textarea,
	.field select {
		padding: var(--space-2) var(--space-3);
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
		font-family: inherit;
	}

	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
	}

	.field textarea { resize: vertical; }

	.field-hint {
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.color-row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.color-row input[type="color"] {
		width: 40px;
		height: 36px;
		padding: 2px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		background: var(--surface2);
	}

	.color-text {
		flex: 1;
		font-family: var(--font-mono);
	}

	/* ── Preview Panel ── */
	.preview-panel {
		position: sticky;
		top: var(--space-4);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.preview-title {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
	}

	.preview-toggle {
		display: flex;
		gap: var(--space-1);
	}

	.toggle-btn {
		padding: var(--space-1) var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		cursor: pointer;
	}

	.toggle-btn.active {
		background: rgba(var(--accent-rgb), 0.15);
		border-color: var(--accent);
		color: var(--accent);
	}

	.preview-frame {
		background: #0a0a0a;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.preview-frame iframe {
		width: 100%;
		height: 700px;
		border: none;
	}

	.preview-frame.mobile {
		max-width: 375px;
	}

	.preview-frame.mobile iframe {
		width: 375px;
	}

	.variables-ref {
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.var-title {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: block;
		margin-bottom: var(--space-2);
	}

	.var-list {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.var-list code {
		padding: 2px 8px;
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-size: var(--text-2xs);
		color: var(--accent);
	}

	@media (max-width: 900px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}
		.preview-panel {
			position: static;
		}
	}
</style>
