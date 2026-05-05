/**
 * POST /api/update-config — define utilizador e senha definitivos após primeiro acesso.
 * FormData: username, password, confirm (requer sessão admin válida).
 */
import type { APIRoute } from 'astro';
import { applyAdminConfigUpdate } from '../../lib/admin-config';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '../../lib/admin-session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
	const token = cookies.get(ADMIN_SESSION_COOKIE)?.value;
	if (!isValidAdminSession(token)) {
		return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const ct = request.headers.get('content-type') ?? '';
	let username = '';
	let password = '';
	let confirm = '';

	if (ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
		const form = await request.formData();
		username = form.get('username')?.toString().trim() ?? '';
		password = form.get('password')?.toString() ?? '';
		confirm = form.get('confirm')?.toString() ?? '';
	} else {
		try {
			const body = (await request.json()) as { username?: string; password?: string; confirm?: string };
			username = body.username?.trim() ?? '';
			password = body.password ?? '';
			confirm = body.confirm ?? '';
		} catch {
			return new Response(JSON.stringify({ error: 'Corpo JSON inválido.' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	if (!username || !password || !confirm) {
		return new Response(JSON.stringify({ error: 'Preencha todos os campos.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (password !== confirm) {
		return new Response(JSON.stringify({ error: 'As senhas não coincidem.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const result = applyAdminConfigUpdate(username, password);
	if (!result.ok) {
		return new Response(JSON.stringify({ error: result.error }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });
	return Response.redirect(new URL('/admin/login?configured=1', request.url).href, 303);
};
