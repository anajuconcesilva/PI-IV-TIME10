# Dicionário de Dados: AgroSafe - Sistema de Controle e Conformidade da Produção Agrícola

> **Objetivo:** Representar a modelagem oficial de dados do sistema AgroSafe orientada ao MongoDB, refletindo a estrutura real dos documentos, subdocumentos, coleções e os índices de performance utilizados para o controle de aplicações, talhões, culturas, produtos, colheitas, alertas e relatórios.

---

## 1. Controle de Versões

| Data | Autor | Versão | Comentários |
| :---: | :---: | :---: | :--- |
| 06/09/2026 | Ana Júlia Silva | 1.0.0-version1 | Versão inicial conceitual do dicionário de dados |
| 20/10/2026 | Ana Júlia Silva | 2.0.0 | Versão que considerava índices iniciais e atualização de entidades |
| 11/11/2026 | Ana Júlia Silva | 3.0.0 | Versão atualizada com base na modelagem física do MongoDB, inclusão da coleção de colheitas, subdocumentos de talhões, e novos índices de performance e busca |

---

## 2. Coleções e Estruturas de Dados

### 2.1. `propriedades` (Coleção principal)
Representa a fazenda/propriedade rural gerenciada pelo produtor (usuário do sistema), contendo em seu escopo os dados de autenticação e uma lista embutida de talhões.

#### Atributos da Coleção `propriedades`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único da propriedade |
| `nome` | String | Sim | Nome utilizado para identificar a propriedade |
| `area` | Double / Number | Sim | Área total da propriedade |
| `email` | String | Sim | Endereço eletrônico utilizado para login rápido e acesso |
| `senha` | String | Sim | Senha criptografada (hash bcrypt) do usuário/propriedade |
| `telefone` | String | Não | Número de telefone de contato |
| `municipio` | String | Sim | Município onde se localiza a propriedade |
| `uf` | String | Sim | Unidade Federativa (Estado) da propriedade |
| `cnpj` | String | Não | CNPJ da propriedade (controlado por índice único) |
| `talhoes` | Array de Subdocumentos | Sim | Lista de talhões pertencentes à propriedade |

#### Subdocumento: `talhoes` (dentro de `propriedades`)
| Atributo do Talhão | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `talhao_id` | ObjectId | Sim | Identificador único do talhão |
| `nome` | String | Sim | Nome ou identificação do talhão (ex: "Talhao 1") |
| `area` | Double / Number | Sim | Área correspondente ao talhão |
| `inicio_cultivo` | Date | Sim | Data de início do cultivo no talhão |
| `safra` | String | Sim | Período da safra agrícola (ex: "2026/2027") |
| `previsao_colheita` | Date | Não | Data estimada para a colheita |
| `observacao` | String | Não | Observações gerais sobre o talhão |
| `status` | String | Sim | Situação atual do talhão (ex: "liberado", "em carencia") |
| `cultura_id` | Integer / ID | Sim | Identificador da cultura associada ao talhão |

#### Índices da Coleção `propriedades`
* `{ email: 1 }` (Único): Utilizado para login rápido e impedimento de e-mails duplicados.
* `{ cnpj: 1 }` (Único): Impede o cadastro de CNPJs duplicados no sistema.
* `{ 'talhoes.talhao_id': 1 }`: Índice embutido para localizar rapidamente a fazenda a partir de um talhão específico.

---

### 2.2. `culturas` (Coleção)
Armazena os tipos de cultivos agrícolas e seus respectivos períodos de carência padrão.

#### Atributos da Coleção `culturas`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único do documento da cultura |
| `cultura_id` | Integer | Sim | Código identificador numérico da cultura (ligação com talhões e produtos) |
| `nome` | String | Sim | Nome descritivo da cultura agrícola (ex: "Todas as culturas") |
| `periodo_carencia` | Integer / Number | Sim | Período de carência padrão em dias |

#### Índices da Coleção `culturas`
* `{ nome: 1 }` (Único): Garante que não haja culturas repetidas e otimiza a busca por nome no cadastro.
* `{ cultura_id: 1 }` (Único): Chave lógica utilizada para o relacionamento e cruzamento entre talhão, cultura e carência no servidor Java.

---

### 2.3. `produtos` (Coleção)
Armazena os agrotóxicos e produtos autorizados, detalhando princípios ativos e marcas.

#### Atributos da Coleção `produtos`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único do produto |
| `num_registro` | Integer | Sim | Número de registro oficial do produto |
| `marca` | String | Sim | Nome comercial ou marca do produto |
| `principio_ativo` | String | Sim | Princípio ativo principal contido no produto |
| `classe` | String | Sim | Classe agronômica do produto (ex: "Agente Biológico de Controle") |
| `cultura_id` | Integer | Sim | Código da cultura vinculada à autorização do produto |
| `cultura` | String | Sim | Nome textual da cultura autorizada |
| `busca_marca` | String | Não | Campo normalizado (sem acento e minúsculo) para busca rápida |
| `busca_principio` | String | Não | Campo normalizado para busca rápida por princípio ativo |

