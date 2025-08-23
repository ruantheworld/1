// deleteOldForms.js
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_bEYZ0L2aUsjX@ep-dry-sea-aekp8ido-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
});

async function deleteOldForms() {
  try {
    await client.connect();
    console.log('Conectado ao banco Neon.');

    const query = `
      DELETE FROM forms
      WHERE key NOT IN ('hospital', 'mecanica', 'mecanica2', 'restaurante1', 'restaurante2', 'restaurante3');
    `;

    const res = await client.query(query);
    console.log(`Registros deletados: ${res.rowCount}`);

    await client.end();
    console.log('Conexão encerrada.');
  } catch (err) {
    console.error('Erro ao deletar formulários:', err);
  }
}

deleteOldForms();