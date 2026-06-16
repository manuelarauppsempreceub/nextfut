# Relatório Consolidado do MVP — NextFut

## 1. Visão geral

O NextFut é uma plataforma MVP para avaliação, desempenho e scouting de jogadores de futebol.

O objetivo do sistema é permitir o cadastro de atletas, o registro de avaliações técnicas, físicas e táticas, o cálculo automatizado de score de desempenho, a consulta do atleta por código de acesso e o registro de interesse por olheiros.

O MVP foi desenvolvido de forma incremental, por fases, priorizando uma base funcional simples, operável localmente e com fluxo completo mínimo para validação do produto.

---

## 2. Stack técnica

A stack atual do projeto é composta por:

* Backend: Node.js + Express
* ORM: Prisma
* Banco de dados: PostgreSQL 16
* Frontend: Vue 3 + Vite
* Cliente HTTP: Axios
* Containerização: Docker Compose
* Ambiente local principal: Windows + PowerShell
* Versionamento: Git

Serviços locais:

| Serviço    | URL/Porta             |
| ---------- | --------------------- |
| Frontend   | http://localhost:5173 |
| Backend    | http://localhost:3000 |
| PostgreSQL | localhost:5432        |

Healthchecks principais:

```powershell
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3000/api/db-health
```

---

## 3. Estrutura geral do projeto

Estrutura principal:

```text
nextfut/
  backend/
    prisma/
    src/
      database/
      routes/
      services/
    Dockerfile
  frontend/
    src/
      router/
      services/
      views/
    Dockerfile
  infra/
    postgres/
  docs/
  docker-compose.yml
  README.md
```

Principais áreas:

* `backend/src/routes`: rotas HTTP da API;
* `backend/src/services`: regras auxiliares, incluindo cálculo de desempenho e importação CSV;
* `backend/prisma`: schema, migrations e seed;
* `frontend/src/views`: telas principais da aplicação;
* `frontend/src/router`: rotas da aplicação Vue;
* `docs`: documentação operacional e relatórios técnicos.

---

## 4. Modelo de dados atual

O modelo core atual contempla as seguintes entidades principais.

### 4.1 Athlete

Representa o atleta cadastrado na plataforma.

Campos principais:

* `accessCode`
* `name`
* `age`
* `position`
* `dominantFoot`
* `heightCm`
* `country`
* `region`
* `schoolProject`
* `status`

### 4.2 Evaluator

Representa avaliadores cadastrados no sistema.

### 4.3 Evaluation

Representa uma avaliação de atleta, podendo ser manual ou originada por CSV.

Campos principais:

* notas técnicas;
* condição física;
* tomada de decisão;
* disciplina;
* métricas de jogo;
* nota final;
* potencial;
* fonte da avaliação.

### 4.4 PerformanceResult

Representa o resultado calculado da avaliação.

Campos principais:

* `performanceScore`
* `calculatedLevel`
* taxas calculadas;
* pontos fortes;
* pontos fracos;
* recomendações.

### 4.5 ScoutInterest

Representa o interesse de um olheiro por determinado atleta.

Campos principais:

* nome do olheiro;
* e-mail;
* observação;
* status do interesse.

Status possíveis:

```text
INTERESTED
CONTACTED
DISCARDED
```

---

## 5. Funcionalidades implementadas

Até a Fase 22, o MVP possui as seguintes funcionalidades.

### 5.1 Infraestrutura

* Docker Compose com PostgreSQL, backend e frontend;
* backend Express rodando em container;
* frontend Vue/Vite rodando em container;
* Prisma configurado para execução local e em Docker;
* healthchecks de backend e banco;
* documentação operacional local.

### 5.2 Atletas

* listagem de atletas;
* cadastro manual de atletas;
* geração automática de código de acesso;
* perfil detalhado do atleta;
* edição dos dados cadastrais;
* preservação do código de acesso durante edição.

### 5.3 Importação CSV

* upload de CSV pelo backend;
* tela web de importação;
* leitura de colunas e prévia;
* criação/atualização de atletas;
* criação de avaliações a partir de dados importados;
* cálculo automático de desempenho.

### 5.4 Avaliações

* cadastro manual de avaliação pelo perfil;
* notas técnicas, físicas, táticas e métricas de jogo;
* cálculo automático de score;
* criação automática de resultado de desempenho;
* histórico de avaliações no perfil;
* atualização do score mais recente.

### 5.5 Portal do atleta

