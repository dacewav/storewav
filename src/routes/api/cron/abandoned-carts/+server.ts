import { json } from '@sveltejs/kit';
import { processAbandonedCarts } from '$lib/cron/abandonedCarts';
import type { RequestHandler } from './$types';

/**
 * GET /api/cron/abandoned-carts
 * Checks for abandoned carts in Firebase RTDB and sends reminder emails.
 * Called by Cloudflare Workers Cron Triggers or external cron service.
 */

export const GET: RequestHandler = async ({ platform }) => {
	const env = (platform?.env ?? {}) as Record<string, string | undefined>;
	const result = await processAbandonedCarts(env);
	return json(result);
};
