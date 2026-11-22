// Beatriz Naomi Ferreira Sasaki - RA: 25016735

//Variaveis usadas
let talhaoSelecionado = null;
// Botão para registrar a colheita
const botaoColheita = document.querySelector('#registrar-colheita');
// Lista de aplicações do talhão exibido.
let historicoAplicacoes = [];
// estado inicial do talhão
let statusAplicacoes= 'aguardando';

const ICONES_TALHAO = {
  "confirmacao": "<path d=\"M20 6 9 17l-5-5\"/>",
  "calendario": "<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>",
  "comemoracao": "<path d=\"M5.8 11.3 2 22l10.7-3.79\"/><path d=\"M4 3h.01\"/><path d=\"M22 8h.01\"/><path d=\"M15 2h.01\"/><path d=\"M22 20h.01\"/><path d=\"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 2.8 2.9 2.9 0 0 1-.8 2L16 9\"/><path d=\"m22 13-.82-.33a2.9 2.9 0 0 0-3.09.67L17 14\"/><path d=\"m11 2 .33.82a2.9 2.9 0 0 1-.67 3.09L10 7\"/><path d=\"M11 13c1.93 1.93 2.83 4.17 2 5s-3.07-.07-5-2-2.83-4.17-2-5 3.07.07 5 2Z\"/>",
  "relogio": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>"
};

// Mostra o talhão escolhido no link da listagem
async function mostrarDetalhes(){
    // lê o id da url
    const parametros = new URLSearchParams(window.location.search);
    // Identificador usado para escolher um único talhão
    let id = parametros.get('id');
    if (id === null) {
        document.querySelector('main').innerHTML =
        '<a class="voltar" href="listagemTalhao.html">← Voltar para Talhões</a>' +
        '<h1>Nenhum talhão foi informado</h1>';
    return;
    }
    try {
        talhaoSelecionado = await buscarTalhaoAPI(id);
    } catch (erro) {
        talhaoSelecionado = null;
    }

    // Confere se o talhão foi encontrado
    if (talhaoSelecionado === null) {
        document.querySelector('main').innerHTML =
        '<a class="voltar" href="listagemTalhao.html">← Voltar para Talhões</a>' +
        '<h1>Talhão não encontrado</h1>';
        return;
    }

    mostrarPropriedadeConta();
    //preenche a tela de detalhes com os dados do talhão selecionado
    document.querySelector('#titulo-talhao').textContent = talhaoSelecionado.nome;
    document.querySelector('#cultura-subtitulo').textContent = talhaoSelecionado.cultura;
    document.querySelector('#area-subtitulo').textContent = formatarArea(talhaoSelecionado.area);

    document.querySelector('#cultura-aplicacao').textContent = talhaoSelecionado.cultura;
    document.querySelector('#cultura-talhao').textContent = talhaoSelecionado.cultura;
    document.querySelector('#area-talhao').textContent = formatarNumero(talhaoSelecionado.area);
    document.querySelector('#id-talhao').textContent = talhaoSelecionado.id;

    await mostrarHistorico();
    destacarStatus();
    configurarColheita();
    // Quando acontecer o evento click, chama a função registrarColheita; sem parênteses, ela não executa agora.
    botaoColheita.addEventListener('click', registrarColheita);
}

// Destaca visualmente a etiqueta que corresponde ao status do talhão
function destacarStatus(){
    // Encontra todos os elementos do HTML que correspondem ao data-status
    const indicadores = document.querySelectorAll('[data-status]');
    for(const indicador of indicadores){
        //Compara dois valores - status representado pela etiqueta e status do talhão que está aberto
        if (indicador.dataset.status === statusAplicacoes) {
            indicador.classList.add('selected');
        } else {
            indicador.classList.remove('selected');
        }
    }
}

function adaptarAplicacao(aplicacao) {
    const liberacao = formatarDataAPI(aplicacao.data_liberacao_colheita);
    let status = 'liberado';

    if (aplicacao.status === 'realizada' && liberacao > obterDataHoje()) {
        status = 'emCarencia';
    }

    return {
        data: formatarDataAPI(aplicacao.data_aplicacao),
        produto: aplicacao.marca,
        dose: (String(aplicacao.dosagem).replace('.', ',') + ' ' + (aplicacao.unidade ?? '')).trim(),
        carencia: aplicacao.periodo_carencia,
        status: status
    };
}

