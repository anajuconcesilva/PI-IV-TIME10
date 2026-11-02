// Aluna: Eduarda Prado Deiró | RA: 25004440
const API = 'http://localhost:3000';

const NOMES_STATUS = {
    liberado: 'Liberado',
    carencia: 'Em carência',
    em_carencia: 'Em carência',
    bloqueado: 'Bloqueado',
    aguardando: 'Aguardando aplicação'
};

const ICONES = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/> <path d="M12 9v4"/> <path d="M12 17h.01"/>',
    calendario: '<path d="M8 2v3"/> <path d="M16 2v3"/> <rect x="3" y="3" width="18" height="18" rx="2"/> <path d="M3 9h18"/>'
};

const ICONE_DO_ALERTA = {
    bloqueado: 'alerta',
    carencia: 'calendario',
    em_carencia: 'calendario',
    liberado: 'check'
};

let talhoes = [];
let alertas = [];
let aplicacoes = [];

function icone(nome) {
    return `<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ICONES.alerta}</svg>`;
}

// Evita inserir textos do banco diretamente como HTML.
function escaparHTML(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizarStatus(status) {
    if (status === 'em_carencia') {
        return 'carencia';
    }

    return status;
}

function contarTalhoes(status) {
    return talhoes.filter(talhao =>
        normalizarStatus(talhao.status) === status
    ).length;
}

function formatarData(data) {
    if (!data) return 'Data não informada';

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return 'Data inválida';
    }

    return dataObj.toLocaleDateString('pt-BR');
}

function calcularDiasRestantes(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const liberacao = new Date(data);
    liberacao.setHours(0, 0, 0, 0);

    return Math.max(
        0,
        Math.ceil((liberacao - hoje) / (1000 * 60 * 60 * 24))
    );
}

function mostrarErro(elemento, mensagem) {
    if (elemento) {
        elemento.innerHTML = `<p class="vazio">${escaparHTML(mensagem)}</p>`;
    }
}

// ===================== SAUDAÇÃO =====================

function mostrarSaudacao() {
    const propriedade = lerPropriedadeConta();
    const agora = new Date();
    const hora = agora.getHours();

    let saudacao = 'Boa noite';

    if (hora >= 5 && hora < 12) {
        saudacao = 'Bom dia';
    } else if (hora >= 12 && hora < 18) {
        saudacao = 'Boa tarde';
    }

    let data = agora.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    data = data.charAt(0).toUpperCase() + data.slice(1);

    const elementoSaudacao = document.getElementById('saudacao');
    const elementoData = document.getElementById('data-hoje');

    if (elementoSaudacao) {
        elementoSaudacao.textContent = propriedade
            ? `${saudacao}, ${propriedade.nome}`
            : saudacao;
    }

    if (elementoData) {
        const localizacao = propriedade
            ? localizacaoDaPropriedade(propriedade)
            : '';

        elementoData.textContent = localizacao
            ? `${data} · ${localizacao}`
            : data;
    }
}

// ===================== RESUMO =====================

function mostrarResumo() {
    const encerrando = aplicacoes.filter(aplicacao => {
        const dias = calcularDiasRestantes(
            aplicacao.data_liberacao_colheita
        );

        return dias <= 7 &&
            new Date(aplicacao.data_liberacao_colheita) > new Date();
    }).length;

    const cards = [
        {
            status: 'liberado',
            nome: 'Liberados',
            detalhe: 'Prontos para colheita'
        },
        {
            status: 'carencia',
            nome: 'Em carência',
            detalhe: `${encerrando} liberações nesta semana`
        },
        {
            status: 'bloqueado',
            nome: 'Bloqueados',
            detalhe: 'Exige regularização'
        },
        {
            status: 'aguardando',
            nome: 'Aguardando',
            detalhe: 'Sem aplicação ativa'
        }
    ];

    let html = '';

    for (const card of cards) {
        html += `
            <div class="resumo-card status-${card.status}">
                <span class="resumo-numero">
                    ${contarTalhoes(card.status)}
                </span>
                <span class="resumo-nome">${card.nome}</span>
                <span class="resumo-detalhe">${card.detalhe}</span>
            </div>
        `;
    }

    document.getElementById('resumo').innerHTML = html;
}

// ===================== TALHÕES =====================

function mostrarTalhoes() {
    const lista = document.getElementById('lista-talhoes');

    if (talhoes.length === 0) {
        mostrarErro(lista, 'Nenhum talhão cadastrado ainda.');
        return;
    }

    let html = '';

    for (const talhao of talhoes) {
        const status = normalizarStatus(talhao.status);

        let complemento = '';

        if (status === 'liberado') {
            complemento = `
                <p class="talhao-aviso">
                    ${icone('check')}
                    Pronto para colheita
                </p>
            `;
        } else if (status === 'carencia') {
            complemento = `
                <p class="talhao-aviso">
                    ${icone('calendario')}
                    Talhão em período de carência
                </p>
            `;
        } else if (status === 'bloqueado') {
            complemento = `
                <p class="talhao-aviso">
                    ${icone('alerta')}
                    Talhão bloqueado
                </p>
            `;
        }

        const cultura = talhao.cultura
            ? talhao.cultura
            : `Cultura ${talhao.cultura_id ?? 'não informada'}`;

        html += `
            <article class="talhao status-${status}">
                <div class="talhao-topo">
                    <div>
                        <h3>${escaparHTML(talhao.nome)}</h3>
                        <p class="talhao-detalhe">
                            ${escaparHTML(cultura)}
                            · ${Number(talhao.area || 0).toLocaleString('pt-BR')} ha
                        </p>
                    </div>

                    <span class="selo">
                        ${NOMES_STATUS[status] || 'Não informado'}
                    </span>
                </div>

                ${complemento}
            </article>
        `;
    }

    lista.innerHTML = html;
}

