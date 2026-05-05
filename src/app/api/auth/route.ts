import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

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
};

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function hashPassword(password: string): string {
  const secret = process.env.AUTH_HASH_SECRET?.trim() || 'change-this-auth-hash-secret';
  return createHmac('sha256', secret).update(password, 'utf8').digest('hex');
}

function issueSessionToken(user: Pick<AuthUserRecord, 'id' | 'email'>, siteId: string): string {
  const secret = process.env.SESSION_SECRET?.trim() || process.env.AUTH_HASH_SECRET?.trim() || 'change-this-session-secret';
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

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase() || '';
    const password = body.password || '';
    const siteId = body.siteId?.trim() || '';

    if (!email || !password || !siteId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, password e siteId.' },
        { status: 400, headers: corsHeaders },
      );
    }

    const { users } = await readUsersDb();
    const user = users.find((item) => item.email.trim().toLowerCase() === email);

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401, headers: corsHeaders });
    }

    const incomingHash = hashPassword(password);
    if (!safeHashEquals(incomingHash, user.passwordHash)) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401, headers: corsHeaders });
    }

    if (!user.siteIds.includes(siteId)) {
      return NextResponse.json(
        { error: 'siteId não pertence ao usuário informado.' },
        { status: 403, headers: corsHeaders },
      );
    }

    const token = issueSessionToken({ id: user.id, email: user.email }, siteId);
    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? 'client',
      siteIds: user.siteIds,
    };

    return NextResponse.json(
      {
        ok: true,
        user: publicUser,
        token,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'Erro interno ao processar login.' },
      { status: 500, headers: corsHeaders },
    );
  }
}
