//feito por marilia santos

const inputBusca = document.getElementById('input-busca');
const pillsCultura = document.querySelectorAll('#filtros-cultura button.pill');
const inputOutraCultura = document.getElementById('input-outra-cultura');
const pillsClasse = document.querySelectorAll('#filtros-classe .pill');
const produtos = document.querySelectorAll('.card-produto');
const contador = document.getElementById('contador-texto');

// Estado atual dos filtros
let filtroCulturaAtivo = 'todas';
let filtroClasseAtiva = 'todas';

// Filtra a tela localmente (simulando comportamento até integrar a busca de produtos na API)
function atualizarFiltros() {
  const termo = inputBusca.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let visiveis = 0;

  produtos.forEach(produto => {
    const textoProduto = produto.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const culturas = (produto.getAttribute('data-cultura') || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const classe = (produto.getAttribute('data-classe') || "").toLowerCase();

    // Validações
    const matchTexto = termo === '' || textoProduto.includes(termo);
    const matchCultura = filtroCulturaAtivo === 'todas' || culturas.includes(filtroCulturaAtivo);
    const matchClasse = filtroClasseAtiva === 'todas' || classe === filtroClasseAtiva;

    // Aplica visibilidade
    if (matchTexto && matchCultura && matchClasse) {
      produto.style.display = 'flex';
      visiveis++;
    } else {
      produto.style.display = 'none';
    }
  });

  contador.innerText = `${visiveis} produto${visiveis !== 1 ? 's' : ''} encontrado${visiveis !== 1 ? 's' : ''}`;
}

// Interação 1: Clique nas pílulas de Cultura
pillsCultura.forEach(pill => {
  pill.addEventListener('click', () => {
    // Remove ativo de todas as pílulas
    pillsCultura.forEach(p => p.classList.remove('ativo'));
    // Adiciona ativo na clicada
    pill.classList.add('ativo');
    
    // Zera o campo de busca de outra cultura
    inputOutraCultura.value = ""; 
    
    // Atualiza o estado
    filtroCulturaAtivo = pill.getAttribute('data-filter');
    atualizarFiltros();
  });
});

// Interação 2: Digitação no campo "+ Buscar cultura"
inputOutraCultura.addEventListener('input', (evento) => {
  const valorDigitado = evento.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (valorDigitado !== "") {
    // Se digitou algo, remove o estilo ativo das pílulas padrão
    pillsCultura.forEach(p => p.classList.remove('ativo'));
    filtroCulturaAtivo = valorDigitado;
  } else {
    // Se apagou tudo, volta a marcar a pílula "Todas" por padrão
    pillsCultura[0].classList.add('ativo');
    filtroCulturaAtivo = 'todas';
  }
  
  atualizarFiltros();
});

// Interação 3: Clique nas pílulas de Classe
pillsClasse.forEach(pill => {
  pill.addEventListener('click', () => {
    pillsClasse.forEach(p => p.classList.remove('ativo'));
    pill.classList.add('ativo');
    
    filtroClasseAtiva = pill.getAttribute('data-filter');
    atualizarFiltros();
  });
});

// Interação 4: Digitação na barra principal de pesquisa
inputBusca.addEventListener('input', atualizarFiltros);

// INTEGRAÇÃO COM BACK-END: Preenche o datalist de Culturas
async function carregarCulturasDoBanco() {
  try {
    // Ajuste a porta aqui se o seu Node.js não estiver rodando na 3000
    const resposta = await fetch('http://localhost:3000/culturas');
    
    if (!resposta.ok) throw new Error('Falha na comunicação com a API');
    
    const culturasApi = await resposta.json();
    const datalist = document.getElementById('bd-culturas');
    
    datalist.innerHTML = ''; 
    
    culturasApi.forEach(cultura => {
      const option = document.createElement('option');
      option.value = cultura.nome;
      datalist.appendChild(option);
    });
  } catch (erro) {
    console.error("Erro ao carregar as culturas do banco:", erro);
  }
}

// Dispara o fetch para popular o autocomplete assim que o script roda
carregarCulturasDoBanco();