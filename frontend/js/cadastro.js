// Aluna: Eduarda Prado Deiró | RA: 25004440

const formCadastro = document.getElementById("form-cadastro");
const etapas = document.querySelectorAll(".etapa");
const bolinhas = document.querySelectorAll(".passo-bolinha");
const linhas = document.querySelectorAll(".passo-linha");
const botoesVoltar = document.querySelectorAll(".botao-voltar");

const campoCnpj = document.getElementById("cnpj");
const campoCelular = document.getElementById("celular");
const campoTipoRegistro = document.getElementById("tipo-registro");
const campoRegistro = document.getElementById("registro");
const campoMunicipio = document.getElementById("municipio");
const campoUf = document.getElementById("uf");
const listaMunicipios = document.getElementById("lista-municipios");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmar-senha");

const listaCulturas = document.getElementById("lista-culturas");
const campoBuscaCultura = document.getElementById("busca-cultura");
const sugestoesCulturas = document.getElementById("sugestoes-culturas");
const botaoAdicionar = document.getElementById("botao-adicionar");
const erroCulturas = document.getElementById("erro-culturas");
const erroServidor = document.getElementById("erro-servidor");

let culturasDisponiveis = [];
let municipiosDaUf = [];

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

// Encaixa os números no molde: cada "0" recebe um número,
// o resto (pontos, traços, parênteses) entra como está
function aplicarMascara(numeros, molde) {
  let resultado = "";
  let posicao = 0;

  for (let i = 0; i < molde.length && posicao < numeros.length; i++) {
    if (molde[i] === "0") {
      resultado += numeros[posicao];
      posicao++;
    } else {
      resultado += molde[i];
    }
  }
  return resultado;
}

// CNPJ tem 14 números
campoCnpj.addEventListener("input", function () {
  const numeros = campoCnpj.value.replace(/\D/g, "").slice(0, 14);
  campoCnpj.value = aplicarMascara(numeros, "00.000.000/0000-00");

  if (numeros.length === 14) {
    campoCnpj.setCustomValidity("");
  } else {
    campoCnpj.setCustomValidity("Digite os 14 números do CNPJ.");
  }
});

// Celular: DDD + 9 números
campoCelular.addEventListener("input", function () {
  const numeros = campoCelular.value.replace(/\D/g, "").slice(0, 11);
  campoCelular.value = aplicarMascara(numeros, "(00) 0 0000-0000");

  if (numeros.length === 11) {
    campoCelular.setCustomValidity("");
  } else {
    campoCelular.setCustomValidity("Digite o DDD e os 9 números do celular.");
  }
});

const FORMATOS_REGISTRO = {
  CAR: {
    regex: /^[A-Z]{2}-\d{7}-([A-F0-9]{32}|[A-F0-9]{4}(\.[A-F0-9]{4}){7})$/,
    exemplo: "SP-3550308-1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D",
    mensagem: "Digite o CAR no formato UF-0000000-código, como em SP-3550308-1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D.",
  },
  DAP: {
    regex: /^(?=.*[A-Z])(?=.*\d)[A-Z0-9.-]{8,30}$/,
    exemplo: "SDT12345678901234",
    mensagem: "Digite o número da DAP, com letras e números (de 8 a 30 caracteres).",
  },
  CAF: {
    regex: /^(?=.*[A-Z])(?=.*\d)[A-Z0-9.-]{8,30}$/,
    exemplo: "CAF12345678901234",
    mensagem: "Digite o número do CAF, com letras e números (de 8 a 30 caracteres).",
  },
};

function conferirRegistro() {
  const formato = FORMATOS_REGISTRO[campoTipoRegistro.value];
  const texto = campoRegistro.value.toUpperCase().replace(/[^A-Z0-9.-]/g, "").slice(0, 50);
  campoRegistro.value = texto;
  campoRegistro.placeholder = formato.exemplo;

  if (formato.regex.test(texto)) {
    campoRegistro.setCustomValidity("");
  } else {
    campoRegistro.setCustomValidity(formato.mensagem);
  }
}

campoRegistro.addEventListener("input", conferirRegistro);
campoTipoRegistro.addEventListener("change", conferirRegistro);
conferirRegistro();

function conferirRegrasSenha() {
  const senha = campoSenha.value;

  if (senha.length < 6 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha)) {
    campoSenha.setCustomValidity("A senha precisa ter 6 caracteres ou mais, com letra maiúscula, minúscula e número.");
  } else {
    campoSenha.setCustomValidity("");
  }
}

function conferirMunicipio() {
  const nome = campoMunicipio.value.trim().toLocaleLowerCase("pt-BR");
  let encontrado = municipiosDaUf.length === 0;

  for (let i = 0; i < municipiosDaUf.length; i++) {
    if (municipiosDaUf[i].toLocaleLowerCase("pt-BR") === nome) {
      encontrado = true;
    }
  }

  if (encontrado) {
    campoMunicipio.setCustomValidity("");
  } else {
    campoMunicipio.setCustomValidity("Escolha um município de " + campoUf.value + " na lista.");
  }
}

