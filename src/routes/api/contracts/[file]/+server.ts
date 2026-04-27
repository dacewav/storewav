import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/contracts/[file]
 * Returns the raw markdown text of a contract file.
 * Uses Vite's ?raw import to bundle the text at build time (Cloudflare-safe).
 */

// Import all contract files at build time
import mp3 from '../../../../../contracts/01-mp3.md?raw';
import wav from '../../../../../contracts/02-wav.md?raw';
import premium from '../../../../../contracts/03-premium.md?raw';
import ilimitada from '../../../../../contracts/04-ilimitada.md?raw';
import exclusiva from '../../../../../contracts/05-exclusiva.md?raw';

const contracts: Record<string, string> = {
	'01-mp3': mp3,
	'02-wav': wav,
	'03-premium': premium,
	'04-ilimitada': ilimitada,
	'05-exclusiva': exclusiva,
};

export const GET: RequestHandler = async ({ params }) => {
	const { file } = params;

	if (!contracts[file]) {
		return json({ error: 'Invalid contract file' }, { status: 400 });
	}

	return json({ content: contracts[file], file });
};
