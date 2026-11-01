// Marília Santos - 25014905

const API_URL = 'http://localhost:3000';

const ROTA_TALHOES = '/consultarTalhoes';
const ROTA_GERAR_RELATORIO = '/relatorios/gerar';

const formRelatorio = document.getElementById('form-relatorio');
const campoPropriedade = document.getElementById('propriedade_nome');
const campoTalhao = document.getElementById('talhao_id');
const campoDataInicial = document.getElementById('periodo_inicial');
const campoDataFinal = document.getElementById('periodo_final');
const botaoGerar = document.getElementById('botao-gerar');
const mensagem = document.getElementById('mensagem-relatorio');

// Recupera o token da sessão.
function obterToken() {
    return localStorage.getItem('token');
}

// Recupera os dados da propriedade armazenados no login.
function obterPropriedade() {
    try {
        return JSON.parse(
            localStorage.getItem('minhaColheita.propriedadeConta')
        ) || null;
    } catch (erro) {
        console.error('Erro ao recuperar propriedade:', erro);
        return null;
    }
}

// Preenche o nome da propriedade automaticamente.
function preencherPropriedade() {
    const propriedade = obterPropriedade();

    if (!campoPropriedade) {
        return;
    }

    if (!propriedade) {
        campoPropriedade.value = 'Propriedade não identificada';
        console.error('Dados da propriedade não encontrados no localStorage.');
        return;
    }

    campoPropriedade.value =
        propriedade.nome || 'Propriedade autenticada';
}

// Exibe mensagens na tela.
function mostrarMensagem(texto, erro = false) {
    if (!mensagem) {
        alert(texto);
        return;
    }

    mensagem.textContent = texto;
    mensagem.style.color = erro ? '#b42318' : '#217346';
}

// Realiza requisições autenticadas.
async function requisicaoAutenticada(url, opcoes = {}) {
    const token = obterToken();

    if (!token) {
        window.location.replace('login.html');
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
        localStorage.removeItem('minhaColheita.propriedadeConta');

        window.location.replace('login.html');

        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        let mensagemErro = 'Não foi possível concluir a solicitação.';

        try {
            const dados = await resposta.json();
            mensagemErro = dados.erro || dados.mensagem || mensagemErro;
        } catch (erro) {
            // Mantém a mensagem padrão.
        }

        throw new Error(mensagemErro);
    }

    return resposta;
}

// Obtém o identificador do talhão.
function obterIdTalhao(talhao) {
    const identificador = talhao.talhao_id;

    if (!identificador) {
        return null;
    }

    if (typeof identificador === 'string') {
        return identificador;
    }

    if (identificador._id) {
        return String(identificador._id);
    }

    if (typeof identificador.toHexString === 'function') {
        return identificador.toHexString();
    }

    return null;
}

// Carrega os talhões pertencentes à propriedade autenticada.
async function carregarTalhoes() {
    if (!campoTalhao) return;

    campoTalhao.innerHTML = '<option value="todos">Todos os talhões</option>';

    try {
        console.log('URL consultada:', `${API_URL}${ROTA_TALHOES}`);
        console.log('Token:', obterToken());

        const resposta = await requisicaoAutenticada(
            `${API_URL}${ROTA_TALHOES}`
        );

        const dados = await resposta.json();

        console.log('STATUS DA API:', resposta.status);
        console.log('RESPOSTA COMPLETA:', dados);
        console.log('TALHÕES:', dados.talhoes);

        if (!Array.isArray(dados.talhoes)) {
            throw new Error('A API não retornou uma lista de talhões.');
        }

        if (dados.talhoes.length === 0) {
            mostrarMensagem(
                'A API retornou zero talhões para esta propriedade.',
                true
            );
            return;
        }

        dados.talhoes.forEach(talhao => {
            const id = talhao.talhao_id?._id
                || talhao.talhao_id;

            console.log('Talhão encontrado:', talhao);
            console.log('ID encontrado:', id);

            if (!id) {
                console.warn('Talhão sem ID:', talhao);
                return;
            }

            const opcao = document.createElement('option');
            opcao.value = String(id);
            opcao.textContent = talhao.nome || 'Talhão sem nome';

            campoTalhao.appendChild(opcao);
        });

        mostrarMensagem('Talhões carregados com sucesso!');

    } catch (erro) {
        console.error('ERRO AO BUSCAR TALHÕES:', erro);

        mostrarMensagem(
            erro.message || 'Erro ao consultar talhões.',
            true
        );
    }
}// Converte a data inicial para o começo do dia.
function converterDataInicial(data) {
    return new Date(`${data}T00:00:00.000`).toISOString();
}

// Converte a data final para o final do dia.
function converterDataFinal(data) {
    return new Date(`${data}T23:59:59.999`).toISOString();
}

// Gera e baixa o PDF.
if (formRelatorio) {
    formRelatorio.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const dataInicial = campoDataInicial.value;
        const dataFinal = campoDataFinal.value;

        if (!dataInicial || !dataFinal) {
            mostrarMensagem(
                'Preencha a data inicial e a data final.',
                true
            );
            return;
        }

        if (dataInicial > dataFinal) {
            mostrarMensagem(
                'A data inicial não pode ser posterior à data final.',
                true
            );
            return;
        }

        if (campoTalhao.disabled || !campoTalhao.value) {
            mostrarMensagem(
                'Aguarde o carregamento dos talhões antes de continuar.',
                true
            );
            return;
        }

        const valorTalhao = campoTalhao.value;

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

            setTimeout(() => URL.revokeObjectURL(url), 1000);

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

// Inicialização da página.
preencherPropriedade();
carregarTalhoes();
