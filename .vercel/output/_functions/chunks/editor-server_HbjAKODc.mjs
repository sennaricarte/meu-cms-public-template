import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'node:path';

const FM_DELIM = ["-", "-", "-"].join("");
const BLOG_CONTENT_DIR = join(process.cwd(), "src", "content", "blog");
const PAGES_CONTENT_DIR = join(process.cwd(), "src", "content", "pages");
const SAFE_PAGES_REL_PATH = /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:md|mdx)$/;
function assertSafePagesRelativePath(rel) {
  if (!SAFE_PAGES_REL_PATH.test(rel)) {
    throw new Error("Caminho de ficheiro inválido.");
  }
  const absTarget = resolve(PAGES_CONTENT_DIR, ...rel.split("/"));
  const root = resolve(PAGES_CONTENT_DIR);
  const diff = relative(root, absTarget);
  if (!diff || diff.startsWith("..") || diff.includes("..")) {
    throw new Error("Caminho fora da pasta pages.");
  }
}
function formatStaticPageMarkdown(input) {
  const lines = [FM_DELIM];
  lines.push("title: " + escapeYamlSingle(input.title));
  lines.push("description: " + escapeYamlSingle(input.description));
  if (input.seoTitle?.trim()) {
    lines.push("seoTitle: " + escapeYamlSingle(input.seoTitle.trim()));
  }
  if (input.heroImage?.trim()) {
    lines.push("heroImage: '" + input.heroImage.trim().replace(/'/g, "''") + "'");
  }
  if (input.canonical?.trim()) {
    lines.push("canonical: " + escapeYamlSingle(input.canonical.trim()));
  }
  lines.push("draft: " + (input.draft ? "true" : "false"));
  lines.push("updatedDate: '" + input.updatedDate + "'");
  lines.push(FM_DELIM);
  const body = input.body;
  return lines.join("\n") + "\n" + (body.endsWith("\n") ? body : body + "\n");
}
async function writePageMarkdownFile(relativePath, content) {
  assertSafePagesRelativePath(relativePath);
  const absTarget = resolve(PAGES_CONTENT_DIR, ...relativePath.split("/"));
  await mkdir(dirname(absTarget), { recursive: true });
  await writeFile(absTarget, content, "utf-8");
}
function resolvePagesAbsolutePath(relativePath) {
  assertSafePagesRelativePath(relativePath);
  return resolve(PAGES_CONTENT_DIR, ...relativePath.split("/"));
}
function escapeYamlSingle(s) {
  return "'" + s.replace(/'/g, "''") + "'";
}
function formatBlogPostMarkdown(input) {
  const meta = input;
  const lines = [FM_DELIM];
  lines.push("title: " + escapeYamlSingle(meta.title));
  if (meta.seoTitle?.trim()) {
    lines.push("seoTitle: " + escapeYamlSingle(meta.seoTitle.trim()));
  }
  if (meta.slug?.trim()) {
    lines.push("slug: " + escapeYamlSingle(meta.slug.trim()));
  }
  lines.push("description: " + escapeYamlSingle(meta.description));
  lines.push("pubDate: '" + meta.pubDate + "'");
  if (meta.updatedDate?.trim()) {
    lines.push("updatedDate: '" + meta.updatedDate.trim() + "'");
  }
  if (meta.canonical?.trim()) {
    lines.push("canonical: " + escapeYamlSingle(meta.canonical.trim()));
  }
  if (meta.heroImage?.trim()) {
    lines.push("heroImage: '" + meta.heroImage.trim().replace(/'/g, "''") + "'");
  }
  if (meta.category?.trim()) {
    lines.push("category: " + escapeYamlSingle(meta.category.trim()));
  }
  const tagsJson = meta.tags.length ? "[" + meta.tags.map((t) => escapeYamlSingle(t)).join(", ") + "]" : "[]";
  lines.push("tags: " + tagsJson);
  if (meta.author?.trim()) {
    lines.push("author: " + escapeYamlSingle(meta.author.trim()));
  }
  lines.push("draft: " + (meta.draft ? "true" : "false"));
  lines.push("affiliateLinks: " + (meta.affiliateLinks ? "true" : "false"));
  lines.push(FM_DELIM);
  const fmBlock = lines.join("\n") + "\n";
  const body = meta.body;
  return fmBlock + (body.endsWith("\n") ? body : body + "\n");
}
async function writeBlogMarkdownFile(filename, content) {
  await writeFile(join(BLOG_CONTENT_DIR, filename), content, "utf-8");
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	BLOG_CONTENT_DIR,
	PAGES_CONTENT_DIR,
	SAFE_PAGES_REL_PATH,
	assertSafePagesRelativePath,
	formatBlogPostMarkdown,
	formatStaticPageMarkdown,
	resolvePagesAbsolutePath,
	writeBlogMarkdownFile,
	writePageMarkdownFile
}, Symbol.toStringTag, { value: 'Module' }));

export { BLOG_CONTENT_DIR as B, PAGES_CONTENT_DIR as P, SAFE_PAGES_REL_PATH as S, _page as _, formatStaticPageMarkdown as a, writePageMarkdownFile as b, assertSafePagesRelativePath as c, formatBlogPostMarkdown as f, resolvePagesAbsolutePath as r, writeBlogMarkdownFile as w };
