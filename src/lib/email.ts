/**
 * Email delivery service — sends post-purchase emails with download links.
 * Uses Resend API (https://resend.com) — simple, Workers-compatible.
 *
 * Falls back to logging if RESEND_API_KEY is not configured.
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

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

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

	const brandName = data.brandName ?? 'DACEWAV';
	const itemsHtml = data.items.map(item => `
		<div style="padding: 16px; background: #1a1a1a; border-radius: 8px; margin-bottom: 12px;">
			<div style="font-weight: 700; color: #fff; font-size: 16px; margin-bottom: 4px;">
				${escapeHtml(item.beatName)}
			</div>
			<div style="color: #888; font-size: 13px; margin-bottom: 12px;">
				Licencia: ${escapeHtml(item.licenseName)}
			</div>
			<a href="${item.downloadUrl}"
				style="display: inline-block; padding: 10px 24px; background: #dc2626; color: #fff;
				text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
				⬇ Descargar
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
			<div style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">
				${escapeHtml(brandName)}<span style="color: #dc2626;">.</span>
			</div>
		</div>

		<!-- Success -->
		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 48px; margin-bottom: 12px;">✅</div>
			<h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
				¡Compra exitosa!
			</h1>
			<p style="color: #888; font-size: 14px; margin: 0;">
				Gracias por tu compra, ${escapeHtml(data.buyerName)}. Aquí están tus archivos:
			</p>
		</div>

		<!-- Order ID -->
		<div style="text-align: center; margin-bottom: 24px; padding: 12px; background: #111; border-radius: 8px;">
			<span style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
				Pedido
			</span>
			<div style="color: #fff; font-family: monospace; font-size: 14px; margin-top: 4px;">
				#${data.orderId.slice(0, 8).toUpperCase()}
			</div>
		</div>

		<!-- Items -->
		${itemsHtml}

		<!-- Contract note -->
		${data.contractPdfBase64 ? `
		<div style="padding: 16px; background: #111; border-radius: 8px; margin-top: 24px; border-left: 3px solid #dc2626;">
			<div style="color: #fff; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
				📄 Contrato de licencia
			</div>
			<div style="color: #888; font-size: 13px;">
				El contrato de licencia está adjunto a este email como PDF. Consérvalo como comprobante de tu compra.
			</div>
		</div>
		` : ''}

		<!-- Total -->
		<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; text-align: right;">
			<span style="color: #888; font-size: 13px;">Total: </span>
			<span style="color: #dc2626; font-weight: 800; font-size: 18px;">
				$${data.totalMXN} MXN
			</span>
			<span style="color: #666; font-size: 12px; margin-left: 8px;">
				($${data.totalUSD} USD)
			</span>
		</div>

		<!-- Footer -->
		<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; text-align: center;">
			<p style="color: #555; font-size: 12px; line-height: 1.6;">
				Si tienes problemas con la descarga, contáctanos por
				<a href="https://wa.me" style="color: #dc2626;">WhatsApp</a>
				o responde a este email.
			</p>
			<p style="color: #333; font-size: 11px; margin-top: 12px;">
				© ${new Date().getFullYear()} ${escapeHtml(brandName)}. Todos los derechos reservados.
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
				subject: `✅ Tu compra en ${brandName} — ${data.items.map(i => i.beatName).join(', ')}`,
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
