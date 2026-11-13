// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.time.LocalDate;

// Representa a resposta do calculo de carencia enviada ao cliente
public class RespostaDeCarencia extends Comunicado
{
    private boolean   autorizado;
    private int       diasDeCarencia;
    private LocalDate dataDeLiberacao;
    private String    mensagem;

    // Construtor com parametros
    public RespostaDeCarencia (boolean   autorizado,
                               int       diasDeCarencia,
                               LocalDate dataDeLiberacao,
                               String    mensagem)
    {
        this.autorizado      = autorizado;
        this.diasDeCarencia  = diasDeCarencia;
        this.dataDeLiberacao = dataDeLiberacao;
        this.mensagem        = (mensagem == null) ? "" : mensagem.trim ();
    }

    // Construtor de copia
    public RespostaDeCarencia (RespostaDeCarencia modelo) throws Exception
    {
        if (modelo == null)
            throw new Exception ("Modelo ausente");

        this.autorizado      = modelo.autorizado;
        this.diasDeCarencia  = modelo.diasDeCarencia;
        this.dataDeLiberacao = modelo.dataDeLiberacao;
        this.mensagem        = modelo.mensagem;
    }

    // Informa se o pedido foi autorizado
    public boolean isAutorizado ()
    {
        return this.autorizado;
    }

    // Devolve os dias de carencia necessarios
    public int getDiasDeCarencia ()
    {
        return this.diasDeCarencia;
    }

    // Devolve a data calculada para a liberacao da colheita
    public LocalDate getDataDeLiberacao ()
    {
        return this.dataDeLiberacao;
    }

    // Devolve a mensagem explicativa ou de status
    public String getMensagem ()
    {
        return this.mensagem;
    }

    // Representacao textual da resposta
    public String toString ()
    {
        if (this.autorizado)
            return "Autorizado: " + this.diasDeCarencia + " dias de carencia. Liberacao em: " + this.dataDeLiberacao;

        return "Nao autorizado: " + this.mensagem;
    }

    // Compara duas respostas
    public boolean equals (Object obj)
    {
        if (this == obj)
            return true;

        if (obj == null)
            return false;

        if (this.getClass () != obj.getClass ())
            return false;

        RespostaDeCarencia outra = (RespostaDeCarencia)obj;

        if (this.autorizado != outra.autorizado)
            return false;

        if (this.diasDeCarencia != outra.diasDeCarencia)
            return false;

        if (this.dataDeLiberacao == null)
        {
            if (outra.dataDeLiberacao != null)
                return false;
        }
        else if (!this.dataDeLiberacao.equals (outra.dataDeLiberacao))
            return false;

        if (!this.mensagem.equals (outra.mensagem))
            return false;

        return true;
    }

    // Gera o codigo hash
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + Boolean.valueOf (this.autorizado).hashCode ();
        ret = 13 * ret + Integer.valueOf (this.diasDeCarencia).hashCode ();

        if (this.dataDeLiberacao != null)
            ret = 13 * ret + this.dataDeLiberacao.hashCode ();

        ret = 13 * ret + this.mensagem.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }

    // Clona a resposta
    public Object clone ()
    {
        RespostaDeCarencia ret = null;

        try
        {
            ret = new RespostaDeCarencia (this);
        }
        catch (Exception erro)
        {}

        return ret;
    }
}