async function carregarMunicipios() {
  municipiosDaUf = [];
  listaMunicipios.innerHTML = "";

  if (campoUf.value !== "") {
    try {
      const resposta = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/" + campoUf.value + "/municipios");
      const municipios = await resposta.json();

      for (let i = 0; i < municipios.length; i++) {
        municipiosDaUf.push(municipios[i].nome);

        const opcao = document.createElement("option");
        opcao.value = municipios[i].nome;
        listaMunicipios.appendChild(opcao);
      }
    } catch (erro) {
      municipiosDaUf = [];
    }
  }

  conferirMunicipio();
}

campoUf.addEventListener("change", carregarMunicipios);
campoMunicipio.addEventListener("input", conferirMunicipio);

function conferirSenhas() {
  if (campoSenha.value === campoConfirmar.value) {
    campoConfirmar.setCustomValidity("");
  } else {
    campoConfirmar.setCustomValidity("As senhas não são iguais.");
  }
}

campoSenha.addEventListener("input", conferirRegrasSenha);
campoSenha.addEventListener("input", conferirSenhas);
campoConfirmar.addEventListener("input", conferirSenhas);

for (let i = 0; i < botoesVoltar.length; i++) {
  botoesVoltar[i].addEventListener("click", function () {
    mostrarEtapa(etapaAtual - 1);
  });
}

function mostrarErroCulturas(mensagem) {
  erroCulturas.textContent = mensagem;
  erroCulturas.hidden = false;
}

function textoProdutos(quantidade) {
  if (quantidade === 1) {
    return "1 produto autorizado";
  }
  return quantidade.toLocaleString("pt-BR") + " produtos autorizados";
}

async function carregarCulturas() {
  try {
    const resposta = await fetch(API_URL + "/culturas");
    culturasDisponiveis = await resposta.json();
  } catch (erro) {
    mostrarErroCulturas("Não foi possível carregar as culturas. Confira se a API está rodando.");
    return;
  }

  for (let i = 0; i < culturasDisponiveis.length; i++) {
    const opcao = document.createElement("option");
    opcao.value = culturasDisponiveis[i].nome;
    opcao.label = textoProdutos(culturasDisponiveis[i].quantidadeProdutos);
    sugestoesCulturas.appendChild(opcao);
  }
}

function adicionarCultura() {
  const digitado = campoBuscaCultura.value.trim().toLowerCase();
  if (digitado === "") {
    return;
  }

  let cultura = null;
  for (let i = 0; i < culturasDisponiveis.length; i++) {
    if (culturasDisponiveis[i].nome.toLowerCase() === digitado) {
      cultura = culturasDisponiveis[i];
    }
  }

  if (cultura === null) {
    mostrarErroCulturas("Escolha uma cultura da lista.");
    return;
  }

  campoBuscaCultura.value = "";
  erroCulturas.hidden = true;

  if (listaCulturas.querySelector('input[value="' + cultura.nome + '"]')) {
    return;
  }

  const caixa = document.createElement("input");
  caixa.type = "checkbox";
  caixa.name = "culturas";
  caixa.value = cultura.nome;
  caixa.checked = true;

  const item = document.createElement("label");
  item.className = "cultura";
  item.appendChild(caixa);
  item.appendChild(document.createTextNode(" " + cultura.nome + " · " + textoProdutos(cultura.quantidadeProdutos)));

  listaCulturas.appendChild(item);
}

botaoAdicionar.addEventListener("click", adicionarCultura);

campoBuscaCultura.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    evento.preventDefault();
    adicionarCultura();
  }
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
    mostrarErroCulturas("Marque pelo menos uma cultura.");
    return;
  }

  enviarCadastro();
});

function mostrarErroServidor(mensagem) {
  erroServidor.textContent = mensagem;
  erroServidor.hidden = false;
}

async function enviarCadastro() {
  erroServidor.hidden = true;

  const culturas = [];
  const marcadas = listaCulturas.querySelectorAll("input:checked");
  for (let i = 0; i < marcadas.length; i++) {
    culturas.push(marcadas[i].value);
  }

  const dados = {
    cnpj: campoCnpj.value,
    celular: campoCelular.value,
    email: document.getElementById("email").value,
    senha: campoSenha.value,
    propriedade: document.getElementById("propriedade").value,
    municipio: document.getElementById("municipio").value,
    uf: document.getElementById("uf").value,
    area: Number(document.getElementById("area").value),
    tipoRegistro: campoTipoRegistro.value,
    registro: document.getElementById("registro").value,
    culturas: culturas,
  };

  try {
    const resposta = await fetch(API_URL + "/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const corpo = await resposta.json();

    if (!resposta.ok) {
      mostrarErroServidor(corpo.erro);
      return;
    }

    window.location.href = "login.html";
  } catch (erro) {
    mostrarErroServidor("Não foi possível falar com o servidor. Confira se a API está rodando.");
  }
}

carregarCulturas();