async function carregarHistorico(){
    const dados = await requisicaoAPI(
        '/consultarAplicacoes/' + encodeURIComponent(talhaoSelecionado.id)
    );

    if (!dados || !Array.isArray(dados.aplicacoes)) throw new Error('Histórico inválido.');

    return dados.aplicacoes.map(adaptarAplicacao);
}

// Carrega o histórico e mostra os registros que passam pelos filtros
async function mostrarHistorico(){
    try{
        historicoAplicacoes = await carregarHistorico();
        statusAplicacoes = obterStatusAplicacoes();
        mostrarTabelaHistorico();
    }catch(erro){
        mostrarErroCarregamento('Não foi possível carregar o histórico.');
        throw erro;
    }
}

//escolhe quais aplicações do talhão aparecem na tabela
// conforme a palavra digitada e as datas escolhidas
function mostrarTabelaHistorico(){
   
    const corpoTabela = document.querySelector('#historico');
    // Remove o conteúdo antigo para preencher o elemento novamente
    corpoTabela.innerHTML = '';
    let quantidade = 0;

        // verifica cada aplicação e cria uma linha na tabela somente para as que passam pelos filtros
        for (const aplicacao of historicoAplicacoes) {
            // Pula o registro se ele não existir, se a data não for texto ou se o status não for conhecido
            if (!aplicacao || typeof aplicacao.data !== 'string' || !NOMES_STATUS[aplicacao.status]) continue;
        
            // Linha tr que receberá as células da tabela
            const linha = document.createElement('tr');
            const partes = aplicacao.data.split('-');
            let carencia = aplicacao.carencia + ' dias';

            adicionarCelulaHistorico(
                linha,
                partes[2] + '/' + partes[1] + '/' + partes[0]
            );
            adicionarCelulaHistorico(linha, aplicacao.produto);
            adicionarCelulaHistorico(linha, aplicacao.dose);
            adicionarCelulaHistorico(linha, carencia);
            // cria celula
            const celulaStatus = document.createElement('td');
            //acrescentam as células de produto, dose e carência
            celulaStatus.innerHTML = criarEtiquetaStatus(aplicacao.status);
            //Coloca a etiqueta de status dentro da célula
            linha.appendChild(celulaStatus);
            //Coloca a célula de status dentro da linha
            corpoTabela.appendChild(linha);
            quantidade = quantidade + 1;      
    }
    // Controla a visibilidade a partir da quantidade de aplicações exibidas
    //Se houver aplicações, esconde o aviso
    document.querySelector('#historico-vazio').hidden = quantidade > 0 ;
    //Se não houver aplicações, esconde a tabela
    document.querySelector('.tabela-historico-container').hidden = quantidade === 0;
}

// Cria uma célula de texto e a coloca na linha da tabela.
function adicionarCelulaHistorico(linha, texto) {
  const celula = document.createElement('td');
  celula.textContent = texto;
  linha.appendChild(celula);
}

//Mostra se o registro de colheita está disponível
// Atualiza o botão e o aviso de acordo com a liberação 
// Depois usar o status de liberação e o registro de colheita retornados pelo backend
function configurarColheita(){
    atualizarAvisoTalhao();
    // guarda true se o talhão estiver liberado
    const liberado = statusAplicacoes==='liberado';
    const registrada = Boolean(talhaoSelecionado.colheita);
    const painel = document.querySelector('#painel-colheita');
    // esconde o painel de colheita quando não está liberado e também não tem colheita registrada
    painel.hidden = statusAplicacoes === 'aguardando' || (!liberado && !registrada);
    //Adiciona a classe colheita-registrada quando registrada é true
    painel.classList.toggle('colheita-registrada', registrada);
    botaoColheita.disabled = !liberado  || registrada;
    botaoColheita.hidden = registrada;
    document.querySelector('#quantidade-colheita').hidden = registrada;
    botaoColheita.textContent = 'Registrar colheita';
    document.querySelector('#titulo-colheita').textContent =
        registrada ? 'Colheita registrada com sucesso!' : 'Registrar colheita';

    document.querySelector('#descricao-colheita').textContent =
        registrada
            ? 'O histórico de conformidade foi atualizado.'
            : 'Confirme a colheita para atualizar o histórico de conformidade.';
    // escolhe o desenho ícon
    document.querySelector('#icone-colheita').innerHTML = registrada ?
    ICONES_TALHAO.comemoracao : ICONES_TALHAO.confirmacao;
}

