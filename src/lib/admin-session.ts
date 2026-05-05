/**
 * Sessão do painel /admin: cookie `admin_session` = HMAC a partir das mesmas
 * credenciais que src/lib/admin-env.ts (ADMIN_USER + ADMIN_PASSWORD).
 */

import type { AstroCookies } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getAdminCredentials, usesFallbackAdminCredentials } from './admin-env';

export const ADMIN_SESSION_COOKIE = 'admin_session';

export { getAdminCredentials, usesFallbackAdminCredentials } from './admin-env';

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

/** @deprecated Prefira `usesFallbackAdminCredentials` importado de `admin-env`. */
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
