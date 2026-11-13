// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

// Thread cliente que monitora o encerramento do servidor
public class TratadoraDeComunicadoDeDesligamento extends Thread
{
    private Parceiro servidor;

    // Construtor que recebe a conexao com o servidor
    public TratadoraDeComunicadoDeDesligamento (Parceiro servidor) throws Exception
    {
        if (servidor == null)
            throw new Exception ("Servidor ausente");

        this.servidor = servidor;
    }

    // Fica em loop esperando comunicados do servidor
    public void run ()
    {
        for (;;)
        {
            try
            {
                Comunicado comunicado = this.servidor.envie ();

                if (comunicado instanceof ComunicadoDeDesligamento)
                {
                    System.err.println ("\nO servidor foi desligado!");
                    System.exit (0);
                }
            }
            catch (Exception erro)
            {}
        }
    }

    // Representacao textual da tratadora
    public String toString ()
    {
        return "Tratadora conectada ao servidor: " + this.servidor;
    }

    // Compara duas tratadoras pelo parceiro associado
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

    // Gera o codigo hash da tratadora
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.servidor.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }
}