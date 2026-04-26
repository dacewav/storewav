<script lang="ts">
	import { generateContractPDF, getContractFile } from '$lib/contractGenerator';
	import { settings } from '$lib/stores';

	let brandName = $derived($settings.data?.brand?.name ?? 'DACEWAV');

	// Form state
	let form = $state({
		licenseName: 'MP3',
		beatName: 'Midnight Dreams',
		beatBpm: '140',
		beatKey: 'Am',
		beatGenre: 'Trap',
		buyerName: 'Juan Pérez',
		buyerEmail: 'juan@email.com',
		buyerArtist: 'JP',
		priceMXN: 350,
		priceUSD: 20,
		orderId: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
	});

	let pdfUrl = $state<string | null>(null);
	let generating = $state(false);
	let error = $state('');

	const licenses = [
		{ name: 'MP3', priceMXN: 350, priceUSD: 20 },
		{ name: 'WAV', priceMXN: 750, priceUSD: 45 },
		{ name: 'Premium', priceMXN: 1500, priceUSD: 90 },
		{ name: 'Ilimitada', priceMXN: 5000, priceUSD: 300 },
		{ name: 'Exclusiva', priceMXN: 0, priceUSD: 0 },
	];

	function selectLicense(name: string) {
		const lic = licenses.find(l => l.name === name);
		if (lic) {
			form.licenseName = lic.name;
			form.priceMXN = lic.priceMXN;
			form.priceUSD = lic.priceUSD;
			form.orderId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
		}
	}

	async function generatePDF() {
		generating = true;
		error = '';
		try {
			const today = new Date();
			const dateStr = `${today.getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][today.getMonth()]} de ${today.getFullYear()}`;

			const bytes = await generateContractPDF({
				orderId: form.orderId,
				beatName: form.beatName,
				beatBpm: form.beatBpm || undefined,
				beatKey: form.beatKey || undefined,
				beatGenre: form.beatGenre || undefined,
				licenseName: form.licenseName,
				priceMXN: form.priceMXN,
				priceUSD: form.priceUSD,
				buyerName: form.buyerName,
				buyerEmail: form.buyerEmail,
				buyerArtist: form.buyerArtist || undefined,
				date: dateStr,
				contractFile: getContractFile(form.licenseName),
			});

			// Revoke old URL
			if (pdfUrl) URL.revokeObjectURL(pdfUrl);

			const blob = new Blob([bytes], { type: 'application/pdf' });
			pdfUrl = URL.createObjectURL(blob);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error generando PDF';
		}
		generating = false;
	}

	function downloadPDF() {
		if (!pdfUrl) return;
		const a = document.createElement('a');
		a.href = pdfUrl;
		a.download = `contrato-${form.licenseName.toLowerCase()}-${form.orderId.slice(0, 8)}.pdf`;
		a.click();
	}

	function newContract() {
		form.orderId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
		if (pdfUrl) {
			URL.revokeObjectURL(pdfUrl);
			pdfUrl = null;
		}
	}
</script>

<svelte:head>
	<title>Contratos — {brandName} Admin</title>
</svelte:head>

