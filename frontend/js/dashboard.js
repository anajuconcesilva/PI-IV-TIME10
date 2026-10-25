// Aluna: Eduarda Prado Deiró | RA: 25004440

// ===================== DADOS MOCKADOS =====================
// Tudo neste bloco é inventado, só para a tela funcionar.

// status: "liberado", "carencia", "bloqueado" ou "aguardando"
const talhoes = [
  { nome: "Talhão A1", cultura: "Soja", area: 14.2, status: "liberado" },
  {
    nome: "Talhão B2", cultura: "Milho", area: 8.5, status: "carencia",
    produto: "Imidacloprid 700 WG", periodoCarencia: 21, diasRestantes: 5
  },
  {
    nome: "Talhão C3", cultura: "Tomate", area: 2.1, status: "bloqueado",
    motivo: "Produto não autorizado para esta cultura"
  },
  { nome: "Talhão D4", cultura: "Café", area: 22.8, status: "aguardando" }
];

// tipo: "bloqueado", "carencia" ou "liberado"
const alertas = [
  {
    tipo: "bloqueado",
    titulo: "Talhão C3 — colheita bloqueada",
    detalhe: "Acephate 750 BR sem registro MAPA para tomate",
    quando: "Hoje, 08:15"
  },
  {
    tipo: "carencia",
    titulo: "Talhão B2 — carência encerra em 5 dias",
    detalhe: "Imidacloprid 700 WG · Milho",
    quando: "Hoje, 08:00"
  },
  {
    tipo: "liberado",
    titulo: "Talhão A1 — liberado para colheita",
    detalhe: "Período de carência encerrado · Soja",
    quando: "2 dias atrás"
  }
];

// =================== FIM DOS DADOS MOCKADOS ===================

const NOMES_STATUS = {
  liberado: "Liberado",
  carencia: "Em carência",
  bloqueado: "Bloqueado",
  aguardando: "Aguardando aplicação"
};

// Ícones: Lucide (lucide.dev), licença ISC
const ICONES = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  calendario: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>'
};

const ICONE_DO_ALERTA = {
  bloqueado: "alerta",
  carencia: "calendario",
  liberado: "check"
};

function icone(nome) {
  return '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">' + ICONES[nome] + "</svg>";
}

function contarTalhoes(status) {
  let total = 0;
  for (let i = 0; i < talhoes.length; i++) {
    if (talhoes[i].status === status) {
      total++;
    }
  }
  return total;
}

// Barra que mostra quanto do período de carência já passou
function barraCarencia(talhao) {
  const diasPassados = talhao.periodoCarencia - talhao.diasRestantes;
  const porcentagem = (diasPassados / talhao.periodoCarencia) * 100;

  return `
    <div class="carencia">
      <div class="carencia-linha">
        <span>Período de carência</span>
        <strong>${talhao.diasRestantes} dias restantes</strong>
      </div>
      <div class="barra">
        <div class="barra-preenchida" style="width: ${porcentagem}%"></div>
      </div>
      <div class="carencia-linha">
        <span>Dia 0</span>
        <span>Dia ${talhao.periodoCarencia}</span>
      </div>
    </div>`;
}

// A saudação e a data são de verdade: vêm do relógio do computador
function mostrarSaudacao() {
  const propriedade = lerPropriedadeConta();
  const agora = new Date();
  const hora = agora.getHours();

  let saudacao = "Boa noite";
  if (hora >= 5 && hora < 12) {
    saudacao = "Bom dia";
  } else if (hora >= 12 && hora < 18) {
    saudacao = "Boa tarde";
  }

  let data = agora.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  data = data[0].toUpperCase() + data.slice(1);

  if (!propriedade) {
    document.getElementById("saudacao").textContent = saudacao;
    document.getElementById("data-hoje").textContent = data;
    return;
  }

  document.getElementById("saudacao").textContent = saudacao + ", " + propriedade.nome;

  const localizacao = localizacaoDaPropriedade(propriedade);
  document.getElementById("data-hoje").textContent = localizacao ? data + " · " + localizacao : data;
}

