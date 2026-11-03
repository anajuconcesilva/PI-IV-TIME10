// marilia santos
const API = 'http://localhost:3000';

// 1. Estado único
const estado = {
  cultura: 'todas',
  culturaExata: false, // true quando o valor veio do dropdown (/culturas)
  classe: 'todas',
  classeExata: false   // true quando o valor veio do dropdown (/classes)
};

// Opções reais do banco: chave minúscula -> valor original
const opcoesCulturas = new Map();
const opcoesClasses = new Map();

const POR_PAGINA = 20;
let paginaAtual = 1;
let exibidos = 0;
let temporizador = null;
let controladorAtual = null;

// 2. Elementos da tela
const inputBusca = document.getElementById('input-busca');
const listaProdutos = document.getElementById('lista-produtos');
const contador = document.getElementById('contador-texto');

const botoesCultura = document.querySelectorAll('#filtros-cultura .pill');
const inputNovaCultura = document.getElementById('input-outra-cultura');
const datalistCulturas = document.getElementById('bd-culturas');

const btnTodasClasses = document.getElementById('btn-todas-classes');
const inputClasse = document.getElementById('input-classe');
const datalistClasses = document.getElementById('bd-classes');

// Botão "Carregar mais" (criado por JS, logo abaixo da lista)
const areaMais = document.createElement('div');
areaMais.style.cssText = 'text-align: center; margin: 1.25rem 0;';
const btnMais = document.createElement('button');
btnMais.className = 'pill';
btnMais.textContent = 'Carregar mais';
btnMais.style.display = 'none';
areaMais.appendChild(btnMais);
listaProdutos.insertAdjacentElement('afterend', areaMais);

// 3. Utilitários
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function marcarBotaoCultura(botaoAtivo) {
  botoesCultura.forEach(b => b.classList.toggle('ativo', b === botaoAtivo));
}

function botaoTodasCulturas() {
  return Array.from(botoesCultura).find(b => b.getAttribute('data-filter') === 'todas');
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
          <span>${escaparHtml(produto.carenciaDias || 0)}</span>
          <small>dias carência</small>
        </div>
      </div>
    `;
  }).join('');
}

// anexar = false: nova busca (volta à página 1) | anexar = true: "Carregar mais"
async function buscarProdutosNaApi(anexar = false) {
  if (controladorAtual) controladorAtual.abort();
  controladorAtual = new AbortController();
  const { signal } = controladorAtual;

  const pagina = anexar === true ? paginaAtual + 1 : 1;

  const params = new URLSearchParams();
  const termo = inputBusca.value.trim();

  if (termo) params.append('busca', termo);
  if (estado.cultura !== 'todas') {
    params.append('cultura', estado.cultura);
    if (estado.culturaExata) params.append('culturaExata', 'true');
  }
  if (estado.classe !== 'todas') {
    params.append('classe', estado.classe);
    if (estado.classeExata) params.append('classeExata', 'true');
  }
  params.append('pagina', pagina);
  params.append('limite', POR_PAGINA);

  btnMais.disabled = true;
  btnMais.textContent = 'Carregando...';

  try {
    const resposta = await fetch(`${API}/produtos?${params.toString()}`, { signal });
    if (!resposta.ok) throw new Error('Erro na API');
    const dados = await resposta.json();
    const itens = Array.isArray(dados.itens) ? dados.itens : [];
    const total = Number(dados.total) || 0;

    if (anexar === true) {
      listaProdutos.insertAdjacentHTML('beforeend', montarCards(itens));
      exibidos += itens.length;
    } else if (itens.length === 0) {
      listaProdutos.innerHTML =
        '<div style="text-align: center; padding: 3rem 1rem; color: #666;">Nenhum produto encontrado.</div>';
      contador.innerText = '0 produtos encontrados';
      exibidos = 0;
      btnMais.style.display = 'none';
      paginaAtual = 1;
      return;
    } else {
      listaProdutos.innerHTML = montarCards(itens);
      exibidos = itens.length;
    }

    paginaAtual = pagina;
    contador.innerText = `Mostrando ${exibidos} de ${total} produto(s)`;
    btnMais.style.display = exibidos < total ? 'inline-block' : 'none';
  } catch (erro) {
    if (erro.name === 'AbortError') return; // substituída por uma busca mais nova: ignora
    if (anexar === true) {
      contador.innerText = 'Erro ao carregar mais produtos. Tente novamente.';
    } else {
      listaProdutos.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar produtos.</p>';
      contador.innerText = 'Erro na consulta';
      btnMais.style.display = 'none';
    }
  } finally {
    if (!signal.aborted) {
      btnMais.disabled = false;
      btnMais.textContent = 'Carregar mais';
    }
  }
}

btnMais.addEventListener('click', () => buscarProdutosNaApi(true));

function agendarBusca(atrasoMs = 300) {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => buscarProdutosNaApi(false), atrasoMs);
}

// 5. Sincronização de filtros (única porta de entrada para alterar o estado)
function aplicarCulturaDigitada() {
  const valor = inputNovaCultura.value.trim();

  if (!valor) {
    estado.cultura = 'todas';
    estado.culturaExata = false;
    marcarBotaoCultura(botaoTodasCulturas());
  } else {
    const oficial = opcoesCulturas.get(valor.toLowerCase());
    estado.cultura = oficial || valor;
    estado.culturaExata = Boolean(oficial);
    marcarBotaoCultura(null);
  }
  agendarBusca();
}

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

// Botões estáticos de cultura (Todas, Soja, Milho, Tomate)
botoesCultura.forEach(botao => {
  botao.addEventListener('click', () => {
    marcarBotaoCultura(botao);
    inputNovaCultura.value = '';
    estado.cultura = botao.getAttribute('data-filter') || 'todas';
    estado.culturaExata = false;
    agendarBusca(0);
  });
});

// Caixa de cultura (digitar filtra ao vivo; escolher no dropdown filtra exato)
inputNovaCultura.addEventListener('input', aplicarCulturaDigitada);
inputNovaCultura.addEventListener('change', aplicarCulturaDigitada);

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

// 8. Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarOpcoes('/culturas', datalistCulturas, opcoesCulturas);
  carregarOpcoes('/classes', datalistClasses, opcoesClasses);
  buscarProdutosNaApi(false);
});