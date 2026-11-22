// Aluna: Eduarda Prado Deiró | RA: 25004440

export class ErroApi extends Error {
  status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}
