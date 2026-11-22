/* Aluna: Ana Júlia Conceição da Silva | RA: 25002592 */
/* Funcionalidades da Central de Avisos integrada à API */

// Endereço da API do backend.
const URL_AVISOS = API_URL + "/avisos";

document.addEventListener("DOMContentLoaded", function () {

  const listaAvisos = document.getElementById("lista-avisos");

  const botoesFiltro = document.querySelectorAll(".aviso-filtro");
  const botaoMarcarTodos = document.getElementById("marcar-todos");

  const contadorNaoLidos = document.getElementById("contador-nao-lidos");
  const quantidadeTodos = document.getElementById("quantidade-todos");
  const quantidadeNaoLidos = document.getElementById("quantidade-nao-lidos");
  const contadorMenu = document.getElementById("contador-menu");

  const mensagemVazia = document.getElementById("avisos-vazio");

  let avisos = [];
  let filtroAtual = "todos";

  // Recupera o token de autenticação.
  function obterToken() {
    return localStorage.getItem("token");
  }

  // Configura os cabeçalhos das requisições.
  function obterCabecalhos() {
    return {
      "Authorization": "Bearer " + obterToken(),
      "Content-Type": "application/json"
    };
  }

  // Formata a data do aviso para o padrão brasileiro.
  function formatarData(data) {
    const dataAviso = new Date(data);

    if (isNaN(dataAviso.getTime())) {
      return "Data não disponível";
    }

    return dataAviso.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // Retorna o nome apresentado para cada tipo de aviso.
  function obterTitulo(tipo) {
    const titulos = {
      carencia: "Período de carência",
      liberado: "Talhão liberado para colheita",
      bloqueado: "Colheita bloqueada",
      aguardando: "Talhão aguardando aplicação"
    };

    return titulos[tipo] || "Aviso da propriedade";
  }

  // Retorna a classe visual de cada tipo de aviso.
  function obterClasse(tipo) {
    const classes = {
      carencia: "aviso-carencia",
      liberado: "aviso-liberado",
      bloqueado: "aviso-bloqueado",
      aguardando: "aviso-aguardando"
    };

    return classes[tipo] || "aviso-carencia";
  }

  // Retorna o texto de status do aviso.
  function obterStatus(tipo) {
    const status = {
      carencia: "Em carência",
      liberado: "Liberado",
      bloqueado: "Bloqueado",
      aguardando: "Aguardando aplicação"
    };

    return status[tipo] || "Notificação";
  }

  // Retorna o ícone correspondente ao tipo de aviso.
  function obterIcone(tipo) {

    if (tipo === "liberado") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m5 12 4 4L19 6"/>
        </svg>
      `;
    }

    if (tipo === "aguardando") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
          <path d="M10 21h4"/>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
      </svg>
    `;
  }

  // Conta os avisos que ainda não foram lidos.
  function contarNaoLidos() {
    return avisos.filter(function (aviso) {
      return aviso.status === "ativo";
    }).length;
  }

  // Atualiza todos os contadores da tela.
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

  // Cria o card de um aviso.
  function criarCard(aviso) {

    const card = document.createElement("article");

    const naoLido = aviso.status === "ativo";

    card.className = "aviso-card " + obterClasse(aviso.tipo);

    card.classList.add(naoLido ? "nao-lido" : "lido");

    // O backend ainda não fornece o campo urgente.
    card.dataset.urgente = aviso.urgente === true ? "true" : "false";

    // Ícone.
    const icone = document.createElement("div");
    icone.className = "aviso-icone";
    icone.setAttribute("aria-hidden", "true");
    icone.innerHTML = obterIcone(aviso.tipo);

    // Corpo do aviso.
    const corpo = document.createElement("div");
    corpo.className = "aviso-corpo";

    const titulo = document.createElement("h2");
    titulo.textContent = obterTitulo(aviso.tipo);

    const mensagem = document.createElement("p");
    mensagem.textContent = aviso.mensagem || "Não há detalhes disponíveis.";

    const informacoes = document.createElement("div");
    informacoes.className = "aviso-informacoes";

    const status = document.createElement("span");
    status.className = "aviso-status";
    status.textContent = obterStatus(aviso.tipo);

    const data = document.createElement("time");
    data.textContent = formatarData(aviso.data);

    if (aviso.data) {
      const dataISO = new Date(aviso.data);

      if (!isNaN(dataISO.getTime())) {
        data.dateTime = dataISO.toISOString();
      }
    }

    informacoes.appendChild(status);
    informacoes.appendChild(data);

    corpo.appendChild(titulo);
    corpo.appendChild(mensagem);
    corpo.appendChild(informacoes);

    // Ações do aviso.
    const acoes = document.createElement("div");
    acoes.className = "aviso-acoes";

    if (naoLido) {
      const botaoLido = document.createElement("button");

      botaoLido.type = "button";
      botaoLido.className = "aviso-marcar-lido";
      botaoLido.textContent = "Marcar como lido";

      botaoLido.addEventListener("click", function () {
        marcarComoLido(aviso.id);
      });

      acoes.appendChild(botaoLido);
    }

    if (aviso.talhao_id) {
      const link = document.createElement("a");

      link.href = "listagemTalhao.html";
      link.className = "aviso-link";
      link.textContent = "Ver talhão ›";

      acoes.appendChild(link);
    }

    // Indicador de leitura.
    const indicador = document.createElement("span");
    indicador.className = "aviso-indicador";

    if (naoLido) {
      indicador.setAttribute("aria-label", "Não lido");
    }

    card.appendChild(icone);
    card.appendChild(corpo);
    card.appendChild(acoes);
    card.appendChild(indicador);

    return card;
  }

  // Aplica o filtro selecionado.
  function aplicarFiltro() {

    const avisosFiltrados = avisos.filter(function (aviso) {

      if (filtroAtual === "nao-lidos") {
        return aviso.status === "ativo";
      }

      if (filtroAtual === "urgentes") {
        return aviso.urgente === true;
      }

      return true;
    });

    listaAvisos.innerHTML = "";

    avisosFiltrados.forEach(function (aviso) {
      const card = criarCard(aviso);
      listaAvisos.appendChild(card);
    });

    mensagemVazia.hidden = avisosFiltrados.length !== 0;
  }

  // Atualiza a lista e os contadores.
  function atualizarTela() {
    atualizarContadores();
    aplicarFiltro();
  }

  // Busca os avisos no backend.
  async function carregarAvisos() {

    try {

      listaAvisos.innerHTML = "<p>Carregando avisos...</p>";
      mensagemVazia.hidden = true;

      const resposta = await fetch(URL_AVISOS, {
        method: "GET",
        headers: obterCabecalhos()
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar os avisos.");
      }

      const dados = await resposta.json();

      avisos = dados.avisos || [];

      atualizarTela();

    } catch (erro) {

      console.error("Erro ao carregar avisos:", erro);

      listaAvisos.innerHTML = "";

      mensagemVazia.hidden = false;

      mensagemVazia.querySelector("h2").textContent =
        "Não foi possível carregar os avisos";

      mensagemVazia.querySelector("p").textContent =
        "Verifique sua conexão com o servidor e tente novamente.";
    }
  }

  // Marca um aviso específico como lido.
  async function marcarComoLido(avisoId) {

    try {

      const resposta = await fetch(
        URL_AVISOS + "/" + encodeURIComponent(avisoId) + "/lido",
        {
          method: "PATCH",
          headers: obterCabecalhos()
        }
      );

      if (!resposta.ok) {
        throw new Error("Não foi possível marcar o aviso como lido.");
      }

      const aviso = avisos.find(function (item) {
        return item.id === avisoId;
      });

      if (aviso) {
        aviso.status = "lido";
      }

      atualizarTela();

    } catch (erro) {

      console.error("Erro ao marcar aviso como lido:", erro);

      alert("Não foi possível marcar o aviso como lido. Tente novamente.");
    }
  }

  // Marca todos os avisos como lidos.
  async function marcarTodosComoLidos() {

    try {

      const resposta = await fetch(
        URL_AVISOS + "/marcar-todos-lidos",
        {
          method: "PATCH",
          headers: obterCabecalhos()
        }
      );

      if (!resposta.ok) {
        throw new Error("Não foi possível marcar todos os avisos como lidos.");
      }

      avisos.forEach(function (aviso) {
        if (aviso.status === "ativo") {
          aviso.status = "lido";
        }
      });

      atualizarTela();

    } catch (erro) {

      console.error("Erro ao marcar todos os avisos como lidos:", erro);

      alert("Não foi possível marcar todos os avisos como lidos. Tente novamente.");
    }
  }

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

  // Configura o botão de marcar todos como lidos.
  botaoMarcarTodos.addEventListener("click", marcarTodosComoLidos);

  // Inicializa a página buscando os avisos do banco.
  carregarAvisos();

});
