import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { requireAdminCookies } from '../lib/admin-session';

const SAFE_MEDIA_FILENAME = /^[a-zA-Z0-9._-]+\.(?:webp|png|jpe?g|gif|svg|avif)$/i;

export const deleteMediaFile = defineAction({
	accept: 'json',
	input: z.object({
		filename: z.string().regex(SAFE_MEDIA_FILENAME, 'Nome de arquivo inválido.'),
	}),
	handler: async ({ filename }, context) => {
		requireAdminCookies(context.cookies);
		const target = join(process.cwd(), 'public', 'uploads', filename);
		await unlink(target);
		return { deleted: filename };
	},
});
