const fs = require('fs');

function jsonParaMarkdown() {
    console.log('⏳ A processar o ficheiro JSON para Markdown...');

    const inputFile = 'dados_com_parametros_api.json';
    const outputFile = 'Dicionario_Consultas_UAU.md';

    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Ficheiro ${inputFile} não encontrado!`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    // Cabeçalho Principal do Arquivo (A IA lê isso para entender o contexto geral do documento)
    let mdContent = '# Dicionário de Consultas da API UAU\n\n';
    mdContent += '> Documentação técnica gerada contendo as cláusulas SQL, parâmetros exigidos e descrições das rotinas do sistema.\n\n';

    // 1. Agrupar os dados por "Pasta" (IAs entendem melhor quando os assuntos estão aglomerados por categorias)
    const groupedData = data.reduce((acc, item) => {
        const pasta = item['Pasta'] || 'Geral';
        if (!acc[pasta]) acc[pasta] = [];
        acc[pasta].push(item);
        return acc;
    }, {});

    // 2. Percorrer as pastas e gerar a hierarquia
    for (const [pasta, items] of Object.entries(groupedData)) {
        mdContent += `## Pasta: ${pasta}\n\n`;

        items.forEach(item => {
            // Título 3 para a consulta específica (Facilita a busca semântica do NotebookLM)
            mdContent += `### Consulta [${item['Código']}] - ${item['Descrição']}\n\n`;
            
            // Metadados em formato de lista (Melhor do que tabela para o NotebookLM absorver propriedades)
            mdContent += `- **ID / Código:** ${item['Código']}\n`;
            mdContent += `- **Origem:** ${item['Origem']}\n`;
            mdContent += `- **Status:** ${item['Status']}\n`;
            mdContent += `- **Criado por:** ${item['Usr. Cadastrou']} (em ${item['Dt. Cadastro']})\n\n`;

            // Tratamento do Array de Parâmetros (Elimina o problema do [object Object])
            mdContent += `#### Parâmetros Requeridos\n`;
            const params = item['ParametrosAPI'];
            if (Array.isArray(params) && params.length > 0) {
                params.forEach(p => {
                    // Formata de um jeito muito fácil para a IA ler: `<Parametro>` (Tipo): Descrição
                    mdContent += `- \`<${p.Parametro}>\` **(${p.Tipo})**: ${p.Descricao} *(Origem do dado: ${p.OrigemDados})*\n`;
                });
            } else {
                mdContent += `*Nenhum parâmetro externo necessário para esta consulta.*\n`;
            }
            mdContent += `\n`;

            // Tratamento da Cláusula SQL (Colocado em um Code Block específico de SQL)
            mdContent += `#### Cláusula SQL\n`;
            mdContent += "```sql\n";
            // Remove espaços em branco excessivos no final
            mdContent += (item['Clausula SQL'] || '').trim() + "\n";
            mdContent += "```\n\n";

            // Linha divisória para separar visualmente e contextualmente cada consulta
            mdContent += `---\n\n`;
        });
    }

    // 3. Salvar o arquivo Markdown
    fs.writeFileSync(outputFile, mdContent, 'utf-8');

    console.log(`✅ Sucesso! O arquivo Markdown foi otimizado para o NotebookLM.`);
    console.log(`📁 Ficheiro salvo como: ${outputFile}`);
}

jsonParaMarkdown();