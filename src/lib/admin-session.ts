/**
 * Sessão do painel /admin: cookie `admin_session` = HMAC estável a partir de
 * ADMIN_USER + ADMIN_PASSWORD (+ SESSION_SECRET opcional).
 * ADMIN_PASS mantém compatibilidade com projetos antigos.
 */

import type { AstroCookies } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'changeme';

function rawAdminPasswordEnv(): unknown {
	return import.meta.env.ADMIN_PASSWORD ?? import.meta.env.ADMIN_PASS;
}

/** Credenciais efetivas (env ou valores temporários por defeito em desenvolvimento / até configurar Vercel). */
export function getAdminCredentials(): { user: string; pass: string; secret: string } {
	const rawUser = import.meta.env.ADMIN_USER;
	const rawPass = rawAdminPasswordEnv();
	const rawSecret = import.meta.env.SESSION_SECRET;
	const user =
		typeof rawUser === 'string' && rawUser.trim().length > 0 ? rawUser.trim() : DEFAULT_ADMIN_USER;
	const pass =
		typeof rawPass === 'string' && rawPass.trim().length > 0
			? rawPass.trim()
			: DEFAULT_ADMIN_PASS;
	const secret =
		typeof rawSecret === 'string' && rawSecret.trim().length ? rawSecret.trim() : pass;
	return { user, pass, secret };
}

/** True se ADMIN_USER ou senha (ADMIN_PASSWORD / ADMIN_PASS) não estão definidos — usando valores temporários. */
export function usesFallbackAdminCredentials(): boolean {
	const rawUser = import.meta.env.ADMIN_USER;
	const rawPass = rawAdminPasswordEnv();
	const hasUser = typeof rawUser === 'string' && rawUser.trim().length > 0;
	const hasPass = typeof rawPass === 'string' && rawPass.trim().length > 0;
	return !hasUser || !hasPass;
}

/** Gera o valor esperado do cookie (após login bem-sucedido). */
export function getAdminSessionTokenValue(): string {
	const creds = getAdminCredentials();
	return createHmac('sha256', creds.secret)
		.update('blogonauta:admin:session:' + creds.user)
		.digest('hex');
}

export function isValidAdminSession(token: string | undefined | null): boolean {
	const expected = getAdminSessionTokenValue();
	if (!token) return false;
	try {
		const a = Buffer.from(token, 'utf8');
		const b = Buffer.from(expected, 'utf8');
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

/** @deprecated Prefer `usesFallbackAdminCredentials()` ou verifique env diretamente. */
export function adminEnvConfigured(): boolean {
	return !usesFallbackAdminCredentials();
}

/** Comparação em tempo aproximadamente constante para user/senha no login. */
export function timingSafeStringEq(a: string, b: string): boolean {
	try {
		const ba = Buffer.from(a, 'utf8');
		const bb = Buffer.from(b, 'utf8');
		if (ba.length !== bb.length) return false;
		return timingSafeEqual(ba, bb);
	} catch {
		return false;
	}
}

/** Para Astro Actions: falha o pedido se não houver sessão admin válida. */
export function requireAdminCookies(cookies: AstroCookies): void {
	if (!isValidAdminSession(cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
		throw new Error('Não autorizado.');
	}
}
