# Operação local do NextFut

Este documento descreve os principais procedimentos para subir, validar e operar o ambiente local do NextFut.

---

## 1. Pré-requisitos

- Windows com PowerShell
- Docker Desktop instalado e em execução
- Git instalado
- Node.js instalado, caso deseje executar backend ou frontend fora do Docker
- Navegador web

---

## 2. Diretório do projeto

```powershell
cd C:\Apps\nextfut
```

---

## 3. Ambiente recomendado: Docker Compose

Subir ambiente completo:

```powershell
docker compose up -d --build
```

Verificar containers:

```powershell
docker compose ps
```

Serviços esperados:

```text
nextfut-postgres
nextfut-backend
nextfut-frontend
```

URLs principais:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health backend | http://localhost:3000/api/health |
| Health banco | http://localhost:3000/api/db-health |

---

## 4. Validar backend

```powershell
curl.exe http://localhost:3000/api/health
```

Retorno esperado:

```json
{
  "status": "ok"
}
```

Validar banco pelo backend:

```powershell
curl.exe http://localhost:3000/api/db-health
```

---

## 5. Validar frontend

Abrir no navegador:

```text
http://localhost:5173
```

A homepage pública deve ser exibida.

---

## 6. Prisma no Docker

Gerar client:

```powershell
docker compose exec backend npx prisma generate
```

Rodar seed:

```powershell
docker compose exec backend npm run seed
```

Aplicar migrations, quando necessário:

```powershell
docker compose exec backend npx prisma migrate deploy
```

---

## 7. Usuários de acesso

### Administrador

```text
E-mail: admin@nextfut.local
Senha: Admin@123
Perfil: ADMIN
```

### Atleta de teste, se cadastrado/aprovado

```text
E-mail: atleta.pendente@nextfut.local
Senha: Atleta@123
Perfil: ATHLETE
```

### Olheiro de teste, se cadastrado/aprovado

```text
E-mail: olheiro.pendente@nextfut.local
Senha: Olheiro@123
Perfil: SCOUT
```

Atletas e olheiros públicos precisam estar com status `ACTIVE` em `/admin/usuarios`.

---

## 8. Fluxo básico de demonstração

1. Subir a stack com Docker Compose.
2. Acessar `http://localhost:5173`.
3. Mostrar a homepage pública.
4. Acessar o Portal do Atleta em `/portal-atleta`.
5. Consultar um atleta por código, por exemplo `NF-0001`, se houver dados.
6. Logar como administrador.
7. Acessar `/dashboard`.
8. Acessar `/importar`.
9. Importar CSV de captação escolar.
10. Validar atletas criados em `/atletas`.
11. Validar scores e avaliações.
12. Acessar `/olheiro`.
13. Registrar interesse em um atleta.
14. Acessar `/interesses`.
15. Atualizar status do interesse.
16. Acessar `/admin/usuarios`.
17. Aprovar ou inativar usuários.
18. Acessar `/admin/olheiros`.
19. Visualizar olheiros cadastrados.
20. Demonstrar reset da base de atletas, se necessário.

---

## 9. Rotas principais

### Públicas

```text
/
 /login
 /cadastro/atleta
 /cadastro/olheiro
 /portal-atleta
```

### Autenticadas

```text
/dashboard
/atletas
/atletas/:id
/olheiro
/interesses
/importar
/admin/usuarios
/admin/olheiros
```

---

## 10. Cadastro público de usuários

### Cadastro de atleta

Rota:

```text
/cadastro/atleta
```

Cria:

- atleta;
- usuário com perfil `ATHLETE`;
- status `PENDING`.

O administrador precisa aprovar o usuário.

### Cadastro de olheiro

Rota:

```text
/cadastro/olheiro
```

Cria:

- usuário com perfil `SCOUT`;
- status `PENDING`.

O administrador precisa aprovar o usuário.

---

## 11. Portal do Atleta

Rota:

```text
/portal-atleta
```

O Portal do Atleta é público e funciona por código de acesso.

Não exige login.

Uso:

