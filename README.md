# 🌾 MinhaColheita: Sistema de Gestão Agrícola e Rastreabilidade de Carência

> **Plataforma web para controle de aplicação de agrotóxicos, monitoramento do período de carência (intervalo de segurança) e geração de relatórios de conformidade agrícola.**

---

## 👩‍💻 Integrantes

| RA | Nome |
|---|---|
| 25016735 | Beatriz Naomi Ferreira Sasaki |
| 25004440 | Eduarda Prado Deiró |
| 25002592 | Ana Júlia Conceição da Silva |
| 25014905 | Marília Sara Pereira dos Santos |

---

## 📌 Sobre o Projeto

O **MinhaColheita** auxilia produtores rurais na gestão de propriedades e talhões. O sistema controla o **Período de Carência** (Intervalo de Segurança) dos defensivos agrícolas com base nos dados do **Agrofit (MAPA)**, prevenindo a colheita e a comercialização de alimentos antes do prazo permitido pela legislação.

### 🎯 Principais Objetivos
- **Evitar autuações e rejeições de carga:** avisos sobre áreas bloqueadas para colheita.
- **Garantir rastreabilidade:** histórico de aplicações por talhão.
- **Automatizar relatórios:** emissão de relatórios de conformidade em PDF.

---

## ✨ Funcionalidades

* **Cadastro e login** da propriedade, com autenticação por token (JWT) e recuperação de senha por e-mail.
* **Gestão de talhões:** cadastro, edição, remoção e listagem, com cultura, safra, início do cultivo e previsão de colheita.
* **Registro de aplicação de agrotóxicos:** produto, dosagem e data da aplicação.
* **Cálculo automático de carência:** a data de liberação da colheita é calculada pelo servidor Java com base no produto e na cultura.
* **Status do talhão:** `liberado` ou `em carência`.
* **Registro de colheitas** e **histórico de aplicações** por talhão.
* **Consulta de produtos** do Agrofit por classe e cultura.
* **Central de avisos:** alertas de áreas em carência e liberadas para colheita.
* **Relatórios em PDF** gerados pela API.
* **Minha conta:** consulta e edição dos dados da propriedade.

---

## 🏗️ Arquitetura

```
Navegador (frontend)
      │  HTTP / JSON
      ▼
API Node + Express  ───────────►  MongoDB
      │
      │  executa a Ponte (cliente Java)
      ▼
Servidor Java (sockets, porta 3001)  ──►  CSV de regras de carência
```

| Pasta | Conteúdo |
|---|---|
| `frontend/` | Telas em HTML, CSS e JavaScript puro. |
| `backend/` | API REST em Node.js e TypeScript (rotas, controllers, services e validators). |
| `servidor/` | Servidor Java que responde as consultas de carência (`BaseDeRegras`, `Regra`) e seus testes JUnit. |
| `cliente/` | Cliente Java e a `Ponte`, usada pela API para falar com o servidor. |
| `banco/` | Script do MongoDB com coleções, validadores e índices. |
| `docs/` | Dicionário de dados, relatórios, wireframes e protótipos das telas. |

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- HTML5, CSS3 e JavaScript

### Back-end / API
- Node.js, TypeScript e Express
- MongoDB (driver oficial)
- JWT e bcrypt (autenticação)
- Nodemailer (e-mail) e PDFKit (PDF)

### Servidor de carência
- Java puro, sem frameworks (sockets e objetos serializados)
- Gson (JSON) e JUnit 5 (testes)

### Banco de Dados
- MongoDB

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18 ou superior
- [JDK](https://adoptium.net/) 11 ou superior para compilar e rodar os testes (o comando `java` precisa estar no PATH)
- [MongoDB](https://www.mongodb.com/) (local ou Atlas)
- [Git](https://git-scm.com/)
- Internet durante o uso: o cadastro valida o município na API do IBGE (sem ela, devolve erro 503) e, se o banco for o MongoDB Atlas, ele também precisa de conexão

### Passo a passo

**1. Clonar o repositório**
```bash
git clone https://github.com/anajuconcesilva/PI-IV-TIME10.git
cd PI-IV-TIME10
```

**2. Preparar o banco de dados**

Execute o script `banco/minha_colheita_playground.js` no MongoDB (por exemplo, pelo Playground da extensão do MongoDB para VS Code). Ele cria o banco `minha_colheita`, as coleções, os validadores e os índices.

**3. Configurar e iniciar a API**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Preencha o `.env` com os dados do seu ambiente:

| Variável | Descrição |
|---|---|
| `PORT` | Porta da API (padrão `3000`) |
| `MONGODB_URI` | Endereço de conexão do MongoDB |
| `MONGODB_DB` | Nome do banco (padrão `minha_colheita`) |
| `JWT_SECRET` | Texto secreto que assina o token de login |
| `SMTP_*` e `EMAIL_FROM` | Envio de e-mail da recuperação de senha. Sem `SMTP_HOST`, o código aparece só no terminal da API |

A API sobe em `http://localhost:3000`.

**4. Compilar e iniciar o servidor Java**

Em outro terminal, a partir da raiz do projeto:
```bash
cd cliente
javac --release 8 -encoding UTF-8 -cp "lib/*" *.java

cd ../servidor
javac --release 8 -encoding UTF-8 *.java
java Servidor
```

Compile sempre com `--release 8`. Sem isso, se o `javac` for mais novo que o `java` do PATH (por exemplo, `javac` 17 e `java` 8), o servidor e a Ponte não iniciam e toda aplicação devolve erro 502.

O servidor precisa ser iniciado de dentro da pasta `servidor/`, pois lê o arquivo `produtos_minhacolheita.csv` dessa pasta. Ele escuta na porta `3001`. Para outra porta ou outro CSV: `java Servidor [PORTA [CAMINHO_DO_CSV]]`.

**5. Abrir o front-end**

Abra `frontend/index.html` no navegador (ele redireciona para a tela de login) ou use a extensão Live Server do VS Code. O front chama a API em `http://localhost:3000`.

### Executar os testes do servidor

Dentro de `servidor/`:
```bash
javac -encoding UTF-8 -d ../teste-out -cp lib/junit-platform-console-standalone-1.10.2.jar *.java test/*.java
java -jar lib/junit-platform-console-standalone-1.10.2.jar execute -cp ../teste-out -c RegraTest -c BaseDeRegrasTest -c ConsultaCarenciaIntegrationTest
```

Os testes exigem Java 11 ou superior: confira com `java -version` antes (se mostrar 1.8, use o `java` do JDK 11 ou superior). Para limpar, apague a pasta `teste-out`.

---

## 📚 Documentação

- [Relatório de Ideação](docs/Relatorio_EntregaFinalT10.pdf)
- [Relatório de Testes do Servidor](docs/Relatorio_Testes_Servidor.pdf)
- [Dicionário de dados](docs/dicionario_agrosafe_v3.md)
- [Wireframes](docs/wireframe/)
- [Protótipos das telas](docs/prototipo/)

---

## 📄 Licença

Projeto acadêmico (PI IV).
