# 🌾 AgroSafe: Sistema de Gestão Agrícola e Rastreabilidade de Carência

> **Plataforma web para controle de aplicação de agrotóxicos, monitoramento do período de carência (intervalo de segurança) e geração automatizada de cadernos de campo para conformidade agrícola.**

---

## 📌 Sobre o Projeto

O **Sistema de Gestão Agrícola** é uma solução desenvolvida para auxiliar produtores rurais e engenheiros agrônomos na gestão eficiente de propriedades e talhões. O sistema garante o cumprimento do **Período de Carência** (Intervalo de Segurança) dos defensivos agrícolas com base nos dados do **Agrofit (MAPA)**, prevenindo a colheita e comercialização de alimentos com resíduos acima dos limites permitidos pela legislação.

### 🎯 Principais Objetivos
- **Evitar autuações e rejeições de carga:** Alertas em tempo real sobre áreas bloqueadas para colheita.
- **Garantir rastreabilidade total:** Histórico detalhado por lote e talhão.
- **Automação de relatórios:** Emissão instantânea de Cadernos de Campo e Declarações de Rastreabilidade em PDF com QR Code.

---

## ✨ Funcionalidades Principais

* **Gestão de Propriedades e Talhões:** Cadastro completo da fazenda, divisão por áreas produtivas, mapeamento de culturas instaladas e datas de plantio/colheita.
* **Registro de Aplicação de Agrotóxicos:** Lançamento de defensivos, dosagens e dados do responsável técnico (CREA/A.R.T.).
* **Cálculo Automático de Carência:** Cálculo dinâmico da data limite para colheita segura com base no produto aplicado.
* **Consulta Agrofit:** Módulo integrado para pesquisa de agrotóxicos autorizados por cultura e ingrediente ativo.
* **Central de Alertas e Notificações:** Notificações visuais de bloqueio (área em carência) e liberação para colheita.
* **Emissão de Relatórios de Conformidade:** Geração de relatórios PDF com validação via QR Code e assinatura digital do responsável técnico.

---

## Tecnologias Utilizadas

### **Front-end / Interface**
- **Comunicação visual:** HTML5, CSS3

### **Back-end / API**
- **Linguagem/Framework:** N
- **Geração de PDF:** PDFKit / Puppeteer

### **Banco de Dados**
- **BD:** MongoDB

---

## 🚀 Como Executar o Projeto

### **Pré-requisitos**
Antes de começar, certifique-se de ter instalado em sua máquina:


### **Passo a Passo**

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
   cd seu-repositorio