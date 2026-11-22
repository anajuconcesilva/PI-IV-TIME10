// Beatriz Naomi Ferreira Sasaki - 25016735
import { ErroApi } from './erroApi';

export function converterData(valor:string): Date {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(valor)){
        throw new ErroApi(400, 'Use datas no formato AAAA-MM-DD');
    }

    const data = new Date(`${valor}T00:00:00.000Z`);

    if(Number.isNaN(data.getTime()) || data.toISOString().slice(0,10) !== valor){
        throw new ErroApi(400, 'Data inválida');
    }

    return data;
}