//Selecionar o aviso adequado de acordo com o estado do talhao
// Confirma e salva a data da colheita no navegador
// Lê o status salvo, troca a classe, o ícone e os textos e mostra os complementos necessários
function atualizarAvisoTalhao() {
    const aviso = document.querySelector('#aviso-talhao');
    const icone = document.querySelector('#icone-aviso');
    const titulo = document.querySelector('#titulo-aviso');
    const descricao = document.querySelector('#descricao-aviso');
    const detalhesCarencia = document.querySelector('#detalhes-carencia');
    const dados = obterDetalhesAplicacao();

    // preenche o painel de Ultima Aplicacao 
    document.querySelector('#painel-ultima-aplicacao').hidden = dados.aplicacao == null;
    if (dados.aplicacao !== null) {
        document.querySelector('#produto-aplicado').textContent = dados.aplicacao.produto;
    }
    document.querySelector('#data-aplicacao').textContent = '—';
    if (dados.aplicacao && lerDataAplicacao(dados.aplicacao.data)) {
        // para data válida aparece formatada
        document.querySelector('#data-aplicacao').textContent =
            dados.aplicacao.data.split('-').reverse().join('/');
    }

    document.querySelector('#modo-acao').textContent = mostrarValorOuTraco(dados.modo);
    document.querySelector('#dose-aplicada').textContent = mostrarValorOuTraco(dados.dose);
    document.querySelector('#periodo-carencia').textContent = '—';
    if (dados.periodo != null) {
        document.querySelector('#periodo-carencia').textContent = dados.periodo + ' dias';
    }

    // aviso da tela muda de acordo com o status dado do talhão
    // quando o talhão está liberado
    if (statusAplicacoes === 'liberado') {
        detalhesCarencia.hidden = true;
        aviso.className = 'aviso aviso-liberado';
        icone.innerHTML = ICONES_TALHAO.confirmacao;
        titulo.textContent = 'Colheita liberada';
        descricao.textContent =
            'O período de carência foi concluído. Este talhão está autorizado para colheita e comercialização.';
    // quando o talhão estiver em periodo de carência
    }else if(statusAplicacoes==='emCarencia'){
        aviso.className = 'aviso aviso-carencia';
        icone.innerHTML = ICONES_TALHAO.calendario;
        titulo.textContent = 'Em período de carência';
        descricao.textContent = 'A colheita só poderá ser realizada após o fim do período de carência.';
        mostrarProgressoCarencia(dados);
    // quando o talhão estiver aguardando
    } else if (statusAplicacoes === 'aguardando') {
        aviso.className = 'aviso aviso-aguardando';
        icone.innerHTML = ICONES_TALHAO.relogio;
        titulo.textContent = 'Aguardando';
        descricao.textContent = 'O talhão está aguardando uma aplicação para iniciar o controle.';
    }
}

function obterStatusAplicacoes() {
  if (!NOMES_STATUS[talhaoSelecionado.status]) return 'aguardando';
  return talhaoSelecionado.status;
}


