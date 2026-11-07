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

// Monta o caminho da pasta servidor
const PASTA_SERVIDOR = resolve('../servidor');

// Define onde o java deve procurar as classes e bibliotecas
const CLASSPATH =[
    PASTA_SERVIDOR,
    // Confirmar onde ficará o Gson e ajustar este caminho.
    resolve(PASTA_SERVIDOR,'lib', '*')
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
        !valor.trim() || /[;\r\n]/.test(valor)
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
                cwd: PASTA_SERVIDOR,
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

        ponte.stdin!.end(`${produto.trim()};${cultura.trim()};${dataAplicacao.trim()}\n`, 'utf8')
    })
}