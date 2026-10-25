// Aluna: Eduarda Prado Deiró | RA: 25004440

const formLogin = document.getElementById("form-login");
const erroLogin = document.getElementById("erro-login");

function mostrarErro(mensagem) {
  erroLogin.textContent = mensagem;
  erroLogin.hidden = false;
}

function guardarPropriedade(propriedade) {
  const dados = {
    id: propriedade.id,
    nome: propriedade.nome,
    areaTotal: propriedade.area,
    municipio: propriedade.municipio,
    uf: propriedade.uf,
  };
  localStorage.setItem("minhaColheita.propriedadeConta", JSON.stringify(dados));
}

formLogin.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  erroLogin.hidden = true;

  const dados = {
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
  };

  try {
    const resposta = await fetch(API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const corpo = await resposta.json();

    if (!resposta.ok) {
      mostrarErro(corpo.erro);
      return;
    }

    localStorage.setItem("token", corpo.token);
    guardarPropriedade(corpo.propriedade);
    window.location.href = "dashboard.html";
  } catch (erro) {
    mostrarErro("Não foi possível falar com o servidor. Confira se a API está rodando.");
  }
});
