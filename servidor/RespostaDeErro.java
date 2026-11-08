// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

// Representa uma mensagem de erro enviada pelo servidor ao cliente
public class RespostaDeErro extends Comunicado
{
    private String mensagem;

    // Construtor com a mensagem de erro
    public RespostaDeErro (String mensagem)
    {
        if (mensagem == null || mensagem.trim ().isEmpty ())
            this.mensagem = "Erro desconhecido";
        else
            this.mensagem = mensagem.trim ();
    }

    // Construtor de copia
    public RespostaDeErro (RespostaDeErro modelo) throws Exception
    {
        if (modelo == null)
            throw new Exception ("Modelo ausente");

        this.mensagem = modelo.mensagem;
    }

    public String getMensagem ()
    {
        return this.mensagem;
    }

    // Representacao textual do erro
    public String toString ()
    {
        return "Erro: " + this.mensagem;
    }

    // Compara dois erros pelo conteudo da mensagem
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

    // Gera o codigo hash a partir da mensagem
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.mensagem.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }

    // Clona o comunicado de erro
    public Object clone ()
    {
        RespostaDeErro ret = null;

        try
        {
            ret = new RespostaDeErro (this);
        }
        catch (Exception erro)
        {}

        return ret;
    }
}