const { neon } = require('@netlify/neon');
const fetch = require('node-fetch');
const FormData = require('form-data');

const sql = neon();

const DISCORD_WEBHOOK_URL = 'https://ptb.discord.com/api/webhooks/1408968016233758780/z3fYkq1yaPUAE3yDNTY47eFnOdUcD4cbiPneRds49EBrJdOWuZbwOi4E-xsq822fvz_-';

async function enviarArquivoParaDiscord(conteudo, nomeDoArquivo = 'mensagem.txt') {
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
      texto, texto2, texto3, texto4, texto5, texto6, texto7,
      experienciaRP, textoRP,
      experienciaFaccao, textoFaccao,
      crescimento, cargo,
      carta
    } = JSON.parse(event.body);

    const finalMessage = `
📋 FORMULÁRIO - MECÂNICA

👤 Nome do personagem (IC): ${texto || 'Não informado'}
🕒 Disponibilidade: ${texto2 || 'Não informado'}
📅 Idade (OOC): ${texto3 || 'Não informado'}

🔧 Já trabalhou como mecânico: ${texto4 ? texto4.toUpperCase() : 'Não informado'}
${texto4 === 'sim' ? `📝 Detalhes: ${texto5 || 'Não informado'}` : ''}

🧠 Conhecimento sobre tuning: ${texto6 || 'Não informado'}

📜 Situação no RP: ${texto7 || 'Não informado'}

🧪 Experiência anterior em servidor RP: ${experienciaRP ? experienciaRP.toUpperCase() : 'Não informado'}
${experienciaRP === 'sim' ? `📝 Detalhes: ${textoRP || 'Não informado'}` : ''}

🏴 Participa/participou de facção: ${experienciaFaccao ? experienciaFaccao.toUpperCase() : 'Não informado'}
${experienciaFaccao === 'sim' ? `🏷️ Qual: ${textoFaccao || 'Não informado'}` : ''}

📈 Interesse em crescer: ${crescimento || 'Não informado'}
💼 Cargo desejado: ${cargo || 'Não informado'}

💌 Carta de apresentação:
${carta || 'Não informado'}

-----------------------------
`;

    await sql`INSERT INTO mensagens (texto) VALUES (${finalMessage})`;

    const responseDiscord = await enviarArquivoParaDiscord(finalMessage, 'formulario-mecanica.txt');

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