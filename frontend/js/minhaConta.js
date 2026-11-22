// Aluna: Eduarda Prado Deiró | RA: 25004440

const formConta = document.getElementById("form-conta");

const listaCulturas = document.getElementById("culturas-selecionadas");
const campoBuscaCultura = document.getElementById("busca-cultura");
const sugestoesCulturas = document.getElementById("sugestoes-culturas");
const botaoAdicionar = document.getElementById("botao-adicionar");
const erroCulturas = document.getElementById("erro-culturas");

const campoPropriedade = document.getElementById("propriedade");
const campoMunicipio = document.getElementById("municipio");
const campoUf = document.getElementById("uf");
const listaMunicipios = document.getElementById("lista-municipios");
const campoArea = document.getElementById("area");
const dicaArea = document.getElementById("dica-area");
const campoTipoRegistro = document.getElementById("tipo-registro");
const campoRegistro = document.getElementById("registro");

const campoCnpj = document.getElementById("cnpj");
const campoEmail = document.getElementById("email");
const campoSenhaAtualConta = document.getElementById("senha-atual-conta");
const blocoSenhaAtual = document.getElementById("campo-senha-atual");
const campoCelular = document.getElementById("celular");
const erroConta = document.getElementById("erro-conta");
const botaoCancelar = document.getElementById("botao-cancelar");

const alertaSucesso = document.getElementById("alerta-sucesso");
const tituloAlerta = document.getElementById("titulo-alerta-sucesso");
const botaoFecharSucesso = document.getElementById("fechar-alerta-sucesso");

let conta = null;
let culturasDisponiveis = [];
let culturasEscolhidas = [];
let culturasEmUso = [];
let municipiosDaUf = [];

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

function obterToken() {
  return localStorage.getItem("token");
}

async function requisicao(caminho, opcoes) {
  const resposta = await fetch(API_URL + caminho, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + obterToken(),
    },
  });
  const corpo = await resposta.json();

  if (!resposta.ok) {
    throw new Error(corpo.erro || "Não foi possível concluir a operação.");
  }
  return corpo;
}

function mostrarErro(elemento, mensagem) {
  elemento.textContent = mensagem;
  elemento.hidden = false;
}

function mostrarSucesso(mensagem) {
  tituloAlerta.textContent = mensagem;
  alertaSucesso.showModal();
}

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

campoCelular.addEventListener("input", function () {
  const numeros = campoCelular.value.replace(/\D/g, "").slice(0, 11);
  campoCelular.value = aplicarMascara(numeros, "(00) 0 0000-0000");

  if (numeros.length === 11) {
    campoCelular.setCustomValidity("");
  } else {
    campoCelular.setCustomValidity("Digite o DDD e os 9 números do celular.");
  }
});

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

function conferirArea() {
  const area = Number(campoArea.value);

  if (conta !== null && area < conta.areaEmUso) {
    campoArea.setCustomValidity("A área não pode ser menor que a soma dos talhões (" + conta.areaEmUso + " ha).");
  } else {
    campoArea.setCustomValidity("");
  }
}

campoArea.addEventListener("input", conferirArea);

function conferirEmail() {
  const mudou = conta !== null && campoEmail.value.trim().toLowerCase() !== conta.email;

  blocoSenhaAtual.hidden = !mudou;
  campoSenhaAtualConta.required = mudou;

  if (!mudou) {
    campoSenhaAtualConta.value = "";
  }
}

campoEmail.addEventListener("input", conferirEmail);

function desenharCulturas() {
  listaCulturas.innerHTML = "";

  for (let i = 0; i < culturasEscolhidas.length; i++) {
    const nome = culturasEscolhidas[i];
    const etiqueta = document.createElement("span");
    etiqueta.className = "conta-cultura";
    etiqueta.appendChild(document.createTextNode(nome));

    if (culturasEmUso.includes(nome)) {
      etiqueta.classList.add("conta-cultura-em-uso");
      etiqueta.title = "Esta cultura é usada em um talhão e não pode ser removida.";
    } else {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.textContent = "×";
      botao.setAttribute("aria-label", "Remover " + nome);
      botao.addEventListener("click", function () {
        culturasEscolhidas.splice(culturasEscolhidas.indexOf(nome), 1);
        desenharCulturas();
      });
      etiqueta.appendChild(botao);
    }

    listaCulturas.appendChild(etiqueta);
  }
}

