package com.MinhaColheita.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "APLICACAO")
public class Aplicacao {
    @Id
    private String aplicacaoId;
    private String propriedadeRef;
    private String produtoRef;
    private String talhaoId;
    private String dataAplicacao;
    private String dosagem;
    private String responsavel;
    private String observacoes;
    private String condicoesClimaticas;
}