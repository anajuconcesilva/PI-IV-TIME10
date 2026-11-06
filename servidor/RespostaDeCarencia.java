public class RespostaDeCarencia extends Comunicado {
    private String produto;
    private int dias;

    public RespostaDeCarencia(String produto, int dias) {
        this.produto = produto;
        this.dias = dias;
    }
}