// ===================== ALERTAS =====================

function mostrarAlertas() {
    const lista = document.getElementById('lista-alertas');

    // Mostra os alertas ativos mais recentes.
    const recentes = alertas
        .filter(alerta => alerta.status === 'ativo')
        .slice(0, 5);

    if (recentes.length === 0) {
        lista.innerHTML = `
            <li class="vazio">
                ${icone('check')}
                Nenhum alerta por enquanto.
            </li>
        `;
        return;
    }

    let html = '';

    for (const alerta of recentes) {
        const tipo = alerta.tipo || 'carencia';
        const iconeNome = ICONE_DO_ALERTA[tipo] || 'alerta';

        const talhao = talhoes.find(item =>
            item.talhao_id?.toString() === alerta.talhao_id
        );

        const titulo = talhao
            ? `${talhao.nome} — ${alerta.mensagem}`
            : alerta.mensagem;

        html += `
            <li class="alerta status-${normalizarStatus(tipo)}">
                ${icone(iconeNome)}
                <div>
                    <strong>${escaparHTML(titulo)}</strong>
                    <p>${escaparHTML(tipo === 'carencia' ? 'Período de carência' : tipo)}</p>
                    <span>${formatarData(alerta.data)}</span>
                </div>
            </li>
        `;
    }

    lista.innerHTML = html;
}

// ===================== PRÓXIMA LIBERAÇÃO =====================

function mostrarProximaLiberacao() {
    const caixa = document.getElementById('proxima-liberacao');

    const agora = new Date();

    const pendentes = aplicacoes
        .filter(aplicacao => {
            const liberacao = new Date(
                aplicacao.data_liberacao_colheita
            );

            return liberacao > agora;
        })
        .sort((a, b) =>
            new Date(a.data_liberacao_colheita) -
            new Date(b.data_liberacao_colheita)
        );

    if (pendentes.length === 0) {
        mostrarErro(caixa, 'Nenhum talhão em carência.');
        return;
    }

    const proxima = pendentes[0];
    const diasRestantes = calcularDiasRestantes(
        proxima.data_liberacao_colheita
    );

    const porcentagem = proxima.periodo_carencia > 0
        ? Math.min(
            100,
            Math.max(
                0,
                ((proxima.periodo_carencia - diasRestantes) /
                    proxima.periodo_carencia) * 100
            )
        )
        : 100;

    const dataTexto = formatarData(
        proxima.data_liberacao_colheita
    );

    caixa.innerHTML = `
        <div class="liberacao-topo">
            <div class="icone-caixa status-carencia">
                ${icone('calendario')}
            </div>

            <div>
                <strong>${escaparHTML(proxima.talhao_nome)}</strong>
                <span>${escaparHTML(proxima.produto)}</span>
            </div>
        </div>

        <div class="carencia">
            <div class="carencia-linha">
                <span>Período de carência</span>
                <strong>${diasRestantes} dias restantes</strong>
            </div>

            <div class="barra">
                <div
                    class="barra-preenchida"
                    style="width: ${porcentagem}%"
                ></div>
            </div>

            <div class="carencia-linha">
                <span>Dia ${Math.max(0, proxima.periodo_carencia - diasRestantes)}</span>
                <span>Dia ${proxima.periodo_carencia}</span>
            </div>
        </div>

        <p class="liberacao-data">
            Liberação em: <strong>${dataTexto}</strong>
        </p>
    `;
}

// ===================== CONSULTAS À API =====================

async function buscarDados(url, token) {
    const resposta = await fetch(`${API}${url}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem || 'Não foi possível consultar os dados.'
        );
    }

    return dados;
}

async function carregarDashboard() {
    mostrarSaudacao();

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const [dadosTalhoes, dadosAlertas, dadosAplicacoes] =
            await Promise.all([
                buscarDados('/consultarTalhoes', token),
                buscarDados('/avisos', token),
                buscarDados('/consultarAplicacoesDashboard', token)
            ]);

        talhoes = dadosTalhoes.talhoes || [];
        alertas = dadosAlertas.avisos || [];
        aplicacoes = dadosAplicacoes.aplicacoes || [];

        mostrarResumo();
        mostrarTalhoes();
        mostrarAlertas();
        mostrarProximaLiberacao();

    } catch (erro) {
        console.error('Erro ao carregar Dashboard:', erro);

        mostrarErro(
            document.getElementById('resumo'),
            'Não foi possível carregar o resumo.'
        );

        mostrarErro(
            document.getElementById('lista-talhoes'),
            'Não foi possível carregar os talhões.'
        );

        mostrarErro(
            document.getElementById('lista-alertas'),
            'Não foi possível carregar os alertas.'
        );

        mostrarErro(
            document.getElementById('proxima-liberacao'),
            'Não foi possível carregar a próxima liberação.'
        );
    }
}

carregarDashboard();
