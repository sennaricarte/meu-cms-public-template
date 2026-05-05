/**
 * Credenciais do painel /admin apenas via `src/data/admin-config.json`
 * (sem Supabase, sem variáveis de ambiente para login).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export type AdminConfigFile = {
	v: 1;
	username: string;
	passwordSaltHex: string;
	passwordHashHex: string;
	sessionSecret: string;
	setupCompleted: boolean;
};

const CONFIG_FILENAME = 'admin-config.json';

/** Referência apenas para texto de ajuda no login — a validação usa sempre o hash no JSON. */
export const DOCUMENTED_INITIAL_PASSWORD_HINT = 'admin';

export function getAdminConfigPath(): string {
	return join(process.cwd(), 'src', 'data', CONFIG_FILENAME);
}

export function loadAdminConfig(): AdminConfigFile {
	const raw = readFileSync(getAdminConfigPath(), 'utf8');
	const j = JSON.parse(raw) as AdminConfigFile;
	if (
		j.v !== 1 ||
		typeof j.username !== 'string' ||
		j.username.trim().length < 1 ||
		typeof j.passwordSaltHex !== 'string' ||
		j.passwordSaltHex.length < 1 ||
		typeof j.passwordHashHex !== 'string' ||
		j.passwordHashHex.length < 1 ||
		typeof j.sessionSecret !== 'string' ||
		j.sessionSecret.length < 16 ||
		typeof j.setupCompleted !== 'boolean'
	) {
		throw new Error('admin-config.json inválido ou corrompido.');
	}
	return j;
}

/** True até o administrador concluir o assistente em /admin/setup (gravado no JSON). */
export function isInitialSetupPending(): boolean {
	try {
		return !loadAdminConfig().setupCompleted;
	} catch {
		return true;
	}
}

export function isBootstrapPending(): boolean {
	return isInitialSetupPending();
}

/** @deprecated Use `isInitialSetupPending`. */
export function usesFallbackAdminCredentials(): boolean {
	return isInitialSetupPending();
}

function timingSafeStringEq(a: string, b: string): boolean {
	try {
		const ba = Buffer.from(a, 'utf8');
		const bb = Buffer.from(b, 'utf8');
		if (ba.length !== bb.length) return false;
		return timingSafeEqual(ba, bb);
	} catch {
		return false;
	}
}

function verifyPasswordAgainstConfig(plain: string, cfg: AdminConfigFile): boolean {
	try {
		const salt = Buffer.from(cfg.passwordSaltHex, 'hex');
		const expected = Buffer.from(cfg.passwordHashHex, 'hex');
		const derived = scryptSync(plain, salt, expected.length);
		return timingSafeEqual(derived, expected);
	} catch {
		return false;
	}
}

export function verifyAdminLogin(username: string, password: string): boolean {
	let cfg: AdminConfigFile;
	try {
		cfg = loadAdminConfig();
	} catch {
		return false;
	}
	const u = username.trim();
	if (!timingSafeStringEq(u, cfg.username.trim())) return false;
	return verifyPasswordAgainstConfig(password, cfg);
}

export function getSigningCredentials(): { user: string; secret: string } {
	const cfg = loadAdminConfig();
	return { user: cfg.username.trim(), secret: cfg.sessionSecret };
}

/** Compatível com código que esperava `pass` em texto plano — já não existe no disco. */
export function getAdminCredentials(): { user: string; pass: string; secret: string } {
	const cfg = loadAdminConfig();
	return { user: cfg.username.trim(), pass: '', secret: cfg.sessionSecret };
}

export type ApplyConfigResult = { ok: true } | { ok: false; error: string };

/**
 * Substitui credenciais e marca setup como concluído.
 * Usado pela rota POST /api/update-config.
 */
export function applyAdminConfigUpdate(newUsername: string, plainPassword: string): ApplyConfigResult {
	const u = newUsername.trim();
	if (u.length < 2) {
		return { ok: false, error: 'Utilize um nome de utilizador com pelo menos 2 caracteres.' };
	}
	if (plainPassword.length < 8) {
		return { ok: false, error: 'A senha deve ter pelo menos 8 caracteres.' };
	}

	let current: AdminConfigFile;
	try {
		current = loadAdminConfig();
	} catch {
		return { ok: false, error: 'Não foi possível ler admin-config.json.' };
	}

	if (current.setupCompleted) {
		return { ok: false, error: 'A configuração inicial já foi concluída.' };
	}

	const salt = randomBytes(16);
	const hashLen = 64;
	const hash = scryptSync(plainPassword, salt, hashLen);
	const sessionSecret = randomBytes(32).toString('hex');

	const next: AdminConfigFile = {
		v: 1,
		username: u,
		passwordSaltHex: salt.toString('hex'),
		passwordHashHex: hash.toString('hex'),
		sessionSecret,
		setupCompleted: true,
	};

	try {
		writeFileSync(getAdminConfigPath(), JSON.stringify(next, null, '\t'), {
			encoding: 'utf8',
			mode: 0o600,
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return {
			ok: false,
			error: 'Falha ao gravar admin-config.json: ' + msg,
		};
	}

	return { ok: true };
}
