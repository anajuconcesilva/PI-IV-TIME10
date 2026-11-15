//Marília Santos

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Gerencia o carregamento, armazenamento e consulta das regras de carência a partir de um arquivo CSV.
 */
public class BaseDeRegras
{
    private final HashMap<String, Regra> regras;

    /**
     * Carrega as regras de carência de um arquivo CSV codificado em UTF-8.
     * Ignora linhas com carência vazia ou inválida e mantém sempre a maior carência em caso de duplicidade.
     *
     * @param caminhoDoCsv caminho para o arquivo CSV de regras
     * @throws Exception se o caminho for inválido, houver erro de leitura ou nenhuma regra válida for carregada
     */
    public BaseDeRegras (String caminhoDoCsv) throws Exception
    {
        if (caminhoDoCsv == null || caminhoDoCsv.trim ().isEmpty ())
        {
            throw new Exception ("Caminho do arquivo invalido");
        }

        this.regras = new HashMap<> ();

        try (BufferedReader leitor = new BufferedReader (
                new InputStreamReader (new FileInputStream (caminhoDoCsv), StandardCharsets.UTF_8)))
        {
            String linha;
            boolean primeiraLinha = true;

            while ((linha = leitor.readLine ()) != null)
            {
                if (primeiraLinha)
                {
                    primeiraLinha = false;
                    continue;
                }

                if (linha.trim ().isEmpty ())
                {
                    continue;
                }

                String[] partes = this.separarLinhaCsv (linha);

                if (partes.length >= 6)
                {
                    String produto = this.normalizar (partes[1]);
                    String cultura = this.normalizar (partes[4]);
                    String textoDias = partes[5].trim ();

                    if (produto.isEmpty () || cultura.isEmpty () || textoDias.isEmpty ())
                    {
                        continue;
                    }

                    int dias;
                    try
                    {
                        dias = Integer.parseInt (textoDias);
                    }
                    catch (NumberFormatException e)
                    {
                        continue;
                    }

                    if (dias < 0)
                    {
                        continue;
                    }

                    String chave = this.criarChave (produto, cultura);
                    Regra regraExistente = this.regras.get (chave);

                    if (regraExistente == null || dias > regraExistente.getDiasDeCarencia ())
                    {
                        Regra novaRegra = new Regra (produto, cultura, dias);
                        this.regras.put (chave, novaRegra);
                    }
                }
            }
        }
        catch (Exception e)
        {
            throw new Exception ("Falha ao ler o ficheiro CSV: " + e.getMessage ());
        }

        if (this.regras.isEmpty ())
        {
            throw new Exception ("Arquivo de regras invalido: nenhuma regra valida foi encontrada");
        }
    }

    /**
     * Busca a regra de carência correspondente ao produto e cultura informados.
     * Caso não exista regra específica para a cultura, busca pela regra genérica de "TODAS AS CULTURAS".
     *
     * @param produto nome ou código do produto
     * @param cultura nome da cultura
     * @return a instância de {@link Regra} encontrada, ou {@code null} se não houver correspondência
     */
    public Regra buscarRegra (String produto, String cultura)
    {
        if (produto == null || cultura == null)
        {
            return null;
        }

        Regra regra = this.regras.get (this.criarChave (produto, cultura));

        if (regra == null)
        {
            regra = this.regras.get (this.criarChave (produto, "TODAS AS CULTURAS"));
        }

        return regra;
    }

    /**
     * Retorna a quantidade total de regras únicas carregadas na base.
     *
     * @return total de regras registradas
     */
    public int getQtdRegras ()
    {
        return this.regras.size ();
    }

    private String normalizar (String texto)
    {
        if (texto == null)
        {
            return "";
        }

        String limpo = texto.trim ().replaceAll ("\\s+", " ");
        String semAcentos = Normalizer.normalize (limpo, Normalizer.Form.NFD)
                .replaceAll ("\\p{M}", "");

        return semAcentos.toUpperCase ();
    }

    private String criarChave (String produto, String cultura)
    {
        return this.normalizar (produto) + "|" + this.normalizar (cultura);
    }

    private String[] separarLinhaCsv (String linha)
    {
        List<String> campos = new ArrayList<> ();
        StringBuilder campoAtual = new StringBuilder ();
        boolean entreAspas = false;

        for (int i = 0; i < linha.length (); i++)
        {
            char c = linha.charAt (i);

            if (c == '"')
            {
                if (entreAspas && i + 1 < linha.length () && linha.charAt (i + 1) == '"')
                {
                    campoAtual.append ('"');
                    i++;
                }
                else
                {
                    entreAspas = !entreAspas;
                }
            }
            else if (c == ';' && !entreAspas)
            {
                campos.add (campoAtual.toString ());
                campoAtual.setLength (0);
            }
            else
            {
                campoAtual.append (c);
            }
        }

        campos.add (campoAtual.toString ());
        return campos.toArray (new String[0]);
    }

    @Override
    public String toString ()
    {
        return "Base contendo " + this.getQtdRegras () + " regras de carencia registradas.";
    }

    @Override
    public boolean equals (Object obj)
    {
        if (this == obj)
        {
            return true;
        }

        if (obj == null)
        {
            return false;
        }

        if (this.getClass () != obj.getClass ())
        {
            return false;
        }

        BaseDeRegras base = (BaseDeRegras) obj;
        return this.regras.equals (base.regras);
    }

    @Override
    public int hashCode ()
    {
        int ret = 1;
        ret = 13 * ret + this.regras.hashCode ();

        if (ret < 0)
        {
            ret = -ret;
        }

        return ret;
    }

    /**
     * Consulta a regra e calcula a data de liberacao da colheita.
     *
     * @param pedido produto, cultura e data da aplicacao
     * @return resposta com autorizacao, prazo e data de liberacao
     * @throws Exception se o pedido ou seus dados forem invalidos
     * @author Beatriz Naomi Ferreira Sasaki
     * @since 2026
     */
    public RespostaDeCarencia consulte (PedidoDeCarencia pedido) throws Exception
    {
        if (pedido == null)
        {
            throw new Exception ("Pedido de carencia ausente");
        }

        String produto = pedido.getProduto ();
        String cultura = pedido.getCultura ();
        LocalDate dataDaAplicacao = pedido.getDataDaAplicacao ();

        if (produto == null || produto.trim ().isEmpty ())
        {
            throw new Exception ("Produto ausente");
        }

        if (cultura == null || cultura.trim ().isEmpty ())
        {
            throw new Exception ("Cultura ausente");
        }

        if (dataDaAplicacao == null)
        {
            throw new Exception ("Data da aplicacao ausente");
        }

        Regra regra = this.buscarRegra (produto, cultura);

        if (regra == null)
        {
            return new RespostaDeCarencia (
                    false,
                    0,
                    null,
                    "Regra nao encontrada para o produto e cultura informados");
        }

        int dias = regra.getDiasDeCarencia ();
        LocalDate dataLiberacao = dataDaAplicacao.plusDays (dias);

        return new RespostaDeCarencia (
                true,
                dias,
                dataLiberacao,
                "");
    }
}