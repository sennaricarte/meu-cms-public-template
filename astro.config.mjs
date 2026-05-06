// @ts-check

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import mdx        from '@astrojs/mdx';
import sitemap    from '@astrojs/sitemap';
import vercel     from '@astrojs/vercel';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Mesmo `siteUrl` que `src/data/config.json` — primeiro commit já nasce com base para SEO/sitemap. */
function readSiteUrlFromConfig() {
	try {
		const raw = readFileSync(join(__dirname, 'src', 'data', 'config.json'), 'utf8');
		const j = JSON.parse(raw);
		const u = typeof j.siteUrl === 'string' ? j.siteUrl.trim().replace(/\/+$/, '') : '';
		if (u.startsWith('http://') || u.startsWith('https://')) return u;
	} catch {
		/* ignora */
	}
	return 'https://example.com';
}

// ─── URL raiz do site ─────────────────────────────────────────────────────────
// Alinhada ao `config.json`; personalize no cliente após o provisionamento.
const SITE = readSiteUrlFromConfig();

// ─── Configuração de prioridade e changefreq por tipo de página ───────────────
// Referência: https://www.sitemaps.org/protocol.html
//
//  priority   → 0.0–1.0. Relativo entre as páginas do seu próprio site.
//               Não afeta o ranqueamento entre domínios diferentes.
//  changefreq → dica de frequência de atualização para os crawlers.
//               O Google usa como "hint", não como regra obrigatória.

/** @param {string} url */
function getSitemapEntry(url) {
	const path = url.replace(SITE, '');

	// Página inicial — máxima prioridade, atualiza com frequência
	if (path === '/' || path === '') {
		return { changefreq: /** @type {const} */ ('daily'), priority: 1.0 };
	}

	// Listagem do blog — alta prioridade, muda a cada novo post
	if (path === '/blog' || path === '/blog/') {
		return { changefreq: /** @type {const} */ ('daily'), priority: 0.9 };
	}

	// Posts individuais do blog — prioridade alta, raramente editados
	if (/^\/blog\/[^/]+\/?$/.test(path)) {
		return { changefreq: /** @type {const} */ ('weekly'), priority: 0.8 };
	}

	// Páginas estáticas (about, etc.) — atualização esporádica
	return { changefreq: /** @type {const} */ ('monthly'), priority: 0.5 };
}

export default defineConfig({
	// ── Modo de renderização ──────────────────────────────────────────────────
	// 'server' → todas as rotas são SSR por padrão.
	// Páginas de conteúdo estático (blog, home, about) usam
	// `export const prerender = true` para serem geradas no build,
	// mantendo performance máxima e compatibilidade com o sitemap.
	// Rotas de login, upload e APIs ficam como SSR puro (sem prerender).
	output: 'server',

	// ── Adaptador Vercel ──────────────────────────────────────────────────────
	// Habilita Vercel Edge Functions para as rotas SSR e Image Optimization
	// para o componente <Image /> do astro:assets.
	adapter: vercel({
		// imageService: true ativa o serviço de imagem da Vercel (substitui sharp).
		// Útil em produção para evitar o cold start do sharp no serverless.
		imageService: true,

		// isr: habilita Incremental Static Regeneration nas rotas SSR.
		// As rotas SSR são cacheadas na edge e revalidadas conforme necessário.
		isr: {
			// Tempo de revalidação em segundos (1 hora).
			// Aplica-se apenas a rotas SSR sem prerender = true.
			expiration: 60 * 60,
			// CRÍTICO: sem exclude, o adaptador envia `/_actions` e `/admin/*` para `/_isr`.
			// Isso cacheia HTML/respostas e quebra gravações fiáveis em JSON no painel admin.
			exclude: [/^\/admin/, /^\/_actions/, /^\/api\//],
		},
	}),

	site: SITE,

	integrations: [
		mdx(),

		sitemap({
			// ── 1. Filtro de URLs ─────────────────────────────────────────────
			// Remove páginas que não devem ser indexadas:
			//  • Feed RSS (/rss.xml) — não é uma página HTML
			//  • Páginas de tag (/blog/tags/*) — geradas dinamicamente, sem conteúdo único
			//  • Qualquer caminho com "_" inicial (internos do Astro)
			filter: (page) =>
				!page.includes('/rss.xml') &&
				!page.includes('/blog/tags/') &&
				!page.includes('/_'),

			// ── 2. Serialização por tipo de página ────────────────────────────
			// Define changefreq, priority e lastmod para cada URL.
			// O Google usa esses valores como hints para o crawler.
			serialize: (item) => {
				const { changefreq, priority } = getSitemapEntry(item.url);
				return {
					...item,
					changefreq,
					priority,
					// lastmod com a data do último build.
					// Para posts, o ideal é usar o pubDate/updatedDate do frontmatter
					// (ver nota abaixo sobre como evoluir isso).
					lastmod: new Date(),
				};
			},

			// ── 3. Limite de entradas por arquivo de sitemap ──────────────────
			// Padrão: 45.000. Para blogs pequenos, 1.000 é mais que suficiente.
			// O sitemap-index.xml fragmenta automaticamente se ultrapassar o limite.
			entryLimit: 1000,
		}),
	],

	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
