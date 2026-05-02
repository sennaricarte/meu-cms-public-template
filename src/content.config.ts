import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			// ──────────────────────────────────────────────────────────────
			// Campos obrigatórios — SEO core
			// ──────────────────────────────────────────────────────────────

			/** Título da página — limite de 60 chars para não ser cortado nas SERPs. */
			title: z
				.string()
				.min(1, 'O título é obrigatório.')
				.max(60, 'O título não pode ultrapassar 60 caracteres (limite SEO para SERPs).'),

			/** Meta description — 50–160 chars é a faixa ideal para CTR nas SERPs. */
			description: z
				.string()
				.min(50, 'A descrição precisa ter ao menos 50 caracteres para ser útil ao SEO.')
				.max(160, 'A descrição não pode ultrapassar 160 caracteres (limite SEO para SERPs).'),

			/** Data de publicação — usada em sitemap, RSS e schema.org/Article. */
			pubDate: z.coerce.date({
				errorMap: () => ({ message: 'pubDate deve ser uma data válida (ex: 2024-01-15).' }),
			}),

			// ──────────────────────────────────────────────────────────────
			// Campos opcionais — enriquecimento SEO / UX
			// ──────────────────────────────────────────────────────────────

			/** Data da última atualização — sinaliza freshness para o Google. */
			updatedDate: z.coerce.date().optional(),

			/**
			 * Imagem de capa — assets em `src/` via `image()` ou caminho público (ex.: `/uploads/...webp` do admin).
			 */
			heroImage: z.union([image(), z.string().min(1)]).optional(),

			/**
			 * Tags / palavras-chave do post.
			 * - Cada tag: 1–30 chars, normalizada para letras minúsculas.
			 * - Máximo de 10 tags por post (evita keyword stuffing).
			 */
			tags: z
				.array(
					z
						.string()
						.min(1, 'A tag não pode ser vazia.')
						.max(30, 'Cada tag pode ter no máximo 30 caracteres.')
						.transform((tag) => tag.toLowerCase().trim()),
				)
				.max(10, 'Máximo de 10 tags por post.')
				.default([]),

			/** Autor do post — usado em schema.org/Article e meta author. */
			author: z
				.string()
				.min(1)
				.max(80, 'Nome do autor não pode ultrapassar 80 caracteres.')
				.optional(),

			/**
			 * URL canônica explícita.
			 * Use apenas se o conteúdo foi publicado originalmente em outro domínio.
			 * Quando ausente, o Astro gera o canonical automaticamente a partir de Astro.site.
			 */
			canonical: z
				.string()
				.url('O campo canonical deve conter uma URL válida (https://...).')
				.optional(),

			/** Marca o post como rascunho — excluído do build de produção. */
			draft: z.boolean().default(false),

			/** Título apenas para `<title>` / SERPs — opcional; se ausente usa `title`. */
			seoTitle: z.string().max(60).optional(),

			/** Segmento de URL (espelha o nome do ficheiro sem extensão). */
			slug: z.string().regex(/^[\w-]+$/).optional(),

			/** Quando true, links externos no HTML devem usar rel patrocinado (gravado no MD pelo editor). */
			affiliateLinks: z.boolean().default(false),

			/** Categoria principal (nome legível, espelha `categories.json`). */
			category: z.string().min(1).max(80).optional(),
		}),
});

/**
 * Páginas estáticas em `.md` / `.mdx` (institucional, legal, etc.).
 * Origem: `src/content/pages/` — URL = caminho do ficheiro sem extensão (ex.: `sobre.md` → `/sobre`).
 */
const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z
				.string()
				.min(1, 'O título é obrigatório.')
				.max(60, 'O título não pode ultrapassar 60 caracteres (limite SEO para SERPs).'),

			description: z
				.string()
				.min(50, 'A descrição precisa ter ao menos 50 caracteres para ser útil ao SEO.')
				.max(160, 'A descrição não pode ultrapassar 160 caracteres (limite SEO para SERPs).'),

			updatedDate: z.coerce.date().optional(),

			heroImage: z.union([image(), z.string().min(1)]).optional(),

			canonical: z
				.string()
				.url('O campo canonical deve conter uma URL válida (https://...).')
				.optional(),

			draft: z.boolean().default(false),

			seoTitle: z.string().max(60).optional(),
		}),
});

export const collections = { blog, pages };
