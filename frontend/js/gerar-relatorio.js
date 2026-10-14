//feito pela aluna marília santos

const formRelatorio = document.getElementById('form-relatorio');

formRelatorio.addEventListener('submit', function(evento) {
  evento.preventDefault();
  
  // Como não há backend, apenas simulamos o sucesso.
  alert("Relatório gerado com sucesso! Iniciando download...");
  window.location.href = "relatorios.html"; 
});