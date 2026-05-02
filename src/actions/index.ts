/**
 * src/actions/index.ts
 *
 * Astro Actions — lógica de servidor para o editor de posts.
 * Executado no servidor (Vercel serverless / Node.js local).
 *
 * ⚠️  Aviso de produção:
 *     Em deploys na Vercel, o filesystem é somente-leitura.
 *     O `savePost` funciona plenamente em desenvolvimento local.
 *     Para produção, substitua as operações de escrita pela GitHub API
 *     ou por um serviço de CMS headless.
 */

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { readdir, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { requireAdminCookies } from '../lib/admin-session';
import { applyAffiliateRelToExternalLinks } from '../lib/affiliate-html';
import {
	BLOG_CONTENT_DIR,
	formatBlogPostMarkdown,
	formatStaticPageMarkdown,
	resolvePagesAbsolutePath,
	SAFE_PAGES_REL_PATH,
	writeBlogMarkdownFile,
	writePageMarkdownFile,
} from '../pages/admin/editor-server';
import { loadStaticPageForEditor } from '../lib/pages-editor-load';
import { deleteMediaFile } from './media';
import { saveMenu } from './menu';
import { taxonomy } from './taxonomy';

/**
 * Regex de validação de nome de arquivo.
 * Aceita apenas letras, números, hífens e extensão .md ou .mdx.
 * Previne path traversal (ex: "../../../etc/passwd").
 */
const SAFE_FILENAME = /^[\w-]+\.mdx?$/;

function normalizeOptionalSeoTitle(v: string | undefined): string | undefined {
	const t = v?.trim();
	return t ? t : undefined;
}

export const server = {
	deleteMediaFile,

	/**
	 * Menus — grava arrays em `menu-main.json` / `menu-footer.json`.
	 */
	saveMenu,

	/**
	 * Taxonomia — categorias e tags em `src/data/*.json` (fs); categorias podem ter `seo`.
	 */
	taxonomy,

	/**
	 * listPosts
	 * Retorna a lista de arquivos .md e .mdx em src/content/blog/.
	 */
	listPosts: defineAction({
		handler: async (_, context) => {
			requireAdminCookies(context.cookies);
			const entries = await readdir(BLOG_CONTENT_DIR, { withFileTypes: true });
			const files = entries
				.filter((e) => e.isFile() && /\.mdx?$/.test(e.name))
				.map((e) => e.name)
				.sort();
			return { files };
		},
	}),

	/**
	 * getPost
	 * Lê o conteúdo bruto de um arquivo de post.
	 */
	getPost: defineAction({
		accept: 'json',
		input: z.object({
			filename: z.string().regex(SAFE_FILENAME, 'Nome de arquivo inválido.'),
		}),
		handler: async ({ filename }, context) => {
			requireAdminCookies(context.cookies);
			const content = await readFile(join(BLOG_CONTENT_DIR, filename), 'utf-8');
			return { filename, content };
		},
	}),

	/**
	 * Carrega metadados + corpo Markdown de `src/content/pages/` para o editor de páginas.
	 */
	getStaticPage: defineAction({
		accept: 'json',
		input: z.object({
			relativePath: z.string().regex(SAFE_PAGES_REL_PATH, 'Caminho do ficheiro inválido.'),
		}),
		handler: async ({ relativePath }, context) => {
			requireAdminCookies(context.cookies);
			return await loadStaticPageForEditor(relativePath);
		},
	}),

	/**
	 * Grava página estática (coleção `pages`) em `src/content/pages/*.md|mdx`.
	 */
	saveStaticPage: defineAction({
		accept: 'json',
		input: z.object({
			relativePath: z.string().regex(SAFE_PAGES_REL_PATH, 'Caminho do ficheiro inválido.'),
			previousRelativePath: z
				.string()
				.regex(SAFE_PAGES_REL_PATH, 'Caminho anterior inválido.')
				.optional(),
			title: z.string().min(1).max(60),
			seoTitle: z.union([z.string().max(60), z.literal('')]).optional(),
			description: z.string().min(50).max(160),
			draft: z.boolean(),
			heroImage: z.union([z.string().min(1), z.literal('')]).optional(),
			canonical: z.union([z.string().url(), z.literal('')]).optional(),
			body: z.string().max(2_000_000),
		}),
		handler: async (input, context) => {
			requireAdminCookies(context.cookies);
			const updatedDate = new Date().toISOString().slice(0, 10);
			const content = formatStaticPageMarkdown({
				title: input.title.trim(),
				seoTitle: normalizeOptionalSeoTitle(input.seoTitle),
				description: input.description.trim(),
				draft: input.draft,
				heroImage: input.heroImage?.trim() || undefined,
				canonical: input.canonical?.trim() || undefined,
				updatedDate,
				body: input.body,
			});
			await writePageMarkdownFile(input.relativePath, content);
			if (
				input.previousRelativePath &&
				input.previousRelativePath !== input.relativePath
			) {
				await unlink(resolvePagesAbsolutePath(input.previousRelativePath));
			}
			return { relativePath: input.relativePath };
		},
	}),

	/**
	 * savePost
	 * Recebe os campos do editor; `body` é **HTML bruto** do contenteditable (sem conversão
	 * para Markdown). Grava frontmatter + HTML no ficheiro `.md`/`.mdx` com `fs.writeFile`.
	 * Não há sanitização do HTML — iframes (YouTube) mantêm atributos como `allowfullscreen`.
	 */
	savePost: defineAction({
		accept: 'json',
		input: z.object({
			filename: z
				.string()
				.regex(SAFE_FILENAME, 'Use apenas letras, números e hífens (ex: meu-post.md).'),
			previousFilename: z.string().regex(SAFE_FILENAME, 'Nome de ficheiro inválido.').optional(),
			title: z.string().min(1).max(60),
			seoTitle: z.union([z.string().max(60), z.literal('')]).optional(),
			slug: z.string().regex(/^[\w-]+$/, 'Slug: apenas letras minúsculas, números e hífens.'),
			description: z.string().min(50).max(160),
			pubDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use data no formato YYYY-MM-DD.'),
			category: z.union([z.string().max(80), z.literal('')]).optional(),
			tags: z.array(z.string().min(1).max(30)).max(10),
			author: z.union([z.string().max(80), z.literal('')]).optional(),
			heroImage: z.union([z.string().min(1), z.literal('')]).optional(),
			draft: z.boolean(),
			affiliateLinks: z.boolean(),
			body: z.string().max(2_000_000, 'Corpo do artigo demasiado grande.'),
			canonical: z.string().url().optional(),
		}),
		handler: async (
			{
				filename,
				previousFilename,
				body,
				title,
				seoTitle,
				slug,
				description,
				pubDate,
				category,
				tags,
				author,
				heroImage,
				draft,
				affiliateLinks,
				canonical,
			},
			context,
		) => {
			requireAdminCookies(context.cookies);
			const normalizedTags = tags.map((t) => t.trim()).filter(Boolean);
			const categoryTrim = category?.trim();
			const updatedDate = new Date().toISOString().split('T')[0];
			const site = typeof import.meta.env.SITE === 'string' ? import.meta.env.SITE : '';
			let bodyToSave = body;
			if (affiliateLinks && site) {
				bodyToSave = applyAffiliateRelToExternalLinks(body, site);
			}
			const content = formatBlogPostMarkdown({
				title,
				seoTitle: normalizeOptionalSeoTitle(seoTitle),
				slug,
				description,
				pubDate,
				category: categoryTrim || undefined,
				tags: normalizedTags,
				author: author?.trim() || undefined,
				heroImage: heroImage?.trim() || undefined,
				draft,
				affiliateLinks,
				body: bodyToSave,
				canonical: canonical?.trim() || undefined,
				updatedDate,
			});
			await writeBlogMarkdownFile(filename, content);
			if (previousFilename && previousFilename !== filename) {
				await unlink(join(BLOG_CONTENT_DIR, previousFilename));
			}
			return {
				filename,
				savedAt: new Date().toISOString(),
			};
		},
	}),

	/**
	 * deletePost
	 * Remove permanentemente o ficheiro em `src/content/blog/` (unlink).
	 */
	deletePost: defineAction({
		accept: 'json',
		input: z.object({
			filename: z.string().regex(SAFE_FILENAME, 'Nome de arquivo inválido.'),
		}),
		handler: async ({ filename }, context) => {
			requireAdminCookies(context.cookies);
			const target = join(BLOG_CONTENT_DIR, filename);
			await unlink(target);
			return { deleted: filename };
		},
	}),
};
