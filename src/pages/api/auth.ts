import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type AuthUserRecord = {
	id: string;
	name: string;
	email: string;
	passwordHash: string;
	siteIds: string[];
	role?: string;
};

type AuthUsersDb = {
	users: AuthUserRecord[];
};

type LoginBody = {
	email?: string;
	password?: string;
	siteId?: string;
	SITE_ID?: string;
};

export const prerender = false;

const corsHeaders: Record<string, string> = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Content-Type': 'application/json',
};

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: corsHeaders,
	});
}

function hashPassword(password: string): string {
	const secret = import.meta.env.AUTH_HASH_SECRET?.toString().trim() || 'change-this-auth-hash-secret';
	return createHmac('sha256', secret).update(password, 'utf8').digest('hex');
}

function issueSessionToken(user: Pick<AuthUserRecord, 'id' | 'email'>, siteId: string): string {
	const secret =
		import.meta.env.SESSION_SECRET?.toString().trim() ||
		import.meta.env.AUTH_HASH_SECRET?.toString().trim() ||
		'change-this-session-secret';

	const payload = {
		sub: user.id,
		email: user.email,
		siteId,
		iat: Math.floor(Date.now() / 1000),
	};
	const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
	const signature = createHmac('sha256', secret).update(payloadBase64).digest('base64url');
	return `${payloadBase64}.${signature}`;
}

function safeHashEquals(a: string, b: string): boolean {
	const left = Buffer.from(a, 'utf8');
	const right = Buffer.from(b, 'utf8');
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}

async function readUsersDb(): Promise<AuthUsersDb> {
	const dbPath = path.join(process.cwd(), 'src', 'data', 'auth-users.json');
	const raw = await readFile(dbPath, 'utf8');
	const parsed = JSON.parse(raw) as Partial<AuthUsersDb>;
	return { users: Array.isArray(parsed.users) ? parsed.users : [] };
}

export const OPTIONS: APIRoute = async () => {
	return new Response(null, { status: 204, headers: corsHeaders });
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as LoginBody;
		const email = body.email?.trim().toLowerCase() || '';
		const password = body.password || '';
		const siteId = body.siteId?.trim() || body.SITE_ID?.trim() || '';

		if (!email || !password || !siteId) {
			return json({ error: 'Campos obrigatórios: email, password e siteId.' }, 400);
		}

		const { users } = await readUsersDb();
		const user = users.find((item) => item.email.trim().toLowerCase() === email);
		if (!user) return json({ error: 'Credenciais inválidas.' }, 401);

		const incomingHash = hashPassword(password);
		if (!safeHashEquals(incomingHash, user.passwordHash)) {
			return json({ error: 'Credenciais inválidas.' }, 401);
		}

		if (!user.siteIds.includes(siteId)) {
			return json({ error: 'siteId não pertence ao usuário informado.' }, 403);
		}

		const token = issueSessionToken({ id: user.id, email: user.email }, siteId);
		return json({
			ok: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role ?? 'client',
				siteIds: user.siteIds,
			},
			token,
		});
	} catch {
		return json({ error: 'Erro interno ao processar login.' }, 500);
	}
};
