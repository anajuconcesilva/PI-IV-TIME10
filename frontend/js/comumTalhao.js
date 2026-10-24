// Beatriz Naomi Ferreira Sasaki - RA: 25016735
// Arquivo de scripts comum entre as telas - cadastroTalhao, listagemTalhao e paginaTalhao

// Cada objeto abaixo representa um talhão de exemplo
//usada para demonstrar a tela sem banco de dados
//deixar de usar como fonte quando a API retornar os registros reais
const TALHOES_EXEMPLO = [
  {
    id: 'A1', propriedadeId: 'sao-luis', nome: 'Talhão A1', cultura: 'Soja', area: 14.2,
    safra: '2026', dataInicio: '2026-07-01',
    status: 'liberado', produto: 'Roundup Original', dataAplicacao: '28/08/2026'
  },
  {
    id: 'B2', propriedadeId: 'sao-luis', nome: 'Talhão B2', cultura: 'Milho', area: 8.5,
    safra: '2026', dataInicio: '2026-06-28',
    status: 'emCarencia', produto: 'Imidacloprid 700 WG', dataAplicacao: '08/10/2026'
  },
  {
    id: 'C3', propriedadeId: 'sao-luis', nome: 'Talhão C3', cultura: 'Tomate', area: 2.1,
    safra: '2026', dataInicio: '2026-03-04',
    status: 'emCarencia', produto: 'Acephate 750 BR', dataAplicacao: '12/10/2026'
  },
  {
    id: 'D4', propriedadeId: 'sao-luis', nome: 'Talhão D4', cultura: 'Café', area: 22.8,
    safra: '2026',dataInicio: '2026-02-14',
    status: 'aguardando', produto: null, dataAplicacao: null
  },
  {
    id: 'E5', propriedadeId: 'sao-luis', nome: 'Talhão E5', cultura: 'Feijão', area: 5,
    safra: '2026',dataInicio: '2026-03-17',
    status: 'liberado', produto: 'Dithane NT', dataAplicacao: '15/08/2026'
  }
];

// Usa a data local de hoje para acompanhar os dias de carência
function obterDataHoje() {
  const agora = new Date();
  return agora.getFullYear() + '-' + String(agora.getMonth()+1).padStart(2,'0') + '-' + String(agora.getDate()).padStart(2,'0');
}

// Soma a carência à data da aplicação para obter a previsão de liberação da colheita
function calcularPrevisaoColheita(dataAplicacao, periodoCarencia) {
  const data = new Date(dataAplicacao + 'T00:00:00Z');
  data.setUTCDate(data.getUTCDate() + periodoCarencia);
  return data.toISOString().slice(0,10);
}

// Relaciona os códigos de status ao texto mostrado na tela
const NOMES_STATUS = {
  liberado: 'Liberado',
  emCarencia: 'Em carência',
  aguardando: 'Aguardando'
};

// Esta chave guarda os talhões locais
// Na integração, a API será a fonte dos registros
const CHAVE_ARMAZENAMENTO = 'minhaColheita.fields';
let talhoes = [];
const propriedadeConta = carregarPropriedadeConta();
const alertaSucesso = document.querySelector('#alerta-sucesso');
const botaoFecharSucesso = document.querySelector('#fechar-alerta-sucesso');

// Lê os dados da propriedade da conta
// Com a API, Trocar a leitura do localStorage pela consulta da propriedade da conta autenticada
function carregarPropriedadeConta(){
    try{
        const salvo = localStorage.getItem('minhaColheita.propriedadeConta');
        if (salvo === null) return {id:'sao-luis',nome:'Fazenda São Luís',areaTotal:66.3};
        const propriedade = JSON.parse(salvo);
        if (!propriedade|| typeof propriedade.id !== 'string' || typeof propriedade.nome !== 'string' || !(propriedade.areaTotal > 0)) {
          throw new Error('Propriedade inválida.');
        }
        return propriedade

    }catch(erro){
        mostrarMensagem('Não foi possível carregar a propriedade. Tente novamente.');
        return null;
    }
}

// Mostra o nome da propriedade no menu lateral
function mostrarPropriedadeConta() {
  document.querySelector('.propriedade').textContent = propriedadeConta.nome;
}

