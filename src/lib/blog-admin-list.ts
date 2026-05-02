/**
 * Lista posts em `src/content/blog/` para o dashboard admin (fs + parse leve).
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BLOG_CONTENT_DIR } from '../pages/admin/editor-server';
import { parsePostFrontmatter, splitRawMarkdown } from './blog-md-parse';

export type DashboardPostRow = {
	filename: string;
	slug: string;
	title: string;
	pubDate: string;
	draft: boolean;
};

export async function listPostsForDashboard(): Promise<DashboardPostRow[]> {
	const entries = await readdir(BLOG_CONTENT_DIR, { withFileTypes: true });
	const names = entries
		.filter(
			(e) =>
				e.isFile() &&
				/\.mdx?$/.test(e.name) &&
				!e.name.startsWith('_deleted_'),
		)
		.map((e) => e.name);

	const rows: DashboardPostRow[] = [];

	for (const filename of names) {
		const raw = await readFile(join(BLOG_CONTENT_DIR, filename), 'utf-8');
		const { fm } = splitRawMarkdown(raw);
		const meta = parsePostFrontmatter(fm);
		const slug = filename.replace(/\.mdx?$/i, '');
		rows.push({
			filename,
			slug,
			title: meta.title.trim() || '(sem título)',
			pubDate: meta.pubDate,
			draft: meta.draft,
		});
	}

	rows.sort((a, b) => (b.pubDate || '').localeCompare(a.pubDate || ''));

	return rows;
}
