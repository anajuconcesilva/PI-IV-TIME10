import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

/**
 * Intermedia a comunicacao entre a API Node e o servidor Java de carencia
 * 
 * @author Beatriz Naomi Ferreira Sasaki
 * @since 2026
 */
public class Ponte
{
    private static final String HOST_PADRAO = "localhost";
    private static final int PORTA_PADRAO = 3001;
    /**
     * Conecta ao servidor, recebe consultas pela entrada padrao e
     * escreve as respostas em JSON na saida padrao.
     * @param args host e porta opcionais do servidor
     **/
    public static void main (String [] args)
    {
        // cria o conversor usado para escrever json
        Gson gson = new Gson ();

        if (args.length>2)
        {
            System.err.println ("Uso: java Ponte[HOST[PORTA]]");
            return;
        }

        String host = Ponte.HOST_PADRAO;
        int porta = Ponte.PORTA_PADRAO;

        try
        {
            if (args.length >=1)
            {
                host= args[0];
                
                if (host.trim ().isEmpty ())
                {
                    throw new Exception ("Host ausente");
                }
            }

            if (args.length==2)
            {
                porta=Integer.parseInt (args[1]);
            }

            if (porta<1 || porta > 65535)
            {
                throw new Exception ("Porta invalida");
            }

            try (
                Socket conexao = new Socket (host,porta);
                BufferedReader entrada = new BufferedReader
                (
                    new InputStreamReader
                    (
                        System.in,
                        StandardCharsets.UTF_8
                    )
                )
            )
            {

                ObjectOutputStream transmissor = null;

                try
                {
                    transmissor = new ObjectOutputStream (conexao.getOutputStream ());
                    transmissor.flush ();
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
                }catch (Exception erro)
                {
                    System.err.println ("Indique o servidor e a porta corretos!\n");
                    return;
                }

                Parceiro servidor = null;

                try
                {
                    servidor =new Parceiro (conexao, receptor, transmissor);

                }catch (Exception erro)
                {
                    System.err.println ("Indique o servidor e a porta corretos!");
                    return;
                }

                boolean servidorDesligando = false;

                try
                {
                    String linha;

                    while ((linha=entrada.readLine ()) != null)
                    {
                        PedidoDeCarencia pedido;

                        try
                        {
                            String[] campos = linha.split (";", -1);

                            if (campos.length!=3)
                            {
                                throw new Exception ("Quantidade de campos invalida");
                            }

                            String produto = campos[0].trim ();
                            String cultura= campos[1].trim ();
                            String textoData = campos[2].trim ();

                            if ( !textoData.matches ("\\d{4}-\\d{2}-\\d{2}") )
                            {
                                throw new Exception ("Formato de data invalido");
                            }

                            LocalDate dataAplicacao = LocalDate.parse (textoData);
                            
                            pedido = new PedidoDeCarencia (produto, cultura, dataAplicacao);

                        }
                        catch (Exception erro)
                        {
                            Ponte.enviarErro (gson, "Pedido invalido: use produto; cultura; aaaa-mm-dd");
                            continue;
                        }

                        try
                        {
                            servidor.receba (pedido);
                            
                            Comunicado comunicado = servidor.envie ();

                            if (comunicado instanceof RespostaDeCarencia)
                            {   
                                RespostaDeCarencia resposta = (RespostaDeCarencia) comunicado;

                                JsonObject json = new JsonObject ();

                                json.addProperty
                                (
                                    "autorizado",
                                    resposta.isAutorizado ()
                                );
                                json.addProperty
                                (
                                    "dias",
                                    resposta.getDiasDeCarencia ()
                                );

                                json.addProperty 
                                (
                                    "dataLiberacao",
                                    resposta.getDataDeLiberacao () == null
                                    ? null
                                    : resposta.getDataDeLiberacao ().toString ()
                                );

                                json.addProperty ("mensagem", resposta.getMensagem ());

                                System.out.println (gson.toJson (json));
                                System.out.flush ();

                            }
                            else if (comunicado instanceof RespostaDeErro)
                            {

                                RespostaDeErro resposta = (RespostaDeErro) comunicado;
                                Ponte.enviarErro 
                                (
                                    gson,
                                    resposta.getMensagem ()
                                );

                            }
                            else if (comunicado instanceof ComunicadoDeDesligamento)
                            {
                                servidorDesligando = true;
                                Ponte.enviarErro 
                                (
                                    gson, "Servidor em desligamento"
                                );
                                break;

                            }
                            else
                            {
                                throw new IOException ("Resposta desconhecida do servidor");
                            }
                        }
                        catch (InterruptedException erro)
                        {
                            Thread.currentThread ().interrupt ();

                            Ponte.enviarErro (
                                gson, "Espera pela resposta interrompida"
                            );

                            break;
                        }
                        catch (Exception erro)
                        {
                            Ponte.enviarErro (
                                gson,
                                "Falha de comunicacao com o servidor"
                            );
                            System.err.println (erro.getMessage ());
                            break;
                        }
                    }
                }
                finally
                {
                    // Tenta avisar que a ponte vai encerrar a conversa
                    try
                    {
                        if (!servidorDesligando)
                        {
                            servidor.receba (new PedidoParaSair ());
                        }
                    }
                    catch (Exception erro)
                    {
                        System.err.println ("Nao foi possivel enviar pedido de saida");
                    }
                    finally
                    {
                        servidor.adeus ();
                    }
                }
            }
        }
        catch (Exception erro)
        {
            System.err.println ("Falha ao iniciar ou manter a ponte: " + erro.getMessage ());
        }

    }

/**
 * Escreve uma resposta de erro em JSON na saida padrao.
 *
 * @param gson conversor usado para gerar o JSON
 * @param mensagem descricao do erro enviada ao Node
 */
    private static void enviarErro (Gson gson, String mensagem)
    {
        JsonObject json = new JsonObject ();
        json.addProperty ("erro", mensagem);
        
        System.out.println (gson.toJson (json));
        System.out.flush ();
    }
}