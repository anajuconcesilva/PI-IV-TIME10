// Aluna: Eduarda Prado Deiró | RA: 25004440

import java.io.*;
import java.net.*;
import java.util.concurrent.Semaphore;

/**
 * Cuida da conexão com o outro lado e da troca de comunicados.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class Parceiro
{
    private Socket             conexao;
    private ObjectInputStream  receptor;
    private ObjectOutputStream transmissor;

    private Comunicado proximoComunicado = null;

    private Semaphore mutEx = new Semaphore (1, true);

    /**
     * Guarda a conexão e os fluxos de entrada e saída.
     *
     * @param conexao     socket da conexão
     * @param receptor    fluxo por onde chegam os comunicados
     * @param transmissor fluxo por onde saem os comunicados
     * @throws Exception  se faltar algum parâmetro
     */
    public Parceiro (Socket             conexao,
                     ObjectInputStream  receptor,
                     ObjectOutputStream transmissor)
                     throws Exception
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

    /**
     * Envia um comunicado para o parceiro.
     *
     * @param x          comunicado que vai ser enviado
     * @throws Exception se o comunicado for nulo ou o envio falhar
     */
    public void receba (Comunicado x) throws Exception
    {
        if (x == null)
            throw new Exception ("Comunicado ausente");

        try
        {
            this.transmissor.writeObject (x);
            this.transmissor.flush       ();
        }
        catch (IOException erro)
        {
            throw new Exception ("Erro de transmissao");
        }
    }

    /**
     * Olha o próximo comunicado sem tirar ele da fila.
     *
     * @return           próximo comunicado recebido
     * @throws Exception se a leitura falhar
     */
    public Comunicado espie () throws Exception
    {
        this.mutEx.acquireUninterruptibly ();
        try
        {
            if (this.proximoComunicado == null)
                this.proximoComunicado = (Comunicado)this.receptor.readObject ();

            return this.proximoComunicado;
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro de recepcao");
        }
        finally
        {
            this.mutEx.release ();
        }
    }

    /**
     * Pega o próximo comunicado e tira ele da fila.
     *
     * @return           próximo comunicado recebido
     * @throws Exception se a leitura falhar
     */
    public Comunicado envie () throws Exception
    {
        try
        {
            if (this.proximoComunicado == null)
                this.proximoComunicado = (Comunicado)this.receptor.readObject ();

            Comunicado ret         = this.proximoComunicado;
            this.proximoComunicado = null;
            return ret;
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro de recepcao");
        }
    }

    /**
     * Encerra a conexão com o parceiro.
     *
     * @throws Exception se não conseguir fechar a conexão
     */
    public void adeus () throws Exception
    {
        try
        {
            this.transmissor.close ();
            this.receptor   .close ();
            this.conexao    .close ();
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro de desconexao");
        }
    }

    /**
     * Mostra o endereço do parceiro.
     *
     * @return texto com o endereço e a porta
     */
    public String toString ()
    {
        return "Parceiro " + this.conexao.getRemoteSocketAddress ();
    }

    /**
     * Compara dois parceiros pela conexão.
     *
     * @param obj objeto comparado
     * @return    true se a conexão for a mesma
     */
    public boolean equals (Object obj)
    {
        if (this == obj)
            return true;

        if (obj == null)
            return false;

        if (this.getClass () != obj.getClass ())
            return false;

        Parceiro parceiro = (Parceiro)obj;

        return this.conexao.equals (parceiro.conexao);
    }

    /**
     * Gera o hashCode a partir da conexão.
     *
     * @return o hashCode
     */
    public int hashCode ()
    {
        int ret = 1;

        ret = 13*ret + this.conexao.hashCode ();

        return ret;
    }
}
