# Relatório Consolidado do Estado Atual do MVP — NextFut

## 1. Visão geral

O NextFut é um MVP voltado para cadastro, avaliação e acompanhamento de atletas de futebol, com foco em três públicos principais:

* administradores ou operadores da plataforma;
* atletas que consultam sua evolução por código de acesso;
* olheiros que analisam atletas e registram interesses.

O sistema já possui uma base funcional de cadastro de atletas, importação de dados via CSV, cálculo e exibição de desempenho, portal do atleta, painel do olheiro, gestão de interesses e dashboard operacional.

Até o estado atual, o projeto evoluiu de uma aplicação CRUD simples para um MVP com experiência visual mais próxima de produto, incluindo layout administrativo, dashboard com indicadores, gráficos, listagens filtráveis, modais e paginação.

## 2. Estado de versionamento considerado

O estado funcional consolidado considerado neste relatório é o estado final da **Fase 24 — Refinamento visual do MVP e padronização de layout**.

A tentativa inicial da **Fase 25 — Responsividade e Portal do Atleta** não foi aceita visualmente e deve ser desconsiderada/restaurada.

Antes de avançar para novas regras, perfis de usuários, cadastro de usuários e homepage pública, recomenda-se garantir que o repositório esteja no estado visual aprovado da Fase 24.

Arquivos principais da interface no estado atual:

```text
frontend/src/App.vue
frontend/src/style.css
frontend/src/views/HomeView.vue
frontend/src/views/AthletesView.vue
frontend/src/views/AthleteDetailView.vue
frontend/src/views/AthletePortalView.vue
frontend/src/views/ImportCsvView.vue
frontend/src/views/ScoutDashboardView.vue
frontend/src/views/ScoutInterestsView.vue
```

## 3. Stack atual do MVP

A aplicação está estruturada com frontend, backend e banco de dados integrados via Docker.

### 3.1 Frontend

O frontend utiliza:

```text
Vue 3
Vue Router
Vite
Axios
CSS global próprio
```

O frontend roda em container Docker e é acessado pelo navegador local.

### 3.2 Backend

O backend expõe APIs para:

* atletas;
* avaliações;
* importação CSV;
* dashboard;
* portal do atleta por código de acesso;
* painel do olheiro;
* interesses de olheiros.

### 3.3 Banco de dados

O MVP utiliza PostgreSQL via Docker.

A modelagem já contempla entidades centrais relacionadas a atletas, avaliações e interesses.

## 4. Módulos funcionais existentes

O MVP possui atualmente os seguintes módulos principais:

```text
Dashboard
Portal do Atleta
Atletas
Perfil do Atleta
Importação CSV
Radar do Olheiro
Interesses Registrados
```

## 5. Layout geral da aplicação

A interface atual segue um padrão de sistema administrativo.

A navegação principal está organizada em uma sidebar lateral com acesso para:

* Dashboard;
* Portal do Atleta;
* Atletas;
* Radar do Olheiro;
* Interesses;
* Importar CSV.

A área principal apresenta uma topbar simples e conteúdo centralizado.

O layout foi refinado para ter uma aparência mais próxima de produto, com:

* cards padronizados;
* botões consistentes;
* filtros;
* tabelas;
* modais;
* gráficos;
* paginação;
* estados vazios;
* mensagens de erro e sucesso.

## 6. Dashboard

O dashboard é a tela inicial administrativa da aplicação.

Ele apresenta uma visão geral da plataforma com cabeçalho compacto e indicadores operacionais.

### 6.1 Cabeçalho do dashboard

O cabeçalho atual foi ajustado para evitar aparência excessivamente institucional.

A frase preservada é:

```text
Conectando atletas, avaliações e olheiros.
```

O cabeçalho foi reorganizado para funcionar como uma introdução administrativa da plataforma, com ações rápidas para:

* gerenciar atletas;
* acessar radar do olheiro;
* acessar portal do atleta.

### 6.2 Indicadores da plataforma

O dashboard apresenta cards compactos de indicadores.

Indicadores atuais:

* Atletas;
* Avaliados;
* Interesses;
* Score médio;
* Alto desempenho;
* Médio desempenho;
* Baixo desempenho.

Os cards possuem:

* ícones;
* cores de apoio;
* valores destacados;
* links para telas relacionadas;
* dimensões reduzidas para melhor aproveitamento horizontal.

### 6.3 Links dos indicadores

Os cards do dashboard funcionam como atalhos para telas operacionais.

Exemplos:

