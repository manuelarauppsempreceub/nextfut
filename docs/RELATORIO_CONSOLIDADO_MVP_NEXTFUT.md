# Relatório Consolidado Atualizado do MVP — NextFut

## 1. Visão geral

O NextFut é uma plataforma MVP para avaliação, desempenho e scouting de atletas de futebol de base.

O sistema permite operar uma jornada completa de demonstração:

1. acesso à homepage pública;
2. consulta de desempenho por código no Portal do Atleta;
3. cadastro público de atletas e olheiros;
4. aprovação administrativa de usuários;
5. importação de atletas e avaliações por CSV;
6. cálculo automatizado de score;
7. gestão de atletas;
8. radar para olheiros;
9. registro e gestão de interesses;
10. administração de usuários e olheiros;
11. reset da base operacional de atletas para novas demonstrações.

---

## 2. Estado de versionamento atual

Últimos commits relevantes:

```text
e4db66b style: aplica novo layout publico da homepage
c4ec77c fix: ajusta navegacao publica do portal do atleta
a2afc72 feat: adiciona listagem administrativa de olheiros
671e95d feat: aprimora importacao reset e gestao de atletas
6fef606 feat: adiciona home publica autenticacao e perfis de usuario
```

Branch local:

```text
master
```

Remote:

```text
origin https://github.com/eduardohirle22/projeto1-eduardo-futebol.git
```

Branch remota de trabalho:

```text
origin/nextfut-mvp-atual
```

---

## 3. Stack atual

- Backend: Node.js + Express
- ORM: Prisma
- Banco: PostgreSQL 16
- Frontend: Vue 3 + Vite
- Cliente HTTP: Axios
- Autenticação: JWT + bcryptjs
- Containerização: Docker Compose
- Versionamento: Git/GitHub

URLs:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health backend | http://localhost:3000/api/health |
| Health banco | http://localhost:3000/api/db-health |

---

## 4. Áreas do sistema

### 4.1 Área pública

Rotas:

```text
/
 /login
 /cadastro/atleta
 /cadastro/olheiro
 /portal-atleta
```

### 4.2 Área autenticada

Rotas:

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

## 5. Homepage pública

A homepage pública foi redesenhada com visual inspirado em versão anterior do projeto.

Características:

- header público com marca NextFut;
- hero com proposta de valor;
- painel “Radar NextFut”;
- área de acesso rápido;
- cards para Portal do Atleta e Login/Dashboard;
- seção “Como usar”;
- footer público.

Arquivos envolvidos:

```text
frontend/src/views/HomeView.vue
frontend/src/components/layout/PublicHeader.vue
frontend/src/components/layout/PublicFooter.vue
```

A homepage usa CSS isolado/scoped para evitar impacto no sistema autenticado.

---

## 6. Autenticação e perfis

O sistema possui autenticação com JWT.

Perfis:

```text
ADMIN
VISITOR
SCOUT
ATHLETE
```

Status de usuário:

```text
PENDING
ACTIVE
INACTIVE
REJECTED
```

Usuário administrador seed:

```text
admin@nextfut.local
Admin@123
```

---

## 7. Cadastro público

### 7.1 Atleta

Rota:

```text
/cadastro/atleta
```

Cria:

- atleta;
- usuário `ATHLETE`;
- status `PENDING`.

O atleta precisa aceitar a visualização dos dados por administradores e olheiros.

### 7.2 Olheiro

Rota:

```text
/cadastro/olheiro
```

Cria:

- usuário `SCOUT`;
- status `PENDING`.

---

## 8. Portal do Atleta

Rota:

```text
/portal-atleta
```

O Portal do Atleta é público.

O atleta consulta o desempenho por código, sem necessidade de login.

Exibe:

- nome;
- posição;
- região;
- código;
- idade;
- score;
- nível;
- potencial;
- pontos fortes;
- pontos a melhorar;
- recomendações;
- data da última avaliação.

O botão final do resultado retorna para a homepage pública.

---

## 9. Dashboard

Rota:

```text
/dashboard
```

Exibe indicadores da plataforma:

- total de atletas;
- total de avaliados;
- total de interesses;
- score médio;
- alto desempenho;
- médio desempenho;
- baixo desempenho.

Inclui:

- gráfico de distribuição por nível;
- gráfico de teia/maturidade;
- últimos atletas;
- últimos interesses.

---

## 10. Atletas

Rota:

```text
/atletas
```

Funcionalidades:

- listagem filtrável;
- busca;
- filtro por posição;
- filtro por região;
- filtro por nível;
- filtro por status;
- default de filtro em atletas ativos;
- paginação;
- ordenação;
- detalhamento em modal;
- cadastro em modal;
- inativação/reativação para administradores;
- acesso ao perfil do atleta.

