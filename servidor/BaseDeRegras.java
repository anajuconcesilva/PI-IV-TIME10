//marília santos

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;

public class BaseDeRegras {
    private ArrayList<Regra> regras;

    // Construtor que lê o CSV e cria as regras
    public BaseDeRegras(String caminhoDoCsv) throws Exception {
        if (caminhoDoCsv == null || caminhoDoCsv.trim().isEmpty()) {
            throw new Exception("Caminho do arquivo invalido"); // Sem acento
        }

        this.regras = new ArrayList<Regra>();

        try (BufferedReader leitor = new BufferedReader(new FileReader(caminhoDoCsv))) {
            String linha;
            boolean primeiraLinha = true; // Chave de segurança para o cabeçalho

            while ((linha = leitor.readLine()) != null) {
                // Se for a primeira linha, pula e vai para a próxima
                if (primeiraLinha) {
                    primeiraLinha = false;
                    continue;
                }

                String[] partes = linha.split(";");

                if (partes.length >= 6) {
                    String produto = normalize(partes[1]); // Posição 1: marca
                    String cultura = normalize(partes[4]); // Posição 4: cultura
                    int dias = Integer.parseInt(partes[5].trim()); // Posição 5: carencia

                    Regra novaRegra = new Regra(produto, cultura, dias);
                    this.regras.add(novaRegra);
                }
            }
        } catch (Exception e) {
            throw new Exception("Falha ao ler o ficheiro CSV: " + e.getMessage());
        }
    }

    // Método privado exigido
    private String normalize(String texto) {
        if (texto == null) return "";
        return texto.trim().toUpperCase();
    }

    public int getQtdRegras() {
        return this.regras.size();
    }

    // Métodos obrigatórios
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

   //metodo extra
    public Comunicado consulte(PedidoDeCarencia pedido) throws Exception {
        String produtoBuscado = normalize(pedido.getProduto());

        for (Regra regra : this.regras) {
            if (regra.getProduto().equals(produtoBuscado)) {
                return new RespostaDeCarencia(regra.getProduto(), regra.getDiasDeCarencia());
            }
        }
        throw new Exception("Produto nao registrado na base do Agrofit");
    }
}