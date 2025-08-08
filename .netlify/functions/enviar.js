const { neon } = require('@netlify/neon');
const fetch = require('node-fetch');
const FormData = require('form-data');

const sql = neon();

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1403137852790935676/nAWt2OkDHP-5LrOErvPNR2FcIeIzezu1FRABLHaKhY92VlUOJgkrCfHTq4EVL2kNPYRF';

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
    const { texto, texto2, texto3 } = JSON.parse(event.body);

    const finalMessage = `Caixa1: \n${texto} \n\nCaixa2: \n${texto2} \n\nCaixa3: \n${texto3}`;

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