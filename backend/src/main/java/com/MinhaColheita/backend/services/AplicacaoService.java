package com.MinhaColheita.backend.services;

import com.MinhaColheita.backend.models.Aplicacao;
import com.MinhaColheita.backend.repositories.AplicacaoRepository;
import com.MinhaColheita.backend.socket.PedidoRegistroAplicacao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AplicacaoService {

    @Autowired
    private AplicacaoRepository repository;

    public void registrarAplicacaoViaSocket(PedidoRegistroAplicacao pedido) {
        System.out.println("[SPRING] O Spring detectou novos dados vindos do Socket...");

        Aplicacao novaAplicacao = new Aplicacao();
        novaAplicacao.setTalhaoId(pedido.getIdTalhao());
        novaAplicacao.setProdutoRef(pedido.getNomeProduto());
        novaAplicacao.setDataAplicacao(pedido.getDataAplicacao());
        novaAplicacao.setDosagem(pedido.getDosagem());
        novaAplicacao.setResponsavel("Sistema Automatico");

        repository.save(novaAplicacao);
        System.out.println("[SPRING] Sucesso: Aplicação salva no MongoDB!");
    }
}