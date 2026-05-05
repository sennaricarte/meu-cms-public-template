import { defineMiddleware } from 'astro:middleware';
import { isInitialSetupPending } from './lib/admin-config';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from './lib/admin-session';

const LOGIN = '/admin/login';

function isPublicAdminPath(pathname: string): boolean {
	if (pathname === LOGIN) return true;
	if (pathname === '/admin/logout' || pathname.startsWith('/admin/logout?')) return true;
	return false;
}

function requiresAdminAuth(pathname: string): boolean {
	if (isPublicAdminPath(pathname)) return false;
	if (pathname === '/admin' || pathname.startsWith('/admin/')) return true;
	if (pathname === '/_actions' || pathname.startsWith('/_actions/')) return true;
	if (pathname === '/api/upload' || pathname.startsWith('/api/upload?')) return true;
	if (pathname === '/api/upload-image' || pathname.startsWith('/api/upload-image?')) return true;
	if (pathname === '/api/list-uploads' || pathname.startsWith('/api/list-uploads?')) return true;
	if (pathname === '/api/update-config') return true;
	return false;
}

function isSetupPath(pathname: string): boolean {
	return pathname === '/admin/setup' || pathname.startsWith('/admin/setup?');
}

export const onRequest = defineMiddleware(async (context, next) => {
	if (!requiresAdminAuth(context.url.pathname)) {
		return next();
	}

	const pathname = context.url.pathname;
	const token = context.cookies.get(ADMIN_SESSION_COOKIE)?.value;

	if (!isValidAdminSession(token)) {
		if (pathname.startsWith('/api/') || pathname.startsWith('/_actions')) {
			return new Response(JSON.stringify({ error: 'Não autorizado. Faça login no painel admin.' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return context.redirect(LOGIN);
	}

	if (isSetupPath(pathname)) {
		if (!isInitialSetupPending()) {
			return context.redirect('/admin/dashboard');
		}
		return next();
	}

	if (isInitialSetupPending()) {
		if (pathname.startsWith('/api/')) {
			if (pathname !== '/api/update-config') {
				return new Response(
					JSON.stringify({
						error: 'Complete a configuração inicial em /admin/setup antes de usar esta funcionalidade.',
					}),
					{
						status: 403,
						headers: { 'Content-Type': 'application/json' },
					},
				);
			}
			return next();
		}
		return context.redirect('/admin/setup');
	}

	return next();
});
