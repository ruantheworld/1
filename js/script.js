import { carregarNavbar } from '../js/navbar.js';

document.addEventListener("DOMContentLoaded", async () => {
  await carregarNavbar();

  // --- Verifica se o formulário está ativo ---
  async function verificarStatusForm() {
    try {
      const res = await fetch('/.netlify/functions/getForms');
      const forms = await res.json();
      const form = forms.find(f => f.key === 'hospital');

      if (!form.active) {
        document.body.innerHTML = "<div id='navbar-container'></div><h1 style='text-align:center;margin-top:50px;'>Página fora do ar, formulário não está aberto.</h1>";

        await carregarNavbar();

        return false;
      }
      return true;
    } catch (err) {
      console.error('Erro ao verificar status do formulário:', err);
      document.body.innerHTML = "<h1 style='text-align:center;margin-top:50px;'>Erro ao carregar a página.</h1>";
      await carregarNavbar();
      return false;
    }
  }

  const formAtivo = await verificarStatusForm();
  if (!formAtivo) return; // interrompe execução se desativado

  // --- Referências dos elementos ---
  const respostaSim = document.getElementById('respostaSim');
  const respostaNao = document.getElementById('respostaNao');
  const caixaConteudo = document.getElementById('caixaConteudo');
  const conteudoTexto = document.getElementById('conteudoTexto');

  const cargoRadios = document.querySelectorAll('input[name="cargo"]');
  const campoOutroCargo = document.getElementById('campoOutroCargo');
  const inputOutroCargo = document.getElementById('inputOutroCargo');

  // --- Mostrar/ocultar campo "Conte um pouco sobre" ---
  function toggleConteudoExperienciaRP() {
    if (respostaSim.checked) {
      caixaConteudo.style.display = 'block';
      conteudoTexto.setAttribute('required', 'required');
    } else {
      caixaConteudo.style.display = 'none';
      conteudoTexto.removeAttribute('required');
      conteudoTexto.value = '';
    }
  }

  respostaSim.addEventListener('change', toggleConteudoExperienciaRP);
  respostaNao.addEventListener('change', toggleConteudoExperienciaRP);

  // --- Mostrar/ocultar campo "Outro cargo" ---
  cargoRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'Outro') {
        campoOutroCargo.style.display = 'block';
        inputOutroCargo.setAttribute('required', 'required');
      } else {
        campoOutroCargo.style.display = 'none';
        inputOutroCargo.removeAttribute('required');
        inputOutroCargo.value = '';
      }
    });
  });

  // --- Validação e envio dos dados ---
  document.getElementById('sendToDatabase').addEventListener('click', () => {
    // Capturar todos os campos obrigatórios
    const texto = document.getElementById('inputBox').value.trim();
    const texto2 = document.getElementById('inputBox2').value.trim();
    const texto3 = document.getElementById('inputBox3').value.trim();
    const texto4 = document.getElementById('inputBox4').value.trim();
    const texto5 = document.getElementById('inputBox5').value.trim();
    const texto6 = document.getElementById('inputBox6').value.trim();
    const texto7 = document.getElementById('inputBox7').value.trim();

    const respostaSelecionada = document.querySelector('input[name="resposta"]:checked')?.value;
    const conteudo = conteudoTexto.value.trim();

    const cargoSelecionado = document.querySelector('input[name="cargo"]:checked')?.value;
    const outroCargo = inputOutroCargo.value.trim();
    const cargoFinal = cargoSelecionado === 'Outro' ? outroCargo : cargoSelecionado;

    // Validação dos campos
    if (!texto || !texto2 || !texto3 || !texto4 || !texto5 || !texto6 || !texto7) {
      alert('Por favor, preencha todos os campos de texto.');
      return;
    }

    if (!respostaSelecionada) {
      alert('Por favor, selecione uma opção de experiência RP (Sim ou Não).');
      return;
    }

    if (respostaSelecionada === 'sim' && !conteudo) {
      alert('Por favor, conte um pouco sobre sua experiência em servidores RP.');
      return;
    }

    if (!cargoSelecionado) {
      alert('Por favor, selecione o cargo desejado.');
      return;
    }

    if (cargoSelecionado === 'Outro' && !outroCargo) {
      alert('Por favor, informe o cargo desejado no campo de texto.');
      return;
    }

    // Montar o objeto com todos os dados
    const body = {
      texto,
      texto2,
      texto3,
      texto4,
      texto5,
      texto6,
      texto7,
      resposta: respostaSelecionada,
      conteudo,
      cargo: cargoFinal
    };

    // Enviar para o back-end via fetch
    fetch('/.netlify/functions/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.text())
      .then((data) => {
        alert('Mensagem enviada com sucesso!');

        // Limpar os campos
        document.getElementById('inputBox').value = '';
        document.getElementById('inputBox2').value = '';
        document.getElementById('inputBox3').value = '';
        document.getElementById('inputBox4').value = '';
        document.getElementById('inputBox5').value = '';
        document.getElementById('inputBox6').value = '';
        document.getElementById('inputBox7').value = '';
        conteudoTexto.value = '';
        inputOutroCargo.value = '';

        document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);

        // Ocultar campos condicionais
        caixaConteudo.style.display = 'none';
        campoOutroCargo.style.display = 'none';
      })
      .catch((error) => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar os dados.');
      });
  });
});