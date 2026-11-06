use('minha_colheita');

const PRIMEIRA_EXECUCAO = false; // depois que funcionar, mude para false

if (PRIMEIRA_EXECUCAO) {
  db.dropDatabase();
}

function criar(nome, schema) {
  if (db.getCollectionNames().includes(nome)) {
    db.runCommand({ collMod: nome, validator: { $jsonSchema: schema } });
  } else {
    db.createCollection(nome, { validator: { $jsonSchema: schema } });
  }
}

criar('usuarios', {
  bsonType: 'object',
  required: ['nome', 'email', 'senha', 'cpf_cnpj'],
  properties: {
    nome: { bsonType: 'string' },
    email: { bsonType: 'string' },
    senha: { bsonType: 'string' },
    cpf_cnpj: { bsonType: 'string' },
    telefone: { bsonType: 'string' }
  }
});
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.usuarios.createIndex({ cpf_cnpj: 1 }, { unique: true });

criar('culturas', {
  bsonType: 'object',
  required: ['nome'],
  properties: {
    nome: { bsonType: 'string' }
  }
});
db.culturas.createIndex({ nome: 1 }, { unique: true });

criar('produtos', {
  bsonType: 'object',
  required: ['nome', 'autorizacoes'],
  properties: {
    nome: { bsonType: 'string' },
    principio_ativo: { bsonType: 'string' },
    autorizacoes: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['cultura_id', 'periodo_carencia'],
        properties: {
          cultura_id: { bsonType: 'objectId' },
          periodo_carencia: { bsonType: 'number', minimum: 0 }
        }
      }
    }
  }
});
db.produtos.createIndex({ nome: 1 });
db.produtos.createIndex({ 'autorizacoes.cultura_id': 1 });

criar('propriedades', {
  bsonType: 'object',
  required: ['usuario_id', 'nome'],
  properties: {
    usuario_id: { bsonType: 'objectId' },
    nome: { bsonType: 'string' },
    localizacao: { bsonType: 'string' },
    area: { bsonType: 'number', minimum: 0 },
    talhoes: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['talhao_id', 'nome'],
        properties: {
          talhao_id: { bsonType: 'objectId' },
          nome: { bsonType: 'string' },
          area: { bsonType: 'number', minimum: 0 },
          inicio_cultivo: { bsonType: 'date' },
          safra: { bsonType: 'string' },
          previsao_colheita: { bsonType: 'date' },
          observacao: { bsonType: 'string' },
          status: { bsonType: 'string' },
          cultura_id: { bsonType: 'objectId' }
        }
      }
    }
  }
});
db.propriedades.createIndex({ usuario_id: 1 });
db.propriedades.createIndex({ 'talhoes.talhao_id': 1 });

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
});
db.aplicacoes.createIndex({ talhao_id: 1, data_liberacao_colheita: -1 });
db.aplicacoes.createIndex({ propriedade_id: 1 });

criar('colheitas', {
  bsonType: 'object',
  required: ['talhao_id', 'data'],
  properties: {
    talhao_id: { bsonType: 'objectId' },
    data: { bsonType: 'date' },
    quantidade: { bsonType: 'number', minimum: 0 },
    status: { bsonType: 'string' },
    observacao: { bsonType: 'string' }
  }
});
db.colheitas.createIndex({ talhao_id: 1, data: -1 });

criar('alertas', {
  bsonType: 'object',
  required: ['propriedade_id', 'tipo', 'mensagem', 'data'],
  properties: {
    propriedade_id: { bsonType: 'objectId' },
    tipo: { bsonType: 'string' },
    mensagem: { bsonType: 'string' },
    data: { bsonType: 'date' },
    status: { bsonType: 'string' }
  }
});
db.alertas.createIndex({ propriedade_id: 1, status: 1 });

criar('relatorios', {
  bsonType: 'object',
  required: ['usuario_id', 'data_geracao', 'tipo'],
  properties: {
    usuario_id: { bsonType: 'objectId' },
    propriedade_id: { bsonType: 'objectId' },
    data_geracao: { bsonType: 'date' },
    conteudo: { bsonType: 'string' },
    tipo: { bsonType: 'string' },
    periodo_inicial: { bsonType: 'date' },
    periodo_final: { bsonType: 'date' }
  }
});
db.relatorios.createIndex({ usuario_id: 1, data_geracao: -1 });

if (PRIMEIRA_EXECUCAO) {
  const idCultura = db.culturas.insertOne({ nome: 'Soja' }).insertedId;

  const idProduto = db.produtos.insertOne({
    nome: 'Produto Exemplo',
    principio_ativo: 'Principio Ativo Exemplo',
    autorizacoes: [{ cultura_id: idCultura, periodo_carencia: 21 }]
  }).insertedId;

  const idUsuario = db.usuarios.insertOne({
    nome: 'Produtor Exemplo',
    email: 'produtor@exemplo.com',
    senha: 'hash_bcrypt_de_exemplo',
    cpf_cnpj: '00000000000',
    telefone: '11999999999'
  }).insertedId;

  const idTalhao = ObjectId();
  const idPropriedade = db.propriedades.insertOne({
    usuario_id: idUsuario,
    nome: 'Fazenda Exemplo',
    localizacao: 'Campinas, SP',
    area: 120.5,
    talhoes: [{
      talhao_id: idTalhao,
      nome: 'Talhao 1',
      area: 30,
      inicio_cultivo: new Date('2026-09-01'),
      safra: '2026/2027',
      previsao_colheita: new Date('2027-01-15'),
      observacao: 'Talhao de exemplo',
      status: 'em_cultivo',
      cultura_id: idCultura
    }]
  }).insertedId;

  const dataAplicacao = new Date('2026-10-01');
  const carencia = 21;
  const dataLiberacao = new Date(dataAplicacao.getTime() + carencia * 24 * 60 * 60 * 1000);

  db.aplicacoes.insertOne({
    propriedade_id: idPropriedade,
    talhao_id: idTalhao,
    produto_id: idProduto,
    data_aplicacao: dataAplicacao,
    dosagem: 1.5,
    responsavel: 'Produtor Exemplo',
    observacoes: 'Aplicacao de exemplo',
    status: 'realizada',
    condicoes_climaticas: 'Sem vento, 25 graus',
    periodo_carencia: carencia,
    data_liberacao_colheita: dataLiberacao
  });

  db.colheitas.insertOne({
    talhao_id: idTalhao,
    data: new Date('2027-01-20'),
    quantidade: 1800,
    status: 'concluida',
    observacao: 'Colheita de exemplo'
  });

  db.alertas.insertOne({
    propriedade_id: idPropriedade,
    tipo: 'carencia',
    mensagem: 'Talhao 1 em carencia',
    data: new Date(),
    status: 'ativo'
  });

  db.relatorios.insertOne({
    usuario_id: idUsuario,
    propriedade_id: idPropriedade,
    data_geracao: new Date(),
    conteudo: 'Relatorio de exemplo',
    tipo: 'aplicacoes',
    periodo_inicial: new Date('2026-09-01'),
    periodo_final: new Date('2026-10-31')
  });
}

db.getCollectionNames();