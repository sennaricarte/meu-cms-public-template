import { a9 as defineMiddleware, aj as sequence } from './chunks/sequence_Cm0YKoB9.mjs';
import 'piccolore';
import 'clsx';
import { A as ADMIN_SESSION_COOKIE, i as isValidAdminSession } from './chunks/admin-session_CqodbBXM.mjs';

const LOGIN = "/admin/login";
function isPublicAdminPath(pathname) {
  if (pathname === LOGIN) return true;
  if (pathname === "/admin/logout" || pathname.startsWith("/admin/logout?")) return true;
  return false;
}
function requiresAdminAuth(pathname) {
  if (isPublicAdminPath(pathname)) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname === "/_actions" || pathname.startsWith("/_actions/")) return true;
  if (pathname === "/api/upload" || pathname.startsWith("/api/upload?")) return true;
  if (pathname === "/api/upload-image" || pathname.startsWith("/api/upload-image?")) return true;
  if (pathname === "/api/list-uploads" || pathname.startsWith("/api/list-uploads?")) return true;
  return false;
}
const onRequest$1 = defineMiddleware(async (context, next) => {
  if (!requiresAdminAuth(context.url.pathname)) {
    return next();
  }
  const token = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(token)) {
    const path = context.url.pathname;
    if (path.startsWith("/api/") || path.startsWith("/_actions")) {
      return new Response(JSON.stringify({ error: "Não autorizado. Faça login no painel admin." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return context.redirect(LOGIN);
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