* card de atletas direciona para a listagem de atletas;
* card de interesses direciona para interesses registrados;
* cards de desempenho direcionam para listagens filtradas por nível;
* card de score médio direciona para o radar do olheiro.

### 6.4 Gráficos

O dashboard inclui gráficos sem dependências externas.

Gráficos implementados:

* gráfico de distribuição por nível;
* gráfico de teia para visão de maturidade/indicadores da plataforma.

Os gráficos são implementados com HTML/CSS e dados já disponíveis na aplicação.

## 7. Cadastro e listagem de atletas

A tela de atletas é um dos módulos centrais do MVP.

Ela permite visualizar a base de atletas cadastrados, filtrar registros, ordenar informações e acessar ações operacionais.

### 7.1 Recursos da listagem

A listagem de atletas possui:

* busca textual;
* filtro por posição;
* filtro por região;
* filtro por nível;
* ordenação por colunas;
* ações compactas alinhadas à direita;
* botão para detalhamento;
* botão para edição/avaliação;
* rodapé com total de registros;
* paginação.

### 7.2 Cadastro rápido

O cadastro de novo atleta pode ser realizado em modal.

Campos principais:

* nome;
* idade;
* posição;
* pé dominante;
* altura;
* país;
* região;
* escola ou projeto.

### 7.3 Detalhamento rápido

A listagem permite abrir um modal de detalhamento rápido do atleta, sem sair da tela.

Esse modal apresenta:

* nome;
* código de acesso;
* idade;
* altura;
* score;
* nível;
* pontos fortes;
* pontos a melhorar.

### 7.4 Integração com perfil completo

A partir da listagem, o usuário pode abrir o perfil completo do atleta para edição, avaliação e visualização histórica.

## 8. Perfil do atleta

O perfil do atleta concentra informações detalhadas do jogador.

### 8.1 Dados cadastrais

O perfil exibe os principais dados do atleta:

* nome;
* idade;
* posição;
* pé dominante;
* altura;
* país;
* região;
* escola ou projeto;
* código de acesso.

### 8.2 Edição cadastral

A edição dos dados cadastrais é feita por modal.

Isso evita que a tela principal fique poluída e segue o padrão visual adotado na Fase 24.

### 8.3 Avaliações

O perfil permite cadastrar avaliações manuais.

A avaliação contempla indicadores técnicos, físicos e estatísticos.

Entre os dados avaliáveis estão:

* condição física;
* controle de bola;
* passe;
* finalização;
* drible;
* tomada de decisão;
* disciplina;
* gols;
* assistências;
* passes certos;
* passes errados;
* desarmes;
* faltas;
* finalizações no alvo;
* minutos jogados;
* jogos;
* dribles certos;
* duelos vencidos;
* recuperações;
* nota final;
* potencial.

### 8.4 Resultado de desempenho

A avaliação gera ou apresenta informações de desempenho como:

* score;
* nível calculado;
* pontos fortes;
* pontos fracos;
* recomendações.

### 8.5 Histórico de avaliações

O perfil mostra o histórico de avaliações do atleta, permitindo acompanhar sua evolução.

## 9. Portal do Atleta

O Portal do Atleta é uma área pública ou semi-pública onde o atleta pode consultar seu desempenho usando um código de acesso.

### 9.1 Consulta por código

O atleta informa seu código de acesso para consultar seus dados.

O código de acesso é uma chave funcional importante do MVP.

### 9.2 Informações exibidas

Quando o atleta é encontrado, o portal exibe:

* nome;
* posição;
* região;
* código de acesso;
* score atual;
* nível;
* pontos fortes;
* pontos a melhorar;
* recomendações de treino;
* histórico de avaliações, quando disponível.

### 9.3 Estados do portal

O portal contempla estados como:

* aguardando código;
* carregando consulta;
* atleta encontrado;
* código inexistente ou erro;
* atleta sem avaliação.

### 9.4 Situação visual atual

O portal existe e funciona, mas ainda é um dos candidatos principais para refinamento futuro, principalmente porque a tentativa inicial de responsividade da Fase 25 não foi aprovada visualmente.

## 10. Importação CSV

A aplicação possui tela de importação CSV.

### 10.1 Objetivo

Permitir importação de atletas e avaliações a partir de arquivos CSV.

### 10.2 Funcionalidades

A tela permite:

* selecionar arquivo;
* enviar para processamento;
* visualizar resultado da importação;
* visualizar erros;
* visualizar colunas identificadas;
* pré-visualizar dados importados.

### 10.3 Situação atual

