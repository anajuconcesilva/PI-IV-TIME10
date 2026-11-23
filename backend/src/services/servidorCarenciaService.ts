// Beatriz Naomi Ferreira Sasaki -25016735

import { delimiter, resolve } from 'node:path';
import { ErroApi } from '../utils/erroApi';
import { execFile } from 'node:child_process';

export interface ResultadoCarencia {
    autorizado: boolean;
    dias: number;
    dataLiberacao: string | null;
    mensagem: string;
}

// Localiza a raiz do projeto a partir da pasta deste service
const PASTA_PROJETO = resolve(__dirname, '../../..');

const PASTA_CLIENTE = resolve(PASTA_PROJETO, 'cliente');
// Monta o caminho da pasta servidor
const PASTA_SERVIDOR = resolve(PASTA_PROJETO, 'servidor');

// Define onde o java deve procurar as classes e bibliotecas
const CLASSPATH =[
    PASTA_CLIENTE,
    PASTA_SERVIDOR,
   // Inclui as bibliotecas .jar da pasta cliente/lib
    resolve(PASTA_CLIENTE,'lib', '*')
].join(delimiter);

// Consulta o servidor Java pela Ponte e retorna a autorização,
// o periodo de carencia e a data de liberação da colheita
export function consultarCarencia(
    produto:string,
    cultura:string,
    dataAplicacao: string
): Promise<ResultadoCarencia>{

    if ([produto, cultura, dataAplicacao].some(
        (valor)=> 
            typeof valor !== 'string' ||
        !valor.trim() || /[\t\r\n]/.test(valor)
    )){
        throw new ErroApi(400, 'Dados da consulta inválidos');
    }

    return new Promise((resolve, reject)=>{
        // iniciao java e guarda o processo na variável ponte
        const ponte = execFile(
            'java',
            ['-cp', CLASSPATH, 'Ponte', 'localhost', '3001'],
            // configurações da execução
            {
                cwd: PASTA_CLIENTE,
                encoding: 'utf8',
                timeout:15000,
                windowsHide:true
            },
            (erro, saida, diagnostico) =>{
                // Se a execução falhou
                if (erro){

                    console.error(diagnostico || erro.message);
                    reject(new ErroApi(
                        502, 'Não foi possível consultar o servidor de carência'
                    ));
                    return;
                }
                try{
                    const resposta = JSON.parse(saida);

                    if(typeof resposta?.erro === 'string'){
                        throw new Error(resposta.erro);
                    }

                    if(typeof resposta?.autorizado !== 'boolean' ||
                        !Number.isInteger(resposta.dias) || resposta.dias <0
                        || typeof resposta.mensagem !== 'string'
                    ){
                        throw new Error('Resposta inválida');
                    }

                    const dataLiberacao = resposta.dataLiberacao ?? null;

                    if(
                        (dataLiberacao !== null && typeof dataLiberacao !== 'string') ||
                        (resposta.autorizado && (dataLiberacao == null || Number.isNaN(Date.parse(dataLiberacao))))
                    ){
                        throw new Error('Data de liberação inválida');
                    }      

                    resolve({
                        autorizado: resposta.autorizado,
                        dias: resposta.dias,
                        dataLiberacao,
                        mensagem: resposta.mensagem
                    });
                }catch{
                    reject(new ErroApi(502, 'O servidor de carência retornou uma resposta inválida'));
                }
            }
        );
        
        ponte.stdin!.on('error', () =>{
            reject(new ErroApi(502, 'Nao foi possivel enviar a consulta a Ponte '));
        });

        ponte.stdin!.end(`${produto.trim()}\t${cultura.trim()}\t${dataAplicacao.trim()}\n`, 'utf8')
    })
}

// Consulta vários produtos de uma vez, com uma única execução da Ponte.
// Devolve os dias de carência de cada pedido, ou null quando o servidor
// não tem a regra ou não respondeu.
export function consultarCarenciaEmLote(
    pedidos: { produto: string; cultura: string }[]
): Promise<(number | null)[]>{

    if (pedidos.length === 0){
        return Promise.resolve([]);
    }

    const dataHoje = new Date().toLocaleDateString('en-CA');
    const validos = pedidos.map((pedido) =>
        typeof pedido.produto === 'string' && typeof pedido.cultura === 'string' &&
        pedido.produto.trim() !== '' && pedido.cultura.trim() !== '' &&
        !/[\t\r\n]/.test(pedido.produto) && !/[\t\r\n]/.test(pedido.cultura)
    );

    return new Promise((resolve)=>{
        const falhar = (motivo: string) => {
            console.error(`Consulta de carência em lote falhou: ${motivo}`);
            resolve(pedidos.map(() => null));
        };

        const ponte = execFile(
            'java',
            ['-cp', CLASSPATH, 'Ponte', 'localhost', '3001'],
            {
                cwd: PASTA_CLIENTE,
                encoding: 'utf8',
                timeout: 30000,
                maxBuffer: 4 * 1024 * 1024,
                windowsHide: true
            },
            (erro, saida, diagnostico) =>{
                if (erro){
                    falhar(diagnostico || erro.message);
                    return;
                }

                const linhas = saida.split(/\r?\n/).filter((linha) => linha.trim() !== '');
                let posicao = 0;

                resolve(pedidos.map((_, indice) => {
                    if (!validos[indice]){
                        return null;
                    }

                    try{
                        const resposta = JSON.parse(linhas[posicao++]);

                        if (resposta?.autorizado === true && Number.isInteger(resposta.dias) && resposta.dias >= 0){
                            return resposta.dias as number;
                        }
                    }catch{
                        return null;
                    }

                    return null;
                }));
            }
        );

        ponte.stdin!.on('error', () => falhar('não foi possível enviar os pedidos à Ponte'));

        const entrada = pedidos
            .filter((_, indice) => validos[indice])
            .map((pedido) => `${pedido.produto.trim()}\t${pedido.cultura.trim()}\t${dataHoje}`)
            .join('\n');

        ponte.stdin!.end(entrada + '\n', 'utf8');
    });
}
