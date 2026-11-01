// Beatriz Naomi Ferreira Sasaki - RA: 25016735
// Arquivo de scripts comum entre as telas - cadastroTalhao, listagemTalhao e paginaTalhao

// Endereço da API.
// Altere a porta caso o backend esteja utilizando outra.
const URL_API = 'http://localhost:3000';

// Relaciona os códigos de status ao texto mostrado na tela.
const NOMES_STATUS = {
  liberado: 'Liberado',
  emCarencia: 'Em carência',
  aguardando: 'Aguardando'
};

// Lista de talhões carregada pela API.
let talhoes = [];

const propriedadeConta = carregarPropriedadeConta();

const alertaSucesso = document.querySelector('#alerta-sucesso');
const botaoFecharSucesso = document.querySelector('#fechar-alerta-sucesso');

// Usa a data local de hoje.
function obterDataHoje() {
  const agora = new Date();

  return agora.getFullYear() + '-' +
    String(agora.getMonth() + 1).padStart(2, '0') + '-' +
    String(agora.getDate()).padStart(2, '0');
}

// Soma o período de carência à data da aplicação.
function calcularPrevisaoColheita(dataAplicacao, periodoCarencia) {
  const data = new Date(dataAplicacao + 'T00:00:00Z');

  data.setUTCDate(data.getUTCDate() + Number(periodoCarencia));

  return data.toISOString().slice(0, 10);
}

// Lê o token salvo durante o login.
function obterToken() {
  return localStorage.getItem('token');
}

// Verifica se existe um token para acessar a API.
function verificarToken() {
  const token = obterToken();

  if (!token) {
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  return token;
}

// Realiza as requisições para a API.
async function requisicaoAPI(endereco, opcoes = {}) {
  const token = verificarToken();

  const resposta = await fetch(URL_API + endereco, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      ...opcoes.headers
    }
  });

  let dados = null;

  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    throw new Error(
      dados?.erro ||
      dados?.mensagem ||
      'Não foi possível realizar a operação.'
    );
  }

  return dados;
}

// Converte uma data recebida da API para o formato YYYY-MM-DD.
function formatarDataAPI(data) {
  if (!data) return '';

  const valor = String(data);

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  return valor.slice(0, 10);
}

// Converte o status do backend para o formato usado nas telas.
function converterStatusFrontend(status) {
  if (!status) return 'aguardando';

  const statusNormalizado = String(status).toLowerCase();

  if (statusNormalizado === 'em_carencia' ||
      statusNormalizado === 'emcarencia') {
    return 'emCarencia';
  }

  if (statusNormalizado === 'liberado') {
    return 'liberado';
  }

  if (statusNormalizado === 'aguardando') {
    return 'aguardando';
  }

  return status;
}

// Converte o status da tela para o formato do backend.
function converterStatusBackend(status) {
  if (status === 'emCarencia') {
    return 'em_carencia';
  }

  return status;
}

// Adapta os campos recebidos do backend para o formato das telas.
function adaptarTalhao(talhao) {
  return {
    id: String(talhao.talhao_id ?? talhao._id ?? talhao.id ?? ''),
    nome: talhao.nome ?? '',
    cultura: talhao.cultura_nome ??
      talhao.cultura ??
      (talhao.cultura_id != null ? String(talhao.cultura_id) : ''),
    cultura_id: talhao.cultura_id ?? null,
    area: Number(talhao.area ?? 0),
    safra: talhao.safra ?? '',
    dataInicio: formatarDataAPI(
      talhao.inicio_cultivo ?? talhao.dataInicio
    ),
    previsao_colheita: formatarDataAPI(
      talhao.previsao_colheita
    ),
    observacoes: talhao.observacao ??
      talhao.observacoes ??
      '',
    status: converterStatusFrontend(talhao.status),
    produto: talhao.produto ?? null,
    dataAplicacao: talhao.dataAplicacao ?? null
  };
}

// Converte os campos da tela para o formato esperado pelo backend.
function prepararDadosTalhao(dados) {
  return {
    nome: dados.nome,
    area: Number(dados.area),
    inicio_cultivo: dados.inicio_cultivo ?? dados.dataInicio,
    safra: dados.safra,
    previsao_colheita: dados.previsao_colheita,
    observacao: dados.observacao ?? dados.observacoes ?? '',
    cultura_id: Number(dados.cultura_id)
  };
}

// Lê os dados da propriedade da conta.
function carregarPropriedadeConta() {
  try {
    const salvo = localStorage.getItem('minhaColheita.propriedadeConta');

    if (salvo === null) {
      return {
        id: 'sao-luis',
        nome: 'Fazenda São Luís',
        areaTotal: 66.3
      };
    }

    const propriedade = JSON.parse(salvo);

    if (
      !propriedade ||
      typeof propriedade.id !== 'string' ||
      typeof propriedade.nome !== 'string' ||
      !(propriedade.areaTotal > 0)
    ) {
      throw new Error('Propriedade inválida.');
    }

    return propriedade;

  } catch (erro) {
    mostrarMensagem('Não foi possível carregar a propriedade. Tente novamente.');
    return null;
  }
}

// Mostra o nome da propriedade no menu lateral.
function mostrarPropriedadeConta() {
  const elemento = document.querySelector('.propriedade');

  if (elemento) {
    elemento.textContent = propriedadeConta?.nome ?? 'Propriedade indisponível';
  }
}

