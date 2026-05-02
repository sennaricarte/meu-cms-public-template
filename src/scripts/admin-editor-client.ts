import { actions } from 'astro:actions';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import '../styles/admin-editor-page.css';

interface ParsedMeta {
	title: string;
	description: string;
	pubDate: string;
	tags: string[];
	author: string;
	heroImage: string;
	draft: boolean;
	updatedDate?: string;
	canonical?: string;
}

function splitRawMarkdown(raw: string): { fm: string; body: string } {
	const t = raw.replace(/^\uFEFF/, '');
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(t);
	if (!m) return { fm: '', body: t.trimEnd() };
	return { fm: m[1].trimEnd(), body: m[2].replace(/^\r?\n/, '') };
}

function unquoteYamlScalar(val: string): string {
	let s = val.trim();
	if (!s.length) return '';
	if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
		const inner = s.slice(1, -1);
		return inner.replace(/''/g, "'");
	}
	return s;
}

function parseTagsSegment(seg: string): string[] {
	const t = seg.trim();
	const bracket = /^\[(.*)\]$/.exec(t);
	if (!bracket) return [];
	return bracket[1]
		.split(',')
		.map((x) => x.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
		.filter(Boolean)
		.slice(0, 10);
}

function parseFrontmatter(fm: string): ParsedMeta {
	const out: ParsedMeta = {
		title: '',
		description: '',
		pubDate: '',
		tags: [],
		author: '',
		heroImage: '',
		draft: false,
	};
	if (!fm.trim()) return out;

	const lines = fm.split(/\r?\n/);
	let pendingTags = '';

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		const trimmed = line.trim();
		if (!trimmed) continue;

		if (pendingTags) {
			pendingTags += ' ' + trimmed;
			if (trimmed.includes(']')) {
				out.tags = parseTagsSegment(pendingTags.replace(/^tags:\s*/i, ''));
				pendingTags = '';
			}
			continue;
		}

		const lc = trimmed.toLowerCase();
		if (lc.startsWith('tags:')) {
			const rest = trimmed.slice(trimmed.indexOf(':') + 1).trim();
			if (rest.includes(']')) {
				out.tags = parseTagsSegment(rest);
			} else {
				pendingTags = trimmed;
			}
			continue;
		}

		const colon = trimmed.indexOf(':');
		if (colon === -1) continue;
		const key = trimmed.slice(0, colon).trim().toLowerCase();
		let val = trimmed.slice(colon + 1).trim();

		switch (key) {
			case 'title':
				out.title = unquoteYamlScalar(val);
				break;
			case 'description':
				out.description = unquoteYamlScalar(val);
				break;
			case 'pubdate':
				out.pubDate = unquoteYamlScalar(val).slice(0, 10);
				break;
			case 'updateddate':
				out.updatedDate = unquoteYamlScalar(val).slice(0, 10);
				break;
			case 'heroimage':
				out.heroImage = unquoteYamlScalar(val);
				break;
			case 'tags':
				out.tags = parseTagsSegment(val);
				break;
			case 'author':
				out.author = unquoteYamlScalar(val);
				break;
			case 'draft':
				out.draft = val === 'true';
				break;
			case 'canonical':
				out.canonical = unquoteYamlScalar(val);
				break;
			default:
				break;
		}
	}

	return out;
}

function normalizeTagsInput(raw: string): string[] {
	return raw
		.split(',')
		.map((t) =>
			t
				.trim()
				.toLowerCase()
				.slice(0, 30),
		)
		.filter(Boolean)
		.slice(0, 10);
}

function readFormMeta(): ParsedMeta {
	const tagsStr = (document.getElementById('meta-tags') as HTMLInputElement).value;
	const pd = (document.getElementById('meta-pubdate') as HTMLInputElement).value;
	return {
		title: (document.getElementById('meta-title') as HTMLInputElement).value.trim(),
		description: (document.getElementById('meta-description') as HTMLTextAreaElement).value.trim(),
		pubDate: pd,
		tags: normalizeTagsInput(tagsStr),
		author: (document.getElementById('meta-author') as HTMLInputElement).value.trim(),
		heroImage: (document.getElementById('hero-image-url') as HTMLInputElement).value.trim(),
		draft: (document.getElementById('meta-draft') as HTMLInputElement).checked,
		updatedDate: undefined,
		canonical: undefined,
	};
}

