import { c as createComponent } from './astro-component_2VF1it0G.mjs';
import 'piccolore';
import { U as renderTemplate, bd as defineScriptVars, D as maybeRenderHead } from './sequence_Cm0YKoB9.mjs';
import { r as renderComponent } from './entrypoint_BkVNsX5w.mjs';
import { $ as $$DashboardLayout } from './DashboardLayout_Do4mMRWJ.mjs';
import { a as readCategories, c as readTags } from './taxonomy-data_CDnVcCHl.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const prerender = false;
const $$Taxonomies = createComponent(async ($$result, $$props, $$slots) => {
  const initialCategories = await readCategories();
  const initialTags = await readTags();
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, { "title": "Taxonomias — Admin", "heading": "Taxonomias", "data-astro-cid-nscp4zgm": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="space-y-6" data-astro-cid-nscp4zgm> <p class="text-sm text-neutral-600 mb-6" data-astro-cid-nscp4zgm>\nGira categorias e tags como no WordPress. Os dados ficam em\n<code class="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800" data-astro-cid-nscp4zgm>src/data/categories.json</code>\ne\n<code class="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800" data-astro-cid-nscp4zgm>tags.json</code>.\n				Nas categorias, usa <strong class="font-medium text-neutral-800" data-astro-cid-nscp4zgm>Editar SEO</strong> para o título e descrição das páginas de arquivo em', ' <code class="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800" data-astro-cid-nscp4zgm>/blog/categoria/…</code>.\n</p> <!-- Tabs estilo WordPress (segmentos ligados) --> <div class="relative z-[2] mb-0 flex flex-wrap gap-0" role="tablist" aria-label="Tipo de taxonomia" data-astro-cid-nscp4zgm> <button type="button" id="tab-categories" role="tab" aria-selected="true" aria-controls="panel-taxonomy" class="taxonomy-tab rounded-t-md border border-b-0 border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-[inset_0_-1px_0_0_white] relative z-[1]" data-astro-cid-nscp4zgm>\nCategorias\n</button> <button type="button" id="tab-tags" role="tab" aria-selected="false" aria-controls="panel-taxonomy" class="taxonomy-tab relative z-[1] rounded-t-md border border-transparent border-b-neutral-300 bg-[#e8e8e8] px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900" data-astro-cid-nscp4zgm>\nTags\n</button> </div> <div id="panel-taxonomy" role="tabpanel" class="rounded-b-lg rounded-tr-lg border border-neutral-300 bg-white p-6 shadow-sm -mt-px" data-astro-cid-nscp4zgm> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start" data-astro-cid-nscp4zgm> <!-- Coluna esquerda: formulário --> <section class="space-y-4" aria-labelledby="form-taxonomy-heading" data-astro-cid-nscp4zgm> <div class="border-b border-neutral-200 pb-3" data-astro-cid-nscp4zgm> <h2 id="form-taxonomy-heading" class="text-lg font-semibold text-neutral-900" data-astro-cid-nscp4zgm>\nAdicionar nova <span id="form-mode-label" data-astro-cid-nscp4zgm>categoria</span> </h2> <p class="text-xs text-neutral-500 mt-1" data-astro-cid-nscp4zgm>\nO slug é usado na URL. Nas <strong class="font-medium text-neutral-700" data-astro-cid-nscp4zgm>categorias</strong>, o slug acompanha o nome enquanto escreves (podes editar o slug à parte).\n</p> </div> <form id="taxonomy-add-form" class="space-y-5" data-astro-cid-nscp4zgm> <div data-astro-cid-nscp4zgm> <label for="field-t-name" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Nome</label> <input id="field-t-name" type="text" name="name" required maxlength="80" autocomplete="off" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none" placeholder="Ex.: Tecnologia" data-astro-cid-nscp4zgm> </div> <div data-astro-cid-nscp4zgm> <label for="field-t-slug" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Slug</label> <div class="flex rounded border border-neutral-400 bg-neutral-50 overflow-hidden shadow-inner focus-within:border-[#2271b1] focus-within:ring-1 focus-within:ring-[#2271b1]" data-astro-cid-nscp4zgm> <span class="hidden sm:inline-flex items-center px-2.5 text-xs text-neutral-500 border-r border-neutral-300 bg-neutral-100 shrink-0" id="slug-prefix" aria-hidden="true" data-astro-cid-nscp4zgm>slug</span> <input id="field-t-slug" type="text" name="slug" required maxlength="80" spellcheck="false" autocomplete="off" pattern="[w-]+" title="Letras minúsculas, números e hífens" class="flex-1 min-w-0 border-0 bg-white px-3 py-2 text-sm font-mono text-neutral-900 focus:ring-0 focus:outline-none" placeholder="tecnologia" data-astro-cid-nscp4zgm> </div> <p class="text-xs text-neutral-500 mt-1.5" data-astro-cid-nscp4zgm> <button type="button" id="btn-resync-slug" class="text-[#2271b1] hover:underline font-medium" hidden data-astro-cid-nscp4zgm>\nRepor slug a partir do nome\n</button> <span id="slug-help-default" class="text-neutral-500" data-astro-cid-nscp4zgm>\nCategorias: preenchimento automático ao digitar o nome.\n</span> </p> </div> <button type="submit" class="inline-flex items-center justify-center rounded border border-[#2271b1] bg-[#2271b1] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#135e96] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2271b1]" data-astro-cid-nscp4zgm>\nAdicionar <span id="submit-mode-label" class="ml-1" data-astro-cid-nscp4zgm>categoria</span> </button> </form> <p id="taxonomy-form-msg" class="text-sm min-h-[1.25rem]" role="status" aria-live="polite" data-astro-cid-nscp4zgm></p> </section> <!-- Coluna direita: tabela estilo lista WP --> <section class="rounded border border-neutral-300 overflow-hidden bg-white" aria-labelledby="table-taxonomy-heading" data-astro-cid-nscp4zgm> <div class="border-b border-neutral-300 bg-[#f6f7f7] px-4 py-2.5 flex items-center justify-between gap-2" data-astro-cid-nscp4zgm> <h2 id="table-taxonomy-heading" class="text-sm font-semibold text-neutral-900" data-astro-cid-nscp4zgm>\nTodas as <span id="table-mode-label" data-astro-cid-nscp4zgm>categorias</span> </h2> <span class="text-xs text-neutral-500 tabular-nums" id="taxonomy-count" data-astro-cid-nscp4zgm>0 itens</span> </div> <div class="overflow-x-auto" data-astro-cid-nscp4zgm> <table id="taxonomy-main-table" class="w-full text-left text-sm border-collapse widefat" data-astro-cid-nscp4zgm> <thead data-astro-cid-nscp4zgm> <tr class="border-b border-neutral-300 bg-[#f6f7f7]" data-astro-cid-nscp4zgm> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900 w-24" data-astro-cid-nscp4zgm>ID</th> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900" data-astro-cid-nscp4zgm>Nome</th> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900" data-astro-cid-nscp4zgm>Slug</th> <th scope="col" class="col-seo px-4 py-2.5 font-semibold text-neutral-900 text-center w-28" data-astro-cid-nscp4zgm>\nSEO\n</th> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900 text-right w-24" data-astro-cid-nscp4zgm> <span class="sr-only" data-astro-cid-nscp4zgm>Ações</span> </th> </tr> </thead> <tbody id="taxonomy-table-body" class="bg-white divide-y divide-neutral-200" data-astro-cid-nscp4zgm></tbody> </table> </div> <p id="taxonomy-empty-hint" class="hidden px-4 py-8 text-sm text-neutral-500 text-center border-t border-neutral-200 bg-neutral-50/50" data-astro-cid-nscp4zgm>\nNenhum item. Adiciona um na coluna ao lado.\n</p> </section> </div> </div> </div> <dialog id="dialog-category-seo" class="rounded-lg border border-neutral-300 bg-white p-0 shadow-xl max-w-lg w-[min(100%,28rem)] backdrop:bg-black/50 open:backdrop:bg-black/50" aria-labelledby="dialog-seo-title" data-astro-cid-nscp4zgm> <form id="form-category-seo" class="p-6 space-y-4" data-astro-cid-nscp4zgm> <h2 id="dialog-seo-title" class="text-lg font-semibold text-neutral-900" data-astro-cid-nscp4zgm>SEO da categoria</h2> <input type="hidden" id="seo-edit-id" value="" data-astro-cid-nscp4zgm> <p class="text-xs text-neutral-600" data-astro-cid-nscp4zgm>\nPágina pública:\n<code id="seo-public-url" class="ml-1 bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 text-[11px] break-all" data-astro-cid-nscp4zgm></code> </p> <div data-astro-cid-nscp4zgm> <label for="seo-meta-title" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Título para Google (meta title)</label> <input id="seo-meta-title" type="text" maxlength="70" autocomplete="off" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none" placeholder="Se vazio, usa o nome da categoria" data-astro-cid-nscp4zgm> <p class="text-xs text-neutral-500 mt-1" data-astro-cid-nscp4zgm><span id="seo-count-title" data-astro-cid-nscp4zgm>0</span>/70</p> </div> <div data-astro-cid-nscp4zgm> <label for="seo-meta-desc" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Meta description</label> <textarea id="seo-meta-desc" maxlength="160" rows="3" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none resize-y min-h-[4.5rem]" placeholder="Resumo para resultados de pesquisa (recomendado até 160 caracteres)" data-astro-cid-nscp4zgm></textarea> <p class="text-xs text-neutral-500 mt-1" data-astro-cid-nscp4zgm><span id="seo-count-desc" data-astro-cid-nscp4zgm>0</span>/160</p> </div> <div data-astro-cid-nscp4zgm> <label for="seo-og-image" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Imagem Open Graph (URL ou caminho)</label> <input id="seo-og-image" type="text" maxlength="500" autocomplete="off" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none" placeholder="Ex.: /uploads/capa.webp ou https://…" data-astro-cid-nscp4zgm> </div> <div class="flex items-start gap-2" data-astro-cid-nscp4zgm> <input id="seo-noindex" type="checkbox" class="mt-1 rounded border-neutral-400" data-astro-cid-nscp4zgm> <label for="seo-noindex" class="text-sm text-neutral-800 leading-snug" data-astro-cid-nscp4zgm>\nNão indexar esta página de arquivo (<code class="text-xs" data-astro-cid-nscp4zgm>noindex</code>)\n</label> </div> <div class="flex flex-wrap gap-2 justify-end pt-2 border-t border-neutral-200" data-astro-cid-nscp4zgm> <button type="button" id="seo-btn-cancel" class="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" data-astro-cid-nscp4zgm>\nCancelar\n</button> <button type="submit" class="rounded border border-[#2271b1] bg-[#2271b1] px-4 py-2 text-sm font-medium text-white hover:bg-[#135e96]" data-astro-cid-nscp4zgm>\nGuardar SEO\n</button> </div> <p id="seo-form-msg" class="text-sm min-h-[1.25rem]" role="status" aria-live="polite" data-astro-cid-nscp4zgm></p> </form> </dialog>  <script>(function(){', `
		import { actions } from 'astro:actions';

		type CategoryRow = {
			id: string;
			name: string;
			slug: string;
			seo?: {
				metaTitle?: string;
				metaDescription?: string;
				noindex?: boolean;
				ogImage?: string;
			};
		};
		type TagRow = { id: string; name: string; slug: string };

		let mode: 'categories' | 'tags' = 'categories';
		let categories: CategoryRow[] = initialCategories as CategoryRow[];
		let tags: TagRow[] = initialTags;

		/** Se o utilizador editou o slug manualmente, deixamos de sobrescrever (até repor). */
		let slugLocked = false;

		const tabCat = document.querySelector('#tab-categories');
		const tabTags = document.querySelector('#tab-tags');
		const formLabel = document.querySelector('#form-mode-label');
		const submitLabel = document.querySelector('#submit-mode-label');
		const tableLabel = document.querySelector('#table-mode-label');
		const countEl = document.querySelector('#taxonomy-count');
		const tbody = document.querySelector('#taxonomy-table-body');
		const emptyHint = document.querySelector('#taxonomy-empty-hint');
		const form = document.querySelector('#taxonomy-add-form');
		const nameInput = document.querySelector('#field-t-name');
		const slugInput = document.querySelector('#field-t-slug');
		const msgEl = document.querySelector('#taxonomy-form-msg');
		const btnResync = document.querySelector('#btn-resync-slug');
		const slugHelpDefault = document.querySelector('#slug-help-default');
		const dialogSeo = document.querySelector('#dialog-category-seo');
		const formSeo = document.querySelector('#form-category-seo');
		const seoEditId = document.querySelector('#seo-edit-id');
		const seoPublicUrl = document.querySelector('#seo-public-url');
		const seoMetaTitle = document.querySelector('#seo-meta-title');
		const seoMetaDesc = document.querySelector('#seo-meta-desc');
		const seoOgImage = document.querySelector('#seo-og-image');
		const seoNoindex = document.querySelector('#seo-noindex');
		const seoCountTitle = document.querySelector('#seo-count-title');
		const seoCountDesc = document.querySelector('#seo-count-desc');
		const seoFormMsg = document.querySelector('#seo-form-msg');
		const seoBtnCancel = document.querySelector('#seo-btn-cancel');

		function slugify(raw: string): string {
			return raw
				.normalize('NFD')
				.replace(/\\p{M}/gu, '')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '')
				.slice(0, 80);
		}

		function syncSlugFromName() {
			if (!(slugInput instanceof HTMLInputElement) || !(nameInput instanceof HTMLInputElement)) return;
			if (mode !== 'categories' || slugLocked) return;
			slugInput.value = slugify(nameInput.value);
			updateResyncVisibility();
		}

		function updateResyncVisibility() {
			if (!(btnResync instanceof HTMLButtonElement) || !(slugHelpDefault instanceof HTMLElement)) return;
			const show = mode === 'categories' && slugLocked;
			btnResync.hidden = !show;
			slugHelpDefault.classList.toggle('hidden', show);
		}

		function currentRows(): CategoryRow[] | TagRow[] {
			return mode === 'categories' ? categories : tags;
		}

		function setRows(next: CategoryRow[] | TagRow[]) {
			if (mode === 'categories') categories = next as CategoryRow[];
			else tags = next as TagRow[];
		}

		function renderTable() {
			if (!(tbody instanceof HTMLTableSectionElement)) return;
			const rows = currentRows();
			tbody.replaceChildren();
			if (countEl) countEl.textContent = \`\${rows.length} \${rows.length === 1 ? 'item' : 'itens'}\`;
			if (rows.length === 0) {
				emptyHint?.classList.remove('hidden');
			} else {
				emptyHint?.classList.add('hidden');
			}
			for (const row of rows) {
				const tr = document.createElement('tr');
				tr.className = 'hover:bg-[#f6f7f7] transition-colors';
				const seoBtn =
					mode === 'categories'
						? \`<button type="button" class="taxonomy-seo text-[#2271b1] hover:text-[#135e96] text-sm font-medium hover:underline focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#2271b1] rounded" data-id="\${escapeAttr(row.id)}">Editar SEO</button>\`
						: '—';
				tr.innerHTML = \`
					<td class="px-4 py-2.5 font-mono text-[10px] text-neutral-500 align-top" title="\${escapeAttr(row.id)}">\${escapeHtml(row.id.slice(0, 8))}…</td>
					<td class="px-4 py-2.5 text-neutral-900 font-medium align-top">\${escapeHtml(row.name)}</td>
					<td class="px-4 py-2.5 font-mono text-xs text-neutral-700 align-top">\${escapeHtml(row.slug)}</td>
					<td class="col-seo px-4 py-2.5 text-center align-top">\${seoBtn}</td>
					<td class="px-4 py-2.5 text-right align-top">
						<button type="button" class="taxonomy-del text-[#b32d2e] hover:text-[#8a2424] text-sm font-medium hover:underline focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#2271b1] rounded" data-id="\${escapeAttr(row.id)}">
							Excluir
						</button>
					</td>
				\`;
				tbody.appendChild(tr);
			}
			for (const btn of tbody.querySelectorAll('button.taxonomy-del')) {
				btn.addEventListener('click', onDeleteClick);
			}
			for (const btn of tbody.querySelectorAll('button.taxonomy-seo')) {
				btn.addEventListener('click', onSeoClick);
			}
		}

		function escapeHtml(s: string): string {
			const d = document.createElement('div');
			d.textContent = s;
			return d.innerHTML;
		}

		function escapeAttr(s: string): string {
			return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
		}

		function syncSeoCounters() {
			if (seoMetaTitle instanceof HTMLInputElement && seoCountTitle) {
				seoCountTitle.textContent = String(seoMetaTitle.value.length);
			}
			if (seoMetaDesc instanceof HTMLTextAreaElement && seoCountDesc) {
				seoCountDesc.textContent = String(seoMetaDesc.value.length);
			}
		}

		function openSeoDialog(cat: CategoryRow) {
			if (!(dialogSeo instanceof HTMLDialogElement)) return;
			if (seoEditId instanceof HTMLInputElement) seoEditId.value = cat.id;
			if (seoPublicUrl) seoPublicUrl.textContent = \`/blog/categoria/\${cat.slug}/\`;
			if (seoMetaTitle instanceof HTMLInputElement) seoMetaTitle.value = cat.seo?.metaTitle ?? '';
			if (seoMetaDesc instanceof HTMLTextAreaElement) seoMetaDesc.value = cat.seo?.metaDescription ?? '';
			if (seoOgImage instanceof HTMLInputElement) seoOgImage.value = cat.seo?.ogImage ?? '';
			if (seoNoindex instanceof HTMLInputElement) seoNoindex.checked = Boolean(cat.seo?.noindex);
			if (seoFormMsg) {
				seoFormMsg.textContent = '';
				seoFormMsg.className = 'text-sm min-h-[1.25rem]';
			}
			syncSeoCounters();
			dialogSeo.showModal();
		}

		function onSeoClick(ev: Event) {
			const btn = ev.currentTarget;
			if (!(btn instanceof HTMLButtonElement)) return;
			const id = btn.getAttribute('data-id');
			if (!id) return;
			const cat = categories.find((c) => c.id === id);
			if (!cat) return;
			openSeoDialog(cat);
		}

		seoMetaTitle?.addEventListener('input', syncSeoCounters);
		seoMetaDesc?.addEventListener('input', syncSeoCounters);

		seoBtnCancel?.addEventListener('click', () => {
			if (dialogSeo instanceof HTMLDialogElement) dialogSeo.close();
		});

		formSeo?.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!(seoEditId instanceof HTMLInputElement)) return;
			const id = seoEditId.value.trim();
			if (!id) return;
			const metaTitle = seoMetaTitle instanceof HTMLInputElement ? seoMetaTitle.value : '';
			const metaDescription = seoMetaDesc instanceof HTMLTextAreaElement ? seoMetaDesc.value : '';
			const ogImage = seoOgImage instanceof HTMLInputElement ? seoOgImage.value : '';
			const noindex = seoNoindex instanceof HTMLInputElement ? seoNoindex.checked : false;
			if (seoFormMsg) {
				seoFormMsg.textContent = 'A gravar…';
				seoFormMsg.className = 'text-sm min-h-[1.25rem] text-neutral-600';
			}
			try {
				const { data, error } = await actions.taxonomy.updateCategorySeo({
					id,
					metaTitle,
					metaDescription,
					noindex,
					ogImage,
				});
				if (error) {
					if (seoFormMsg) {
						seoFormMsg.textContent = error.message;
						seoFormMsg.className = 'text-sm min-h-[1.25rem] text-[#b32d2e]';
					}
					return;
				}
				if (data?.categories) {
					categories = data.categories as CategoryRow[];
					renderTable();
				}
				if (dialogSeo instanceof HTMLDialogElement) dialogSeo.close();
				setMsg('SEO da categoria atualizado.');
			} catch (err) {
				if (seoFormMsg) {
					seoFormMsg.textContent = err instanceof Error ? err.message : 'Erro ao gravar.';
					seoFormMsg.className = 'text-sm min-h-[1.25rem] text-[#b32d2e]';
				}
			}
		});

		function setMsg(text: string, isError = false) {
			if (!(msgEl instanceof HTMLElement)) return;
			msgEl.textContent = text;
			msgEl.className =
				'text-sm min-h-[1.25rem] ' + (isError ? 'text-[#b32d2e]' : 'text-neutral-600');
		}

		function updateTabStyles() {
			const activeTab =
				'taxonomy-tab rounded-t-md border border-b-0 border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-[inset_0_-1px_0_0_white] relative z-[1]';
			const idleTab =
				'taxonomy-tab relative z-[1] rounded-t-md border border-transparent border-b-neutral-300 bg-[#e8e8e8] px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900';

			if (tabCat instanceof HTMLButtonElement) {
				tabCat.className = mode === 'categories' ? activeTab : idleTab;
				tabCat.setAttribute('aria-selected', mode === 'categories' ? 'true' : 'false');
			}
			if (tabTags instanceof HTMLButtonElement) {
				tabTags.className = mode === 'tags' ? activeTab : idleTab;
				tabTags.setAttribute('aria-selected', mode === 'tags' ? 'true' : 'false');
			}
			if (formLabel) formLabel.textContent = mode === 'categories' ? 'categoria' : 'tag';
			if (submitLabel) submitLabel.textContent = mode === 'categories' ? 'categoria' : 'tag';
			if (tableLabel) tableLabel.textContent = mode === 'categories' ? 'categorias' : 'tags';
			updateResyncVisibility();
			const tbl = document.querySelector('#taxonomy-main-table');
			if (tbl) tbl.classList.toggle('taxonomy-mode-tags', mode === 'tags');
		}

		function switchMode(next: 'categories' | 'tags') {
			mode = next;
			slugLocked = false;
			updateTabStyles();
			if (form instanceof HTMLFormElement) form.reset();
			setMsg('');
			renderTable();
			if (mode === 'categories' && nameInput instanceof HTMLInputElement && slugInput instanceof HTMLInputElement) {
				syncSlugFromName();
			}
		}

		tabCat?.addEventListener('click', () => switchMode('categories'));
		tabTags?.addEventListener('click', () => switchMode('tags'));

		nameInput?.addEventListener('input', () => {
			syncSlugFromName();
		});

		slugInput?.addEventListener('input', () => {
			if (mode === 'categories') slugLocked = true;
			updateResyncVisibility();
		});

		btnResync?.addEventListener('click', () => {
			slugLocked = false;
			syncSlugFromName();
			setMsg('Slug reposto a partir do nome.');
		});

		form?.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!(nameInput instanceof HTMLInputElement) || !(slugInput instanceof HTMLInputElement)) return;
			const name = nameInput.value.trim();
			const slug = slugInput.value.trim().toLowerCase();
			if (!name || !slug) {
				setMsg('Preenche o nome e o slug.', true);
				return;
			}
			setMsg('A gravar…');
			try {
				if (mode === 'categories') {
					const { data, error } = await actions.taxonomy.addCategory({ name, slug });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.categories) {
						setRows(data.categories);
						renderTable();
					}
					if (data && 'added' in data && data.added === false) {
						setMsg('Já existe uma categoria com este slug.');
					} else {
						setMsg('Categoria adicionada.');
						form.reset();
						slugLocked = false;
						syncSlugFromName();
					}
				} else {
					const { data, error } = await actions.taxonomy.addTag({ name, slug });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.tags) {
						setRows(data.tags);
						renderTable();
					}
					if (data && 'added' in data && data.added === false) {
						setMsg('Já existe uma tag com este slug.');
					} else {
						setMsg('Tag adicionada.');
						form.reset();
						slugLocked = false;
					}
				}
			} catch (err) {
				setMsg(err instanceof Error ? err.message : 'Erro ao gravar.', true);
			}
		});

		async function onDeleteClick(ev: Event) {
			const btn = ev.currentTarget;
			if (!(btn instanceof HTMLButtonElement)) return;
			const id = btn.getAttribute('data-id');
			if (!id || !confirm('Eliminar este item permanentemente?')) return;
			setMsg('');
			try {
				if (mode === 'categories') {
					const { data, error } = await actions.taxonomy.deleteCategory({ id });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.categories) {
						setRows(data.categories);
						renderTable();
					}
					setMsg(data?.removed ? 'Categoria removida.' : 'Item não encontrado.');
				} else {
					const { data, error } = await actions.taxonomy.deleteTag({ id });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.tags) {
						setRows(data.tags);
						renderTable();
					}
					setMsg(data?.removed ? 'Tag removida.' : 'Item não encontrado.');
				}
			} catch (err) {
				setMsg(err instanceof Error ? err.message : 'Erro ao excluir.', true);
			}
		}

		updateTabStyles();
		renderTable();
		if (mode === 'categories') syncSlugFromName();
	})();<\/script> `], [" ", '<div class="space-y-6" data-astro-cid-nscp4zgm> <p class="text-sm text-neutral-600 mb-6" data-astro-cid-nscp4zgm>\nGira categorias e tags como no WordPress. Os dados ficam em\n<code class="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800" data-astro-cid-nscp4zgm>src/data/categories.json</code>\ne\n<code class="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800" data-astro-cid-nscp4zgm>tags.json</code>.\n				Nas categorias, usa <strong class="font-medium text-neutral-800" data-astro-cid-nscp4zgm>Editar SEO</strong> para o título e descrição das páginas de arquivo em', ' <code class="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-800" data-astro-cid-nscp4zgm>/blog/categoria/…</code>.\n</p> <!-- Tabs estilo WordPress (segmentos ligados) --> <div class="relative z-[2] mb-0 flex flex-wrap gap-0" role="tablist" aria-label="Tipo de taxonomia" data-astro-cid-nscp4zgm> <button type="button" id="tab-categories" role="tab" aria-selected="true" aria-controls="panel-taxonomy" class="taxonomy-tab rounded-t-md border border-b-0 border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-[inset_0_-1px_0_0_white] relative z-[1]" data-astro-cid-nscp4zgm>\nCategorias\n</button> <button type="button" id="tab-tags" role="tab" aria-selected="false" aria-controls="panel-taxonomy" class="taxonomy-tab relative z-[1] rounded-t-md border border-transparent border-b-neutral-300 bg-[#e8e8e8] px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900" data-astro-cid-nscp4zgm>\nTags\n</button> </div> <div id="panel-taxonomy" role="tabpanel" class="rounded-b-lg rounded-tr-lg border border-neutral-300 bg-white p-6 shadow-sm -mt-px" data-astro-cid-nscp4zgm> <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start" data-astro-cid-nscp4zgm> <!-- Coluna esquerda: formulário --> <section class="space-y-4" aria-labelledby="form-taxonomy-heading" data-astro-cid-nscp4zgm> <div class="border-b border-neutral-200 pb-3" data-astro-cid-nscp4zgm> <h2 id="form-taxonomy-heading" class="text-lg font-semibold text-neutral-900" data-astro-cid-nscp4zgm>\nAdicionar nova <span id="form-mode-label" data-astro-cid-nscp4zgm>categoria</span> </h2> <p class="text-xs text-neutral-500 mt-1" data-astro-cid-nscp4zgm>\nO slug é usado na URL. Nas <strong class="font-medium text-neutral-700" data-astro-cid-nscp4zgm>categorias</strong>, o slug acompanha o nome enquanto escreves (podes editar o slug à parte).\n</p> </div> <form id="taxonomy-add-form" class="space-y-5" data-astro-cid-nscp4zgm> <div data-astro-cid-nscp4zgm> <label for="field-t-name" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Nome</label> <input id="field-t-name" type="text" name="name" required maxlength="80" autocomplete="off" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none" placeholder="Ex.: Tecnologia" data-astro-cid-nscp4zgm> </div> <div data-astro-cid-nscp4zgm> <label for="field-t-slug" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Slug</label> <div class="flex rounded border border-neutral-400 bg-neutral-50 overflow-hidden shadow-inner focus-within:border-[#2271b1] focus-within:ring-1 focus-within:ring-[#2271b1]" data-astro-cid-nscp4zgm> <span class="hidden sm:inline-flex items-center px-2.5 text-xs text-neutral-500 border-r border-neutral-300 bg-neutral-100 shrink-0" id="slug-prefix" aria-hidden="true" data-astro-cid-nscp4zgm>slug</span> <input id="field-t-slug" type="text" name="slug" required maxlength="80" spellcheck="false" autocomplete="off" pattern="[\\w-]+" title="Letras minúsculas, números e hífens" class="flex-1 min-w-0 border-0 bg-white px-3 py-2 text-sm font-mono text-neutral-900 focus:ring-0 focus:outline-none" placeholder="tecnologia" data-astro-cid-nscp4zgm> </div> <p class="text-xs text-neutral-500 mt-1.5" data-astro-cid-nscp4zgm> <button type="button" id="btn-resync-slug" class="text-[#2271b1] hover:underline font-medium" hidden data-astro-cid-nscp4zgm>\nRepor slug a partir do nome\n</button> <span id="slug-help-default" class="text-neutral-500" data-astro-cid-nscp4zgm>\nCategorias: preenchimento automático ao digitar o nome.\n</span> </p> </div> <button type="submit" class="inline-flex items-center justify-center rounded border border-[#2271b1] bg-[#2271b1] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#135e96] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2271b1]" data-astro-cid-nscp4zgm>\nAdicionar <span id="submit-mode-label" class="ml-1" data-astro-cid-nscp4zgm>categoria</span> </button> </form> <p id="taxonomy-form-msg" class="text-sm min-h-[1.25rem]" role="status" aria-live="polite" data-astro-cid-nscp4zgm></p> </section> <!-- Coluna direita: tabela estilo lista WP --> <section class="rounded border border-neutral-300 overflow-hidden bg-white" aria-labelledby="table-taxonomy-heading" data-astro-cid-nscp4zgm> <div class="border-b border-neutral-300 bg-[#f6f7f7] px-4 py-2.5 flex items-center justify-between gap-2" data-astro-cid-nscp4zgm> <h2 id="table-taxonomy-heading" class="text-sm font-semibold text-neutral-900" data-astro-cid-nscp4zgm>\nTodas as <span id="table-mode-label" data-astro-cid-nscp4zgm>categorias</span> </h2> <span class="text-xs text-neutral-500 tabular-nums" id="taxonomy-count" data-astro-cid-nscp4zgm>0 itens</span> </div> <div class="overflow-x-auto" data-astro-cid-nscp4zgm> <table id="taxonomy-main-table" class="w-full text-left text-sm border-collapse widefat" data-astro-cid-nscp4zgm> <thead data-astro-cid-nscp4zgm> <tr class="border-b border-neutral-300 bg-[#f6f7f7]" data-astro-cid-nscp4zgm> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900 w-24" data-astro-cid-nscp4zgm>ID</th> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900" data-astro-cid-nscp4zgm>Nome</th> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900" data-astro-cid-nscp4zgm>Slug</th> <th scope="col" class="col-seo px-4 py-2.5 font-semibold text-neutral-900 text-center w-28" data-astro-cid-nscp4zgm>\nSEO\n</th> <th scope="col" class="px-4 py-2.5 font-semibold text-neutral-900 text-right w-24" data-astro-cid-nscp4zgm> <span class="sr-only" data-astro-cid-nscp4zgm>Ações</span> </th> </tr> </thead> <tbody id="taxonomy-table-body" class="bg-white divide-y divide-neutral-200" data-astro-cid-nscp4zgm></tbody> </table> </div> <p id="taxonomy-empty-hint" class="hidden px-4 py-8 text-sm text-neutral-500 text-center border-t border-neutral-200 bg-neutral-50/50" data-astro-cid-nscp4zgm>\nNenhum item. Adiciona um na coluna ao lado.\n</p> </section> </div> </div> </div> <dialog id="dialog-category-seo" class="rounded-lg border border-neutral-300 bg-white p-0 shadow-xl max-w-lg w-[min(100%,28rem)] backdrop:bg-black/50 open:backdrop:bg-black/50" aria-labelledby="dialog-seo-title" data-astro-cid-nscp4zgm> <form id="form-category-seo" class="p-6 space-y-4" data-astro-cid-nscp4zgm> <h2 id="dialog-seo-title" class="text-lg font-semibold text-neutral-900" data-astro-cid-nscp4zgm>SEO da categoria</h2> <input type="hidden" id="seo-edit-id" value="" data-astro-cid-nscp4zgm> <p class="text-xs text-neutral-600" data-astro-cid-nscp4zgm>\nPágina pública:\n<code id="seo-public-url" class="ml-1 bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800 text-[11px] break-all" data-astro-cid-nscp4zgm></code> </p> <div data-astro-cid-nscp4zgm> <label for="seo-meta-title" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Título para Google (meta title)</label> <input id="seo-meta-title" type="text" maxlength="70" autocomplete="off" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none" placeholder="Se vazio, usa o nome da categoria" data-astro-cid-nscp4zgm> <p class="text-xs text-neutral-500 mt-1" data-astro-cid-nscp4zgm><span id="seo-count-title" data-astro-cid-nscp4zgm>0</span>/70</p> </div> <div data-astro-cid-nscp4zgm> <label for="seo-meta-desc" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Meta description</label> <textarea id="seo-meta-desc" maxlength="160" rows="3" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none resize-y min-h-[4.5rem]" placeholder="Resumo para resultados de pesquisa (recomendado até 160 caracteres)" data-astro-cid-nscp4zgm></textarea> <p class="text-xs text-neutral-500 mt-1" data-astro-cid-nscp4zgm><span id="seo-count-desc" data-astro-cid-nscp4zgm>0</span>/160</p> </div> <div data-astro-cid-nscp4zgm> <label for="seo-og-image" class="block text-sm font-semibold text-neutral-900 mb-1" data-astro-cid-nscp4zgm>Imagem Open Graph (URL ou caminho)</label> <input id="seo-og-image" type="text" maxlength="500" autocomplete="off" class="wp-input w-full rounded border border-neutral-400 px-3 py-2 text-sm shadow-inner bg-white focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] focus:outline-none" placeholder="Ex.: /uploads/capa.webp ou https://…" data-astro-cid-nscp4zgm> </div> <div class="flex items-start gap-2" data-astro-cid-nscp4zgm> <input id="seo-noindex" type="checkbox" class="mt-1 rounded border-neutral-400" data-astro-cid-nscp4zgm> <label for="seo-noindex" class="text-sm text-neutral-800 leading-snug" data-astro-cid-nscp4zgm>\nNão indexar esta página de arquivo (<code class="text-xs" data-astro-cid-nscp4zgm>noindex</code>)\n</label> </div> <div class="flex flex-wrap gap-2 justify-end pt-2 border-t border-neutral-200" data-astro-cid-nscp4zgm> <button type="button" id="seo-btn-cancel" class="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50" data-astro-cid-nscp4zgm>\nCancelar\n</button> <button type="submit" class="rounded border border-[#2271b1] bg-[#2271b1] px-4 py-2 text-sm font-medium text-white hover:bg-[#135e96]" data-astro-cid-nscp4zgm>\nGuardar SEO\n</button> </div> <p id="seo-form-msg" class="text-sm min-h-[1.25rem]" role="status" aria-live="polite" data-astro-cid-nscp4zgm></p> </form> </dialog>  <script>(function(){', `
		import { actions } from 'astro:actions';

		type CategoryRow = {
			id: string;
			name: string;
			slug: string;
			seo?: {
				metaTitle?: string;
				metaDescription?: string;
				noindex?: boolean;
				ogImage?: string;
			};
		};
		type TagRow = { id: string; name: string; slug: string };

		let mode: 'categories' | 'tags' = 'categories';
		let categories: CategoryRow[] = initialCategories as CategoryRow[];
		let tags: TagRow[] = initialTags;

		/** Se o utilizador editou o slug manualmente, deixamos de sobrescrever (até repor). */
		let slugLocked = false;

		const tabCat = document.querySelector('#tab-categories');
		const tabTags = document.querySelector('#tab-tags');
		const formLabel = document.querySelector('#form-mode-label');
		const submitLabel = document.querySelector('#submit-mode-label');
		const tableLabel = document.querySelector('#table-mode-label');
		const countEl = document.querySelector('#taxonomy-count');
		const tbody = document.querySelector('#taxonomy-table-body');
		const emptyHint = document.querySelector('#taxonomy-empty-hint');
		const form = document.querySelector('#taxonomy-add-form');
		const nameInput = document.querySelector('#field-t-name');
		const slugInput = document.querySelector('#field-t-slug');
		const msgEl = document.querySelector('#taxonomy-form-msg');
		const btnResync = document.querySelector('#btn-resync-slug');
		const slugHelpDefault = document.querySelector('#slug-help-default');
		const dialogSeo = document.querySelector('#dialog-category-seo');
		const formSeo = document.querySelector('#form-category-seo');
		const seoEditId = document.querySelector('#seo-edit-id');
		const seoPublicUrl = document.querySelector('#seo-public-url');
		const seoMetaTitle = document.querySelector('#seo-meta-title');
		const seoMetaDesc = document.querySelector('#seo-meta-desc');
		const seoOgImage = document.querySelector('#seo-og-image');
		const seoNoindex = document.querySelector('#seo-noindex');
		const seoCountTitle = document.querySelector('#seo-count-title');
		const seoCountDesc = document.querySelector('#seo-count-desc');
		const seoFormMsg = document.querySelector('#seo-form-msg');
		const seoBtnCancel = document.querySelector('#seo-btn-cancel');

		function slugify(raw: string): string {
			return raw
				.normalize('NFD')
				.replace(/\\\\p{M}/gu, '')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '')
				.slice(0, 80);
		}

		function syncSlugFromName() {
			if (!(slugInput instanceof HTMLInputElement) || !(nameInput instanceof HTMLInputElement)) return;
			if (mode !== 'categories' || slugLocked) return;
			slugInput.value = slugify(nameInput.value);
			updateResyncVisibility();
		}

		function updateResyncVisibility() {
			if (!(btnResync instanceof HTMLButtonElement) || !(slugHelpDefault instanceof HTMLElement)) return;
			const show = mode === 'categories' && slugLocked;
			btnResync.hidden = !show;
			slugHelpDefault.classList.toggle('hidden', show);
		}

		function currentRows(): CategoryRow[] | TagRow[] {
			return mode === 'categories' ? categories : tags;
		}

		function setRows(next: CategoryRow[] | TagRow[]) {
			if (mode === 'categories') categories = next as CategoryRow[];
			else tags = next as TagRow[];
		}

		function renderTable() {
			if (!(tbody instanceof HTMLTableSectionElement)) return;
			const rows = currentRows();
			tbody.replaceChildren();
			if (countEl) countEl.textContent = \\\`\\\${rows.length} \\\${rows.length === 1 ? 'item' : 'itens'}\\\`;
			if (rows.length === 0) {
				emptyHint?.classList.remove('hidden');
			} else {
				emptyHint?.classList.add('hidden');
			}
			for (const row of rows) {
				const tr = document.createElement('tr');
				tr.className = 'hover:bg-[#f6f7f7] transition-colors';
				const seoBtn =
					mode === 'categories'
						? \\\`<button type="button" class="taxonomy-seo text-[#2271b1] hover:text-[#135e96] text-sm font-medium hover:underline focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#2271b1] rounded" data-id="\\\${escapeAttr(row.id)}">Editar SEO</button>\\\`
						: '—';
				tr.innerHTML = \\\`
					<td class="px-4 py-2.5 font-mono text-[10px] text-neutral-500 align-top" title="\\\${escapeAttr(row.id)}">\\\${escapeHtml(row.id.slice(0, 8))}…</td>
					<td class="px-4 py-2.5 text-neutral-900 font-medium align-top">\\\${escapeHtml(row.name)}</td>
					<td class="px-4 py-2.5 font-mono text-xs text-neutral-700 align-top">\\\${escapeHtml(row.slug)}</td>
					<td class="col-seo px-4 py-2.5 text-center align-top">\\\${seoBtn}</td>
					<td class="px-4 py-2.5 text-right align-top">
						<button type="button" class="taxonomy-del text-[#b32d2e] hover:text-[#8a2424] text-sm font-medium hover:underline focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[#2271b1] rounded" data-id="\\\${escapeAttr(row.id)}">
							Excluir
						</button>
					</td>
				\\\`;
				tbody.appendChild(tr);
			}
			for (const btn of tbody.querySelectorAll('button.taxonomy-del')) {
				btn.addEventListener('click', onDeleteClick);
			}
			for (const btn of tbody.querySelectorAll('button.taxonomy-seo')) {
				btn.addEventListener('click', onSeoClick);
			}
		}

		function escapeHtml(s: string): string {
			const d = document.createElement('div');
			d.textContent = s;
			return d.innerHTML;
		}

		function escapeAttr(s: string): string {
			return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
		}

		function syncSeoCounters() {
			if (seoMetaTitle instanceof HTMLInputElement && seoCountTitle) {
				seoCountTitle.textContent = String(seoMetaTitle.value.length);
			}
			if (seoMetaDesc instanceof HTMLTextAreaElement && seoCountDesc) {
				seoCountDesc.textContent = String(seoMetaDesc.value.length);
			}
		}

		function openSeoDialog(cat: CategoryRow) {
			if (!(dialogSeo instanceof HTMLDialogElement)) return;
			if (seoEditId instanceof HTMLInputElement) seoEditId.value = cat.id;
			if (seoPublicUrl) seoPublicUrl.textContent = \\\`/blog/categoria/\\\${cat.slug}/\\\`;
			if (seoMetaTitle instanceof HTMLInputElement) seoMetaTitle.value = cat.seo?.metaTitle ?? '';
			if (seoMetaDesc instanceof HTMLTextAreaElement) seoMetaDesc.value = cat.seo?.metaDescription ?? '';
			if (seoOgImage instanceof HTMLInputElement) seoOgImage.value = cat.seo?.ogImage ?? '';
			if (seoNoindex instanceof HTMLInputElement) seoNoindex.checked = Boolean(cat.seo?.noindex);
			if (seoFormMsg) {
				seoFormMsg.textContent = '';
				seoFormMsg.className = 'text-sm min-h-[1.25rem]';
			}
			syncSeoCounters();
			dialogSeo.showModal();
		}

		function onSeoClick(ev: Event) {
			const btn = ev.currentTarget;
			if (!(btn instanceof HTMLButtonElement)) return;
			const id = btn.getAttribute('data-id');
			if (!id) return;
			const cat = categories.find((c) => c.id === id);
			if (!cat) return;
			openSeoDialog(cat);
		}

		seoMetaTitle?.addEventListener('input', syncSeoCounters);
		seoMetaDesc?.addEventListener('input', syncSeoCounters);

		seoBtnCancel?.addEventListener('click', () => {
			if (dialogSeo instanceof HTMLDialogElement) dialogSeo.close();
		});

		formSeo?.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!(seoEditId instanceof HTMLInputElement)) return;
			const id = seoEditId.value.trim();
			if (!id) return;
			const metaTitle = seoMetaTitle instanceof HTMLInputElement ? seoMetaTitle.value : '';
			const metaDescription = seoMetaDesc instanceof HTMLTextAreaElement ? seoMetaDesc.value : '';
			const ogImage = seoOgImage instanceof HTMLInputElement ? seoOgImage.value : '';
			const noindex = seoNoindex instanceof HTMLInputElement ? seoNoindex.checked : false;
			if (seoFormMsg) {
				seoFormMsg.textContent = 'A gravar…';
				seoFormMsg.className = 'text-sm min-h-[1.25rem] text-neutral-600';
			}
			try {
				const { data, error } = await actions.taxonomy.updateCategorySeo({
					id,
					metaTitle,
					metaDescription,
					noindex,
					ogImage,
				});
				if (error) {
					if (seoFormMsg) {
						seoFormMsg.textContent = error.message;
						seoFormMsg.className = 'text-sm min-h-[1.25rem] text-[#b32d2e]';
					}
					return;
				}
				if (data?.categories) {
					categories = data.categories as CategoryRow[];
					renderTable();
				}
				if (dialogSeo instanceof HTMLDialogElement) dialogSeo.close();
				setMsg('SEO da categoria atualizado.');
			} catch (err) {
				if (seoFormMsg) {
					seoFormMsg.textContent = err instanceof Error ? err.message : 'Erro ao gravar.';
					seoFormMsg.className = 'text-sm min-h-[1.25rem] text-[#b32d2e]';
				}
			}
		});

		function setMsg(text: string, isError = false) {
			if (!(msgEl instanceof HTMLElement)) return;
			msgEl.textContent = text;
			msgEl.className =
				'text-sm min-h-[1.25rem] ' + (isError ? 'text-[#b32d2e]' : 'text-neutral-600');
		}

		function updateTabStyles() {
			const activeTab =
				'taxonomy-tab rounded-t-md border border-b-0 border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-[inset_0_-1px_0_0_white] relative z-[1]';
			const idleTab =
				'taxonomy-tab relative z-[1] rounded-t-md border border-transparent border-b-neutral-300 bg-[#e8e8e8] px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900';

			if (tabCat instanceof HTMLButtonElement) {
				tabCat.className = mode === 'categories' ? activeTab : idleTab;
				tabCat.setAttribute('aria-selected', mode === 'categories' ? 'true' : 'false');
			}
			if (tabTags instanceof HTMLButtonElement) {
				tabTags.className = mode === 'tags' ? activeTab : idleTab;
				tabTags.setAttribute('aria-selected', mode === 'tags' ? 'true' : 'false');
			}
			if (formLabel) formLabel.textContent = mode === 'categories' ? 'categoria' : 'tag';
			if (submitLabel) submitLabel.textContent = mode === 'categories' ? 'categoria' : 'tag';
			if (tableLabel) tableLabel.textContent = mode === 'categories' ? 'categorias' : 'tags';
			updateResyncVisibility();
			const tbl = document.querySelector('#taxonomy-main-table');
			if (tbl) tbl.classList.toggle('taxonomy-mode-tags', mode === 'tags');
		}

		function switchMode(next: 'categories' | 'tags') {
			mode = next;
			slugLocked = false;
			updateTabStyles();
			if (form instanceof HTMLFormElement) form.reset();
			setMsg('');
			renderTable();
			if (mode === 'categories' && nameInput instanceof HTMLInputElement && slugInput instanceof HTMLInputElement) {
				syncSlugFromName();
			}
		}

		tabCat?.addEventListener('click', () => switchMode('categories'));
		tabTags?.addEventListener('click', () => switchMode('tags'));

		nameInput?.addEventListener('input', () => {
			syncSlugFromName();
		});

		slugInput?.addEventListener('input', () => {
			if (mode === 'categories') slugLocked = true;
			updateResyncVisibility();
		});

		btnResync?.addEventListener('click', () => {
			slugLocked = false;
			syncSlugFromName();
			setMsg('Slug reposto a partir do nome.');
		});

		form?.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!(nameInput instanceof HTMLInputElement) || !(slugInput instanceof HTMLInputElement)) return;
			const name = nameInput.value.trim();
			const slug = slugInput.value.trim().toLowerCase();
			if (!name || !slug) {
				setMsg('Preenche o nome e o slug.', true);
				return;
			}
			setMsg('A gravar…');
			try {
				if (mode === 'categories') {
					const { data, error } = await actions.taxonomy.addCategory({ name, slug });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.categories) {
						setRows(data.categories);
						renderTable();
					}
					if (data && 'added' in data && data.added === false) {
						setMsg('Já existe uma categoria com este slug.');
					} else {
						setMsg('Categoria adicionada.');
						form.reset();
						slugLocked = false;
						syncSlugFromName();
					}
				} else {
					const { data, error } = await actions.taxonomy.addTag({ name, slug });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.tags) {
						setRows(data.tags);
						renderTable();
					}
					if (data && 'added' in data && data.added === false) {
						setMsg('Já existe uma tag com este slug.');
					} else {
						setMsg('Tag adicionada.');
						form.reset();
						slugLocked = false;
					}
				}
			} catch (err) {
				setMsg(err instanceof Error ? err.message : 'Erro ao gravar.', true);
			}
		});

		async function onDeleteClick(ev: Event) {
			const btn = ev.currentTarget;
			if (!(btn instanceof HTMLButtonElement)) return;
			const id = btn.getAttribute('data-id');
			if (!id || !confirm('Eliminar este item permanentemente?')) return;
			setMsg('');
			try {
				if (mode === 'categories') {
					const { data, error } = await actions.taxonomy.deleteCategory({ id });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.categories) {
						setRows(data.categories);
						renderTable();
					}
					setMsg(data?.removed ? 'Categoria removida.' : 'Item não encontrado.');
				} else {
					const { data, error } = await actions.taxonomy.deleteTag({ id });
					if (error) {
						setMsg(error.message, true);
						return;
					}
					if (data?.tags) {
						setRows(data.tags);
						renderTable();
					}
					setMsg(data?.removed ? 'Tag removida.' : 'Item não encontrado.');
				}
			} catch (err) {
				setMsg(err instanceof Error ? err.message : 'Erro ao excluir.', true);
			}
		}

		updateTabStyles();
		renderTable();
		if (mode === 'categories') syncSlugFromName();
	})();<\/script> `])), maybeRenderHead(), " ", defineScriptVars({
    initialCategories,
    initialTags
  })) })}`;
}, "C:/blogonauta/src/pages/admin/taxonomies.astro", void 0);

const $$file = "C:/blogonauta/src/pages/admin/taxonomies.astro";
const $$url = "/admin/taxonomies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Taxonomies,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
