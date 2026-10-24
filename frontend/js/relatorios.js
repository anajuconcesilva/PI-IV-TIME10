//feito pela aluna marília santos

const blocosDownload = document.querySelectorAll('.btn-download');
const blocoResumo = document.getElementById('bloco-resumo');
const blocoLista = document.getElementById('bloco-lista');
const estadoVazio = document.getElementById('estado-vazio');

// Simulador de ação de download
blocosDownload.forEach(botao => {
  botao.addEventListener('click', () => {
    alert("Iniciando download do relatório PDF...");
  });
});

// Apenas para demonstrar funcionalidade caso queira testar a tela 4 (Sem Relatórios)
// Se você chamar a função abaixo no console: alternarEstadoVazio(true);
function alternarEstadoVazio(vazio) {
  if (vazio) {
    blocoResumo.hidden = true;
    blocoLista.hidden = true;
    estadoVazio.hidden = false;
  } else {
    blocoResumo.hidden = false;
    blocoLista.hidden = false;
    estadoVazio.hidden = true;
  }
}