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
}