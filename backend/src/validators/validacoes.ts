// Aluna: Ana Júlia Conceição da Silva | RA: 25002592 -->
//Validações do backend

const UFS_VALIDAS: string[] = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES",
  "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
  "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
];


// Remove pontos, traços, barras e outros caracteres,
// deixando somente os números.
function somenteNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

// VALIDAÇÃO DE CNPJ

export function validarCNPJ(cnpj: string): boolean {
  const numeros = somenteNumeros(cnpj);

  // O CNPJ deve ter 14 dígitos.
  if (numeros.length !== 14) {
    return false;
  }

  // Impede CNPJs com todos os dígitos iguais.
  if (/^(\d)\1{13}$/.test(numeros)) {
    return false;
  }

  // Calcula um dos dígitos verificadores do CNPJ.
  function calcularDigito(base: string): number {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let soma = 0;

    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }

    const resto = soma % 11;

    return resto < 2 ? 0 : 11 - resto;
  }

  const base = numeros.substring(0, 12);

  const primeiroDigito = calcularDigito(base);

  if (primeiroDigito !== Number(numeros[12])) {
    return false;
  }

  const segundoDigito = calcularDigito(
    base + primeiroDigito
  );

  return segundoDigito === Number(numeros[13]);
}

// VALIDAÇÃO DE E-MAIL

export function validarEmail(email: string): boolean {
  const valor = email.trim();

  // Impede e-mails vazios ou longos
  if (valor.length === 0 || valor.length > 254) {
    return false;
  }

  // Verifica o formato básico do endereço.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

// VALIDAÇÃO DE SENHA

export function validarSenha(senha: string): boolean {
  // Pelo menos 6 caracteres.
  if (senha.length < 6) {
    return false;
  }

  // Pelo menos uma letra maiúscula.
  if (!/[A-Z]/.test(senha)) {
    return false;
  }

  // Pelo menos uma letra minúscula.
  if (!/[a-z]/.test(senha)) {
    return false;
  }

  // Pelo menos um número.
  if (!/[0-9]/.test(senha)) {
    return false;
  }

  return true;
}

// VALIDAÇÃO DE UF

export function validarUF(uf: string): boolean {
  return UFS_VALIDAS.includes(uf.trim().toUpperCase());
}

// VALIDAÇÃO DE MUNICÍPIO

export async function validarMunicipio(
  municipio: string,
  uf: string
): Promise<boolean> {
  const nomeMunicipio = municipio.trim();
  const siglaUF = uf.trim().toUpperCase();

  // Verifica se os campos foram preenchidos.
  if (
    nomeMunicipio.length < 2 ||
    nomeMunicipio.length > 100 ||
    !validarUF(siglaUF)
  ) {
    return false;
  }

  try {
    // Consulta os estados oficiais do IBGE.
    const respostaEstados = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    );

    if (!respostaEstados.ok) {
      throw new Error("Falha ao consultar os estados no IBGE.");
    }

    const estados: { id: number; sigla: string }[] =
      await respostaEstados.json();

    const estado = estados.find(
      (item) => item.sigla === siglaUF
    );

    if (!estado) {
      return false;
    }

    // Consulta os municípios do estado informado.
    const respostaMunicipios = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios`
    );

    if (!respostaMunicipios.ok) {
      throw new Error("Falha ao consultar os municípios no IBGE.");
    }

    const municipios: { nome: string }[] =
      await respostaMunicipios.json();

    // Compara os nomes ignorando maiúsculas e minúsculas.
    const nomeNormalizado = nomeMunicipio.toLocaleLowerCase("pt-BR");

    return municipios.some(
      (item) =>
        item.nome.toLocaleLowerCase("pt-BR") === nomeNormalizado
    );
  } catch {
    // Diferencia falha de conexão de município inválido.
    throw new Error(
      "Não foi possível verificar o município. Tente novamente."
    );
  }
}
