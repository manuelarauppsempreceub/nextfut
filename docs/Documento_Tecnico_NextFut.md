# Documento Técnico — NextFut

## 1. Visão geral

O NextFut é uma plataforma MVP para avaliação, desempenho e scouting de atletas de futebol de base.

O objetivo do sistema é conectar atletas, olheiros e administradores em uma experiência simples, visual e operacional, permitindo:

- cadastro e gestão de atletas;
- importação de bases CSV de captação escolar;
- registro de avaliações;
- cálculo automático de score de desempenho;
- consulta pública do desempenho pelo Portal do Atleta;
- radar de atletas para olheiros;
- registro e gestão de interesses;
- gestão de usuários por perfil;
- aprovação administrativa de cadastros;
- ferramentas de demonstração, incluindo reset da base de atletas.

---

## 2. Stack técnica

- Backend: Node.js + Express
- ORM: Prisma
- Banco: PostgreSQL 16
- Frontend: Vue 3 + Vite
- Roteamento frontend: Vue Router
- Cliente HTTP: Axios
- Autenticação: JWT + bcryptjs
- Ambiente principal: Docker Compose
- Ambiente local de desenvolvimento: Windows + PowerShell
- Versionamento: Git
- Repositório remoto configurado: GitHub

URLs locais padrão:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health backend | http://localhost:3000/api/health |
| Health banco | http://localhost:3000/api/db-health |

---

## 3. Estrutura principal do projeto

```text
nextfut/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.js
    src/
      database/
      routes/
      services/
    Dockerfile
    package.json
  frontend/
    src/
      components/
        layout/
      router/
      services/
      views/
    Dockerfile
    package.json
  docs/
  infra/
  docker-compose.yml
  README.md
```

---

## 4. Arquitetura funcional

O sistema está dividido em duas áreas principais.

### 4.1 Área pública

Rotas públicas:

```text
/
 /login
 /cadastro/atleta
 /cadastro/olheiro
 /portal-atleta
```

A área pública contempla:

- homepage institucional;
- login;
- cadastro público de atletas;
- cadastro público de olheiros;
- Portal do Atleta por código de acesso.

### 4.2 Área autenticada

Rotas autenticadas:

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

A área autenticada possui layout administrativo com sidebar e topbar.

---

## 5. Perfis de usuário

O sistema trabalha com quatro perfis:

```text
ADMIN
VISITOR
SCOUT
ATHLETE
```

### 5.1 ADMIN

Pode:

- acessar dashboard;
- cadastrar, editar, inativar e reativar atletas;
- importar CSV;
- criar avaliações;
- registrar e gerenciar interesses;
- aprovar, rejeitar, inativar e reativar usuários;
- visualizar listagem administrativa de usuários;
- visualizar listagem administrativa de olheiros;
- zerar a base operacional de atletas para demonstração.

### 5.2 SCOUT

Pode:

- acessar radar do olheiro;
- visualizar atletas;
- abrir perfis;
- registrar interesses;
- atualizar status de interesses;
- criar avaliações, conforme regra atual.

Não pode:

- acessar painel de usuários;
- acessar listagem administrativa de olheiros;
- importar CSV;
- criar ou inativar atletas.

### 5.3 ATHLETE

Pode:

- acessar o ambiente autenticado após aprovação;
- editar apenas o próprio cadastro;
- consultar desempenho pelo Portal do Atleta usando código de acesso.

Não pode:

- criar avaliação;
- registrar interesse;
- importar CSV;
- acessar telas administrativas;
- editar outros atletas.

### 5.4 VISITOR

No estado atual, o visitante é tratado como acesso público sem login.

Pode:

- acessar a homepage;
- acessar login;
- acessar cadastro público;
- consultar desempenho no Portal do Atleta por código.

---

## 6. Status de usuário

O model de usuários utiliza status:

```text
PENDING
ACTIVE
INACTIVE
REJECTED
```

Fluxo básico:

1. Atleta ou olheiro se cadastra publicamente.
2. O usuário é criado como `PENDING`.
3. Administrador avalia na tela `/admin/usuarios`.
4. Administrador aprova, rejeita ou inativa.
5. Somente usuários `ACTIVE` conseguem logar.

---

## 7. Modelos principais do Prisma

### 7.1 User

Representa o usuário autenticável.

