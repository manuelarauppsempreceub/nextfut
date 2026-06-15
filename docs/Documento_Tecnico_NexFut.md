# Documento Técnico — NexFut

## Stack

- Backend: Node.js + Express
- ORM: Prisma
- Banco: PostgreSQL
- Frontend: Vue 3 + Vite
- Ambiente local: Docker Compose

## Objetivo do MVP

Criar um sistema simples para avaliação de jogadores de futebol, permitindo:

- cadastro de atletas;
- cadastro de avaliações;
- histórico completo por atleta;
- score de desempenho;
- pontos fortes e fracos;
- recomendações de treino;
- painel para olheiros;
- portal de consulta para atletas.

## Entidades iniciais previstas

- Atletas
- Avaliadores
- Avaliações
- Resultados de desempenho
- Interesses de olheiros

## Regras principais

- Um atleta pode ter múltiplas avaliações.
- Avaliações não devem ser sobrescritas.
- Cada avaliação deve ter ID único e timestamp.
- O score deve ser calculado de forma explicável.
- O sistema deve rodar localmente com Docker Compose.