* consulta por código de acesso;
* exibição do perfil do atleta;
* exibição do score mais recente;
* exibição de nível, potencial, pontos fortes, pontos fracos e recomendações;
* manutenção do acesso pelo mesmo código após edição cadastral.

### 5.6 Olheiro

* painel inicial do olheiro;
* filtros por nome, posição, região e nível;
* ranking por score;
* registro de interesse no perfil do atleta;
* painel de interesses;
* atualização de status dos interesses.

### 5.7 Dashboard

* resumo da plataforma na Home;
* total de atletas;
* total de avaliações;
* total de interesses;
* score médio;
* atletas por nível;
* últimos atletas cadastrados;
* últimos interesses registrados.

---

## 6. Fluxo operacional atual do MVP

O fluxo operacional mínimo do sistema é:

1. subir a stack com Docker Compose;
2. cadastrar atleta manualmente ou importar CSV;
3. acessar a listagem de atletas;
4. abrir o perfil do atleta;
5. registrar avaliação manual ou importar avaliação;
6. gerar score automaticamente;
7. consultar recomendações de treino;
8. acessar portal do atleta usando o código de acesso;
9. registrar interesse do olheiro;
10. acompanhar interesses e atualizar status;
11. acompanhar indicadores no dashboard.

---

## 7. Histórico consolidado das fases

### Fase 1 — Estrutura inicial

Criação da estrutura base do projeto.

Commit:

```text
2fee622 chore: cria estrutura inicial do projeto nexfut
```

### Fase 2 — Docker Compose com PostgreSQL

Criação do serviço PostgreSQL no Docker Compose.

Commit:

```text
75db619 chore: adiciona docker compose com postgres
```

### Correção de nome do projeto

Padronização do nome para NextFut.

Commits:

```text
19e5a53 chore: corrige nome do projeto para nextfut
a07d84b fix: ajusta textos do backend para nextfut
```

### Fase 3/4 — Backend e Prisma

Criação do backend Express, conexão com PostgreSQL e healthchecks.

Commit:

```text
fc4a2e6 feat: configura prisma e healthcheck do banco
```

### Fase 5 — Modelos core

Criação dos modelos iniciais do domínio.

Commit:

```text
0a6574e feat: cria modelos core iniciais do nextfut
```

### Fase 6 — Endpoint inicial de importação CSV

Criação do endpoint básico de upload CSV.

Commit:

```text
444748e feat: adiciona endpoint inicial de importacao csv
```

### Fase 7 — Importação real e cálculo de score

Importação real de atletas/avaliações e cálculo de desempenho.

Commit:

```text
2bb092c feat: importa atletas e avaliacoes via csv
```

### Fase 8 — Frontend Vue base

Criação do frontend e listagem inicial de atletas.

Commit:

```text
10ea1e4 feat: cria frontend vue base com listagem de atletas
```

### Fase 9 — Perfil detalhado

Criação do perfil detalhado do atleta.

Commit:

```text
7760c97 feat: adiciona perfil detalhado do atleta
```

### Fase 10 — Correção importação e score

Melhoria na importação CSV e no cálculo de score com dados parciais.

Commit:

```text
8b8b544 fix: melhora importacao csv e calculo de score
```

### Fase 11 — Painel do olheiro

Criação do painel inicial do olheiro.

Commit:

```text
c4a62bd feat: adiciona painel inicial do olheiro
```

### Fase 12 — Tela de importação CSV

Criação da tela web de importação.

Commit:

```text
727bd83 feat: adiciona tela de importacao csv
```

### Fase 13 — Portal do atleta

Consulta do atleta por código de acesso.

Commit:

```text
3c0ec44 feat: adiciona portal do atleta por codigo de acesso
```

### Fase 14 — Registro de interesse

Registro de interesse do olheiro no atleta.

Commit:

```text
a915aec feat: registra interesse do olheiro no atleta
```

### Fase 15 — Painel de interesses

Tela para acompanhar interesses registrados.

Commit:

```text
946f9b8 feat: adiciona painel de interesses dos olheiros
```

### Fase 16 — Status dos interesses

Atualização do status do interesse.

Commit:

```text
4d2f6d7 feat: atualiza status dos interesses dos olheiros
```

### Fase 17 — Dashboard resumo

Criação do dashboard resumo da plataforma.

Commit:

```text
6093c4a feat: adiciona dashboard resumo da plataforma
```

### Fase 18 — Docker Compose integrado

Integração de backend e frontend ao Docker Compose.

Commits:

```text
060d27c chore: integra backend e frontend ao docker compose
bc52b55 fix: ajusta prisma para execucao no docker
```

