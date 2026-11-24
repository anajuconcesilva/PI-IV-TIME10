// Beatriz Naomi Ferreira Sasaki - 25016735
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import static org.junit.jupiter.api.Assertions.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;

@DisplayName ("Testes Unitários da Classe BaseDeRegras")
public class BaseDeRegrasTest
{
    private static final String CABECALHO =
        "num_registro;marca;principio_ativo;classe;cultura;carencia";

    @TempDir
    Path pastaTemporaria;

    private int contadorDeArquivos=0;

    // Cria um CSV temporario com o cabecalho e as linhas informadas 
    private Path criarCsv (String... linhas) throws Exception
    {
        StringBuilder conteudo = new StringBuilder (CABECALHO).append ('\n');

        for (String linha: linhas)
        {
            conteudo.append (linha).append ('\n');
        }
        
        this.contadorDeArquivos++;
        Path arquivo = pastaTemporaria.resolve("regras-" + this.contadorDeArquivos + ".csv");
        Files.writeString (arquivo, conteudo.toString (), StandardCharsets.UTF_8);
        return arquivo;

    }

    private BaseDeRegras criarBase (String... linhas) throws Exception
    {
        return new BaseDeRegras (this.criarCsv (linhas).toString ());
    }

    private BaseDeRegras criarBasePadrao () throws Exception
    {
        return this.criarBase(
            "1;Produto Teste;Ativo;Classe;Batata;10",
            "2;Produto Teste;Ativo;Classe;Algodão;20",
            "3;Produto Geral;Ativo;Classe;Todas as culturas;7",
            "4;Produto Geral;Ativo;Classe;Soja;3",
            "5;Produto Zero;Ativo;Classe;Tomate;0"
        );
    }

    // Categoria 1 : Inicialização
    @Nested
    @DisplayName ("Categoria 1 - Construcao e carregamento")
    class CategoriaConstrucao
    {
        @Nested
        @DisplayName ("Cenario Normal")
        class CenarioNormal
        {
            @Test
            @DisplayName( "CT01 - Deve carregar CSV com varias regras validas")
            void deveCarregarCsvValido () throws Exception
            {
                BaseDeRegras base = criarBase (
                    "1;Produto A;Ativo;Classe;Batata;10",
                    "2;Produto B;Ativo;Classe;Soja;20",
                    "3;Produto C;Ativo;Classe;Milho;30"
                );

                assertEquals(3, base.getQtdRegras ());
                assertEquals(20, base.buscarRegra ("Produto B", "Soja").getDiasDeCarencia ());
            }

            @Test
            @DisplayName("CT02 - Deve ignorar o cabecalho e as linhas em branco")
            void deveIgnorarCabecalhoELinhasEmBranco () throws Exception
            {
                Path arquivo = pastaTemporaria.resolve ("com-cabecalho.csv");
                Files.writeString (
                    arquivo,
                    "1;Produto Cabecalho;Ativo;Classe;Batata;10\n"
                    + "\n"
                    + "2;Produto A;Ativo;Classe;Batata;5\n"
                    +"  \n",
                    StandardCharsets.UTF_8
                );

                BaseDeRegras base = new BaseDeRegras (arquivo.toString ());

                assertEquals (1, base.getQtdRegras ());
                assertNull (base.buscarRegra ("Produto Cabecalho", "Batata"));
            }

            @Test
            @DisplayName ("CT03 - Deve ignorar linhas invalidas e carregar as validas")
            void deveIgnorarLinhasInvalidas () throws Exception
            {
                BaseDeRegras base = criarBase (
                    "1; Produto A ;Ativo;Classe;Batata",      // menos de 6 colunas
                    "2;   ;Ativo;Classe;Batata;10",              // produto vazio
                    "3;Sem Cultura;Ativo;Classe;;10",            // cultura vazia
                    "4;Sem Carencia;Ativo;Classe;Batata;",       // carencia vazia
                    "5;Produto B;Ativo;Classe;Batata;dez",           // carencia nao numerica
                    "6;Produto C;Ativo;Classe;Batata;7,5",         // carencia decimal
                    "7;Produto D;Ativo;Classe;Batata;-1",         // carencia negativa
                    "8;Produto E;Ativo;Classe;Batata;10"    // unica linha valida
                );

                assertEquals (1, base.getQtdRegras ());
                assertNotNull (base.buscarRegra ("Produto E", "Batata"));
            }