1. informar código, por exemplo `NF-0001`;
2. clicar em consultar;
3. visualizar score, nível, pontos fortes e recomendações.

---

## 12. Importação CSV

Rota:

```text
/importar
```

A importação CSV atual aceita bases de captação escolar com colunas como:

```text
NOME_JOGADOR
PAIS
REGIAO_DF
DATA_NASCIMENTO
IDADE
POSICAO
ALTURA_CM
PE_PREFERENCIAL
JOGOS
GOLS
ASSISTENCIAS
PASSES_CERTOS_PCT
```

Resultado esperado:

- linhas lidas;
- atletas criados/atualizados;
- avaliações criadas;
- erros encontrados;
- colunas identificadas;
- prévia das primeiras linhas.

Observação:

- e-mail não é obrigatório para importação operacional;
- e-mail só deve ser obrigatório quando houver criação de usuário atleta.

---

## 13. Reset da base de atletas

Disponível para administradores em:

```text
/admin/usuarios
```

Ação:

```text
Zerar base de atletas
```

Confirmação exigida:

```text
ZERAR ATLETAS
```

Remove:

- atletas;
- avaliações;
- resultados;
- interesses;
- usuários atletas.

Preserva:

- usuários administradores;
- usuários olheiros;
- estrutura do banco.

---

## 14. Rodar backend e frontend localmente com Postgres do Docker

É possível usar apenas o PostgreSQL no Docker e rodar backend/frontend fora do Docker.

Subir apenas Postgres:

```powershell
cd C:\Apps\nextfut
docker compose stop backend frontend
docker compose up -d postgres
docker compose ps
```

Backend local:

```powershell
cd C:\Apps\nextfut\backend
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Frontend local:

```powershell
cd C:\Apps\nextfut\frontend
npm run dev
```

Atenção: se o backend local apontar para `localhost:5432`, precisa existir PostgreSQL ativo nessa porta.

---

## 15. Comandos Docker úteis

```powershell
cd C:\Apps\nextfut

docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
docker compose restart backend
docker compose restart frontend
docker compose restart backend frontend
docker compose down
docker compose up -d --build
```

---

## 16. Git

Remote configurado:

```text
origin https://github.com/eduardohirle22/projeto1-eduardo-futebol.git
```

Branch local:

```text
master
```

Branch remota de trabalho:

```text
origin/nextfut-mvp-atual
```

Verificar estado:

```powershell
git status
git status -sb
git log --oneline -10
git remote -v
git branch -vv
```

Enviar commits:

```powershell
git push
```

Atualizar local:

```powershell
git pull
```

---

## 17. Troubleshooting

### Docker Desktop desligado

Erro típico:

```text
failed to connect to the docker API
```

Ação:

1. abrir Docker Desktop;
2. aguardar Docker Engine iniciar;
3. rodar `docker compose ps`.

### Porta 3000 ocupada

Verificar:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, State, OwningProcess
```

Encerrar processo, se necessário:

```powershell
Stop-Process -Id <PID> -Force
```

### Porta 5173 ou 5174 ocupada

Verificar:

```powershell
Get-NetTCPConnection -LocalPort 5173,5174 -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, State, OwningProcess
```

### Backend local com erro Prisma P1001

Erro:

```text
P1001: Can't reach database server at localhost:5432
```

Causa comum:

- Postgres local não está rodando;
- container Postgres não está ativo;
- `.env` aponta para banco errado.

Correção recomendada:

```powershell
docker compose up -d postgres
```

### Prisma Client antigo

Sintoma:

```text
Cannot read properties of undefined (reading 'findUnique')
```

Correção:

```powershell
cd C:\Apps\nextfut\backend
npx prisma generate
```

Reiniciar backend depois.

### Frontend não reflete alterações

Se Docker:

```powershell
docker compose exec frontend npm run build
docker compose restart frontend
```

Se local:

```powershell
cd C:\Apps\nextfut\frontend
npm run dev
```

Use `Ctrl + F5` no navegador.

---

## 18. Encerrar ambiente

```powershell
docker compose down
```

---

## 19. Reconstruir ambiente

```powershell
docker compose up -d --build
```
