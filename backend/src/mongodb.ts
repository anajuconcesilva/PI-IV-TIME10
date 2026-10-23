import { env } from './config/env';
import { MongoClient } from 'mongodb';

const client = new MongoClient(env.mongodbUri);

// Conecta ao MongoDB e verifica o acesso com um ping
// Chamada uma vez na inicialização, antes de iniciar a API
export async function conectarBanco(){
    await client.connect();
    const banco = client.db(env.mongodbDb);

    await banco.command({ ping: 1 });
    console.log(`Conectado com o banco de dados ${env.mongodbDb}`);
    return banco;
}

// Retorna a referência ao banco para uso nos CRUDs
// Usar após conectarBanco() concluir a inicialização
export function obterBanco(){
    return client.db(env.mongodbDb);
}