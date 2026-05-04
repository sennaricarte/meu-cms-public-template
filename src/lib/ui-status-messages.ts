export const uiStatusMessages = {
	confirm: {
		deleteTag: (name: string) => `Eliminar a tag «${name}»? Esta ação não pode ser desfeita.`,
		deleteCategory: 'Eliminar este item permanentemente?',
		deleteMediaFile: (name: string) => `Excluir o ficheiro "${name}"? Esta ação não pode ser desfeita.`,
		deletePost: (title: string, filename: string) =>
			`Eliminar permanentemente o artigo "${title}"?\n\nO ficheiro ${filename} será apagado do disco.`,
	},
	loading: {
		saving: 'A salvar...',
		loadingImages: 'A carregar...',
		deleting: 'A excluir...',
		importing: 'Importação em andamento...',
		validatingAndImporting: 'A validar e importar...',
	},
	success: {
		saved: 'Salvo com sucesso.',
		seoSaved: 'SEO salvo com sucesso.',
		articleSaved: (filename: string) => `Artigo salvo com sucesso: ${filename}`,
		pageSaved: (relativePath: string) => `Página salva com sucesso: ${relativePath}`,
		menuSaved: (menu: 'main' | 'footer') =>
			menu === 'main'
				? 'Menu principal salvo com sucesso.'
				: 'Menu de rodapé salvo com sucesso.',
		tagCreated: 'Tag criada.',
		tagUpdated: 'Tag atualizada.',
		tagRemoved: (name: string) => `Tag «${name}» removida.`,
		categoryAdded: 'Categoria adicionada.',
		categoryRemoved: 'Categoria removida.',
	},
	error: {
		loadImages: 'Não foi possível carregar as imagens.',
		upload: 'Não foi possível concluir o upload.',
		saveArticle: 'Não foi possível salvar o artigo.',
		saveGeneric: 'Não foi possível salvar. Verifique a conexão e tente novamente.',
		unexpected: 'Ocorreu um erro inesperado.',
		duplicateTagSlug: 'Já existe uma tag com este slug.',
		duplicateOtherTagSlug: 'Já existe outra tag com este slug.',
		duplicateCategorySlug: 'Já existe uma categoria com este slug.',
		categoryNotFound: 'Item não encontrado.',
		invalidXmlFile: 'Selecione um arquivo .xml válido para continuar.',
		invalidJsonFile: 'Selecione um arquivo .json válido.',
	},
	import: {
		xmlStartRead: '⏳ Lendo XML e preparando importação...',
		xmlStartProcess: '⏳ Baixando imagens e convertendo conteúdo para Markdown...',
		jsonStartValidate: '⏳ A validar pacote JSON (Zod)...',
		jsonStartProcess: '⏳ A processar imagens e gravar artigos...',
		downloadedImages: (count: number) => `🖼️ Imagens baixadas: ${count}.`,
		importedPost: (title: string) => `✅ Importado: ${title || 'Post sem título'}`,
		skippedDuplicate: (slug: string) => `⚠️ Duplicado ignorado: ${slug || 'slug desconhecido'}`,
		importFailed: (reason: string) => `❌ Falha ao importar post: ${reason}`,
		importFailedEntry: (idx: string, reason: string) => `❌ Entrada ${idx || '?'}: ${reason}`,
		xmlFinished: (importedCount: number, skippedCount: number, failedCount: number) =>
			`📄 Importação finalizada: ${importedCount} importados, ${skippedCount} duplicados, ${failedCount} falhas.`,
		jsonFinished: (importedCount: number, skippedCount: number, failedCount: number) =>
			`📄 JSON: ${importedCount} importados, ${skippedCount} duplicados, ${failedCount} falhas.`,
		finishedStatus: (importedCount: number, skippedCount: number, failedCount: number) =>
			`Concluído: ${importedCount} importado(s), ${skippedCount} duplicado(s), ${failedCount} falha(s).`,
		logError: (message: string) => `❌ ${message}`,
	},
	empty: {
		noResults: 'Nenhum resultado para a pesquisa.',
		noItems: 'Nenhum item disponível no momento.',
		noImages: 'Nenhuma imagem disponível no momento.',
		noCategories: 'Nenhuma categoria disponível no momento.',
		noTags: 'Nenhuma tag disponível no momento.',
		noFileSelected: 'Nenhum arquivo selecionado',
	},
} as const;
