// Aluna: Eduarda Prado Deiró | RA: 25004440

import java.util.*;

/**
 * Inicia o servidor de regras de carência.
 *
 * @author Eduarda Prado Deiró
 * @since 2026
 */
public class Servidor
{
    public static final String PORTA_PADRAO   = "3001";

    // "\u00C1" = letra "Á". Assim o caminho não depende da codificação do arquivo .java
    public static final String ARQUIVO_PADRAO = "C:\\servidor\\PI-IV-TIME10\\produtos_minhacolheita.csv";

    /**
     * Carrega as regras, abre a porta e espera o comando para desligar.
     *
     * @param args porta e caminho do CSV, os dois opcionais
     */
    public static void main (String[] args)
    {
        if (args.length > 2)
        {
            System.err.println ("Uso esperado: java Servidor [PORTA [CAMINHO_DO_CSV]]\n");
            return;
        }

        String porta   = Servidor.PORTA_PADRAO;
        String arquivo = Servidor.ARQUIVO_PADRAO;

        if (args.length >= 1)
            porta = args[0];

        if (args.length == 2)
            arquivo = args[1];

        BaseDeRegras base = null;
        try
        {
            base = new BaseDeRegras (arquivo);
        }
        catch (Exception erro)
        {
            System.err.println ("Arquivo de regras invalido!\n");
            erro.printStackTrace();
            return;
        }

        ArrayList<Parceiro> usuarios = new ArrayList<Parceiro> ();

        try
        {
            AceitadoraDeConexao aceitadoraDeConexao =
                    new AceitadoraDeConexao (porta, usuarios, base);

            aceitadoraDeConexao.start ();
        }
        catch (Exception erro)
        {
            System.err.println ("Escolha uma porta apropriada e liberada para uso!\n");
            return;
        }

        for (;;)
        {
            System.out.println ("O servidor esta ativo! Para desativa-lo,");
            System.out.println ("use o comando \"desativar\"\n");
            System.out.print   ("> ");

            String comando = null;
            try
            {
                comando = Teclado.getUmString ();
            }
            catch (Exception erro)
            {}

            if (comando.toLowerCase ().equals ("desativar"))
            {
                synchronized (usuarios)
                {
                    ComunicadoDeDesligamento comunicadoDeDesligamento =
                            new ComunicadoDeDesligamento ();

                    for (Parceiro usuario : usuarios)
                    {
                        try
                        {
                            usuario.receba (comunicadoDeDesligamento);
                            usuario.adeus  ();
                        }
                        catch (Exception erro)
                        {}
                    }
                }

                System.out.println ("O servidor foi desativado!\n");
                System.exit (0);
            }
            else
                System.err.println ("Comando invalido!\n");
        }
    }
}