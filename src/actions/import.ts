/**
 * Importador de arquivo XML (WXR) do WordPress para a coleção local do Astro.
 */

import { createHash } from 'node:crypto';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';
import { requireAdminCookies } from '../lib/admin-session';
import { formatBlogPostMarkdown, writeBlogMarkdownFile } from '../pages/admin/editor-server';

type XmlNode = Record<string, unknown>;
type ImportRow = { id: number; filename: string; slug: string; title: string };
type SkipRow = { id: number; slug: string; reason: string };
type FailRow = { id?: number; reason: string };

const uploadsDir = join(process.cwd(), 'public', 'uploads');
const blogDir = join(process.cwd(), 'src', 'content', 'blog');
const REQUEST_HEADERS = {
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
	Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};
const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	emDelimiter: '*',
	bulletListMarker: '-',
});
turndown.keep(['iframe', 'img']);

function toArray<T>(value: T | T[] | undefined): T[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function stringValue(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (value && typeof value === 'object' && '#text' in value) {
		const nested = (value as { '#text'?: unknown })['#text'];
		return typeof nested === 'string' ? nested : '';
	}
	return '';
}

function stripHtml(input: string): string {
	return input
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

function safeSlug(raw: string, fallbackId: number): string {
	const slug = raw
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 120);
	return slug || `wp-post-${fallbackId}`;
}

function clampTitle(input: string): string {
	const cleaned = input.trim();
	if (!cleaned) return '';
	const chars = [...cleaned];
	return chars.length <= 60 ? cleaned : `${chars.slice(0, 57).join('')}...`;
}

function formatDateYmd(raw?: string): string {
	if (!raw) return new Date().toISOString().slice(0, 10);
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
	return d.toISOString().slice(0, 10);
}

function pickDescription(excerptHtml: string, contentHtml: string): string {
	const excerpt = stripHtml(excerptHtml);
	if (excerpt.length >= 50) return excerpt.slice(0, 160);
	const content = stripHtml(contentHtml);
	if (content.length >= 50) return content.slice(0, 160);
	return (excerpt || content || 'Conteúdo importado do WordPress.').slice(0, 160);
}

function extFromContentType(contentType: string | null): string {
	const ct = (contentType ?? '').toLowerCase();
	if (ct.includes('image/webp')) return '.webp';
	if (ct.includes('image/png')) return '.png';
	if (ct.includes('image/jpeg')) return '.jpg';
	if (ct.includes('image/gif')) return '.gif';
	if (ct.includes('image/svg+xml')) return '.svg';
	return '.jpg';
}

function fileExtFromUrl(url: string): string {
	const clean = url.split('?')[0] ?? url;
	const ext = extname(clean).toLowerCase();
	if (ext && ext.length <= 6) return ext;
	return '';
}

async function downloadImageToUploads(sourceUrl: string): Promise<string> {
	const res = await fetch(sourceUrl, { headers: REQUEST_HEADERS });
	if (!res.ok) {
		throw new Error(`Falha ao baixar imagem (${res.status}): ${sourceUrl}`);
	}
	const buf = Buffer.from(await res.arrayBuffer());
	const hash = createHash('sha1').update(sourceUrl).digest('hex').slice(0, 10);
	const ext = fileExtFromUrl(sourceUrl) || extFromContentType(res.headers.get('content-type'));
	const baseName = sourceUrl.split('/').pop()?.split('?')[0] ?? `wp-image-${hash}${ext}`;
	const safeName = baseName
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	const filename = safeName && safeName.includes('.') ? safeName : `wp-image-${hash}${ext}`;
	await mkdir(uploadsDir, { recursive: true });
	await writeFile(join(uploadsDir, filename), buf);
	return `/uploads/${filename}`;
}

function collectImageSrcs(html: string): string[] {
	const out = new Set<string>();
	const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html)) !== null) {
		if (m[1]) out.add(m[1]);
	}
	return [...out];
}

function replaceImageSrcs(html: string, map: Map<string, string>): string {
	let out = html;
	for (const [oldSrc, newSrc] of map.entries()) {
		const escaped = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		out = out.replace(
			new RegExp(`(<img\\b[^>]*\\bsrc\\s*=\\s*["'])${escaped}(["'][^>]*>)`, 'g'),
			`$1${newSrc}$2`,
		);
	}
	return out;
}

function collectMarkdownImageSrcs(markdown: string): string[] {
	const out = new Set<string>();
	const re = /!\[[^\]]*\]\(\s*([^)\s]+)\s*\)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(markdown)) !== null) {
		const u = m[1]?.trim();
		if (u && !u.startsWith('data:') && !u.startsWith('#')) out.add(u);
	}
	return [...out];
}

