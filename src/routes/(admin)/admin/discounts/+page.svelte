<script lang="ts">
	import { onMount } from 'svelte';
	import { analytics } from '$lib/stores';

	const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

	type DiscountCode = {
		code: string;
		type: 'percent' | 'fixed';
		amount: number; // percentage or fixed amount in USD
		maxUses: number;
		usedCount: number;
		expiresAt: string; // ISO date
		applicableLicenses: string[]; // empty = all
		active: boolean;
		createdAt: number;
	};

	let codes = $state<DiscountCode[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let editingCode = $state<string | null>(null);
	let showForm = $state(false);

	// Form state
	let form = $state({
		code: '',
		type: 'percent' as 'percent' | 'fixed',
		amount: 10,
		maxUses: 100,
		expiresAt: '',
		applicableLicenses: [] as string[],
		active: true,
	});

	const licenseOptions = ['MP3', 'WAV', 'Premium', 'Ilimitada', 'Exclusiva'];

	function resetForm() {
		form = {
			code: '',
			type: 'percent',
			amount: 10,
			maxUses: 100,
			expiresAt: '',
			applicableLicenses: [],
			active: true,
		};
		editingCode = null;
		showForm = false;
	}

	async function loadCodes() {
		loading = true;
		try {
			const resp = await fetch(`${FIREBASE_DB}/discountCodes.json`);
			if (resp.ok) {
				const data = await resp.json();
				if (data) {
					codes = Object.entries(data).map(([key, val]: [string, any]) => ({
						...val,
						code: key,
					}));
				} else {
					codes = [];
				}
			}
		} catch (e) {
			console.error('Failed to load discount codes:', e);
		} finally {
			loading = false;
		}
	}

	async function saveCode() {
		if (!form.code.trim()) {
			alert('El código no puede estar vacío');
			return;
		}

		saving = true;
		const codeKey = form.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

		const payload: Omit<DiscountCode, 'code' | 'usedCount' | 'createdAt'> = {
			type: form.type,
			amount: form.amount,
			maxUses: form.maxUses,
			expiresAt: form.expiresAt || '',
			applicableLicenses: form.applicableLicenses,
			active: form.active,
		};

		try {
			const method = editingCode ? 'PATCH' : 'PUT';
			const url = editingCode
				? `${FIREBASE_DB}/discountCodes/${editingCode}.json`
				: `${FIREBASE_DB}/discountCodes/${codeKey}.json`;

			const body = editingCode
				? JSON.stringify(payload)
				: JSON.stringify({ ...payload, usedCount: 0, createdAt: Date.now() });

			const resp = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body,
			});

			if (resp.ok) {
				analytics.track('admin', 'discount_save', { lbl: codeKey });
				resetForm();
				await loadCodes();
			} else {
				alert('Error al guardar el código');
			}
		} catch (e) {
			alert('Error al guardar: ' + (e as Error).message);
		} finally {
			saving = false;
		}
	}

	async function deleteCode(code: string) {
		if (!confirm(`¿Eliminar el código "${code}"?`)) return;

		try {
			await fetch(`${FIREBASE_DB}/discountCodes/${code}.json`, { method: 'DELETE' });
			await loadCodes();
		} catch (e) {
			alert('Error al eliminar: ' + (e as Error).message);
		}
	}

	function editCode(code: DiscountCode) {
		editingCode = code.code;
		form = {
			code: code.code,
			type: code.type,
			amount: code.amount,
			maxUses: code.maxUses,
			expiresAt: code.expiresAt,
			applicableLicenses: code.applicableLicenses || [],
			active: code.active,
		};
		showForm = true;
	}

	function toggleLicense(license: string) {
		if (form.applicableLicenses.includes(license)) {
			form.applicableLicenses = form.applicableLicenses.filter(l => l !== license);
		} else {
			form.applicableLicenses = [...form.applicableLicenses, license];
		}
	}

	function isExpired(expiresAt: string): boolean {
		if (!expiresAt) return false;
		return new Date(expiresAt) < new Date();
	}

	function isMaxedOut(code: DiscountCode): boolean {
		return code.usedCount >= code.maxUses;
	}

	function getStatus(code: DiscountCode): { label: string; color: string } {
		if (!code.active) return { label: 'Inactivo', color: 'var(--text-muted)' };
		if (isExpired(code.expiresAt)) return { label: 'Expirado', color: '#ef4444' };
		if (isMaxedOut(code)) return { label: 'Agotado', color: '#f59e0b' };
		return { label: 'Activo', color: '#22c55e' };
	}

	onMount(loadCodes);
</script>

<svelte:head>
	<title>Códigos de descuento — Admin</title>
</svelte:head>

