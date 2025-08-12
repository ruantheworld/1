export async function carregarNavbar() {
  try {
    // Carrega o HTML da navbar
    const response = await fetch("navbar.html");
    const data = await response.text();
    document.getElementById("navbar-container").innerHTML = data;

    // Após inserir o HTML, configura o dropdown
    configurarDropdowns();

  } catch (err) {
    console.error("Erro ao carregar navbar:", err);
  }
}

// Função para adicionar os event listeners dos dropdowns
function configurarDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector('.dropbtn');

    btn.addEventListener('click', e => {
      e.preventDefault();
      dropdown.classList.toggle('active');
    });
  });

  document.addEventListener('click', e => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });
}