/**
 * Cart abandonment tracking — stores active carts in Firebase RTDB.
 * Call from client when cart changes and user is logged in.
 */

const FIREBASE_DB = 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com';

export type CartAbandonmentData = {
	uid: string;
	email: string;
	displayName: string;
	items: Array<{
		beatId: string;
		beatName: string;
		licenseName: string;
		priceMXN: number;
		priceUSD: number;
	}>;
	totalMXN: number;
	totalUSD: number;
	cartUrl: string;
	lastUpdated: number;
};

/**
 * Send abandoned cart reminder email via Resend.
 */
export async function sendAbandonedCartEmail(
	data: CartAbandonmentData,
	env: { RESEND_API_KEY?: string }
): Promise<{ ok: boolean; error?: string }> {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn('[Email] No RESEND_API_KEY — skipping abandoned cart email');
		return { ok: true };
	}

	const brandName = 'DACEWAV';
	const beatNames = data.items.map(i => i.beatName).join(', ');
	const itemsHtml = data.items.map(item => `
		<div style="padding: 12px 16px; background: #1a1a1a; border-radius: 8px; margin-bottom: 8px;">
			<span style="color: #fff; font-weight: 600; font-size: 14px;">${escapeHtml(item.beatName)}</span>
			<span style="color: #666; font-size: 12px; margin-left: 8px;">${escapeHtml(item.licenseName)}</span>
			<span style="color: #dc2626; font-size: 13px; float: right;">$${item.priceMXN} MXN</span>
		</div>
	`).join('');

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
	<div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">
				${escapeHtml(brandName)}<span style="color: #dc2626;">.</span>
			</div>
		</div>

		<div style="text-align: center; margin-bottom: 32px;">
			<div style="font-size: 48px; margin-bottom: 12px;">🛒</div>
			<h1 style="color: #fff; font-size: 24px; font-weight: 800; margin: 0 0 8px;">
				¿Te olvidaste algo?
			</h1>
			<p style="color: #888; font-size: 14px; margin: 0;">
				Tenés ${data.items.length} beat${data.items.length > 1 ? 's' : ''} esperándote en tu carrito.
			</p>
		</div>

		${itemsHtml}

		<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; text-align: right;">
			<span style="color: #888; font-size: 13px;">Total: </span>
			<span style="color: #dc2626; font-weight: 800; font-size: 18px;">
				$${data.totalMXN} MXN
			</span>
			<span style="color: #666; font-size: 12px; margin-left: 8px;">
				($${data.totalUSD} USD)
			</span>
		</div>

		<div style="text-align: center; margin-top: 32px;">
			<a href="${data.cartUrl}"
				style="display: inline-block; padding: 14px 32px; background: #dc2626; color: #fff;
				text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
				🛒 Completar compra
			</a>
		</div>

		<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; text-align: center;">
			<p style="color: #555; font-size: 12px;">
				Si no completaste la compra, podés ignorar este email. Tu carrito se guardará por 7 días.
			</p>
			<p style="color: #333; font-size: 11px; margin-top: 12px;">
				© ${new Date().getFullYear()} ${escapeHtml(brandName)}. Todos los derechos reservados.
			</p>
		</div>
	</div>
</body>
</html>`;

	try {
		const resp = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: `${brandName} <ventas@dacewav.store>`,
				to: data.email,
				subject: `🛒 Tu carrito te espera en ${brandName} — ${beatNames}`,
				html,
			}),
		});

		if (!resp.ok) {
			const err = await resp.text();
			console.error('[Email] Abandoned cart error:', err);
			return { ok: false, error: err };
		}

		console.log(`[Email] Abandoned cart sent to ${data.email}`);
		return { ok: true };
	} catch (err) {
		console.error('[Email] Abandoned cart failed:', err);
		return { ok: false, error: String(err) };
	}
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
