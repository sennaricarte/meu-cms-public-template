import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { c as assertSafePagesRelativePath, P as PAGES_CONTENT_DIR } from './editor-server_HbjAKODc.mjs';
import { s as splitRawMarkdown, p as parsePostFrontmatter } from './blog-md-parse_DGY8WWUk.mjs';

async function loadStaticPageForEditor(relativePath) {
  assertSafePagesRelativePath(relativePath);
  const absPath = join(PAGES_CONTENT_DIR, ...relativePath.split("/"));
  const raw = await readFile(absPath, "utf-8");
  const { fm, body } = splitRawMarkdown(raw);
  const meta = parsePostFrontmatter(fm);
  return {
    relativePath,
    title: meta.title,
    seoTitle: meta.seoTitle ?? "",
    description: meta.description,
    draft: meta.draft,
    heroImage: meta.heroImage ?? "",
    canonical: meta.canonical ?? "",
    body
  };
}

export { loadStaticPageForEditor as l };
