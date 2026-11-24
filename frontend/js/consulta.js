// marilia santos
const API = API_URL;

// 1. Estado único
const estado = {
  cultura: 'todas',
  culturaExata: false, // true quando o valor veio do dropdown (/culturas)
  classe: 'todas',
  classeExata: false   // true quando o valor veio do dropdown (/classes)
};

// Opções reais do banco: chave minúscula -> valor original
const opcoesClasses = new Map();

const POR_PAGINA = 20;
let paginaAtual = 1;
let temporizador = null;
let controladorAtual = null;

// 2. Elementos da tela
const inputBusca = document.getElementById('input-busca');
const listaProdutos = document.getElementById('lista-produtos');
const contador = document.getElementById('contador-texto');

const filtroCultura = document.getElementById('filtro-cultura');

const culturasDaConta = (lerPropriedadeConta() || {}).culturas || [];

const GRUPOS_CULTURAS = {
  'Grãos e cereais': ['Amendoim', 'Arroz', 'Arroz Sequeiro', 'Arroz irrigado', 'Aveia', 'Aveia Branca', 'Aveia preta', 'Centeio', 'Cevada', 'Ervilha', 'Feijão', 'Feijão-caupi', 'Feijão-fava', 'Feijão-guandu', 'Feijão-mungo', 'Feijões', 'Gergelim', 'Grão-de-bico', 'Lentilha', 'Milheto', 'Milho', 'Milho OGM', 'Quinoa', 'Soja', 'Soja OGM', 'Sorgo', 'Trigo', 'Trigo-mourisco', 'Triticale'],
  'Hortaliças': ['Abobrinha', 'Abóbora', 'Acelga', 'Agrião', 'Aipo', 'Alface', 'Alho', 'Alho porró', 'Almeirão', 'Berinjela', 'Beterraba', 'Brócolis', 'Cebola', 'Cenoura', 'Chuchu', 'Couve', 'Couve-chinesa', 'Couve-de-bruxelas', 'Couve-flor', 'Espinafre', 'Feijão-vagem', 'Jiló', 'Nabo', 'Pepino', 'Pimenta', 'Pimentão', 'Quiabo', 'Rabanete', 'Repolho', 'Rúcula', 'Tomate', 'Tomate Industrial', 'Tomate Rasteiro Industrial', 'Tomate envarado'],
  'Raízes e tubérculos': ['Batata', 'Batata yacon', 'Batata-doce', 'Batata-salsa', 'Gengibre', 'Inhame', 'Mandioca', 'Mandioquinha-salsa'],
  'Frutas': ['Abacate', 'Abacaxi', 'Acerola', 'Ameixa', 'Amora', 'Açaí', 'Banana', 'Caju', 'Caqui', 'Carambola', 'Castanha-de-caju', 'Castanha-do-pará', 'Citros', 'Coco', 'Framboesa', 'Fruta-de-conde', 'Goiaba', 'Graviola', 'Jambo', 'Kiwi', 'Lichia', 'Limão', 'Mamão', 'Manga', 'Maracujá', 'Maçã', 'Melancia', 'Melão', 'Mirtilo', 'Morango', 'Nectarina', 'Pera', 'Pitaya', 'Pêssego', 'Romã', 'Seriguela', 'Uva', 'Uva de mesa'],
  'Ervas e especiarias': ['Alecrim', 'Camomila', 'Coentro', 'Erva-doce', 'Hortelã', 'Manjericão', 'Orégano', 'Pimenta-do-reino', 'Salsa', 'Salvia'],
  'Café, cana e outras industriais': ['Algodão', 'Algodão OGM', 'Cacau', 'Café', 'Cana Indica', 'Cana-de-açúcar', 'Cana-de-açúcar OGM', 'Duboisia', 'Erva-mate', 'Guaraná', 'Lúpulo', 'Palma forrageira', 'Tabaco'],
  'Florestais': ['Bambu', 'Eucalipto', 'Eucalipto Dessecação', 'Eucalipto OGM', 'Eucalipto Pré-emergência', 'Pinus', 'Seringueira', 'Teca'],
  'Flores e ornamentais': ['Begônia', 'Boca-de-Leão', 'Bromelia', 'Cravo', 'Hibiscos', 'Hortênsia', 'Kalanchoe', 'Lisianthus', 'Lírio', 'Lírio da paz', 'Rosa', 'Samambaias', 'Violeta']
};

const btnTodasClasses = document.getElementById('btn-todas-classes');
const inputClasse = document.getElementById('input-classe');
const datalistClasses = document.getElementById('bd-classes');

// Navegação por páginas numeradas (logo abaixo da lista)
const navegacao = document.createElement('nav');
navegacao.className = 'paginacao';
navegacao.setAttribute('aria-label', 'Páginas de produtos');
listaProdutos.insertAdjacentElement('afterend', navegacao);

