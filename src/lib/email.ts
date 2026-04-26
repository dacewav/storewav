/**
 * Email delivery service — sends post-purchase emails with download links.
 * Uses Resend API (https://resend.com) — simple, Workers-compatible.
 *
 * Falls back to logging if RESEND_API_KEY is not configured.
 * Supports customizable templates stored in Firebase.
 */

export type DeliveryEmailData = {
	orderId: string;
	buyerEmail: string;
	buyerName: string;
	items: Array<{
		beatName: string;
		licenseName: string;
		downloadUrl: string;
	}>;
	totalMXN: number;
	totalUSD: number;
	contractPdfBase64?: string; // PDF attachment
	brandName?: string;
};

type EmailTemplate = {
	brandName: string;
	accentColor: string;
	logoUrl: string;
	headerEmoji: string;
	headerTitle: string;
	headerSubtitle: string;
	downloadBtnText: string;
	downloadBtnColor: string;
	showContractNote: boolean;
	contractTitle: string;
	contractText: string;
	footerText: string;
	footerSupportText: string;
	footerCopyright: string;
	emailSubject: string;
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
	footerCopyright: `© ${new Date().getFullYear()} DACEWAV. Todos los derechos reservados.`,
	emailSubject: '✅ Tu compra en {{brandName}} — {{beatNames}}',
	showTotal: true,
	showOrderNumber: true,
};

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

/** Fetch custom template from Firebase, fallback to default */
async function getEmailTemplate(): Promise<EmailTemplate> {
	try {
		const resp = await fetch(`${FIREBASE_DB}/settings/emailTemplates/delivery.json`);
		if (resp.ok) {
			const data = await resp.json();
			if (data) return { ...defaultTemplate, ...data };
		}
	} catch {
		// Fallback to default
	}
	return { ...defaultTemplate };
}

/** Interpolate template variables */
function interpolateVars(text: string, vars: Record<string, string>): string {
	return text
		.replace(/\{\{brandName\}\}/g, vars.brandName || 'DACEWAV')
		.replace(/\{\{buyerName\}\}/g, vars.buyerName || 'Cliente')
		.replace(/\{\{beatNames\}\}/g, vars.beatNames || 'Beat')
		.replace(/\{\{orderId\}\}/g, vars.orderId || '00000000')
		.replace(/\{\{totalMXN\}\}/g, vars.totalMXN || '0')
		.replace(/\{\{totalUSD\}\}/g, vars.totalUSD || '0');
}

/**
 * Send post-purchase delivery email.
 */
