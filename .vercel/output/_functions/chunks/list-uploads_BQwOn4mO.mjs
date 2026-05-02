import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { A as ADMIN_SESSION_COOKIE, i as isValidAdminSession } from './admin-session_CqodbBXM.mjs';

const prerender = false;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|svg)$/i;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const GET = async ({ cookies }) => {
  const session = cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) {
    return json({ error: "Não autorizado. Faça login no painel admin." }, 401);
  }
  const dir = join(process.cwd(), "public", "uploads");
  let names;
  try {
    names = await readdir(dir);
  } catch {
    return json({ images: [] });
  }
  const entries = await Promise.all(
    names.filter((n) => IMAGE_EXT.test(n) && !n.startsWith(".")).map(async (name) => {
      const filePath = join(dir, name);
      try {
        const st = await stat(filePath);
        return { name, mtimeMs: st.mtimeMs };
      } catch {
        return { name, mtimeMs: 0 };
      }
    })
  );
  const images = entries.sort((a, b) => a.name.localeCompare(b.name, "pt")).map(({ name, mtimeMs }) => ({
    name,
    url: `/uploads/${encodeURIComponent(name)}`,
    updatedAt: new Date(mtimeMs || Date.now()).toISOString()
  }));
  return json({ images });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
