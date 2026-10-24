//feito pela aluna marília santos

const pillsCultura = document.querySelectorAll('#filtros-cultura .pill');
const pillsClasse = document.querySelectorAll('#filtros-classe .pill');
const inputBusca = document.getElementById('input-busca');
const produtos = document.querySelectorAll('.card-produto');
const contador = document.getElementById('contador-texto');

let filtroCulturaAtivo = 'todas';
let filtroClasseAtiva = 'todas';

function atualizarFiltros() {
  const termo = inputBusca.value.toLowerCase();
  let visiveis = 0;

  produtos.forEach(produto => {
    const textoProduto = produto.innerText.toLowerCase();
    const culturas = produto.getAttribute('data-cultura');
    const classe = produto.getAttribute('data-classe');

    const matchTexto = termo === '' || textoProduto.includes(termo);
    const matchCultura = filtroCulturaAtivo === 'todas' || culturas.includes(filtroCulturaAtivo);
    const matchClasse = filtroClasseAtiva === 'todas' || classe === filtroClasseAtiva;

    if (matchTexto && matchCultura && matchClasse) {
      produto.style.display = 'flex';
      visiveis++;
    } else {
      produto.style.display = 'none';
    }
  });

  contador.innerText = `${visiveis} produto${visiveis !== 1 ? 's' : ''} encontrado${visiveis !== 1 ? 's' : ''}`;
}

pillsCultura.forEach(pill => {
  pill.addEventListener('click', () => {
    pillsCultura.forEach(p => p.classList.remove('ativo'));
    pill.classList.add('ativo');
    filtroCulturaAtivo = pill.getAttribute('data-filter');
    atualizarFiltros();
  });
});

pillsClasse.forEach(pill => {
  pill.addEventListener('click', () => {
    pillsClasse.forEach(p => p.classList.remove('ativo'));
    pill.classList.add('ativo');
    filtroClasseAtiva = pill.getAttribute('data-filter');
    atualizarFiltros();
  });
});

inputBusca.addEventListener('input', atualizarFiltros);