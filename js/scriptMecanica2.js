import { carregarNavbar } from './navbar.js';

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
  const mecanicoSim = document.getElementById('mecanicoSim');
  const mecanicoNao = document.getElementById('mecanicoNao');
  const caixaMecanico = document.getElementById('caixaMecanico');
  const textoMecanico = document.getElementById('textoMecanico');

  const respostaSim = document.getElementById('respostaSim');
  const respostaNao = document.getElementById('respostaNao');
  const caixaFaccao = document.getElementById('caixaFaccao');
  const textoFaccao = document.getElementById('textoFaccao');

  const rpSim = document.getElementById('rpSim');
  const rpNao = document.getElementById('rpNao');
  const caixaRP = document.getElementById('caixaRP');
  const textoRP = document.getElementById('textoRP');

  // --- Mostrar/ocultar campos ---
  function toggleCampoMecanico() {
    if (mecanicoSim.checked) {
      caixaMecanico.style.display = 'block';
      textoMecanico.setAttribute('required', 'required');
    } else {
      caixaMecanico.style.display = 'none';
      textoMecanico.removeAttribute('required');
      textoMecanico.value = '';
    }
  }

  function toggleCampoRP() {
    if (rpSim.checked) {
      caixaRP.style.display = 'block';
      textoRP.setAttribute('required', 'required');
    } else {
      caixaRP.style.display = 'none';
      textoRP.removeAttribute('required');
      textoRP.value = '';
    }
  }

  function toggleCampoFaccao() {
    if (respostaSim.checked) {
      caixaFaccao.style.display = 'block';
      textoFaccao.setAttribute('required', 'required');
    } else {
      caixaFaccao.style.display = 'none';
      textoFaccao.removeAttribute('required');
      textoFaccao.value = '';
    }
  }

  respostaSim.addEventListener('change', toggleCampoFaccao);
  respostaNao.addEventListener('change', toggleCampoFaccao);

  mecanicoSim.addEventListener('change', toggleCampoMecanico);
  mecanicoNao.addEventListener('change', toggleCampoMecanico);

  rpSim.addEventListener('change', toggleCampoRP);
  rpNao.addEventListener('change', toggleCampoRP);

  // --- Envio dos dados ---
  document.getElementById('sendToDatabase').addEventListener('click', () => {
    const nome = document.getElementById('inputBox').value.trim();
    const disponibilidade = document.getElementById('inputBox2').value.trim();
    const idade = document.getElementById('inputBox3').value.trim();
    const situacaoRP = document.getElementById('inputBox4').value.trim();
    const carta = document.getElementById('inputBox5').value.trim();

    const trabalhouMecanico = document.querySelector('input[name="mecanico"]:checked')?.value;
    const experienciaMecanico = textoMecanico.value.trim();

    const experienciaRP = document.querySelector('input[name="rp"]:checked')?.value;
    const experienciaRPTexto = textoRP.value.trim();

    const experienciaFaccao = document.querySelector('input[name="resposta"]:checked')?.value;
    const textoFaccaoVal = textoFaccao.value.trim();

    const tuning = document.querySelector('input[name="conhecimento"]:checked')?.value;
    const crescimento = document.querySelector('input[name="cargo"]:checked')?.value;

    // Validações
    if (!nome || !disponibilidade || !idade || !situacaoRP || !carta) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!trabalhouMecanico) {
      alert('Responda se já trabalhou como mecânico.');
      return;
    }
    if (trabalhouMecanico === 'sim' && !experienciaMecanico) {
      alert('Descreva sua experiência como mecânico.');
      return;
    }
    if (!experienciaRP) {
      alert('Responda se já teve experiência em servidor RP.');
      return;
    }
    if (experienciaRP === 'sim' && !experienciaRPTexto) {
      alert('Descreva sua experiência em servidor RP.');
      return;
    }
    if (!tuning) {
      alert('Selecione seu conhecimento sobre tuning.');
      return;
    }
    if (!crescimento) {
      alert('Selecione seu interesse em crescer na equipe.');
      return;
    }

    const body = {
      texto: nome,
      texto2: disponibilidade,
      texto3: idade,
      texto4: trabalhouMecanico,
      texto5: experienciaMecanico,
      texto6: tuning,
      texto7: situacaoRP,
      experienciaRP,
      textoRP: experienciaRPTexto,
      experienciaFaccao,
      textoFaccao: textoFaccaoVal,
      crescimento,
      cargo: crescimento,
      carta
    };

    fetch('/.netlify/functions/enviar2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(res => res.text())
      .then(data => {
        alert('Formulário enviado com sucesso!');
        document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
        document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
        caixaMecanico.style.display = 'none';
        caixaRP.style.display = 'none';
        caixaFaccao.style.display = 'none';
      })
      .catch(err => {
        console.error('Erro:', err);
        alert('Erro ao enviar o formulário.');
      });
  });
});