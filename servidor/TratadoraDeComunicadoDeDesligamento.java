// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

/**
 * Thread cliente que monitora avisos de desligamento ou queda
 * de conexao com o servidor sem consumir respostas de consultas.
 *
 * @author Ana Júlia Conceição da Silva
 * @since 2026
 */
public class TratadoraDeComunicadoDeDesligamento extends Thread
{
    private Parceiro servidor;

    /**
     * Cria a tratadora associada a conexao com o servidor.
     *
     * @param servidor parceiro que representa o servidor
     * @throws Exception se o parceiro for nulo
     */
    public TratadoraDeComunicadoDeDesligamento (Parceiro servidor) throws Exception
    {
        if (servidor == null)
            throw new Exception ("Servidor ausente");

        this.servidor = servidor;
    }

    /**
     * Espia continuamente os comunicados recebidos do servidor,
     * encerrando o cliente em caso de desligamento ou perda de conexao.
     */
    @Override
    public void run ()
    {
        for (;;)
        {
            try
            {
                Comunicado comunicado = this.servidor.espie ();

                if (comunicado == null)
                {
                    System.err.println ("\nConexao com o servidor perdida!");
                    System.exit (0);
                }
                else if (comunicado instanceof ComunicadoDeDesligamento)
                {
                    System.err.println ("\nO servidor foi desligado!");
                    System.exit (0);
                }

                Thread.sleep (20);
            }
            catch (InterruptedException erro)
            {
                Thread.currentThread ().interrupt ();
                break;
            }
            catch (Exception erro)
            {
                System.err.println ("\nErro na comunicacao com o servidor!");
                System.exit (0);
            }
        }
    }

    /**
     * Descreve a tratadora e o servidor associado.
     *
     * @return texto descritivo da tratadora
     */
    @Override
    public String toString ()
    {
        return "Tratadora conectada ao servidor: " + this.servidor;
    }

    /**
     * Compara duas tratadoras pelo parceiro associado.
     *
     * @param obj objeto a comparar
     * @return true se ambas monitorarem o mesmo parceiro
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

        TratadoraDeComunicadoDeDesligamento outra = (TratadoraDeComunicadoDeDesligamento)obj;

        return this.servidor.equals (outra.servidor);
    }

    /**
     * Gera o codigo hash da tratadora.
     *
     * @return o codigo hash
     */
    @Override
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.servidor.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }
}