Campos principais:

- `name`
- `email`
- `passwordHash`
- `role`
- `status`
- `athleteId`
- `scoutName`
- `scoutEmail`

Relações:

- usuário atleta pode estar vinculado a um registro `Athlete`.

### 7.2 Athlete

Representa atleta cadastrado/importado.

Campos principais:

- `accessCode`
- `name`
- `birthDate`
- `age`
- `position`
- `dominantFoot`
- `heightCm`
- `country`
- `region`
- `schoolProject`
- `status`
- `consentDataVisibility`

Status:

```text
ACTIVE
INACTIVE
```

### 7.3 Evaluator

Representa avaliadores de avaliações.

### 7.4 Evaluation

Representa uma avaliação manual ou importada por CSV.

Fonte:

```text
MANUAL
CSV_IMPORT
API
```

### 7.5 PerformanceResult

Representa o resultado calculado de uma avaliação.

Campos principais:

- `performanceScore`
- `calculatedLevel`
- `passAccuracyRate`
- `offensiveEfficiency`
- `disciplinaryIndex`
- `averageTechnicalScore`
- `strengths`
- `weaknesses`
- `recommendations`

### 7.6 ScoutInterest

Representa interesse de olheiro por atleta.

Status:

```text
INTERESTED
CONTACTED
DISCARDED
```

---

## 8. Autenticação e autorização

### 8.1 Login

Endpoint:

```text
POST /api/auth/login
```

Recebe:

```json
{
  "email": "admin@nextfut.local",
  "password": "Admin@123"
}
```

Retorna:

- token JWT;
- dados públicos do usuário.

### 8.2 Sessão no frontend

O frontend armazena:

```text
nextfut.token
nextfut.user
```

em `localStorage`.

### 8.3 Middleware de autenticação

O backend utiliza:

- `requireAuth`
- `requireRoles(...)`

Esses middlewares validam token, usuário ativo e perfil permitido.

---

## 9. Seed inicial

O seed cria um administrador inicial:

```text
E-mail: admin@nextfut.local
Senha: Admin@123
Perfil: ADMIN
Status: ACTIVE
```

Também mantém dados de demonstração iniciais de avaliador/atleta quando aplicável.

---

## 10. Homepage pública

A homepage pública foi redesenhada com layout visual inspirado em versão anterior do sistema.

Componentes utilizados:

```text
frontend/src/views/HomeView.vue
frontend/src/components/layout/PublicHeader.vue
frontend/src/components/layout/PublicFooter.vue
```

A homepage inclui:

- hero institucional;
- painel visual “Radar NextFut”;
- acesso rápido ao Portal do Atleta;
- acesso ao Login;
- cadastro de atleta;
- cadastro de olheiro;
- seção “Como usar”.

O CSS da homepage foi isolado em escopo de componentes para evitar impacto no layout administrativo.

---

## 11. Portal do Atleta

Rota:

```text
/portal-atleta
```

O Portal do Atleta é público e não exige login.

Fluxo:

1. atleta informa o código de acesso, por exemplo `NF-0001`;
2. sistema busca o atleta;
3. sistema exibe score, nível, potencial, pontos fortes, pontos a melhorar e recomendações;
4. botão de retorno leva para a homepage pública.

Esse fluxo é importante porque atletas importados por CSV podem não possuir usuário/senha.

---

## 12. Importação CSV

A importação CSV permite carregar bases operacionais de captação escolar.

Endpoint:

```text
POST /api/import/csv
```

Tela:

```text
/importar
```

