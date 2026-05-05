import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type MediaMetadata = {
	alt?: string;
	title?: string;
	caption?: string;
	description?: string;
};

export type MediaMetadataMap = Record<string, MediaMetadata>;

const METADATA_FILE = join(process.cwd(), 'src', 'data', 'media-metadata.json');

/**
 * Lê o mapa de metadados de mídia.
 * Em caso de erro de leitura/parse, devolve objeto vazio para não quebrar o painel.
 */
export async function readMediaMetadataMap(): Promise<MediaMetadataMap> {
	try {
		const raw = await readFile(METADATA_FILE, 'utf8');
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return {};
		}
		return parsed as MediaMetadataMap;
	} catch {
		return {};
	}
}
