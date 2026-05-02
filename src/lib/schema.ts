/**
 * src/lib/schema.ts
 *
 * Builders tipados para Schema.org JSON-LD.
 * Cada função retorna um nó sem `@context` — o contexto é adicionado
 * pelo componente JsonLd.astro via `@graph`.
 *
 * Tipos suportados:
 *   - WebSite       → página inicial, ativa o Sitelinks Search Box
 *   - WebPage       → página genérica (about, home, etc.)
 *   - BlogPosting   → post de blog (Rich Results: estrelas, data, autor)
 *   - BreadcrumbList→ trilha de navegação (Rich Results de breadcrumb)
 *   - Person        → entidade do autor
 */

export type SchemaNode = Record<string, unknown>;

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface WebSiteInput {
	/** URL raiz do site (ex: https://example.com). */
	siteUrl: string;
	/** Nome do site exibido no Google. */
	siteName: string;
	/** Descrição breve do site. */
	description: string;
}

export interface WebPageInput {
	/** URL canônica da página. */
	url: string;
	/** Título da página. */
	title: string;
	/** Descrição da página. */
	description: string;
}

export interface BlogPostingInput {
	/** URL canônica do post. */
	url: string;
	/** Headline do post (campo `title`). */
	title: string;
	/** Meta description do post. */
	description: string;
	/** URL absoluta da imagem de capa. */
	imageUrl: string;
	/** Data de publicação. */
	datePublished: Date;
	/** Data da última edição (opcional). */
	dateModified?: Date;
	/** Nome do autor (opcional). */
	authorName?: string;
	/** Palavras-chave separadas por vírgula (opcional). */
	keywords?: string;
	/** Nome do publicador (site/organização). */
	publisherName: string;
	/** URL do logo do publicador (opcional, 60×600 px recomendado pelo Google). */
	publisherLogoUrl?: string;
}

export interface BreadcrumbInput {
	/** Lista ordenada de itens da trilha de navegação. */
	items: { name: string; url: string }[];
}

export interface PersonInput {
	/** Nome completo da pessoa. */
	name: string;
	/** URL do perfil da pessoa (opcional). */
	url?: string;
	/** Descrição ou bio (opcional). */
	description?: string;
	/** URL da foto (opcional). */
	image?: string;
}

// ─── Builders ──────────────────────────────────────────────────────────────

/**
 * WebSite schema.
 * Deve ser incluído em TODAS as páginas.
 * Ativa o Sitelinks Search Box no Google quando o site tiver volume de busca.
 */
export function buildWebSiteSchema(opts: WebSiteInput): SchemaNode {
	return {
		'@type':   'WebSite',
		'@id':     `${opts.siteUrl}/#website`,
		name:       opts.siteName,
		url:        opts.siteUrl,
		description: opts.description,
		inLanguage: 'pt-BR',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type':       'EntryPoint',
				urlTemplate:   `${opts.siteUrl}/blog?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	};
}

/**
 * WebPage schema.
 * Representa uma página genérica (home, about, lista de posts, etc.).
 */
export function buildWebPageSchema(opts: WebPageInput): SchemaNode {
	const origin = new URL(opts.url).origin;
	return {
		'@type':       'WebPage',
		'@id':         `${opts.url}/#webpage`,
		url:            opts.url,
		name:           opts.title,
		description:    opts.description,
		isPartOf:      { '@id': `${origin}/#website` },
		inLanguage:    'pt-BR',
	};
}

/**
 * BlogPosting schema.
 * Habilita Rich Results com data, autor e breadcrumb no Google Search.
 * Deve ser incluído apenas em páginas de post de blog.
 */
export function buildBlogPostingSchema(opts: BlogPostingInput): SchemaNode {
	const origin = new URL(opts.url).origin;

	const node: SchemaNode = {
		'@type':    'BlogPosting',
		'@id':      `${opts.url}/#article`,
		headline:    opts.title,
		description: opts.description,
		url:         opts.url,
		image: {
			'@type': 'ImageObject',
			url:      opts.imageUrl,
		},
		datePublished: opts.datePublished.toISOString(),
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id':   `${opts.url}/#webpage`,
		},
		isPartOf:  { '@id': `${origin}/#website` },
		publisher: {
			'@type': 'Organization',
			name:     opts.publisherName,
			...(opts.publisherLogoUrl
				? { logo: { '@type': 'ImageObject', url: opts.publisherLogoUrl } }
				: {}),
		},
		inLanguage: 'pt-BR',
	};

	if (opts.dateModified) node.dateModified = opts.dateModified.toISOString();
	if (opts.authorName)   node.author = { '@type': 'Person', name: opts.authorName };
	if (opts.keywords)     node.keywords = opts.keywords;

	return node;
}

/**
 * BreadcrumbList schema.
 * Exibe a trilha de navegação diretamente nas SERPs do Google (Rich Result).
 * Exemplo: Home › Blog › Título do Post
 */
export function buildBreadcrumbSchema(opts: BreadcrumbInput): SchemaNode {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: opts.items.map((item, index) => ({
			'@type':    'ListItem',
			position:   index + 1,
			name:       item.name,
			item:       item.url,
		})),
	};
}

/**
 * Person schema.
 * Representa o autor do blog como entidade semântica.
 */
export function buildPersonSchema(opts: PersonInput): SchemaNode {
	const node: SchemaNode = {
		'@type': 'Person',
		name:     opts.name,
	};
	if (opts.url)         node.url         = opts.url;
	if (opts.description) node.description = opts.description;
	if (opts.image)       node.image       = opts.image;
	return node;
}
