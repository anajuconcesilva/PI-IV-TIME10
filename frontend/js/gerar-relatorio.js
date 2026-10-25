// feito pela aluna marília santos

const API_URL = 'http://localhost:3000';

const formRelatorio = document.getElementById('form-relatorio');

formRelatorio.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const botaoGerar = formRelatorio.querySelector(
    'button[type="submit"]'
  );

  // Localiza os campos existentes no HTML, sem exigir novos IDs.
  const camposFazenda = formRelatorio.querySelectorAll(
    '.grid-3 select'
  );

  const camposData = formRelatorio.querySelectorAll(
    'input[type="date"]'
  );

  const campoFazenda = camposFazenda[0];
  const campoTalhao = camposFazenda[1];

  const periodoInicial = camposData[0]?.value;
  const periodoFinal = camposData[1]?.value;

  try {
    // Valida os campos obrigatórios.
    if (
      !campoFazenda?.value ||
      !campoTalhao?.value ||
      !periodoInicial ||
      !periodoFinal
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (periodoInicial > periodoFinal) {
      alert('A data inicial não pode ser posterior à data final.');
      return;
    }


    const propriedadeId = campoFazenda.value;

    if (!/^[a-fA-F0-9]{24}$/.test(propriedadeId)) {
      alert(
        'A fazenda selecionada não possui um ID válido do MongoDB. ' +
        'É necessário carregar o ID real da propriedade nas opções.'
      );
      return;
    }

    if (botaoGerar) {
      botaoGerar.disabled = true;
      botaoGerar.textContent = 'Gerando relatório...';
    }

    const dataInicial = new Date(
      `${periodoInicial}T00:00:00.000`
    );

    const dataFinal = new Date(
      `${periodoFinal}T23:59:59.999`
    );

    const dadosRelatorio = {
      propriedade_id: propriedadeId,
      periodo_inicial: dataInicial.toISOString(),
      periodo_final: dataFinal.toISOString()
    };

    // Não envia o filtro quando "Todos os talhões" estiver selecionado.
    const valorTalhao = campoTalhao.value.trim();

    const opcaoTalhao = campoTalhao.options[
      campoTalhao.selectedIndex
    ];

    const textoTalhao = opcaoTalhao
      ? opcaoTalhao.textContent.trim().toLowerCase()
      : '';

    const selecionouTodos =
      textoTalhao.includes('todos os talhões') ||
      valorTalhao.toLowerCase() === 'todos' ||
      valorTalhao.toLowerCase() === 'todos-os-talhoes';

    if (!selecionouTodos) {
      if (!/^[a-fA-F0-9]{24}$/.test(valorTalhao)) {
        alert(
          'O talhão selecionado não possui um ID válido do MongoDB.'
        );
        return;
      }

      dadosRelatorio.talhao_id = valorTalhao;
    }

    // Solicita a geração do PDF ao backend.
    const resposta = await fetch(`${API_URL}/relatorios/gerar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosRelatorio)
    });

    if (!resposta.ok) {
      let mensagem = 'Não foi possível gerar o relatório.';

      try {
        const erro = await resposta.json();
        mensagem = erro.erro || mensagem;
      } catch {
        // Mantém a mensagem padrão se a resposta não for JSON.
      }

      throw new Error(mensagem);
    }

    const arquivo = await resposta.blob();
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'relatorio-aplicacoes.pdf';

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    alert('Relatório gerado com sucesso! O download foi iniciado.');

    window.location.href = 'relatorios.html';

  } catch (erro) {
    console.error('Erro ao gerar relatório:', erro);

    alert(
      erro instanceof Error
        ? erro.message
        : 'Ocorreu um erro ao gerar o relatório.'
    );
  } finally {
    if (botaoGerar) {
      botaoGerar.disabled = false;
      botaoGerar.textContent = 'Gerar Relatório (PDF)';
    }
  }
});
