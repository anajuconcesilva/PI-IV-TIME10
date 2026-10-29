// Beatriz Naomi Ferreira Sasaki - 25016735
import { obterBanco } from "../mongodb";
import { ErroApi } from "../utils/erroApi";
import { ObjectId } from 'mongodb';

interface DadosTalhao{
    nome: string;
    area: number;
    inicio_cultivo: string;
    safra: string;
    previsao_colheita: string;
    observacao? : string;
    cultura_id: number;
}

// Verifica se os dados recebidos são válidos
function validarDadosTalhao(dados: DadosTalhao){
    if(typeof dados.nome!== 'string' || !dados.nome.trim()){
        throw new ErroApi(400, 'Informe o nome do talhão');
    }

    if(!Number.isFinite(dados.area) || dados.area<=0){
        throw new ErroApi(400, 'A área deve ser maior que zero');
    }
    
    if(typeof dados.safra !== 'string' || !dados.safra.trim()){
        throw new ErroApi(400, "Informe a safra");
    }

    if(typeof dados.inicio_cultivo !=='string' || typeof dados.previsao_colheita !== 'string'){
        throw new ErroApi(400, 'Informe as datas de cultivo e colheita');
    }
     
    const dataInicioCultivo = new Date(dados.inicio_cultivo);
    const dataPrevisaoColheita = new Date(dados.previsao_colheita);

    if(Number.isNaN(dataInicioCultivo.getTime()) || Number.isNaN(dataPrevisaoColheita.getTime())){
        throw new ErroApi(400, 'Data inválida');
    }

    if(dataPrevisaoColheita< dataInicioCultivo){
        throw new ErroApi(400, 'A colheita não pode ser anterior ao cultivo');
    }

    if(dados.observacao !== undefined && typeof dados.observacao !== 'string'){
        throw new ErroApi(400, 'A observação deve ser um texto');
    }
}

// Consulta no banco se a cultura informada existe
async function verificarCultura(culturaId: number){
    const banco = obterBanco();
    if(!Number.isInteger(culturaId)){
        throw new ErroApi(400, 'Identificação de cultura inválida');
    }
    const cultura = await banco.collection('culturas').findOne({
        cultura_id: culturaId
    });

    if(!cultura){
        throw new ErroApi(404, 'Cultura não encontrada');
    }
}

