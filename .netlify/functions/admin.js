const { neon } = require("@netlify/neon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sql = neon();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // coloque no Netlify Environment Variables

// --- Função para garantir que as tabelas existem ---
async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS formularios_status (
      nome VARCHAR(50) PRIMARY KEY,
      ativo BOOLEAN NOT NULL DEFAULT true
    )
  `;
}

exports.handler = async (event) => {
  try {
    const { httpMethod, path } = event;

    // Garante que as tabelas existem antes de qualquer operação
    await ensureTables();

    if (httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body);

    // --- LOGIN ADMIN ---
    if (path.includes("login")) {
      const { username, password } = body;

      const rows = await sql`
        SELECT id, username, password_hash FROM admins WHERE username = ${username}
      `;

      if (rows.length === 0) {
        return { statusCode: 401, body: "Usuário não encontrado" };
      }

      const admin = rows[0];
      const valid = await bcrypt.compare(password, admin.password_hash);

      if (!valid) {
        return { statusCode: 401, body: "Senha incorreta" };
      }

      // Cria JWT válido por 1 hora
      const token = jwt.sign(
        { userId: admin.id, username: admin.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ token }),
      };
    }

    // --- VERIFICAÇÃO DE TOKEN ---
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return { statusCode: 401, body: "Token não fornecido" };
    }

    let decoded;
    try {
      decoded = jwt.verify(authHeader.replace("Bearer ", ""), JWT_SECRET);
    } catch (err) {
      return { statusCode: 401, body: "Token inválido ou expirado" };
    }

    // --- TOGGLE FORM STATUS ---
    if (path.includes("toggle")) {
      const { formName, ativo } = body;

      await sql`
        INSERT INTO formularios_status (nome, ativo)
        VALUES (${formName}, ${ativo})
        ON CONFLICT (nome) DO UPDATE SET ativo = ${ativo}
      `;

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, formName, ativo }),
      };
    }

    // --- GET FORM STATUS ---
    if (path.includes("status")) {
      const rows = await sql`SELECT nome, ativo FROM formularios_status`;

      return {
        statusCode: 200,
        body: JSON.stringify(rows),
      };
    }

    return { statusCode: 404, body: "Rota não encontrada" };
  } catch (err) {
    console.error("Erro no handler admin:", err);
    return { statusCode: 500, body: "Erro interno no servidor" };
  }
};