import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const { id } = params;
	if (!id) throw error(404, 'Beat no encontrado');
	return { beatId: id };
};
