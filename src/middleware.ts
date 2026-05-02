import { defineMiddleware } from 'astro:middleware';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from './lib/admin-session';

const LOGIN = '/admin/login';

function isPublicAdminPath(pathname: string): boolean {
	if (pathname === LOGIN) return true;
	/* Permite sair sem sessão (no-op) ou com sessão */
	if (pathname === '/admin/logout' || pathname.startsWith('/admin/logout?')) return true;
	return false;
}

function requiresAdminAuth(pathname: string): boolean {
	if (isPublicAdminPath(pathname)) return false;
	if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;
	/* Astro Actions (savePost, deletePost, …) — mesmo cookie que /admin */
	if (pathname === '/_actions' || pathname.startsWith('/_actions/')) return true;
	if (pathname === '/api/upload' || pathname.startsWith('/api/upload?')) return true;
	if (pathname === '/api/upload-image' || pathname.startsWith('/api/upload-image?')) return true;
	if (pathname === '/api/list-uploads' || pathname.startsWith('/api/list-uploads?')) return true;
	return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
	if (!requiresAdminAuth(context.url.pathname)) {
		return next();
	}

	const token = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;
	if (!isValidAdminSession(token)) {
		const path = context.url.pathname;
		if (path.startsWith('/api/') || path.startsWith('/_actions')) {
			return new Response(JSON.stringify({ error: 'Não autorizado. Faça login no painel admin.' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return context.redirect(LOGIN);
	}

	return next();
});
