/**
 * Compara `Astro.url.pathname` com o `href` do menu (rotas internas).
 */

function stripTrailingSlash(p: string): string {
	if (p === '/' || p === '') return '/';
	return p.replace(/\/+$/, '') || '/';
}

/** Caminho normalizado do pedido atual (sem barra final exceto raiz). */
export function normalizeSitePath(pathname: string, baseUrl: string): string {
	let p = pathname;
	const base = (baseUrl ?? '/').replace(/\/?$/, '');
	if (base && base !== '/' && p.startsWith(base)) {
		p = p.slice(base.length) || '/';
	}
	return stripTrailingSlash(p);
}

/** Indica se o item do menu corresponde à página atual (inclui subrotas, exceto na raiz). */
export function isActiveNavLink(pathname: string, href: string, baseUrl: string): boolean {
	const raw = href.trim();
	if (!raw || /^https?:\/\//i.test(raw)) return false;
	const pathOnly = (raw.split('#')[0] ?? '').split('?')[0] ?? '';
	if (!pathOnly.startsWith('/')) return false;

	const current = normalizeSitePath(pathname, baseUrl);
	const target = normalizeSitePath(pathOnly, baseUrl);

	if (target === '/') return current === '/';
	return current === target || current.startsWith(`${target}/`);
}
