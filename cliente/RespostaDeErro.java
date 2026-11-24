// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

/**
 * Representa uma mensagem de erro enviada pelo servidor ao cliente.
 *
 * @author Ana Júlia Conceição da Silva
 * @since 2026
 */
public class RespostaDeErro extends Comunicado
{
    private static final long serialVersionUID = 1L;

    private String mensagem;

    /**
     * Cria um comunicado de erro com a mensagem informada.
     *
     * @param mensagem descricao do erro ocorrido
     */
    public RespostaDeErro (String mensagem)
    {
        if (mensagem == null || mensagem.trim ().isEmpty ())
            this.mensagem = "Erro desconhecido";
        else
            this.mensagem = mensagem.trim ();
    }

    /**
     * Devolve o texto da mensagem de erro.
     *
     * @return mensagem de erro
     */
    public String getMensagem ()
    {
        return this.mensagem;
    }

    /**
     * Representacao textual do erro.
     *
     * @return texto descrevendo o erro
     */
    @Override
    public String toString ()
    {
        return "Erro: " + this.mensagem;
    }

    /**
     * Compara dois erros pelo conteudo da mensagem.
     *
     * @param obj objeto a comparar
     * @return true se as mensagens forem iguais
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

        RespostaDeErro outro = (RespostaDeErro)obj;

        return this.mensagem.equals (outro.mensagem);
    }

    /**
     * Gera o codigo hash a partir da mensagem.
     *
     * @return o codigo hash
     */
    @Override
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.mensagem.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }
}