/**
 * Lógica de servidor colada ao editor (`editor.astro`): monta o ficheiro exigido
 * pelo Astro Content Collections (frontmatter YAML + corpo) e grava em disco via `fs`.
 *
 * O corpo (`body`) é o HTML bruto do WYSIWYG — **sem conversão para Markdown** — para
 * preservar tabelas, estilos e `<iframe>` (ex.: YouTube com allowfullscreen). O MD/MDX
 * do Astro interpreta HTML no corpo normalmente.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const FM_DELIM = ['-', '-', '-'].join('');

export const BLOG_CONTENT_DIR = join(process.cwd(), 'src', 'content', 'blog');

/** Pasta das páginas estáticas (coleção `pages`). */
export const PAGES_CONTENT_DIR = join(process.cwd(), 'src', 'content', 'pages');

/**
 * Caminho relativo aceite dentro de `src/content/pages/`.
 * Permite subpastas (`legal/privacidade.md`); bloqueia `..` e nomes estranhos.
 */
export const SAFE_PAGES_REL_PATH = /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:md|mdx)$/;

export function assertSafePagesRelativePath(rel: string): void {
	if (!SAFE_PAGES_REL_PATH.test(rel)) {
		throw new Error('Caminho de ficheiro inválido.');
	}
	const absTarget = resolve(PAGES_CONTENT_DIR, ...rel.split('/'));
	const root = resolve(PAGES_CONTENT_DIR);
	const diff = relative(root, absTarget);
	if (!diff || diff.startsWith('..') || diff.includes('..')) {
		throw new Error('Caminho fora da pasta pages.');
	}
}

export type StaticPageSaveInput = {
	title: string;
	seoTitle?: string;
	description: string;
	draft: boolean;
	heroImage?: string;
	canonical?: string;
	updatedDate: string;
	body: string;
};

/**
 * Frontmatter compatível com `src/content.config.ts` (coleção `pages`) + corpo Markdown/MDX.
 */
export function formatStaticPageMarkdown(input: StaticPageSaveInput): string {
	const lines: string[] = [FM_DELIM];
	lines.push('title: ' + escapeYamlSingle(input.title));
	lines.push('description: ' + escapeYamlSingle(input.description));
	if (input.seoTitle?.trim()) {
		lines.push('seoTitle: ' + escapeYamlSingle(input.seoTitle.trim()));
	}
	if (input.heroImage?.trim()) {
		lines.push("heroImage: '" + input.heroImage.trim().replace(/'/g, "''") + "'");
	}
	if (input.canonical?.trim()) {
		lines.push('canonical: ' + escapeYamlSingle(input.canonical.trim()));
	}
	lines.push('draft: ' + (input.draft ? 'true' : 'false'));
	lines.push("updatedDate: '" + input.updatedDate + "'");
	lines.push(FM_DELIM);
	const body = input.body;
	return lines.join('\n') + '\n' + (body.endsWith('\n') ? body : body + '\n');
}

export async function writePageMarkdownFile(relativePath: string, content: string): Promise<void> {
	assertSafePagesRelativePath(relativePath);
	const absTarget = resolve(PAGES_CONTENT_DIR, ...relativePath.split('/'));
	await mkdir(dirname(absTarget), { recursive: true });
	await writeFile(absTarget, content, 'utf-8');
}

export function resolvePagesAbsolutePath(relativePath: string): string {
	assertSafePagesRelativePath(relativePath);
	return resolve(PAGES_CONTENT_DIR, ...relativePath.split('/'));
}

export type BlogPostFormSaveInput = {
	title: string;
	seoTitle?: string;
	slug: string;
	description: string;
	pubDate: string;
	category?: string;
	tags: string[];
	author?: string;
	heroImage?: string;
	draft: boolean;
	affiliateLinks: boolean;
	body: string;
	canonical?: string;
	updatedDate: string;
};

function escapeYamlSingle(s: string): string {
	return "'" + s.replace(/'/g, "''") + "'";
}

/**
 * Frontmatter YAML + corpo. O corpo é concatenado tal como recebido (HTML), após o bloco `---`.
 */
export function formatBlogPostMarkdown(input: BlogPostFormSaveInput): string {
	const meta = input;
	const lines: string[] = [FM_DELIM];

	lines.push('title: ' + escapeYamlSingle(meta.title));
	if (meta.seoTitle?.trim()) {
		lines.push('seoTitle: ' + escapeYamlSingle(meta.seoTitle.trim()));
	}
	if (meta.slug?.trim()) {
		lines.push('slug: ' + escapeYamlSingle(meta.slug.trim()));
	}
	lines.push('description: ' + escapeYamlSingle(meta.description));
	lines.push("pubDate: '" + meta.pubDate + "'");

	if (meta.updatedDate?.trim()) {
		lines.push("updatedDate: '" + meta.updatedDate.trim() + "'");
	}

	if (meta.canonical?.trim()) {
		lines.push('canonical: ' + escapeYamlSingle(meta.canonical.trim()));
	}

	if (meta.heroImage?.trim()) {
		lines.push("heroImage: '" + meta.heroImage.trim().replace(/'/g, "''") + "'");
	}

	if (meta.category?.trim()) {
		lines.push('category: ' + escapeYamlSingle(meta.category.trim()));
	}

	const tagsJson = meta.tags.length
		? '[' + meta.tags.map((t) => escapeYamlSingle(t)).join(', ') + ']'
		: '[]';
	lines.push('tags: ' + tagsJson);

	if (meta.author?.trim()) {
		lines.push('author: ' + escapeYamlSingle(meta.author.trim()));
	}

	lines.push('draft: ' + (meta.draft ? 'true' : 'false'));
	lines.push('affiliateLinks: ' + (meta.affiliateLinks ? 'true' : 'false'));
	lines.push(FM_DELIM);

	const fmBlock = lines.join('\n') + '\n';
	const body = meta.body;
	return fmBlock + (body.endsWith('\n') ? body : body + '\n');
}

export async function writeBlogMarkdownFile(filename: string, content: string): Promise<void> {
	await writeFile(join(BLOG_CONTENT_DIR, filename), content, 'utf-8');
}