<div class="contracts-page">
	<div class="page-header">
		<h1>📄 Generador de Contratos</h1>
		<p>Genera y descarga contratos de licencia para pruebas o envío manual.</p>
	</div>

	<div class="layout">
		<!-- Left: Form -->
		<div class="form-panel">
			<!-- License selector -->
			<div class="license-grid">
				{#each licenses as lic}
					<button
						class="license-btn"
						class:active={form.licenseName === lic.name}
						onclick={() => selectLicense(lic.name)}
					>
						<span class="lic-name">{lic.name}</span>
						<span class="lic-price">
							{#if lic.priceMXN > 0}
								${lic.priceMXN.toLocaleString()} MXN
							{:else}
								Cotizar
							{/if}
						</span>
					</button>
				{/each}
			</div>

			<!-- Beat info -->
			<fieldset>
				<legend>🎵 Beat</legend>
				<div class="fields">
					<label>
						<span>Nombre</span>
						<input type="text" bind:value={form.beatName} placeholder="Midnight Dreams" />
					</label>
					<div class="row-3">
						<label>
							<span>BPM</span>
							<input type="text" bind:value={form.beatBpm} placeholder="140" />
						</label>
						<label>
							<span>Tonalidad</span>
							<input type="text" bind:value={form.beatKey} placeholder="Am" />
						</label>
						<label>
							<span>Género</span>
							<input type="text" bind:value={form.beatGenre} placeholder="Trap" />
						</label>
					</div>
				</div>
			</fieldset>

			<!-- Buyer info -->
			<fieldset>
				<legend>🎤 Artista (Comprador)</legend>
				<div class="fields">
					<label>
						<span>Nombre completo</span>
						<input type="text" bind:value={form.buyerName} placeholder="Juan Pérez" />
					</label>
					<label>
						<span>Email</span>
						<input type="email" bind:value={form.buyerEmail} placeholder="juan@email.com" />
					</label>
					<label>
						<span>Nombre artístico</span>
						<input type="text" bind:value={form.buyerArtist} placeholder="JP" />
					</label>
				</div>
			</fieldset>

			<!-- Price -->
			<fieldset>
				<legend>💰 Precio</legend>
				<div class="row-2">
					<label>
						<span>MXN</span>
						<input type="number" bind:value={form.priceMXN} />
					</label>
					<label>
						<span>USD</span>
						<input type="number" bind:value={form.priceUSD} />
					</label>
				</div>
			</fieldset>

			<!-- Order ID -->
			<div class="order-id">
				<span>Contrato: </span>
				<code>{form.orderId.slice(0, 8).toUpperCase()}</code>
				<button class="btn-sm" onclick={newContract}>🔄 Nuevo</button>
			</div>

			<!-- Actions -->
			<div class="actions">
				<button class="btn-primary" onclick={generatePDF} disabled={generating || !form.buyerName || !form.beatName}>
					{#if generating}
						⏳ Generando...
					{:else}
						📄 Generar PDF
					{/if}
				</button>
				{#if pdfUrl}
					<button class="btn-secondary" onclick={downloadPDF}>
						⬇️ Descargar
					</button>
				{/if}
			</div>

			{#if error}
				<div class="error-msg">{error}</div>
			{/if}
		</div>

		<!-- Right: Preview -->
		<div class="preview-panel">
			{#if pdfUrl}
				<iframe src={pdfUrl} title="Preview del contrato" class="pdf-preview"></iframe>
			{:else}
				<div class="preview-empty">
					<div class="preview-icon">📄</div>
					<p>Selecciona una licencia, rellena los datos y genera el PDF para ver la preview.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.contracts-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-6);
	}

	.page-header {
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		color: var(--text);
		margin-bottom: var(--space-2);
	}

	.page-header p {
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}

	.layout {
		display: grid;
		grid-template-columns: 380px 1fr;
		gap: var(--space-6);
		align-items: start;
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}

	/* License grid */
	.license-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}

	.license-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--duration-fast);
		font-family: var(--font-body);
	}

	.license-btn:hover {
		border-color: var(--accent);
		background: var(--surface-hover);
	}

	.license-btn.active {
		border-color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.lic-name {
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text);
	}

	.lic-price {
		font-size: var(--text-2xs);
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	/* Fieldsets */
	fieldset {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
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

	.row-2, .row-3 {
		display: grid;
		gap: var(--space-3);
	}
	.row-2 { grid-template-columns: 1fr 1fr; }
	.row-3 { grid-template-columns: 1fr 1fr 1fr; }

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

	input, select {
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

	input:focus, select:focus {
		border-color: var(--accent);
	}

	/* Order ID */
	.order-id {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.order-id code {
		font-family: var(--font-mono);
		color: var(--accent);
		background: rgba(var(--accent-rgb), 0.1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}

	.btn-sm {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-2xs);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--text-secondary);
	}

	.btn-sm:hover {
		background: var(--surface-hover);
	}

	/* Actions */
	.actions {
		display: flex;
		gap: var(--space-3);
	}

	.btn-primary, .btn-secondary {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-size: var(--text-sm);
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
		transform: translateY(-1px);
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

	.btn-secondary:hover {
		background: var(--surface-hover);
	}

	.error-msg {
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: rgba(255, 68, 68, 0.1);
		border: 1px solid rgba(255, 68, 68, 0.2);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		color: var(--danger);
	}

	/* Preview panel */
	.preview-panel {
		position: sticky;
		top: var(--space-6);
		min-height: 500px;
	}

	.pdf-preview {
		width: 100%;
		height: 80vh;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
	}

	.preview-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 500px;
		border: 2px dashed var(--border);
		border-radius: var(--radius-md);
		text-align: center;
		padding: var(--space-8);
	}

	.preview-icon {
		font-size: 48px;
		margin-bottom: var(--space-4);
		opacity: 0.3;
	}

	.preview-empty p {
		color: var(--text-muted);
		font-size: var(--text-sm);
		max-width: 280px;
	}
</style>
