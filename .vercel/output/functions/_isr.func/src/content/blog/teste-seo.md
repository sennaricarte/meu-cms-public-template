---
title: 'SEO Técnico: fundamentos para 2026'
description: 'Domine o SEO técnico com Core Web Vitals, dados estruturados, URLs canônicas e crawlabilidade para ranquear no Google em 2026.'
pubDate: '2026-05-01'
updatedDate: '2026-05-01'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['seo-técnico', 'core-web-vitals', 'schema-markup', 'performance', 'crawlability']
author: 'Blogonauta'
draft: false
---

O SEO técnico é a fundação invisível de qualquer estratégia de busca orgânica. Sem ele, o melhor conteúdo do mundo não chega à primeira página do Google. Neste guia, cobrimos os pilares que todo desenvolvedor precisa dominar em 2026.

## 1. Core Web Vitals — a métrica que o Google mede

O Google usa três sinais de experiência de página como fator de ranqueamento direto:

| Métrica | Significado | Meta |
|---|---|---|
| **LCP** — Largest Contentful Paint | Tempo até o maior elemento visível carregar | ≤ 2,5 s |
| **INP** — Interaction to Next Paint | Latência de resposta a interações do usuário | ≤ 200 ms |
| **CLS** — Cumulative Layout Shift | Estabilidade visual da página | ≤ 0,1 |

> **Dica prática:** use `<Image />` do `astro:assets` com `width` e `height` explícitos para zerar o CLS causado por imagens sem dimensões definidas.

### Como medir

```bash
# PageSpeed Insights via API (CI/CD)
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=SEU_URL&strategy=mobile"
```

Ferramentas recomendadas: [PageSpeed Insights](https://pagespeed.web.dev/), [Chrome UX Report](https://developer.chrome.com/docs/crux/) e Lighthouse no DevTools.

---

## 2. Crawlabilidade e indexação

Os crawlers do Google precisam conseguir **descobrir, rastrear e renderizar** suas páginas. Três armadilhas comuns:

### 2.1 Bloquear recursos no `robots.txt`

```
# Nunca bloqueie CSS ou JS — o Googlebot precisa renderizar sua página
User-agent: *
Disallow: /admin/
```

### 2.2 Conteúdo dependente de JavaScript

O Googlebot renderiza JavaScript, mas com atraso. Sites baseados em **SSR/SSG** (como o Astro por padrão) entregam o HTML completo na primeira requisição, eliminando esse problema.

### 2.3 Sitemap desatualizado

Com `@astrojs/sitemap`, o `sitemap-index.xml` é gerado automaticamente a cada build — sem esforço manual.

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://seublog.com',
  integrations: [sitemap()],
});
```

---

## 3. Dados estruturados (Schema.org / JSON-LD)

Dados estruturados traduzem seu conteúdo para a linguagem que os motores de busca entendem. O resultado são os **Rich Results** — estrelas, datas, breadcrumbs e sitelinks nas SERPs.

### Tipos mais relevantes para blogs

- **`BlogPosting`** — habilita data de publicação e autoria nos resultados
- **`BreadcrumbList`** — exibe a trilha de navegação na SERP
- **`WebSite`** — ativa o Sitelinks Search Box para o seu domínio

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "headline": "SEO Técnico: fundamentos para 2026",
      "datePublished": "2026-05-01T00:00:00.000Z",
      "author": { "@type": "Person", "name": "Blogonauta" }
    }
  ]
}
```

> Este blog já gera esse JSON-LD automaticamente via `src/components/JsonLd.astro` + `src/lib/schema.ts`.

---

## 4. URLs canônicas — evite conteúdo duplicado

O Google pode penalizar sites com o mesmo conteúdo em URLs diferentes. A tag `<link rel="canonical">` resolve isso:

```html
<!-- Diz ao Google qual é a URL "oficial" desta página -->
<link rel="canonical" href="https://seublog.com/blog/seo-tecnico/" />
```

No nosso schema Zod, o campo `canonical` é opcional: quando omitido, o Astro gera a canonical automaticamente a partir de `Astro.site + Astro.url.pathname`. Use o campo manual apenas quando o conteúdo foi **publicado originalmente em outro domínio**.

---

## 5. Meta tags e limites das SERPs

O Google corta títulos e descrições acima de certos limites de pixel. As referências práticas são:

| Tag | Limite recomendado | Por quê |
|---|---|---|
| `<title>` | **≤ 60 caracteres** | ~600 px de largura nas SERPs desktop |
| `<meta name="description">` | **50–160 caracteres** | Faixa ideal de CTR e exibição completa |
| `og:image` | **1200 × 630 px** | Proporção 1,91:1 padrão do Open Graph |

O schema Zod do nosso `content.config.ts` **valida esses limites em tempo de build** — o Astro lança erro antes de publicar um post fora do padrão.

---

## 6. Checklist de SEO técnico antes de publicar

- [ ] `title` com ≤ 60 chars e palavra-chave principal no início
- [ ] `description` entre 50–160 chars, com CTA implícito
- [ ] `heroImage` com `alt` descritivo (não vazio)
- [ ] `tags` representativas (máx. 10, sem keyword stuffing)
- [ ] `pubDate` no formato ISO 8601 (`YYYY-MM-DD`)
- [ ] JSON-LD `BlogPosting` gerado e validado no [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Canonical URL correta (automática ou manual)
- [ ] Core Web Vitals medidos no PageSpeed Insights

---

**Conclusão:** SEO técnico não é opcional — é o alicerce que permite que o seu conteúdo seja encontrado, rastreado e apresentado com destaque nas SERPs. Com o Astro e as configurações que montamos neste projeto, a maior parte dessas práticas já está automatizada.
