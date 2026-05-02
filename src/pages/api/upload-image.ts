/**
 * POST /api/upload-image
 * Recebe imagem via multipart/form-data (campo `image`), processa com Sharp:
 * redimensiona (máx. 1200px de largura, proporcional), converte para WebP,
 * grava em public/uploads/ com nome único (slug opcional + timestamp).
 *
 * Campos opcionais no FormData:
 *   - title — texto para gerar slug no nome do arquivo (ex.: título do post).
 *
 * Resposta JSON: { url, path, filename } — url/path são iguais (/uploads/...webp).
 *
 * Tipos aceites: MIME image/jpeg, image/png, image/webp apenas.
 * Requer cookie `admin_session` presente e válido (401 antes de ler o body).
 * Escrita em disco não está disponível no filesystem somente leitura da Vercel em produção.
 */

import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '../../lib/admin-session';

export const prerender = false;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_WIDTH      = 1200;

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/** Slug seguro para nome de arquivo (ASCII, hífens). */
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

	const file = formData.get('image');
	if (!(file instanceof File) || !file.name) {
		return json({ error: 'Nenhum arquivo enviado no campo "image".' }, 400);
	}

	const titleField = formData.get('title');
	const titleHint =
		typeof titleField === 'string' && titleField.trim().length > 0 ? titleField.trim() : '';

	const mime = file.type.trim().toLowerCase();
	if (!mime || !ALLOWED_TYPES.has(mime)) {
		return json(
			{
				error: mime
					? `Tipo não permitido: ${mime}. Envie apenas JPEG, PNG ou WebP.`
					: 'Tipo de arquivo ausente ou inválido. Envie apenas JPEG, PNG ou WebP.',
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
			.rotate() // respeita EXIF orientation
			.resize({
				width:               MAX_WIDTH,
				fit:                 'inside',
				withoutEnlargement:  true,
			})
			.webp({ quality: 82, effort: 4 })
			.toBuffer();
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return json({ error: `Falha ao processar imagem: ${msg}` }, 422);
	}

	const slugBase = titleHint ? slugify(titleHint) : 'upload';
	let safeName   = `${slugBase}-${Date.now()}.webp`;
	let destPath   = join(uploadDir, safeName);

	try {
		await mkdir(uploadDir, { recursive: true });
		// Colisão improvável; em caso de race, tenta sufixo extra
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
		url:      publicUrl,
		path:     publicUrl,
		filename: safeName,
	});
};
