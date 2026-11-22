//marília santos

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Testes Unitários da Classe Regra")
public class RegraTest
{
    @Nested
    @DisplayName("Cenário Normal (Fluxo Esperado)")
    class CenarioNormal
    {
        @Test
        @DisplayName("CT01 - Deve instanciar Regra e retornar valores válidos padrão")
        void deveInstanciarComValoresValidosPadrao() throws Exception
        {
            Regra regra = new Regra("Glifosato", "Soja", 14);

            assertAll("Verificação dos atributos armazenados",
                    () -> assertEquals("Glifosato", regra.getProduto()),
                    () -> assertEquals("Soja", regra.getCultura()),
                    () -> assertEquals(14, regra.getDiasDeCarencia())
            );
        }

        @Test
        @DisplayName("CT02 - Deve remover espaços em branco das extremidades de produto")
        void deveHigienizarEspacosNasExtremidadesDeProduto() throws Exception
        {
            Regra regra = new Regra("   Fungicida X   ", "Café", 7);

            assertEquals("Fungicida X", regra.getProduto());
        }

        @Test
        @DisplayName("CT03 - Deve remover espaços em branco das extremidades de cultura")
        void deveHigienizarEspacosNasExtremidadesDeCultura() throws Exception
        {
            Regra regra = new Regra("Inseticida Y", "  Algodão  ", 21);

            assertEquals("Algodão", regra.getCultura());
        }

        @Test
        @DisplayName("CT04 - Deve aceitar zero como valor limite inferior válido para diasDeCarencia")
        void deveAceitarZeroDiasDeCarencia() throws Exception
        {
            Regra regra = new Regra("Bioinseticida", "Tomate", 0);

            assertEquals(0, regra.getDiasDeCarencia());
        }

        @Test
        @DisplayName("CT05 - Deve retornar a representação textual formatada corretamente em toString")
        void deveFormatarToStringCorretamente() throws Exception
        {
            Regra regra = new Regra("Herbicida Z", "Milho", 30);
            String esperado = "Produto: Herbicida Z | Cultura: Milho | Carencia: 30 dias";

            assertEquals(esperado, regra.toString());
        }

        @Test
        @DisplayName("CT06 - Deve considerar iguais e gerar mesmo hashCode positivo para instâncias equivalentes")
        void deveValidarIgualdadeEHashCodeEntreInstanciasEquivalentes() throws Exception
        {
            Regra regra1 = new Regra("Acaricida", "Citros", 10);
            Regra regra2 = new Regra(" Acaricida ", " Citros ", 10);

            assertAll("Verificação de equals e hashCode",
                    () -> assertEquals(regra1, regra2),
                    () -> assertEquals(regra2, regra1),
                    () -> assertEquals(regra1.hashCode(), regra2.hashCode()),
                    () -> assertTrue(regra1.hashCode() >= 0)
            );
        }
    }

    @Nested
    @DisplayName("Cenário de Erro (Entradas Inválidas e Exceções)")
    class CenarioDeErro
    {
        @Test
        @DisplayName("CT07 - Deve lançar exceção quando produto for nulo")
        void deveLancarExcecaoQuandoProdutoForNulo()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra(null, "Soja", 14);
            });

            assertEquals("Produto invalido ou vazio", ex.getMessage());
        }

        @Test
        @DisplayName("CT08 - Deve lançar exceção quando produto for vazio")
        void deveLancarExcecaoQuandoProdutoForVazio()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("", "Soja", 14);
            });

            assertEquals("Produto invalido ou vazio", ex.getMessage());
        }

        @Test
        @DisplayName("CT09 - Deve lançar exceção quando produto contiver apenas espaços em branco")
        void deveLancarExcecaoQuandoProdutoContiverApenasEspacos()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("    ", "Soja", 14);
            });

            assertEquals("Produto invalido ou vazio", ex.getMessage());
        }

        @Test
        @DisplayName("CT10 - Deve lançar exceção quando cultura for nula")
        void deveLancarExcecaoQuandoCulturaForNula()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("Glifosato", null, 14);
            });

            assertEquals("Cultura invalida ou vazia", ex.getMessage());
        }

        @Test
        @DisplayName("CT11 - Deve lançar exceção quando cultura for vazia")
        void deveLancarExcecaoQuandoCulturaForVazia()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("Glifosato", "", 14);
            });

            assertEquals("Cultura invalida ou vazia", ex.getMessage());
        }

        @Test
        @DisplayName("CT12 - Deve lançar exceção quando cultura contiver apenas espaços em branco")
        void deveLancarExcecaoQuandoCulturaContiverApenasEspacos()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("Glifosato", "   ", 14);
            });

            assertEquals("Cultura invalida ou vazia", ex.getMessage());
        }

        @Test
        @DisplayName("CT13 - Deve lançar exceção quando diasDeCarencia for -1 (limite inválido)")
        void deveLancarExcecaoQuandoDiasDeCarenciaForMenosUm()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("Glifosato", "Soja", -1);
            });

            assertEquals("Dias de carencia fora da faixa permitida", ex.getMessage());
        }

        @Test
        @DisplayName("CT14 - Deve lançar exceção quando diasDeCarencia for negativo arbitrário")
        void deveLancarExcecaoQuandoDiasDeCarenciaForNegativoArbitrario()
        {
            Exception ex = assertThrows(Exception.class, () -> {
                new Regra("Glifosato", "Soja", -15);
            });

            assertEquals("Dias de carencia fora da faixa permitida", ex.getMessage());
        }
    }
}