A importação atual aceita colunas como:

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
TOTAL_MINUTOS_JOGADOS
GOLS
ASSISTENCIAS
PASSES_CERTOS_PCT
CHUTES_CERTOS_POR_JOGO
DRIBBLES_CERTOS_POR_JOGO
DISPUTAS_BOLA_VENCIDAS_POR_JOGO
BOLAS_RECUPERADAS_POR_JOGO
FALTAS_POR_JOGO
CARTAO_AMARELO
CARTAO_VERMELHO
```

A importação:

- cria ou atualiza atletas;
- cria avaliações;
- calcula resultados de desempenho;
- interpreta campos percentuais como `10.0 (70%)`;
- não exige e-mail quando a importação é operacional;
- não cria automaticamente usuários atletas.

Regra recomendada:

- e-mail é obrigatório para criar usuário atleta;
- e-mail não é obrigatório para importação operacional de base de captação.

---

## 13. Gestão de atletas

A tela `/atletas` possui:

- busca;
- filtro por posição;
- filtro por região;
- filtro por nível;
- filtro por status;
- paginação;
- ordenação;
- detalhamento em modal;
- cadastro de atleta em modal;
- inativação e reativação para administradores.

Por padrão, a listagem carrega atletas ativos.

Status disponíveis:

```text
ACTIVE
INACTIVE
ALL
```

---

## 14. Perfil do atleta

A rota `/atletas/:id` exibe perfil detalhado.

Recursos:

- dados cadastrais;
- edição cadastral;
- métricas principais;
- pontos fortes;
- pontos fracos;
- recomendações;
- criação de avaliação;
- registro de interesse;
- histórico de avaliações.

As ações são condicionadas por perfil.

---

## 15. Radar do Olheiro

Rota:

```text
/olheiro
```

Permite:

- visualizar total de atletas;
- score médio;
- distribuição por nível;
- filtros por nome, posição, região e nível;
- cards ranqueados por score;
- acesso ao perfil do atleta.

Disponível para:

```text
ADMIN
SCOUT
```

---

## 16. Interesses

Rota:

```text
/interesses
```

Permite:

- listar interesses registrados;
- buscar por atleta, código, olheiro ou e-mail;
- filtrar por status;
- atualizar status;
- acessar perfil do atleta;
- paginar resultados.

Status:

```text
INTERESTED
CONTACTED
DISCARDED
```

---

## 17. Gestão administrativa de usuários

Rota:

```text
/admin/usuarios
```

Disponível apenas para `ADMIN`.

Funcionalidades:

- listar usuários;
- filtrar por status;
- aprovar usuários pendentes;
- rejeitar usuários pendentes;
- inativar usuários ativos;
- preservar último administrador ativo;
- zerar base operacional de atletas para demonstração.

---

## 18. Gestão administrativa de olheiros

Rota:

```text
/admin/olheiros
```

Disponível apenas para `ADMIN`.

Funcionalidades:

- listar usuários do perfil `SCOUT`;
- buscar por nome/e-mail;
- filtrar por status;
- visualizar quantidade de interesses registrados;
- visualizar último interesse;
- ativar/inativar/rejeitar conforme status;
- navegar para interesses do olheiro.

---

## 19. Reset administrativo da base de atletas

O sistema possui ação administrativa para zerar a base operacional de atletas.

Endpoint:

```text
POST /api/admin/reset-athletes
```

Confirmação exigida:

```text
ZERAR ATLETAS
```

Remove:

- interesses;
- resultados de performance;
- avaliações;
- usuários atletas;
- atletas.

Preserva:

- usuários administradores;
- usuários olheiros;
- estrutura do banco;
- migrations.

Uso recomendado:

- demonstrações;
- reimportação de bases;
- reset operacional controlado.

---

## 20. Git e branch remota

O repositório local usa branch:

```text
master
```

Remote configurado:

```text
origin https://github.com/eduardohirle22/projeto1-eduardo-futebol.git
```

Branch remota de trabalho:

```text
origin/nextfut-mvp-atual
```

Comandos usuais:

```powershell
git status
git pull
git push
```

---

## 21. Próximas evoluções sugeridas

- anonimização mais rigorosa por perfil;
- respostas de API específicas por perfil;
- relatório detalhado por atleta;
- importação com opção de criação automática de usuários atletas;
- geração de senha temporária;
- recuperação de senha;
- dashboard por perfil;
- auditoria de ações administrativas;
- responsividade mobile completa com menu hambúrguer;
- transformação de tabelas em cards no mobile;
- filtros avançados no radar do olheiro;
- detalhamento em modal para olheiros e interesses;
- padronização final de design system.

---

## 22. Conclusão

O NextFut evoluiu de um MVP de cadastro e avaliação para uma aplicação com:

- área pública;
- login;
- perfis de usuário;
- gestão administrativa;
- importação robusta;
- scouting;
- portal público do atleta;
- ferramentas de demonstração;
- integração com GitHub.

O sistema já está apto a demonstrações funcionais completas e possui base técnica para evolução incremental.