function applyMetaToForm(meta: ParsedMeta) {
	(document.getElementById('meta-title') as HTMLInputElement).value = meta.title;
	(document.getElementById('meta-description') as HTMLTextAreaElement).value = meta.description;
	(document.getElementById('meta-tags') as HTMLInputElement).value = meta.tags.join(', ');
	(document.getElementById('meta-pubdate') as HTMLInputElement).value = meta.pubDate;
	(document.getElementById('meta-author') as HTMLInputElement).value = meta.author;
	(document.getElementById('hero-image-url') as HTMLInputElement).value = meta.heroImage;
	(document.getElementById('meta-draft') as HTMLInputElement).checked = meta.draft;
	updateSeoCounters();
}

function updateSeoCounters() {
	const title = (document.getElementById('meta-title') as HTMLInputElement).value.length;
	const desc = (document.getElementById('meta-description') as HTMLTextAreaElement).value.length;
	const tc = document.getElementById('meta-title-count');
	const dc = document.getElementById('meta-description-count');
	if (tc) tc.textContent = title + '/60';
	if (dc) dc.textContent = desc + '/160';
}

function validateMeta(): string | null {
	const m = readFormMeta();
	if (!m.title.length) return 'Preencha o título.';
	if (m.title.length > 60) return 'O título não pode passar de 60 caracteres.';
	if (m.description.length < 50) return 'A descrição precisa ter pelo menos 50 caracteres.';
	if (m.description.length > 160) return 'A descrição não pode passar de 160 caracteres.';
	if (!m.pubDate) return 'Defina a data de publicação.';
	if (m.tags.length > 10) return 'No máximo 10 tags.';
	for (const t of m.tags) {
		if (t.length > 30) return 'Cada tag pode ter no máximo 30 caracteres.';
	}
	if (m.author.length > 80) return 'O nome do autor não pode passar de 80 caracteres.';
	return null;
}

const mde = new EasyMDE({
	element:          document.getElementById('md-editor'),
	autofocus:        false,
	spellChecker:     false,
	autosave:         { enabled: false },
	placeholder:      'Corpo do artigo em Markdown (o frontmatter é editado no painel acima)...',
	toolbar: [
		'bold', 'italic', 'heading', '|',
		'quote', 'code', 'unordered-list', 'ordered-list', '|',
		'link', 'image', 'table', '|',
		'preview', 'side-by-side', 'fullscreen', '|',
		'guide',
	],
	previewClass:      ['prose', 'prose-lg'],
	status:            false,
});

let activeFile: string | null = null;
let isDirty = false;
let loadedMeta: ParsedMeta | null = null;

const filenameInput   = document.getElementById('filename-input') as HTMLInputElement;
const btnSave         = document.getElementById('btn-save') as HTMLButtonElement;
const btnNew          = document.getElementById('btn-new') as HTMLButtonElement;
const btnDelete       = document.getElementById('btn-delete') as HTMLButtonElement;
const postList        = document.getElementById('post-list') as HTMLUListElement;
const toast           = document.getElementById('toast') as HTMLDivElement;
const statWords       = document.getElementById('stat-words') as HTMLSpanElement;
const statChars       = document.getElementById('stat-chars') as HTMLSpanElement;
const statSaved       = document.getElementById('stat-saved') as HTMLSpanElement;
const heroImageFile   = document.getElementById('hero-image-file') as HTMLInputElement;
const heroImageUrl    = document.getElementById('hero-image-url') as HTMLInputElement;

let toastTimer: ReturnType<typeof setTimeout>;
function showToast(msg: string, type: 'success' | 'error') {
	clearTimeout(toastTimer);
	toast.textContent = msg;
	toast.className = 'show ' + type;
	toastTimer = setTimeout(() => { toast.className = ''; }, 3500);
}

