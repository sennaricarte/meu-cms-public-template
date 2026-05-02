/**
 * Modelo e leitura/escrita dos ficheiros `src/data/categories.json` e `tags.json`
 * (estilo WordPress: id, name, slug). Categorias podem incluir bloco `seo`.
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type TaxonomyItem = {
	/** Identificador estável (UUID). */
	id: string;
	/** Nome apresentado no site. */
	name: string;
	/** Segmento de URL (letras minúsculas, números, hífens). */
	slug: string;
};

/** Metadados SEO opcionais só para categorias (arquivo `/blog/categoria/…`). */
export type CategorySeo = {
	/** Título para `<title>` / SERPs (se vazio, usa o nome da categoria). */
	metaTitle?: string;
	metaDescription?: string;
	/** Não indexar a página de arquivo desta categoria. */
	noindex?: boolean;
	/** Caminho público ou URL absoluta para Open Graph / Twitter. */
	ogImage?: string;
};

export type CategoryItem = TaxonomyItem & {
	seo?: CategorySeo;
};

export const CATEGORIES_JSON = join(process.cwd(), 'src', 'data', 'categories.json');
export const TAGS_JSON = join(process.cwd(), 'src', 'data', 'tags.json');

function errnoCode(err: unknown): string | undefined {
	return err && typeof err === 'object' && 'code' in err
		? String((err as NodeJS.ErrnoException).code)
		: undefined;
}

/** Garante diretório + ficheiro inicial `[]` se ainda não existir (ENOENT). */
async function readUtf8TaxonomyFile(filePath: string): Promise<string> {
	try {
		return await readFile(filePath, 'utf-8');
	} catch (err: unknown) {
		if (errnoCode(err) !== 'ENOENT') throw err;
		await mkdir(dirname(filePath), { recursive: true });
		const seed = '[]\n';
		await writeFile(filePath, seed, 'utf-8');
		return seed;
	}
}

async function writeJsonFileRobust(filePath: string, payload: string): Promise<void> {
	await mkdir(dirname(filePath), { recursive: true });
	try {
		await writeFile(filePath, payload, 'utf-8');
	} catch (err: unknown) {
		const code = errnoCode(err);
		if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
			throw new Error(
				'Não foi possível gravar no disco (ficheiro só de leitura ou sem permissão). ' +
					'Em deploy na Vercel as gravações locais em JSON não são suportadas — usa `npm run dev` na tua máquina ou um backend/CMS.',
			);
		}
		throw err;
	}
}

function slugifyLabel(raw: string): string {
	return raw
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

/**
 * Converte JSON legado (string, ou `{ name, slug }` sem `id`) para `TaxonomyItem[]`.
 * Entradas sem `id` recebem `id: ''` para serem preenchidas em `readTaxonomyFile`.
 */
function parseTaxonomyJson(raw: string): TaxonomyItem[] {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return [];
	}
	if (!Array.isArray(data)) return [];

	const out: TaxonomyItem[] = [];
	for (const x of data) {
		if (typeof x === 'string') {
			const name = x.trim();
			if (!name) continue;
			out.push({
				id: '',
				name,
				slug: slugifyLabel(name) || 'item',
			});
			continue;
		}
		if (x && typeof x === 'object' && 'name' in x) {
			const o = x as Record<string, unknown>;
			const name = String(o.name ?? '').trim();
			let slug = String(o.slug ?? '').trim();
			if (!name) continue;
			if (!slug) slug = slugifyLabel(name) || 'item';
			const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : '';
			out.push({ id, name, slug });
		}
	}
	return out;
}

function parseCategorySeo(raw: unknown): CategorySeo | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const o = raw as Record<string, unknown>;
	const metaTitle =
		typeof o.metaTitle === 'string' && o.metaTitle.trim() ? o.metaTitle.trim().slice(0, 70) : undefined;
	const metaDescription =
		typeof o.metaDescription === 'string' && o.metaDescription.trim()
			? o.metaDescription.trim().slice(0, 160)
			: undefined;
	const noindex = o.noindex === true;
	const ogImage =
		typeof o.ogImage === 'string' && o.ogImage.trim()
			? o.ogImage.trim().slice(0, 500)
			: undefined;
	if (!metaTitle && !metaDescription && !noindex && !ogImage) return undefined;
	const seo: CategorySeo = {};
	if (metaTitle) seo.metaTitle = metaTitle;
	if (metaDescription) seo.metaDescription = metaDescription;
	if (noindex) seo.noindex = true;
	if (ogImage) seo.ogImage = ogImage;
	return seo;
}

/**
 * JSON de categorias: mesmas formas legadas que `parseTaxonomyJson`, mais `seo` opcional.
 */
function parseCategoriesJson(raw: string): CategoryItem[] {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return [];
	}
	if (!Array.isArray(data)) return [];

	const out: CategoryItem[] = [];
	for (const x of data) {
		if (typeof x === 'string') {
			const name = x.trim();
			if (!name) continue;
			out.push({
				id: '',
				name,
				slug: slugifyLabel(name) || 'item',
			});
			continue;
		}
		if (x && typeof x === 'object' && 'name' in x) {
			const o = x as Record<string, unknown>;
			const name = String(o.name ?? '').trim();
			let slug = String(o.slug ?? '').trim();
			if (!name) continue;
			if (!slug) slug = slugifyLabel(name) || 'item';
			const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : '';
			const seo = parseCategorySeo(o.seo);
			const row: CategoryItem = { id, name, slug };
			if (seo) row.seo = seo;
			out.push(row);
		}
	}
	return out;
}

export function sortCategoryItems(items: CategoryItem[]): CategoryItem[] {
	return [...items].sort((a, b) =>
		a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }),
	);
}

export async function writeCategoriesFile(items: CategoryItem[]): Promise<void> {
	const sorted = sortCategoryItems(items);
	await writeJsonFileRobust(CATEGORIES_JSON, JSON.stringify(sorted, null, 2) + '\n');
}

export async function readTaxonomyFile(filePath: string): Promise<TaxonomyItem[]> {
	const raw = await readUtf8TaxonomyFile(filePath);
	const items = parseTaxonomyJson(raw);
	let dirty = false;
	for (const it of items) {
		if (!it.id) {
			it.id = randomUUID();
			dirty = true;
		}
	}
	if (dirty) {
		await writeTaxonomyFile(filePath, items);
	}
	return items;
}

export async function writeTaxonomyFile(filePath: string, items: TaxonomyItem[]): Promise<void> {
	const sorted = [...items].sort((a, b) =>
		a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }),
	);
	await writeJsonFileRobust(filePath, JSON.stringify(sorted, null, 2) + '\n');
}

export async function readCategories(): Promise<CategoryItem[]> {
	const raw = await readUtf8TaxonomyFile(CATEGORIES_JSON);
	const items = parseCategoriesJson(raw);
	let dirty = false;
	for (const it of items) {
		if (!it.id) {
			it.id = randomUUID();
			dirty = true;
		}
	}
	if (dirty) {
		await writeCategoriesFile(items);
	}
	return items;
}

export async function readTags(): Promise<TaxonomyItem[]> {
	return readTaxonomyFile(TAGS_JSON);
}
