// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.io.*;
import java.net.*;
import java.util.concurrent.Semaphore;

// Representa a conexao com um cliente ou servidor
public class Parceiro
{
    private Socket             conexao;
    private ObjectInputStream  receptor;
    private ObjectOutputStream transmissor;

    private Comunicado proximoComunicado = null;

    private final Semaphore mutExRecepcao    = new Semaphore (1, true);
    private final Semaphore mutExTransmissao = new Semaphore (1, true);

    // Construtor que recebe a conexao e os fluxos de entrada e saida
    public Parceiro (Socket             conexao,
                     ObjectInputStream  receptor,
                     ObjectOutputStream transmissor) throws Exception
    {
        if (conexao == null)
            throw new Exception ("Conexao ausente");

        if (receptor == null)
            throw new Exception ("Receptor ausente");

        if (transmissor == null)
            throw new Exception ("Transmissor ausente");

        this.conexao     = conexao;
        this.receptor    = receptor;
        this.transmissor = transmissor;
    }

    // Envia um comunicado para o outro lado da conexao
    public void receba (Comunicado c) throws Exception
    {
        if (c == null)
            throw new Exception ("Comunicado ausente");

        try
        {
            this.mutExTransmissao.acquireUninterruptibly ();
            this.transmissor.writeObject (c);
            this.transmissor.flush ();
        }
        catch (IOException erro)
        {
            throw new Exception ("Erro de transmissao");
        }
        finally
        {
            this.mutExTransmissao.release ();
        }
    }

    // Espera e devolve o comunicado recebido
    public Comunicado envie () throws Exception
    {
        Comunicado ret = null;

        try
        {
            this.mutExRecepcao.acquireUninterruptibly ();

            if (this.proximoComunicado == null)
                this.proximoComunicado = (Comunicado)this.receptor.readObject ();

            ret = this.proximoComunicado;
            this.proximoComunicado = null;
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro de recepcao");
        }
        finally
        {
            this.mutExRecepcao.release ();
        }

        return ret;
    }

    // Encerra as streams e a conexao
    public void adeus () throws Exception
    {
        try
        {
            this.transmissor.close ();
            this.receptor.close ();
            this.conexao.close ();
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro ao encerrar a conexao");
        }
    }

    // Mostra o endereco do parceiro
    public String toString ()
    {
        return "Parceiro conectado em: " + this.conexao.getRemoteSocketAddress ();
    }

    // Compara dois parceiros pela conexao
    public boolean equals (Object obj)
    {
        if (this == obj)
            return true;

        if (obj == null)
            return false;

        if (this.getClass () != obj.getClass ())
            return false;

        Parceiro outro = (Parceiro)obj;

        return this.conexao.equals (outro.conexao);
    }

    // Gera o hashCode a partir da conexao
    public int hashCode ()
    {
        int ret = 1;

        ret = 13 * ret + this.conexao.hashCode ();

        if (ret < 0)
            ret = -ret;

        return ret;
    }
}