import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/contracts/[file]
 * Returns the raw markdown text of a contract file.
 * Used by the contract editor to load the original template.
 */
export const GET: RequestHandler = async ({ params }) => {
	const { file } = params;

	// Validate file name to prevent path traversal
	const validFiles = ['01-mp3', '02-wav', '03-premium', '04-ilimitada', '05-exclusiva'];
	if (!validFiles.includes(file)) {
		return json({ error: 'Invalid contract file' }, { status: 400 });
	}

	try {
		const filePath = join(process.cwd(), 'contracts', `${file}.md`);
		const content = await readFile(filePath, 'utf-8');
		return json({ content, file });
	} catch {
		return json({ error: 'Contract file not found' }, { status: 404 });
	}
};
