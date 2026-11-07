import java.time.LocalDate;

public class BaseDeRegras{
    


    
    /**
     * Consulta a regra e calcula a data de liberacao da colheita.
     *
     * @param pedido produto, cultura e data da aplicacao
     * @return resposta com autorizacao, prazo e data de liberacao
     * @throws Exception se o pedido ou seus dados forem invalidos
     * @author Beatriz Naomi Ferreira Sasaki
     * @since 2026
     */
    public RespostaDeCarencia consulte (PedidoDeCarencia pedido)
        throws Exception
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

        Regra regra = this.regras.get (
            this.criarChave (produto, cultura));

        if (regra == null)
        {
            return new RespostaDeCarencia (
                false,
                0,
                null,
                "Regra nao encontrada para o produto e cultura informados");
        }

        int dias = regra.getDiasCarencia ();
        LocalDate dataLiberacao = dataDaAplicacao.plusDays (dias);

        return new RespostaDeCarencia (
            true,
            dias,
            dataLiberacao,
            "");
        }
}