// Consulta os talhões cadastrados na API.
async function carregarTalhoes() {
  try {
    const dados = await requisicaoAPI('/consultarTalhoes');

    // Aceita tanto uma lista direta quanto uma lista dentro de uma propriedade.
    const lista = Array.isArray(dados)
      ? dados
      : dados?.talhoes;

    if (!Array.isArray(lista)) {
      throw new Error('A API retornou uma lista de talhões inválida.');
    }

    talhoes = lista.map(adaptarTalhao);

    return talhoes;

  } catch (erro) {
    mostrarMensagem(erro.message || 'Não foi possível carregar os talhões.');
    throw erro;
  }
}

// Cadastra um talhão na API.
async function cadastrarTalhaoAPI(dados) {
  const dadosBackend = prepararDadosTalhao(dados);

  const resposta = await requisicaoAPI('/cadastroTalhao', {
    method: 'POST',
    body: JSON.stringify(dadosBackend)
  });

  return resposta;
}

// Edita um talhão na API.
async function editarTalhaoAPI(id, dados) {
  const dadosBackend = prepararDadosTalhao(dados);

  const resposta = await requisicaoAPI(
    '/editarTalhao/' + encodeURIComponent(id),
    {
      method: 'PUT',
      body: JSON.stringify(dadosBackend)
    }
  );

  return resposta;
}

// Exclui um talhão na API.
async function excluirTalhaoAPI(id) {
  const resposta = await requisicaoAPI(
    '/removerTalhao/' + encodeURIComponent(id),
    {
      method: 'DELETE'
    }
  );

  // Atualiza a lista que está em memória.
  talhoes = talhoes.filter(talhao => talhao.id !== String(id));

  return resposta;
}

// Busca um talhão pelo identificador na lista carregada.
function procurarTalhao(id) {
  for (const talhao of talhoes) {
    if (String(talhao.id) === String(id)) {
      return talhao;
    }
  }

  return null;
}

// Busca um talhão diretamente na API.
async function buscarTalhaoAPI(id) {
  const dados = await requisicaoAPI(
    '/buscarTalhao/' + encodeURIComponent(id)
  );

  const talhao = dados?.talhao ?? dados;

  return adaptarTalhao(talhao);
}

// Formata o número com vírgula e uma casa decimal.
function formatarNumero(numero) {
  return Number(numero).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

// Junta o número formatado com a unidade ha.
function formatarArea(area) {
  return formatarNumero(area) + ' ha';
}

// Recebe o código do status e usa esse código como classe CSS.
function criarEtiquetaStatus(status) {
  if (!NOMES_STATUS[status]) {
    return '<span class="etiqueta-status">Status não informado</span>';
  }

  return '<span class="etiqueta-status ' +
    status + '">' +
    NOMES_STATUS[status] +
    '</span>';
}

// Exibe uma mensagem temporária.
function mostrarMensagem(texto) {
  const mensagem = document.createElement('div');

  mensagem.className = 'mensagem-temporaria';
  mensagem.textContent = texto;
  mensagem.setAttribute('role', 'status');

  document.body.appendChild(mensagem);

  function removerMensagem() {
    mensagem.remove();
  }

  setTimeout(removerMensagem, 4000);
}

// Impede que um texto digitado seja interpretado como HTML.
function protegerTexto(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Abre o alerta de sucesso.
function mostrarAlertaSucesso(texto) {
  const titulo = document.querySelector('#titulo-alerta-sucesso');

  if (titulo) {
    titulo.textContent = texto;
  }

  if (alertaSucesso?.showModal) {
    alertaSucesso.showModal();
  }
}

// Fecha a janela de alerta e devolve o foco à página.
function fecharAlertaSucesso() {
  if (alertaSucesso?.open) {
    alertaSucesso.close();
  }
}

if (botaoFecharSucesso) {
  botaoFecharSucesso.addEventListener('click', fecharAlertaSucesso);
}

// Quando não houver um valor, mostra um traço.
function mostrarValorOuTraco(valor) {
  if (valor == null || valor === '') {
    return '—';
  }

  return valor;
}

// Mostra uma falha de carregamento da propriedade.
function mostrarErroPropriedade() {
  const elemento = document.querySelector('.propriedade');

  if (elemento) {
    elemento.textContent = 'Propriedade indisponível';
  }

  mostrarErroCarregamento('Não foi possível carregar a propriedade');
}

// Quando há erro de carregamento, esconde o conteúdo da tela.
function mostrarErroCarregamento(tituloErro) {
  const conteudo = document.querySelector('main');

  if (conteudo) {
    conteudo.hidden = true;
  }

  const aviso = document.createElement('main');

  const titulo = document.createElement('h1');
  titulo.textContent = tituloErro;

  const mensagem = document.createElement('p');
  mensagem.setAttribute('role', 'alert');
  mensagem.textContent =
    'Ocorreu uma falha ao ler os dados. Tente novamente. Seus cadastros não foram apagados.';

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao';
  botao.textContent = 'Tentar novamente';

  botao.addEventListener('click', tentarCarregarNovamente);

  aviso.appendChild(titulo);
  aviso.appendChild(mensagem);
  aviso.appendChild(botao);

  document.body.appendChild(aviso);
}

// Recarrega a página para tentar ler os dados novamente.
function tentarCarregarNovamente() {
  window.location.reload();
}
