/**
 * Integração com a API central (ex.: Lovable) para login, sessão e primeiro acesso.
 *
 * Contrato esperado (ajuste os paths via env se a sua API usar outros URLs):
 *
 * POST .../login — body: { siteId, username, password }
 *   → { ok: true, sessionToken: string, setupRequired: boolean }
 *
 * POST .../session — headers: Authorization: Bearer &lt;sessionToken&gt;, body: { siteId, sessionToken? }
 *   → { ok: true, valid: true, setupRequired?: boolean }
 *
 * POST .../complete-setup — Authorization: Bearer, body: { siteId, username, password, passwordConfirm }
 *   → { ok: true }
 */

export type CentralConfig = { base: string; siteId: string };

/** True quando `CENTRAL_ADMIN_API_BASE` e `SITE_ID` estão definidos (login admin não quebra o site se for false). */
export function isCentralAdminConfigured(): boolean {
	return getCentralConfig() !== null;
}

export function getCentralConfig(): CentralConfig | null {
	const baseRaw =
		typeof import.meta.env.CENTRAL_ADMIN_API_BASE === 'string' ? import.meta.env.CENTRAL_ADMIN_API_BASE.trim() : '';
	const siteId =
		typeof import.meta.env.SITE_ID === 'string'
			? import.meta.env.SITE_ID.trim()
			: typeof import.meta.env.PUBLIC_SITE_ID === 'string'
				? import.meta.env.PUBLIC_SITE_ID.trim()
				: '';
	if (!baseRaw || !siteId) return null;
	return { base: baseRaw.replace(/\/$/, ''), siteId };
}

function joinUrl(base: string, path: string): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${base.replace(/\/$/, '')}${p}`;
}

function loginPath(): string {
	return import.meta.env.CENTRAL_ADMIN_PATH_LOGIN?.toString().trim() || '/v1/admin/login';
}

function sessionPath(): string {
	return import.meta.env.CENTRAL_ADMIN_PATH_SESSION?.toString().trim() || '/v1/admin/session';
}

function setupPath(): string {
	return import.meta.env.CENTRAL_ADMIN_PATH_SETUP?.toString().trim() || '/v1/admin/complete-setup';
}

export async function centralAdminLogin(
	username: string,
	password: string,
): Promise<{ ok: true; sessionToken: string; setupRequired: boolean } | { ok: false; error: string }> {
	const cfg = getCentralConfig();
	if (!cfg) {
		return { ok: false, error: 'Configure CENTRAL_ADMIN_API_BASE e SITE_ID nas variáveis de ambiente.' };
	}

	let res: Response;
	try {
		res = await fetch(joinUrl(cfg.base, loginPath()), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({
			siteId: cfg.siteId,
			username: username.trim(),
			password,
		}),
	});
	} catch {
		return { ok: false, error: 'Sem ligação à API central. Verifique a rede ou CENTRAL_ADMIN_API_BASE.' };
	}

	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

	if (!res.ok) {
		const msg = typeof data.error === 'string' ? data.error : 'Credenciais inválidas.';
		return { ok: false, error: msg };
	}

	if (data.ok !== true || typeof data.sessionToken !== 'string' || !data.sessionToken.length) {
		return { ok: false, error: 'Resposta inválida da API central (sessionToken em falta).' };
	}

	return {
		ok: true,
		sessionToken: data.sessionToken,
		setupRequired: Boolean(data.setupRequired),
	};
}

export async function validateCentralSession(sessionToken: string | undefined | null): Promise<
	| { ok: true; valid: true; setupRequired: boolean }
	| { ok: true; valid: false }
	| { ok: false; error?: string }
> {
	const t = sessionToken?.trim();
	if (!t) return { ok: true, valid: false };

	const cfg = getCentralConfig();
	if (!cfg) return { ok: false, error: 'API central não configurada.' };

	let res: Response;
	try {
		res = await fetch(joinUrl(cfg.base, sessionPath()), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${t}`,
			},
			body: JSON.stringify({ siteId: cfg.siteId, sessionToken: t }),
		});
	} catch {
		return { ok: false, error: 'rede' };
	}

	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

	if (!res.ok) {
		return { ok: true, valid: false };
	}

	const valid = data.valid === true || data.ok === true;
	if (!valid) {
		return { ok: true, valid: false };
	}

	const setupRequired = typeof data.setupRequired === 'boolean' ? data.setupRequired : false;
	return { ok: true, valid: true, setupRequired };
}

export async function centralAdminCompleteSetup(params: {
	sessionToken: string;
	username: string;
	password: string;
	passwordConfirm: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
	const cfg = getCentralConfig();
	if (!cfg) {
		return { ok: false, error: 'Configure CENTRAL_ADMIN_API_BASE e SITE_ID.' };
	}

	let res: Response;
	try {
		res = await fetch(joinUrl(cfg.base, setupPath()), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${params.sessionToken.trim()}`,
		},
		body: JSON.stringify({
			siteId: cfg.siteId,
			username: params.username.trim(),
			password: params.password,
			passwordConfirm: params.passwordConfirm,
		}),
	});
	} catch {
		return { ok: false, error: 'Sem ligação à API central.' };
	}

	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

	if (!res.ok) {
		return {
			ok: false,
			error: typeof data.error === 'string' ? data.error : `Erro ${res.status} ao atualizar credenciais.`,
		};
	}

	if (data.ok !== true) {
		return {
			ok: false,
			error: typeof data.error === 'string' ? data.error : 'A API central recusou a atualização.',
		};
	}

	return { ok: true };
}
