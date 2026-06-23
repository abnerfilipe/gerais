const fs = require('fs');

// Função auxiliar para criar um intervalo de tempo (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sincronizarParametros() {
    console.log('⏳ Iniciando sincronização segura com a API (1 segundo por requisição)...');

    // 1. Carrega os dados do JSON original
    const inputFile = 'dados_estruturados.json'; // Ou o nome do arquivo que você gerou antes
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Arquivo ${inputFile} não encontrado!`);
        return;
    }
    const dados = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    const dadosCompletos = [];

    // 2. Configurações fixas da API (fornecidas por você)
    const url = 'http://api-uau.city-solucoes.com/api/v1/RotinasGerais/ConsultarParamConsultaGeral';
    const headers = {
        'Authorization': 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..hD2TptLRQZaKLD9mjdkiVA.UFR9gM20bB2wYZALIyNIe3mOSeL_rG8ajSxoC96GFyPFRTvf2DQgD8kubny_oTTzvGhlWY4Yuhv9rTNd8i1LHYwfM3J_8N4c8e2-p7_H6QJl8Y4BffIiR9BnBPsep-4CE6oq5_NzrZqQn-M6wiDwAx87pRJJs1FcadkRKiQeFDVm4PzCE7f0iEjPWxkzGEfAiHTB_rsS5PJ7XG59QY_uoP1mkCFtJsLvU2HfN_5D-IaTKgOS23oznLGhw97om9lhrD_u6hAOCXqpUSfCfPcGlNgnjaNh8daU_mJnOP_-nBU.vajZcjLRqGxZr7JlkZWxXw',
        'Content-Type': 'application/json',
        'X-INTEGRATION-Authorization': 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..oplu1kyXbKdPPQQP-flVkg.NyfLDB4sPc0IoY8nqkEaUF3g1-MBaCOiHm_D_lzdJnV7d3v1h4zOS2pE4qTXx-ZlgWwb-799zy9lePT77UJHvcT8PBgz-ya6vHgwjuPfXUgxmRNrXFdWTqp0uHKFNUVdm_REHSow_9NHaxcFajvMRRelAGxbrzxJQ9cZBwpoHYM.f6Lopzdf0xQKxLgM-K_uyw'
    };

    // 3. Loop sequencial (for...of) para garantir que uma chamada espere a outra
    for (let i = 0; i < dados.length; i++) {
        const item = dados[i];
        
        // Extrai o ID da coluna 'Código' do JSON
        const idConsulta = parseInt(item['Código'], 10);
        
        // Infere o campo 'Personalizado' lendo o primeiro número da coluna Origem 
        // Ex: "0 - UAU!" vira 0, "1 - Personalizado" vira 1
        let personalizado = 0;
        if (item['Origem']) {
            const origemNum = parseInt(item['Origem'], 10);
            if (!isNaN(origemNum)) personalizado = origemNum;
        }

        console.log(`🔎 [${i + 1}/${dados.length}] Buscando parâmetros da Consulta ID: ${idConsulta}...`);

        try {
            // Dispara a requisição para a API
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    Id: idConsulta,
                    Personalizado: personalizado
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            // Converte o retorno para JSON (que é o array de parâmetros)
            const parametrosArray = await response.json();
            
            // Adiciona o array exato retornado pela API dentro do item do seu JSON
            item['ParametrosAPI'] = parametrosArray;

        } catch (error) {
            console.error(`⚠️ Falha ao buscar ID ${idConsulta}: ${error.message}`);
            // Em caso de falha (API fora do ar, timeout), salva um array vazio para não quebrar o layout depois
            item['ParametrosAPI'] = [];
        }

        // Adiciona o item processado à nova lista
        dadosCompletos.push(item);

        // 🛑 O SEGREDO ANTI-BLOQUEIO: Pausa a execução por 1000 milissegundos (1 segundo)
        await delay(1000); 
    }

    // 4. Salva o resultado final em um novo arquivo JSON
    const outputFile = 'dados_com_parametros_api.json';
    fs.writeFileSync(outputFile, JSON.stringify(dadosCompletos, null, 4), 'utf-8');

    console.log(`\n✅ Sucesso! Todas as consultas foram mapeadas sem sobrecarregar a API.`);
    console.log(`📁 Arquivo final gerado: ${outputFile}`);
}

// Executa a função
sincronizarParametros();