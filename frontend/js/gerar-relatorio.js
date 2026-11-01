// Marília Santos - 25014905

const API_URL = 'http://localhost:3000';

const ROTA_TALHOES = '/consultarTalhoes';
const ROTA_GERAR_RELATORIO = '/relatorios/gerar';

const formRelatorio = document.getElementById('form-relatorio');
const campoTalhao = document.getElementById('talhao_id');
const campoDataInicial = document.getElementById('periodo_inicial');
const campoDataFinal = document.getElementById('periodo_final');
const botaoGerar = document.getElementById('botao-gerar');
const mensagem = document.getElementById('mensagem-relatorio');

function obterToken() {
  return localStorage.getItem('token');
}

function mostrarMensagem(texto, erro = false) {
  if (!mensagem) {
    alert(texto);
    return;
  }

  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#b42318' : '#217346';
}

async function requisicaoAutenticada(url, opcoes = {}) {
  const token = obterToken();

  if (!token) {
    window.location.href = 'login.html';
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      ...(opcoes.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (resposta.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  if (!resposta.ok) {
    let mensagemErro = 'Não foi possível concluir a solicitação.';

    try {
      const dados = await resposta.json();
      mensagemErro = dados.erro || dados.mensagem || mensagemErro;
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new Error(mensagemErro);
  }

  return resposta;
}

// Carrega os talhões pertencentes à propriedade autenticada.
async function carregarTalhoes() {
  if (!campoTalhao) {
    return;
  }

  campoTalhao.innerHTML = '';

  const opcaoTodos = document.createElement('option');
  opcaoTodos.value = 'todos';
  opcaoTodos.textContent = 'Todos os talhões';
  campoTalhao.appendChild(opcaoTodos);

  try {
    const resposta = await requisicaoAutenticada(
      `${API_URL}${ROTA_TALHOES}`
    );

    const dados = await resposta.json();
    const talhoes = Array.isArray(dados.talhoes)
      ? dados.talhoes
      : [];

    for (const talhao of talhoes) {
      const id = talhao.talhao_id?._id || talhao.talhao_id;

      if (!id) {
        continue;
      }

      const opcao = document.createElement('option');
      opcao.value = String(id);
      opcao.textContent = talhao.nome || 'Talhão sem nome';

      campoTalhao.appendChild(opcao);
    }

    if (talhoes.length === 0) {
      mostrarMensagem('Nenhum talhão cadastrado nesta propriedade.');
    }
  } catch (erro) {
    console.error('Erro ao carregar talhões:', erro);
    mostrarMensagem(
      erro.message || 'Não foi possível carregar os talhões.',
      true
    );
  }
}

// Converte as datas para incluir o dia inteiro no filtro.
function converterDataInicial(data) {
  return new Date(`${data}T00:00:00.000`).toISOString();
}

function converterDataFinal(data) {
  return new Date(`${data}T23:59:59.999`).toISOString();
}

// Gera e baixa o PDF.
if (formRelatorio) {
  formRelatorio.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const dataInicial = campoDataInicial?.value;
    const dataFinal = campoDataFinal?.value;

    if (!dataInicial || !dataFinal) {
      mostrarMensagem('Preencha a data inicial e a data final.', true);
      return;
    }

    if (dataInicial > dataFinal) {
      mostrarMensagem(
        'A data inicial não pode ser posterior à data final.',
        true
      );
      return;
    }

    const valorTalhao = campoTalhao?.value || 'todos';

    if (
      valorTalhao !== 'todos' &&
      !/^[a-fA-F0-9]{24}$/.test(valorTalhao)
    ) {
      mostrarMensagem('O identificador do talhão é inválido.', true);
      return;
    }

    const dadosRelatorio = {
      periodo_inicial: converterDataInicial(dataInicial),
      periodo_final: converterDataFinal(dataFinal)
    };

    if (valorTalhao !== 'todos') {
      dadosRelatorio.talhao_id = valorTalhao;
    }

    try {
      if (botaoGerar) {
        botaoGerar.disabled = true;
        botaoGerar.textContent = 'Gerando relatório...';
      }

      mostrarMensagem('Gerando o relatório...');

      const resposta = await requisicaoAutenticada(
        `${API_URL}${ROTA_GERAR_RELATORIO}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosRelatorio)
        }
      );

      const arquivo = await resposta.blob();
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'relatorio-aplicacoes.pdf';

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      mostrarMensagem('Relatório gerado com sucesso!');

      setTimeout(() => {
        window.location.href = 'relatorios.html';
      }, 800);
    } catch (erro) {
      console.error('Erro ao gerar relatório:', erro);

      mostrarMensagem(
        erro.message || 'Ocorreu um erro ao gerar o relatório.',
        true
      );
    } finally {
      if (botaoGerar) {
        botaoGerar.disabled = false;
        botaoGerar.textContent = 'Gerar Relatório (PDF)';
      }
    }
  });
}

carregarTalhoes();