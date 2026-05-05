/**
 * Importação estruturada por JSON — formato fixo validado com Zod (menos erros que HTML solto ou XML heterogéneo).
 */

import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAdminCookies } from '../lib/admin-session';
import { formatBlogPostMarkdown, writeBlogMarkdownFile } from '../pages/admin/editor-server';
import { processBodyHtmlForImport, processBodyMarkdownForImport } from './import';

const blogDir = join(process.cwd(), 'src', 'content', 'blog');
const MAX_JSON_BYTES = 6 * 1024 * 1024;

const jsonPostSchema = z
	.object({
		slug: z.string().regex(/^[\w-]+$/).max(120).optional(),
		/** Título original (qualquer origem); ao gravar é limitado a 60 caracteres (SEO), como no WordPress. */
		title: z.string().min(1).max(400),
		seoTitle: z.string().max(120).optional(),
		description: z.string().min(50).max(160),
		pubDate: z.string().min(8),
		updatedDate: z.string().optional(),
		category: z.string().max(80).optional(),
		tags: z.array(z.string().min(1).max(30)).max(10).optional(),
		author: z.string().max(80).optional(),
		draft: z.boolean().optional(),
		affiliateLinks: z.boolean().optional(),
		canonical: z.string().url().optional(),
		bodyHtml: z.string().optional(),
		bodyMarkdown: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const h = (data.bodyHtml ?? '').trim();
		const m = (data.bodyMarkdown ?? '').trim();
		if (h && m) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Use só bodyHtml ou só bodyMarkdown (nunca os dois).',
				path: ['bodyHtml'],
			});
		} else if (!h && !m) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Indique bodyHtml ou bodyMarkdown com conteúdo.',
				path: ['bodyHtml'],
			});
		}
	});

const importBundleV1 = z.object({
	format: z.literal('blogonauta-blog-import-v1'),
	/** Origem para resolver URLs relativas em imagens (ex.: https://meu-app.lovable.app/). */
	imageBaseUrl: z.string().url(),
	posts: z.array(jsonPostSchema).min(1).max(80),
});

type JsonImportRow = { index: number; filename: string; slug: string; title: string };
type JsonSkipRow = { index: number; slug: string; reason: string };
type JsonFailRow = { index?: number; reason: string };

function formatZodError(err: z.ZodError): string {
	return err.issues.map((i) => `${i.path.length ? i.path.join('.') : 'raiz'}: ${i.message}`).join('\n');
}

function clampTitle(input: string): string {
	const cleaned = input.trim();
	if (!cleaned) return '';
	const chars = [...cleaned];
	return chars.length <= 60 ? cleaned : `${chars.slice(0, 57).join('')}...`;
}

function safeSlug(raw: string, fallbackId: number): string {
	const slug = raw
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 120);
	return slug || `import-${fallbackId}`;
}

function formatDateYmd(raw?: string): string {
	if (!raw?.trim()) return new Date().toISOString().slice(0, 10);
	const d = new Date(raw.trim());
	if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
	return d.toISOString().slice(0, 10);
}

export const importBlogJsonBundle = defineAction({
	accept: 'form',
	input: z.object({
		jsonFile: z.instanceof(File, { message: 'Envie um arquivo .json válido.' }),
		destinationCategory: z.string().trim().max(120).optional(),
	}),
	handler: async ({ jsonFile, destinationCategory }, context) => {
		await requireAdminCookies(context.cookies);
		await mkdir(blogDir, { recursive: true });

		if (jsonFile.size > MAX_JSON_BYTES) {
			throw new Error(`Arquivo JSON demasiado grande (máx. ${MAX_JSON_BYTES / (1024 * 1024)} MB).`);
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(await jsonFile.text());
		} catch {
			throw new Error('JSON inválido: verifique vírgulas, aspas e chaves.');
		}

		const bundle = importBundleV1.safeParse(parsed);
		if (!bundle.success) {
			throw new Error(`Formato do pacote inválido:\n${formatZodError(bundle.error)}`);
		}

		const { imageBaseUrl, posts } = bundle.data;
		const forcedCategory = destinationCategory?.trim() || undefined;

		const existingEntries = await readdir(blogDir, { withFileTypes: true });
		const existingSlugs = new Set(
			existingEntries
				.filter((e) => e.isFile() && /\.mdx?$/i.test(e.name))
				.map((e) => e.name.replace(/\.mdx?$/i, '').toLowerCase()),
		);
		const runSlugs = new Set<string>();
		const imported: JsonImportRow[] = [];
		const skipped: JsonSkipRow[] = [];
		const failed: JsonFailRow[] = [];
		let downloadedImages = 0;

		for (let i = 0; i < posts.length; i++) {
			const post = posts[i]!;
			const index = i + 1;
			try {
				const title = clampTitle(post.title) || `Artigo ${index}`;
				const rawSeo = post.seoTitle?.trim();
				const seoTitle = rawSeo ? clampTitle(rawSeo) : undefined;
				const slug = (post.slug?.trim() || safeSlug(post.title.trim(), Date.now() + i)).toLowerCase();
				const slugKey = slug.toLowerCase();
				if (existingSlugs.has(slugKey) || runSlugs.has(slugKey)) {
					skipped.push({ index, slug, reason: 'Slug já existe no conteúdo local.' });
					continue;
				}

				const rawHtml = (post.bodyHtml ?? '').trim();
				const rawMd = (post.bodyMarkdown ?? '').trim();
				let bodyMarkdown: string;
				let nImg: number;
				if (rawHtml) {
					const r = await processBodyHtmlForImport(rawHtml, imageBaseUrl);
					bodyMarkdown = r.bodyMarkdown;
					nImg = r.downloadedImages;
				} else {
					const r = await processBodyMarkdownForImport(rawMd, imageBaseUrl);
					bodyMarkdown = r.bodyMarkdown;
					nImg = r.downloadedImages;
				}
				downloadedImages += nImg;

				const tags = (post.tags ?? []).map((t) => t.toLowerCase().trim()).filter(Boolean);
				const category = forcedCategory ?? post.category?.trim();
				const pubDate = formatDateYmd(post.pubDate);
				const updatedDate = post.updatedDate?.trim() ? formatDateYmd(post.updatedDate) : pubDate;

				const markdown = formatBlogPostMarkdown({
					title,
					seoTitle,
					slug,
					description: post.description.trim(),
					pubDate,
					updatedDate,
					category,
					tags,
					author: post.author?.trim() || undefined,
					heroImage: undefined,
					draft: post.draft ?? false,
					affiliateLinks: post.affiliateLinks ?? false,
					body: bodyMarkdown,
					canonical: post.canonical?.trim() || undefined,
				});

				const filename = `${slug}.md`;
				await writeBlogMarkdownFile(filename, markdown);
				runSlugs.add(slugKey);
				imported.push({ index, filename, slug, title });
			} catch (err) {
				failed.push({
					index,
					reason: err instanceof Error ? err.message : 'Falha ao importar entrada JSON.',
				});
			}
		}

		return {
			ok: true as const,
			importedCount: imported.length,
			skippedCount: skipped.length,
			downloadedImages,
			imported,
			skipped,
			failed,
		};
	},
});
