/**
 * Menus em `src/data/menu-main.json` e `menu-footer.json` — arrays JSON de itens:
 * `{ id, label, url, order }` (principal) ou `{ id, label, url, order, column }` (rodapé).
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type MenuItem = {
	id: string;
	label: string;
	url: string;
	order: number;
	/** Rodapé: coluna de apresentação (string, ex.: "institutional" | "useful"). */
	column?: string;
};

export const MENU_MAIN_JSON = join(process.cwd(), 'src', 'data', 'menu-main.json');
export const MENU_FOOTER_JSON = join(process.cwd(), 'src', 'data', 'menu-footer.json');

function errnoCode(err: unknown): string | undefined {
	return err && typeof err === 'object' && 'code' in err
		? String((err as NodeJS.ErrnoException).code)
		: undefined;
}

async function writeJsonFileRobust(filePath: string, payload: string): Promise<void> {
	await mkdir(dirname(filePath), { recursive: true });
	try {
		await writeFile(filePath, payload, 'utf-8');
	} catch (err: unknown) {
		const code = errnoCode(err);
		if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
			throw new Error(
				'Não foi possível gravar no disco. Em deploy na Vercel o filesystem é só de leitura — usa desenvolvimento local ou um CMS.',
			);
		}
		throw err;
	}
}

async function readUtf8OrSeed(filePath: string, seedJson: string): Promise<string> {
	try {
		return await readFile(filePath, 'utf-8');
	} catch (err: unknown) {
		if (errnoCode(err) !== 'ENOENT') throw err;
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, seedJson, 'utf-8');
		return seedJson;
	}
}

/** Normaliza URL/slug: caminhos relativos passam a começar por `/`. */
export function normalizeMenuHref(raw: string): string {
	const t = raw.trim();
	if (!t) return '/';
	const lower = t.toLowerCase();
	if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
		return '/';
	}
	if (/^https?:\/\//i.test(t)) return t;
	if (t.startsWith('#')) return t;
	if (t.startsWith('/')) return t;
	return `/${t.replace(/^\/+/, '')}`;
}

export function sortMenuItems(items: MenuItem[]): MenuItem[] {
	return [...items].sort((a, b) =>
		a.order !== b.order ? a.order - b.order : a.label.localeCompare(b.label, 'pt', { sensitivity: 'base' }),
	);
}

function parseItemId(raw: unknown): string {
	if (typeof raw === 'string' && raw.trim()) return raw.trim().slice(0, 80);
	return randomUUID();
}

/** Normaliza `column` do rodapé para strings estáveis. */
function parseColumnString(raw: unknown): string | undefined {
	if (raw === undefined || raw === null) return undefined;
	if (typeof raw === 'string') {
		const s = raw.trim().toLowerCase();
		if (!s) return undefined;
		if (s === 'useful' || s === 'links úteis' || s === 'links uteis' || s === 'uteis' || s === 'úteis') {
			return 'useful';
		}
		if (s === 'institutional' || s === 'institucional') return 'institutional';
		return raw.trim().slice(0, 40);
	}
	return undefined;
}

/** Inferência a partir do título da coluna legada `{ columns: [{ title, items }] }`. */
function columnFromLegacyHeading(title: string): string {
	const t = title.trim().toLowerCase();
	if (t.includes('útil') || t.includes('util')) return 'useful';
	return 'institutional';
}

/** Aceita array na raiz ou formatos legados (`{ items }`, `{ columns }`). */
export function parseMenuJson(raw: string): MenuItem[] {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return [];
	}

	if (Array.isArray(data)) {
		const out: MenuItem[] = [];
		for (let i = 0; i < data.length; i++) {
			const el = data[i];
			if (!el || typeof el !== 'object') continue;
			const o = el as Record<string, unknown>;
			const label = String(o.label ?? '').trim();
			const urlRaw = String(o.url ?? o.href ?? '').trim();
			if (!label || !urlRaw) continue;
			const order =
				typeof o.order === 'number' && Number.isFinite(o.order)
					? Math.trunc(o.order)
					: i;
			const col = parseColumnString(o.column);
			out.push({
				id: parseItemId(o.id),
				label,
				url: normalizeMenuHref(urlRaw),
				order,
				...(col ? { column: col } : {}),
			});
		}
		return sortMenuItems(out);
	}

	if (!data || typeof data !== 'object') return [];

	const record = data as Record<string, unknown>;

	if (Array.isArray(record.items)) {
		const out: MenuItem[] = [];
		for (let i = 0; i < record.items.length; i++) {
			const el = record.items[i];
			if (!el || typeof el !== 'object') continue;
			const o = el as Record<string, unknown>;
			const label = String(o.label ?? '').trim();
			const urlRaw = String(o.url ?? o.href ?? '').trim();
			if (!label || !urlRaw) continue;
			const col = parseColumnString(o.column);
			out.push({
				id: parseItemId(o.id),
				label,
				url: normalizeMenuHref(urlRaw),
				order: typeof o.order === 'number' ? Math.trunc(o.order) : i,
				...(col ? { column: col } : {}),
			});
		}
		return sortMenuItems(out);
	}

	if (Array.isArray(record.columns)) {
		const out: MenuItem[] = [];
		let ord = 0;
		for (const col of record.columns) {
			if (!col || typeof col !== 'object') continue;
			const colTitle = String((col as Record<string, unknown>).title ?? '');
			const group = columnFromLegacyHeading(colTitle);
			const items = (col as Record<string, unknown>).items;
			if (!Array.isArray(items)) continue;
			for (const el of items) {
				if (!el || typeof el !== 'object') continue;
				const o = el as Record<string, unknown>;
				const label = String(o.label ?? '').trim();
				const urlRaw = String(o.url ?? o.href ?? '').trim();
				if (!label || !urlRaw) continue;
				out.push({
					id: parseItemId(o.id),
					label,
					url: normalizeMenuHref(urlRaw),
					order: typeof o.order === 'number' && Number.isFinite(o.order) ? Math.trunc(o.order) : ord++,
					column: parseColumnString(o.column) ?? group,
				});
			}
		}
		return sortMenuItems(out);
	}

	return [];
}

export async function readMainMenu(): Promise<MenuItem[]> {
	const seed = '[]\n';
	const raw = await readUtf8OrSeed(MENU_MAIN_JSON, seed);
	return parseMenuJson(raw);
}

export async function readFooterMenu(): Promise<MenuItem[]> {
	const seed = '[]\n';
	const raw = await readUtf8OrSeed(MENU_FOOTER_JSON, seed);
	return parseMenuJson(raw);
}

export async function writeMainMenuFile(items: MenuItem[]): Promise<void> {
	const sorted = sortMenuItems(items).map(({ id, label, url, order }) => ({
		id,
		label,
		url,
		order,
	}));
	await writeJsonFileRobust(MENU_MAIN_JSON, `${JSON.stringify(sorted, null, 2)}\n`);
}

export async function writeFooterMenuFile(items: MenuItem[]): Promise<void> {
	const sorted = sortMenuItems(items).map((item) => ({
		id: item.id,
		label: item.label,
		url: item.url,
		order: item.order,
		column: item.column?.trim() || 'institutional',
	}));
	await writeJsonFileRobust(MENU_FOOTER_JSON, `${JSON.stringify(sorted, null, 2)}\n`);
}
