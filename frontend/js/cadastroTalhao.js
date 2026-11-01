// Beatriz Naomi Ferreira Sasaki - RA: 25016735

// Variáveis da página
const formulario = document.querySelector('#formulario');

const campoNome = formulario.elements.nome;
const campoCultura = formulario.elements.cultura;
const campoArea = formulario.elements.area;
const campoSafra = formulario.elements.safra;
const campoData = formulario.elements.dataInicio;
const campoObservacoes = formulario.elements.observacoes;

// Registro que está sendo editado.
// null indica um cadastro novo.
let talhaoEmEdicao = null;

// Soma dos hectares ocupados pelos talhões.
let areaUsada = 0;

// Culturas retornadas pela API.
let culturasDisponiveis = [];

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
        '<td>' + criarEtiquetaStatus(talhao.status) + '</td>';

    return linha;
}

// Consulta as culturas disponíveis na API.
async function carregarCulturas() {
    const resposta = await requisicaoAPI('/culturas');

    if (!Array.isArray(resposta)) {
        throw new Error('A API retornou uma lista de culturas inválida.');
    }

    culturasDisponiveis = resposta;

    return culturasDisponiveis;
}

// Procura a cultura pelo nome digitado.
function procurarCultura(nome) {
    const nomeNormalizado = nome.trim().toLowerCase();

    for (const cultura of culturasDisponiveis) {
        if (
            cultura.nome &&
            cultura.nome.trim().toLowerCase() === nomeNormalizado
        ) {
            return cultura;
        }
    }

    return null;
}

// Calcula a previsão de colheita usando o período de carência da cultura.
function obterPrevisaoColheita(dataInicio, cultura) {
    const periodoCarencia = Number(cultura.periodo_carencia);

    if (!Number.isFinite(periodoCarencia) || periodoCarencia < 0) {
        throw new Error(
            'Não foi possível obter o período de carência da cultura.'
        );
    }

    return calcularPrevisaoColheita(dataInicio, periodoCarencia);
}

// Prepara o formulário.
// Se houver um ID na URL, busca o talhão para edição.
async function prepararFormulario() {
    const parametros = new URLSearchParams(window.location.search);

    const idTalhao = parametros.get('id');

    if (idTalhao) {
        talhaoEmEdicao = await buscarTalhaoAPI(idTalhao);

        document.querySelector('#Titulo-formulario').textContent =
            'Editar talhão';

        document.querySelector('#enviar-formulario').textContent =
            'Salvar alterações';

        campoNome.value = talhaoEmEdicao.nome;
        campoCultura.value = talhaoEmEdicao.cultura;
        campoArea.value = talhaoEmEdicao.area;
        campoSafra.value = talhaoEmEdicao.safra;
        campoData.value = talhaoEmEdicao.dataInicio;
        campoObservacoes.value = talhaoEmEdicao.observacoes ?? '';
    }
}

// Soma as áreas já usadas e atualiza a tabela.
function mostrarResumoPropriedade() {
    const corpoTabela = document.querySelector('#talhoes-resumo');

    // Remove o conteúdo antigo para preencher a lista atualizada.
    corpoTabela.innerHTML = '';

    areaUsada = 0;

    const propriedade = propriedadeConta;

    mostrarPropriedadeConta();

    document.querySelector('#nome-propriedade').textContent =
        propriedade.nome;

    // Os talhões já vêm filtrados pelo backend conforme a conta autenticada.
    for (const talhao of talhoes) {
        areaUsada += Number(talhao.area);

        corpoTabela.appendChild(criarLinhaTalhao(talhao));
    }

    // Área total da propriedade menos a área já ocupada.
    let areaDisponivel = propriedade.areaTotal - areaUsada;

    if (areaDisponivel < 0) {
        areaDisponivel = 0;
    }

    let porcentagem = areaUsada / propriedade.areaTotal * 100;

    if (porcentagem > 100) {
        porcentagem = 100;
    }

    // Atualiza os campos de área usada e área disponível.
    document.querySelector('#area-usada').textContent =
        formatarNumero(areaUsada);

    document.querySelector('#area-disponivel').textContent =
        formatarNumero(areaDisponivel);

    // Ajusta a largura da barra usando a porcentagem calculada.
    document.querySelector('#total-usado').style.width =
        porcentagem + '%';
}

