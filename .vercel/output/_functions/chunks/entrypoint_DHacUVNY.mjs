import { p as pipelineSymbol, A as AstroError, d as ActionCalledFromServerError } from './sequence_Cm0YKoB9.mjs';
import { c as createActionsProxy, d as defineAction } from './entrypoint_BkVNsX5w.mjs';
import * as z from 'zod/v4';
import { unlink, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { r as requireAdminCookies } from './admin-session_CqodbBXM.mjs';
import { S as SAFE_PAGES_REL_PATH, B as BLOG_CONTENT_DIR, f as formatBlogPostMarkdown, w as writeBlogMarkdownFile, a as formatStaticPageMarkdown, b as writePageMarkdownFile, r as resolvePagesAbsolutePath } from './editor-server_HbjAKODc.mjs';
import { l as loadStaticPageForEditor } from './pages-editor-load_lANb8XfD.mjs';
import { n as normalizeMenuHref, w as writeMainMenuFile, s as sortMenuItems, a as writeFooterMenuFile } from './menu-data_DwFVreFB.mjs';
import { randomUUID } from 'node:crypto';
import { r as readTaxonomyFile, T as TAGS_JSON, w as writeTaxonomyFile, a as readCategories, b as writeCategoriesFile } from './taxonomy-data_CDnVcCHl.mjs';

createActionsProxy({
  handleAction: async (param, path, context) => {
    const pipeline = context ? Reflect.get(context, pipelineSymbol) : void 0;
    if (!pipeline) {
      throw new AstroError(ActionCalledFromServerError);
    }
    const action = await pipeline.getAction(path);
    if (!action) throw new Error(`Action not found: ${path}`);
    return action.bind(context)(param);
  }
});

function mergeRel(existing, add) {
  const set = /* @__PURE__ */ new Set();
  for (const t of (existing ?? "").split(/\s+/)) {
    const x = t.trim().toLowerCase();
    if (x) set.add(x);
  }
  for (const t of add) set.add(t.toLowerCase());
  return [...set].sort().join(" ");
}
function applyAffiliateRelToExternalLinks(html, siteBaseUrl) {
  let origin;
  try {
    origin = new URL(siteBaseUrl);
  } catch {
    return html;
  }
  const siteHost = origin.hostname;
  return html.replace(/<a\b([^>]*)>/gi, (_full, attrs) => {
    const hrefMatch = /\bhref\s*=\s*(["'])((?:(?!\1).)*)\1/i.exec(attrs);
    if (!hrefMatch) return `<a${attrs}>`;
    const href = hrefMatch[2].trim();
    if (!href || href.startsWith("#")) return `<a${attrs}>`;
    let resolved;
    try {
      resolved = new URL(href, origin);
    } catch {
      return `<a${attrs}>`;
    }
    const proto = resolved.protocol.toLowerCase();
    if (proto === "mailto:" || proto === "tel:" || proto === "javascript:") {
      return `<a${attrs}>`;
    }
    if (resolved.hostname === siteHost) return `<a${attrs}>`;
    const relMatch = /\brel\s*=\s*(["'])((?:(?!\1).)*)\1/i.exec(attrs);
    const merged = mergeRel(relMatch?.[2], ["nofollow", "sponsored"]);
    if (relMatch) {
      const newAttrs = attrs.replace(relMatch[0], `rel="${merged}"`);
      return `<a${newAttrs}>`;
    }
    return `<a${attrs} rel="${merged}">`;
  });
}

const SAFE_MEDIA_FILENAME = /^[a-zA-Z0-9._-]+\.(?:webp|png|jpe?g|gif|svg|avif)$/i;
const deleteMediaFile = defineAction({
  accept: "json",
  input: z.object({
    filename: z.string().regex(SAFE_MEDIA_FILENAME, "Nome de arquivo inválido.")
  }),
  handler: async ({ filename }, context) => {
    requireAdminCookies(context.cookies);
    const target = join(process.cwd(), "public", "uploads", filename);
    await unlink(target);
    return { deleted: filename };
  }
});

const menuItemMainSchema = z.object({
  id: z.string().min(1, "O id do item é obrigatório.").max(80),
  label: z.string().min(1, "O nome do link é obrigatório.").max(120),
  url: z.string().min(1, "URL ou slug obrigatório.").max(512),
  order: z.number().int()
});
const menuItemFooterSchema = menuItemMainSchema.extend({
  column: z.string().min(1, "A coluna é obrigatória no rodapé.").max(40)
});
const saveMenu = defineAction({
  accept: "json",
  input: z.discriminatedUnion("menu", [
    z.object({
      menu: z.literal("main"),
      items: z.array(menuItemMainSchema).max(100)
    }),
    z.object({
      menu: z.literal("footer"),
      items: z.array(menuItemFooterSchema).max(100)
    })
  ]),
  handler: async (input, context) => {
    requireAdminCookies(context.cookies);
    if (!Array.isArray(input.items)) {
      throw new Error("Os dados recebidos não são um array de itens. Gravação cancelada.");
    }
    if (input.menu === "main") {
      const normalized2 = input.items.map((row) => ({
        id: row.id.trim(),
        label: row.label.trim(),
        url: normalizeMenuHref(row.url.trim()),
        order: row.order
      }));
      await writeMainMenuFile(sortMenuItems(normalized2));
      return { ok: true, menu: "main" };
    }
    const normalized = input.items.map((row) => ({
      id: row.id.trim(),
      label: row.label.trim(),
      url: normalizeMenuHref(row.url.trim()),
      order: row.order,
      column: row.column.trim()
    }));
    await writeFooterMenuFile(sortMenuItems(normalized));
    return { ok: true, menu: "footer" };
  }
});

function normSlug(s) {
  return s.trim().toLowerCase();
}
const nameSchema = z.string().min(1, "O nome é obrigatório.").max(80);
const slugSchema = z.string().min(1, "O slug é obrigatório.").max(80).regex(/^[\w-]+$/, "Use apenas letras, números e hífens no slug.");
const idSchema = z.string().uuid("Identificador inválido.");
const addInputSchema = z.object({
  name: nameSchema,
  slug: slugSchema
});
function sortItems(items) {
  return [...items].sort(
    (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" })
  );
}
function seoFromUpdatePayload(input) {
  const metaTitle = input.metaTitle.trim().slice(0, 70);
  const metaDescription = input.metaDescription.trim().slice(0, 160);
  const ogImage = input.ogImage.trim().slice(0, 500);
  const seo = {};
  if (metaTitle) seo.metaTitle = metaTitle;
  if (metaDescription) seo.metaDescription = metaDescription;
  if (input.noindex) seo.noindex = true;
  if (ogImage) seo.ogImage = ogImage;
  if (!seo.metaTitle && !seo.metaDescription && !seo.noindex && !seo.ogImage) return void 0;
  return seo;
}
const taxonomy = {
  addCategory: defineAction({
    accept: "json",
    input: addInputSchema,
    handler: async ({ name, slug }, context) => {
      requireAdminCookies(context.cookies);
      const items = await readCategories();
      const key = normSlug(slug);
      if (items.some((x) => normSlug(x.slug) === key)) {
        return { categories: items, added: false };
      }
      const row = {
        id: randomUUID(),
        name: name.trim(),
        slug: key
      };
      items.push(row);
      await writeCategoriesFile(items);
      return { categories: await readCategories(), added: true };
    }
  }),
  deleteCategory: defineAction({
    accept: "json",
    input: z.object({ id: idSchema }),
    handler: async ({ id }, context) => {
      requireAdminCookies(context.cookies);
      const items = await readCategories();
      const next = items.filter((x) => x.id !== id);
      const removed = next.length !== items.length;
      if (removed) {
        await writeCategoriesFile(next);
      }
      return { categories: removed ? await readCategories() : items, removed };
    }
  }),
  updateCategorySeo: defineAction({
    accept: "json",
    input: z.object({
      id: idSchema,
      metaTitle: z.string().max(70),
      metaDescription: z.string().max(160),
      noindex: z.boolean(),
      ogImage: z.string().max(500)
    }),
    handler: async (input, context) => {
      requireAdminCookies(context.cookies);
      const items = await readCategories();
      const idx = items.findIndex((x) => x.id === input.id);
      if (idx === -1) {
        return { categories: items, updated: false };
      }
      const seo = seoFromUpdatePayload(input);
      const prev = items[idx];
      let nextRow;
      if (seo) {
        nextRow = { ...prev, seo };
      } else {
        const { seo: _drop, ...rest } = prev;
        nextRow = rest;
      }
      items[idx] = nextRow;
      await writeCategoriesFile(items);
      return { categories: await readCategories(), updated: true };
    }
  }),
  addTag: defineAction({
    accept: "json",
    input: addInputSchema,
    handler: async ({ name, slug }, context) => {
      requireAdminCookies(context.cookies);
      const items = await readTaxonomyFile(TAGS_JSON);
      const key = normSlug(slug);
      if (items.some((x) => normSlug(x.slug) === key)) {
        return { tags: sortItems(items), added: false };
      }
      const row = {
        id: randomUUID(),
        name: name.trim(),
        slug: key
      };
      items.push(row);
      await writeTaxonomyFile(TAGS_JSON, items);
      return { tags: sortItems(items), added: true };
    }
  }),
  deleteTag: defineAction({
    accept: "json",
    input: z.object({ id: idSchema }),
    handler: async ({ id }, context) => {
      requireAdminCookies(context.cookies);
      const items = await readTaxonomyFile(TAGS_JSON);
      const next = items.filter((x) => x.id !== id);
      const removed = next.length !== items.length;
      if (removed) {
        await writeTaxonomyFile(TAGS_JSON, next);
      }
      return { tags: sortItems(next), removed };
    }
  })
};

const SAFE_FILENAME = /^[\w-]+\.mdx?$/;
function normalizeOptionalSeoTitle(v) {
  const t = v?.trim();
  return t ? t : void 0;
}
const server = {
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
      const files = entries.filter((e) => e.isFile() && /\.mdx?$/.test(e.name)).map((e) => e.name).sort();
      return { files };
    }
  }),
  /**
   * getPost
   * Lê o conteúdo bruto de um arquivo de post.
   */
  getPost: defineAction({
    accept: "json",
    input: z.object({
      filename: z.string().regex(SAFE_FILENAME, "Nome de arquivo inválido.")
    }),
    handler: async ({ filename }, context) => {
      requireAdminCookies(context.cookies);
      const content = await readFile(join(BLOG_CONTENT_DIR, filename), "utf-8");
      return { filename, content };
    }
  }),
  /**
   * Carrega metadados + corpo Markdown de `src/content/pages/` para o editor de páginas.
   */
  getStaticPage: defineAction({
    accept: "json",
    input: z.object({
      relativePath: z.string().regex(SAFE_PAGES_REL_PATH, "Caminho do ficheiro inválido.")
    }),
    handler: async ({ relativePath }, context) => {
      requireAdminCookies(context.cookies);
      return await loadStaticPageForEditor(relativePath);
    }
  }),
  /**
   * Grava página estática (coleção `pages`) em `src/content/pages/*.md|mdx`.
   */
  saveStaticPage: defineAction({
    accept: "json",
    input: z.object({
      relativePath: z.string().regex(SAFE_PAGES_REL_PATH, "Caminho do ficheiro inválido."),
      previousRelativePath: z.string().regex(SAFE_PAGES_REL_PATH, "Caminho anterior inválido.").optional(),
      title: z.string().min(1).max(60),
      seoTitle: z.union([z.string().max(60), z.literal("")]).optional(),
      description: z.string().min(50).max(160),
      draft: z.boolean(),
      heroImage: z.union([z.string().min(1), z.literal("")]).optional(),
      canonical: z.union([z.string().url(), z.literal("")]).optional(),
      body: z.string().max(2e6)
    }),
    handler: async (input, context) => {
      requireAdminCookies(context.cookies);
      const updatedDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const content = formatStaticPageMarkdown({
        title: input.title.trim(),
        seoTitle: normalizeOptionalSeoTitle(input.seoTitle),
        description: input.description.trim(),
        draft: input.draft,
        heroImage: input.heroImage?.trim() || void 0,
        canonical: input.canonical?.trim() || void 0,
        updatedDate,
        body: input.body
      });
      await writePageMarkdownFile(input.relativePath, content);
      if (input.previousRelativePath && input.previousRelativePath !== input.relativePath) {
        await unlink(resolvePagesAbsolutePath(input.previousRelativePath));
      }
      return { relativePath: input.relativePath };
    }
  }),
  /**
   * savePost
   * Recebe os campos do editor; `body` é **HTML bruto** do contenteditable (sem conversão
   * para Markdown). Grava frontmatter + HTML no ficheiro `.md`/`.mdx` com `fs.writeFile`.
   * Não há sanitização do HTML — iframes (YouTube) mantêm atributos como `allowfullscreen`.
   */
  savePost: defineAction({
    accept: "json",
    input: z.object({
      filename: z.string().regex(SAFE_FILENAME, "Use apenas letras, números e hífens (ex: meu-post.md)."),
      previousFilename: z.string().regex(SAFE_FILENAME, "Nome de ficheiro inválido.").optional(),
      title: z.string().min(1).max(60),
      seoTitle: z.union([z.string().max(60), z.literal("")]).optional(),
      slug: z.string().regex(/^[\w-]+$/, "Slug: apenas letras minúsculas, números e hífens."),
      description: z.string().min(50).max(160),
      pubDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use data no formato YYYY-MM-DD."),
      category: z.union([z.string().max(80), z.literal("")]).optional(),
      tags: z.array(z.string().min(1).max(30)).max(10),
      author: z.union([z.string().max(80), z.literal("")]).optional(),
      heroImage: z.union([z.string().min(1), z.literal("")]).optional(),
      draft: z.boolean(),
      affiliateLinks: z.boolean(),
      body: z.string().max(2e6, "Corpo do artigo demasiado grande."),
      canonical: z.string().url().optional()
    }),
    handler: async ({
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
      canonical
    }, context) => {
      requireAdminCookies(context.cookies);
      const normalizedTags = tags.map((t) => t.trim()).filter(Boolean);
      const categoryTrim = category?.trim();
      const updatedDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const site = "https://example.com" ;
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
        category: categoryTrim || void 0,
        tags: normalizedTags,
        author: author?.trim() || void 0,
        heroImage: heroImage?.trim() || void 0,
        draft,
        affiliateLinks,
        body: bodyToSave,
        canonical: canonical?.trim() || void 0,
        updatedDate
      });
      await writeBlogMarkdownFile(filename, content);
      if (previousFilename && previousFilename !== filename) {
        await unlink(join(BLOG_CONTENT_DIR, previousFilename));
      }
      return {
        filename,
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }),
  /**
   * deletePost
   * Remove permanentemente o ficheiro em `src/content/blog/` (unlink).
   */
  deletePost: defineAction({
    accept: "json",
    input: z.object({
      filename: z.string().regex(SAFE_FILENAME, "Nome de arquivo inválido.")
    }),
    handler: async ({ filename }, context) => {
      requireAdminCookies(context.cookies);
      const target = join(BLOG_CONTENT_DIR, filename);
      await unlink(target);
      return { deleted: filename };
    }
  })
};

export { server };
