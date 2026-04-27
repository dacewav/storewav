<script lang="ts">
	import { onMount } from 'svelte';
	import { contractTemplates } from '$lib/stores/contractTemplates';
	import { generateContractPDF, getContractFile } from '$lib/contractGenerator';
	import { settings } from '$lib/stores';

	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	// ─── State ───
	const licenses = [
		{ file: '01-mp3', name: 'MP3', priceMXN: 350, priceUSD: 20 },
		{ file: '02-wav', name: 'WAV', priceMXN: 750, priceUSD: 45 },
		{ file: '03-premium', name: 'Premium', priceMXN: 1500, priceUSD: 90 },
		{ file: '04-ilimitada', name: 'Ilimitada', priceMXN: 5000, priceUSD: 300 },
		{ file: '05-exclusiva', name: 'Exclusiva', priceMXN: 0, priceUSD: 0 },
	];

	let selectedLicense = $state('01-mp3');
	let editorText = $state('');
	let originalText = $state('');
	let loading = $state(false);
	let saving = $state(false);
	let hasCustomTemplate = $state(false);
	let saveMessage = $state('');
	let saveMessageType = $state<'success' | 'error' | ''>('');
	let pdfUrl = $state<string | null>(null);
	let generatingPdf = $state(false);
	let showVariables = $state(true);
	let searchVar = $state('');

	// Sample data for preview
	let previewData = $state({
		buyerName: 'Juan Pérez',
		buyerEmail: 'juan@email.com',
		buyerArtist: 'JP',
		buyerInstagram: '@jp',
		buyerPhone: '+52 1234567890',
		buyerCountry: 'México',
		beatName: 'Midnight Dreams',
		beatBpm: '140',
		beatKey: 'Am',
		beatGenre: 'Trap',
		beatFormat: 'MP3',
		orderId: 'ABC12345',
		date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
		priceMXN: '$350',
		priceUSD: '$20',
		licenseName: 'MP3',
		streams: '100,000',
		copies: '2,000',
		producerName: 'Daniel Antonio Cebrero Escalante',
		producerArtist: 'Dace',
		producerEmail: 'dace.wav.negocios@gmail.com',
		producerInstagram: 'dace.wav',
		producerCity: 'Heroica Puebla de Zaragoza',
		producerCountry: 'México',
		paymentMethod: 'Stripe',
		transactionId: 'pi_abc123...',
		paidAt: new Date().toLocaleString('es-MX'),
	});

	// ─── Variables ───
	const variableGroups = [
		{
			label: '🎤 Comprador',
			vars: [
				{ name: 'buyerName', desc: 'Nombre completo', example: 'Juan Pérez' },
				{ name: 'buyerEmail', desc: 'Email', example: 'juan@email.com' },
				{ name: 'buyerArtist', desc: 'Nombre artístico', example: 'JP' },
				{ name: 'buyerInstagram', desc: 'Instagram', example: '@jp' },
				{ name: 'buyerPhone', desc: 'Teléfono', example: '+52 1234567890' },
				{ name: 'buyerCountry', desc: 'País', example: 'México' },
			],
		},
		{
			label: '🎵 Beat',
			vars: [
				{ name: 'beatName', desc: 'Nombre', example: 'Midnight Dreams' },
				{ name: 'beatBpm', desc: 'BPM', example: '140' },
				{ name: 'beatKey', desc: 'Tonalidad', example: 'Am' },
				{ name: 'beatGenre', desc: 'Género', example: 'Trap' },
				{ name: 'beatFormat', desc: 'Formato', example: 'MP3 / WAV + MP3' },
			],
		},
		{
			label: '📄 Contrato',
			vars: [
				{ name: 'orderId', desc: 'No. contrato', example: 'ABC12345' },
				{ name: 'date', desc: 'Fecha de firma', example: '27 de abril de 2026' },
				{ name: 'priceMXN', desc: 'Precio MXN', example: '$350' },
				{ name: 'priceUSD', desc: 'Precio USD', example: '$20' },
				{ name: 'licenseName', desc: 'Tipo de licencia', example: 'MP3' },
				{ name: 'streams', desc: 'Límite streams', example: '100,000' },
				{ name: 'copies', desc: 'Límite copias', example: '2,000' },
			],
		},
		{
			label: '🎹 Productor',
			vars: [
				{ name: 'producerName', desc: 'Nombre completo', example: 'Daniel Antonio Cebrero Escalante' },
				{ name: 'producerArtist', desc: 'Nombre artístico', example: 'Dace' },
				{ name: 'producerEmail', desc: 'Email', example: 'dace.wav.negocios@gmail.com' },
				{ name: 'producerInstagram', desc: 'Instagram', example: 'dace.wav' },
				{ name: 'producerCity', desc: 'Ciudad', example: 'Heroica Puebla de Zaragoza' },
				{ name: 'producerCountry', desc: 'País', example: 'México' },
			],
		},
		{
			label: '💳 Pago',
			vars: [
				{ name: 'paymentMethod', desc: 'Método de pago', example: 'Stripe' },
				{ name: 'transactionId', desc: 'ID transacción', example: 'pi_abc123...' },
				{ name: 'paidAt', desc: 'Fecha de pago', example: '27/04/2026 14:30' },
			],
		},
	];

	const allVariables = variableGroups.flatMap(g => g.vars);

	let filteredGroups = $derived(
		searchVar.trim()
			? variableGroups.map(g => ({
				...g,
				vars: g.vars.filter(v =>
					v.name.toLowerCase().includes(searchVar.toLowerCase()) ||
					v.desc.toLowerCase().includes(searchVar.toLowerCase())
				),
			})).filter(g => g.vars.length > 0)
			: variableGroups
	);

	// ─── Preview with variables replaced ───
	let previewText = $derived(() => {
		let text = editorText;
		for (const v of allVariables) {
			const val = previewData[v.name as keyof typeof previewData] || v.example;
			text = text.replaceAll(`{{${v.name}}}`, val);
		}
		return text;
	});

	// ─── Load contract ───
	async function loadContract(file: string) {
		loading = true;
		saveMessage = '';
		pdfUrl = null;

		try {
			// Try loading custom template from Firebase
			const custom = await contractTemplates.getTemplate(file);

			// Load original .md
			const resp = await fetch(`/api/contracts/${file}`);
			const data = await resp.json() as { content?: string };

			if (data.content) {
				originalText = data.content;
				editorText = custom || data.content;
				hasCustomTemplate = !!custom;
			}
		} catch (err) {
			console.error('Failed to load contract:', err);
			saveMessage = 'Error al cargar el contrato';
			saveMessageType = 'error';
		} finally {
			loading = false;
		}
	}

	// ─── Save ───
	async function saveTemplate() {
		saving = true;
		saveMessage = '';
		try {
			const ok = await contractTemplates.save(selectedLicense, editorText);
			if (ok) {
				hasCustomTemplate = true;
				saveMessage = 'Template guardado correctamente';
				saveMessageType = 'success';
			} else {
				saveMessage = 'Error al guardar';
				saveMessageType = 'error';
			}
		} catch {
			saveMessage = 'Error al guardar';
			saveMessageType = 'error';
		} finally {
			saving = false;
			setTimeout(() => { saveMessage = ''; }, 3000);
		}
	}

	// ─── Reset ───
	async function resetTemplate() {
		if (!confirm('¿Resetear al texto original del .md? Se perderán los cambios personalizados.')) return;

		saving = true;
		saveMessage = '';
		try {
			const ok = await contractTemplates.reset(selectedLicense);
			if (ok) {
				editorText = originalText;
				hasCustomTemplate = false;
				saveMessage = 'Reset al original exitoso';
				saveMessageType = 'success';
			} else {
				saveMessage = 'Error al resetear';
				saveMessageType = 'error';
			}
		} catch {
			saveMessage = 'Error al resetear';
			saveMessageType = 'error';
		} finally {
			saving = false;
			setTimeout(() => { saveMessage = ''; }, 3000);
		}
	}

	// ─── Insert variable ───
	function insertVariable(varName: string) {
		const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const tag = `{{${varName}}}`;

		editorText = editorText.slice(0, start) + tag + editorText.slice(end);

		// Restore cursor position after the inserted tag
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + tag.length, start + tag.length);
		}, 0);
	}

	// ─── Generate PDF preview ───
	async function generatePdfPreview() {
		generatingPdf = true;
		try {
			const lic = licenses.find(l => l.file === selectedLicense);
			const bytes = await generateContractPDF({
				orderId: previewData.orderId,
				beatName: previewData.beatName,
				beatBpm: previewData.beatBpm,
				beatKey: previewData.beatKey,
				beatGenre: previewData.beatGenre,
				licenseName: lic?.name || 'MP3',
				priceMXN: lic?.priceMXN || 350,
				priceUSD: lic?.priceUSD || 20,
				buyerName: previewData.buyerName,
				buyerEmail: previewData.buyerEmail,
				buyerArtist: previewData.buyerArtist,
				date: previewData.date,
				contractFile: selectedLicense,
			});

			if (pdfUrl) URL.revokeObjectURL(pdfUrl);
			const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
			pdfUrl = URL.createObjectURL(blob);
		} catch (err) {
			console.error('PDF generation error:', err);
		} finally {
			generatingPdf = false;
		}
	}

	// ─── License change ───
	function selectLicense(file: string) {
		selectedLicense = file;
		const lic = licenses.find(l => l.file === file);
		if (lic) {
			previewData.licenseName = lic.name;
			previewData.priceMXN = `$${lic.priceMXN.toLocaleString()}`;
			previewData.priceUSD = `$${lic.priceUSD.toLocaleString()}`;
		}
		loadContract(file);
	}

	// ─── Highlight variables in editor ───
	function highlightVariables(text: string): string {
		return text.replace(
			/\{\{(\w+)\}\}/g,
			'<span class="var-highlight">{{$1}}</span>'
		);
	}

	// ─── Count variables in text ───
	let usedVariables = $derived(() => {
		const matches = editorText.match(/\{\{(\w+)\}\}/g) || [];
		return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
	});

	onMount(() => {
		loadContract(selectedLicense);
	});
