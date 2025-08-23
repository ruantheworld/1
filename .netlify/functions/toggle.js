const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.NETLIFY_DATABASE_URL || 
    "postgresql://neondb_owner:npg_bEYZ0L2aUsjX@ep-dry-sea-aekp8ido-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
});
client.connect();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { form } = JSON.parse(event.body);

    const res = await client.query("SELECT active, page FROM forms WHERE key = $1", [form]);
    if (res.rows.length === 0) return { statusCode: 404, body: "Formulário não encontrado" };

    const newStatus = !res.rows[0].active;
    await client.query("UPDATE forms SET active = $1 WHERE key = $2", [newStatus, form]);

    return { statusCode: 200, body: JSON.stringify({ active: newStatus, page: res.rows[0].page }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Erro ao alternar formulário" };
  }
};