// 3. Utilitários
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 4. Busca principal (com cancelamento de requisição anterior e paginação)
function montarCards(produtos) {
  return produtos.map(produto => {
    const tagsHTML = (produto.culturas || [])
      .map(c => `<span class="tag">${escaparHtml(c)}</span>`).join('');
    return `
      <div class="card-produto">
        <div class="produto-info">
          <h3>${escaparHtml(produto.nome)} <span class="badge">${escaparHtml(produto.classe)}</span></h3>
          <p class="produto-sub">${escaparHtml(produto.ingredienteAtivo)} · Reg. ${escaparHtml(produto.registro)}</p>
          <div class="tags-cultura">${tagsHTML}</div>
        </div>
        <div class="produto-carencia">
          ${!Number.isInteger(produto.carenciaDias)
            ? '<span>—</span><small>carência indisponível</small>'
            : produto.carenciaDias === 0
              ? '<span>0</span><small>dias · sem intervalo de segurança</small>'
              : `<span>${produto.carenciaDias}</span><small>${produto.carenciaDias === 1 ? 'dia' : 'dias'} carência</small>`}
        </div>
      </div>
    `;
  }).join('');
}

function numerosDaPagina(atual, totalPaginas) {
  const janela = 10;
  const inicio = Math.max(1, Math.min(atual - 4, totalPaginas - janela + 1));
  const fim = Math.min(totalPaginas, inicio + janela - 1);
  const saida = [];

  for (let n = inicio; n <= fim; n++) saida.push(n);

  return saida;
}

function mostrarNavegacao(total) {
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  if (totalPaginas <= 1) {
    navegacao.innerHTML = '';
    return;
  }

  const botao = (rotulo, pagina, { ativo = false, desabilitado = false, rotuloAcessivel = '' } = {}) => `
    <button type="button" class="pill${ativo ? ' ativo' : ''}" data-pagina="${pagina}"
      ${desabilitado ? 'disabled' : ''} ${ativo ? 'aria-current="page"' : ''}
      ${rotuloAcessivel ? `aria-label="${rotuloAcessivel}"` : ''}>${rotulo}</button>`;

  const numeros = numerosDaPagina(paginaAtual, totalPaginas)
    .map(n => botao(n, n, { ativo: n === paginaAtual, rotuloAcessivel: `Página ${n}` }))
    .join('');

  navegacao.innerHTML = `
    ${botao('« Primeira', 1, { desabilitado: paginaAtual === 1 })}
    ${botao('‹ Anterior', paginaAtual - 1, { desabilitado: paginaAtual === 1 })}
    ${numeros}
    ${botao('Próxima ›', paginaAtual + 1, { desabilitado: paginaAtual === totalPaginas })}
    ${botao('Última »', totalPaginas, { desabilitado: paginaAtual === totalPaginas })}
    <label class="paginacao-ir">
      Ir para
      <input type="number" min="1" max="${totalPaginas}" inputmode="numeric"
        placeholder="${paginaAtual}" aria-label="Número da página">
      de ${totalPaginas}
    </label>`;
}

navegacao.addEventListener('click', evento => {
  const botao = evento.target.closest('button[data-pagina]');
  if (!botao || botao.disabled) return;

  buscarProdutosNaApi(Number(botao.dataset.pagina), true);
});

navegacao.addEventListener('keydown', evento => {
  if (evento.key !== 'Enter' || !evento.target.matches('.paginacao-ir input')) return;

  const campo = evento.target;
  const pagina = Math.min(Math.max(parseInt(campo.value, 10) || 1, 1), Number(campo.max));
  buscarProdutosNaApi(pagina, true);
});

