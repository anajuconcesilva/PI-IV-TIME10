//Marília Santos

import java.io.BufferedReader;
import java.io.FileReader;
import java.time.LocalDate;
import java.util.HashMap;

public class BaseDeRegras {

    //  HashMap para funcionar com o código da Bia
    private HashMap<String, Regra> regras;

    public BaseDeRegras(String caminhoDoCsv) throws Exception {
        if (caminhoDoCsv == null || caminhoDoCsv.trim().isEmpty()) {
            throw new Exception("Caminho do arquivo invalido");
        }

        this.regras = new HashMap<>();

        try (BufferedReader leitor = new BufferedReader(new FileReader(caminhoDoCsv))) {
            String linha;
            boolean primeiraLinha = true;

            while ((linha = leitor.readLine()) != null) {
                // Pula o cabeçalho do seu CSV real
                if (primeiraLinha) {
                    primeiraLinha = false;
                    continue;
                }

                String[] partes = linha.split(";");

                if (partes.length >= 6) {
                    String produto = normalize(partes[1]);
                    String cultura = normalize(partes[4]);
                    int dias = Integer.parseInt(partes[5].trim());

                    Regra novaRegra = new Regra(produto, cultura, dias);

                    this.regras.put(this.criarChave(produto, cultura), novaRegra);
                }
            }
        } catch (Exception e) {
            throw new Exception("Falha ao ler o ficheiro CSV: " + e.getMessage());
        }
    }

    private String normalize(String texto) {
        if (texto == null) return "";
        return texto.trim().toUpperCase();
    }

    // Método auxiliar para criar a chave de pesquisa
    private String criarChave(String produto, String cultura) {
        return normalize(produto) + "_" + normalize(cultura);
    }

    public int getQtdRegras() {
        return this.regras.size();
    }

    // Métodos obrigatórios do professor
    @Override
    public String toString() {
        return "Base contendo " + this.getQtdRegras() + " regras de carencia registradas.";
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (this.getClass() != obj.getClass()) return false;

        BaseDeRegras base = (BaseDeRegras) obj;
        return this.regras.equals(base.regras);
    }

    @Override
    public int hashCode() {
        int ret = 1;
        ret = 13 * ret + this.regras.hashCode();
        if (ret < 0) ret = -ret;
        return ret;
    }

    //método da bia
    /**
     * Consulta a regra e calcula a data de liberacao da colheita.
     *
     * @param pedido produto, cultura e data da aplicacao
     * @return resposta com autorizacao, prazo e data de liberacao
     * @throws Exception se o pedido ou seus dados forem invalidos
     * @author Beatriz Naomi Ferreira Sasaki
     * @since 2026
     */
    public RespostaDeCarencia consulte (PedidoDeCarencia pedido) throws Exception {
        if (pedido == null) {
            throw new Exception ("Pedido de carencia ausente");
        }

        String produto = pedido.getProduto ();
        String cultura = pedido.getCultura ();
        LocalDate dataDaAplicacao = pedido.getDataDaAplicacao ();

        if (produto == null || produto.trim ().isEmpty ()) {
            throw new Exception ("Produto ausente");
        }

        if (cultura == null || cultura.trim ().isEmpty ()) {
            throw new Exception ("Cultura ausente");
        }

        if (dataDaAplicacao == null) {
            throw new Exception ("Data da aplicacao ausente");
        }

        Regra regra = this.regras.get(this.criarChave(produto, cultura));

        if (regra == null) {
            return new RespostaDeCarencia (
                    false,
                    0,
                    null,
                    "Regra nao encontrada para o produto e cultura informados");
        }

        int dias = regra.getDiasDeCarencia();
        LocalDate dataLiberacao = dataDaAplicacao.plusDays(dias);

        return new RespostaDeCarencia (
                true,
                dias,
                dataLiberacao,
                "");
    }
}