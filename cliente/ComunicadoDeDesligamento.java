// Aluna: Eduarda Prado Deiró | RA: 25004440

/**
 * Aviso que o servidor envia a todos os clientes quando vai desligar.
 *
 * Não carrega dados: o que importa é o tipo da mensagem.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class ComunicadoDeDesligamento extends Comunicado
{
    /**
     * Cria o comunicado de desligamento.
     */
    public ComunicadoDeDesligamento ()
    {}

    /**
     * Descreve o comunicado em texto.
     *
     * @return texto que descreve o comunicado
     */
    public String toString ()
    {
        return "Comunicado de desligamento";
    }

    /**
     * Compara este comunicado com outro objeto.
     *
     * @param obj objeto a ser comparado
     * @return true se o objeto também for um comunicado de desligamento
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
     * Calcula o código de hash do comunicado.
     *
     * @return código de hash do comunicado
     */
    public int hashCode ()
    {
        int ret = 11; // sem atributos, um numero positivo qualquer

        return ret;
    }
}