            @Test
            @DisplayName ("CT04 - Duplicidade: deve manter uma unica regra com a maior carencia")
            void deveManterMaiorCarenciaEmDuplicidade () throws Exception
            {
                // As tres linhas sao a mesma regra (so mudam acento, caixa e espacos)
                BaseDeRegras base = criarBase (
                    "1;Produto Ação;Ativo;Classe;Algodão;10",
                    "2;  produto acao ;Ativo;Classe;ALGODAO;25",
                    "3;PRODUTO   AÇÃO;Ativo;Classe;algodao;5"
                );

                assertEquals (1, base.getQtdRegras ());
                assertEquals (25, base.buscarRegra ("Produto Ação", "Algodão").getDiasDeCarencia ());
            }
        }

        @Nested
        @DisplayName ("Cenario de Erro")
        class CenarioDeErro
        {
            @Test
            @DisplayName ("CT05 - Deve rejeitar caminho nulo , vazio ou so com espacos")

            void deveRejeitarCaminhoInvalido ()
            {
                Exception erroNulo = assertThrows (Exception.class, () -> new BaseDeRegras (null));
                Exception erroVazio = assertThrows (Exception.class, () -> new BaseDeRegras (""));
                Exception erroEspaco = assertThrows (Exception.class, ()-> new BaseDeRegras ("  "));

                assertAll("Mensagem de caminho invalido",
                    () -> assertEquals ("Caminho do arquivo invalido", erroNulo.getMessage ()),
                    () -> assertEquals ("Caminho do arquivo invalido", erroVazio.getMessage ()),
                    () -> assertEquals ("Caminho do arquivo invalido", erroEspaco.getMessage ())
                );
            }

            @Test
            @DisplayName ("CT06 - Deve rejeitar arquivo inexistente")
            void deveRejeitarArquivoInexistente ()
            {
                Path arquivo = pastaTemporaria.resolve ("arquivo-inexistente.csv");

                Exception erro = assertThrows (
                    Exception.class, () -> new BaseDeRegras (arquivo.toString ())
                );

                assertTrue(erro.getMessage ().startsWith ("Falha ao ler o ficheiro CSV"));
            }

            @Test
            @DisplayName("CT07 - Deve rejeitar arquivo sem nenhuma regra valida")
            void deveRejeitarArquivoSemRegrasValidas () throws Exception
            {
                Path arquivo = criarCsv (
                    "1;Produto A;Ativo;Classe;Batata;abc",
                    "2;Produto B;Ativo;Classe;Batata;-5"
                );

                Exception erro = assertThrows (
                    Exception.class, () -> new BaseDeRegras (arquivo.toString())
                );

                assertEquals("Arquivo de regras invalido: nenhuma regra valida foi encontrada", erro.getMessage());
            }
        }
    }
    
    // Categoria 2 - Consulta
    @Nested
    @DisplayName ("Categoria 2 - Consulta")
    class CategoriaConsulta
    {
        @Nested
        @DisplayName ("Cenario Normal")
        class CenarioNormal{
            @Test
            @DisplayName("CT08 - Deve encontrar a regra com nome exatamente igual")
            void deveEncontrarRegraExata () throws Exception
            {
                Regra regra = criarBasePadrao ().buscarRegra ("Produto Teste", "Batata");

                assertNotNull(regra);
                assertEquals(10, regra.getDiasDeCarencia ());
            }

            @Test
            @DisplayName("CT09 - Deve ignorar maiusculas, acentos e espacos extras na busca")
            void deveIgnorarDiferencasDeEscrita () throws Exception
            {
                Regra regra = criarBasePadrao ().buscarRegra("  PRODUTO   teste ", "algodao");

                assertNotNull(regra);
                assertEquals(20, regra.getDiasDeCarencia ());
            }

