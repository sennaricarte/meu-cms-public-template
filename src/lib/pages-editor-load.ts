/**
 * Carrega uma página estática para o editor admin (`page-editor.astro`).
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
	PAGES_CONTENT_DIR,
	assertSafePagesRelativePath,
} from '../pages/admin/editor-server';
import { parsePostFrontmatter, splitRawMarkdown } from './blog-md-parse';

export async function loadStaticPageForEditor(relativePath: string): Promise<{
	relativePath: string;
	title: string;
	seoTitle: string;
	description: string;
	draft: boolean;
	heroImage: string;
	canonical: string;
	body: string;
}> {
	assertSafePagesRelativePath(relativePath);
	const absPath = join(PAGES_CONTENT_DIR, ...relativePath.split('/'));
	const raw = await readFile(absPath, 'utf-8');
	const { fm, body } = splitRawMarkdown(raw);
	const meta = parsePostFrontmatter(fm);
	return {
		relativePath,
		title: meta.title,
		seoTitle: meta.seoTitle ?? '',
		description: meta.description,
		draft: meta.draft,
		heroImage: meta.heroImage ?? '',
		canonical: meta.canonical ?? '',
		body,
	};
}
