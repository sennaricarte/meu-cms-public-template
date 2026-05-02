/**
 * Em HTML do editor: marca links externos com rel="nofollow sponsored"
 * (Google — links patrocinados/afiliados).
 */

function mergeRel(existing: string | undefined, add: string[]): string {
	const set = new Set<string>();
	for (const t of (existing ?? '').split(/\s+/)) {
		const x = t.trim().toLowerCase();
		if (x) set.add(x);
	}
	for (const t of add) set.add(t.toLowerCase());
	return [...set].sort().join(' ');
}

export function applyAffiliateRelToExternalLinks(html: string, siteBaseUrl: string): string {
	let origin: URL;
	try {
		origin = new URL(siteBaseUrl);
	} catch {
		return html;
	}
	const siteHost = origin.hostname;

	return html.replace(/<a\b([^>]*)>/gi, (_full, attrs: string) => {
		const hrefMatch = /\bhref\s*=\s*(["'])((?:(?!\1).)*)\1/i.exec(attrs);
		if (!hrefMatch) return `<a${attrs}>`;

		const href = hrefMatch[2].trim();
		if (!href || href.startsWith('#')) return `<a${attrs}>`;

		let resolved: URL;
		try {
			resolved = new URL(href, origin);
		} catch {
			return `<a${attrs}>`;
		}

		const proto = resolved.protocol.toLowerCase();
		if (proto === 'mailto:' || proto === 'tel:' || proto === 'javascript:') {
			return `<a${attrs}>`;
		}

		if (resolved.hostname === siteHost) return `<a${attrs}>`;

		const relMatch = /\brel\s*=\s*(["'])((?:(?!\1).)*)\1/i.exec(attrs);
		const merged = mergeRel(relMatch?.[2], ['nofollow', 'sponsored']);

		if (relMatch) {
			const newAttrs = attrs.replace(relMatch[0], `rel="${merged}"`);
			return `<a${newAttrs}>`;
		}

		return `<a${attrs} rel="${merged}">`;
	});
}
