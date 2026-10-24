// Beatriz Naomi Ferreira Sasaki - RA: 25016735

// Declaração das variáveis 
const tabela = document.querySelector('#tabela-talhoes');
const corpoTabela = tabela.querySelector('tbody');
const campoBusca = document.querySelector('#busca');
// id guardado enquanto a confirmação de exclusão estiver aberta.
// null significa que não há exclusão pendente
let idParaExcluir = null;

// Cria uma linha da tabela com os dados de um talhão
// A API deve verificar depois se quem está logado tem permissão para consultar esse talhão.
function criarLinhaTalhao(talhao) {
    // O id no link diz à página de detalhes qual talhão abrir.
    const endereco = 'paginaTalhao.html?id=' + encodeURIComponent(talhao.id);
    // Linha tr que receberá as células da tabela.
    const linha = document.createElement('tr');

    linha.innerHTML = 
        '<td><a href="' + endereco + '">' +
        '<strong>' + protegerTexto(talhao.nome) + '</strong>' +
        '<small>' + protegerTexto(talhao.cultura) + '</small>' +
        '</a></td>' +
        '<td>' + formatarArea(talhao.area) + '</td>' +
        '<td>' + protegerTexto(talhao.safra) + '</td>' +
        '<td>' + criarEtiquetaStatus(talhao.status) + '</td>';

    return linha;
}

// Refaz as linhas da tabela usando a busca e os filtros atuais
function mostrarTalhoes(){
  // Limpa as linhas antigas antes de desenhar a lista novamente
    corpoTabela.innerHTML = '';
    const propriedade = propriedadeConta;
    const cultura = document.querySelector('#filtro-cultura').value;
    const status = document.querySelector('#filtro-status').value;
    const safra = document.querySelector('#filtro-safra').value;
    let totalPropriedade=0;

    // Texto digitado na busca, convertido para minúsculas.
    const busca = campoBusca.value.toLocaleLowerCase('pt-BR');
    let quantidadeEncontrada = 0;

    // Percorre talhoes, pegando um item por vez com o nome talhao.
    for (const talhao of talhoes) {
            const texto = (talhao.nome + ' ' + talhao.cultura).toLocaleLowerCase('pt-BR');
            if (talhao.propriedadeId !== propriedade.id) continue;
            totalPropriedade = totalPropriedade + 1;
            // verifica se os valores são iguais para criar linha na tabela 
            if (texto.includes(busca) && (cultura === '' || cultura === talhao.cultura) &&
                (status === '' || status === talhao.status) && (safra === '' || safra === String(talhao.safra))) {
                // Linha tr que receberá as células da tabela.
                const linha = criarLinhaTalhao(talhao);

                adicionarAcoes(linha, talhao);
                corpoTabela.appendChild(linha);
                quantidadeEncontrada = quantidadeEncontrada + 1;
            }
    }
    const avisoVazio = document.querySelector('#sem-resultado');
      if (quantidadeEncontrada === 0) {
            avisoVazio.hidden = false;
    } else {
            avisoVazio.hidden = true;
    }

    // Atualiza quantidade de talhões
    document.querySelector('#quantidade-talhoes').textContent = totalPropriedade;
    // Executa a contagem de quantos talhões existem em cada status
    atualizarContadores();
}

// Conta quantos talhões existem em cada status
// alterar código para status devolvidos pelo backend
function atualizarContadores(){
    const contadores= document.querySelectorAll('[data-count]');
    for(const contador of contadores){
        //usado para comparar o estado do talhão.
        const status = contador.dataset.count;
        // conta quantidades de registros
        let quantidade = 0;

         for (const talhao of talhoes) {
            if (talhao.status === status && talhao.propriedadeId === propriedadeConta.id) {
                quantidade = quantidade + 1;
            }
        }
        contador.textContent = quantidade;
    }
}

// Coloca o link de detalhes e o botão de excluir na linha
function adicionarAcoes(linha,talhao){
    // Cria coluna sobre última aplicação e data realizada
    const aplicacao=document.createElement('td');
     aplicacao.innerHTML = '<strong>' + protegerTexto(mostrarValorOuTraco(talhao.produto)) + '</strong>' +
    '<small class="data-aplicacao">' + protegerTexto(mostrarValorOuTraco(talhao.dataAplicacao)) + '</small>';
    linha.appendChild(aplicacao);

    // Adiciona na tabela, a ação de editar
    const acoes=document.createElement('td');
    acoes.className='acoes';
    const link= document.createElement('a');
    link.className='botao-icone';
    link.href='paginaTalhao.html?id=' + encodeURIComponent(talhao.id);
    link.title = 'Ver talhão';
    link.setAttribute('aria-label', 'Abrir ' + talhao.nome);
    link.innerHTML = '<svg class="icone-lucide" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/></svg>';
    acoes.appendChild(link);

    // Adiciona a ação de excluir na tabela
    const botaoExcluir= document.createElement('button');
    botaoExcluir.className = 'botao-icone';
    botaoExcluir.setAttribute('aria-label', 'Excluir ' + talhao.nome);
    botaoExcluir.innerHTML = '<svg class="icone-lucide" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';

    function excluirAoClicar(){
        excluirTalhao(talhao.id);
    }

    botaoExcluir.addEventListener('click', excluirAoClicar);
    acoes.appendChild(botaoExcluir);
    linha.appendChild(acoes);
}

