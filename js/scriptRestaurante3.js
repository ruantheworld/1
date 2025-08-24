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
  const trabalhaSim = document.getElementById('trabalhaSim');
  const trabalhaNao = document.getElementById('trabalhaNao');
  const caixaFaccaoTrabalho = document.getElementById('caixaFaccaoTrabalho');
  const detalhesTrabalho = document.getElementById('detalhesTrabalho');

  const restauranteSim = document.getElementById('restauranteSim');
  const restauranteNao = document.getElementById('restauranteNao');
  const caixaFaccaoRestaurante = document.getElementById('caixaFaccaoRestaurante');
  const detalhesRestaurante = document.getElementById('detalhesRestaurante');

  const cargoRadios = document.querySelectorAll('input[name="cargo"]');
  const campoOutroCargo = document.getElementById('campoOutroCargo');
  const inputOutroCargo = document.getElementById('inputOutroCargo');

  const sendButton = document.getElementById('sendToDatabase');

  // --- Mostrar/ocultar campo "Se sim, qual?" do trabalho atual ---
  function toggleDetalhesTrabalho() {
    if (trabalhaSim.checked) {
      caixaFaccaoTrabalho.style.display = 'block';
      detalhesTrabalho.setAttribute('required', 'required');
    } else {
      caixaFaccaoTrabalho.style.display = 'none';
      detalhesTrabalho.removeAttribute('required');
      detalhesTrabalho.value = '';
    }
  }

  trabalhaSim.addEventListener('change', toggleDetalhesTrabalho);
  trabalhaNao.addEventListener('change', toggleDetalhesTrabalho);

  // --- Mostrar/ocultar campo "Se sim, conta como foi" do trabalho em restaurante ---
  function toggleDetalhesRestaurante() {
    if (restauranteSim.checked) {
      caixaFaccaoRestaurante.style.display = 'block';
      detalhesRestaurante.setAttribute('required', 'required');
    } else {
      caixaFaccaoRestaurante.style.display = 'none';
      detalhesRestaurante.removeAttribute('required');
      detalhesRestaurante.value = '';
    }
  }

  restauranteSim.addEventListener('change', toggleDetalhesRestaurante);
  restauranteNao.addEventListener('change', toggleDetalhesRestaurante);

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
  sendButton.addEventListener('click', () => {
    const nomePersonagem = document.getElementById('nomePersonagem').value.trim();
    const disponibilidadeHorario = document.getElementById('disponibilidadeHorario').value.trim();
    const idadeIRL = document.getElementById('idadeIRL').value.trim();

    const trabalhaOutroLugar = document.querySelector('input[name="trabalhaOutroLugar"]:checked')?.value;
    const detalhesTrabalhoVal = detalhesTrabalho.value.trim();

    const trabalhouRestaurante = document.querySelector('input[name="trabalhouRestaurante"]:checked')?.value;
    const detalhesRestauranteVal = detalhesRestaurante.value.trim();

    const diferencial = document.getElementById('diferencial').value.trim();
    const imersaoRoleplay = document.getElementById('imersaoRoleplay').value.trim();

    const conhecimento = document.querySelector('input[name="conhecimento"]:checked')?.value;

    const cargoSelecionado = document.querySelector('input[name="cargo"]:checked')?.value;
    const outroCargo = inputOutroCargo.value.trim();
    const cargoFinal = cargoSelecionado === 'Outro' ? outroCargo : cargoSelecionado;

    // Validações básicas
    if (!nomePersonagem || !disponibilidadeHorario || !idadeIRL) {
      alert('Por favor, preencha todos os campos básicos: nome, disponibilidade e idade.');
      return;
    }

    if (!trabalhaOutroLugar) {
      alert('Por favor, selecione se você trabalha atualmente em outro lugar.');
      return;
    }

    if (trabalhaOutroLugar === 'sim' && !detalhesTrabalhoVal) {
      alert('Por favor, informe onde você trabalha atualmente.');
      return;
    }

    if (!trabalhouRestaurante) {
      alert('Por favor, selecione se você já trabalhou em restaurante/cafeteria/lanchonete no RP.');
      return;
    }

    if (trabalhouRestaurante === 'sim' && !detalhesRestauranteVal) {
      alert('Por favor, conte como foi sua experiência em restaurante/cafeteria/lanchonete.');
      return;
    }

    if (!diferencial) {
      alert('Por favor, informe seu diferencial para o restaurante.');
      return;
    }

    if (!imersaoRoleplay) {
      alert('Por favor, informe a nota e motivo do seu roleplay imersivo.');
      return;
    }

    if (!conhecimento) {
      alert('Por favor, selecione seu nível de conhecimento/interação com o público.');
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

    // Montar objeto para envio
    const body = {
      nomePersonagem,
      disponibilidadeHorario,
      idadeIRL,
      trabalhaOutroLugar,
      detalhesTrabalho: detalhesTrabalhoVal,
      trabalhouRestaurante,
      detalhesRestaurante: detalhesRestauranteVal,
      diferencial,
      imersaoRoleplay,
      conhecimento,
      cargo: cargoFinal,
    };

    fetch('/.netlify/functions/enviarRestaurante3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.text())
      .then(() => {
        alert('Formulário enviado com sucesso!');

        // Limpar campos
        document.getElementById('nomePersonagem').value = '';
        document.getElementById('disponibilidadeHorario').value = '';
        document.getElementById('idadeIRL').value = '';

        detalhesTrabalho.value = '';
        detalhesRestaurante.value = '';

        document.getElementById('diferencial').value = '';
        document.getElementById('imersaoRoleplay').value = '';

        inputOutroCargo.value = '';

        document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));

        caixaFaccaoTrabalho.style.display = 'none';
        caixaFaccaoRestaurante.style.display = 'none';
        campoOutroCargo.style.display = 'none';
      })
      .catch((error) => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar os dados.');
      });
  });
});