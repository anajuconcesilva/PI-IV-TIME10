// Aluna: Eduarda Prado Deiró | RA: 25004440
use('minha_colheita');

// Espelha o que ja existe no banco: rodar nao muda nada.
function criar(nome, schema, nivel, acao) {
  const opcoes = {
    validator: { $jsonSchema: schema },
    validationLevel: nivel,
    validationAction: acao
  };

  if (db.getCollectionNames().includes(nome)) {
    db.runCommand({ collMod: nome, ...opcoes });
  } else {
    db.createCollection(nome, opcoes);
  }
}

criar('propriedades', {
  bsonType: 'object',
  required: ['email', 'senha', 'cnpj', 'nome'],
  properties: {
    email: { bsonType: 'string' },
    senha: { bsonType: 'string' },
    cnpj: { bsonType: 'string' },
    telefone: { bsonType: 'string' },
    nome: { bsonType: 'string' },
    municipio: { bsonType: 'string' },
    uf: { bsonType: 'string' },
    area: { bsonType: 'number', minimum: 0 },
    registro: { bsonType: 'string' },
    culturas: {
      bsonType: 'array',
      items: { bsonType: 'string' }
    },
    talhoes: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['talhao_id', 'nome', 'cultura_id'],
        properties: {
          talhao_id: { bsonType: 'objectId' },
          nome: { bsonType: 'string' },
          area: { bsonType: 'number', minimum: 0 },
          inicio_cultivo: { bsonType: 'date' },
          safra: { bsonType: 'string' },
          previsao_colheita: { bsonType: 'date' },
          observacao: { bsonType: 'string' },
          status: { bsonType: 'string' },
          cultura_id: { bsonType: 'int' }
        }
      }
    }
  }
}, 'moderate', 'error');
db.propriedades.createIndex({ 'talhoes.talhao_id': 1 });
db.propriedades.createIndex({ email: 1 }, {
  unique: true,
  partialFilterExpression: {
    email: { $type: 'string' }
  }
});
db.propriedades.createIndex({ cnpj: 1 }, {
  unique: true,
  partialFilterExpression: {
    cnpj: { $type: 'string' }
  }
});

criar('culturas', {
  bsonType: 'object',
  required: ['nome', 'cultura_id', 'periodo_carencia'],
  properties: {
    nome: { bsonType: 'string' },
    cultura_id: { bsonType: 'int' },
    periodo_carencia: {
      bsonType: ['int', 'double'],
      minimum: 0
    }
  }
}, 'strict', 'error');
db.culturas.createIndex({ nome: 1 }, { unique: true });
db.culturas.createIndex({ cultura_id: 1 }, { unique: true });

criar('produtos', {
  bsonType: 'object',
  required: ['marca', 'cultura', 'cultura_id'],
  properties: {
    num_registro: {
      bsonType: ['int', 'long', 'double']
    },
    marca: { bsonType: 'string' },
    principio_ativo: { bsonType: 'string' },
    classe: { bsonType: 'string' },
    cultura: { bsonType: 'string' },
    cultura_id: { bsonType: 'int' }
  }
}, 'strict', 'error');
db.produtos.createIndex({ cultura: 1, marca: 1 });
db.produtos.createIndex({ cultura_id: 1, marca: 1 });

criar('aplicacoes', {
  bsonType: 'object',
  required: ['propriedade_id', 'talhao_id', 'produto_id', 'data_aplicacao'],
  properties: {
    propriedade_id: { bsonType: 'objectId' },
    talhao_id: { bsonType: 'objectId' },
    produto_id: { bsonType: 'objectId' },
    data_aplicacao: { bsonType: 'date' },
    dosagem: { bsonType: 'number', minimum: 0 },
    responsavel: { bsonType: 'string' },
    observacoes: { bsonType: 'string' },
    status: { bsonType: 'string' },
    condicoes_climaticas: { bsonType: 'string' },
    periodo_carencia: { bsonType: 'number', minimum: 0 },
    data_liberacao_colheita: { bsonType: 'date' }
  }
}, 'strict', 'error');
db.aplicacoes.createIndex({ talhao_id: 1, data_liberacao_colheita: -1 });
db.aplicacoes.createIndex({ propriedade_id: 1, data_liberacao_colheita: -1 });
db.aplicacoes.createIndex({ propriedade_id: 1, data_aplicacao: -1 });

criar('alertas', {
  bsonType: 'object',
  required: ['propriedade_id', 'tipo', 'mensagem', 'data'],
  properties: {
    propriedade_id: { bsonType: 'objectId' },
    talhao_id: { bsonType: 'objectId' },
    tipo: { bsonType: 'string' },
    mensagem: { bsonType: 'string' },
    data: { bsonType: 'date' },
    status: { bsonType: 'string' }
  }
}, 'strict', 'error');
db.alertas.createIndex({ propriedade_id: 1, talhao_id: 1 });
db.alertas.createIndex({ propriedade_id: 1, status: 1, data: -1 });

criar('colheitas', {
  bsonType: 'object',
  required: ['propriedade_id', 'talhao_id', 'data'],
  properties: {
    propriedade_id: { bsonType: 'objectId' },
    talhao_id: { bsonType: 'objectId' },
    data: { bsonType: 'date' },
    quantidade: { bsonType: 'number', minimum: 0 },
    status: { bsonType: 'string' },
    observacao: { bsonType: 'string' }
  }
}, 'strict', 'error');
db.colheitas.createIndex({ talhao_id: 1, data: -1 });
db.colheitas.createIndex({ propriedade_id: 1, data: -1 });

criar('relatorios', {
  bsonType: 'object',
  required: ['propriedade_id', 'data_geracao', 'tipo'],
  properties: {
    propriedade_id: { bsonType: 'objectId' },
    data_geracao: { bsonType: 'date' },
    conteudo: { bsonType: 'string' },
    tipo: { bsonType: 'string' },
    periodo_inicial: { bsonType: 'date' },
    periodo_final: { bsonType: 'date' }
  }
}, 'strict', 'error');
db.relatorios.createIndex({ propriedade_id: 1, data_geracao: -1 });

// avisos e recuperacoes_senha nao tem validador nem indice.
db.getCollectionNames();
