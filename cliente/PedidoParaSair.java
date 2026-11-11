// Aluna: Eduarda Prado Deiró | RA: 25004440

/**
 * Pedido que o cliente envia quando quer encerrar a conversa.
 *
 * Não carrega dados: o que importa é o tipo da mensagem.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class PedidoParaSair extends Comunicado
{
    /**
     * Cria o pedido para sair.
     */
    public PedidoParaSair ()
    {}

    /**
     * Descreve o pedido em texto.
     *
     * @return texto que descreve o pedido
     */
    public String toString ()
    {
        return "Pedido para sair";
    }

    /**
     * Compara este pedido com outro objeto.
     *
     * @param obj objeto a ser comparado
     * @return true se o objeto também for um pedido para sair
     */
    public boolean equals (Object obj)
    {
        if (this == obj)
            return true;

        if (obj == null)
            return false;

        if (this.getClass () != obj.getClass ())
            return false;

        return true;
    }

    /**
     * Calcula o código de hash do pedido.
     *
     * @return código de hash do pedido
     */
    public int hashCode ()
    {
        int ret = 7; // sem atributos, um numero positivo qualquer

        return ret;
    }
}
