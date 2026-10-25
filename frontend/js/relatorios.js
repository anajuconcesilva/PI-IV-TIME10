// Marília Santos - 25014905
const API_URL = 'http://localhost:3000';

const blocoResumo = document.getElementById('bloco-resumo');
const blocoLista = document.getElementById('bloco-lista');
const estadoVazio = document.getElementById('estado-vazio');

const tituloLista = blocoLista.querySelector('.secao-titulo');
const listaRelatorios = blocoLista.querySelector('.lista-relatorios');

function alternarEstadoVazio(vazio) {
  blocoResumo.hidden = vazio;
  blocoLista.hidden = vazio;
  estadoVazio.hidden = !vazio;
}

function formatarData(data) {
  if (!data) return 'Data não informada';

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return 'Data não informada';
  }

  return dataObj.toLocaleDateString('pt-BR');
}

function formatarMesAno(data) {
  if (!data) return '—';

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return '—';
  }

  return dataObj.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  });
}

function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caractere => {
    const caracteres = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return caracteres[caractere];
  });
}

function criarCardRelatorio(relatorio, indice) {
  const id = relatorio._id;
  const tipo = relatorio.tipo || 'Relatório';
  const dataGeracao = formatarData(relatorio.data_geracao);
  const periodoInicial = formatarData(relatorio.periodo_inicial);
  const periodoFinal = formatarData(relatorio.periodo_final);

  const titulo = relatorio.conteudo || tipo;

  const identificador = id
    ? String(id).slice(-6).toUpperCase()
    : String(indice + 1).padStart(3, '0');

  const card = document.createElement('div');
  card.className = 'card-relatorio';

  card.innerHTML = `
    <div class="icone-doc">
      <svg class="icone" viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" stroke-width="2"
        aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    </div>

    <div class="relatorio-info">
      <h4>${escaparHTML(titulo)}</h4>

      <p class="relatorio-meta">
        R${identificador} · Gerado em ${dataGeracao}
      </p>

      <div class="tags-cultura">
        <span class="tag">${periodoInicial}</span>
        <span class="tag">${periodoFinal}</span>
      </div>
    </div>

    <button class="btn-download" type="button"
      ${id ? '' : 'disabled'}
      aria-label="Baixar relatório ${identificador}">
      <svg class="icone" viewBox="0 0 24 24" width="18" height="18"
        fill="none" stroke="currentColor" stroke-width="2"
        aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Baixar
    </button>
  `;

  const botaoDownload = card.querySelector('.btn-download');

  // Faz o download do PDF gerado pelo backend.
  botaoDownload.addEventListener('click', async () => {
    if (!id) {
      alert('Não foi possível identificar este relatório.');
      return;
    }

    try {
      botaoDownload.disabled = true;
      botaoDownload.textContent = 'Baixando...';

      const resposta = await fetch(
        `${API_URL}/relatorios/${encodeURIComponent(String(id))}/pdf`
      );

      if (!resposta.ok) {
        let mensagem = 'Não foi possível baixar o relatório.';

        try {
          const erro = await resposta.json();
          mensagem = erro.erro || mensagem;
        } catch {
          // Mantém a mensagem padrão se a resposta não for JSON.
        }

        throw new Error(mensagem);
      }

      const arquivo = await resposta.blob();
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');

      link.href = url;
      link.download = `relatorio-${identificador}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Revoga a URL depois que o navegador iniciar o download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (erro) {
      console.error('Erro ao baixar relatório:', erro);

      alert(
        erro instanceof Error
          ? erro.message
          : 'Ocorreu um erro ao baixar o PDF.'
      );
    } finally {
      botaoDownload.disabled = false;

      // Restaura o botão e seu ícone.
      botaoDownload.innerHTML = `
        <svg class="icone" viewBox="0 0 24 24" width="18" height="18"
          fill="none" stroke="currentColor" stroke-width="2"
          aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Baixar
      `;
    }
  });

  return card;
}

function atualizarResumo(relatorios) {
  const quantidade = blocoResumo.querySelector(
    '.card-resumo.destaque span'
  );

  const ultimoGerado = blocoResumo.querySelectorAll(
    '.card-resumo span'
  )[2];

  if (quantidade) {
    quantidade.textContent = relatorios.length;
  }

  const maisRecente = relatorios[0];

  if (ultimoGerado) {
    ultimoGerado.textContent = maisRecente
      ? formatarMesAno(maisRecente.data_geracao)
      : '—';
  }
}

async function carregarRelatorios() {
  estadoVazio.textContent = 'Carregando relatórios...';
  alternarEstadoVazio(true);

  try {
    const resposta = await fetch(`${API_URL}/relatorios`);

    if (!resposta.ok) {
      throw new Error(
        `A API respondeu com o status ${resposta.status}.`
      );
    }

    const dados = await resposta.json();

    const relatorios = Array.isArray(dados)
      ? dados
      : dados.relatorios || [];

    relatorios.sort((a, b) => {
      return new Date(b.data_geracao || 0) -
        new Date(a.data_geracao || 0);
    });

    atualizarResumo(relatorios);

    if (relatorios.length === 0) {
      estadoVazio.textContent =
        'Você ainda não possui nenhum relatório gerado!';

      alternarEstadoVazio(true);
      return;
    }

    listaRelatorios.replaceChildren();

    relatorios.forEach((relatorio, indice) => {
      listaRelatorios.appendChild(
        criarCardRelatorio(relatorio, indice)
      );
    });

    tituloLista.textContent =
      `${relatorios.length} ${
        relatorios.length === 1 ? 'RELATÓRIO' : 'RELATÓRIOS'
      }`;

    alternarEstadoVazio(false);
  } catch (erro) {
    console.error('Erro ao carregar relatórios:', erro);

    estadoVazio.textContent =
      'Não foi possível carregar os relatórios. ' +
      'Confira se o backend está rodando e tente novamente.';

    alternarEstadoVazio(true);
  }
}

carregarRelatorios();