// Valida os campos e envia o cadastro ou as alterações para a API.
async function cadastrarTalhao(evento) {
    // Impede o envio padrão do formulário.
    evento.preventDefault();

    // Verifica os campos obrigatórios e os limites definidos.
    if (!formulario.reportValidity()) {
        return;
    }

    const nome = campoNome.value.trim();
    const culturaNome = campoCultura.value.trim();
    const area = Number(campoArea.value);
    const dataInicio = campoData.value;
    const safra = campoSafra.value.trim();
    const observacoes = campoObservacoes.value.trim();

    // Verifica a área disponível.
    let areaDisponivel = propriedadeConta.areaTotal - areaUsada;

    // Na edição, desconta a área do próprio talhão antes de validar.
    if (talhaoEmEdicao !== null) {
        areaDisponivel += Number(talhaoEmEdicao.area);
    }

    if (area > areaDisponivel) {
        campoArea.setCustomValidity(
            'A área disponível é ' + formatarArea(areaDisponivel) + '.'
        );

        campoArea.reportValidity();

        return;
    }

    // Verifica se o nome ficou vazio depois de remover os espaços.
    if (nome === '') {
        campoNome.setCustomValidity('Informe o nome do talhão.');
        campoNome.reportValidity();

        return;
    }

    if (culturaNome === '') {
        campoCultura.setCustomValidity('Informe a cultura do talhão.');
        campoCultura.reportValidity();

        return;
    }

    // Procura a cultura correspondente na lista da API.
    const culturaSelecionada = procurarCultura(culturaNome);

    if (culturaSelecionada === null) {
        campoCultura.setCustomValidity(
            'Informe uma cultura cadastrada no sistema.'
        );

        campoCultura.reportValidity();

        return;
    }

    // O backend espera o identificador numérico da cultura.
    const culturaId = Number(culturaSelecionada.cultura_id);

    if (!Number.isInteger(culturaId)) {
        mostrarMensagem(
            'A API não retornou o identificador numérico da cultura.'
        );

        return;
    }

    // Calcula a previsão de colheita.
    let previsaoColheita;

    try {
        previsaoColheita = obterPrevisaoColheita(
            dataInicio,
            culturaSelecionada
        );
    } catch (erro) {
        mostrarMensagem(erro.message);
        return;
    }

    // Monta os dados no formato esperado pelo backend.
    const dadosTalhao = {
        nome: nome,
        cultura_id: culturaId,
        area: area,
        safra: safra,
        inicio_cultivo: dataInicio,
        previsao_colheita: previsaoColheita,
        observacao: observacoes
    };

    // Evita enviar o formulário mais de uma vez.
    const botaoEnviar = document.querySelector('#enviar-formulario');

    botaoEnviar.disabled = true;

    try {
        if (talhaoEmEdicao === null) {
            // Cadastro novo: envia POST para a API.
            await cadastrarTalhaoAPI(dadosTalhao);

            mostrarAlertaSucesso(
                'Cadastro do talhão realizado com sucesso!'
            );

        } else {
            // Edição: envia PUT para a API.
            await editarTalhaoAPI(
                talhaoEmEdicao.id,
                dadosTalhao
            );

            mostrarAlertaSucesso(
                'Talhão atualizado com sucesso!'
            );
        }

    } catch (erro) {
        mostrarMensagem(
            erro.message || 'Não foi possível salvar o talhão.'
        );

    } finally {
        botaoEnviar.disabled = false;
    }
}

// Limpa o erro personalizado do campo para permitir uma nova validação.
function limparErroArea() {
    campoArea.setCustomValidity('');
}

function limparErroNome() {
    campoNome.setCustomValidity('');
}

function limparErroCultura() {
    campoCultura.setCustomValidity('');
}

// Início da página.
async function iniciarPagina() {
    if (propriedadeConta === null) {
        mostrarErroPropriedade();
        return;
    }

    try {
        // Carrega os talhões reais da API.
        talhoes = await carregarTalhoes();

        // Carrega as culturas disponíveis.
        await carregarCulturas();

        mostrarPropriedadeConta();

        // Busca os dados do talhão caso seja uma edição.
        await prepararFormulario();

        // Atualiza o resumo da propriedade.
        mostrarResumoPropriedade();

    } catch (erro) {
        mostrarErroCarregamento(
            'Não foi possível carregar os dados dos talhões'
        );

        console.error('Erro ao iniciar a página:', erro);
    }
}

// Eventos do formulário.
formulario.addEventListener('submit', cadastrarTalhao);

campoArea.addEventListener('input', limparErroArea);
campoNome.addEventListener('input', limparErroNome);
campoCultura.addEventListener('input', limparErroCultura);

// Abre a listagem depois que o alerta de sucesso é fechado.
function voltarParaListagem() {
    window.location.href = 'listagemTalhao.html';
}

if (alertaSucesso) {
    alertaSucesso.addEventListener('close', voltarParaListagem);
}

// Inicializa a página.
iniciarPagina();