function updateStats() {
	const text = mde.value();
	const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
	const chars = text.length;
	statWords.textContent = words + ' palavra' + (words !== 1 ? 's' : '');
	statChars.textContent = chars + ' chars';
}

function markDirty() {
	isDirty = true;
}

mde.codemirror.on('change', () => {
	markDirty();
	updateStats();
});

['meta-title', 'meta-description', 'meta-tags', 'meta-pubdate', 'meta-author', 'meta-draft'].forEach((id) => {
	const el = document.getElementById(id);
	if (!el) return;
	el.addEventListener('input', () => {
		markDirty();
		if (id === 'meta-title' || id === 'meta-description') updateSeoCounters();
	});
	el.addEventListener('change', markDirty);
});

async function loadPost(filename: string) {
	if (isDirty && !confirm('Há alterações não salvas. Descartar?')) return;

	const { data, error } = await actions.getPost({ filename });
	if (error) { showToast('Erro ao carregar: ' + error.message, 'error'); return; }

	const { fm, body } = splitRawMarkdown(data.content);
	const meta = parseFrontmatter(fm);
	loadedMeta = meta;

	applyMetaToForm({
		...meta,
		updatedDate: meta.updatedDate,
		canonical: meta.canonical,
	});

	mde.value(body);
	filenameInput.value = filename;
	activeFile = filename;
	isDirty = false;
	btnDelete.disabled = false;
	statSaved.textContent = 'Carregado';
	updateStats();

	postList.querySelectorAll('li').forEach((li) => {
		li.classList.toggle('active', li.dataset.filename === filename);
	});
}

async function savePost() {
	const filename = filenameInput.value.trim();
	if (!filename) {
		showToast('Defina um nome de arquivo antes de salvar.', 'error');
		filenameInput.focus();
		return;
	}
	if (!/^[\w-]+\.mdx?$/.test(filename)) {
		showToast('Nome inválido. Use: letras, números, hífens e extensão .md ou .mdx', 'error');
		return;
	}

	const err = validateMeta();
	if (err) {
		showToast(err, 'error');
		return;
	}

	const today = new Date().toISOString().split('T')[0];
	const formMeta = readFormMeta();
	const merged: ParsedMeta = {
		...formMeta,
		updatedDate: today,
		canonical: loadedMeta?.canonical,
	};

	const body = mde.value();

	btnSave.disabled = true;
	btnSave.textContent = 'Salvando…';

	const { data, error } = await actions.savePost({
		filename,
		title: formMeta.title,
		description: formMeta.description,
		pubDate: formMeta.pubDate,
		tags: formMeta.tags,
		author: formMeta.author.trim() || undefined,
		heroImage: formMeta.heroImage.trim() || undefined,
		draft: formMeta.draft,
		body,
		canonical: loadedMeta?.canonical,
	});

	btnSave.disabled = false;
	btnSave.innerHTML =
		'<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"/></svg> Salvar';

	if (error) {
		showToast('Erro: ' + error.message, 'error');
		return;
	}

	isDirty = false;
	activeFile = data.filename;
	loadedMeta = merged;

	statSaved.textContent = 'Salvo às ' + new Date(data.savedAt).toLocaleTimeString('pt-BR');
	showToast('\u2713 "' + filename + '" salvo com sucesso!', 'success');

	if (!postList.querySelector('[data-filename="' + filename + '"]')) {
		const li = document.createElement('li');
		li.dataset.filename = filename;
		const ext = filename.endsWith('.mdx') ? '.mdx' : '.md';
		const base = filename.replace(/\.mdx?$/, '');
		li.innerHTML =
			'<button type="button"><svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>' +
			base +
			'<span class="ext">' +
			ext +
			'</span></button>';
		li.querySelector('button')!.addEventListener('click', () => loadPost(filename));
		postList.appendChild(li);
		document.getElementById('post-count')!.textContent = String(postList.children.length);
	}

	postList.querySelectorAll('li').forEach((li) => {
		li.classList.toggle('active', li.dataset.filename === filename);
	});
	btnDelete.disabled = false;
}