export async function sendDeliveryEmail(
	data: DeliveryEmailData,
	env: { RESEND_API_KEY?: string }
): Promise<{ ok: boolean; error?: string }> {
	const apiKey = env.RESEND_API_KEY;

	if (!apiKey) {
		console.warn('[Email] RESEND_API_KEY not configured — logging email instead');
		logEmail(data);
		return { ok: true }; // Don't block order processing
	}

	// Fetch custom template
	const tmpl = await getEmailTemplate();
	const brandName = data.brandName ?? tmpl.brandName;
	const beatNames = data.items.map(i => i.beatName).join(', ');
	const vars = {
		brandName,
		buyerName: data.buyerName,
		beatNames,
		orderId: data.orderId.slice(0, 8).toUpperCase(),
		totalMXN: String(data.totalMXN),
		totalUSD: String(data.totalUSD),
	};

	const itemsHtml = data.items.map(item => `
		<div style="padding: 16px; background: #1a1a1a; border-radius: 8px; margin-bottom: 12px;">
			<div style="font-weight: 700; color: #fff; font-size: 16px; margin-bottom: 4px;">
				${escapeHtml(item.beatName)}
			</div>
			<div style="color: #888; font-size: 13px; margin-bottom: 12px;">
				Licencia: ${escapeHtml(item.licenseName)}
			</div>
			<a href="${item.downloadUrl}"
				style="display: inline-block; padding: 10px 24px; background: ${tmpl.downloadBtnColor}; color: #fff;
				text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
				${escapeHtml(tmpl.downloadBtnText)}
			</a>
		</div>
	`).join('');

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
	<div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
		<!-- Header -->
		<div style="text-align: center; margin-bottom: 32px;">
			${tmpl.logoUrl ? `<img src="${tmpl.logoUrl}" alt="${escapeHtml(brandName)}" style="max-height: 40px; margin-bottom: 8px;" />` : ''}
			<div style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">
				${escapeHtml(brandName)}<span style="color: ${tmpl.accentColor};">.</span>
			</div>
		</div>

		<!-- Success -->
		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 48px; margin-bottom: 12px;">${tmpl.headerEmoji}</div>
			<h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
				${escapeHtml(tmpl.headerTitle)}
			</h1>
			<p style="color: #888; font-size: 14px; margin: 0;">
				${escapeHtml(interpolateVars(tmpl.headerSubtitle, vars))}
			</p>
		</div>

		${tmpl.showOrderNumber ? `
		<!-- Order ID -->
		<div style="text-align: center; margin-bottom: 24px; padding: 12px; background: #111; border-radius: 8px;">
			<span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
				Pedido
			</span>
			<div style="color: #fff; font-family: monospace; font-size: 14px; margin-top: 4px;">
				#${vars.orderId}
			</div>
		</div>
		` : ''}

		<!-- Items -->
		${itemsHtml}

		${tmpl.showContractNote && data.contractPdfBase64 ? `
		<!-- Contract note -->
		<div style="padding: 16px; background: #111; border-radius: 8px; margin-top: 24px; border-left: 3px solid ${tmpl.accentColor};">
			<div style="color: #fff; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
				${escapeHtml(tmpl.contractTitle)}
			</div>
			<div style="color: #888; font-size: 13px;">
				${escapeHtml(tmpl.contractText)}
			</div>
		</div>
		` : ''}

		${tmpl.showTotal ? `
		<!-- Total -->
		<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; text-align: right;">
			<span style="color: #888; font-size: 13px;">Total: </span>
			<span style="color: ${tmpl.accentColor}; font-weight: 800; font-size: 18px;">
				$${data.totalMXN} MXN
			</span>
			<span style="color: #666; font-size: 12px; margin-left: 8px;">
				($${data.totalUSD} USD)
			</span>
		</div>
		` : ''}

		<!-- Footer -->
		<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; text-align: center;">
			<p style="color: #888; font-size: 13px; margin-bottom: 12px;">
				${escapeHtml(tmpl.footerText)}
			</p>
			<a href="https://dacewav.store/account/orders"
				style="display: inline-block; padding: 10px 24px; background: #222; color: #fff;
				text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;
				border: 1px solid #333;">
				📦 Mis órdenes
			</a>
			<p style="color: #555; font-size: 12px; line-height: 1.6; margin-top: 16px;">
				${escapeHtml(tmpl.footerSupportText)}
			</p>
			<p style="color: #333; font-size: 11px; margin-top: 12px;">
				${escapeHtml(tmpl.footerCopyright)}
			</p>
		</div>
	</div>
</body>
</html>`;

	// Build attachments
	const attachments: Array<{ filename: string; content: string }> = [];
	if (data.contractPdfBase64) {
		attachments.push({
			filename: `contrato-${data.orderId.slice(0, 8)}.pdf`,
			content: data.contractPdfBase64,
		});
	}

	try {
		const resp = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: `${brandName} <ventas@dacewav.store>`,
				to: data.buyerEmail,
				subject: escapeHtml(interpolateVars(tmpl.emailSubject, vars)),
				html,
				attachments: attachments.length > 0 ? attachments : undefined,
			}),
		});

		if (!resp.ok) {
			const err = await resp.text();
			console.error('[Email] Resend error:', err);
			return { ok: false, error: err };
		}

		console.log(`[Email] Sent to ${data.buyerEmail} — order ${data.orderId}`);
		return { ok: true };
	} catch (err) {
		console.error('[Email] Send failed:', err);
		return { ok: false, error: String(err) };
	}
}

/** Log email to console when RESEND_API_KEY is not set */
function logEmail(data: DeliveryEmailData) {
	console.log('═══════════════════════════════════════');
	console.log('[EMAIL DELIVERY] (dry run — no RESEND_API_KEY)');
	console.log(`To: ${data.buyerEmail}`);
	console.log(`Subject: ✅ Tu compra en DACEWAV`);
	console.log(`Items:`);
	for (const item of data.items) {
		console.log(`  - ${item.beatName} (${item.licenseName})`);
		console.log(`    Download: ${item.downloadUrl}`);
	}
	console.log(`Total: $${data.totalMXN} MXN / $${data.totalUSD} USD`);
	console.log('═══════════════════════════════════════');
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
