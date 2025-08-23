const { neon } = require('@netlify/neon');

const sql = neon("postgresql://neondb_owner:npg_bEYZ0L2aUsjX@ep-dry-sea-aekp8ido-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require");

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // --- Cria tabela forms se não existir ---
    await sql`
      CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        page VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT TRUE
      );
    `;

    // --- Formulários fixos que devem aparecer no painel ---
    const formsFixos = [
      { key: 'hospital', name: 'Hospital', page: 'index.html' },
      { key: 'mecanica', name: 'Mecânica', page: 'mecanica.html' },
      { key: 'mecanica2', name: 'Mecânica 2', page: 'mecanica2.html' },
      { key: 'restaurante1', name: 'Restaurante 1', page: 'restaurante.html' },
      { key: 'restaurante2', name: 'Restaurante 2', page: 'restaurante2.html' },
      { key: 'restaurante3', name: 'Restaurante 3', page: 'restaurante3.html' }
    ];

    // --- Insere os formulários fixos se ainda não existirem ---
    for (const f of formsFixos) {
      await sql`
        INSERT INTO forms (key, name, page)
        VALUES (${f.key}, ${f.name}, ${f.page})
        ON CONFLICT (key) DO NOTHING;
      `;
    }

    // --- Retorna todos os formulários para o painel ---
    const result = await sql`SELECT * FROM forms ORDER BY id ASC;`;
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Erro init.js:', error);
    return {
      statusCode: 500,
      body: 'Erro no servidor',
    };
  }
};