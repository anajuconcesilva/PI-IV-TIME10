// Beatriz Naomi Ferreira Sasaki - 25016735
import { obterBanco } from "../mongodb";
import { ErroApi } from "../utils/erroApi";
import { converterData } from "../utils/converterData";
import { ObjectId } from 'mongodb';
import { atualizarStatusTalhao } from "./talhaoService";
import { criarAvisoCarencia } from './avisosService';

interface DadosAplicacao{
    propriedadeId:string;
    talhaoId: string;
    produtoId: string;
    dataAplicacao: string;
    dosagem:number;
    responsavel?: string;
    observacao?: string;
    condicoesClimaticas?:string;
}

function validarDadosAplicacao(dados: DadosAplicacao){

    if(typeof dados.talhaoId!== 'string' ||  !ObjectId.isValid(dados.talhaoId) ){
        throw new ErroApi(400, 'Identificador do talhão inválido ');
    }

    if( typeof dados.produtoId !== 'string' || !ObjectId.isValid(dados.produtoId)){
        throw new ErroApi(400, 'Identificador do produto inválido');
    }


    if(!Number.isFinite(dados.dosagem) || dados.dosagem<=0){
        throw new ErroApi(400, 'A dosagem deve ser maior que zero');
    }

    if(dados.responsavel !== undefined && typeof dados.responsavel  !== 'string'){
        throw new ErroApi(400, 'O responsável deve ser um texto');
    }

    if(dados.observacao !== undefined && typeof dados.observacao !== 'string'){
        throw new ErroApi(400, 'A observação deve ser um texto');
    }

    if(dados.condicoesClimaticas !== undefined && typeof dados.condicoesClimaticas !== 'string'){
        throw new ErroApi(400, 'As condições climáticas devem ser um texto');
    }
     
}

async function buscarProduto(produtoId: string){
    const banco= obterBanco();

    const produto = await banco.collection('produtos').findOne({
        _id: new ObjectId(produtoId)
    });

    if(!produto){
        throw new ErroApi(404, 'Produto não encontrado');
    }

    return produto;
}

async function consultarTalhao(propriedadeId: string, talhaoId: string){
    const banco = obterBanco();

    const idTalhao = new ObjectId(talhaoId);

    const propriedade = await banco.collection('propriedades').findOne({
        _id: new ObjectId(propriedadeId),
        'talhoes.talhao_id': idTalhao
    });

    if(!propriedade){
        throw new ErroApi(404, 'talhão não encontrado nesta propriedade');
    }

    const talhao = propriedade.talhoes.find((
        item :{ talhao_id: ObjectId}) =>
            item.talhao_id.equals(idTalhao)
    );

    if(!talhao){
        throw new ErroApi(404, 'talhão não encontrado ');
    }

    return talhao;
}

export async function criarAplicacao(propriedadeId: string,
    dados: DadosAplicacao
){

    if(!ObjectId.isValid(propriedadeId)){
            throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    validarDadosAplicacao(dados);

    const talhao = await consultarTalhao(
        propriedadeId,
        dados.talhaoId
    );
    await buscarProduto(dados.produtoId);

    const statusTalhao = await atualizarStatusTalhao(propriedadeId, dados.talhaoId);

    if(statusTalhao !== 'aguardando'){
        throw new ErroApi(409, 'Só é possível registrar aplicacação em talhão aguardando');
    }

    const banco = obterBanco();

    const cultura = await banco.collection('culturas').findOne({
        cultura_id: talhao.cultura_id
    });

    if(!cultura){
        throw new ErroApi(404, 'Cultura do talhão não encontrada');
    }

    const periodoCarencia = cultura.periodo_carencia;

    if(!Number.isInteger(periodoCarencia) || periodoCarencia <0){
        throw new ErroApi(500, 'Cultura com período de carência inválido');
    }

    if(typeof dados.dataAplicacao !== 'string'){
        throw new ErroApi(400, 'Informe a data de aplicacao');
    }

    const dataAplicacao = converterData(dados.dataAplicacao);

    const dataLiberacao= new Date(dataAplicacao.getTime());

    dataLiberacao.setUTCDate(
        dataLiberacao.getUTCDate() + periodoCarencia
    );

    const aplicacao ={
        propriedade_id: new ObjectId(propriedadeId),
        talhao_id: new ObjectId(dados.talhaoId),
        produto_id: new ObjectId(dados.produtoId),
        data_aplicacao: dataAplicacao,
        dosagem: dados.dosagem,
        responsavel: dados.responsavel?.trim() ?? '',
        observacoes: dados.observacao?.trim() ?? '',
        condicoes_climaticas: dados.condicoesClimaticas?.trim() ?? '',
        status: 'realizada',
        periodo_carencia: periodoCarencia,
        data_liberacao_colheita: dataLiberacao
    };

    const resultado = await banco.collection('aplicacoes')
    .insertOne(aplicacao);

    await criarAvisoCarencia(
    propriedadeId,
    dados.talhaoId,
    talhao.nome ?? 'Talhão'
);

    await atualizarStatusTalhao(propriedadeId, dados.talhaoId);
    return{
        id: resultado.insertedId.toString(),
        aplicacao: aplicacao
    };
  
}

// Lista as aplicações necessárias para montar o Dashboard.
export async function listarAplicacoesDashboard(propriedadeId: string) {
    if (!ObjectId.isValid(propriedadeId)) {
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    const banco = obterBanco();

    // Busca a propriedade e seus talhões.
    const propriedade = await banco.collection('propriedades').findOne({
        _id: new ObjectId(propriedadeId)
    });

    if (!propriedade) {
        throw new ErroApi(404, 'Propriedade não encontrada');
    }

    const talhoes = propriedade.talhoes ?? [];

    // Busca as aplicações realizadas na propriedade.
    const aplicacoes = await banco.collection('aplicacoes')
        .find({
            propriedade_id: new ObjectId(propriedadeId),
            status: 'realizada'
        })
        .sort({ data_liberacao_colheita: 1 })
        .toArray();

    // Busca os produtos relacionados às aplicações.
    const idsProdutos = aplicacoes.map(
        aplicacao => aplicacao.produto_id
    );

    const produtos = await banco.collection('produtos')
        .find({
            _id: { $in: idsProdutos }
        })
        .toArray();

    // Relaciona aplicação, produto e talhão.
    return aplicacoes.map(aplicacao => {
        const produto = produtos.find(item =>
            item._id.equals(aplicacao.produto_id)
        );

        const talhao = talhoes.find((item: any) =>
            item.talhao_id.equals(aplicacao.talhao_id)
        );

        return {
            id: aplicacao._id.toString(),

            talhao_id: aplicacao.talhao_id.toString(),
            talhao_nome: talhao?.nome ?? 'Talhão não encontrado',

            produto_id: aplicacao.produto_id.toString(),
            produto: produto?.marca ?? 'Produto não encontrado',
            principio_ativo: produto?.principio_ativo ?? 'Não informado',

            data_aplicacao: aplicacao.data_aplicacao,
            periodo_carencia: aplicacao.periodo_carencia,
            data_liberacao_colheita: aplicacao.data_liberacao_colheita
        };
    });
}