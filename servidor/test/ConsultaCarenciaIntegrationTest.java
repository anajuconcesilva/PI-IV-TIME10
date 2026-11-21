// Aluna: Marília Sara Pereira dos Santos | RA: 25014905
// Aluna: Beatriz Naomi Ferreira Sasaki | RA: 25016735
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Teste de Integração - Serviço de Consulta de Carência")
public class ConsultaCarenciaIntegrationTest
{
    @Test
    @DisplayName("CTI01 - Deve autorizar consulta para KBR-829M1-02 em Soja (Todas as culturas) e liberar em 18/11/2026")
    void deveConsultarCarenciaComSucessoNoFluxoCompleto() throws Exception
    {
        // Arrange (Carga real do CSV e criação do pedido para 18/11/2026)
        BaseDeRegras baseDeRegras = new BaseDeRegras("../produtos_minhacolheita.csv");
        PedidoDeCarencia pedido = new PedidoDeCarencia("KBR-829M1-02", "Soja", LocalDate.of(2026, 11, 18));

        // Act (Caminho completo: PedidoDeCarencia -> BaseDeRegras -> Regra -> RespostaDeCarencia)
        RespostaDeCarencia resposta = baseDeRegras.consulte(pedido);

        // Assert (Validação dos resultados integrados)
        assertAll("Verificação da resposta integrada de carência",
                () -> assertNotNull(resposta),
                () -> assertTrue(resposta.isAutorizado()),
                () -> assertEquals(0, resposta.getDiasDeCarencia()),
                () -> assertEquals(LocalDate.of(2026, 11, 18), resposta.getDataDeLiberacao()),
                () -> assertEquals("", resposta.getMensagem())
        );
    }

    // Beatriz Naomi Ferreira Sasaki - 25016735
    @Test
    @DisplayName("CTI02 - Deve negar consulta de 2,4-D + Picloram em Soja (produto sem registro para a cultura)")
    void deveNegarConsultaParaCulturaNaoAutorizadaNoFluxoCompleto() throws Exception
    {
        // O produto existe no CSV, mas so para Arroz (90 dias) e Cana-de-acucar (1 dia),
        // e nao tem regra de "Todas as culturas". Para Soja, o uso nao e autorizado
        BaseDeRegras baseDeRegras = new BaseDeRegras(Servidor.ARQUIVO_PADRAO);
        PedidoDeCarencia pedido = new PedidoDeCarencia("2,4-D (240) + Picloram (64) SL", "Soja", LocalDate.of(2026, 11, 18));

        assertNotNull(baseDeRegras.buscarRegra("2,4-D (240) + Picloram (64) SL", "Arroz"));
        
        RespostaDeCarencia resposta = baseDeRegras.consulte(pedido);

        assertAll("Verificacao da resposta integrada da negação",
            () -> assertNotNull(resposta),
            () -> assertFalse(resposta.isAutorizado()),
            () -> assertEquals(0, resposta.getDiasDeCarencia()),
            () -> assertNull(resposta.getDataDeLiberacao()),
            () -> assertEquals("Regra nao encontrada para o produto e cultura informados", resposta.getMensagem())
        );
    }
}