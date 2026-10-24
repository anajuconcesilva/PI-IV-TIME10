// Aluna: Eduarda Prado Deiró | RA: 25004440

const formLogin = document.getElementById("form-login");

// Ainda não confere e-mail e senha com o servidor: só abre o dashboard
formLogin.addEventListener("submit", function (evento) {
  evento.preventDefault();
  window.location.href = "dashboard.html";
});
