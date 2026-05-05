/**
 * Sessão do painel /admin: cookie `admin_session` = token opaco emitido pela API central (Lovable).
 */

import type { AstroCookies } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { validateCentralSession } from './central-admin-api';

export const ADMIN_SESSION_COOKIE = 'admin_session';

export {
	centralAdminCompleteSetup,
	centralAdminLogin,
	getCentralConfig,
	validateCentralSession,
} from './central-admin-api';

/** Valida o token junto da API central. */
export async function isValidAdminSession(token: string | undefined | null): Promise<boolean> {
	const r = await validateCentralSession(token);
	if (r.ok !== true) return false;
	return r.valid === true;
}

/** True quando a API indica primeiro acesso / configuração pendente. */
export async function isInitialSetupPending(sessionToken: string | undefined | null): Promise<boolean> {
	const r = await validateCentralSession(sessionToken);
	if (r.ok !== true) return false;
	if (r.valid !== true) return false;
	return r.setupRequired === true;
}

export async function isBootstrapPending(sessionToken: string | undefined | null): Promise<boolean> {
	return isInitialSetupPending(sessionToken);
}

export async function usesFallbackAdminCredentials(sessionToken: string | undefined | null): Promise<boolean> {
	return isInitialSetupPending(sessionToken);
}

/** @deprecated Use `!(await isInitialSetupPending(...))`. */
export async function adminEnvConfigured(sessionToken: string | undefined | null): Promise<boolean> {
	return !(await isInitialSetupPending(sessionToken));
}

/** Comparação em tempo aproximadamente constante (útil para comparar tokens locais). */
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

export async function requireAdminCookies(cookies: AstroCookies): Promise<void> {
	const token = cookies.get(ADMIN_SESSION_COOKIE)?.value;
	if (!(await isValidAdminSession(token))) {
		throw new Error('Não autorizado.');
	}
}
