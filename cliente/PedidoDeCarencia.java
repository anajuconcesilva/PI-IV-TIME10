// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.time.LocalDate;

// Representa o pedido de consulta enviado pelo cliente
public class PedidoDeCarencia extends Comunicado
{
    private String    produto;
    private String    cultura;
    private LocalDate dataDaAplicacao;

    // Construtor com parametros
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

    // Construtor de copia
    public PedidoDeCarencia (PedidoDeCarencia modelo) throws Exception
    {
        if (modelo == null)
            throw new Exception ("Modelo ausente");

        this.produto         = modelo.produto;
        this.cultura         = modelo.cultura;
        this.dataDaAplicacao = modelo.dataDaAplicacao;
    }

    // Devolve o nome do produto
    public String getProduto ()
    {
        return this.produto;
    }

    // Devolve o nome da cultura
    public String getCultura ()
    {
        return this.cultura;
    }

    // Devolve a data da aplicacao
    public LocalDate getDataDaAplicacao ()
    {
        return this.dataDaAplicacao;
    }

    // Representacao textual do pedido
    public String toString ()
    {
        return "Pedido: " + this.produto + " em " + this.cultura + " aplicado em " + this.dataDaAplicacao;
    }

    // Compara dois pedidos
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

    // Gera o codigo hash
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

    // Clona o pedido
    public Object clone ()
    {
        PedidoDeCarencia ret = null;

        try
        {
            ret = new PedidoDeCarencia (this);
        }
        catch (Exception erro)
        {}

        return ret;
    }
}