// Aluna: Eduarda Prado Deiró | RA: 25004440

import java.io.*;
import java.net.*;
import java.util.*;

/**
 * Atende um cliente conectado ao servidor.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class SupervisoraDeConexao extends Thread
{
    private Parceiro            usuario;
    private Socket              conexao;
    private ArrayList<Parceiro> usuarios;
    private BaseDeRegras        base;

    /**
     * Guarda o que precisa para atender o cliente.
     *
     * @param conexao     socket do cliente
     * @param usuarios    lista dos clientes conectados
     * @param base        base de regras usada nas respostas
     * @throws Exception  se faltar algum parâmetro
     */
    public SupervisoraDeConexao (Socket              conexao,
                                 ArrayList<Parceiro> usuarios,
                                 BaseDeRegras        base)
                                 throws Exception
    {
        if (conexao == null)
            throw new Exception ("Conexao ausente");

        if (usuarios == null)
            throw new Exception ("Usuarios ausentes");

        if (base == null)
            throw new Exception ("Base de regras ausente");

        this.conexao  = conexao;
        this.usuarios = usuarios;
        this.base     = base;
    }

    /**
     * Recebe os pedidos do cliente e responde até ele sair.
     */
    public void run ()
    {
        ObjectOutputStream transmissor;
        try
        {
            transmissor = new ObjectOutputStream (this.conexao.getOutputStream ());
        }
        catch (Exception erro)
        {
            return;
        }

        ObjectInputStream receptor = null;
        try
        {
            receptor = new ObjectInputStream (this.conexao.getInputStream ());
        }
        catch (Exception erro)
        {
            try
            {
                transmissor.close ();
            }
            catch (Exception falha)
            {} // so tentando fechar antes de acabar a thread

            return;
        }

        try
        {
            this.usuario = new Parceiro (this.conexao, receptor, transmissor);
        }
        catch (Exception erro)
        {} // sei que passei os parametros corretos

        try
        {
            synchronized (this.usuarios)
            {
                this.usuarios.add (this.usuario);
            }

            for (;;)
            {
                Comunicado comunicado = this.usuario.envie ();

                if (comunicado == null)
                    return;
                else if (comunicado instanceof PedidoDeCarencia)
                {
                    PedidoDeCarencia pedidoDeCarencia = (PedidoDeCarencia)comunicado;

                    Comunicado resposta;
                    try
                    {
                        resposta = this.base.consulte (pedidoDeCarencia);
                    }
                    catch (Exception erro)
                    {
                        resposta = new RespostaDeErro (erro.getMessage ());
                    }

                    this.usuario.receba (resposta);
                }
                else if (comunicado instanceof PedidoParaSair)
                {
                    synchronized (this.usuarios)
                    {
                        this.usuarios.remove (this.usuario);
                    }
                    this.usuario.adeus ();
                    return;
                }
            }
        }
        catch (Exception erro)
        {
            try
            {
                transmissor.close ();
                receptor   .close ();
            }
            catch (Exception falha)
            {} // so tentando fechar antes de acabar a thread
        }
    }

    /**
     * Mostra o endereço do cliente atendido.
     *
     * @return texto com o endereço do cliente
     */
    public String toString ()
    {
        return "Supervisora de " + this.conexao.getRemoteSocketAddress ();
    }

    /**
     * Compara duas supervisoras pela conexão.
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

        SupervisoraDeConexao supervisora = (SupervisoraDeConexao)obj;

        return this.conexao.equals (supervisora.conexao);
    }

    /**
     * Gera o hashCode a partir da conexão.
     *
     * @return o hashCode
     */
    public int hashCode ()
    {
        int ret = super.hashCode ();

        ret = 13*ret + this.conexao.hashCode ();

        return ret;
    }
}
