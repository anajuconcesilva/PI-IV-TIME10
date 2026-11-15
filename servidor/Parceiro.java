//Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import java.io.*;
import java.net.*;
import java.util.concurrent.Semaphore;

/**
 * Representa um parceiro de comunicação via socket.
 *
 * @author Ana Júlia Conceição da Silva
 * @since 2026
 */
public class Parceiro extends Thread
{
    private Socket             conexao;
    private ObjectInputStream  receptor;
    private ObjectOutputStream transmissor;

    private Comunicado         proximoComunicado = null;
    private boolean            desconectado      = false;
    private Semaphore          mutEx            = new Semaphore (1, true);
    private Semaphore          ent              = new Semaphore (0, true);
    private Semaphore          mutExTransmissao = new Semaphore (1, true);

    /**
     * Constrói o parceiro de comunicação.
     * 
     * @param conexao     socket da conexão
     * @param receptor    fluxo de entrada
     * @param transmissor fluxo de saída
     * @throws Exception  se algum parâmetro for nulo
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

        this.start ();
    }

    /**
     * Envia uma mensagem pelo fluxo de saída.
     * 
     * @param x           a mensagem a ser enviada
     * @throws Exception  se a mensagem for nula ou houver erro de I/O
     */
    public void receba (Comunicado x) throws Exception
    {
        if (x == null)
            throw new Exception ("Comunicado nulo");

        boolean adquiriuTransmissao = false;

        try
        {
            this.mutExTransmissao.acquire ();
            adquiriuTransmissao = true;

            this.transmissor.writeObject (x);
            this.transmissor.flush ();
        }
        catch (InterruptedException erro)
        {
            Thread.currentThread ().interrupt ();
            throw new Exception ("Envio interrompido");
        }
        catch (IOException erro)
        {
            throw new Exception ("Erro de transmissao");
        }
        finally
        {
            if (adquiriuTransmissao)
                this.mutExTransmissao.release ();
        }
    }

    /**
     * Olha a próxima mensagem na fila sem a consumir.
     * 
     * @return            o próximo comunicado ou null se a conexão caiu
     * @throws Exception  se a thread for interrompida
     */
    public Comunicado espie () throws Exception
    {
        boolean adquiriuEnt   = false;
        boolean adquiriuMutEx = false;

        try
        {
            this.ent.acquire ();
            adquiriuEnt = true;

            this.mutEx.acquire ();
            adquiriuMutEx = true;

            if (this.proximoComunicado == null && this.desconectado)
                return null;

            return this.proximoComunicado;
        }
        catch (InterruptedException erro)
        {
            Thread.currentThread ().interrupt ();
            throw new Exception ("Erro ao espiar");
        }
        finally
        {
            if (adquiriuMutEx)
                this.mutEx.release ();

            if (adquiriuEnt)
                this.ent.release ();
        }
    }

    /**
     * Entrega e consome a próxima mensagem da fila.
     * 
     * @return            a mensagem consumida ou null se a conexão caiu
     * @throws Exception  se a thread for interrompida
     */
    public Comunicado envie () throws Exception
    {
        boolean adquiriuEnt   = false;
        boolean adquiriuMutEx = false;

        try
        {
            this.ent.acquire ();
            adquiriuEnt = true;

            this.mutEx.acquire ();
            adquiriuMutEx = true;

            if (this.proximoComunicado == null && this.desconectado)
                return null;

            Comunicado ret = this.proximoComunicado;
            this.proximoComunicado = null;
            adquiriuEnt = false;
            return ret;
        }
        catch (InterruptedException erro)
        {
            Thread.currentThread ().interrupt ();
            throw new Exception ("Erro ao consumir a mensagem");
        }
        finally
        {
            if (adquiriuMutEx)
                this.mutEx.release ();

            if (adquiriuEnt)
                this.ent.release ();
        }
    }

    /**
     * Fecha a conexão e os fluxos de I/O.
     * 
     * @throws Exception  se ocorrer erro ao fechar a conexão
     */
    public void adeus () throws Exception
    {
        this.mutEx.acquireUninterruptibly ();
        try
        {
            this.desconectado = true;
            this.ent.release ();
        }
        finally
        {
            this.mutEx.release ();
        }

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

    /**
     * Fica à escuta de novas mensagens no fluxo de entrada e acorda
     * as threads em espera caso a conexão caia.
     */
    public void run ()
    {
        try
        {
            for (;;)
            {
                Comunicado comunicado = (Comunicado) this.receptor.readObject ();

                if (comunicado == null)
                    throw new IOException ("Fim do fluxo");

                this.mutEx.acquire ();
                this.proximoComunicado = comunicado;
                this.mutEx.release ();

                this.ent.release ();
            }
        }
        catch (Exception erro)
        {
            this.mutEx.acquireUninterruptibly ();
            this.desconectado = true;
            this.mutEx.release ();

            this.ent.release ();
        }
    }

    /**
     * Retorna a representação textual da conexão do parceiro.
     * 
     * @return texto identificando o endereço remoto do parceiro
     */
    public String toString ()
    {
        return "Parceiro da conexao " + this.conexao.getRemoteSocketAddress ();
    }

    /**
     * Compara este parceiro com outro objeto pela conexão.
     * 
     * @param obj objeto a ser comparado
     * @return    true se ambos possuírem a mesma conexão
     */
    public boolean equals (Object obj)
    {
        if (this == obj) return true;
        if (obj == null) return false;
        if (this.getClass () != obj.getClass ()) return false;

        Parceiro parceiro = (Parceiro) obj;
        return this.conexao.equals (parceiro.conexao);
    }

    /**
     * Calcula o código de hash do parceiro.
     * 
     * @return código de hash
     */
    public int hashCode ()
    {
        int ret = super.hashCode ();
        ret = 13 * ret + this.conexao.hashCode ();
        return ret;
    }
}