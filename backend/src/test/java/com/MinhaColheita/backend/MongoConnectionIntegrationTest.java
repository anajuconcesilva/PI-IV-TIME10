package com.MinhaColheita.backend;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import static org.junit.jupiter.api.Assertions.*;

// Para testar use para cada teste separadamente = .\mvnw.cmd "-Dtest=MongoConnectionIntegrationTest#<nomeTeste>" test

// Inicia um contexto do Spring usando a configuração mínima abaixo
@SpringBootTest(

        classes = MongoConnectionIntegrationTest.ConfiguracaoTeste.class,
        // NONE impede a inicialização do servidor web
        webEnvironment = SpringBootTest.WebEnvironment.NONE
)

class MongoConnectionIntegrationTest {
    // Define a configuração utilizada apenas por este teste
    @SpringBootConfiguration
    // O Spring lê o application.properties, que importa o .env
    @EnableAutoConfiguration
    static class ConfiguracaoTeste {
        // Inicia a configuração do Spring sem carregar o servidor socket
    }

    // Recebe o MongoTemplate criado e configurado pelo Spring
    @Autowired
    private MongoTemplate mongoTemplate;

    @Test
    void testPing() {

        // Confirma que o banco selecionado é o esperado
        assertEquals(
                "minha_colheita",
                mongoTemplate.getDb().getName()
        );

        Document resposta =
                mongoTemplate.executeCommand(new Document("ping", 1));

        // Obtém o campo "ok", que indica o resultado do comando
        Number resultado = (Number) resposta.get("ok");

        // Confirma que o campo "ok" existe na resposta
        assertNotNull(resultado);
        assertEquals(1.0, resultado.doubleValue());
    }

    @Test
    void testInserirDoc() {
        String nomeColecao = "teste_conexao";

        // Cria a coleção somente se ela ainda não existir
        if (!mongoTemplate.collectionExists(nomeColecao)) {
            mongoTemplate.createCollection(nomeColecao);
        }

        var colecao = mongoTemplate.getCollection(nomeColecao);

        // Identificador diferente a cada execução
        Document item = new Document(
                "_id", java.util.UUID.randomUUID().toString())
                .append("nome", "Item de teste");

        var resultado = colecao.insertOne(item);

        assertTrue(resultado.wasAcknowledged());
        assertNotNull(resultado.getInsertedId());
    }

    @Test
    void testLerDoc() {
        var colecao = mongoTemplate.getCollection("teste_conexao");

        // Busca um documento com o nome usado no teste anterior
        Document encontrado = colecao
                .find(new Document("nome", "Item de teste"))
                .first();

        // Confirma que encontrou o documento e que o valor está correto
        assertNotNull(encontrado, "Item de teste não encontrado");
        assertEquals("Item de teste", encontrado.getString("nome"));
    }

    @Test
    void testAtualizarDoc() {
        var colecao = mongoTemplate.getCollection("teste_conexao");

        // Localiza o item criado anteriormente
        Document encontrado = colecao
                .find(new Document("nome", "Item de teste"))
                .first();

        assertNotNull(encontrado, "Item de teste não encontrado");

        // Usa o ID para atualizar somente esse documento
        Document filtro = new Document("_id", encontrado.get("_id"));

        var resultado = colecao.updateOne(
                filtro,
                new Document("$set",
                        new Document("nome", "Item atualizado"))
        );

        // Verifica se um documento correspondeu ao filtro
        assertEquals(1L, resultado.getMatchedCount());
        // Verifica se um documento foi realmente alterado
        assertEquals(1L, resultado.getModifiedCount());

        // Lê novamente para confirmar a alteração do valor
        Document atualizado = colecao.find(filtro).first();

        assertNotNull(atualizado);
        assertEquals("Item atualizado", atualizado.getString("nome"));
    }

    @Test
    void testExcluirDoc() {
        var colecao = mongoTemplate.getCollection("teste_conexao");

        // Busca o documento atualizado no teste anterior
        Document encontrado = colecao
                .find(new Document("nome", "Item atualizado"))
                .first();

        assertNotNull(encontrado, "Item atualizado não encontrado");

        // Exclui somente esse documento pelo ID
        Document filtro = new Document("_id", encontrado.get("_id"));
        var resultado = colecao.deleteOne(filtro);

        // verifica se foi deletado apenas um documento
        assertEquals(1L, resultado.getDeletedCount());

        // Confirma que ele não existe mais
        assertNull(colecao.find(filtro).first());
    }
}