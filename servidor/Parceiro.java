//Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.io.*;
import java.net.*;
import java.util.concurrent.Semaphore;

public class Parceiro extends Thread
{
    private Socket             conexao;
    private ObjectInputStream  receptor;
    private ObjectOutputStream transmissor;

    private Comunicado         proximoComunicado = null;
    private Semaphore          mutEx = new Semaphore (1, true);
    private Semaphore          ent   = new Semaphore (0, true);

    //Constrói o parceiro de comunicação.

     @param conexao      //socket da conexão
     @param receptor     //fluxo de entrada
     @param transmissor  //fluxo de saída
     @throws Exception   //se algum parâmetro for nulo

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

        this.start ();
    }

   //Envia uma mensagem pelo fluxo de saída.
    @param x          //a mensagem a ser enviada
    @throws Exception //se a mensagem for nula ou houver erro de I/O
    public void receba (Comunicado x) throws Exception
    {
        if (x == null)
            throw new Exception ("Comunicado nulo");

        try
        {
            this.transmissor.writeObject (x);
            this.transmissor.flush ();
        }
        catch (IOException erro)
        {
            throw new Exception ("Erro de transmissao");
        }
    }

    //Olha a próxima mensagem na fila sem a consumir.
    @return
    @throws Exception //se a thread for interrompida

    public Comunicado espie () throws Exception
    {
        try
        {
            this.ent.acquire ();
            this.mutEx.acquire ();

            return this.proximoComunicado;
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro ao espiar");
        }
        finally
        {
            // O ajuste nosso: liberar o semáforo também quando houver exceção
            this.mutEx.release ();
            this.ent.release ();
        }
    }

    // Entrega e consome a próxima mensagem da fila.
     @return           //a mensagem consumida
     @throws Exception //se a thread for interrompida

    public Comunicado envie () throws Exception
    {
        try
        {
            this.ent.acquire ();
            this.mutEx.acquire ();

            Comunicado ret = this.proximoComunicado;
            this.proximoComunicado = null;
            return ret;
        }
        catch (Exception erro)
        {
            throw new Exception ("Erro ao consumir a mensagem");
        }
        finally
        {
            this.mutEx.release ();
        }
    }

    //Fecha a conexão e os fluxos de I/O.
   @throws Exception //se ocorrer erro ao fechar a conexão

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
            throw new Exception ("Erro ao desconectar");
        }
    }

    //Fica à escuta de novas mensagens no fluxo de entrada

    public void run ()
    {
        try
        {
            for (;;)
            {
                Comunicado comunicado = (Comunicado) this.receptor.readObject ();

                this.mutEx.acquire ();
                this.proximoComunicado = comunicado;
                this.mutEx.release ();

                this.ent.release ();
            }
        }
        catch (Exception erro)
        {
            // Thread termina caso de quebra de conexão
        }
    }

    public String toString ()
    {
        return "Parceiro da conexao " + this.conexao.getRemoteSocketAddress();
    }

    public boolean equals (Object obj)
    {
        if (this == obj) return true;
        if (obj == null) return false;
        if (this.getClass() != obj.getClass()) return false;

        Parceiro parceiro = (Parceiro) obj;
        return this.conexao.equals(parceiro.conexao);
    }

    public int hashCode ()
    {
        int ret = super.hashCode();
        ret = 13 * ret + this.conexao.hashCode();
        return ret;
    }
}