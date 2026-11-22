// Aluna: Eduarda Prado Deiró | RA: 25004440

import java.net.*;
import java.util.*;

/**
 * Aceita os clientes que se conectam ao servidor.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class AceitadoraDeConexao extends Thread
{
    private ServerSocket        pedido;
    private ArrayList<Parceiro> usuarios;
    private BaseDeRegras        base;

    /**
     * Abre a porta onde o servidor espera os clientes.
     *
     * @param porta       número da porta
     * @param usuarios    lista dos clientes conectados
     * @param base        base de regras usada nas respostas
     * @throws Exception  se faltar algum parâmetro ou a porta não abrir
     */
    public AceitadoraDeConexao (String              porta,
                                ArrayList<Parceiro> usuarios,
                                BaseDeRegras        base)
                                throws Exception
    {
        if (porta == null)
            throw new Exception ("Porta ausente");

        if (usuarios == null)
            throw new Exception ("Usuarios ausentes");

        if (base == null)
            throw new Exception ("Base de regras ausente");

        try
        {
            this.pedido = new ServerSocket (Integer.parseInt (porta));
        }
        catch (Exception erro)
        {
            throw new Exception ("Porta invalida");
        }

        this.usuarios = usuarios;
        this.base     = base;
    }

    /**
     * Fica esperando clientes e cria uma supervisora para cada um.
     */
    public void run ()
    {
        for (;;)
        {
            Socket conexao = null;
            try
            {
                conexao = this.pedido.accept ();
            }
            catch (Exception erro)
            {
                continue;
            }

            SupervisoraDeConexao supervisoraDeConexao = null;
            try
            {
                supervisoraDeConexao =
                new SupervisoraDeConexao (conexao, this.usuarios, this.base);
            }
            catch (Exception erro)
            {} // sei que passei parametros corretos para o construtor
            supervisoraDeConexao.start ();
        }
    }

    /**
     * Mostra a porta da aceitadora.
     *
     * @return texto com a porta
     */
    public String toString ()
    {
        return "Aceitadora na porta " + this.pedido.getLocalPort ();
    }

    /**
     * Compara duas aceitadoras pela porta.
     *
     * @param obj objeto comparado
     * @return    true se a porta for a mesma
     */
    public boolean equals (Object obj)
    {
        if (this == obj)
            return true;

        if (obj == null)
            return false;

        if (this.getClass () != obj.getClass ())
            return false;

        AceitadoraDeConexao aceitadora = (AceitadoraDeConexao)obj;

        return this.pedido.getLocalPort () == aceitadora.pedido.getLocalPort ();
    }

    /**
     * Gera o hashCode a partir da porta.
     *
     * @return o hashCode
     */
    public int hashCode ()
    {
        int ret = super.hashCode ();

        ret = 13*ret + Integer.valueOf (this.pedido.getLocalPort ()).hashCode ();

        return ret;
    }
}
