const fs = require('fs');
const cheerio = require('cheerio');

function converterTabelaParaJSON() {
    console.log('⏳ Lendo o arquivo HTML e estruturando os dados...');
    
    const html = fs.readFileSync('consultasUAU.html', 'utf-8');
    const $ = cheerio.load(html);
    
    const jsonData = [];

    // 1. Definimos as chaves exatas que você precisa
    const headers = [
        "Pasta",
        "Código",
        "Descrição",
        "Clausula SQL",
        "Origem",
        "Status",
        "Usr. Cadastrou",
        "Dt. Cadastro"
    ];

    // 2. Percorre todas as linhas da tabela
    $('table tr').each((rowIndex, rowElement) => {
        const columns = $(rowElement).find('td, th'); // Busca td ou th

        // Pega o texto da linha inteira para verificação
        const rowText = $(rowElement).text();
        
        // Se a linha contiver a palavra "Pasta" e "Código", é o cabeçalho! Ignoramos.
        if (rowText.includes("Pasta") && rowText.includes("Código")) {
            return; 
        }

        // Se a linha tiver dados
        if (columns.length > 0) {
            const rowData = {};
            
            columns.each((colIndex, colElement) => {
                // Garante que não vai tentar pegar mais colunas do que os headers que definimos
                if(colIndex < headers.length) {
                    const key = headers[colIndex];
                    let cellText = $(colElement).text().trim();
                    
                    // Limpa múltiplos espaços e quebras de linha sujas
                    cellText = cellText.replace(/\s\s+/g, ' '); 
                    
                    rowData[key] = cellText;
                }
            });
            
            // 3. Regra de segurança: só adiciona no JSON se a linha tiver pelo menos o 'Código' ou 'Pasta' preenchidos
            // Isso evita linhas em branco ou de formatação do HTML antigo
            if (rowData["Código"] || rowData["Pasta"]) {
                jsonData.push(rowData);
            }
        }
    });

    const outputFile = 'dados_estruturados.json';
    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 4), 'utf-8');

    console.log(`✅ Sucesso! Os nomes dos campos foram aplicados corretamente.`);
    console.log(`📁 Arquivo salvo como: ${outputFile}`);
}

converterTabelaParaJSON();