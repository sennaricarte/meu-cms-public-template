/**
 * POST /api/upload
 * FormData: campo `image` (arquivo). Opcional: `title` ou `slug` para prefixar o nome.
 *
 * Usado pelo editor, page-editor e **Central de Mídia** (`/admin/media`): o ficheiro gravado é
 * **sempre** raster WebP (Sharp), largura máx. 1200px, qualidade 80 — mesmo que o original seja PNG/JPEG/WebP/GIF.
 *
 * Resposta OK: { "url": "/uploads/….webp", "filename": "….webp", "size": número de bytes do WebP gravado }
 *
 * MIME declarado: image/jpeg, image/png, image/webp, image/gif; também aceita corpo sem tipo ou
 * `application/octet-stream` e tenta decodificar com Sharp (útil em drag-and-drop).
 *
 * Requer cookie `admin_session` válido.
 */

import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '../../lib/admin-session';

export const prerender = false;

/** MIMEs que o cliente costuma enviar com tipo correto. */
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
/** Sem tipo ou octet-stream: ainda assim tentamos Sharp (ficheiro pode ser imagem válida). */
const TRY_DECODE_ANYWAY = new Set(['', 'application/octet-stream']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_WIDTH      = 1200;
const WEBP_QUALITY   = 80;

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

function slugify(raw: string): string {
	const base = raw
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
	return base || 'imagem';
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

export const POST: APIRoute = async ({ request, cookies }) => {
	const session = cookies.get(ADMIN_SESSION_COOKIE)?.value;
	if (!isValidAdminSession(session)) {
		return json({ error: 'Não autorizado. Faça login no painel admin.' }, 401);
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return json({ error: 'Requisição inválida: esperado multipart/form-data.' }, 400);
	}

	const file = formData.get('image') ?? formData.get('file');
	if (!(file instanceof File) || !file.name) {
		return json({ error: 'Nenhum arquivo no campo "image" (ou "file").' }, 400);
	}

	const slugField = formData.get('slug');
	const titleField = formData.get('title');
	let slugHint = '';
	if (typeof slugField === 'string' && slugField.trim()) slugHint = slugField.trim();
	else if (typeof titleField === 'string' && titleField.trim()) slugHint = titleField.trim();

	const mime = file.type.trim().toLowerCase();
	const mimeTrusted = ALLOWED_TYPES.has(mime);
	const mimeFallback = TRY_DECODE_ANYWAY.has(mime);
	if (!mimeTrusted && !mimeFallback) {
		return json(
			{
				error: mime
					? `Tipo não permitido: ${mime}. Envie JPEG, PNG, WebP ou GIF (o servidor grava sempre como WebP).`
					: 'Tipo de arquivo inválido. Envie JPEG, PNG, WebP ou GIF.',
			},
			415,
		);
	}

	if (file.size > MAX_SIZE_BYTES) {
		return json({ error: 'Arquivo muito grande. Limite: 10 MB.' }, 413);
	}

	const uploadDir = join(process.cwd(), 'public', 'uploads');
	let inputBuffer: Buffer;
	try {
		inputBuffer = Buffer.from(await file.arrayBuffer());
	} catch {
		return json({ error: 'Não foi possível ler o arquivo enviado.' }, 400);
	}

	let webpBuffer: Buffer;
	try {
		webpBuffer = await sharp(inputBuffer)
			.rotate()
			.resize({
				width:              MAX_WIDTH,
				fit:                'inside',
				withoutEnlargement: true,
			})
			.webp({ quality: WEBP_QUALITY, effort: 4 })
			.toBuffer();
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return json({ error: `Falha ao processar imagem: ${msg}` }, 422);
	}

	const slugBase = slugHint ? slugify(slugHint) : 'upload';
	let safeName   = `${slugBase}-${Date.now()}.webp`;
	let destPath   = join(uploadDir, safeName);

	try {
		await mkdir(uploadDir, { recursive: true });
		let n = 0;
		while (await fileExists(destPath)) {
			n++;
			safeName = `${slugBase}-${Date.now()}-${n}.webp`;
			destPath = join(uploadDir, safeName);
		}
		await writeFile(destPath, webpBuffer);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return json({ error: `Falha ao gravar arquivo: ${msg}` }, 500);
	}

	const publicUrl = `/uploads/${safeName}`;
	return json({
		url: publicUrl,
		filename: safeName,
		size: webpBuffer.length,
	});
};
