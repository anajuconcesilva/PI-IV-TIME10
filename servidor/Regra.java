//Marília Santos

/**
 * Representa uma regra de carência agrícola associada a um produto e uma cultura.
 */
public class Regra
{
    private String produto;
    private String cultura;
    private int diasDeCarencia;

    /**
     * Constrói uma nova regra de carência validando os dados informados.
     *
     * @param produto nome ou código do produto defensivo
     * @param cultura cultura agrícola alvo
     * @param dias quantidade de dias de carência (não negativa)
     * @throws Exception se produto/cultura forem nulos ou vazios, ou se os dias forem negativos
     */
    public Regra (String produto, String cultura, int dias) throws Exception
    {
        if (produto == null || produto.trim ().isEmpty ())
        {
            throw new Exception ("Produto invalido ou vazio");
        }

        if (cultura == null || cultura.trim ().isEmpty ())
        {
            throw new Exception ("Cultura invalida ou vazia");
        }

        if (dias < 0)
        {
            throw new Exception ("Dias de carencia fora da faixa permitida");
        }

        this.produto = produto.trim ();
        this.cultura = cultura.trim ();
        this.diasDeCarencia = dias;
    }

    /**
     * Obtém o produto da regra.
     *
     * @return nome/código do produto
     */
    public String getProduto ()
    {
        return this.produto;
    }

    /**
     * Obtém a cultura da regra.
     *
     * @return nome da cultura
     */
    public String getCultura ()
    {
        return this.cultura;
    }

    /**
     * Obtém o período de carência em dias.
     *
     * @return quantidade de dias de carência
     */
    public int getDiasDeCarencia ()
    {
        return this.diasDeCarencia;
    }

    @Override
    public String toString ()
    {
        return "Produto: " + this.produto +
                " | Cultura: " + this.cultura +
                " | Carencia: " + this.diasDeCarencia + " dias";
    }

    @Override
    public boolean equals (Object obj)
    {
        if (this == obj)
        {
            return true;
        }

        if (obj == null)
        {
            return false;
        }

        if (this.getClass () != obj.getClass ())
        {
            return false;
        }

        Regra regra = (Regra) obj;

        return this.produto.equals (regra.produto) &&
                this.cultura.equals (regra.cultura) &&
                this.diasDeCarencia == regra.diasDeCarencia;
    }

    @Override
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.produto.hashCode ();
        ret = 13 * ret + this.cultura.hashCode ();
        ret = 13 * ret + Integer.valueOf (this.diasDeCarencia).hashCode ();

        if (ret < 0)
        {
            ret = -ret;
        }

        return ret;
    }
}