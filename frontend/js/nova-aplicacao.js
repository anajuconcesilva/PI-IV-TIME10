// Aluna: Ana Júlia Conceição da Silva | RA: 25002592
// Integração da tela Registrar Aplicação com a API Minha Colheita

const API = API_URL;

// Elementos
const formulario = document.getElementById("form-aplicacao");
const selectTalhao = document.getElementById("talhao");
const inputProduto = document.getElementById("produto");
const inputDose = document.getElementById("dose");
const selectUnidade = document.getElementById("unidade");
const inputData = document.getElementById("data-aplicacao");
const inputResponsavel = document.getElementById("responsavel");
const inputObservacoes = document.getElementById("observacoes");
const botaoEnviar = formulario.querySelector('button[type="submit"]');
const alertaSucesso = document.getElementById("alerta-sucesso");
const botaoFecharSucesso = document.getElementById("fechar-alerta-sucesso");

// Armazena os produtos encontrados e seus respectivos IDs
const produtosEncontrados = new Map();

let temporizadorBusca = null;

// Recupera o token salvo durante o login
function obterToken() {
    return localStorage.getItem("token");
}

// Configura os cabeçalhos das requisições autenticadas
function obterCabecalhos() {
    const token = obterToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// Exibe mensagens para o usuário
function mostrarMensagem(mensagem, tipo = "erro") {
    let elemento = document.getElementById("mensagem-aplicacao");

    if (!elemento) {
        elemento = document.createElement("div");
        elemento.id = "mensagem-aplicacao";
        elemento.style.cssText = `
            padding: 12px 16px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-size: 14px;
        `;

        formulario.prepend(elemento);
    }

    elemento.textContent = mensagem;

    if (tipo === "sucesso") {
        elemento.style.backgroundColor = "#e5f5e9";
        elemento.style.color = "#176b36";
    } else {
        elemento.style.backgroundColor = "#fde8e8";
        elemento.style.color = "#a32626";
    }

    elemento.style.display = "block";
}

// Converte possíveis ObjectIds retornados pelo MongoDB para texto
function obterId(valor) {
    if (typeof valor === "string") {
        return valor;
    }

    if (valor && typeof valor === "object" && valor.$oid) {
        return valor.$oid;
    }

    return "";
}

// 1. Carregar os talhões da propriedade
async function carregarTalhoes() {
    try {
        const resposta = await fetch(`${API}/consultarTalhoes`, {
            method: "GET",
            headers: obterCabecalhos()
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || dados.mensagem || "Não foi possível carregar os talhões.");
        }

        const talhoes = Array.isArray(dados.talhoes) ? dados.talhoes : [];

        selectTalhao.innerHTML = '<option value="">Selecione o talhão</option>';

        talhoes.forEach(talhao => {
            const id = obterId(talhao.talhao_id || talhao._id);

            if (!id) {
                return;
            }

            const opcao = document.createElement("option");

            opcao.value = id;
            opcao.textContent = talhao.nome || "Talhão sem nome";

            // Guarda o status para evitar selecionar talhões indisponíveis
            opcao.dataset.status = talhao.status || "";

            selectTalhao.appendChild(opcao);
        });

        if (talhoes.length === 0) {
            selectTalhao.innerHTML = '<option value="">Nenhum talhão cadastrado</option>';
            botaoEnviar.disabled = true;
            mostrarMensagem("Cadastre um talhão na tela de Talhões para registrar uma aplicação.");
        }

    } catch (erro) {
        console.error("Erro ao carregar talhões:", erro);
        mostrarMensagem(erro.message);
    }
}

// 2. Criar a lista de sugestões de produtos
function prepararListaProdutos() {
    let lista = document.getElementById("lista-produtos-aplicacao");

    if (!lista) {
        lista = document.createElement("datalist");
        lista.id = "lista-produtos-aplicacao";
        document.body.appendChild(lista);
    }

    inputProduto.setAttribute("list", "lista-produtos-aplicacao");
}

// 3. Buscar produtos na API
async function buscarProdutos(termo) {
    const lista = document.getElementById("lista-produtos-aplicacao");

    if (!termo.trim()) {
        lista.innerHTML = "";
        produtosEncontrados.clear();
        return;
    }

    try {
        const parametros = new URLSearchParams({
            busca: termo,
            pagina: "1",
            limite: "100"
        });

        const resposta = await fetch(`${API}/produtos?${parametros.toString()}`);

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível buscar os produtos.");
        }

        const produtos = Array.isArray(dados.itens) ? dados.itens : [];

        lista.innerHTML = "";
        produtosEncontrados.clear();

        produtos.forEach(produto => {
            if (!produto.id || !produto.nome) {
                return;
            }

            const opcao = document.createElement("option");
            opcao.value = produto.nome;

            lista.appendChild(opcao);

            produtosEncontrados.set(produto.nome, {
                id: produto.id,
                nome: produto.nome
            });
        });

    } catch (erro) {
        console.error("Erro ao buscar produtos:", erro);
        mostrarMensagem("Não foi possível consultar os produtos. Tente novamente.");
    }
}

