type SiteConfig = {
	title: string;
	description: string;
	url: string;
};

export const siteConfig: SiteConfig = {
	title: 'Blogonauta',
	description: 'Seu portal de conteudo',
	url: 'https://seudominio.com.br',
};

type LegacyConfigInput = Partial<{
	siteName: string;
	siteDescription: string;
	siteUrl: string;
	logoPath: string;
	faviconPath: string;
}>;

export function normalizeSiteConfig(config: LegacyConfigInput = {}) {
	return {
		siteName: config.siteName?.trim() || siteConfig.title,
		siteDescription: config.siteDescription?.trim() || siteConfig.description,
		siteUrl: config.siteUrl?.trim() || siteConfig.url,
		logoPath: config.logoPath?.trim() || '/favicon.svg',
		faviconPath: config.faviconPath?.trim() || '/favicon.svg',
	};
}

export async function readSiteConfig() {
	try {
		const { readFile } = await import('node:fs/promises');
		const { join } = await import('node:path');
		const raw = await readFile(join(process.cwd(), 'src', 'data', 'config.json'), 'utf8');
		const parsed = JSON.parse(raw) as LegacyConfigInput;
		return normalizeSiteConfig(parsed);
	} catch {
		return normalizeSiteConfig();
	}
}
