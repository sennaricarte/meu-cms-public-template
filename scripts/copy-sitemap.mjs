import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const source = resolve('dist', 'client', 'sitemap-index.xml');
const target = resolve('public', 'sitemap-index.xml');

try {
	await mkdir(dirname(target), { recursive: true });
	await copyFile(source, target);
	console.log('[sitemap] Copiado para public/sitemap-index.xml');
} catch (error) {
	console.error('[sitemap] Falha ao copiar sitemap-index.xml para public/:', error);
	process.exitCode = 1;
}
