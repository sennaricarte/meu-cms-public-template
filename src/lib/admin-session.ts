/**
 * Sessão do painel /admin: cookie `admin_session` = HMAC estável a partir de
 * ADMIN_USER + ADMIN_PASS (+ SESSION_SECRET opcional).
 */

import type { AstroCookies } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';

/** Lê credenciais do .env sem espaços acidentais (comuns em cópia/colar ou CRLF no Windows). */
export function getAdminCredentials(): { user: string; pass: string; secret: string } | null {
	const rawUser = import.meta.env.ADMIN_USER;
	const rawPass = import.meta.env.ADMIN_PASS;
	const rawSecret = import.meta.env.SESSION_SECRET;
	const user = typeof rawUser === 'string' ? rawUser.trim() : '';
	const pass = typeof rawPass === 'string' ? rawPass.trim() : '';
	if (!user.length || !pass.length) return null;
	const secret =
		typeof rawSecret === 'string' && rawSecret.trim().length
			? rawSecret.trim()
			: pass;
	return { user, pass, secret };
}

/** Gera o valor esperado do cookie (após login bem-sucedido). */
export function getAdminSessionTokenValue(): string | null {
	const creds = getAdminCredentials();
	if (!creds) return null;
	return createHmac('sha256', creds.secret)
		.update('blogonauta:admin:session:' + creds.user)
		.digest('hex');
}

export function isValidAdminSession(token: string | undefined | null): boolean {
	const expected = getAdminSessionTokenValue();
	if (!expected || !token) return false;
	try {
		const a = Buffer.from(token, 'utf8');
		const b = Buffer.from(expected, 'utf8');
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

export function adminEnvConfigured(): boolean {
	return getAdminCredentials() !== null;
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
