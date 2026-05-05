/**
 * Credenciais do painel /admin a partir das variáveis de ambiente (ex.: Vercel).
 * Sem Supabase ou base de dados — apenas import.meta.env.
 */

export const DEFAULT_ADMIN_USER = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'changeme';

/** Utilizador efetivo (ADMIN_USER ou valor temporário local). */
export function expectedAdminUser(): string {
	const raw = import.meta.env.ADMIN_USER;
	return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : DEFAULT_ADMIN_USER;
}

/** Senha efetiva: ADMIN_PASSWORD, ou ADMIN_PASS (legado), ou valor temporário. */
export function expectedAdminPassword(): string {
	const primary = import.meta.env.ADMIN_PASSWORD;
	if (typeof primary === 'string' && primary.trim().length > 0) return primary.trim();
	const legacy = import.meta.env.ADMIN_PASS;
	if (typeof legacy === 'string' && legacy.trim().length > 0) return legacy.trim();
	return DEFAULT_ADMIN_PASSWORD;
}

function sessionSecret(): string {
	const raw = import.meta.env.SESSION_SECRET;
	return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : expectedAdminPassword();
}

/** user + pass + segredo do HMAC do cookie (alinhado ao formulário de login). */
export function getAdminCredentials(): { user: string; pass: string; secret: string } {
	return {
		user: expectedAdminUser(),
		pass: expectedAdminPassword(),
		secret: sessionSecret(),
	};
}

/** True quando ADMIN_USER ou senha (PASSWORD/PASS) não estão definidos no env. */
export function usesFallbackAdminCredentials(): boolean {
	const rawUser = import.meta.env.ADMIN_USER;
	const rawPass = import.meta.env.ADMIN_PASSWORD ?? import.meta.env.ADMIN_PASS;
	const hasUser = typeof rawUser === 'string' && rawUser.trim().length > 0;
	const hasPass = typeof rawPass === 'string' && rawPass.trim().length > 0;
	return !hasUser || !hasPass;
}