function replaceMarkdownImageSrcs(markdown: string, map: Map<string, string>): string {
	let out = markdown;
	for (const [oldSrc, newSrc] of map.entries()) {
		const escaped = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		out = out.replace(
			new RegExp(`(!\\[[^\\]]*\\]\\()\\s*${escaped}\\s*(\\))`, 'g'),
			`$1${newSrc}$2`,
		);
	}
	return out;
}

/**
 * HTML do corpo: resolve `src` de imagens com `imageBaseUrl`, descarrega para `/uploads/` e converte para Markdown.
 */
export async function processBodyHtmlForImport(
	html: string,
	imageBaseUrl: string,
): Promise<{ bodyMarkdown: string; downloadedImages: number }> {
	const imageSrcs = collectImageSrcs(html);
	const srcMap = new Map<string, string>();
	let downloadedImages = 0;
	for (const src of [...new Set(imageSrcs)]) {
		const abs = toAbsoluteUrl(src, imageBaseUrl);
		if (!abs) continue;
		try {
			const localPath = await downloadImageToUploads(abs);
			srcMap.set(src, localPath);
			downloadedImages++;
		} catch {
			/* mantém src original */
		}
	}
	const bodyHtmlWithLocalImages = replaceImageSrcs(html, srcMap);
	return {
		bodyMarkdown: turndown.turndown(bodyHtmlWithLocalImages),
		downloadedImages,
	};
}

/**
 * Markdown do corpo: mesma lógica de imagens em sintaxe `![](url)`.
 */
export async function processBodyMarkdownForImport(
	markdown: string,
	imageBaseUrl: string,
): Promise<{ bodyMarkdown: string; downloadedImages: number }> {
	const imageSrcs = collectMarkdownImageSrcs(markdown);
	const srcMap = new Map<string, string>();
	let downloadedImages = 0;
	for (const src of [...new Set(imageSrcs)]) {
		const abs = toAbsoluteUrl(src, imageBaseUrl);
		if (!abs) continue;
		try {
			const localPath = await downloadImageToUploads(abs);
			srcMap.set(src, localPath);
			downloadedImages++;
		} catch {
			/* mantém src original */
		}
	}
	return {
		bodyMarkdown: replaceMarkdownImageSrcs(markdown, srcMap),
		downloadedImages,
	};
}

function extractCategories(item: XmlNode): { categories: string[]; tags: string[] } {
	const categories: string[] = [];
	const tags: string[] = [];
	for (const node of toArray(item.category as unknown)) {
		if (!node) continue;
		if (typeof node === 'string') continue;
		const obj = node as Record<string, unknown>;
		const name = stringValue(obj['#text'] ?? '').trim();
		const domain = stringValue(obj['@_domain'] ?? '').trim();
		if (!name) continue;
		if (domain === 'category') categories.push(name);
		else if (domain === 'post_tag' || domain === 'tag') tags.push(name);
	}
	return {
		categories: [...new Set(categories)],
		tags: [...new Set(tags)],
	};
}

function getThumbnailId(item: XmlNode): number | null {
	const postMeta = toArray(item['wp:postmeta'] as unknown);
	for (const meta of postMeta) {
		if (!meta || typeof meta !== 'object') continue;
		const m = meta as Record<string, unknown>;
		const key = stringValue(m['wp:meta_key']).trim();
		if (key !== '_thumbnail_id') continue;
		const id = Number.parseInt(stringValue(m['wp:meta_value']).trim(), 10);
		if (Number.isFinite(id) && id > 0) return id;
	}
	return null;
}

function toAbsoluteUrl(source: string, siteBase: string): string | null {
	const s = source.trim();
	if (!s) return null;
	if (s.startsWith('//')) return `https:${s}`;
	try {
		return new URL(s, `${siteBase}/`).toString();
	} catch {
		return null;
	}
}

function extractSiteBase(channelLink: string): string {
	try {
		const u = new URL(channelLink.trim());
		return `${u.protocol}//${u.host}`;
	} catch {
		return 'https://example.com';
	}
}