botaoAdicionar.addEventListener("click", function () {
  const digitado = campoBuscaCultura.value.trim().toLocaleLowerCase("pt-BR");
  if (digitado === "") {
    return;
  }

  let oficial = null;
  for (let i = 0; i < culturasDisponiveis.length; i++) {
    if (culturasDisponiveis[i].nome.toLocaleLowerCase("pt-BR") === digitado) {
      oficial = culturasDisponiveis[i].nome;
    }
  }

  if (oficial === null) {
    mostrarErro(erroCulturas, "Escolha uma cultura da lista de sugestões.");
    return;
  }

  if (!culturasEscolhidas.includes(oficial)) {
    culturasEscolhidas.push(oficial);
    desenharCulturas();
  }

  campoBuscaCultura.value = "";
  erroCulturas.hidden = true;
});

function preencherFormulario() {
  culturasEmUso = conta.culturasEmUso;
  culturasEscolhidas = [];

  const culturasDaConta = (conta.culturas || []).concat(culturasEmUso);
  for (let i = 0; i < culturasDaConta.length; i++) {
    if (!culturasEscolhidas.includes(culturasDaConta[i])) {
      culturasEscolhidas.push(culturasDaConta[i]);
    }
  }
  desenharCulturas();

  campoPropriedade.value = conta.nome;
  campoUf.value = conta.uf;
  campoMunicipio.value = conta.municipio;
  campoArea.value = conta.area;
  dicaArea.textContent = "Em uso pelos talhões: " + conta.areaEmUso + " ha.";
  campoTipoRegistro.value = conta.tipo_registro || "CAR";
  campoRegistro.value = conta.registro || "";
  campoCnpj.value = aplicarMascara(conta.cnpj, "00.000.000/0000-00");
  campoEmail.value = conta.email;
  campoCelular.value = aplicarMascara(conta.telefone || "", "(00) 0 0000-0000");

  conferirRegistro();
  conferirEmail();
}

function guardarPropriedade() {
  const dados = {
    id: conta.id,
    nome: conta.nome,
    areaTotal: conta.area,
    municipio: conta.municipio,
    uf: conta.uf,
    culturas: conta.culturas,
  };
  localStorage.setItem("minhaColheita.propriedadeConta", JSON.stringify(dados));
  preencherMenuConta();
}

function culturaDePlantio(cultura) {
  return !/^(todas as culturas|tratamento de solo)$|armazenad/i.test(cultura.nome);
}

async function carregarCulturas() {
  try {
    const resposta = await fetch(API_URL + "/culturas");
    const todas = await resposta.json();
    culturasDisponiveis = todas.filter(culturaDePlantio);
  } catch (erro) {
    mostrarErro(erroCulturas, "Não foi possível carregar as culturas. Confira se a API está rodando.");
    return;
  }

  for (let i = 0; i < culturasDisponiveis.length; i++) {
    const opcao = document.createElement("option");
    opcao.value = culturasDisponiveis[i].nome;
    sugestoesCulturas.appendChild(opcao);
  }
}

async function carregarConta() {
  try {
    conta = await requisicao("/minhaConta", { method: "GET" });
  } catch (erro) {
    mostrarErro(erroConta, erro.message);
    return;
  }

  preencherFormulario();
  await carregarMunicipios();
}

formConta.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  erroConta.hidden = true;
  erroCulturas.hidden = true;

  if (culturasEscolhidas.length === 0) {
    mostrarErro(erroCulturas, "Escolha pelo menos uma cultura.");
    return;
  }

  if (!formConta.reportValidity()) {
    return;
  }

  const dados = {
    email: campoEmail.value,
    celular: campoCelular.value,
    senhaAtual: campoSenhaAtualConta.value,
    propriedade: campoPropriedade.value,
    municipio: campoMunicipio.value,
    uf: campoUf.value,
    area: Number(campoArea.value),
    tipoRegistro: campoTipoRegistro.value,
    registro: campoRegistro.value,
    culturas: culturasEscolhidas,
  };

  try {
    conta = await requisicao("/minhaConta", { method: "PUT", body: JSON.stringify(dados) });
  } catch (erro) {
    mostrarErro(erroConta, erro.message);
    return;
  }

  preencherFormulario();
  guardarPropriedade();
  mostrarSucesso("Dados atualizados com sucesso!");
});

botaoCancelar.addEventListener("click", function () {
  window.location.href = "../dashboard.html";
});

botaoFecharSucesso.addEventListener("click", function () {
  alertaSucesso.close();
});

carregarCulturas();
carregarConta();
