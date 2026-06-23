const fs = require('fs');

function gerarBaseDeTreinamentoIA() {
    console.log('⏳ A processar base de treinamento de SQL para o NotebookLM...');

    const inputFile = 'dados_com_parametros_api.json';
    const outputFile = 'Treinamento_SQL_UAU.txt';

    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Ficheiro ${inputFile} não encontrado!`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    // Contexto de Sistema: Instruções invisíveis que ajudam a IA a entender o que ela está lendo
    let txtContent = "DOCUMENTAÇÃO DE TREINAMENTO: ESTRUTURA DE BANCO DE DADOS E CONSULTAS API\n";
    txtContent += "Objetivo: Fornecer contexto sobre tabelas, joins e parâmetros para geração autônoma de SQL.\n";
    txtContent += "Regra de Parâmetros: Variáveis de entrada no SQL estão marcadas com chaves duplas, ex: {{Parametro}}.\n";
    txtContent += "=================================================================================================\n\n";

    const groupedData = data.reduce((acc, item) => {
        const pasta = item['Pasta'] || 'Geral';
        if (!acc[pasta]) acc[pasta] = [];
        acc[pasta].push(item);
        return acc;
    }, {});

    for (const [pasta, items] of Object.entries(groupedData)) {
        txtContent += `[MÓDULO DE NEGÓCIO: ${pasta.toUpperCase()}]\n\n`;

        items.forEach(item => {
            txtContent += `CONSULTA ID: ${item['Código']}\n`;
            txtContent += `DESCRIÇÃO: ${item['Descrição']}\n`;
            
            const params = item['ParametrosAPI'];
            if (Array.isArray(params) && params.length > 0) {
                txtContent += `PARÂMETROS DE ENTRADA:\n`;
                params.forEach(p => {
                    txtContent += ` - {{${p.Parametro}}} | Tipo: ${p.Tipo} | Descrição: ${p.Descricao}\n`;
                });
            } else {
                txtContent += `PARÂMETROS DE ENTRADA: Nenhum\n`;
            }

            // Sanitização crítica do SQL
            let sqlRaw = item['Clausula SQL'] || '';
            // Substitui <Parametro> por {{Parametro}} para não quebrar o parser do NotebookLM
            let sqlSanitizado = sqlRaw.replace(/</g, '{{').replace(/>/g, '}}');
            
            // Remove quebras de linha excessivas para economizar tokens
            sqlSanitizado = sqlSanitizado.replace(/\n\s*\n/g, '\n').trim();

            txtContent += `\nSCRIPT SQL:\n`;
            txtContent += `${sqlSanitizado}\n`;
            txtContent += `-------------------------------------------------------------------------------------------------\n\n`;
        });
    }

    fs.writeFileSync(outputFile, txtContent, 'utf-8');

    console.log(`✅ Sucesso! O arquivo TXT higienizado foi criado.`);
    console.log(`📁 Ficheiro salvo como: ${outputFile}`);
}

gerarBaseDeTreinamentoIA();