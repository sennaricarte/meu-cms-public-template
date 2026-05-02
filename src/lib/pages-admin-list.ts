/**
 * Lista ficheiros `.md`/`.mdx` em `src/content/pages/` para o admin (recursivo).
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PAGES_CONTENT_DIR } from '../pages/admin/editor-server';
import { parsePostFrontmatter, splitRawMarkdown } from './blog-md-parse';

export type DashboardPageRow = {
	/** Caminho relativo dentro de `pages/` (ex.: `exemplo-pagina.md`, `legal/privacidade.md`). */
	relativePath: string;
	title: string;
	draft: boolean;
};

async function collectMarkdownFiles(absDir: string, relPrefix: string): Promise<string[]> {
	const out: string[] = [];
	const entries = await readdir(absDir, { withFileTypes: true });
	for (const e of entries) {
		const seg = relPrefix ? `${relPrefix}/${e.name}` : e.name;
		if (e.name.startsWith('.')) continue;
		if (e.isDirectory()) {
			out.push(...(await collectMarkdownFiles(join(absDir, e.name), seg)));
		} else if (e.isFile() && /\.mdx?$/i.test(e.name)) {
			out.push(seg.replace(/\\/g, '/'));
		}
	}
	return out;
}

export async function listPagesForDashboard(): Promise<DashboardPageRow[]> {
	const relPaths = await collectMarkdownFiles(PAGES_CONTENT_DIR, '');
	relPaths.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

	const rows: DashboardPageRow[] = [];
	for (const rel of relPaths) {
		const absFile = join(PAGES_CONTENT_DIR, ...rel.split('/'));
		const raw = await readFile(absFile, 'utf-8');
		const { fm } = splitRawMarkdown(raw);
		const meta = parsePostFrontmatter(fm);
		rows.push({
			relativePath: rel,
			title: meta.title.trim() || '(sem título)',
			draft: meta.draft,
		});
	}

	return rows;
}