A importação já é funcional e integrada ao backend.

Ainda pode evoluir visualmente e operacionalmente nas próximas fases, principalmente com validações guiadas, modelo de arquivo e mensagens mais amigáveis.

## 11. Radar do Olheiro

O Radar do Olheiro é uma tela voltada para análise e seleção de atletas.

### 11.1 Objetivo

Permitir que olheiros filtrem e analisem atletas por critérios de desempenho e cadastro.

### 11.2 Recursos

A tela possui:

* cards de resumo;
* total de atletas;
* score médio;
* contagem por nível de desempenho;
* busca por nome ou código;
* filtro por posição;
* filtro por região;
* filtro por nível;
* listagem ranqueada por score;
* cards compactos de atletas;
* botão para abrir perfil;
* paginação.

### 11.3 Informações exibidas nos cards

Cada card do radar pode apresentar:

* código de acesso;
* nome do atleta;
* posição;
* região;
* score;
* nível;
* pontos fortes;
* pontos a melhorar;
* ação para abrir o perfil.

### 11.4 Situação atual

A tela foi visualmente refinada na Fase 24, com redução de espaçamentos e melhor aproveitamento da área.

Ainda poderá evoluir futuramente com visão comparativa, favoritos, observações do olheiro e filtros mais avançados.

## 12. Interesses registrados

O módulo de interesses permite acompanhar manifestações de interesse de olheiros por atletas.

### 12.1 Objetivo

Registrar e gerenciar o interesse de olheiros em atletas específicos.

### 12.2 Dados do interesse

Um interesse contempla:

* atleta;
* olheiro;
* e-mail do olheiro;
* status;
* data de registro;
* observações.

### 12.3 Status atuais

Os status tratados atualmente são:

```text
INTERESTED
CONTACTED
DISCARDED
```

Na interface, são apresentados como:

* Interessado;
* Contatado;
* Descartado.

### 12.4 Recursos da tela

A tela de interesses possui:

* busca por atleta, código, olheiro ou e-mail;
* filtro por status;
* cards compactos;
* atualização de status;
* botão para abrir perfil do atleta;
* paginação;
* rodapé com total de registros.

### 12.5 Situação atual

A tela foi otimizada visualmente na Fase 24 para melhor aproveitamento de espaço.

Ainda poderá evoluir com regras de permissão, histórico de contato, vínculo com usuários e notificações.

## 13. Modais

A aplicação passou a utilizar modais em operações importantes.

Fluxos com modal:

* novo atleta;
* detalhamento rápido do atleta;
* edição cadastral;
* nova avaliação.

Esse padrão melhora a experiência operacional e evita navegação excessiva.

## 14. Paginação

As listagens principais passaram a contar com paginação.

Aplicada em:

* Atletas;
* Radar do Olheiro;
* Interesses registrados.

A paginação melhora o uso da aplicação quando houver volume maior de dados.

## 15. CSS global e padronização visual

O arquivo global de estilos concentra os padrões visuais do MVP.

Foram padronizados:

* layout principal;
* sidebar;
* topbar;
* cards;
* indicadores;
* botões;
* badges;
* filtros;
* tabelas;
* cards de listagem;
* modais;
* gráficos;
* paginação;
* mensagens;
* estados vazios.

O sistema atualmente usa CSS global simples, sem biblioteca visual externa.

## 16. Estado atual de responsividade

A aplicação possui algum nível de responsividade herdado dos ajustes visuais da Fase 24.

Porém, a responsividade mobile completa ainda não está aprovada.

A tentativa inicial de Fase 25 incluiu:

* menu mobile;
* transformação de tabelas em cards;
* refinamento do portal;
* ajustes mobile globais.

Mas o resultado visual não foi aceito e deve ser refeito de forma mais cuidadosa em fase futura.

## 17. Limitações atuais

O MVP ainda não possui, até o estado atual:

* autenticação real de usuários;
* perfis de acesso;
* cadastro de usuários;
* tela pública inicial no formato homepage;
* separação clara entre área pública e área administrativa;
* controle de permissões;
* login;
* logout;
* área autenticada;
* trilha de auditoria;
* vínculo entre interesses e usuários reais;
* vínculo entre atleta e usuário;
* gestão de senha;
* recuperação de senha;
* dashboard por perfil;
* regras específicas para administrador, avaliador, olheiro ou atleta.

Esses pontos foram identificados como próximos passos necessários.

## 18. Próxima evolução prevista

A próxima evolução deverá alterar regras do MVP e não apenas layout.

