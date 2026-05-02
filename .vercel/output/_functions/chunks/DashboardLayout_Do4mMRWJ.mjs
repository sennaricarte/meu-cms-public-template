import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import { V as createRenderInstruction, be as renderHead, a5 as addAttribute, U as renderTemplate, H as renderSlot } from './sequence_Cm0YKoB9.mjs';
import { r as renderComponent } from './entrypoint_BkVNsX5w.mjs';
import 'clsx';
import { i as isValidAdminSession, A as ADMIN_SESSION_COOKIE } from './admin-session_CqodbBXM.mjs';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title, heading: headingProp, sectionTitle, sectionActionLabel, sectionActionHref } = Astro2.props;
  const trimmedSectionTitle = sectionTitle?.trim() ?? "";
  const trimmedActionHref = sectionActionHref?.trim() ?? "";
  const trimmedActionLabel = sectionActionLabel?.trim() ?? "";
  const hasSectionTitle = trimmedSectionTitle.length > 0;
  const hasSectionAction = trimmedActionHref.length > 0 && trimmedActionLabel.length > 0;
  if (!isValidAdminSession(Astro2.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return Astro2.redirect("/admin/login");
  }
  const rawPath = Astro2.url.pathname.replace(/\/+$/, "") || "/";
  function isNavActive(href) {
    const h = href.replace(/\/+$/, "") || "/";
    if (h === "/admin/dashboard") {
      return rawPath === "/admin/dashboard" || rawPath === "/admin";
    }
    return rawPath === h || rawPath.startsWith(`${h}/`);
  }
  function defaultHeading(t) {
    const seg = t.split(/\s*[—–-]\s*/)[0]?.trim();
    return seg && seg.length > 0 ? seg : t;
  }
  const pageHeading = headingProp?.trim() || defaultHeading(title);
  const sidebarLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/editor", label: "Novo artigo" },
    { href: "/admin/pages-list", label: "Páginas estáticas" },
    { href: "/admin/taxonomies", label: "Taxonomias" },
    { href: "/admin/menus", label: "Menus" },
    { href: "/admin/media", label: "Central de mídia" }
  ];
  const linkBase = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-600";
  const linkIdle = "text-slate-500 hover:bg-slate-50 hover:text-slate-700";
  const linkActive = "bg-violet-50 text-violet-600";
  return renderTemplate`<html lang="pt-br"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><link rel="icon" href="/favicon.ico"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-slate-50 antialiased text-slate-900"> <!-- Fundo mobile quando drawer aberto --> <div id="admin-sidebar-backdrop" class="fixed inset-0 z-30 bg-slate-900/40 opacity-0 pointer-events-none transition-opacity lg:hidden" aria-hidden="true"></div> <!-- Sidebar --> <aside id="admin-sidebar"${addAttribute([
    "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-100 bg-white transition-transform duration-200 ease-out lg:translate-x-0"
  ], "class:list")} aria-label="Navegação principal"> <div class="flex items-center gap-3 border-b border-slate-100 px-5 py-6"> <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-white shadow-sm shadow-violet-600/20" aria-hidden="true">
C
</div> <div class="min-w-0 leading-tight"> <p class="truncate text-sm font-semibold text-slate-900">CMS</p> <p class="truncate text-xs text-slate-500">Painel</p> </div> </div> <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Secções"> ${sidebarLinks.map(({ href, label }) => {
    const active = isNavActive(href);
    return renderTemplate`<a${addAttribute(href, "href")}${addAttribute([linkBase, active ? linkActive : linkIdle], "class:list")}${addAttribute(active ? "page" : void 0, "aria-current")}> ${href === "/admin/dashboard" && renderTemplate`<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-5H4v5zm10-9h6V4h-6v7z"></path> </svg>`} ${href === "/admin/editor" && renderTemplate`<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path> </svg>`} ${href === "/admin/pages-list" && renderTemplate`<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>`} ${href === "/admin/taxonomies" && renderTemplate`<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path> </svg>`} ${href === "/admin/menus" && renderTemplate`<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path> </svg>`} ${href === "/admin/media" && renderTemplate`<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg>`} <span>${label}</span> </a>`;
  })} </nav> <div class="border-t border-slate-100 p-3"> <a href="/admin/logout"${addAttribute([linkBase, linkIdle, "text-red-600 hover:bg-red-50 hover:text-red-700"], "class:list")}> <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path> </svg>
Sair
</a> </div> </aside> <div class="flex min-h-screen flex-col lg:pl-64"> <!-- Top bar --> <header class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 shadow-sm sm:px-6 lg:px-8"> <div class="flex min-w-0 items-center gap-3"> <button type="button" id="admin-sidebar-toggle" class="inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Abrir menu" aria-expanded="false" aria-controls="admin-sidebar"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> <h1 class="truncate text-lg font-semibold tracking-tight text-slate-900">${pageHeading}</h1> </div> <div class="flex items-center gap-1 sm:gap-2"> <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline focus:outline-2 focus:outline-violet-600" aria-label="Buscar"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"></path> </svg> </button> <button type="button" class="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline focus:outline-2 focus:outline-violet-600" aria-label="Notificações (3 não lidas)"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path> </svg> <span class="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold leading-none text-white">
3
</span> </button> <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus:outline focus:outline-2 focus:outline-violet-600" aria-label="Mensagens"> <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path> </svg> </button> <div class="ml-2 hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true"></div> <div class="flex items-center gap-3 pl-1"> <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700" aria-hidden="true">
J
</div> <div class="hidden min-w-0 sm:block leading-tight"> <p class="truncate text-sm font-medium text-slate-900">Olá, Julio</p> <p class="truncate text-xs text-slate-500">Admin</p> </div> </div> </div> </header> <!-- Conteúdo --> <main class="flex-1 px-4 py-8 sm:px-6 lg:px-10 xl:px-12"> <div class="mx-auto max-w-7xl"> ${hasSectionTitle && renderTemplate`<div class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between"> <h2 class="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">${trimmedSectionTitle}</h2> ${hasSectionAction && renderTemplate`<a${addAttribute(trimmedActionHref, "href")} class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-violet-600 sm:self-auto"> ${trimmedActionLabel} </a>`} </div>`} ${renderSlot($$result, $$slots["default"])} </div> </main> </div> ${renderScript($$result, "C:/blogonauta/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/blogonauta/src/layouts/AdminLayout.astro", void 0);

const $$DashboardLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$DashboardLayout;
  const { title, heading, sectionTitle, sectionActionLabel, sectionActionHref } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": title, "heading": heading, "sectionTitle": sectionTitle, "sectionActionLabel": sectionActionLabel, "sectionActionHref": sectionActionHref }, { "default": ($$result2) => renderTemplate` ${renderSlot($$result2, $$slots["default"])} ` })}`;
}, "C:/blogonauta/src/layouts/DashboardLayout.astro", void 0);

export { $$DashboardLayout as $, renderScript as r };