            @Test
            @DisplayName("CT10 - Deve usar a regra de TODAS AS CULTURAS quando nao ha regra especifica")
            void deveUsarRegraGenerica () throws Exception
            {
                assertEquals (7, criarBasePadrao ().buscarRegra ("Produto Geral", "Milho").getDiasDeCarencia ());
            }

            @Test
            @DisplayName("CT11 - Deve priorizar a regra especifica sobre a generica")
            void devePriorizarRegraEspecifica () throws Exception
            {
                assertEquals(3, criarBasePadrao ().buscarRegra ("Produto Geral", "Soja").getDiasDeCarencia ());
            }

            @Test
            @DisplayName("CT12 - Deve contar cada par produto/cultura como uma regra")
            void deveContarRegra () throws Exception
            {
                assertEquals (5, criarBasePadrao ().getQtdRegras ());
            }
        }

        @Nested
        @DisplayName ("Cenario de Erro")
        class CenarioDeErro
        {
            // buscarRegra nao lanca excecao: quando nao encontra, devolve null
            @Test
            @DisplayName ("CT13 - Deve retornar null para produto inexistente ou cultura sem regra")
            void deveRetornarNullQuandoNaoEncontra () throws Exception
            {
                BaseDeRegras base = criarBasePadrao ();

                assertNull (base.buscarRegra ("Produto Inexistente", "Batata"));
                assertNull (base.buscarRegra ("Produto Teste", "Milho"));
            }

            @Test
            @DisplayName ("CT14 - Deve retornar null para produto ou cultura nulos")
            void deveRetornarNullParaNulos () throws Exception
            {
                BaseDeRegras base = criarBasePadrao ();

                assertNull (base.buscarRegra (null, "Batata"));
                assertNull (base.buscarRegra ("Produto Teste", null));
            }
        }
    }

    //Categoria 3 - Processamento/Calculo
    @Nested
    @DisplayName ("Categoria 3 - Processamento e calculo")
    class CategoriaCalculo
    {
        @Nested
        @DisplayName ("Cenario Normal")
        class CenarioNormal
        {
            @Test
            @DisplayName ("CT15 - Deve autorizar e calcular a data de liberacao")
            void deveAutorizarECalcularData () throws Exception
            {
                PedidoDeCarencia pedido = new PedidoDeCarencia(
                    "Produto Teste", "Batata", LocalDate.of (2026, 11, 25)
                );

                RespostaDeCarencia resposta = criarBasePadrao ().consulte (pedido);

                assertAll ("Resposta autorizada", 
                    () -> assertTrue (resposta.isAutorizado ()),
                    () -> assertEquals (10, resposta.getDiasDeCarencia ()),
                    () -> assertEquals (LocalDate.of (2026, 12, 5), resposta.getDataDeLiberacao ()),
                    () -> assertEquals ("", resposta.getMensagem())
                );
            }

            @Test
            @DisplayName ("CT16 - Deve calcular datas com virada de ano e em ano bissexto")
            void deveCalcularDatasLimite () throws Exception
            {
                BaseDeRegras base = criarBasePadrao ();

                RespostaDeCarencia viradaDeAno = base.consulte(
                    new PedidoDeCarencia ("Produto Teste", "Batata", LocalDate.of (2026, 12, 25))
                );

                RespostaDeCarencia bissexto = base.consulte (
                     new PedidoDeCarencia ("Produto Teste", "Batata", LocalDate.of (2028, 2, 25))
                );

                assertEquals (LocalDate.of (2027, 1, 4), viradaDeAno.getDataDeLiberacao ());
                assertEquals (LocalDate.of (2028, 3, 6), bissexto.getDataDeLiberacao ());
            }

            @Test
            @DisplayName("CT17 - Com carencia zero a liberacao e no proprio dia de aplicacao")
            void deveLiberarNoMesmoDiaComCarenciaZero () throws Exception
            {
                LocalDate data = LocalDate.of (2026, 11, 18);

                RespostaDeCarencia resposta = criarBasePadrao ().consulte (
                    new PedidoDeCarencia ("Produto Zero", "Tomate", data)
                );

                assertTrue (resposta.isAutorizado ());
                assertEquals (data, resposta.getDataDeLiberacao ());
            }