<div class="discounts-page">
	<div class="page-header">
		<div>
			<h1 class="page-title">Códigos de descuento</h1>
			<p class="page-sub">Creá y administrá códigos promocionales para tu tienda.</p>
		</div>
		<button class="add-btn" onclick={() => { resetForm(); showForm = true; }}>
			+ Nuevo código
		</button>
	</div>

	{#if showForm}
		<div class="form-card">
			<h2 class="form-title">{editingCode ? 'Editar código' : 'Nuevo código'}</h2>

			<div class="form-grid">
				<div class="form-group">
					<label for="code">Código</label>
					<input
						id="code"
						type="text"
						bind:value={form.code}
						placeholder="VERANO2026"
						disabled={!!editingCode}
						style="text-transform: uppercase;"
					/>
					<span class="form-hint">Solo letras, números, guiones. Se convierte a mayúsculas.</span>
				</div>

				<div class="form-group">
					<label for="type">Tipo</label>
					<select id="type" bind:value={form.type}>
						<option value="percent">Porcentaje (%)</option>
						<option value="fixed">Monto fijo (USD)</option>
					</select>
				</div>

				<div class="form-group">
					<label for="amount">
						{form.type === 'percent' ? 'Descuento (%)' : 'Descuento (USD)'}
					</label>
					<input
						id="amount"
						type="number"
						bind:value={form.amount}
						min={1}
						max={form.type === 'percent' ? 100 : 1000}
					/>
				</div>

				<div class="form-group">
					<label for="maxUses">Usos máximos</label>
					<input id="maxUses" type="number" bind:value={form.maxUses} min={1} />
				</div>

				<div class="form-group">
					<label for="expiresAt">Expira</label>
					<input id="expiresAt" type="date" bind:value={form.expiresAt} />
					<span class="form-hint">Vacío = sin expiración</span>
				</div>

				<div class="form-group">
					<label>
						<input type="checkbox" bind:checked={form.active} />
						Activo
					</label>
				</div>
			</div>

			<div class="form-group">
				<label>Licencias aplicables</label>
				<div class="license-chips">
					{#each licenseOptions as license}
						<button
							class="chip"
							class:selected={form.applicableLicenses.length === 0 || form.applicableLicenses.includes(license)}
							onclick={() => toggleLicense(license)}
						>
							{license}
						</button>
					{/each}
				</div>
				<span class="form-hint">
					{form.applicableLicenses.length === 0 ? 'Aplica a todas las licencias' : `Solo: ${form.applicableLicenses.join(', ')}`}
				</span>
			</div>

			<div class="form-actions">
				<button class="save-btn" onclick={saveCode} disabled={saving}>
					{saving ? 'Guardando...' : (editingCode ? 'Actualizar' : 'Crear código')}
				</button>
				<button class="cancel-btn" onclick={resetForm}>Cancelar</button>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Cargando códigos...</div>
	{:else if codes.length === 0}
		<div class="empty">
			<p>No hay códigos de descuento.</p>
			<p class="empty-hint">Creá uno con el botón de arriba.</p>
		</div>
	{:else}
		<div class="codes-list">
			{#each codes as code}
				{@const status = getStatus(code)}
				<div class="code-card" class:inactive={!code.active}>
					<div class="code-header">
						<span class="code-name">{code.code}</span>
						<span class="code-status" style="color: {status.color}">{status.label}</span>
					</div>
					<div class="code-details">
						<span class="code-discount">
							{code.type === 'percent' ? `${code.amount}%` : `$${code.amount} USD`}
						</span>
						<span class="code-uses">
							{code.usedCount} / {code.maxUses} usos
						</span>
						{#if code.expiresAt}
							<span class="code-expiry" class:expired={isExpired(code.expiresAt)}>
								{isExpired(code.expiresAt) ? 'Expirado' : `Exp: ${code.expiresAt}`}
							</span>
						{/if}
						{#if code.applicableLicenses?.length > 0}
							<span class="code-licenses">{code.applicableLicenses.join(', ')}</span>
						{/if}
					</div>
					<div class="code-actions">
						<button class="edit-btn" onclick={() => editCode(code)}>Editar</button>
						<button class="delete-btn" onclick={() => deleteCode(code.code)}>Eliminar</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.discounts-page {
		padding: var(--space-6);
		max-width: 800px;
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

	.add-btn {
		padding: var(--space-2) var(--space-4);
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

	.add-btn:hover {
		background: var(--accent-dim);
		box-shadow: var(--glow-sm);
	}

	/* ── Form ── */
	.form-card {
		padding: var(--space-5);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-6);
	}

	.form-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--space-4);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.form-group label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input, .form-group select {
		padding: var(--space-2) var(--space-3);
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text);
		font-size: var(--text-sm);
	}

	.form-group input:focus, .form-group select:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
	}

	.form-hint {
		font-size: var(--text-2xs);
		color: var(--text-muted);
	}

	.license-chips {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin-top: var(--space-1);
	}

	.chip {
		padding: var(--space-1) var(--space-3);
		background: var(--surface2);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.chip.selected {
		background: rgba(var(--accent-rgb), 0.15);
		border-color: var(--accent);
		color: var(--accent);
	}

	.form-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.save-btn {
		padding: var(--space-2) var(--space-5);
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}

	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

	.cancel-btn {
		padding: var(--space-2) var(--space-4);
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	/* ── Codes list ── */
	.codes-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.code-card {
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		transition: all var(--duration-fast);
	}

	.code-card.inactive { opacity: 0.6; }

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2);
	}

	.code-name {
		font-family: var(--font-mono);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--text);
		letter-spacing: 0.05em;
	}

	.code-status {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 600;
	}

	.code-details {
		display: flex;
		gap: var(--space-4);
		flex-wrap: wrap;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-3);
	}

	.code-discount {
		font-weight: 600;
		color: var(--accent);
	}

	.code-expiry.expired { color: #ef4444; }

	.code-actions {
		display: flex;
		gap: var(--space-2);
	}

	.edit-btn, .delete-btn {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.edit-btn {
		background: rgba(var(--accent-rgb), 0.1);
		color: var(--accent);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
	}

	.delete-btn {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.loading, .empty {
		text-align: center;
		padding: var(--space-10);
		color: var(--text-muted);
	}

	.empty-hint {
		font-size: var(--text-sm);
		margin-top: var(--space-2);
	}
</style>
