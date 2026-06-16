# Operação local do NextFut

Este documento descreve os principais procedimentos para subir, validar e operar o ambiente local do NextFut.

## Pré-requisitos

- Windows com PowerShell
- Docker Desktop instalado e em execução
- Git instalado
- Node.js instalado, caso deseje executar backend ou frontend fora do Docker

## Diretório do projeto

    cd C:\Apps\nextfut

## Subir ambiente completo

    docker compose up -d --build

## Verificar containers

    docker compose ps

Serviços esperados:

- nextfut-postgres
- nextfut-backend
- nextfut-frontend

## URLs principais

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health backend | http://localhost:3000/api/health |
| Health banco | http://localhost:3000/api/db-health |

## Validar backend

    curl.exe http://localhost:3000/api/health

Retorno esperado: status ok.

## Validar banco pelo backend

    curl.exe http://localhost:3000/api/db-health

Retorno esperado: status ok.

## Validar frontend

Abrir no navegador:

    http://localhost:5173

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

## Prisma

O Prisma fica no backend:

    cd C:\Apps\nextfut\backend

Comandos úteis:

    npx prisma generate
    npx prisma migrate dev
    npx prisma migrate deploy
    npx prisma db seed
    npx prisma studio

Na execução com Docker Compose, o backend executa automaticamente:

    npx prisma generate && npx prisma migrate deploy && npm run dev

## Seed

Quando necessário:

    cd C:\Apps\nextfut\backend
    npx prisma db seed

## Fluxo básico de uso do MVP

1. Subir a stack com Docker Compose.
2. Acessar o frontend em http://localhost:5173.
3. Importar CSV de atletas e avaliações.
4. Consultar a listagem de atletas.
5. Abrir o perfil detalhado do atleta.
6. Acessar o portal do atleta por código de acesso.
7. Usar o painel do olheiro.
8. Registrar interesse em um atleta.
9. Atualizar o status do interesse.
10. Acompanhar os indicadores no dashboard.

## Troubleshooting básico

### Docker Desktop desligado

Erro típico:

    failed to connect to the docker API

Ação: abrir o Docker Desktop e aguardar o Docker Engine iniciar.

Depois testar:

    docker compose ps

### Backend com erro

    docker compose logs backend

Verificar erros de Prisma, migrations ou conexão com banco.

### Frontend indisponível

    docker compose logs frontend

Verificar se o Vite está executando com host 0.0.0.0.

### PostgreSQL indisponível

    docker compose logs postgres

Verificar se o container está ativo e se a porta 5432 está disponível.

## Encerrando ambiente

    docker compose down

## Reconstruindo ambiente

    docker compose up -d --build