            @Test
            @DisplayName ("CT18 - Deve usar a regra generica (TODAS AS CULTURAS) na consulta")
            void deveConsultarUsandoRegraGenerica () throws Exception
            {
                RespostaDeCarencia resposta = criarBasePadrao ().consulte (
                    new PedidoDeCarencia("Produto Geral", "Café", LocalDate.of (2026, 11, 1))
                );

                assertTrue (resposta.isAutorizado ());
                assertEquals (LocalDate.of (2026, 11, 8), resposta.getDataDeLiberacao ());
            }

            @Test
            @DisplayName ("CT19 - Deve retornar nao autorizado quando a regra nao existe")
            void deveRetornarNaoAutorizado () throws Exception
            {
                RespostaDeCarencia resposta = criarBasePadrao ().consulte (
                    new PedidoDeCarencia ("Produto Inexistente", "Batata", LocalDate.of (2026, 11, 5))
                );

                assertAll ("Resposta nao autorizada", 
                    () -> assertFalse (resposta.isAutorizado ()),
                    () -> assertEquals (0, resposta.getDiasDeCarencia ()),
                    () -> assertNull (resposta.getDataDeLiberacao ()),
                    () -> assertEquals (
                        "Regra nao encontrada para o produto e cultura informados",
                        resposta.getMensagem ()
                    )
                );
            }
        }

        @Nested
        @DisplayName ("Cenario de Erro")
        class CenarioDeErro
        {
            @Test
            @DisplayName ("CT20 - Deve rejeitar pedido nulo")
            void deveRejeitarPedidoNulo () throws Exception
            {
                BaseDeRegras base = criarBasePadrao ();

                Exception erro = assertThrows (Exception.class, () -> base.consulte (null));

                assertEquals ("Pedido de carencia ausente", erro.getMessage ());
            }
        }
    }

    //Categoria 4 - Metodos Padrao (Obrigatorios)
    @Nested
    @DisplayName ("Categoria 4 - Metodos padrao (toString, equals, hashCode)")
    class CategoriaMetodosPadrao
    {
        @Nested
        @DisplayName ("Cenario Normal")
        class CenarioNormal{
            @Test
            @DisplayName( "CT21 - toString deve informar a quantidade de regras")
            void deveFormatarToString () throws Exception
            {
                assertEquals(
                    "Base contendo 5 regras de carencia registradas.",
                    criarBasePadrao ().toString ()
                );
            }

            @Test
            @DisplayName ("CT22 - Bases com o mesmo conteudo devem ser iguais e ter o mesmo hashCode")
            void basesIguaisDevemTerEqualsEHashCodeIguais () throws Exception 
            {
                BaseDeRegras base1 = criarBasePadrao ();
                BaseDeRegras base2 = criarBasePadrao ();

                assertAll("equals e hashCode", 
                    () -> assertTrue (base1.equals (base1)),
                    () -> assertTrue (base1.equals (base2)),
                    () -> assertTrue (base2.equals (base1)),
                    () -> assertEquals (base1.hashCode (), base2.hashCode ()),
                    () -> assertTrue (base1.hashCode () >= 0)
                );   
            }
        }
      
        @Nested
        @DisplayName ("Cenario de Erro")
        class CenarioDeErro
        {
            @Test
            @DisplayName ("CT23 - equals deve retornar false para null, outra classe ou conteudo diferente")
            void equalsDeveRetornarFalse () throws Exception
            {
                BaseDeRegras base = criarBase ("1;Produto A;Ativo;Classe;Batata;10");
                BaseDeRegras outroDias = criarBase ("1;Produto A;Ativo;Classe;Batata;11");

                assertAll ("Casos de diferenca",
                    () -> assertFalse (base.equals (null)),
                    () -> assertFalse (base.equals ("Produto A")),
                    () -> assertFalse (base.equals (outroDias))
                );
            }
        }
    }
}