### Fase 19 — Documentação operacional

Criação da documentação operacional do projeto.

Commit:

```text
a09c30c docs: adiciona documentacao operacional do nextfut
```

### Fase 20 — Cadastro manual de atletas

Cadastro manual de atletas pela interface.

Commit:

```text
0cb1864 feat: adiciona cadastro manual de atletas
```

### Fase 21 — Cadastro manual de avaliações

Cadastro manual de avaliação pelo perfil do atleta.

Commit:

```text
b4c2218 feat: adiciona cadastro manual de avaliacoes
```

### Fase 22 — Edição cadastral de atletas

Edição dos dados cadastrais do atleta, preservando o código de acesso.

Commit:

```text
476e0ae feat: adiciona edicao cadastral de atletas
```

---

## 8. Estado atual do repositório

Últimos commits confirmados:

```text
476e0ae feat: adiciona edicao cadastral de atletas
b4c2218 feat: adiciona cadastro manual de avaliacoes
0cb1864 feat: adiciona cadastro manual de atletas
a09c30c docs: adiciona documentacao operacional do nextfut
bc52b55 fix: ajusta prisma para execucao no docker
060d27c chore: integra backend e frontend ao docker compose
6093c4a feat: adiciona dashboard resumo da plataforma
```

---

## 9. Pontos de atenção técnicos

### 9.1 Encoding no Windows

Durante o desenvolvimento houve problemas de acentuação em arquivos `.vue`, causados por escrita via PowerShell sem controle explícito de UTF-8.

Recomendação:

* usar UTF-8 sem BOM para arquivos sensíveis;
* evitar regravações amplas quando patches pontuais forem suficientes;
* validar acentuação no navegador.

Exemplo recomendado:

```powershell
[System.IO.File]::WriteAllText(
  "CAMINHO_DO_ARQUIVO",
  $conteudo,
  [System.Text.UTF8Encoding]::new($false)
)
```

### 9.2 Prisma em Docker

O Prisma Client precisou de ajuste no import para execução dentro do container.

Arquivo:

```text
backend/src/database/prisma.js
```

Padrão atual:

```js
import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

export default prisma;
```

### 9.3 Docker Desktop

Quando o Docker Desktop está desligado, podem ocorrer erros de conexão com PostgreSQL.

Erro típico:

```text
P1001: Can't reach database server at localhost:5432
```

Correção:

1. iniciar Docker Desktop;
2. subir a stack;
3. validar `docker compose ps`.

---

## 10. Pontos de atenção funcionais

### 10.1 Código de acesso

O `accessCode` é usado no portal do atleta e deve permanecer estável.

A edição cadastral não altera esse campo.

### 10.2 Avaliações e score

O score é recalculado a cada nova avaliação.

A avaliação mais recente aparece como referência principal no perfil, portal e listagens.

### 10.3 Importação CSV

A importação CSV já funciona, mas pode evoluir futuramente para:

* validação mais robusta;
* mapeamento assistido de colunas;
* importação com pré-validação antes de gravar;
* relatório de erros mais detalhado.

### 10.4 Layout

A aplicação já é funcional, mas o layout ainda foi construído incrementalmente.

Há necessidade de uma fase específica para:

* padronizar estrutura visual;
* melhorar navegação;
* organizar cabeçalho/menu;
* padronizar cards, botões e formulários;
* melhorar responsividade;
* reduzir CSS duplicado;
* criar uma aparência mais profissional de MVP demonstrável.

---

## 11. Próxima fase recomendada

A próxima fase recomendada é:

```text
Fase 24 — Padronização do layout da aplicação
```

Objetivos sugeridos:

1. criar layout base mais consistente;
2. reorganizar navegação principal;
3. melhorar Home/Dashboard;
4. padronizar formulários;
5. padronizar cards;
6. padronizar botões e badges;
7. melhorar telas:

   * Atletas;
   * Perfil do atleta;
   * Portal do atleta;
   * Olheiro;
   * Interesses;
   * Importação CSV;
8. preservar funcionalidades existentes;
9. evitar regressões de rotas;
10. versionar a fase.

---

## 12. Conclusão

O MVP do NextFut alcançou um estágio funcional relevante.

O sistema já permite operar um ciclo completo de gestão inicial de atletas, desde cadastro/importação até avaliação, cálculo de desempenho, consulta por atleta e interação com olheiros.

O foco recomendado antes de novas funcionalidades é consolidar a experiência visual e a usabilidade da aplicação, tornando o MVP mais adequado para demonstração, validação com usuários e evolução futura.
