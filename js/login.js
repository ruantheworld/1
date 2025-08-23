const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000; // 5 minutos em ms

let attempts = 0;
let blockUntil = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';

  const now = Date.now();

  // Verifica se ainda está bloqueado
  if (blockUntil && now < blockUntil) {
    const remaining = Math.ceil((blockUntil - now) / 1000);
    errorDiv.textContent = `Bloqueado. Tente novamente em ${remaining} segundos.`;
    return;
  }

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  errorDiv.textContent = 'Tentando conectar...';

  try {
    const response = await fetch('/.netlify/functions/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const text = await response.text();
      attempts++;

      // Se atingir o limite, bloqueia
      if (attempts >= MAX_ATTEMPTS) {
        blockUntil = Date.now() + BLOCK_TIME;
        errorDiv.textContent = `Máximo de tentativas atingido. Bloqueado por 5 minutos.`;
        attempts = 0; // reset após bloqueio
      } else {
        errorDiv.textContent = `Erro: ${text} (Tentativa ${attempts}/${MAX_ATTEMPTS})`;
      }
      return;
    }

    // Login bem-sucedido
    const data = await response.json();
    if (!data.token) {
      errorDiv.textContent = 'Erro: token não recebido';
      return;
    }

    localStorage.setItem('adminToken', data.token);
    window.location.href = '/admin-panel.html';
  } catch (err) {
    console.error(err);
    errorDiv.textContent = 'Erro ao conectar com o servidor.';
  }
});