function newPost() {
	if (isDirty && !confirm('Há alterações não salvas. Descartar?')) return;
	const today = new Date().toISOString().split('T')[0];
	const slug = 'novo-post-' + today;
	filenameInput.value = slug + '.md';

	loadedMeta = null;

	applyMetaToForm({
		title: 'Título do post',
		description:
			'Uma descrição clara e objetiva do conteúdo deste post com pelo menos cinquenta caracteres.',
		pubDate: today,
		tags: ['tag1', 'tag2'],
		author: 'Blogonauta',
		heroImage: '',
		draft: true,
	});

	(document.getElementById('meta-pubdate') as HTMLInputElement).value = today;

	mde.value(
		'Escreva o corpo do artigo em **Markdown** aqui.\n\nO frontmatter é gerado pelo painel **Metadados** ao salvar.\n',
	);

	activeFile = null;
	isDirty = true;
	btnDelete.disabled = true;
	postList.querySelectorAll('li').forEach((li) => li.classList.remove('active'));
	mde.codemirror.focus();
	updateStats();
}

async function deletePost() {
	if (!activeFile) return;
	if (!confirm('Excluir "' + activeFile + '"? O arquivo será renomeado com prefixo _deleted_.')) return;

	const { error } = await actions.deletePost({ filename: activeFile });
	if (error) { showToast('Erro: ' + error.message, 'error'); return; }

	showToast('"' + activeFile + '" movido para lixeira.', 'success');

	postList.querySelector('[data-filename="' + activeFile + '"]')?.remove();
	document.getElementById('post-count')!.textContent = String(postList.children.length);

	newPost();
}

const btnUpload = document.getElementById('btn-upload') as HTMLButtonElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const btnImgPanel = document.getElementById('btn-img-panel') as HTMLButtonElement;
const btnImgPanelClose = document.getElementById('btn-img-panel-close') as HTMLButtonElement;
const imgPanel = document.getElementById('img-panel') as HTMLElement;
const imgList = document.getElementById('img-list') as HTMLDivElement;
const imgListEmpty = document.getElementById('img-list-empty') as HTMLParagraphElement;
const uploadBar = document.getElementById('upload-bar') as HTMLDivElement;
const uploadBarMsg = document.getElementById('upload-bar-msg') as HTMLSpanElement;
const editorWrap = document.getElementById('editor-wrap') as HTMLDivElement;

function insertImageMarkdown(path: string) {
	const cm = mde.codemirror;
	const cursor = cm.getCursor();
	const altText = path.split('/').pop()?.replace(/\.\w+$/, '') ?? 'imagem';
	cm.replaceRange('![' + altText + '](' + path + ')', cursor);
	cm.focus();
}

function addToPanel(path: string) {
	imgListEmpty.style.display = 'none';
	const item = document.createElement('div');
	item.className = 'img-item';
	item.title = 'Clique para inserir no editor: ' + path;
	item.innerHTML =
		'<img src="' +
		path +
		'" alt="' +
		path +
		'" loading="lazy" /><div class="img-item-path">' +
		path +
		'</div>';
	item.addEventListener('click', () => insertImageMarkdown(path));
	imgList.insertBefore(item, imgList.firstChild);
}

async function postUpload(file: File): Promise<string | null> {
	const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
	if (!allowed.includes(file.type)) {
		showToast('Tipo não permitido: ' + file.type, 'error');
		return null;
	}
	if (file.size > 10 * 1024 * 1024) {
		showToast('Arquivo muito grande. Limite: 10 MB.', 'error');
		return null;
	}

	uploadBarMsg.textContent = 'Enviando "' + file.name + '"…';
	uploadBar.classList.add('show');

	try {
		const fd = new FormData();
		fd.append('image', file);
		const titleHint =
			(document.getElementById('meta-title') as HTMLInputElement).value.trim() ||
			filenameInput.value.replace(/\.mdx?$/i, '').trim() ||
			'upload';
		fd.append('title', titleHint);

		const res = await fetch('/api/upload', { method: 'POST', body: fd });
		const body = (await res.json()) as { url?: string; error?: string };

		if (!res.ok || !body.url) {
			showToast('Erro no upload: ' + (body.error ?? res.statusText), 'error');
			return null;
		}
		return body.url;
	} catch (err) {
		showToast('Falha na requisição: ' + (err instanceof Error ? err.message : String(err)), 'error');
		return null;
	} finally {
		uploadBar.classList.remove('show');
	}
}