// pagina: página pedida (1 = nova busca) | rolar: volta ao topo da lista ao trocar de página
async function buscarProdutosNaApi(pagina = 1, rolar = false) {
  if (controladorAtual) controladorAtual.abort();
  controladorAtual = new AbortController();
  const { signal } = controladorAtual;

  const params = new URLSearchParams();
  const termo = inputBusca.value.trim();

  if (termo) params.append('busca', termo);
  if (estado.cultura !== 'todas') {
    params.append('cultura', estado.cultura);
    if (estado.culturaExata) params.append('culturaExata', 'true');
  } else if (culturasDaConta.length > 0) {
    params.append('culturas', culturasDaConta.join(','));
  }
  if (estado.classe !== 'todas') {
    params.append('classe', estado.classe);
    if (estado.classeExata) params.append('classeExata', 'true');
  }
  params.append('pagina', pagina);
  params.append('limite', POR_PAGINA);

  listaProdutos.style.opacity = '0.5';

  try {
    const resposta = await fetch(`${API}/produtos?${params.toString()}`, { signal });
    if (!resposta.ok) throw new Error('Erro na API');
    const dados = await resposta.json();
    const itens = Array.isArray(dados.itens) ? dados.itens : [];
    const total = Number(dados.total) || 0;
    const totalPaginas = Math.ceil(total / POR_PAGINA);

    if (total > 0 && pagina > totalPaginas) {
      return buscarProdutosNaApi(totalPaginas, rolar);
    }

    if (itens.length === 0) {
      listaProdutos.innerHTML =
        '<div style="text-align: center; padding: 3rem 1rem; color: #666;">Nenhum produto encontrado.</div>';
      contador.innerText = '0 produtos encontrados';
      navegacao.innerHTML = '';
      paginaAtual = 1;
      return;
    }

    listaProdutos.innerHTML = montarCards(itens);
    paginaAtual = pagina;

    const primeiro = (pagina - 1) * POR_PAGINA + 1;
    contador.innerText = `Mostrando ${primeiro}–${primeiro + itens.length - 1} de ${total} produto(s)`;
    mostrarNavegacao(total);

    if (rolar) listaProdutos.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (erro) {
    if (erro.name === 'AbortError') return; // substituída por uma busca mais nova: ignora
    listaProdutos.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar produtos.</p>';
    contador.innerText = 'Erro na consulta';
    navegacao.innerHTML = '';
  } finally {
    if (!signal.aborted) listaProdutos.style.opacity = '';
  }
}

function agendarBusca(atrasoMs = 300) {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => buscarProdutosNaApi(), atrasoMs);
}

// 5. Sincronização de filtros (única porta de entrada para alterar o estado)
function aplicarClasseDigitada() {
  const valor = inputClasse.value.trim();

  if (!valor) {
    estado.classe = 'todas';
    estado.classeExata = false;
    btnTodasClasses.classList.add('ativo');
  } else {
    const oficial = opcoesClasses.get(valor.toLowerCase());
    estado.classe = oficial || valor;
    estado.classeExata = Boolean(oficial);
    btnTodasClasses.classList.remove('ativo');
  }
  agendarBusca();
}

// 6. Eventos
inputBusca.addEventListener('input', () => agendarBusca());

filtroCultura.addEventListener('change', () => {
  estado.cultura = filtroCultura.value;
  estado.culturaExata = filtroCultura.value !== 'todas';
  agendarBusca(0);
});

// Botão "Todas" das classes
btnTodasClasses.addEventListener('click', () => {
  inputClasse.value = '';
  estado.classe = 'todas';
  estado.classeExata = false;
  btnTodasClasses.classList.add('ativo');
  agendarBusca(0);
});

// Caixa de classe
inputClasse.addEventListener('input', aplicarClasseDigitada);
inputClasse.addEventListener('change', aplicarClasseDigitada);

// 7. Carregamento dinâmico dos datalists (/culturas e /classes)
async function carregarOpcoes(rota, datalist, mapa) {
  try {
    const resposta = await fetch(`${API}${rota}`);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const dados = await resposta.json();

    // aceita tanto ["Soja", ...] quanto [{ nome: "Soja" }, ...]
    const nomes = dados
      .map(item => (typeof item === 'string' ? item : item && item.nome))
      .filter(Boolean);

    mapa.clear();
    nomes.forEach(nome => mapa.set(nome.toLowerCase(), nome));
    datalist.innerHTML = nomes.map(n => `<option value="${escaparHtml(n)}"></option>`).join('');
  } catch (erro) {
    console.error(`Erro ao carregar ${rota}:`, erro);
  }
}

function criarGrupoCulturas(titulo, nomes) {
  const grupo = document.createElement('optgroup');
  grupo.label = titulo;
  nomes.forEach(nome => {
    const opcao = document.createElement('option');
    opcao.value = nome;
    opcao.textContent = nome;
    grupo.appendChild(opcao);
  });
  return grupo;
}

function carregarCulturas() {
  const usadas = new Set();

  Object.keys(GRUPOS_CULTURAS).forEach(titulo => {
    const doGrupo = culturasDaConta.filter(nome => GRUPOS_CULTURAS[titulo].includes(nome));
    doGrupo.forEach(nome => usadas.add(nome));
    if (doGrupo.length > 0) {
      filtroCultura.appendChild(criarGrupoCulturas(titulo, doGrupo));
    }
  });

  const outras = culturasDaConta.filter(nome => !usadas.has(nome));
  if (outras.length > 0) {
    filtroCultura.appendChild(criarGrupoCulturas('Outras', outras));
  }
}

// 8. Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarCulturas();
  carregarOpcoes('/classes', datalistClasses, opcoesClasses);
  buscarProdutosNaApi();
});