/**
 * Metadados globais do site (home, Header, RSS, etc.).
 * Fonte única: `src/data/config.json` — versionado no primeiro commit para deploy local na conta do cliente.
 */
import configJson from './data/config.json';
import { normalizeSiteConfig } from './lib/site-config';

const site = normalizeSiteConfig(configJson);

export const SITE_TITLE = site.siteName;
export const SITE_DESCRIPTION = site.siteDescription;
/** Origem canónica sem barra final — alinhada ao mesmo `config.json` usado em `astro.config.mjs`. */
export const SITE_URL = site.siteUrl.replace(/\/+$/, '') || 'https://example.com';
