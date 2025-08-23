const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.NETLIFY_DATABASE_URL || 
    "postgresql://neondb_owner:npg_bEYZ0L2aUsjX@ep-dry-sea-aekp8ido-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
});
client.connect();

exports.handler = async () => {
  try {
    const res = await client.query("SELECT key, name, active, page FROM forms ORDER BY id");
    return { statusCode: 200, body: JSON.stringify(res.rows) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Erro ao buscar formulários" };
  }
};