import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { B as BLOG_CONTENT_DIR } from './editor-server_HbjAKODc.mjs';

const SAFE_BLOG_FILENAME = /^[\w-]+\.mdx?$/;
function splitRawMarkdown(raw) {
  const t = raw.replace(/^\uFEFF/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(t);
  if (!m) return { fm: "", body: t.trimEnd() };
  return { fm: m[1].trimEnd(), body: m[2].replace(/^\r?\n/, "") };
}
function unquoteYamlScalar(val) {
  let s = val.trim();
  if (!s.length) return "";
  if (s.startsWith("'") && s.endsWith("'") || s.startsWith('"') && s.endsWith('"')) {
    const inner = s.slice(1, -1);
    return inner.replace(/''/g, "'");
  }
  return s;
}
function parseTagsSegment(seg) {
  const t = seg.trim();
  const bracket = /^\[(.*)\]$/.exec(t);
  if (!bracket) return [];
  return bracket[1].split(",").map((x) => x.trim().replace(/^['"]|['"]$/g, "").toLowerCase()).filter(Boolean).slice(0, 10);
}
function parsePostFrontmatter(fm) {
  const out = {
    title: "",
    seoTitle: "",
    slug: "",
    description: "",
    pubDate: "",
    category: "",
    tags: [],
    author: "",
    heroImage: "",
    draft: false,
    affiliateLinks: false
  };
  if (!fm.trim()) return out;
  const lines = fm.split(/\r?\n/);
  let pendingTags = "";
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (pendingTags) {
      pendingTags += " " + trimmed;
      if (trimmed.includes("]")) {
        out.tags = parseTagsSegment(pendingTags.replace(/^tags:\s*/i, ""));
        pendingTags = "";
      }
      continue;
    }
    const lc = trimmed.toLowerCase();
    if (lc.startsWith("tags:")) {
      const rest = trimmed.slice(trimmed.indexOf(":") + 1).trim();
      if (rest.includes("]")) {
        out.tags = parseTagsSegment(rest);
      } else {
        pendingTags = trimmed;
      }
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim().toLowerCase();
    let val = trimmed.slice(colon + 1).trim();
    switch (key) {
      case "title":
        out.title = unquoteYamlScalar(val);
        break;
      case "seotitle":
        out.seoTitle = unquoteYamlScalar(val);
        break;
      case "slug":
        out.slug = unquoteYamlScalar(val);
        break;
      case "description":
        out.description = unquoteYamlScalar(val);
        break;
      case "category":
        out.category = unquoteYamlScalar(val);
        break;
      case "pubdate":
        out.pubDate = unquoteYamlScalar(val).slice(0, 10);
        break;
      case "updateddate":
        out.updatedDate = unquoteYamlScalar(val).slice(0, 10);
        break;
      case "heroimage":
        out.heroImage = unquoteYamlScalar(val);
        break;
      case "tags":
        out.tags = parseTagsSegment(val);
        break;
      case "author":
        out.author = unquoteYamlScalar(val);
        break;
      case "draft":
        out.draft = val === "true";
        break;
      case "affiliatelinks":
        out.affiliateLinks = val === "true";
        break;
      case "canonical":
        out.canonical = unquoteYamlScalar(val);
        break;
    }
  }
  return out;
}
async function loadPostForEditor(filename) {
  if (!SAFE_BLOG_FILENAME.test(filename)) return null;
  const raw = await readFile(join(BLOG_CONTENT_DIR, filename), "utf-8");
  const { fm, body } = splitRawMarkdown(raw);
  return { filename, meta: parsePostFrontmatter(fm), body };
}

export { loadPostForEditor as l, parsePostFrontmatter as p, splitRawMarkdown as s };
