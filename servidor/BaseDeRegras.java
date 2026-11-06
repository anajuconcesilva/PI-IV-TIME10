// Beatriz Naomi Ferreira Sasaki - 25016735
import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.text.Normalizer;
import java.util.*;
/**
 * Guarda as regras do servidor, que são lidas de um arquivo CSV.
 * e calcula o período de carência 
 * @author Beatriz Naomi Ferreira Sasaki
 * @since 2026
 */
public class BaseDeRegras
{

    private final Map<String, Regra> regras;
    /**
     * Cria a base e carrega as regras do arquivo CSV.
     * @param arquivoCSV caminho do arquivo CSV
     * @throws Exception se o arquivo não existir, estiver vazio, com cabeçalho ou conteúdo inválido 
     */
    public BaseDeRegras (String arquivoCSV) throws Exception
    {

        if (arquivoCSV == null || arquivoCSV.isEmpty ())
        {
            throw new Exception ("Caminho do arquivo CSV invalido");
        }

        this.regras = new HashMap<String, Regra> ();

        try ( BufferedReader leitor = Files.newBufferedReader
            ( Paths.get (arquivoCSV), StandardCharsets.UTF_8 ))
            {
                String cabecalho = leitor.readLine ();
                if (cabecalho == null || cabecalho.isEmpty ())
                {
                    throw new Exception ("Arquivo CSV vazio");
                }

                if (!"produto;cultura;dias_carencia".equals (cabecalho))
                {
                    throw new Exception ("Arquivo CSV com cabecalho invalido");
                }

                String linha;
                int numeroLinha = 1;

                while ((linha = leitor.readLine ()) != null)
                {

                    numeroLinha++;

                    // ignora linhas vazias
                    if (linha.trim ().isEmpty ())
                    {
                        continue;
                    }

                    String[] campos = linha.split (";", -1);

                    if (campos.length != 3)
                    {
                        throw new Exception ("Linha " + numeroLinha + " do arquivo CSV com numero de campos invalido");
                    }

                    int dias;

                    try
                    {
                        dias = Integer.parseInt (campos[2].trim ());
                    } catch (NumberFormatException erro)
                    {
                        throw new Exception ( "Carencia invalida na linha " + numeroLinha);
                    }

                    if (dias < 0)
                    {
                        throw new Exception ( "Carencia negativa na linha " + numeroLinha);
                    }

                    Regra regra= new Regra (campos[0].trim (), campos[1].trim (), dias);
                    String chave = this.criarChave (regra.getProduto (), regra.getCultura ());
                    
                    Regra existente = this.regras.get (chave);
                    // Se já existir uma regra para o mesmo produto e cultura, mantém a que tiver maior período de carência
                    if (existente== null || regra.getDiasCarencia () > existente.getDiasCarencia ())
                    {
                        this.regras.put (chave, regra);
                    }
                }
            }
            if (this.regras.isEmpty ())
            {
                throw new Exception ("Arquivo CSV sem regras");
            }
    }

    /**
     * Remove acentos e normaliza o texto usado na chave.
     * @param valor texto a normalizar
     * @return texto normalizado
     */

    private String normalizar (String valor)
    {
        // Normalizer separa os caracteres acentuados em dois: o caractere base e a marca de acentuação
        String texto = Normalizer.normalize (valor.trim (), Normalizer.Form.NFD);
        // remove as marcas de acentuação e converte para minúsculas
        return texto.replaceAll ("\\p{M}+", "").toLowerCase ();
    }

    /**
     * Cria a chave que identifica uma combinacao de produto e cultura no mapa.
     * @param produto nome do produto
     * @param cultura nome da cultura
     * @return produto e cultura normalizados, separados por dois-pontos
     */
    private String criarChave (String produto, String cultura)
    {
        return this.normalizar (produto)
            + ":" + this.normalizar (cultura);
    }

    /**
     * Valida a consulta de uma cultura e produto.
     * @param cultura nome da cultura
     * @param produto nome do produto
     * @throws Exception se a cultura ou produto forem nulos ou vazios
     */
    private void validarConsulta (String produto, String cultura) throws Exception
    {
        if (produto== null || produto.trim ().isEmpty ())
        {
            throw new Exception ("Produto ausente");
        }

        if (cultura== null || cultura.trim ().isEmpty ())
        {
            throw new Exception ("Cultura ausente");
        }
    }
  
    /**
     * Consulta a base de regras e monta a resposta enviada ao cliente
     * @param pedido pedido de carência do cliente
     * @return resposta com a regra encontrada ou mensagem de erro
     * @throws Exception se o pedido for nulo ou inválido
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

        this.validarConsulta (produto, cultura);

        if (dataDaAplicacao == null)
        {
            throw new Exception ("Data da aplicacao ausente");
        }

        Regra regra = this.regras.get (this.criarChave (produto, cultura));

        if (regra== null)
        {
            return new RespostaDeCarencia (false, 0, null, "Regra nao encontrada para o produto e cultura informados");
        }

        int dias= regra.getDiasCarencia ();
        LocalDate dataDaColheita = dataDaAplicacao.plusDays (dias);

        return new RespostaDeCarencia (true, dias, dataDaColheita, "");
    }

    /**
     * Retorna o número de regras cadastradas.
     * @return número de regras
     */
    public int getQtdRegras ()
    {
        return this.regras.size ();
    }

    /**
     * Retorna uma representação em string da base de regras.
     * @return representação em string da base de regras
     */
    @Override
    public String toString ()
    {
        StringBuilder texto = new StringBuilder ();
        for (Regra regra : this.regras.values ())
        {
            if (texto.length () > 0)
            {
                texto.append ("\n");
            }
            texto.append (regra);
    }
        return texto.toString ();
    }

    /**
     * Compara a base de regras com outro objeto.
     * @param obj objeto a ser comparado
     * @return true se forem iguais, false caso contrário
     */
    @Override
    public boolean equals (Object obj)
    {
        if (this == obj) 
            return true;

        if (obj == null )
            return false;
        
        if ( this.getClass () != obj.getClass ())
            return false;

        BaseDeRegras outraBase = (BaseDeRegras) obj;

        return this.regras.equals (outraBase.regras);
    }

    /**
     * Retorna o hashCode da base de regras.
     * @return hashCode da base de regras
     */
    @Override
    public int hashCode ()
    {
        int ret = super.hashCode ();

        ret = 13*ret + this.regras.hashCode ();

        return ret;
    }
}