export const importWordpressPosts = defineAction({
	accept: 'form',
	input: z.object({
		xmlFile: z.instanceof(File, { message: 'Envie um arquivo XML válido.' }),
		destinationCategory: z.string().trim().max(120).optional(),
	}),
	handler: async ({ xmlFile, destinationCategory }, context) => {
		requireAdminCookies(context.cookies);
		await mkdir(blogDir, { recursive: true });

		const xmlText = await xmlFile.text();
		const parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: '@_',
			parseTagValue: false,
			trimValues: false,
		});
		const root = parser.parse(xmlText) as { rss?: { channel?: XmlNode } };
		const channel = root?.rss?.channel;
		if (!channel) {
			throw new Error('Arquivo XML inválido: estrutura WordPress não encontrada.');
		}

		const channelLink = stringValue(channel.link ?? '').trim();
		const siteBase = extractSiteBase(channelLink);
		const items = toArray(channel.item as unknown) as XmlNode[];
		const posts = items.filter(
			(item) =>
				stringValue(item['wp:post_type']).trim() === 'post' &&
				stringValue(item['wp:status']).trim() !== 'trash',
		);
		const attachmentById = new Map<number, string>();
		for (const item of items) {
			if (stringValue(item['wp:post_type']).trim() !== 'attachment') continue;
			const id = Number.parseInt(stringValue(item['wp:post_id']).trim(), 10);
			const url = stringValue(item['wp:attachment_url']).trim();
			if (Number.isFinite(id) && id > 0 && url) attachmentById.set(id, url);
		}

		const existingEntries = await readdir(blogDir, { withFileTypes: true });
		const existingSlugs = new Set(
			existingEntries
				.filter((e) => e.isFile() && /\.mdx?$/i.test(e.name))
				.map((e) => e.name.replace(/\.mdx?$/i, '').toLowerCase()),
		);
		const runSlugs = new Set<string>();
		const imported: ImportRow[] = [];
		const skipped: SkipRow[] = [];
		const failed: FailRow[] = [];
		let downloadedImages = 0;
		const forcedCategory = destinationCategory?.trim() || undefined;

		for (const item of posts) {
			const postId = Number.parseInt(stringValue(item['wp:post_id']).trim(), 10) || 0;
			try {
				const rawTitle = stripHtml(stringValue(item.title ?? '')).trim() || `Post importado ${postId || 0}`;
				const title = clampTitle(rawTitle) || `Post importado ${postId || 0}`;
				const explicitSlug = stringValue(item['wp:post_name']).trim();
				const slug = safeSlug(explicitSlug || title, postId || Date.now());
				const slugKey = slug.toLowerCase();
				if (existingSlugs.has(slugKey) || runSlugs.has(slugKey)) {
					skipped.push({ id: postId, slug, reason: 'Slug já existe no conteúdo local.' });
					continue;
				}

				const contentHtml = stringValue(item['content:encoded'] ?? '');
				const excerptHtml = stringValue(item['excerpt:encoded'] ?? '');
				const { categories, tags } = extractCategories(item);
				const category = forcedCategory ?? categories[0];
				const thumbnailId = getThumbnailId(item);
				const featuredSrc = thumbnailId ? attachmentById.get(thumbnailId) : undefined;

				const imageSrcs = collectImageSrcs(contentHtml);
				if (featuredSrc) imageSrcs.push(featuredSrc);
				const srcMap = new Map<string, string>();
				for (const src of [...new Set(imageSrcs)]) {
					const abs = toAbsoluteUrl(src, siteBase);
					if (!abs) continue;
					try {
						const localPath = await downloadImageToUploads(abs);
						srcMap.set(src, localPath);
						downloadedImages++;
					} catch {
						/* ignora imagem específica e continua */
					}
				}

				const bodyHtmlWithLocalImages = replaceImageSrcs(contentHtml, srcMap);
				const bodyMarkdown = turndown.turndown(bodyHtmlWithLocalImages);
				const heroImage = undefined;
				const description = pickDescription(excerptHtml, contentHtml);
				const canonical = stringValue(item.link ?? '').trim() || undefined;
				const isDraft = stringValue(item['wp:status']).trim() === 'draft';
				const pubDate = formatDateYmd(stringValue(item['wp:post_date']));
				const updatedDate = formatDateYmd(stringValue(item['wp:post_date_gmt']) || stringValue(item.pubDate));

				const markdown = formatBlogPostMarkdown({
					title,
					seoTitle: undefined,
					slug,
					description,
					pubDate,
					updatedDate,
					category,
					tags,
					author: 'WordPress Import',
					heroImage,
					draft: isDraft,
					affiliateLinks: false,
					body: bodyMarkdown,
					canonical,
				});

				const filename = `${slug}.md`;
				await writeBlogMarkdownFile(filename, markdown);
				runSlugs.add(slugKey);
				imported.push({ id: postId, filename, slug, title });
			} catch (err) {
				failed.push({
					id: postId || undefined,
					reason: err instanceof Error ? err.message : 'Falha ao importar post do XML.',
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