// 4. Esperar o usuário parar de digitar antes de pesquisar
inputProduto.addEventListener("input", () => {
    clearTimeout(temporizadorBusca);

    // Um produto só é considerado selecionado quando o nome
    // corresponde a um resultado retornado pela API.
    inputProduto.setCustomValidity("");

    const termo = inputProduto.value.trim();

    temporizadorBusca = setTimeout(() => {
        buscarProdutos(termo);
    }, 300);
});

// 5. Validar se o produto digitado foi selecionado da lista
inputProduto.addEventListener("change", () => {
    const produto = produtosEncontrados.get(inputProduto.value.trim());

    if (!produto) {
        inputProduto.setCustomValidity("Selecione um produto encontrado na lista.");
    } else {
        inputProduto.setCustomValidity("");
    }
});

// 6. Registrar aplicação
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const token = obterToken();

    if (!token) {
        mostrarMensagem("Sua sessão não foi encontrada. Faça login novamente.");
        return;
    }

    const produtoSelecionado = produtosEncontrados.get(inputProduto.value.trim());

    if (!produtoSelecionado) {
        inputProduto.setCustomValidity("Pesquise e selecione um produto da lista.");
        inputProduto.reportValidity();
        return;
    }

    const dose = Number(inputDose.value);

    if (!Number.isFinite(dose) || dose <= 0) {
        mostrarMensagem("Informe uma dosagem maior que zero.");
        inputDose.focus();
        return;
    }

    const dadosAplicacao = {
        talhaoId: selectTalhao.value,
        produtoId: produtoSelecionado.id,
        dataAplicacao: inputData.value,
        dosagem: dose,
        unidade: selectUnidade.value,
        responsavel: inputResponsavel.value.trim(),
        observacao: inputObservacoes.value.trim()
    };

    if (!dadosAplicacao.talhaoId) {
        mostrarMensagem("Selecione um talhão.");
        selectTalhao.focus();
        return;
    }

    if (!dadosAplicacao.dataAplicacao) {
        mostrarMensagem("Informe a data da aplicação.");
        inputData.focus();
        return;
    }

    botaoEnviar.disabled = true;
    botaoEnviar.textContent = "Registrando...";

    try {
        const resposta = await fetch(`${API}/registrarAplicacao`, {
            method: "POST",
            headers: obterCabecalhos(),
            body: JSON.stringify(dadosAplicacao)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                "Não foi possível registrar a aplicação."
            );
        }

        alertaSucesso.showModal();

        formulario.reset();

        // Atualiza a listagem de talhões e seus status
        await carregarTalhoes();

    } catch (erro) {
        console.error("Erro ao registrar aplicação:", erro);
        mostrarMensagem(erro.message);
    } finally {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Registrar aplicação";
    }
});

botaoFecharSucesso.addEventListener("click", function () {
    alertaSucesso.close();
});

// 7. Inicialização da tela
document.addEventListener("DOMContentLoaded", async () => {
    if (!obterToken()) {
        mostrarMensagem("Você precisa entrar na sua conta para registrar uma aplicação.");
        botaoEnviar.disabled = true;
        return;
    }

    prepararListaProdutos();
    await carregarTalhoes();
});