#### Índices da Coleção `produtos`
* `{ cultura_id: 1, marca: 1 }`: Índice composto para listar produtos autorizados para a cultura do talhão em ordem alfabética (substitui o índice antigo `{ cultura_id: 1 }`).
* `{ cultura: 1, marca: 1 }`: Utilizado para conferir se um produto é autorizado com base no nome textual da cultura.
* `{ busca_marca: 1 }`: Índice dedicado à busca textual rápida por marca enquanto o usuário digita, insensível a acentos e maiúsculas (exige código de suporte na aplicação).
* `{ busca_principio: 1 }`: Índice dedicado à busca por princípio ativo (exige código de suporte na aplicação).

---

### 2.4. `aplicacoes` (Coleção)
Registra as aplicações de defensivos agrícolas feitas nos talhões das propriedades.

#### Atributos da Coleção `aplicacoes`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único da aplicação |
| `propriedade_id` | ObjectId | Sim | Referência à propriedade onde a aplicação ocorreu |
| `talhao_id` | ObjectId | Sim | Referência ao talhão específico tratado |
| `produto_id` | ObjectId | Sim | Referência ao produto/agrotóxico utilizado |
| `data_aplicacao` | Date | Sim | Data em que a aplicação foi realizada |
| `dosagem` | Double / Number | Sim | Quantidade/dosagem aplicada |
| `responsavel` | String | Sim | Nome do responsável pela aplicação |
| `observacoes` | String | Não | Anotações adicionais sobre o procedimento |
| `status` | String | Sim | Status da aplicação (ex: "realizada") |
| `condicoes_climaticas` | String | Não | Relato das condições climáticas no momento |
| `periodo_carencia` | Integer | Sim | Período de carência em dias estipulado |
| `data_liberacao_colheita` | Date | Sim | Data calculada para a liberação segura da colheita |

#### Índices da Coleção `aplicacoes`
* `{ talhao_id: 1, data_liberacao_colheita: -1 }`: Usado para checar rapidamente o status de carência de cada talhão.
* `{ propriedade_id: 1, data_liberacao_colheita: -1 }`: Índice otimizado para o dashboard (separação entre itens em carência e liberados), alertas e buscas por data de liberação.
* `{ propriedade_id: 1, data_aplicacao: -1 }`: Usado para filtrar aplicações por período, relatórios e exibir o histórico do mais recente para o mais antigo (substitui o antigo `{ propriedade_id: 1 }`).

---

### 2.5. `alertas` (Coleção)
Armazena notificações e avisos direcionados aos talhões e propriedades (como avisos de períodos de carência ativos).

#### Atributos da Coleção `alertas`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único do alerta |
| `propriedade_id` | ObjectId | Sim | Propriedade associada ao alerta |
| `talhao_id` | ObjectId | Sim | Talhão associado ao alerta |
| `tipo` | String | Sim | Categoria do alerta (ex: "carencia") |
| `mensagem` | String | Sim | Texto descritivo exibido ao produtor |
| `data` | Date | Sim | Data e hora em que o alerta foi gerado |
| `status` | String | Sim | Situação do alerta (ex: "ativo", "lido") |

#### Índices da Coleção `alertas`
* `{ propriedade_id: 1, status: 1, data: -1 }`: Otimiza a exibição de avisos ativos da fazenda ordenados do mais recente para o mais antigo (substitui o antigo `{ propriedade_id: 1, status: 1 }`).
* `{ propriedade_id: 1, talhao_id: 1 }`: Permite consultar de forma eficiente todos os alertas vinculados a um talhão específico.

---

### 2.6. `colheitas` (Coleção)
Registra as operações de colheita realizadas nos talhões.

#### Atributos da Coleção `colheitas`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único do registro de colheita |
| `propriedade_id` | ObjectId | Sim | Referência à propriedade rural |
| `talhao_id` | ObjectId | Sim | Referência ao talhão colhido |
| `data` | Date | Sim | Data em que a colheita foi realizada |
| `quantidade` | Double / Number | Sim | Volume ou quantidade colhida (ex: em quilogramas ou sacas) |
| `status` | String | Sim | Estado do registro (ex: "concluida") |
| `observacao` | String | Não | Comentários adicionais sobre a colheita |

#### Índices da Coleção `colheitas`
* `{ talhao_id: 1, data: -1 }`: Consulta de histórico de colheitas de um talhão específico em ordem decrescente de data.
* `{ propriedade_id: 1, data: -1 }`: Consulta consolidada de colheitas de toda a fazenda.

---

### 2.7. `relatorios` (Coleção)
Armazena os relatórios de conformidade gerados pelo sistema para a tomada de decisão do produtor.

#### Atributos da Coleção `relatorios`
| Atributo | Tipo NoSQL (BSON) | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | ObjectId | Sim | Identificador único do relatório |
| `propriedade_id` | ObjectId | Sim | Referência à propriedade solicitante |
| `tipo` | String | Sim | Tipo do relatório gerado (ex: "aplicacoes") |
| `conteudo` | String / Object | Sim | Dados consolidados do relatório |
| `periodo_inicial` | Date | Sim | Data inicial do filtro de dados do relatório |
| `periodo_final` | Date | Sim | Data final do filtro de dados do relatório |
| `data_geracao` | Date | Sim | Data e hora em que o arquivo/registro de relatório foi gerado |

#### Índices da Coleção `relatorios`
* `{ propriedade_id: 1, data_geracao: -1 }`: Organiza e recupera os relatórios emitidos pela propriedade do mais recente para o mais antigo.