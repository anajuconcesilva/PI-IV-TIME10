// Aluna: Eduarda Prado Deiró | RA: 25004440

import java.net.*;
import java.io.*;
import java.time.*;

/**
 * Programa de console para testar o servidor de regras de carência.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class Cliente
{
    public static final String HOST_PADRAO  = "localhost";
    public static final String PORTA_PADRAO = "3001";

    /**
     * Conecta ao servidor e mostra o menu de consulta de carência.
     *
     * @param args host e porta do servidor, os dois opcionais
     */
    public static void main (String[] args)
    {
        if (args.length > 2)
        {
            System.err.println ("Uso esperado: java Cliente [HOST [PORTA]]\n");
            return;
        }

        Socket conexao = null;
        try
        {
            String host  = Cliente.HOST_PADRAO;
            int    porta = Integer.parseInt (Cliente.PORTA_PADRAO);

            if (args.length > 0)
                host = args[0];

            if (args.length == 2)
                porta = Integer.parseInt (args[1]);

            conexao = new Socket (host, porta);
        }
        catch (Exception erro)
        {
            System.err.println ("Indique o servidor e a porta corretos!\n");
            return;
        }

        ObjectOutputStream transmissor = null;
        try
        {
            transmissor = new ObjectOutputStream (conexao.getOutputStream ());
        }
        catch (Exception erro)
        {
            System.err.println ("Indique o servidor e a porta corretos!\n");
            return;
        }

        ObjectInputStream receptor = null;
        try
        {
            receptor = new ObjectInputStream (conexao.getInputStream ());
        }
        catch (Exception erro)
        {
            System.err.println ("Indique o servidor e a porta corretos!\n");
            return;
        }

        Parceiro servidor = null;
        try
        {
            servidor = new Parceiro (conexao, receptor, transmissor);
        }
        catch (Exception erro)
        {} // sei que passei os parametros corretos

        TratadoraDeComunicadoDeDesligamento tratadoraDeComunicadoDeDesligamento = null;
        try
        {
            tratadoraDeComunicadoDeDesligamento =
            new TratadoraDeComunicadoDeDesligamento (servidor);
        }
        catch (Exception erro)
        {} // sei que o servidor nao eh nulo

        tratadoraDeComunicadoDeDesligamento.start ();

        char opcao = ' ';
        do
        {
            System.out.print ("Qual a opcao desejada?\n"   +
                              "[C]onsultar a carencia\n"   +
                              "[T]erminar\n"               +
                              "> ");

            try
            {
                String linha = Teclado.getUmString ();

                if (linha == null)
                    opcao = 'T';
                else if (linha.trim ().length () > 0)
                    opcao = Character.toUpperCase (linha.trim ().charAt (0));
                else
                    opcao = ' ';

                if (opcao != 'C' && opcao != 'T')
                {
                    System.err.println ("Opcao invalida!\n");
                    continue;
                }

                if (opcao == 'C')
                {
                    System.out.print ("Produto: ");
                    String produto = Teclado.getUmString ();

                    System.out.print ("Cultura: ");
                    String cultura = Teclado.getUmString ();

                    System.out.print ("Data da aplicacao (aaaa-mm-dd): ");
                    LocalDate dataDaAplicacao = null;
                    try
                    {
                        dataDaAplicacao = LocalDate.parse (Teclado.getUmString ().trim ());
                    }
                    catch (Exception erro)
                    {
                        throw new Exception ("Data invalida, use aaaa-mm-dd");
                    }

                    servidor.receba (new PedidoDeCarencia (produto, cultura, dataDaAplicacao));

                    Comunicado comunicado = null;
                    do
                    {
                        comunicado = servidor.espie ();
                    }
                    while (!(comunicado instanceof RespostaDeCarencia) &&
                           !(comunicado instanceof RespostaDeErro));

                    comunicado = servidor.envie ();

                    if (comunicado instanceof RespostaDeCarencia)
                    {
                        RespostaDeCarencia resposta = (RespostaDeCarencia)comunicado;

                        if (resposta.isAutorizado ())
                        {
                            System.out.println ("Produto autorizado para a cultura!");
                            System.out.println ("Carencia: " + resposta.getDiasDeCarencia () + " dias");
                            System.out.println ("Colheita liberada em: " + resposta.getDataDeLiberacao () + "\n");
                        }
                        else
                            System.out.println ("Nao autorizado: " + resposta.getMensagem () + "\n");
                    }
                    else
                    {
                        RespostaDeErro respostaDeErro = (RespostaDeErro)comunicado;
                        System.err.println ("Erro do servidor: " + respostaDeErro.getMensagem () + "\n");
                    }
                }
            }
            catch (Exception erro)
            {
                System.err.println ("Erro: " + erro.getMessage () + "\n");
                continue;
            }
        }
        while (opcao != 'T');

        try
        {
            servidor.receba (new PedidoParaSair ());
        }
        catch (Exception erro)
        {} // se a conexao ja caiu, nao ha o que avisar

        System.out.println ("Obrigado por usar este programa!");
        System.exit (0);
    }
}
