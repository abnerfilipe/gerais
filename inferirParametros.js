const fs = require('fs');

function inferirParametrosDoJSON() {
    console.log('⏳ Analisando o arquivo dados_estruturados.json...');

    // 1. Carrega o JSON gerado anteriormente
    if (!fs.existsSync('dados_estruturados.json')) {
        console.error('❌ Arquivo dados_estruturados.json não encontrado! Execute o script anterior primeiro.');
        return;
    }
    const dados = JSON.parse(fs.readFileSync('dados_estruturados.json', 'utf-8'));

    // 2. Mapeia e enriquece os dados
    const dadosEnriquecidos = dados.map(item => {
        const sql = item['Clausula SQL'] || '';
        const parametrosDetectados = [];

        // Regex para capturar tudo que está entre < e >
        const regexParametro = /<([^>]+)>/g;
        let match;

        while ((match = regexParametro.exec(sql)) !== null) {
            const nomeParametro = match[1];
            const indiceParametro = match.index;

            // Pega os 40 caracteres anteriores ao parâmetro para entender o contexto técnico
            const contextoAnterior = sql.substring(Math.max(0, indiceParametro - 40), indiceParametro).trim().toUpperCase();

            // Lógica de inferência do formato
            let formatoSugerido = 'Texto / String'; // Formato padrão caso não combine com as regras
            let exemploUso = "'valor'";

            if (contextoAnterior.includes('LIKE')) {
                formatoSugerido = 'Texto (Busca Parcial com % )';
                exemploUso = "'%valor%'";
            } else if (contextoAnterior.includes('MONTH(')) {
                formatoSugerido = 'Número Inteiro (Mês: 1 a 12)';
                exemploUso = '5';
            } else if (contextoAnterior.includes('YEAR(')) {
                formatoSugerido = 'Número Inteiro (Ano)';
                exemploUso = '2026';
            } else if (nomeParametro.toLowerCase().includes('data') || nomeParametro.toLowerCase().includes('dt') || contextoAnterior.includes('BETWEEN')) {
                formatoSugerido = 'Data / Date';
                exemploUso = "'2026-06-18'";
            } else if (contextoAnterior.includes('=') || contextoAnterior.includes('>') || contextoAnterior.includes('<')) {
                // Se o campo antes do igual parecer numérico
                if (contextoAnterior.includes('COD_') || contextoAnterior.includes('CODIGO') || contextoAnterior.includes('NUMERO')) {
                    formatoSugerido = 'Número Inteiro / ID';
                    exemploUso = '123';
                }
            }

            // Evita duplicar o mesmo parâmetro se ele aparecer duas vezes no mesmo SQL
            if (!parametrosDetectados.some(p => p.nome === nomeParametro)) {
                parametrosDetectados.push({
                    nome: nomeParametro,
                    formato_provavel: formatoSugerido,
                    exemplo: exemploUso
                });
            }
        }

        // Adiciona a nova propriedade ao objeto do JSON
        return {
            ...item,
            "Parâmetros Requeridos": parametrosDetectados
        };
    });

    // 3. Salva o novo arquivo enriquecido
    const outputFile = 'dados_com_parametros.json';
    fs.writeFileSync(outputFile, JSON.stringify(dadosEnriquecidos, null, 4), 'utf-8');

    console.log(`✅ Concluído! O arquivo foi enriquecido com as assinaturas de parâmetros.`);
    console.log(`📁 Novo arquivo salvo como: ${outputFile}`);
}

inferirParametrosDoJSON();