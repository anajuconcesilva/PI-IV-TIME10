// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.time.LocalDate;

/**
 * Representa o pedido de consulta de carencia enviado pelo cliente.
 *
 * @author Ana Júlia Conceição da Silva
 * @since 2026
 */
public class PedidoDeCarencia extends Comunicado
{
    private static final long serialVersionUID = 1L;

    private String    produto;
    private String    cultura;
    private LocalDate dataDaAplicacao;

    /**
     * Cria um novo pedido de consulta de carencia.
     *
     * @param produto         nome do defensivo agricola
     * @param cultura         cultura agricola onde foi aplicado
     * @param dataDaAplicacao data em que o produto foi aplicado
     * @throws Exception      se algum parametro for nulo ou vazio
     */
    public PedidoDeCarencia (String produto, String cultura, LocalDate dataDaAplicacao) throws Exception
    {
        if (produto == null || produto.trim ().isEmpty ())
            throw new Exception ("Produto ausente");

        if (cultura == null || cultura.trim ().isEmpty ())
            throw new Exception ("Cultura ausente");

        if (dataDaAplicacao == null)
            throw new Exception ("Data ausente");

        this.produto         = produto.trim ();
        this.cultura         = cultura.trim ();
        this.dataDaAplicacao = dataDaAplicacao;
    }

    /**
     * Devolve o nome do produto.
     *
     * @return nome do produto
     */
    public String getProduto ()
    {
        return this.produto;
    }

    /**
     * Devolve o nome da cultura.
     *
     * @return nome da cultura
     */
    public String getCultura ()
    {
        return this.cultura;
    }

    /**
     * Devolve a data da aplicacao.
     *
     * @return data da aplicacao
     */
    public LocalDate getDataDaAplicacao ()
    {
        return this.dataDaAplicacao;
    }

    /**
     * Representacao textual do pedido.
     *
     * @return texto descrevendo o pedido
     */
    @Override
    public String toString ()
    {
        return "Pedido: " + this.produto + " em " + this.cultura + " aplicado em " + this.dataDaAplicacao;
    }

    /**
     * Compara dois pedidos de carencia.
     *
     * @param obj objeto a comparar
     * @return true se os dados forem iguais
     */
    @Override
    public boolean equals (Object obj)
    {
        if (this == obj)
            return true;

        if (obj == null)
            return false;

        if (this.getClass () != obj.getClass ())
            return false;

        PedidoDeCarencia outro = (PedidoDeCarencia)obj;

        if (!this.produto.equalsIgnoreCase (outro.produto))
            return false;

        if (!this.cultura.equalsIgnoreCase (outro.cultura))
            return false;

        if (!this.dataDaAplicacao.equals (outro.dataDaAplicacao))
            return false;

        return true;
    }

    /**
     * Gera o codigo hash do pedido.
     *
     * @return o codigo hash
     */
    @Override
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.produto.toUpperCase ().hashCode ();
        ret = 13 * ret + this.cultura.toUpperCase ().hashCode ();
        ret = 13 * ret + this.dataDaAplicacao.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }
}