Os temas previstos são:

* criação de perfis de usuários;
* cadastro e gestão de usuários;
* autenticação;
* tela inicial pública no formato homepage;
* separação entre homepage pública e área administrativa;
* definição de permissões;
* possível remodelagem de navegação;
* ajustes nas regras de acesso ao portal do atleta;
* possível vínculo de olheiro com usuário real;
* possível vínculo de atleta com usuário real ou código de acesso.

## 19. Perfis candidatos para discussão

Ainda sem regra fechada, os perfis candidatos para a próxima etapa podem incluir:

```text
ADMIN
AVALIADOR
OLHEIRO
ATLETA
```

Possíveis responsabilidades:

### ADMIN

* gerenciar usuários;
* gerenciar atletas;
* importar CSV;
* visualizar dashboard completo;
* acessar interesses;
* configurar dados gerais.

### AVALIADOR

* cadastrar atletas;
* editar atletas;
* cadastrar avaliações;
* visualizar perfis.

### OLHEIRO

* acessar radar;
* visualizar atletas;
* registrar interesse;
* acompanhar seus interesses.

### ATLETA

* acessar seu próprio portal;
* visualizar suas avaliações;
* acompanhar evolução.

Esses perfis ainda precisam ser validados antes da implementação.

## 20. Pontos de atenção antes da próxima fase

Antes de implementar perfis e usuários, é importante decidir:

* se haverá login obrigatório para todos;
* se o Portal do Atleta continuará acessível apenas por código;
* se atleta terá usuário e senha;
* se olheiro poderá se cadastrar sozinho;
* se cadastro de usuários será apenas pelo administrador;
* quais telas cada perfil poderá acessar;
* quais ações cada perfil poderá executar;
* se o dashboard será diferente por perfil;
* se a homepage pública ficará fora da área administrativa;
* se a sidebar atual será exibida apenas após login;
* se haverá página inicial pública com botões como “Sou atleta”, “Sou olheiro” e “Área administrativa”.

## 21. Sugestão de nova estrutura de navegação

Com a introdução de usuários, a aplicação pode passar a ter duas áreas:

### Área pública

```text
/
```

Com homepage institucional do MVP.

Possíveis chamadas:

* Conheça o NextFut;
* Sou atleta;
* Sou olheiro;
* Entrar;
* Consultar código de atleta.

### Área autenticada

```text
/app
/app/dashboard
/app/atletas
/app/olheiro
/app/interesses
/app/importar
/app/usuarios
```

A sidebar administrativa ficaria restrita à área autenticada.

## 22. Sugestão de homepage pública

A homepage pública do MVP pode apresentar:

* proposta de valor;
* chamada para atletas;
* chamada para olheiros;
* chamada para avaliadores;
* botão de login;
* botão de consulta do atleta;
* resumo de como funciona;
* seção com benefícios;
* rodapé simples.

Essa homepage ajudará a separar a experiência pública da experiência administrativa.

## 23. Sugestão de preparação técnica

Antes de codificar a próxima fase, recomenda-se levantar os arquivos atuais de:

```text
backend/src
backend/prisma/schema.prisma
frontend/src/router/index.js
frontend/src/App.vue
frontend/src/views
frontend/src/services
```

Também será importante verificar:

* modelos existentes no Prisma;
* rotas atuais do backend;
* serviços existentes de API;
* padrão atual de seed;
* estrutura atual do Docker;
* endpoints já disponíveis;
* se já existe algum modelo de usuário ou autenticação.

## 24. Estado final do MVP neste momento

O MVP NextFut, no estado atual, pode ser resumido como:

```text
Sistema funcional de cadastro, avaliação, importação e scouting de atletas,
com dashboard administrativo, portal por código de acesso, radar de olheiro,
gestão de interesses e layout visual refinado, mas ainda sem autenticação,
sem perfis de usuários e sem homepage pública separada da área administrativa.
```

## 25. Conclusão

O MVP atingiu um ponto importante de maturidade funcional e visual.

A Fase 24 consolidou a experiência administrativa e deixou a aplicação mais próxima de um produto utilizável.

A próxima fase deve deixar de ser apenas visual e passar a tratar regras estruturais da plataforma, especialmente:

* usuários;
* perfis;
* permissões;
* homepage pública;
* autenticação;
* separação entre área pública e área administrativa.

Essas decisões afetarão backend, frontend, rotas, navegação e possivelmente o modelo de dados.

Por isso, antes da implementação, é recomendável detalhar as regras de acesso e os perfis esperados.
