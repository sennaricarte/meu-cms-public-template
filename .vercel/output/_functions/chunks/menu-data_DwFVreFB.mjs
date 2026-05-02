import { randomUUID } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const MENU_MAIN_JSON = join(process.cwd(), "src", "data", "menu-main.json");
const MENU_FOOTER_JSON = join(process.cwd(), "src", "data", "menu-footer.json");
function errnoCode(err) {
  return err && typeof err === "object" && "code" in err ? String(err.code) : void 0;
}
async function writeJsonFileRobust(filePath, payload) {
  await mkdir(dirname(filePath), { recursive: true });
  try {
    await writeFile(filePath, payload, "utf-8");
  } catch (err) {
    const code = errnoCode(err);
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      throw new Error(
        "Não foi possível gravar no disco. Em deploy na Vercel o filesystem é só de leitura — usa desenvolvimento local ou um CMS."
      );
    }
    throw err;
  }
}
async function readUtf8OrSeed(filePath, seedJson) {
  try {
    return await readFile(filePath, "utf-8");
  } catch (err) {
    if (errnoCode(err) !== "ENOENT") throw err;
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, seedJson, "utf-8");
    return seedJson;
  }
}
function normalizeMenuHref(raw) {
  const t = raw.trim();
  if (!t) return "/";
  const lower = t.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return "/";
  }
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("#")) return t;
  if (t.startsWith("/")) return t;
  return `/${t.replace(/^\/+/, "")}`;
}
function sortMenuItems(items) {
  return [...items].sort(
    (a, b) => a.order !== b.order ? a.order - b.order : a.label.localeCompare(b.label, "pt", { sensitivity: "base" })
  );
}
function parseItemId(raw) {
  if (typeof raw === "string" && raw.trim()) return raw.trim().slice(0, 80);
  return randomUUID();
}
function parseColumnString(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    if (!s) return void 0;
    if (s === "useful" || s === "links úteis" || s === "links uteis" || s === "uteis" || s === "úteis") {
      return "useful";
    }
    if (s === "institutional" || s === "institucional") return "institutional";
    return raw.trim().slice(0, 40);
  }
  return void 0;
}
function columnFromLegacyHeading(title) {
  const t = title.trim().toLowerCase();
  if (t.includes("útil") || t.includes("util")) return "useful";
  return "institutional";
}
function parseMenuJson(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (Array.isArray(data)) {
    const out = [];
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      if (!el || typeof el !== "object") continue;
      const o = el;
      const label = String(o.label ?? "").trim();
      const urlRaw = String(o.url ?? o.href ?? "").trim();
      if (!label || !urlRaw) continue;
      const order = typeof o.order === "number" && Number.isFinite(o.order) ? Math.trunc(o.order) : i;
      const col = parseColumnString(o.column);
      out.push({
        id: parseItemId(o.id),
        label,
        url: normalizeMenuHref(urlRaw),
        order,
        ...col ? { column: col } : {}
      });
    }
    return sortMenuItems(out);
  }
  if (!data || typeof data !== "object") return [];
  const record = data;
  if (Array.isArray(record.items)) {
    const out = [];
    for (let i = 0; i < record.items.length; i++) {
      const el = record.items[i];
      if (!el || typeof el !== "object") continue;
      const o = el;
      const label = String(o.label ?? "").trim();
      const urlRaw = String(o.url ?? o.href ?? "").trim();
      if (!label || !urlRaw) continue;
      const col = parseColumnString(o.column);
      out.push({
        id: parseItemId(o.id),
        label,
        url: normalizeMenuHref(urlRaw),
        order: typeof o.order === "number" ? Math.trunc(o.order) : i,
        ...col ? { column: col } : {}
      });
    }
    return sortMenuItems(out);
  }
  if (Array.isArray(record.columns)) {
    const out = [];
    let ord = 0;
    for (const col of record.columns) {
      if (!col || typeof col !== "object") continue;
      const colTitle = String(col.title ?? "");
      const group = columnFromLegacyHeading(colTitle);
      const items = col.items;
      if (!Array.isArray(items)) continue;
      for (const el of items) {
        if (!el || typeof el !== "object") continue;
        const o = el;
        const label = String(o.label ?? "").trim();
        const urlRaw = String(o.url ?? o.href ?? "").trim();
        if (!label || !urlRaw) continue;
        out.push({
          id: parseItemId(o.id),
          label,
          url: normalizeMenuHref(urlRaw),
          order: typeof o.order === "number" && Number.isFinite(o.order) ? Math.trunc(o.order) : ord++,
          column: parseColumnString(o.column) ?? group
        });
      }
    }
    return sortMenuItems(out);
  }
  return [];
}
async function readMainMenu() {
  const seed = "[]\n";
  const raw = await readUtf8OrSeed(MENU_MAIN_JSON, seed);
  return parseMenuJson(raw);
}
async function readFooterMenu() {
  const seed = "[]\n";
  const raw = await readUtf8OrSeed(MENU_FOOTER_JSON, seed);
  return parseMenuJson(raw);
}
async function writeMainMenuFile(items) {
  const sorted = sortMenuItems(items).map(({ id, label, url, order }) => ({
    id,
    label,
    url,
    order
  }));
  await writeJsonFileRobust(MENU_MAIN_JSON, `${JSON.stringify(sorted, null, 2)}
`);
}
async function writeFooterMenuFile(items) {
  const sorted = sortMenuItems(items).map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url,
    order: item.order,
    column: item.column?.trim() || "institutional"
  }));
  await writeJsonFileRobust(MENU_FOOTER_JSON, `${JSON.stringify(sorted, null, 2)}
`);
}

export { writeFooterMenuFile as a, readFooterMenu as b, normalizeMenuHref as n, readMainMenu as r, sortMenuItems as s, writeMainMenuFile as w };
