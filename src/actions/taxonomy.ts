/**
 * Taxonomia (categorias e tags) em `src/data/categories.json` e `tags.json` via `node:fs/promises`.
 * Categorias: `{ id, name, slug, seo? }`; tags: `{ id, name, slug }`.
 */

import { randomUUID } from 'node:crypto';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
	type CategoryItem,
	type CategorySeo,
	type TaxonomyItem,
	TAGS_JSON,
	readCategories,
	readTaxonomyFile,
	writeCategoriesFile,
	writeTaxonomyFile,
} from '../lib/taxonomy-data';
import { requireAdminCookies } from '../lib/admin-session';

function normSlug(s: string): string {
	return s.trim().toLowerCase();
}

const nameSchema = z.string().min(1, 'O nome é obrigatório.').max(80);
const slugSchema = z
	.string()
	.min(1, 'O slug é obrigatório.')
	.max(80)
	.regex(/^[\w-]+$/, 'Use apenas letras, números e hífens no slug.');

const idSchema = z.string().uuid('Identificador inválido.');

const addInputSchema = z.object({
	name: nameSchema,
	slug: slugSchema,
});

function sortItems(items: TaxonomyItem[]): TaxonomyItem[] {
	return [...items].sort((a, b) =>
		a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }),
	);
}

function seoFromUpdatePayload(input: {
	metaTitle: string;
	metaDescription: string;
	noindex: boolean;
	ogImage: string;
}): CategorySeo | undefined {
	const metaTitle = input.metaTitle.trim().slice(0, 70);
	const metaDescription = input.metaDescription.trim().slice(0, 160);
	const ogImage = input.ogImage.trim().slice(0, 500);
	const seo: CategorySeo = {};
	if (metaTitle) seo.metaTitle = metaTitle;
	if (metaDescription) seo.metaDescription = metaDescription;
	if (input.noindex) seo.noindex = true;
	if (ogImage) seo.ogImage = ogImage;
	if (!seo.metaTitle && !seo.metaDescription && !seo.noindex && !seo.ogImage) return undefined;
	return seo;
}

/**
 * Grupo de actions — utilizar no cliente: `actions.taxonomy.addCategory`, etc.
 */
export const taxonomy = {
	addCategory: defineAction({
		accept: 'json',
		input: addInputSchema,
		handler: async ({ name, slug }, context) => {
			requireAdminCookies(context.cookies);
			const items = await readCategories();
			const key = normSlug(slug);
			if (items.some((x) => normSlug(x.slug) === key)) {
				return { categories: items, added: false as const };
			}
			const row: CategoryItem = {
				id: randomUUID(),
				name: name.trim(),
				slug: key,
			};
			items.push(row);
			await writeCategoriesFile(items);
			return { categories: await readCategories(), added: true as const };
		},
	}),

	deleteCategory: defineAction({
		accept: 'json',
		input: z.object({ id: idSchema }),
		handler: async ({ id }, context) => {
			requireAdminCookies(context.cookies);
			const items = await readCategories();
			const next = items.filter((x) => x.id !== id);
			const removed = next.length !== items.length;
			if (removed) {
				await writeCategoriesFile(next);
			}
			return { categories: removed ? await readCategories() : items, removed };
		},
	}),

	updateCategorySeo: defineAction({
		accept: 'json',
		input: z.object({
			id: idSchema,
			metaTitle: z.string().max(70),
			metaDescription: z.string().max(160),
			noindex: z.boolean(),
			ogImage: z.string().max(500),
		}),
		handler: async (input, context) => {
			requireAdminCookies(context.cookies);
			const items = await readCategories();
			const idx = items.findIndex((x) => x.id === input.id);
			if (idx === -1) {
				return { categories: items, updated: false as const };
			}
			const seo = seoFromUpdatePayload(input);
			const prev = items[idx];
			let nextRow: CategoryItem;
			if (seo) {
				nextRow = { ...prev, seo };
			} else {
				const { seo: _drop, ...rest } = prev;
				nextRow = rest;
			}
			items[idx] = nextRow;
			await writeCategoriesFile(items);
			return { categories: await readCategories(), updated: true as const };
		},
	}),

	addTag: defineAction({
		accept: 'json',
		input: addInputSchema,
		handler: async ({ name, slug }, context) => {
			requireAdminCookies(context.cookies);
			const items = await readTaxonomyFile(TAGS_JSON);
			const key = normSlug(slug);
			if (items.some((x) => normSlug(x.slug) === key)) {
				return { tags: sortItems(items), added: false as const };
			}
			const row: TaxonomyItem = {
				id: randomUUID(),
				name: name.trim(),
				slug: key,
			};
			items.push(row);
			await writeTaxonomyFile(TAGS_JSON, items);
			return { tags: sortItems(items), added: true as const };
		},
	}),

	deleteTag: defineAction({
		accept: 'json',
		input: z.object({ id: idSchema }),
		handler: async ({ id }, context) => {
			requireAdminCookies(context.cookies);
			const items = await readTaxonomyFile(TAGS_JSON);
			const next = items.filter((x) => x.id !== id);
			const removed = next.length !== items.length;
			if (removed) {
				await writeTaxonomyFile(TAGS_JSON, next);
			}
			return { tags: sortItems(next), removed };
		},
	}),
};
