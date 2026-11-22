// Beatriz Ferreira Sasaki - RA: 25016735

// Declaração das variáveis.
const tabela = document.querySelector('#tabela-talhoes');
const corpoTabela = tabela.querySelector('tbody');
const campoBusca = document.querySelector('#busca');

// ID guardado enquanto a confirmação de exclusão estiver aberta.
// null significa que não há exclusão pendente.
let idParaExcluir = null;

// Cria uma linha da tabela com os dados de um talhão.
function criarLinhaTalhao(talhao) {
    // O ID no link diz à página de detalhes qual talhão abrir.
    const endereco = 'paginaTalhao.html?id=' + encodeURIComponent(talhao.id);

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

// Refaz as linhas da tabela usando a busca e os filtros atuais.
function mostrarTalhoes() {
    // Limpa as linhas antigas antes de desenhar a lista novamente.
    corpoTabela.innerHTML = '';

    const cultura = document.querySelector('#filtro-cultura').value;
    const status = document.querySelector('#filtro-status').value;
    const safra = document.querySelector('#filtro-safra').value;

    // Texto digitado na busca, convertido para minúsculas.
    const busca = campoBusca.value.toLocaleLowerCase('pt-BR');

    let quantidadeEncontrada = 0;

    // Percorre os talhões recebidos da API.
    for (const talhao of talhoes) {
        const texto = (
            talhao.nome + ' ' + talhao.cultura
        ).toLocaleLowerCase('pt-BR');

        // Verifica se os valores correspondem aos filtros selecionados.
        if (
            texto.includes(busca) &&
            (cultura === '' || cultura === talhao.cultura) &&
            (status === '' || status === talhao.status) &&
            (safra === '' || safra === String(talhao.safra))
        ) {
            const linha = criarLinhaTalhao(talhao);

            adicionarAcoes(linha, talhao);

            corpoTabela.appendChild(linha);

            quantidadeEncontrada++;
        }
    }

    // Mostra ou esconde o aviso de lista vazia.
    const avisoVazio = document.querySelector('#sem-resultado');

    if (avisoVazio) {
        avisoVazio.hidden = quantidadeEncontrada !== 0;
    }

    // Atualiza a quantidade total de talhões.
    document.querySelector('#quantidade-talhoes').textContent =
        talhoes.length;

    // Atualiza os contadores de cada status.
    atualizarContadores();
}

// Conta quantos talhões existem em cada status.
function atualizarContadores() {
    const contadores = document.querySelectorAll('[data-count]');

    for (const contador of contadores) {
        const status = contador.dataset.count;

        let quantidade = 0;

        for (const talhao of talhoes) {
            if (talhao.status === status) {
                quantidade++;
            }
        }

        contador.textContent = quantidade;
    }
}

// Coloca o link de edição e o botão de excluir na linha.
function adicionarAcoes(linha, talhao) {
    // Cria coluna sobre a última aplicação e a data realizada.
    const aplicacao = document.createElement('td');

    aplicacao.innerHTML =
        '<strong>' +
        protegerTexto(mostrarValorOuTraco(talhao.produto)) +
        '</strong>' +
        '<small class="data-aplicacao">' +
        protegerTexto(mostrarValorOuTraco(talhao.dataAplicacao)) +
        '</small>';

    linha.appendChild(aplicacao);

    // Adiciona na tabela a ação de editar.
    const acoes = document.createElement('td');

    acoes.className = 'acoes';

    const link = document.createElement('a');

    link.className = 'botao-icone';
    link.href = 'cadastroTalhao.html?id=' + encodeURIComponent(talhao.id);
    link.title = 'Editar talhão';
    link.setAttribute('aria-label', 'Editar ' + talhao.nome);

    link.innerHTML =
        '<svg class="icone-lucide" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.5z"/>' +
        '<path d="m15 5 4 4"/>' +
        '</svg>';

    acoes.appendChild(link);

    // Adiciona a ação de excluir na tabela.
    const botaoExcluir = document.createElement('button');

    botaoExcluir.type = 'button';
    botaoExcluir.className = 'botao-icone';
    botaoExcluir.setAttribute('aria-label', 'Excluir ' + talhao.nome);

    botaoExcluir.innerHTML =
        '<svg class="icone-lucide" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M3 6h18"/>' +
        '<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>' +
        '<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>' +
        '<path d="M10 11v6"/>' +
        '<path d="M14 11v6"/>' +
        '</svg>';

    function excluirAoClicar() {
        excluirTalhao(talhao.id);
    }

    botaoExcluir.addEventListener('click', excluirAoClicar);

    acoes.appendChild(botaoExcluir);

    linha.appendChild(acoes);
}

// Abre a janela de confirmação para o talhão escolhido.
function excluirTalhao(id) {
    const talhao = procurarTalhao(id);

    if (talhao === null) {
        return;
    }

    // Guarda qual ID será excluído.
    idParaExcluir = id;

    document.querySelector('#descricao-alerta-exclusao').textContent =
        talhao.nome + ' será excluído. Esta ação não poderá ser desfeita.';

    // Abre a janela de confirmação.
    document.querySelector('#alerta-exclusao').showModal();
}

// Fecha a confirmação sem excluir o talhão.
function cancelarExclusao() {
    document.querySelector('#alerta-exclusao').close();
}

// Exclui o talhão escolhido utilizando a API.
async function confirmarExclusao() {
    if (idParaExcluir === null) {
        return;
    }

    const botaoConfirmar = document.querySelector('#confirmar-exclusao');

    // Evita múltiplas solicitações de exclusão.
    botaoConfirmar.disabled = true;

    try {
        // Envia a solicitação DELETE para o backend.
        await excluirTalhaoAPI(idParaExcluir);

        // Atualiza a lista na tela.
        talhoes = talhoes.filter(
            talhao => String(talhao.id) !== String(idParaExcluir)
        );

        // Fecha a janela de confirmação.
        document.querySelector('#alerta-exclusao').close();

        // Atualiza a tabela e os contadores.
        mostrarTalhoes();

        // Mostra a confirmação de sucesso.
        mostrarAlertaSucesso('Talhão excluído com sucesso!');

    } catch (erro) {
        mostrarMensagem(
            erro.message || 'Não foi possível excluir o talhão.'
        );

    } finally {
        botaoConfirmar.disabled = false;
    }
}

// Evita que uma exclusão antiga continue selecionada.
function limparExclusaoPendente() {
    idParaExcluir = null;
}

// Monta as opções dos filtros de Cultura e Safra.
function atualizarOpcoesFiltros() {
    mostrarPropriedadeConta();

    // Conjunto de culturas sem repetições.
    const culturas = new Set();

    // Conjunto de safras sem repetições.
    const safras = new Set();

    for (const talhao of talhoes) {
        culturas.add(talhao.cultura);

        if (talhao.safra) {
            safras.add(String(talhao.safra));
        }
    }

    // Preenche os seletores.
    preencherFiltro('#filtro-cultura', culturas);
    preencherFiltro('#filtro-safra', safras);
}

// Coloca as opções recebidas dentro de um seletor.
function preencherFiltro(seletor, valores) {
    const campo = document.querySelector(seletor);

    campo.innerHTML = '<option value="">Todas</option>';

    // Cria uma opção para cada valor recebido.
    for (const valor of valores) {
        const opcao = document.createElement('option');

        opcao.value = valor;
        opcao.textContent = valor;

        campo.appendChild(opcao);
    }

    // Deixa a opção Todas selecionada.
    campo.value = '';
}

// Limpa a busca e os filtros.
function limparFiltros() {
    campoBusca.value = '';

    document.querySelector('#filtro-cultura').value = '';
    document.querySelector('#filtro-status').value = '';
    document.querySelector('#filtro-safra').value = '';

    mostrarTalhoes();
}

// Carrega os dados da API e inicia a tela.
async function iniciarPagina() {
    if (propriedadeConta === null) {
        mostrarErroPropriedade();
        return;
    }

    try {
        // Consulta os talhões reais do banco de dados.
        talhoes = await carregarTalhoes();

        mostrarPropriedadeConta();

        // Preenche os filtros com os dados recebidos.
        atualizarOpcoesFiltros();

        // Exibe os talhões na tabela.
        mostrarTalhoes();

    } catch (erro) {
        console.error('Erro ao carregar talhões:', erro);

        mostrarErroCarregamento(
            'Não foi possível carregar os talhões'
        );
    }
}

// Eventos da busca e dos filtros.
campoBusca.addEventListener('input', mostrarTalhoes);

document.querySelector('#cancelar-exclusao')
    .addEventListener('click', cancelarExclusao);

document.querySelector('#confirmar-exclusao')
    .addEventListener('click', confirmarExclusao);

document.querySelector('#alerta-exclusao')
    .addEventListener('close', limparExclusaoPendente);

document.querySelector('#filtro-cultura')
    .addEventListener('change', mostrarTalhoes);

document.querySelector('#filtro-status')
    .addEventListener('change', mostrarTalhoes);

document.querySelector('#filtro-safra')
    .addEventListener('change', mostrarTalhoes);

document.querySelector('#limpar-filtros')
    .addEventListener('click', limparFiltros);

// Inicia a página.
iniciarPagina();