// Abre a janela de confirmação para o talhão escolhido.
function excluirTalhao(id){
    const talhao = procurarTalhao(id);
    if (talhao === null) {
        return;
    }
    // guarda qual o id do talhão que será excluido
    idParaExcluir = id;
    document.querySelector('#descricao-alerta-exclusao').textContent =
    talhao.nome + ' será excluído. Esta ação não poderá ser desfeita.';
    // Abre a janela de alerta e impede interagir com a página ao fundo.
    document.querySelector('#alerta-exclusao').showModal();
}

// Fecha a confirmação sem excluir o talhão
function cancelarExclusao(){
    document.querySelector('#alerta-exclusao').close();
}


// Salva uma lista sem o talhão escolhido para exclusão
// deve com a conexão da api, substituir a criação e o salvamento de novaLista por uma operação de exclusão do ID escolhido
// backend deve validar a conta e o acesso 
function confirmarExclusao(){

    if (idParaExcluir === null) return;
    const novaLista = [];
    // Percorre talhoes, pegando um item por vez 
    for (const talhao of talhoes) {
        // acrescenta na lista apenas os talhões que forem diferentes do escolhido para excluir
        if (talhao.id !== idParaExcluir) {
            novaLista.push(talhao);
        }
    }

    //Tenta salvar a lista e só entra neste bloco se o salvamento der certo
    if (salvarTalhoes(novaLista)) {
        // Fecha a janela de alerta e devolve o foco à página
        document.querySelector('#alerta-exclusao').close();
        mostrarTalhoes();
        mostrarAlertaSucesso('Talhão excluído com sucesso!');
    }
}

//Evitar que uma exclusão antiga continue selecionada depois de fechar o alerta
function limparExclusaoPendente(){
    idParaExcluir = null;
}

// Carregando dados
// Só inicia a tela se os dados da propriedade forem carregados
if (propriedadeConta !== null) {
  talhoes = carregarTalhoes();

  if (talhoes !== null) {
    mostrarPropriedadeConta();
    atualizarOpcoesFiltros();
    mostrarTalhoes();
  } else {
    mostrarErroCarregamento('Não foi possível carregar os talhões');
  }
} else {
  mostrarErroPropriedade();
}

// Quando acontecer o evento input, chama a função mostrarTalhoes
campoBusca.addEventListener('input', mostrarTalhoes);

document.querySelector('#cancelar-exclusao').addEventListener('click', cancelarExclusao);
document.querySelector('#confirmar-exclusao').addEventListener('click', confirmarExclusao);
document.querySelector('#alerta-exclusao').addEventListener('close', limparExclusaoPendente);

// monta as opções dos filtros de Cultura e Safra usando os talhões cadastrados
function atualizarOpcoesFiltros(){
    mostrarPropriedadeConta();
    // Conjunto de culturas sem repetições para preencher o filtro.
    const culturas = new Set();
    // Conjunto de safras sem repetições para preencher o filtro.
    const safras = new Set();

    for (const talhao of talhoes) {
        //Verifica se esse talhão pertence à propriedade da conta
        if (talhao.propriedadeId === propriedadeConta.id) {
            // Adiciona sua cultura ao conjunto de culturas.
            culturas.add(talhao.cultura);
        // Se houver safra, adiciona ao conjunto de safras
        if (talhao.safra) safras.add(String(talhao.safra));
        }
    }
    //Coloca as opções recebidas dentro de um seletor
    preencherFiltro('#filtro-cultura', culturas);
    preencherFiltro('#filtro-safra', safras);
}

// Set guarda valores sem repetições, evitando opções duplicadas nos filtros.
// Coloca as opções recebidas dentro de um seletor.
function preencherFiltro(seletor, valores){
    const campo = document.querySelector(seletor);
    campo.innerHTML = '<option value="">Todas</option>';

    // Cria uma opção de filtro para cada valor recebido
     for (const valor of valores) {
        const opcao = document.createElement('option');
        opcao.value = valor;
        // Atualiza apenas o texto deste elemento na página; não transforma o valor em tags HTML.
        opcao.textContent = valor;
        // Coloca o elemento criado dentro de outro elemento, para ele aparecer na página.
        campo.appendChild(opcao);
    } 
    // deixa o filtro todas selecionada
    campo.value = '';
}

// Limpa a busca e os filtros e mostra novamente os talhões
//Apaga a palavra digitada e escolhe a opção vazia de cultura, status e safra
function limparFiltros() {
  campoBusca.value = '';
  document.querySelector('#filtro-cultura').value = '';
  document.querySelector('#filtro-status').value = '';
  document.querySelector('#filtro-safra').value = '';
  mostrarTalhoes();
}

document.querySelector('#filtro-cultura').addEventListener('change', mostrarTalhoes);
document.querySelector('#filtro-status').addEventListener('change', mostrarTalhoes);
document.querySelector('#filtro-safra').addEventListener('change', mostrarTalhoes);
document.querySelector('#limpar-filtros').addEventListener('click', limparFiltros);