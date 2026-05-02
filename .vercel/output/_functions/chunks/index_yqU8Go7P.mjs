import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import { U as renderTemplate, D as maybeRenderHead, G as Fragment, a5 as addAttribute } from './sequence_Cm0YKoB9.mjs';
import { r as renderComponent } from './entrypoint_BkVNsX5w.mjs';
import { $ as $$DashboardLayout, r as renderScript } from './DashboardLayout_Do4mMRWJ.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { B as BLOG_CONTENT_DIR } from './editor-server_HbjAKODc.mjs';
import { s as splitRawMarkdown, p as parsePostFrontmatter } from './blog-md-parse_DGY8WWUk.mjs';

async function listPostsForDashboard() {
  const entries = await readdir(BLOG_CONTENT_DIR, { withFileTypes: true });
  const names = entries.filter(
    (e) => e.isFile() && /\.mdx?$/.test(e.name) && !e.name.startsWith("_deleted_")
  ).map((e) => e.name);
  const rows = [];
  for (const filename of names) {
    const raw = await readFile(join(BLOG_CONTENT_DIR, filename), "utf-8");
    const { fm } = splitRawMarkdown(raw);
    const meta = parsePostFrontmatter(fm);
    const slug = filename.replace(/\.mdx?$/i, "");
    rows.push({
      filename,
      slug,
      title: meta.title.trim() || "(sem título)",
      pubDate: meta.pubDate,
      draft: meta.draft
    });
  }
  rows.sort((a, b) => (b.pubDate || "").localeCompare(a.pubDate || ""));
  return rows;
}

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await listPostsForDashboard();
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Painel — Blogonauta", "heading": "Dashboard", "sectionTitle": "Conteúdo", "sectionActionLabel": "+ Adicionar Novo", "sectionActionHref": "/admin/editor" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <p class="text-sm text-slate-600">
Artigos em${" "} <code class="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-800">src/content/blog</code> </p> <div class="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5"> <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Atalhos</p> <div class="flex flex-wrap gap-2"> <a href="/admin/pages-list" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus:outline focus:outline-2 focus:outline-violet-600">
Páginas estáticas
</a> <a href="/admin/media" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus:outline focus:outline-2 focus:outline-violet-600">
Central de mídia
</a> <a href="/admin/taxonomies" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus:outline focus:outline-2 focus:outline-violet-600">
Taxonomias
</a> </div> </div> ${posts.length === 0 ? renderTemplate`<div class="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"> <p class="mb-4 text-slate-600">Ainda não há ficheiros .md ou .mdx nesta pasta.</p> <a href="/admin/editor" class="font-medium text-violet-600 hover:text-violet-700 hover:underline">
Criar o primeiro artigo
</a> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="hidden overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm md:block"> <table class="min-w-full text-left text-sm"> <thead> <tr class="border-b border-slate-200 bg-slate-100/90"> <th scope="col" class="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
Título
</th> <th scope="col" class="w-44 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
Publicação
</th> <th scope="col" class="w-28 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
Ações
</th> </tr> </thead> <tbody class="divide-y divide-slate-100"> ${posts.map((post) => renderTemplate`<tr class="transition-colors hover:bg-slate-50/80"> <td class="px-5 py-5 align-middle"> <div class="flex flex-wrap items-center gap-2"> <span class="font-medium text-slate-900">${post.title}</span> ${post.draft && renderTemplate`<span class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
Rascunho
</span>`} </div> <p class="mt-1 font-mono text-xs text-slate-500">${post.filename}</p> </td> <td class="px-5 py-5 align-middle tabular-nums text-slate-600"> ${post.pubDate ? (/* @__PURE__ */ new Date(post.pubDate + "T12:00:00")).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "—"} </td> <td class="px-5 py-5 align-middle"> <div class="flex items-center justify-end gap-1"> <a${addAttribute("/admin/editor?file=" + encodeURIComponent(post.filename), "href")} class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-600"${addAttribute("Editar «" + post.title + "»", "aria-label")} title="Editar"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path> </svg> </a> <button type="button" class="btn-delete inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-red-500"${addAttribute(post.filename, "data-filename")}${addAttribute(post.title, "data-title")}${addAttribute("Excluir «" + post.title + "»", "aria-label")} title="Excluir"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path> </svg> </button> </div> </td> </tr>`)} </tbody> </table> </div> <ul class="space-y-3 md:hidden" role="list"> ${posts.map((post) => renderTemplate`<li class="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"> <div class="mb-2 flex items-start justify-between gap-2"> <h2 class="leading-snug font-semibold text-slate-900">${post.title}</h2> ${post.draft && renderTemplate`<span class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Rascunho</span>`} </div> <p class="mb-1 font-mono text-xs text-slate-500">${post.filename}</p> <p class="mb-4 text-sm text-slate-600"> ${post.pubDate ? (/* @__PURE__ */ new Date(post.pubDate + "T12:00:00")).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : "—"} </p> <div class="flex justify-end gap-1 border-t border-slate-100 pt-3"> <a${addAttribute("/admin/editor?file=" + encodeURIComponent(post.filename), "href")} class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700 focus:outline focus:outline-2 focus:outline-violet-600"${addAttribute("Editar «" + post.title + "»", "aria-label")}> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path> </svg> </a> <button type="button" class="btn-delete inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 focus:outline focus:outline-2 focus:outline-red-500"${addAttribute(post.filename, "data-filename")}${addAttribute(post.title, "data-title")}${addAttribute("Excluir «" + post.title + "»", "aria-label")}> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path> </svg> </button> </div> </li>`)} </ul> ` })}`} </div> ${renderScript($$result2, "C:/blogonauta/src/pages/admin/dashboard/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/blogonauta/src/pages/admin/dashboard/index.astro", void 0);

const $$file = "C:/blogonauta/src/pages/admin/dashboard/index.astro";
const $$url = "/admin/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
