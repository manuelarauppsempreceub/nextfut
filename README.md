# NextFut

Plataforma MVP para avaliação, desempenho e scouting de jogadores de futebol.

## Objetivo

O NextFut centraliza dados de atletas, avaliações de desempenho, resultados técnicos e interesses de olheiros, permitindo uma visão operacional do potencial dos jogadores avaliados.

O projeto está estruturado como um MVP funcional com backend, frontend, banco PostgreSQL, Prisma e ambiente local integrado via Docker Compose.

## Stack técnica

- Node.js
- Express
- Prisma 7.8
- PostgreSQL 16
- Vue 3
- Vite
- Docker Compose

## Estrutura do projeto

- backend/ — API Node.js + Express, Prisma e regras de negócio
- frontend/ — aplicação Vue 3 + Vite
- docs/ — documentação operacional e técnica
- docker-compose.yml — stack local integrada
- README.md — visão geral e operação do projeto

## Serviços locais

| Serviço | URL / Porta |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

## Subindo a stack completa

    cd C:\Apps\nextfut
    docker compose up -d --build
    docker compose ps

## Healthchecks

    curl.exe http://localhost:3000/api/health
    curl.exe http://localhost:3000/api/db-health

Retorno esperado: status ok.

## Backend

O backend fica em backend/.

    cd C:\Apps\nextfut\backend
    npm install
    npm run dev

No Docker, o backend executa automaticamente:

    npx prisma generate && npx prisma migrate deploy && npm run dev

## Frontend

O frontend fica em frontend/.

    cd C:\Apps\nextfut\frontend
    npm install
    npm run dev -- --host 0.0.0.0

No Docker, o Vite deve usar host aberto:

    npm run dev -- --host 0.0.0.0

## Prisma

Schema principal:

    backend/prisma/schema.prisma

Modelos core:

- Athlete
- Evaluator
- Evaluation
- PerformanceResult
- ScoutInterest

Comandos úteis:

    cd C:\Apps\nextfut\backend
    npx prisma generate
    npx prisma migrate dev
    npx prisma migrate deploy
    npx prisma db seed
    npx prisma studio

Dentro da stack Docker, as migrations são aplicadas automaticamente na inicialização do backend.

## Funcionalidades implementadas

- Estrutura inicial do projeto
- Docker Compose com PostgreSQL
- Backend Express base
- Prisma conectado ao PostgreSQL
- Modelos core de atletas, avaliadores, avaliações, resultados e interesses
- Seed inicial
- Endpoint de importação CSV
- Importação real de atletas e avaliações por CSV
- Cálculo de score de desempenho
- Frontend Vue 3 base
- Listagem de atletas
- Perfil detalhado do atleta
- Painel inicial do olheiro
- Tela de importação CSV
- Portal do atleta por código de acesso
- Registro de interesse do olheiro no atleta
- Painel de interesses dos olheiros
- Atualização de status dos interesses
- Dashboard resumo da plataforma
- Docker Compose integrado com postgres, backend e frontend
- Correção do Prisma para execução dentro do Docker

## Fluxo básico de uso

1. Subir a stack com Docker Compose.
2. Acessar o frontend em http://localhost:5173.
3. Importar CSV pela tela de importação.
4. Consultar atletas pela listagem.
5. Abrir o perfil detalhado de um atleta.
6. Acessar o portal do atleta usando o código de acesso.
7. Usar o painel do olheiro.
8. Registrar interesse em um atleta.
9. Atualizar o status do interesse no painel de interesses.
10. Acompanhar os indicadores no dashboard resumo.

## Comandos Docker úteis

    cd C:\Apps\nextfut
    docker compose ps
    docker compose logs backend
    docker compose logs frontend
    docker compose logs postgres
    docker compose restart backend
    docker compose restart frontend
    docker compose down
    docker compose up -d --build

## Troubleshooting rápido

### Docker Desktop desligado

Erro comum:

    failed to connect to the docker API

Solução: abrir o Docker Desktop, aguardar o Docker Engine iniciar e executar novamente docker compose ps.

## Histórico da Fase 19

A Fase 19 consolidou a documentação operacional do projeto, tornando o ambiente mais fácil de subir, validar, operar e continuar evoluindo.