</script>

<svelte:head>
	<title>Editor de Contratos — {brandName} Admin</title>
</svelte:head>

<div class="editor-page">
	<div class="page-header">
		<div class="header-left">
			<a href="/admin/contracts" class="back-link">← Volver</a>
			<h1>✏️ Editor de Contratos</h1>
			<p>Edita el texto de los contratos, usa variables dinámicas y guarda templates personalizados.</p>
		</div>
		<div class="header-actions">
			{#if hasCustomTemplate}
				<span class="badge-custom">Custom</span>
			{/if}
			{#if saveMessage}
				<span class="save-msg" class:success={saveMessageType === 'success'} class:error={saveMessageType === 'error'}>
					{saveMessage}
				</span>
			{/if}
		</div>
	</div>

	<!-- License tabs -->
	<div class="license-tabs">
		{#each licenses as lic}
			<button
				class="tab"
				class:active={selectedLicense === lic.file}
				onclick={() => selectLicense(lic.file)}
			>
				<span class="tab-name">{lic.name}</span>
				<span class="tab-price">
					{#if lic.priceMXN > 0}${lic.priceMXN.toLocaleString()}{:else}Cotizar{/if}
				</span>
			</button>
		{/each}
	</div>

	<div class="main-layout">
		<!-- Left: Variables panel -->
		{#if showVariables}
			<aside class="variables-panel">
				<div class="panel-header">
					<h3>Variables</h3>
					<button class="btn-icon" onclick={() => showVariables = false} title="Cerrar panel">✕</button>
				</div>

				<input
					type="text"
					class="var-search"
					placeholder="Buscar variable..."
					bind:value={searchVar}
				/>

				<div class="var-groups">
					{#each filteredGroups as group}
						<div class="var-group">
							<h4>{group.label}</h4>
							{#each group.vars as v}
								<button
									class="var-chip"
									onclick={() => insertVariable(v.name)}
									title="Click para insertar — {v.desc}: {v.example}"
								>
									<code>{'{{' + v.name + '}}'}</code>
									<span class="var-desc">{v.desc}</span>
								</button>
							{/each}
						</div>
					{/each}
				</div>

				<div class="var-count">
					{usedVariables().length} variables en uso
				</div>
			</aside>
		{/if}

		<!-- Center: Editor -->
		<div class="editor-panel">
			<div class="editor-toolbar">
				{#if !showVariables}
					<button class="btn-sm" onclick={() => showVariables = true}>📋 Variables</button>
				{/if}
				<div class="editor-info">
					<span class="char-count">{editorText.length} caracteres</span>
					<span class="line-count">{editorText.split('\n').length} líneas</span>
				</div>
				<div class="editor-actions">
					<button class="btn-secondary" onclick={resetTemplate} disabled={loading || saving}>
						🔄 Reset al original
					</button>
					<button class="btn-primary" onclick={saveTemplate} disabled={loading || saving}>
						{#if saving}
							⏳ Guardando...
						{:else}
							💾 Guardar template
						{/if}
					</button>
				</div>
			</div>

			{#if loading}
				<div class="editor-loading">Cargando contrato...</div>
			{:else}
				<textarea
					class="editor-textarea"
					bind:value={editorText}
					spellcheck="false"
					placeholder="Cargando texto del contrato..."
				></textarea>
			{/if}
		</div>

		<!-- Right: Preview -->
		<div class="preview-panel">
			<div class="preview-toolbar">
				<h3>Preview</h3>
				<div class="preview-actions">
					<button class="btn-sm" onclick={generatePdfPreview} disabled={generatingPdf}>
						{#if generatingPdf}
							⏳
						{:else}
							📄 PDF
						{/if}
					</button>
				</div>
			</div>

			{#if pdfUrl}
				<iframe src={pdfUrl} title="PDF Preview" class="pdf-frame"></iframe>
			{:else}
				<div class="text-preview">
					<pre>{previewText()}</pre>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.editor-page {
		max-width: 1600px;
		margin: 0 auto;
		padding: var(--space-6);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-6);
	}

	.header-left h1 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin: var(--space-2) 0;
	}

	.header-left p {
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.back-link {
		font-size: var(--text-xs);
		color: var(--text-muted);
		text-decoration: none;
		font-family: var(--font-mono);
	}

	.back-link:hover {
		color: var(--accent);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.badge-custom {
		font-size: var(--text-2xs);
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
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

	/* License tabs */
	.license-tabs {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
		border-bottom: 1px solid var(--border);
		padding-bottom: var(--space-3);
	}

	.tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--duration-fast);
		font-family: var(--font-body);
	}

	.tab:hover {
		border-color: var(--accent);
	}

	.tab.active {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.tab-name {
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.tab-price {
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	/* Main layout */
	.main-layout {
		display: grid;
		grid-template-columns: 260px 1fr 380px;
		gap: var(--space-4);
		min-height: 70vh;
	}

	@media (max-width: 1200px) {
		.main-layout {
			grid-template-columns: 1fr;
		}
	}

	/* Variables panel */
	.variables-panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		overflow-y: auto;
		max-height: 75vh;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.panel-header h3 {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
	}

	.btn-icon {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: var(--text-sm);
		padding: var(--space-1);
	}

	.btn-icon:hover {
		color: var(--text);
	}

	.var-search {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-size: var(--text-xs);
		font-family: var(--font-mono);
		margin-bottom: var(--space-3);
		outline: none;
	}

	.var-search:focus {
		border-color: var(--accent);
	}

	.var-group {
		margin-bottom: var(--space-4);
	}

	.var-group h4 {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
		font-family: var(--font-body);
	}

	.var-chip {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-1) var(--space-2);
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-align: left;
		transition: all var(--duration-fast);
		margin-bottom: var(--space-1);
	}

	.var-chip:hover {
		background: rgba(var(--accent-rgb), 0.05);
		border-color: var(--border);
	}

	.var-chip code {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--accent);
		white-space: nowrap;
	}

	.var-desc {
		font-size: 10px;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.var-count {
		font-size: 10px;
		color: var(--text-muted);
		font-family: var(--font-mono);
		text-align: center;
		padding-top: var(--space-3);
		border-top: 1px solid var(--border);
	}

	/* Editor panel */
	.editor-panel {
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.editor-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--border);
		gap: var(--space-3);
	}

	.editor-info {
		display: flex;
		gap: var(--space-3);
		font-size: var(--text-2xs);
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.editor-actions {
		display: flex;
		gap: var(--space-2);
	}

	.editor-textarea {
		flex: 1;
		width: 100%;
		min-height: 60vh;
		padding: var(--space-4);
		background: var(--bg);
		color: var(--text);
		border: none;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		line-height: 1.7;
		resize: none;
		outline: none;
		tab-size: 4;
	}

	.editor-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 400px;
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	/* Preview panel */
	.preview-panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.preview-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.preview-toolbar h3 {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
	}

	.preview-actions {
		display: flex;
		gap: var(--space-2);
	}

	.text-preview {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		max-height: 65vh;
	}

	.text-preview pre {
		font-family: var(--font-mono);
		font-size: 10px;
		line-height: 1.6;
		color: var(--text-secondary);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}

	.pdf-frame {
		width: 100%;
		flex: 1;
		min-height: 60vh;
		border: none;
	}

	/* Buttons */
	.btn-sm {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-2xs);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		transition: all var(--duration-fast);
	}

	.btn-sm:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.btn-sm:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary, .btn-secondary {
		padding: var(--space-2) var(--space-4);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.btn-primary {
		background: var(--accent);
		color: var(--bg);
	}

	.btn-primary:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
