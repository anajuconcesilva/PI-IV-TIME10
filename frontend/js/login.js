// Aluna: Eduarda Prado Deiró | RA: 25004440

const formLogin = document.getElementById("form-login");
const erroLogin = document.getElementById("erro-login");

function mostrarErro(mensagem) {
  erroLogin.textContent = mensagem;
  erroLogin.hidden = false;
}

async function guardarPropriedade(token) {
  const resposta = await fetch(API_URL + "/propriedades", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!resposta.ok) {
    return;
  }

  const propriedades = await resposta.json();
  if (propriedades.length > 0) {
    const propriedade = {
      id: propriedades[0].id,
      nome: propriedades[0].nome,
      areaTotal: propriedades[0].area,
      municipio: propriedades[0].municipio,
      uf: propriedades[0].uf,
    };
    localStorage.setItem("minhaColheita.propriedadeConta", JSON.stringify(propriedade));
  }
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
    localStorage.setItem("usuario", JSON.stringify(corpo.usuario));

    await guardarPropriedade(corpo.token);
    window.location.href = "dashboard.html";
  } catch (erro) {
    mostrarErro("Não foi possível falar com o servidor. Confira se a API está rodando.");
  }
});
