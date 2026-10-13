// Aluna: Eduarda Prado Deiró | RA: 25004440

const formCadastro = document.getElementById("form-cadastro");
const etapas = document.querySelectorAll(".etapa");
const bolinhas = document.querySelectorAll(".passo-bolinha");
const linhas = document.querySelectorAll(".passo-linha");
const botoesVoltar = document.querySelectorAll(".botao-voltar");

const campoDocumento = document.getElementById("documento");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmar-senha");

const listaCulturas = document.getElementById("lista-culturas");
const campoOutraCultura = document.getElementById("outra-cultura");
const botaoAdicionar = document.getElementById("botao-adicionar");
const erroCulturas = document.getElementById("erro-culturas");

// Começa no passo 1 (posição 0)
let etapaAtual = 0;

function mostrarEtapa(numero) {
  etapaAtual = numero;

  for (let i = 0; i < etapas.length; i++) {
    etapas[i].hidden = i !== numero;
    bolinhas[i].classList.toggle("ativo", i <= numero);
  }

  for (let i = 0; i < linhas.length; i++) {
    linhas[i].classList.toggle("ativo", i < numero);
  }
}

// Confere só os campos do passo que está na tela
function etapaValida() {
  const campos = etapas[etapaAtual].querySelectorAll("input, select");

  for (let i = 0; i < campos.length; i++) {
    if (!campos[i].reportValidity()) {
      return false;
    }
  }
  return true;
}

function temCulturaMarcada() {
  return listaCulturas.querySelectorAll("input:checked").length > 0;
}

// CPF tem 11 números e CNPJ tem 14
campoDocumento.addEventListener("input", function () {
  const numeros = campoDocumento.value.replace(/\D/g, "");

  if (numeros.length === 11 || numeros.length === 14) {
    campoDocumento.setCustomValidity("");
  } else {
    campoDocumento.setCustomValidity("Digite um CPF (11 números) ou um CNPJ (14 números).");
  }
});

function conferirSenhas() {
  if (campoSenha.value === campoConfirmar.value) {
    campoConfirmar.setCustomValidity("");
  } else {
    campoConfirmar.setCustomValidity("As senhas não são iguais.");
  }
}

campoSenha.addEventListener("input", conferirSenhas);
campoConfirmar.addEventListener("input", conferirSenhas);

for (let i = 0; i < botoesVoltar.length; i++) {
  botoesVoltar[i].addEventListener("click", function () {
    mostrarEtapa(etapaAtual - 1);
  });
}

// Cria uma cultura nova na lista, já marcada
botaoAdicionar.addEventListener("click", function () {
  const nome = campoOutraCultura.value.trim();
  if (nome === "") {
    return;
  }

  const caixa = document.createElement("input");
  caixa.type = "checkbox";
  caixa.name = "culturas";
  caixa.value = nome;
  caixa.checked = true;

  const item = document.createElement("label");
  item.className = "cultura";
  item.appendChild(caixa);
  item.appendChild(document.createTextNode(" " + nome));

  listaCulturas.appendChild(item);
  campoOutraCultura.value = "";
  erroCulturas.hidden = true;
});

listaCulturas.addEventListener("change", function () {
  if (temCulturaMarcada()) {
    erroCulturas.hidden = true;
  }
});

// "Próximo" e "Criar conta" caem aqui
formCadastro.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (!etapaValida()) {
    return;
  }

  const ultimaEtapa = etapas.length - 1;
  if (etapaAtual < ultimaEtapa) {
    mostrarEtapa(etapaAtual + 1);
    return;
  }

  if (!temCulturaMarcada()) {
    erroCulturas.hidden = false;
    return;
  }

  // Ainda não salva a conta no servidor: só abre o dashboard
  window.location.href = "dashboard.html";
});
