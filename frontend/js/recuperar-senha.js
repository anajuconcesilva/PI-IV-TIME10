// Aluna: Eduarda Prado Deiró | RA: 25004440

const etapas = document.querySelectorAll(".etapa-recuperar");
const formEmail = document.getElementById("form-email");
const formCodigo = document.getElementById("form-codigo");
const formSenha = document.getElementById("form-senha");

const camposCodigo = document.querySelectorAll(".codigo input");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmar-senha");

function mostrarEtapa(numero) {
  for (let i = 0; i < etapas.length; i++) {
    etapas[i].hidden = i !== numero;
  }
  etapas[numero].querySelector("input").focus();
}

// Nada é enviado ainda: cada botão só leva para o passo seguinte
formEmail.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mostrarEtapa(1);
});

formCodigo.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mostrarEtapa(2);
});

// Ainda não salva no servidor: só volta para o login
formSenha.addEventListener("submit", function (evento) {
  evento.preventDefault();
  window.location.href = "login.html";
});

// Quadradinhos do código: pula para o próximo ao digitar
// e volta para o anterior ao apagar
for (let i = 0; i < camposCodigo.length; i++) {
  camposCodigo[i].addEventListener("input", function () {
    camposCodigo[i].value = camposCodigo[i].value.replace(/\D/g, "");

    if (camposCodigo[i].value !== "" && i < camposCodigo.length - 1) {
      camposCodigo[i + 1].focus();
    }
  });

  camposCodigo[i].addEventListener("keydown", function (evento) {
    if (evento.key === "Backspace" && camposCodigo[i].value === "" && i > 0) {
      camposCodigo[i - 1].focus();
    }
  });

  // Colar o código inteiro de uma vez
  camposCodigo[i].addEventListener("paste", function (evento) {
    evento.preventDefault();
    const numeros = evento.clipboardData.getData("text").replace(/\D/g, "");

    for (let j = 0; j < camposCodigo.length; j++) {
      camposCodigo[j].value = numeros[j] || "";
    }
  });
}

function conferirSenhas() {
  if (campoSenha.value === campoConfirmar.value) {
    campoConfirmar.setCustomValidity("");
  } else {
    campoConfirmar.setCustomValidity("As senhas não são iguais.");
  }
}

campoSenha.addEventListener("input", conferirSenhas);
campoConfirmar.addEventListener("input", conferirSenhas);
