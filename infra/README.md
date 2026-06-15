# Infraestrutura NexFut

Esta pasta concentra arquivos de infraestrutura local.

## Stack local

- PostgreSQL 16
- Docker Compose

## Banco de dados local

Configuração padrão:

- Host: localhost
- Porta: 5432
- Database: nexfut
- User: nexfut
- Password: nexfut

## Subir ambiente

docker compose up -d

## Verificar containers

docker compose ps

## Ver logs do banco

docker compose logs postgres

## Parar ambiente

docker compose down

## Apagar volume do banco

Use apenas se quiser recriar o banco do zero:

docker compose down -v
