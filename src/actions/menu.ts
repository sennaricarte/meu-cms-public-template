/**
 * Gravação dos menus em `src/data/menu-main.json` e `menu-footer.json` com `node:fs/promises`.
 */

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAdminCookies } from '../lib/admin-session';
import {
	normalizeMenuHref,
	sortMenuItems,
	type MenuItem,
	writeFooterMenuFile,
	writeMainMenuFile,
} from '../lib/menu-data';

const menuItemMainSchema = z.object({
	id: z.string().min(1, 'O id do item é obrigatório.').max(80),
	label: z.string().min(1, 'O nome do link é obrigatório.').max(120),
	url: z.string().min(1, 'URL ou slug obrigatório.').max(512),
	order: z.number().int(),
});

const menuItemFooterSchema = menuItemMainSchema.extend({
	column: z.string().min(1, 'A coluna é obrigatória no rodapé.').max(40),
});

export const saveMenu = defineAction({
	accept: 'json',
	input: z.discriminatedUnion('menu', [
		z.object({
			menu: z.literal('main'),
			items: z.array(menuItemMainSchema).max(100),
		}),
		z.object({
			menu: z.literal('footer'),
			items: z.array(menuItemFooterSchema).max(100),
		}),
	]),
	handler: async (input, context) => {
		requireAdminCookies(context.cookies);

		if (!Array.isArray(input.items)) {
			throw new Error('Os dados recebidos não são um array de itens. Gravação cancelada.');
		}

		if (input.menu === 'main') {
			const normalized: MenuItem[] = input.items.map((row) => ({
				id: row.id.trim(),
				label: row.label.trim(),
				url: normalizeMenuHref(row.url.trim()),
				order: row.order,
			}));
			await writeMainMenuFile(sortMenuItems(normalized));
			return { ok: true as const, menu: 'main' as const };
		}

		const normalized: MenuItem[] = input.items.map((row) => ({
			id: row.id.trim(),
			label: row.label.trim(),
			url: normalizeMenuHref(row.url.trim()),
			order: row.order,
			column: row.column.trim(),
		}));
		await writeFooterMenuFile(sortMenuItems(normalized));
		return { ok: true as const, menu: 'footer' as const };
	},
});
