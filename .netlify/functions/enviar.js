import { neon } from '@netlify/neon';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs/promises';  // Use promises do fs pra async/await

const sql = neon(); // Usa process.env.NETLIFY_DATABASE_URL automaticamente

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1403137852790935676/nAWt2OkDHP-5LrOErvPNR2FcIeIzezu1FRABLHaKhY92VlUOJgkrCfHTq4EVL2kNPYRF';

async function enviarArquivoParaDiscord(conteudo, nomeDoArquivo = 'mensagem.txt') {
  const form = new FormData();

  await fs.writeFile(nomeDoArquivo, conteudo, 'utf8');
  form.append('file', fs.createReadStream(nomeDoArquivo));

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      body: form,
    });
    return response;
  } finally {
    await fs.unlink(nomeDoArquivo);
  }
}

export async function handler(event) {
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
}