async function handleToolbarImageFile(file: File) {
	const path = await postUpload(file);
	if (!path) return;
	insertImageMarkdown(path);
	addToPanel(path);
	imgPanel.classList.add('open');
	showToast('Imagem enviada: ' + path, 'success');
}

heroImageFile.addEventListener('change', async () => {
	const file = heroImageFile.files?.[0];
	if (!file) return;

	uploadBarMsg.textContent = 'Enviando hero…';
	uploadBar.classList.add('show');
	btnSave.disabled = true;

	try {
		const fd = new FormData();
		fd.append('image', file);
		const slug =
			(document.getElementById('meta-title') as HTMLInputElement).value.trim() ||
			filenameInput.value.replace(/\.mdx?$/i, '').trim() ||
			'hero';
		fd.append('title', slug);

		const res = await fetch('/api/upload', { method: 'POST', body: fd });
		const data = (await res.json()) as { url?: string; error?: string };

		if (!res.ok || !data.url) {
			showToast('Erro no upload da hero: ' + (data.error ?? res.statusText), 'error');
			return;
		}

		heroImageUrl.value = data.url;
		markDirty();
		showToast('Imagem de destaque enviada. URL preenchida.', 'success');
	} catch (err) {
		showToast('Falha no upload: ' + (err instanceof Error ? err.message : String(err)), 'error');
	} finally {
		uploadBar.classList.remove('show');
		btnSave.disabled = false;
		heroImageFile.value = '';
	}
});

btnUpload.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
	const file = fileInput.files?.[0];
	if (file) handleToolbarImageFile(file);
	fileInput.value = '';
});

btnImgPanel.addEventListener('click', () => imgPanel.classList.toggle('open'));
btnImgPanelClose.addEventListener('click', () => imgPanel.classList.remove('open'));

let dragCounter = 0;

editorWrap.addEventListener('dragenter', (e) => {
	e.preventDefault();
	dragCounter++;
	if (e.dataTransfer?.types.includes('Files')) {
		editorWrap.classList.add('drag-active');
	}
});

editorWrap.addEventListener('dragleave', () => {
	dragCounter--;
	if (dragCounter <= 0) {
		dragCounter = 0;
		editorWrap.classList.remove('drag-active');
	}
});

editorWrap.addEventListener('dragover', (e) => {
	e.preventDefault();
});

editorWrap.addEventListener('drop', (e) => {
	e.preventDefault();
	dragCounter = 0;
	editorWrap.classList.remove('drag-active');
	const file = e.dataTransfer?.files?.[0];
	if (file && file.type.startsWith('image/')) {
		handleToolbarImageFile(file);
	}
});

document.addEventListener('keydown', (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
		e.preventDefault();
		fileInput.click();
	}
});

btnSave.addEventListener('click', savePost);
btnNew.addEventListener('click', newPost);
btnDelete.addEventListener('click', deletePost);

postList.querySelectorAll<HTMLButtonElement>('li button').forEach((btn) => {
	const li = btn.closest('li') as HTMLLIElement;
	btn.addEventListener('click', () => loadPost(li.dataset.filename!));
});

document.addEventListener('keydown', (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key === 's') {
		e.preventDefault();
		savePost();
	}
	if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'n') {
		e.preventDefault();
		newPost();
	}
});

window.addEventListener('beforeunload', (e) => {
	if (isDirty) { e.preventDefault(); }
});

updateSeoCounters();
updateStats();
