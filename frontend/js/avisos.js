/* Aluna: Ana Júlia Conceição da Silva | RA: 25002592 */
/* Funcionalidades da Central de Avisos */

document.addEventListener("DOMContentLoaded", function () {
  const listaAvisos = document.getElementById("lista-avisos");
  const avisos = Array.from(
    listaAvisos.querySelectorAll(".aviso-card")
  );

  const botoesFiltro = document.querySelectorAll(".aviso-filtro");
  const botaoMarcarTodos = document.getElementById("marcar-todos");

  const contadorNaoLidos = document.getElementById("contador-nao-lidos");
  const quantidadeTodos = document.getElementById("quantidade-todos");
  const quantidadeNaoLidos = document.getElementById("quantidade-nao-lidos");
  const contadorMenu = document.getElementById("contador-menu");

  const mensagemVazia = document.getElementById("avisos-vazio");

  let filtroAtual = "todos";

  // Conta os avisos que ainda não foram lidos.
  function contarNaoLidos() {
    return avisos.filter(function (aviso) {
      return aviso.classList.contains("nao-lido");
    }).length;
  }

  // Atualiza todos os números da tela.
  function atualizarContadores() {
    const total = avisos.length;
    const naoLidos = contarNaoLidos();

    quantidadeTodos.textContent = total;
    quantidadeNaoLidos.textContent = naoLidos;

    contadorNaoLidos.textContent = naoLidos + " não lidos";
    contadorMenu.textContent = naoLidos;

    contadorMenu.hidden = naoLidos === 0;
    contadorNaoLidos.hidden = naoLidos === 0;

    botaoMarcarTodos.disabled = naoLidos === 0;
  }

  // Aplica o filtro selecionado.
  function aplicarFiltro() {
    let quantidadeVisivel = 0;

    avisos.forEach(function (aviso) {
      const naoLido = aviso.classList.contains("nao-lido");
      const urgente = aviso.dataset.urgente === "true";

      let mostrar = true;

      if (filtroAtual === "nao-lidos") {
        mostrar = naoLido;
      } else if (filtroAtual === "urgentes") {
        mostrar = urgente;
      }

      aviso.hidden = !mostrar;

      if (mostrar) {
        quantidadeVisivel++;
      }
    });

    mensagemVazia.hidden = quantidadeVisivel !== 0;
  }

  // Marca um aviso individual como lido.
  function marcarComoLido(aviso) {
    aviso.classList.remove("nao-lido");
    aviso.classList.add("lido");

    const botao = aviso.querySelector(".aviso-marcar-lido");

    if (botao) {
      botao.remove();
    }

    const indicador = aviso.querySelector(".aviso-indicador");

    if (indicador) {
      indicador.removeAttribute("aria-label");
    }

    atualizarContadores();
    aplicarFiltro();
  }

  // Configura os botões de cada aviso.
  avisos.forEach(function (aviso) {
    const botao = aviso.querySelector(".aviso-marcar-lido");

    if (botao) {
      botao.addEventListener("click", function () {
        marcarComoLido(aviso);
      });
    }
  });

  // Configura os filtros.
  botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
      filtroAtual = botao.dataset.filtro;

      botoesFiltro.forEach(function (outroBotao) {
        const selecionado = outroBotao === botao;

        outroBotao.classList.toggle("ativo", selecionado);
        outroBotao.setAttribute("aria-pressed", selecionado);
      });

      aplicarFiltro();
    });
  });

  // Marca todos os avisos como lidos.
  botaoMarcarTodos.addEventListener("click", function () {
    avisos.forEach(function (aviso) {
      if (aviso.classList.contains("nao-lido")) {
        marcarComoLido(aviso);
      }
    });

    atualizarContadores();
    aplicarFiltro();
  });

  // Inicializa os contadores e a lista.
  atualizarContadores();
  aplicarFiltro();
});