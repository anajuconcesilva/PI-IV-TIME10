public class PedidoDeCarencia extends Comunicado {
    private String produto;

    public PedidoDeCarencia(String produto) {
        this.produto = produto;
    }

    public String getProduto() {
        return this.produto;
    }
}