// Beatriz Naomi Ferreira Sasaki - 25016735;
import { obterBanco } from "../mongodb";
import { ErroApi } from "../utils/erroApi";
import { converterData } from "../utils/converterData";
import {ObjectId} from 'mongodb';


export async function listarHistoricoAplicacoes(
    propriedadeId:string,
    talhaoId:string,
    dataInicio?:string,
    dataFim?:string
){

    if(!ObjectId.isValid(propriedadeId)){
            throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    if (!ObjectId.isValid(talhaoId)) {
        throw new ErroApi(400, 'Identificador do talhão inválido');
    }

    const inicio = dataInicio !== undefined ? converterData(dataInicio) : undefined;
    const fim = dataFim !== undefined ? converterData(dataFim) : undefined;

    if(inicio && fim && inicio > fim){
        throw new ErroApi(400, 'A data inicial não pode ser posterior à final');
    }

    const periodo: { $gte?: Date, $lt?:Date}={};

    if(inicio){
        periodo.$gte=inicio;
    }

    if(fim){
        const diaSeguinte = new Date(fim.getTime());
        diaSeguinte.setUTCDate(diaSeguinte.getUTCDate()+1);

        periodo.$lt= diaSeguinte;
    }


    const banco = obterBanco();

    // Busca as aplicacações realizadas no talhão, da mais recente para a mais antiga
    const aplicacoes = await banco.collection('aplicacoes')
    .find({
        propriedade_id: new ObjectId(propriedadeId),
        talhao_id: new ObjectId(talhaoId),
        ...(inicio || fim ? { data_aplicacao: periodo } : {})
    })
    .sort({ data_aplicacao: -1 })
    .toArray();

    const produtos = await banco.collection('produtos')
    .find({
        _id:{
            $in: aplicacoes.map((aplicacao)=> aplicacao.produto_id)
        }
    })
    .toArray();

    const agora= new Date();

    const historico = aplicacoes.map((aplicacao)=>{
        const produto = produtos.find((item)=>
        item._id.equals(aplicacao.produto_id)
    );

    const dataLiberacao = aplicacao.data_liberacao_colheita;

    if(!(dataLiberacao instanceof Date) || Number.isNaN(dataLiberacao.getTime())){
      throw new ErroApi(500, 'Aplicação com data de liberação ausente ou inválida');
    }
    
    
    return{
        id: aplicacao._id.toString(),
        data_aplicacao: aplicacao.data_aplicacao,
        principio_ativo: produto?.principio_ativo ?? 'Não informado',
        marca: produto?.marca ?? 'Produto não encontrado',
        dosagem: aplicacao.dosagem,
        periodo_carencia: aplicacao.periodo_carencia,
        status: agora < dataLiberacao
            ? 'em_carencia'
            : 'liberado'
    };

    });
    
  return historico;
    
}
  