Status:

```text
ACTIVE
INACTIVE
```

---

## 11. Perfil do Atleta

Rota:

```text
/atletas/:id
```

Funcionalidades:

- visualizar dados cadastrais;
- editar atleta, conforme permissão;
- visualizar métricas;
- criar avaliação, conforme permissão;
- registrar interesse, conforme permissão;
- visualizar histórico de avaliações;
- visualizar pontos fortes, fracos e recomendações.

---

## 12. Importação CSV

Rota:

```text
/importar
```

A importação CSV foi ajustada para bases de captação escolar.

Exemplo de colunas aceitas:

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

- normaliza nomes de colunas;
- aceita colunas em maiúsculas;
- interpreta valores com percentual entre parênteses;
- cria/atualiza atletas;
- cria avaliações;
- calcula performance.

Importante:

- e-mail não é obrigatório para importação operacional;
- e-mail será obrigatório apenas em fluxo futuro de criação automática de usuários atletas.

---

## 13. Radar do Olheiro

Rota:

```text
/olheiro
```

Disponível para:

```text
ADMIN
SCOUT
```

Recursos:

- indicadores de atletas;
- filtros;
- ranking por score;
- acesso ao perfil;
- leitura de pontos fortes e pontos a melhorar.

---

## 14. Interesses

Rota:

```text
/interesses
```

Recursos:

- listagem de interesses;
- busca por atleta, código, olheiro ou e-mail;
- filtro por status;
- atualização de status;
- link para perfil do atleta;
- suporte a filtro por olheiro a partir da tela administrativa de olheiros.

Status:

```text
INTERESTED
CONTACTED
DISCARDED
```

---

## 15. Administração de usuários

Rota:

```text
/admin/usuarios
```

Disponível apenas para:

```text
ADMIN
```

Recursos:

- listar usuários;
- filtrar por status;
- aprovar usuário;
- rejeitar usuário;
- inativar usuário;
- impedir desativação do último administrador ativo;
- reset da base de atletas.

---

## 16. Administração de olheiros

Rota:

```text
/admin/olheiros
```

Disponível apenas para:

```text
ADMIN
```

Recursos:

- listar usuários `SCOUT`;
- buscar por nome/e-mail;
- filtrar por status;
- visualizar quantidade de interesses;
- visualizar último interesse;
- aprovar, rejeitar ou inativar olheiros conforme status;
- navegar para a tela de interesses filtrada pelo olheiro.

---

## 17. Reset administrativo

O reset da base de atletas está disponível na área administrativa.

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

- administradores;
- olheiros;
- estrutura do banco.

---

## 18. Permissões resumidas

### ADMIN

Pode tudo no MVP atual.

### SCOUT

Pode:

- acessar radar;
- visualizar atletas;
- criar avaliações;
- registrar interesses;
- gerenciar interesses.

Não pode:

- administrar usuários;
- importar CSV;
- criar/inativar atletas.

### ATHLETE

Pode:

- consultar portal por código;
- logar, se aprovado;
- editar o próprio cadastro.

Não pode:

- criar avaliações;
- registrar interesses;
- acessar administração.

### VISITOR

Acesso público sem login.

---

## 19. Pontos técnicos de atenção

### Encoding

Usar UTF-8 sem BOM para evitar problemas de acentuação.

### Prisma

Quando alterar schema:

```powershell
docker compose exec backend npx prisma generate
```

ou local:

```powershell
cd C:\Apps\nextfut\backend
npx prisma generate
```

### Frontend em Docker

Após alterações de frontend:

```powershell
docker compose exec frontend npm run build
docker compose restart frontend
```

### Backend em Docker

Após alterações de backend:

```powershell
docker compose restart backend
```

---

## 20. Próximas evoluções

- anonimização completa por perfil;
- criação opcional de usuários atletas na importação CSV;
- modelo de senha temporária;
- recuperação de senha;
- dashboard específico por perfil;
- detalhamento modal de olheiro;
- histórico de ações administrativas;
- mobile responsivo com menu hambúrguer;
- transformação de tabelas em cards no mobile;
- filtros avançados no radar;
- melhoria do Portal do Atleta com layout visual da nova home;
- padronização de design system.

---

## 21. Conclusão

O MVP NextFut encontra-se em um estado demonstrável e operacional.

Ele já possui:

- homepage pública moderna;
- portal público do atleta;
- autenticação;
- perfis;
- gestão administrativa;
- importação robusta;
- scouting;
- interesses;
- reset de demonstração;
- versionamento remoto no GitHub.

O sistema está pronto para demonstrações e para continuidade incremental de funcionalidades.
