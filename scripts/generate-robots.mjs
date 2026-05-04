import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const configPath = resolve('src', 'data', 'config.json');
const robotsPath = resolve('public', 'robots.txt');

function normalizeSiteUrl(raw) {
	const t = typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : '';
	if (!t) return 'https://example.com/';
	try {
		new URL(t);
		return `${t}/`;
	} catch {
		return 'https://example.com/';
	}
}

try {
	const raw = await readFile(configPath, 'utf-8');
	const parsed = JSON.parse(raw);
	const siteUrl = normalizeSiteUrl(parsed?.siteUrl);
	const sitemapUrl = new URL('sitemap-index.xml', siteUrl).toString();

	const content = [
		'User-agent: *',
		'Allow: /',
		`Sitemap: ${sitemapUrl}`,
		'',
	].join('\n');

	await mkdir(dirname(robotsPath), { recursive: true });
	await writeFile(robotsPath, content, 'utf-8');
	console.log(`[robots] Gerado em public/robots.txt -> ${sitemapUrl}`);
} catch (error) {
	console.error('[robots] Falha ao gerar public/robots.txt:', error);
	process.exitCode = 1;
}