//encontra a aplicação mais recente e reúne os dados dela
// backend deve fazer o cálculo da previsão de liberação e dos dias restantes 
function obterDetalhesAplicacao() {
    let ultima=null;
    // Percorre todas as aplicações do histórico, uma por vez
    for (const aplicacao of historicoAplicacoes) {
        if (!aplicacao || !lerDataAplicacao(aplicacao.data)) continue;
        // Escolhe a aplicação se nenhuma foi escolhida ou a data dela é mais recenta que a atual escolhida
        if (ultima === null || aplicacao.data > ultima.data) ultima = aplicacao;
    }
    // Cria o objeto que será devolvido
    const dados = {aplicacao:ultima, periodo:null, modo:null, dose:null,
    periodoAviso:null, restantes:null, previsao:null};
    //Se nenhuma aplicação válida foi encontrada, devolve esse objeto com os campos vazios
    if (ultima === null) return dados;

    dados.periodo = ultima.carencia;
    dados.modo = ultima.modo;
    dados.dose = ultima.dose;

    //Verifica se a carência é um número inteiro maior ou igual a zero
    dados.previsao =
    Number.isInteger(ultima.carencia) && ultima.carencia >= 0
        ? calcularPrevisaoColheita(ultima.data, ultima.carencia)
        : null;

    if (dados.previsao !== null) {
        dados.periodoAviso = ultima.carencia;
        dados.restantes = Math.max(0, Math.ceil(
        //Subtrai previsão − hoje, javascript dá o resultado em milissegungos
        //Divide por 86400000, a quantidade de milissegundos de um dia
        (lerDataAplicacao(dados.previsao) - lerDataAplicacao(obterDataHoje())) / 86400000
        ));
    }
    return dados;
}

// confere se o texto é uma data válida e o transforma em uma data do JavaScript
function lerDataAplicacao(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const data = new Date(texto + 'T00:00:00Z');
  if (!Number.isFinite(data.getTime()) || data.toISOString().slice(0, 10) !== texto) return null;
  return data;
}

// Mostra na barra os valores já calculados por obterDetalhesAplicacao.
function mostrarProgressoCarencia(dados) {
    const periodo = dados.periodo;
    const restantes = dados.restantes;
    //Interrompe a função se faltar alguma informação necessária ou houver um valor inválido
    if (!dados.aplicacao || !dados.previsao || !Number.isInteger(periodo) || periodo <= 0 ||
        !Number.isFinite(restantes) || restantes < 0) return;
    //Calcula quantos dias já passaram
    const decorridos = Math.max(0, Math.min(periodo, periodo - restantes));
    const barra = document.querySelector('#progresso-carencia');
    barra.max = periodo;
    barra.value = decorridos;
    barra.setAttribute('aria-valuetext', decorridos + ' de ' + periodo + ' dias decorridos');

    document.querySelector('#detalhes-carencia').hidden = false;
    document.querySelector('#dias-decorridos').textContent = decorridos;
    document.querySelector('#periodo-total').textContent = periodo;
    document.querySelector('#dias-restantes').textContent = restantes + ' dias restantes';
    document.querySelector('#dias-totais').textContent = periodo;
    document.querySelector('#inicio-carencia').textContent = dados.aplicacao.data.split('-').reverse().join('/');
    document.querySelector('#previsao-liberacao').textContent = dados.previsao.split('-').reverse().join('/');
}


async function registrarColheita(){
    // se o talhão não estiver liberado
    if (statusAplicacoes !== 'liberado') {
        mostrarMensagem('Colheita não permitida: o talhão ainda não está liberado para colheita.');
        return;
    }
    if(talhaoSelecionado.colheita) return;

    const campoQuantidade = document.querySelector('#quantidade-colheita');
    const quantidade = Number(campoQuantidade.value);

    if (!(quantidade > 0)) {
        mostrarMensagem('Informe a quantidade colhida.');
        campoQuantidade.focus();
        return;
    }

    botaoColheita.disabled = true;

    try {
        await requisicaoAPI('/colheitas', {
            method: 'POST',
            body: JSON.stringify({
                talhaoId: talhaoSelecionado.id,
                dataColheita: obterDataHoje(),
                quantidade: quantidade
            })
        });
    } catch (erro) {
        botaoColheita.disabled = false;
        mostrarMensagem(erro.message || 'Não foi possível registrar a colheita.');
        return;
    }

    talhaoSelecionado.colheita = new Date().toISOString();
    talhaoSelecionado.status = 'aguardando';

    await mostrarHistorico();
    destacarStatus();
    configurarColheita();
    mostrarAlertaSucesso('Colheita registrada com sucesso!');
}

// carregamento da página
// Só inicia a tela se os dados da propriedade forem carregados
async function iniciarPagina() {
    if (propriedadeConta === null) {
        mostrarErroPropriedade();
        return;
    }

    try {
        await mostrarDetalhes();
    } catch (erro) {
        console.error('Erro ao iniciar a página:', erro);
    }
}

iniciarPagina();
