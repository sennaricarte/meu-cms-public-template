import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

export async function listBlogFilenames(): Promise<string[]> {
	try {
		const entries = await readdir(BLOG_DIR, { withFileTypes: true });
		return entries
			.filter((e) => e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.mdx')))
			.map((e) => e.name)
			.sort();
	} catch {
		return [];
	}
}

export function stripMarkdownExt(name: string) {
	if (name.endsWith('.mdx')) return name.slice(0, -4);
	if (name.endsWith('.md')) return name.slice(0, -3);
	return name;
}
