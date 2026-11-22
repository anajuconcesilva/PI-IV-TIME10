// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.time.LocalDate;

/**
 * Representa a resposta do calculo de carencia enviada ao cliente.
 *
 * @author Ana Júlia Conceição da Silva
 * @since 2026
 */
public class RespostaDeCarencia extends Comunicado
{
    private static final long serialVersionUID = 1L;

    private boolean   autorizado;
    private int       diasDeCarencia;
    private LocalDate dataDeLiberacao;
    private String    mensagem;

    /**
     * Cria uma resposta de consulta de carencia validando os parametros.
     *
     * @param autorizado      indica se a regra foi encontrada e autorizada
     * @param diasDeCarencia  quantidade de dias do periodo de carencia
     * @param dataDeLiberacao data calculada para liberacao da colheita
     * @param mensagem        mensagem informativa ou de status
     * @throws Exception      se diasDeCarencia for negativo ou se autorizado for true com dataDeLiberacao nula
     */
    public RespostaDeCarencia (boolean   autorizado,
                               int       diasDeCarencia,
                               LocalDate dataDeLiberacao,
                               String    mensagem) throws Exception
    {
        if (diasDeCarencia < 0)
            throw new Exception ("Dias de carencia invalidos");

        if (autorizado && dataDeLiberacao == null)
            throw new Exception ("Data de liberacao ausente");

        this.autorizado      = autorizado;
        this.diasDeCarencia  = diasDeCarencia;
        this.dataDeLiberacao = dataDeLiberacao;
        this.mensagem        = (mensagem == null) ? "" : mensagem.trim ();
    }

    /**
     * Informa se o pedido foi autorizado.
     *
     * @return true se autorizado, false caso contrario
     */
    public boolean isAutorizado ()
    {
        return this.autorizado;
    }

    /**
     * Devolve os dias de carencia necessarios.
     *
     * @return quantidade de dias de carencia
     */
    public int getDiasDeCarencia ()
    {
        return this.diasDeCarencia;
    }

    /**
     * Devolve a data calculada para a liberacao da colheita.
     *
     * @return data de liberacao ou null se nao autorizado
     */
    public LocalDate getDataDeLiberacao ()
    {
        return this.dataDeLiberacao;
    }

    /**
     * Devolve a mensagem explicativa ou de status.
     *
     * @return texto da mensagem
     */
    public String getMensagem ()
    {
        return this.mensagem;
    }

    /**
     * Representacao textual da resposta.
     *
     * @return texto descrevendo o resultado da consulta
     */
    @Override
    public String toString ()
    {
        if (this.autorizado)
            return "Autorizado: " + this.diasDeCarencia + " dias de carencia. Liberacao em: " + this.dataDeLiberacao;

        return "Nao autorizado: " + this.mensagem;
    }

    /**
     * Compara duas respostas de carencia.
     *
     * @param obj objeto a comparar
     * @return true se todos os atributos forem iguais
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

    /**
     * Gera o codigo hash da resposta.
     *
     * @return o codigo hash
     */
    @Override
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
}