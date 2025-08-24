const { neon } = require('@netlify/neon');
const fetch = require('node-fetch');
const FormData = require('form-data');

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const DISCORD_WEBHOOK_URL = 'https://ptb.discord.com/api/webhooks/1408968225395576913/zQo3FOYpmumnseS2Mgv1ns2GsAdncAuNBPJsbXqe7sM3qBc_cfKAITOr7cfsqp0XUO5t';

async function enviarArquivoParaDiscord(conteudo, nomeDoArquivo = 'formulario-restaurante.txt') {
  const form = new FormData();
  const buffer = Buffer.from(conteudo, 'utf8');
  form.append('file', buffer, { filename: nomeDoArquivo, contentType: 'text/plain' });

  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    body: form,
  });

  return response;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      nomePersonagem,
      disponibilidadeHorario,
      idadeIRL,
      trabalhaOutroLugar,
      detalhesTrabalho,
      trabalhouRestaurante,
      detalhesRestaurante,
      diferencial,
      imersaoRoleplay,
      conhecimento,
      cargo
    } = JSON.parse(event.body);

    const finalMessage = `
📋 FORMULÁRIO RESTAURANTE

👤 Nome do personagem (IC): ${nomePersonagem || 'Não informado'}
🕒 Disponibilidade de horário: ${disponibilidadeHorario || 'Não informado'}
📅 Idade (IRL): ${idadeIRL || 'Não informado'}

💼 Trabalha atualmente em outro lugar? ${trabalhaOutroLugar ? trabalhaOutroLugar.toUpperCase() : 'Não informado'}
${trabalhaOutroLugar === 'sim' ? `📝 Detalhes: ${detalhesTrabalho || 'Não informado'}` : ''}

🍽️ Já trabalhou em restaurante/cafeteria/lanchonete no RP? ${trabalhouRestaurante ? trabalhouRestaurante.toUpperCase() : 'Não informado'}
${trabalhouRestaurante === 'sim' ? `📝 Detalhes: ${detalhesRestaurante || 'Não informado'}` : ''}

🌟 Diferencial para o restaurante: ${diferencial || 'Não informado'}
🎭 Nota e motivo da imersão no roleplay: ${imersaoRoleplay || 'Não informado'}

🤹 Conhecimento/interação com público: ${conhecimento || 'Não informado'}

💼 Cargo desejado: ${cargo || 'Não informado'}

-----------------------------
`;

    await sql`INSERT INTO mensagens (texto) VALUES (${finalMessage})`;

    const responseDiscord = await enviarArquivoParaDiscord(finalMessage);

    if (!responseDiscord.ok) {
      return {
        statusCode: 500,
        body: 'Erro ao enviar para o Discord',
      };
    }

    await sql`DELETE FROM mensagens`;

    return {
      statusCode: 200,
      body: 'OK',
    };
  } catch (error) {
    console.error('Erro na função enviar:', error);
    return {
      statusCode: 500,
      body: 'Erro no servidor',
    };
  }
};
