// Aluna: Eduarda Prado Deiró | RA: 25004440

function tokenValido() {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    const dados = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return dados.exp * 1000 > Date.now();
  } catch (erro) {
    return false;
  }
}

function enderecoDoLogin() {
  if (window.location.pathname.includes("/pages/")) {
    return "../login.html";
  }
  return "login.html";
}

function lerPropriedadeConta() {
  try {
    return JSON.parse(localStorage.getItem("minhaColheita.propriedadeConta")) || null;
  } catch (erro) {
    return null;
  }
}

function localizacaoDaPropriedade(propriedade) {
  if (!propriedade.municipio || !propriedade.uf) {
    return "";
  }
  return propriedade.municipio + ", " + propriedade.uf;
}

function iniciaisDe(nome) {
  const partes = nome.trim().split(/\s+/);
  let iniciais = "";
  for (let i = 0; i < partes.length && i < 2; i++) {
    iniciais += partes[i][0].toUpperCase();
  }
  return iniciais;
}

function preencherMenuConta() {
  const propriedade = lerPropriedadeConta();
  const menu = document.querySelector(".menu-usuario");
  if (!propriedade || !menu) {
    return;
  }

  menu.querySelector(".menu-iniciais").textContent = iniciaisDe(propriedade.nome);
  menu.querySelector("strong").textContent = propriedade.nome;
  menu.querySelector("strong + span").textContent = localizacaoDaPropriedade(propriedade);
}

function sairDaConta() {
  localStorage.removeItem("token");
  localStorage.removeItem("minhaColheita.propriedadeConta");
}

function iniciarConta() {
  preencherMenuConta();

  const botaoSair = document.querySelector(".menu-sair");
  if (botaoSair) {
    botaoSair.addEventListener("click", sairDaConta);
  }
}

if (tokenValido()) {
  document.addEventListener("DOMContentLoaded", iniciarConta);
} else {
  sairDaConta();
  window.location.replace(enderecoDoLogin());
}
