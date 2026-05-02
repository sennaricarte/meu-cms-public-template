import { randomUUID } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const CATEGORIES_JSON = join(process.cwd(), "src", "data", "categories.json");
const TAGS_JSON = join(process.cwd(), "src", "data", "tags.json");
function errnoCode(err) {
  return err && typeof err === "object" && "code" in err ? String(err.code) : void 0;
}
async function readUtf8TaxonomyFile(filePath) {
  try {
    return await readFile(filePath, "utf-8");
  } catch (err) {
    if (errnoCode(err) !== "ENOENT") throw err;
    await mkdir(dirname(filePath), { recursive: true });
    const seed = "[]\n";
    await writeFile(filePath, seed, "utf-8");
    return seed;
  }
}
async function writeJsonFileRobust(filePath, payload) {
  await mkdir(dirname(filePath), { recursive: true });
  try {
    await writeFile(filePath, payload, "utf-8");
  } catch (err) {
    const code = errnoCode(err);
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new Error(
        "Não foi possível gravar no disco (ficheiro só de leitura ou sem permissão). Em deploy na Vercel as gravações locais em JSON não são suportadas — usa `npm run dev` na tua máquina ou um backend/CMS."
      );
    }
    throw err;
  }
}
function slugifyLabel(raw) {
  return raw.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
function parseTaxonomyJson(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out = [];
  for (const x of data) {
    if (typeof x === "string") {
      const name = x.trim();
      if (!name) continue;
      out.push({
        id: "",
        name,
        slug: slugifyLabel(name) || "item"
      });
      continue;
    }
    if (x && typeof x === "object" && "name" in x) {
      const o = x;
      const name = String(o.name ?? "").trim();
      let slug = String(o.slug ?? "").trim();
      if (!name) continue;
      if (!slug) slug = slugifyLabel(name) || "item";
      const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
      out.push({ id, name, slug });
    }
  }
  return out;
}
function parseCategorySeo(raw) {
  if (!raw || typeof raw !== "object") return void 0;
  const o = raw;
  const metaTitle = typeof o.metaTitle === "string" && o.metaTitle.trim() ? o.metaTitle.trim().slice(0, 70) : void 0;
  const metaDescription = typeof o.metaDescription === "string" && o.metaDescription.trim() ? o.metaDescription.trim().slice(0, 160) : void 0;
  const noindex = o.noindex === true;
  const ogImage = typeof o.ogImage === "string" && o.ogImage.trim() ? o.ogImage.trim().slice(0, 500) : void 0;
  if (!metaTitle && !metaDescription && !noindex && !ogImage) return void 0;
  const seo = {};
  if (metaTitle) seo.metaTitle = metaTitle;
  if (metaDescription) seo.metaDescription = metaDescription;
  if (noindex) seo.noindex = true;
  if (ogImage) seo.ogImage = ogImage;
  return seo;
}
function parseCategoriesJson(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out = [];
  for (const x of data) {
    if (typeof x === "string") {
      const name = x.trim();
      if (!name) continue;
      out.push({
        id: "",
        name,
        slug: slugifyLabel(name) || "item"
      });
      continue;
    }
    if (x && typeof x === "object" && "name" in x) {
      const o = x;
      const name = String(o.name ?? "").trim();
      let slug = String(o.slug ?? "").trim();
      if (!name) continue;
      if (!slug) slug = slugifyLabel(name) || "item";
      const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : "";
      const seo = parseCategorySeo(o.seo);
      const row = { id, name, slug };
      if (seo) row.seo = seo;
      out.push(row);
    }
  }
  return out;
}
function sortCategoryItems(items) {
  return [...items].sort(
    (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" })
  );
}
async function writeCategoriesFile(items) {
  const sorted = sortCategoryItems(items);
  await writeJsonFileRobust(CATEGORIES_JSON, JSON.stringify(sorted, null, 2) + "\n");
}
async function readTaxonomyFile(filePath) {
  const raw = await readUtf8TaxonomyFile(filePath);
  const items = parseTaxonomyJson(raw);
  let dirty = false;
  for (const it of items) {
    if (!it.id) {
      it.id = randomUUID();
      dirty = true;
    }
  }
  if (dirty) {
    await writeTaxonomyFile(filePath, items);
  }
  return items;
}
async function writeTaxonomyFile(filePath, items) {
  const sorted = [...items].sort(
    (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" })
  );
  await writeJsonFileRobust(filePath, JSON.stringify(sorted, null, 2) + "\n");
}
async function readCategories() {
  const raw = await readUtf8TaxonomyFile(CATEGORIES_JSON);
  const items = parseCategoriesJson(raw);
  let dirty = false;
  for (const it of items) {
    if (!it.id) {
      it.id = randomUUID();
      dirty = true;
    }
  }
  if (dirty) {
    await writeCategoriesFile(items);
  }
  return items;
}
async function readTags() {
  return readTaxonomyFile(TAGS_JSON);
}

export { TAGS_JSON as T, readCategories as a, writeCategoriesFile as b, readTags as c, readTaxonomyFile as r, writeTaxonomyFile as w };
