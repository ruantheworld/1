const { neon } = require('@netlify/neon');
const fetch = require('node-fetch');
const FormData = require('form-data');

const sql = neon();

const DISCORD_WEBHOOK_URL = 'https://ptb.discord.com/api/webhooks/1408967069210378364/wR2IgOG8TZmhesyW2zl6T7VB1emIJ0Uz5OPygtCapfcY6PgIkNpP-pFBBkQzO58pnMLU';

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
    const { texto, texto2, texto3, texto4, texto5, texto6, texto7, resposta, conteudo, cargo } = JSON.parse(event.body);

    const finalMessage = `
📋 FORMULÁRIO HOSPITAL

👤 Nome do personagem (IC):
${texto}

🧍 Nome do jogador (OOC):
${texto2}

📅 Idade (IC/OOC):
${texto3}

🩺 Experiência na área médica (IC):
${texto4}

❤️ Por que deseja trabalhar no hospital? (IC):
${texto5}

⭐ Qualidades (IC e OOC):
${texto6}

🧠 RP Anterior: ${resposta.toUpperCase()}
${resposta === 'sim' ? `📝 Conte um pouco sobre:\n${conteudo}` : ''}

💼 Cargo desejado:
${cargo}

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