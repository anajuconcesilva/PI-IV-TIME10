// Aluna: Eduarda Prado Deiró | RA: 25004440

// Botão do olho: mostra ou esconde a senha do campo ao lado dele.
// Usado no login e no cadastro.
const botoesOlho = document.querySelectorAll(".botao-olho");

for (let i = 0; i < botoesOlho.length; i++) {
  botoesOlho[i].addEventListener("click", function () {
    const botao = botoesOlho[i];
    const campoSenha = botao.parentElement.querySelector("input");

    if (campoSenha.type === "password") {
      campoSenha.type = "text";
      botao.classList.add("senha-visivel");
      botao.setAttribute("aria-label", "Esconder senha");
    } else {
      campoSenha.type = "password";
      botao.classList.remove("senha-visivel");
      botao.setAttribute("aria-label", "Mostrar senha");
    }
  });
}
