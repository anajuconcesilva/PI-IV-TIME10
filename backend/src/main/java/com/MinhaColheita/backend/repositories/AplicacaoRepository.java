package com.MinhaColheita.backend.repositories;

import com.MinhaColheita.backend.models.Aplicacao;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AplicacaoRepository extends MongoRepository<Aplicacao, String> {
}