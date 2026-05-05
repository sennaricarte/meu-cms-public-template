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
}>;

export function normalizeSiteConfig(config: LegacyConfigInput = {}) {
	return {
		siteName: config.siteName?.trim() || siteConfig.title,
		siteDescription: config.siteDescription?.trim() || siteConfig.description,
		siteUrl: config.siteUrl?.trim() || siteConfig.url,
	};
}
