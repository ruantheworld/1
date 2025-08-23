const formsContainer = document.getElementById("formsContainer");
const logoutBtn = document.getElementById("logoutBtn");

// Inicializa a tabela (opcional)
async function initForms() {
  try {
    const res = await fetch("/.netlify/functions/init");
    const data = await res.json();
    console.log(data.message);
  } catch (err) {
    console.error("Erro ao inicializar formulários:", err);
  }
}

// Busca todos os formulários
async function fetchForms() {
  try {
    const res = await fetch("/.netlify/functions/getForms");
    if (!res.ok) throw new Error("Erro ao buscar formulários");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Renderiza formulários e toggles
async function renderForms() {
  formsContainer.innerHTML = "";
  const forms = await fetchForms();

  for (const form of forms) {
    const div = document.createElement("div");
    div.classList.add("form-item");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = form.name;

    const statusSpan = document.createElement("span");
    statusSpan.textContent = form.active ? "Ativo" : "Inativo";
    statusSpan.classList.add("status");

    const btn = document.createElement("button");
    btn.textContent = form.active ? "Desativar" : "Ativar";
    btn.className = form.active ? "active-btn" : "inactive-btn";

    btn.addEventListener("click", async () => {
      try {
        const toggleResp = await fetch("/.netlify/functions/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form: form.key })
        });
        const toggleData = await toggleResp.json();
        statusSpan.textContent = toggleData.active ? "Ativo" : "Inativo";
        btn.textContent = toggleData.active ? "Desativar" : "Ativar";
        btn.className = toggleData.active ? "active-btn" : "inactive-btn";
      } catch (err) {
        console.error("Erro ao alternar formulário:", err);
      }
    });

    div.appendChild(nameSpan);
    div.appendChild(statusSpan);
    div.appendChild(btn);
    formsContainer.appendChild(div);
  }
}

// Inicialização do painel
(async function () {
  await initForms();
  await renderForms();
})();

// Logout manual
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "/loginIndex.html";
});

// Logout automático ao fechar a página
window.addEventListener("beforeunload", () => {
  localStorage.removeItem("adminToken");
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
});