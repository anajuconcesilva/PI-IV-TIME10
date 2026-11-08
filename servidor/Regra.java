//Marília Santos


public class Regra {
    private String produto;
    private String cultura;
    private int diasDeCarencia;

    public Regra(String produto, String cultura, int dias) throws Exception {
        if (produto == null || produto.trim().isEmpty()) {
            throw new Exception("Produto invalido ou vazio");
        }
        if (cultura == null || cultura.trim().isEmpty()) {
            throw new Exception("Cultura invalida ou vazia");
        }
        if (dias < 0) {
            throw new Exception("Dias de carencia fora da faixa permitida");
        }

        this.produto = produto.trim();
        this.cultura = cultura.trim();
        this.diasDeCarencia = dias;
    }

    public String getProduto() {
        return this.produto;
    }

    public String getCultura() {
        return this.cultura;
    }

    public int getDiasDeCarencia() {
        return this.diasDeCarencia;
    }

    @Override
    public String toString() {
        return "Produto: " + this.produto +
                " | Cultura: " + this.cultura +
                " | Carencia: " + this.diasDeCarencia + " dias";
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (this.getClass() != obj.getClass()) return false;

        Regra regra = (Regra) obj;

        return this.produto.equals(regra.produto) &&
                this.cultura.equals(regra.cultura) &&
                this.diasDeCarencia == regra.diasDeCarencia;
    }

    @Override
    public int hashCode() {
        int ret = 1;

        ret = 13 * ret + this.produto.hashCode();
        ret = 13 * ret + this.cultura.hashCode();
        ret = 13 * ret + Integer.valueOf(this.diasDeCarencia).hashCode();

        if (ret < 0) ret = -ret;

        return ret;
    }
}