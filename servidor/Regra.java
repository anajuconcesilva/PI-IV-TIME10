// Beatriz Naomi Ferreira Sasaki - 25016735

/**
 * Representa uma regra de cultivo com uma cultura e um período de carência.
 * @author Beatriz Naomi Ferreira Sasaki
 * @since 2026
 */

public class Regra
{
    
    private final String produto;
    private final String cultura;
    private final int diasCarencia;

    /**
     * Cria uma regra com a cultura e o período de carência.
     * @param cultura nome da cultura
     * @param produto nome do produto
     * @param diasCarencia período de carência em dias
     * @throws IllegalArgumentException se a cultura for nula ou vazia, ou se o período de carência for negativo
     * 
     */
    public Regra (String produto, String cultura,  int diasCarencia)
    {
        if (produto == null || produto.trim ().isEmpty () )
        {
            throw new IllegalArgumentException ("Produto invalido");
        }
        if (cultura == null || cultura.trim ().isEmpty ())
        {
            throw new IllegalArgumentException ("Cultura invalida");
        }
        if (diasCarencia <0)
        {
            throw new IllegalArgumentException ("Dias de carencia invalidos");
        }

        this.produto = produto.toLowerCase ();
        this.cultura = cultura.toLowerCase ();
        this.diasCarencia = diasCarencia;
    }
    /**
     * Retorna o nome da cultura.
     * @return nome da cultura
     */
    public String getCultura ()
    {
        return this.cultura;
    }

    /**
     * Retorna o período de carência em dias.
     * @return período de carência em dias
     */
    public int getDiasCarencia ()
    {
        return this.diasCarencia;
    }

    /**
     * Retorna o nome do produto.
     * @return nome do produto
     */

    public String getProduto ()
    {
        return this.produto;
    }

    /**
     * Retorna uma representação em string da regra.
     * @return representação em string da regra
     */
    @Override
    public String toString ()
    {
        return  "Produto: " + this.produto
        + " | Cultura: " + this.cultura
        + " | Carencia: " + this.diasCarencia + " dias";
    }

    /**
     * Compara esta regra com outro objeto para verificar se são iguais.
     * @param obj objeto a ser comparado
     * @return true se o objeto for uma regra com a mesma cultura, mesmo produto e período de carência, false caso contrário
     */
    @Override
    public boolean equals (Object obj)
    {
        if ( this == obj) 
            return true;

        if ( obj == null )
            return false;
        

        if ( this.getClass () != obj.getClass ())
            return false;
        

        Regra outraRegra = (Regra) obj;
        return  this.produto.equals (outraRegra.produto) && this.cultura.equals (outraRegra.cultura) && this.diasCarencia == outraRegra.diasCarencia;
    }

    /**
     * Calcula o hash usando os atributos comparados pelo equals.
     * @return código de hash da regra
     */
    @Override
    public int hashCode ()
    {
        int ret = super.hashCode ();

        ret = 13*ret + this.produto.hashCode ();

        ret = 13*ret + this.cultura.hashCode ();

        ret = 13*ret + Integer.valueOf (this.diasCarencia).hashCode ();
        
        return ret;
    }

}

