package com.MinhaColheita.backend.socket;

public class PedidoRegistroAplicacao extends Comunicado {
    private String idTalhao;
    private String nomeProduto;
    private String dataAplicacao;
    private String dosagem;

    public PedidoRegistroAplicacao(String idTalhao, String nomeProduto, String dataAplicacao, String dosagem) {
        this.idTalhao = idTalhao;
        this.nomeProduto = nomeProduto;
        this.dataAplicacao = dataAplicacao;
        this.dosagem = dosagem;
    }

    public String getIdTalhao() {
        return idTalhao;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public String getDataAplicacao() {
        return dataAplicacao;
    }

    public String getDosagem() {
        return dosagem;
    }
}