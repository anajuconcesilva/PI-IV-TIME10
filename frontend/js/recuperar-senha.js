// Aluna: Eduarda Prado Deiró | RA: 25004440

const etapas = document.querySelectorAll(".etapa-recuperar");
const formEmail = document.getElementById("form-email");
const formCodigo = document.getElementById("form-codigo");
const formSenha = document.getElementById("form-senha");

const camposCodigo = document.querySelectorAll(".codigo input");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmar-senha");

const botaoReenviar = document.getElementById("botao-reenviar");
const erroEmail = document.getElementById("erro-email");
const erroCodigo = document.getElementById("erro-codigo");
const erroSenha = document.getElementById("erro-senha");

let emailInformado = "";

function mostrarEtapa(numero) {
  for (let i = 0; i < etapas.length; i++) {
    etapas[i].hidden = i !== numero;
  }
  etapas[numero].querySelector("input").focus();
}

function mostrarErro(elemento, mensagem) {
  elemento.textContent = mensagem;
  elemento.hidden = false;
}

async function enviar(caminho, dados) {
  const resposta = await fetch(API_URL + caminho, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const corpo = await resposta.json();
  return { ok: resposta.ok, corpo: corpo };
}

async function pedirCodigo() {
  erroEmail.hidden = true;
  emailInformado = document.getElementById("email").value;

  try {
    const resultado = await enviar("/auth/recuperar-senha", { email: emailInformado });

    if (!resultado.ok) {
      mostrarErro(erroEmail, resultado.corpo.erro);
      return false;
    }
    return true;
  } catch (erro) {
    mostrarErro(erroEmail, "Não foi possível falar com o servidor. Confira se a API está rodando.");
    return false;
  }
}

formEmail.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (await pedirCodigo()) {
    mostrarEtapa(1);
  }
});

botaoReenviar.addEventListener("click", async function () {
  erroCodigo.hidden = true;
  await pedirCodigo();
});

formCodigo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  erroCodigo.hidden = true;
  mostrarEtapa(2);
});

formSenha.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  erroSenha.hidden = true;

  let codigo = "";
  for (let i = 0; i < camposCodigo.length; i++) {
    codigo += camposCodigo[i].value;
  }

  try {
    const resultado = await enviar("/auth/redefinir-senha", {
      email: emailInformado,
      codigo: codigo,
      novaSenha: campoSenha.value,
    });

    if (!resultado.ok && resultado.corpo.erro.startsWith("Código")) {
      mostrarErro(erroCodigo, resultado.corpo.erro);
      mostrarEtapa(1);
      return;
    }

    if (!resultado.ok) {
      mostrarErro(erroSenha, resultado.corpo.erro);
      return;
    }

    window.location.href = "login.html";
  } catch (erro) {
    mostrarErro(erroSenha, "Não foi possível falar com o servidor. Confira se a API está rodando.");
  }
});

// Quadradinhos do código: pula para o próximo ao digitar
// e volta para o anterior ao apagar
for (let i = 0; i < camposCodigo.length; i++) {
  camposCodigo[i].addEventListener("input", function () {
    camposCodigo[i].value = camposCodigo[i].value.replace(/\D/g, "");

    if (camposCodigo[i].value !== "" && i < camposCodigo.length - 1) {
      camposCodigo[i + 1].focus();
    }
  });

  camposCodigo[i].addEventListener("keydown", function (evento) {
    if (evento.key === "Backspace" && camposCodigo[i].value === "" && i > 0) {
      camposCodigo[i - 1].focus();
    }
  });

  // Colar o código inteiro de uma vez
  camposCodigo[i].addEventListener("paste", function (evento) {
    evento.preventDefault();
    const numeros = evento.clipboardData.getData("text").replace(/\D/g, "");

    for (let j = 0; j < camposCodigo.length; j++) {
      camposCodigo[j].value = numeros[j] || "";
    }
  });
}

function conferirSenhas() {
  if (campoSenha.value === campoConfirmar.value) {
    campoConfirmar.setCustomValidity("");
  } else {
    campoConfirmar.setCustomValidity("As senhas não são iguais.");
  }
}

campoSenha.addEventListener("input", conferirSenhas);
campoConfirmar.addEventListener("input", conferirSenhas);