// Cria um objeto talhão, registra no banco
export async function criarTalhao(propriedadeId: string, dados: DadosTalhao){
    validarDadosTalhao(dados);
    await verificarCultura(dados.cultura_id);

    const talhao={
        talhao_id: new ObjectId(),
        nome: dados.nome.trim(),
        area: dados.area,
        inicio_cultivo: new Date(dados.inicio_cultivo),
        safra: dados.safra.trim(),
        previsao_colheita: new Date(dados.previsao_colheita),
        observacao: dados.observacao?.trim() ?? '',
        status: 'aguardando',
        cultura_id: dados.cultura_id
    };

    if(!ObjectId.isValid(propriedadeId)){
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    const banco= obterBanco();
    
    
    const propriedades = banco.collection<{
        talhoes:(typeof talhao)[];
    }>('propriedades');

    const resultado = await propriedades.updateOne(
        {_id: new ObjectId(propriedadeId)},
        {$push: { talhoes:talhao }}
    );

    if(resultado.matchedCount===0){
        throw new ErroApi(404, 'Propriedade não encontrada');
    }
    return talhao;
}

// Exclui o talhão no banco de dados a partir do seu identificador e o identificador da propriedade 
export async function excluirTalhao(propriedadeId: string, talhaoId:string){
    if(!ObjectId.isValid(propriedadeId)){
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    if (!ObjectId.isValid(talhaoId)) {
        throw new ErroApi(400, 'Identificador do talhão inválido');
    }

    const banco = obterBanco();

    const propriedades= banco.collection<{
        talhoes:{talhao_id: ObjectId} [];
    }>('propriedades');

    const resultado = await propriedades.updateOne(
        {
            _id: new ObjectId(propriedadeId),
            'talhoes.talhao_id': new ObjectId(talhaoId)
        },
        {
            $pull:{
                talhoes:{
                    talhao_id: new ObjectId(talhaoId)
                }
            }
        }
    );
    if(resultado.matchedCount===0){
        throw new ErroApi(404, 'Talhão não encontrado nesta propriedade');
    }
}

// Retorna dados de um talhão específico a partir de seu identificador e o identificador da propriedade que pertence
export async function consultarTalhao(propriedadeId: string, talhaoId:string){

    if(!ObjectId.isValid(propriedadeId)){
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    if (!ObjectId.isValid(talhaoId)) {
        throw new ErroApi(400, 'Identificador do talhão inválido');
    }

    const banco = obterBanco();

    const propriedades= banco.collection<{
        talhoes:{
            talhao_id: ObjectId;
            status:string;
        } [],
    }>('propriedades');

    const resultado = await propriedades.findOne({
        _id: new ObjectId(propriedadeId),
        'talhoes.talhao_id': new ObjectId(talhaoId)
    })

    if(!resultado){
        throw new ErroApi(404, 'Talhão não encontrado nesta propriedade');
    }

    const talhao = resultado.talhoes.find((item)=> item.talhao_id.equals(new ObjectId(talhaoId)));

    if(!talhao){
        throw new ErroApi(404, 'Talhão não encontrado');
    }
    
    talhao.status = await atualizarStatusTalhao(
        propriedadeId,
        talhao.talhao_id.toString()
    );

    return talhao;
}

// Faz a listagem de todos os talhões a partir da identificação de uma propriedade específica
export async function listarTalhoes(propriedadeId: string){
    if(!ObjectId.isValid(propriedadeId)){
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    const banco = obterBanco();

    const propriedades= banco.collection('propriedades');

    
    const resultado = await propriedades.findOne({
        _id: new ObjectId(propriedadeId)
    });

    if(!resultado){
        throw new ErroApi(404, 'Propriedade não encontrada');
    }

    for (const talhao of resultado.talhoes){
        talhao.status = await atualizarStatusTalhao(
            propriedadeId,
            talhao.talhao_id.toString()
        );
    }
    
    return resultado.talhoes;

}

export async function atualizarTalhao(
    propriedadeId:string,
    talhaoId: string, 
    dados:DadosTalhao 
){
    validarDadosTalhao(dados);
    await verificarCultura(dados.cultura_id);

    const dadosAtualizados = {
        nome: dados.nome.trim(),
        area: dados.area,
        inicio_cultivo: new Date(dados.inicio_cultivo),
        safra: dados.safra.trim(),
        previsao_colheita: new Date(dados.previsao_colheita),
        observacao: dados.observacao?.trim() ?? '',
        cultura_id: dados.cultura_id
    };

    if(!ObjectId.isValid(propriedadeId)){
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }
    
    if (!ObjectId.isValid(talhaoId)) {
        throw new ErroApi(400, 'Identificador do talhão inválido');
    }

    const banco= obterBanco();
    
    const propriedades = banco.collection('propriedades');

      const resultado = await propriedades.updateOne(
        {
            _id: new ObjectId(propriedadeId),
            'talhoes.talhao_id': new ObjectId(talhaoId)
        },{
            $set:{
                'talhoes.$.nome': dadosAtualizados.nome,
                'talhoes.$.area': dadosAtualizados.area,
                'talhoes.$.inicio_cultivo': dadosAtualizados.inicio_cultivo,
                'talhoes.$.safra': dadosAtualizados.safra,
                'talhoes.$.previsao_colheita': dadosAtualizados.previsao_colheita,
                'talhoes.$.observacao': dadosAtualizados.observacao,
                'talhoes.$.cultura_id': dadosAtualizados.cultura_id
            }
        }
    );

    if(resultado.matchedCount===0){
        throw new ErroApi(404, 'Talhão não encontrado nesta propriedade');
    }

    return consultarTalhao(propriedadeId, talhaoId);
}

// Atualiza o status do talhão com base nas aplicações realizadas
export async function atualizarStatusTalhao(propriedadeId:string, talhaoId: string){
    if(!ObjectId.isValid(propriedadeId)){
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }
    
    if (!ObjectId.isValid(talhaoId)) {
        throw new ErroApi(400, 'Identificador do talhão inválido');
    }

    const banco= obterBanco();
    const aplicacoes = await banco.collection('aplicacoes')
    .find({
        propriedade_id: new ObjectId(propriedadeId),
        talhao_id: new ObjectId(talhaoId),
        status: 'realizada'
    }).toArray();

    const agora = new Date();
    let status='aguardando';

    if(aplicacoes.length>0){
        let temCarenciaPendente= false;

        for(const aplicacao of aplicacoes){
            const liberacao = aplicacao.data_liberacao_colheita;
        
            if(!(liberacao instanceof Date) || Number.isNaN(liberacao.getTime())){
                throw new ErroApi(500, 'Aplicação com data de liberação inválida');
            }

            if(liberacao> agora){
                temCarenciaPendente=true;
            }

            status= temCarenciaPendente ? 'em_carencia' : 'liberado';
        }
    }
    const resultado= await banco.collection('propriedades').updateOne(
            {
                _id: new ObjectId(propriedadeId),
                'talhoes.talhao_id': new ObjectId(talhaoId)
            },
            {
                $set:{
                    'talhoes.$.status': status
                }
            }
        );

    if(resultado.matchedCount==0){
        throw new ErroApi(404, 'Talhão não encontrado nesta propriedade');
    }
     return status;
}