import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import { U as renderTemplate, D as maybeRenderHead, G as Fragment, a5 as addAttribute } from './sequence_Cm0YKoB9.mjs';
import { r as renderComponent } from './entrypoint_BkVNsX5w.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Do4mMRWJ.mjs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { P as PAGES_CONTENT_DIR } from './editor-server_HbjAKODc.mjs';
import { s as splitRawMarkdown, p as parsePostFrontmatter } from './blog-md-parse_DGY8WWUk.mjs';

async function collectMarkdownFiles(absDir, relPrefix) {
  const out = [];
  const entries = await readdir(absDir, { withFileTypes: true });
  for (const e of entries) {
    const seg = relPrefix ? `${relPrefix}/${e.name}` : e.name;
    if (e.name.startsWith(".")) continue;
    if (e.isDirectory()) {
      out.push(...await collectMarkdownFiles(join(absDir, e.name), seg));
    } else if (e.isFile() && /\.mdx?$/i.test(e.name)) {
      out.push(seg.replace(/\\/g, "/"));
    }
  }
  return out;
}
async function listPagesForDashboard() {
  const relPaths = await collectMarkdownFiles(PAGES_CONTENT_DIR, "");
  relPaths.sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
  const rows = [];
  for (const rel of relPaths) {
    const absFile = join(PAGES_CONTENT_DIR, ...rel.split("/"));
    const raw = await readFile(absFile, "utf-8");
    const { fm } = splitRawMarkdown(raw);
    const meta = parsePostFrontmatter(fm);
    rows.push({
      relativePath: rel,
      title: meta.title.trim() || "(sem título)",
      draft: meta.draft
    });
  }
  return rows;
}

const prerender = false;
const $$PagesList = createComponent(async ($$result, $$props, $$slots) => {
  const pages = await listPagesForDashboard();
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Páginas estáticas — Admin", "heading": "Páginas estáticas", "sectionTitle": "Conteúdo", "sectionActionLabel": "+ Adicionar Novo", "sectionActionHref": "/admin/page-editor" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <p class="text-sm text-slate-600">
Ficheiros em${" "} <code class="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-800">src/content/pages</code>
— URLs públicas em${" "} <code class="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-800">/</code> sem prefixo.
</p> ${pages.length === 0 ? renderTemplate`<div class="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"> <p class="mb-4 text-slate-600">Ainda não há ficheiros .md ou .mdx nesta pasta.</p> <a href="/admin/page-editor" class="font-medium text-violet-600 hover:text-violet-700 hover:underline">
Criar a primeira página
</a> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="hidden overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm md:block"> <table class="min-w-full text-left text-sm"> <thead> <tr class="border-b border-slate-200 bg-slate-100/90"> <th scope="col" class="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
Título
</th> <th scope="col" class="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
Ficheiro
</th> <th scope="col" class="w-32 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
Estado
</th> <th scope="col" class="w-24 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
Ações
</th> </tr> </thead> <tbody class="divide-y divide-slate-100"> ${pages.map((row) => renderTemplate`<tr class="transition-colors hover:bg-slate-50/80"> <td class="px-5 py-5 align-middle font-medium text-slate-900">${row.title}</td> <td class="px-5 py-5 align-middle font-mono text-xs text-slate-600">${row.relativePath}</td> <td class="px-5 py-5 align-middle"> ${row.draft ? renderTemplate`<span class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
Rascunho
</span>` : renderTemplate`<span class="text-xs text-slate-500">Publicado</span>`} </td> <td class="px-5 py-5 align-middle"> <div class="flex justify-end"> <a${addAttribute("/admin/page-editor?file=" + encodeURIComponent(row.relativePath), "href")} class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-600"${addAttribute("Editar «" + row.title + "»", "aria-label")} title="Editar"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path> </svg> </a> </div> </td> </tr>`)} </tbody> </table> </div> <ul class="space-y-3 md:hidden" role="list"> ${pages.map((row) => renderTemplate`<li class="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"> <div class="flex items-start justify-between gap-2"> <div class="min-w-0 flex-1"> <h2 class="font-semibold text-slate-900">${row.title}</h2> <p class="mt-1 font-mono text-xs text-slate-500">${row.relativePath}</p> </div> <a${addAttribute("/admin/page-editor?file=" + encodeURIComponent(row.relativePath), "href")} class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700 focus:outline focus:outline-2 focus:outline-violet-600"${addAttribute("Editar «" + row.title + "»", "aria-label")}> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path> </svg> </a> </div> <div class="mt-3 border-t border-slate-100 pt-3"> ${row.draft ? renderTemplate`<span class="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
Rascunho
</span>` : renderTemplate`<span class="text-xs text-slate-500">Publicado</span>`} </div> </li>`)} </ul> ` })}`} </div> ` })}`;
}, "C:/blogonauta/src/pages/admin/pages-list.astro", void 0);

const $$file = "C:/blogonauta/src/pages/admin/pages-list.astro";
const $$url = "/admin/pages-list";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$PagesList,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
