// Beatriz Naomi Ferreira Sasaki - RA: 25016735

// Variáveis da página
const formulario=document.querySelector('#formulario');
const campoNome = formulario.elements.nome;
const campoCultura = formulario.elements.cultura;
const campoArea = formulario.elements.area;
const campoSafra = formulario.elements.safra;
const campoData = formulario.elements.dataInicio;
const campoObservacoes = formulario.elements.observacoes;

// Registro que está sendo editado; null indica um cadastro novo.
let talhaoEmEdicao = null;
// Soma dos hectares ocupados pelos talhões.
let areaUsada = 0;

//Cria uma linha da tabela com os dados de um talhão
function criarLinhaTalhao(talhao){
    // O ID no link diz à página de detalhes qual talhão abrir.
    const endereco = 'paginaTalhao.html?id=' + encodeURIComponent(talhao.id);
    const linha = document.createElement('tr');

    linha.innerHTML=
    '<td><a href="' + endereco + '">' +
    '<strong>' + protegerTexto(talhao.nome) + '</strong>' +
    '<small>' + protegerTexto(talhao.cultura) + '</small>' +
    '</a></td>' +
    '<td>' + formatarArea(talhao.area) + '</td>' +
    '<td>' + criarEtiquetaStatus(talhao.status) + '</td>';
     
    return linha;
}

//Campos do formulário
// precisará ser alterado quando conectado a API
// verificar se registro pertence a uma conta autenticada
function prepararFormulario(){
    const parametros= new URLSearchParams(window.location.search);
    // pega o id do talhão a partir dos parâmetros do endereço
    const idTalhao = parametros.get('id');
    talhaoEmEdicao = procurarTalhao(idTalhao);

     // A URL sem ID abre um cadastro novo com ID conhecido, permite editar.
     // Verifica se esta editando um cadastro existente
    if(talhaoEmEdicao!==null){
        document.querySelector('#Titulo-formulario').textContent = 'Editar talhão';
        document.querySelector('#enviar-formulario').textContent = 'Salvar alterações';
        campoNome.value = talhaoEmEdicao.nome;
        campoCultura.value = talhaoEmEdicao.cultura;
        campoArea.value = talhaoEmEdicao.area;
        campoSafra.value = talhaoEmEdicao.safra;
        campoData.value = talhaoEmEdicao.dataInicio;
        campoObservacoes.value = '';

        // Verifica se estamos editando um cadastro existente, em vez de criar um novo.
        if (talhaoEmEdicao.observacoes != null) {
            campoObservacoes.value = talhaoEmEdicao.observacoes;
        }
    }
}

// Soma as áreas já usadas e atualiza a tabela
// Necessário alterar quando houver conexão com API, para guardar
// a área total e os talhões reais retornados pelo backend, para realizar contagem
function mostrarResumoPropriedade(){
    const corpoTabela = document.querySelector('#talhoes-resumo');
    // Remove o conteúdo antigo para preencher a lista atualizada
    corpoTabela.innerHTML = '';
    areaUsada = 0;

    const propriedade = propriedadeConta;
    mostrarPropriedadeConta();
    document.querySelector('#nome-propriedade').textContent = propriedade.nome;

    // Percorre talhoes, pegando um item por vez com o nome talhao.
    for(const talhao of talhoes){
        if (talhao.propriedadeId !== propriedade.id) continue;
        areaUsada = areaUsada + talhao.area;
        corpoTabela.appendChild(criarLinhaTalhao(talhao));
    }

    // Área total da propriedade menos a área já ocupada.
    let areaDisponivel = propriedadeConta.areaTotal - areaUsada;
    if(areaDisponivel<0){
        areaDisponivel = 0;
    }

    let porcentagem = areaUsada / propriedadeConta.areaTotal * 100;
    if(porcentagem>100){
        porcentagem=100;
    }

    // Atualiza campos de área usada e área disponível
    document.querySelector('#area-usada').textContent = formatarNumero(areaUsada);
    document.querySelector('#area-disponivel').textContent = formatarNumero(areaDisponivel);
    // ajusta a largura da barra usando a porcentagem calculada
    document.querySelector('#total-usado').style.width = porcentagem + '%';
}   