// substituir a leitura local pela consulta à API
// Carrega lista de talhões
function carregarTalhoes(){
    try{
        // recebe a lista inteira de talhões do armazenamento do navegador
        //os talhões desse exemplo são de 1 única propriedade
        const listaSalva = localStorage.getItem(CHAVE_ARMAZENAMENTO);

        // Primeiro acesso: ainda não existe lista salva.
        // Usamos os exemplos apenas enquanto o projeto não tem API.
        if (listaSalva === null) {
        return structuredClone(TALHOES_EXEMPLO);
        }
        const dadosSalvos = JSON.parse(listaSalva);

        if (!Array.isArray(dadosSalvos)) {
            throw new Error('A lista de talhões está em um formato inválido.');
        }
         
        //Examina um talhão por vez
        for (const talhao of dadosSalvos) {
            if (!talhao || typeof talhao.id !== 'string' ||
                typeof talhao.nome !== 'string' || !Number.isFinite(talhao.area)) {
                    throw new Error('Um dos talhões possui dados inválidos.');
                }
        }
        //Se nenhum problema foi encontrado, devolve a lista para a página usar
        return dadosSalvos;
        
    }catch(erro){
        mostrarMensagem('Não foi possível carregar os Talhões. Tente novamente.');
        return null;
    }
}

// Tenta salvar a nova lista e informa se o salvamento deu certo
function salvarTalhoes(novaLista){
    try{
        const texto = JSON.stringify(novaLista);
        localStorage.setItem(CHAVE_ARMAZENAMENTO, texto);
        talhoes = novaLista;
        return true;

    }catch(error){
        mostrarMensagem('Não foi possível salvar');
        return false;
    }
}

// Procura na lista o talhão que possui o ID recebido
function procurarTalhao(id) {
  for (const talhao of talhoes) {
    if (talhao.id === id) {
      return talhao;
    }
  }
  return null;
}

// Formata o número com vírgula e uma casa decimal
function formatarNumero(numero) {
  // Converte o número para o formato brasileiro; as opções abaixo controlam as casas decimais.
  return Number(numero).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

// Junta o número formatado com a unidade ha
function formatarArea(area) {
  return formatarNumero(area) + ' ha';
}

// Recebe o código do status, usa esse código como classe CSS
function criarEtiquetaStatus(status) {
  if (!NOMES_STATUS[status]) return '<span class="etiqueta-status">Status não informado</span>';
  return '<span class="etiqueta-status ' + status + '">' + NOMES_STATUS[status] + '</span>';
}

// Exibe uma mensagem temporária 
function mostrarMensagem(texto) {
  // Elemento que vai mostrar o aviso temporário.
  const mensagem = document.createElement('div');
  mensagem.className = 'mensagem-temporaria';
  mensagem.textContent = texto;
  mensagem.setAttribute('role', 'status');
  document.body.appendChild(mensagem);

  // A função abaixo roda após 4 segundos
  function removerMensagem() {
    // Retira este elemento da página.
    mensagem.remove();
  }
  // Agenda a remoção da mensagem para daqui a 4 segundos, sem parar o restante da página.
  setTimeout(removerMensagem, 4000);
}

// O texto digitado deve aparecer como texto, sem virar uma tag HTML
function protegerTexto(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// abre alerta de sucesso
function mostrarAlertaSucesso(texto) {
  document.querySelector('#titulo-alerta-sucesso').textContent = texto;
  // Abre a janela de alerta e impede interagir com a página ao fundo.
  alertaSucesso.showModal();
}

// Fecha a janela de alerta e devolve o foco à página
function fecharAlertaSucesso() {
  alertaSucesso.close();
}

botaoFecharSucesso.addEventListener('click', fecharAlertaSucesso);

// Quando não houver um valor, invés de mostrar null ou vazio, mostra um traço
// se tiver valor, retorn o valor na tela
function mostrarValorOuTraco(valor) {
  if (valor == null || valor === '') {
    return '—';
  }
  return valor;
}

//  Mostrar uma falha de carregamento da propriedade
function mostrarErroPropriedade() {
  document.querySelector('.propriedade').textContent = 'Propriedade indisponível';
  mostrarErroCarregamento('Não foi possível carregar a propriedade');
}

//Quando há erro de carregamento, esconde o conteúdo da tela e mostra um aviso de erro com o botão “Tentar novamente”
function mostrarErroCarregamento(tituloErro) {
  const conteudo = document.querySelector('main');
  //Esconde o conteúdo original
  conteudo.hidden = true;
  // cria um espaço para o aviso
  const aviso = document.createElement('main');
  const titulo = document.createElement('h1');
  //Usa o texto recebido como parâmetro
  titulo.textContent = tituloErro;
  const mensagem = document.createElement('p');
  mensagem.setAttribute('role', 'alert');
  mensagem.textContent = 'Ocorreu uma falha ao ler os dados. Tente novamente. Seus cadastros não foram apagados.';
  // cria botão para tentar carregar novamente
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao';
  botao.textContent = 'Tentar novamente';
  botao.addEventListener('click', tentarCarregarNovamente);
  // coloca aviso na página 
  aviso.appendChild(titulo);
  aviso.appendChild(mensagem);
  aviso.appendChild(botao);
  document.body.appendChild(aviso);
}

// Recarrega a página para tentar ler os dados de novo, sem apagar
function tentarCarregarNovamente() {
  window.location.reload();
}