function mostrarResumo() {
  let encerrando = 0;
  for (let i = 0; i < talhoes.length; i++) {
    if (talhoes[i].status === "carencia" && talhoes[i].diasRestantes <= 7) {
      encerrando++;
    }
  }

  const cards = [
    { status: "liberado", nome: "Liberados", detalhe: "Pronto para colheita" },
    { status: "carencia", nome: "Em carência", detalhe: encerrando + " encerra esta semana" },
    { status: "bloqueado", nome: "Bloqueados", detalhe: "Exige regularização" },
    { status: "aguardando", nome: "Aguardando", detalhe: "Sem aplicação ativa" }
  ];

  let html = "";
  for (let i = 0; i < cards.length; i++) {
    html += `
      <div class="resumo-card status-${cards[i].status}">
        <span class="resumo-numero">${contarTalhoes(cards[i].status)}</span>
        <span class="resumo-nome">${cards[i].nome}</span>
        <span class="resumo-detalhe">${cards[i].detalhe}</span>
      </div>`;
  }

  document.getElementById("resumo").innerHTML = html;
}

function mostrarTalhoes() {
  const lista = document.getElementById("lista-talhoes");

  if (talhoes.length === 0) {
    lista.innerHTML = '<p class="vazio">' + icone("calendario") + "Nenhum talhão cadastrado ainda.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < talhoes.length; i++) {
    const talhao = talhoes[i];

    // Cada status mostra uma coisa diferente embaixo do nome
    let complemento = "";
    if (talhao.status === "liberado") {
      complemento = '<p class="talhao-aviso">' + icone("check") + "Pronto para colheita</p>";
    } else if (talhao.status === "carencia") {
      complemento = barraCarencia(talhao);
    } else if (talhao.status === "bloqueado") {
      complemento = '<p class="talhao-aviso">' + icone("alerta") + talhao.motivo + "</p>";
    }

    html += `
      <article class="talhao status-${talhao.status}">
        <div class="talhao-topo">
          <div>
            <h3>${talhao.nome}</h3>
            <p class="talhao-detalhe">${talhao.cultura} · ${talhao.area.toLocaleString("pt-BR")} ha</p>
          </div>
          <span class="selo">${NOMES_STATUS[talhao.status]}</span>
        </div>
        ${complemento}
      </article>`;
  }

  lista.innerHTML = html;
}

function mostrarAlertas() {
  const lista = document.getElementById("lista-alertas");

  if (alertas.length === 0) {
    lista.innerHTML = '<li class="vazio">' + icone("check") + "Nenhum alerta por enquanto.</li>";
    return;
  }

  let html = "";
  for (let i = 0; i < alertas.length; i++) {
    const alerta = alertas[i];

    html += `
      <li class="alerta status-${alerta.tipo}">
        ${icone(ICONE_DO_ALERTA[alerta.tipo])}
        <div>
          <strong>${alerta.titulo}</strong>
          <p>${alerta.detalhe}</p>
          <span>${alerta.quando}</span>
        </div>
      </li>`;
  }

  lista.innerHTML = html;
}

// Mostra o talhão em carência que será liberado primeiro
function mostrarProximaLiberacao() {
  const caixa = document.getElementById("proxima-liberacao");

  let proximo = null;
  for (let i = 0; i < talhoes.length; i++) {
    const talhao = talhoes[i];
    if (talhao.status !== "carencia") {
      continue;
    }
    if (proximo === null || talhao.diasRestantes < proximo.diasRestantes) {
      proximo = talhao;
    }
  }

  if (proximo === null) {
    caixa.innerHTML = '<p class="vazio">' + icone("calendario") + "Nenhum talhão em carência.</p>";
    return;
  }

  const dataLiberacao = new Date();
  dataLiberacao.setDate(dataLiberacao.getDate() + proximo.diasRestantes);
  const dataTexto = dataLiberacao.toLocaleDateString("pt-BR", {
    day: "numeric", month: "short", year: "numeric"
  });

  caixa.innerHTML = `
    <div class="liberacao-topo">
      <div class="icone-caixa status-carencia">${icone("calendario")}</div>
      <div>
        <strong>${proximo.nome} — ${proximo.cultura}</strong>
        <span>${proximo.produto}</span>
      </div>
    </div>
    ${barraCarencia(proximo)}
    <p class="liberacao-data">Liberação em: <strong>${dataTexto}</strong></p>`;
}

mostrarSaudacao();
mostrarResumo();
mostrarTalhoes();
mostrarAlertas();
mostrarProximaLiberacao();