// Valida os campos e salva o cadastro ou as alterações.
// Necessário alteração nesse código após conexão com API
// Verificar validações no backend
function cadastrarTalhao(evento){
    // Impede o envio padrão do formulário: salva os dados no navegador.
    evento.preventDefault();
    // Verifica os campos obrigatórios e os limites definidos
    // interrompe se houver erro
    if (!formulario.reportValidity()) return;

    const nome = campoNome.value.trim();
    const cultura = campoCultura.value.trim();
    const area = Number(campoArea.value);

    let areaDisponivel = propriedadeConta.areaTotal - areaUsada;

    // Verifica se estamos editando um cadastro existente, em vez de criar um novo.
    if (talhaoEmEdicao !== null) {
        // recalcula a área disponivel
        areaDisponivel = areaDisponivel + talhaoEmEdicao.area;
    }

    // Verifica se a área digitada ultrapassa o espaço disponível
    if (area > areaDisponivel) {
        campoArea.setCustomValidity('A área disponível é ' + formatarArea(areaDisponivel) + '.');
        // Mostra no campo a mensagem de validação para a pessoa corrigir o valor.
        campoArea.reportValidity();
        return;
    }

      // Verifica se o nome ficou vazio depois de remover os espaços.
    if(nome===''){
        campoNome.setCustomValidity('Informe o nome do talhão.');
        campoNome.reportValidity();
        return;
    }

    if (cultura === '') {
        campoCultura.setCustomValidity('Informe a cultura do talhão.');
        campoCultura.reportValidity();
        return;
    }

    const novoTalhao={
        // O id por enquanto é gerado local, mas deverá depois ser usado ID retornado pelo backend
        id: 'T' + Date.now(),
        // O vínculo à propriedade deve ser validado ou definido pelo servidor a partir da conta logada
        propriedadeId: propriedadeConta.id,
        nome:nome,
        cultura: cultura,
        area: area,
        safra: campoSafra.value,
        status:'aguardando',
        dataInicio: campoData.value,
        observacoes: campoObservacoes.value.trim(),
        // talhão novo ainda não tem aplicação
        produto: null,
        dataAplicacao: null
    };

    // Na edição, preserva a identificação e os dados da última aplicação.
    if(talhaoEmEdicao!==null){
        novoTalhao.id = talhaoEmEdicao.id;
        novoTalhao.status = talhaoEmEdicao.status;
        novoTalhao.produto = talhaoEmEdicao.produto;
        novoTalhao.dataAplicacao = talhaoEmEdicao.dataAplicacao;
        novoTalhao.colheita= talhaoEmEdicao.colheita;
    }

    const novaLista= [];
    for (const talhao of talhoes) {
        if (talhao.id === novoTalhao.id) {
            // Se o id for igual, coloca a versão atualizada desse talhão
            novaLista.push(novoTalhao);
        } else {
            // Se o id for diferente, mantém o talhão como estava
            novaLista.push(talhao);
        }
    }
    // se for um cadastro novo, acrescenta o novo talhão ao final
    if (talhaoEmEdicao === null) {
        novaLista.push(novoTalhao);
    }

    // depois aqui deve entrar a confirmação da resposta de cadastro ou edição da API
     // Mostra o sucesso depois de salvar; retorna à listagem quando o alerta de sucesso é fechado
    if (salvarTalhoes(novaLista)) {
        if (talhaoEmEdicao === null) {
            mostrarAlertaSucesso('Cadastro do talhão realizado com sucesso!');
        } else {
            mostrarAlertaSucesso('Talhão atualizado com sucesso!');
        }
    }
}

// Limpa o erro personalizado do campo para permitir uma nova validação.
function limparErroArea(){
    campoArea.setCustomValidity('');
}
function limparErroNome() {
  campoNome.setCustomValidity('');
}

function limparErroCultura() {
  campoCultura.setCustomValidity('');
}

//Inicio da página
if (propriedadeConta !== null) {
  talhoes = carregarTalhoes();
 
  if (talhoes !== null) {
    mostrarPropriedadeConta();
    prepararFormulario();
    mostrarResumoPropriedade();
  } else {
    mostrarErroCarregamento('Não foi possível carregar os talhões');
  }

} else {
  mostrarErroPropriedade();
}

formulario.addEventListener('submit', cadastrarTalhao);
campoArea.addEventListener('input', limparErroArea);
campoNome.addEventListener('input', limparErroNome);
campoCultura.addEventListener('input', limparErroCultura);

// Abre a listagem depois que o alerta de sucesso é fechado.
function voltarParaListagem() {
  window.location.href = 'listagemTalhao.html';
}

alertaSucesso.addEventListener('close', voltarParaListagem);