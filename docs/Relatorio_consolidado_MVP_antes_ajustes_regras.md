# Relatório Consolidado do Estado do MVP antes dos Ajustes de Regras — NextFut

> Documento histórico preservado.
>
> Este relatório representa o estado do MVP antes da implementação de homepage pública, autenticação, perfis de usuário, gestão administrativa, importação escolar ampliada, reset da base e nova homepage pública.
>
> Para o estado atual do MVP, consultar:
>
> - `RELATORIO_CONSOLIDADO_MVP_NEXTFUT.md`
> - `Documento_Tecnico_NextFut.md`
> - `OPERACAO_LOCAL.md`

## 1. Contexto histórico

Antes dos ajustes estruturais recentes, o NextFut já possuía uma base funcional de cadastro, avaliação, importação CSV, portal por código, radar de olheiro, interesses e dashboard.

Entretanto, ainda não possuía:

- autenticação real;
- perfis de usuário;
- cadastro público de atleta;
- cadastro público de olheiro;
- homepage pública separada;
- aprovação administrativa de usuários;
- listagem administrativa de olheiros;
- reset administrativo da base de atletas;
- importação adaptada à base escolar real;
- portal do atleta explicitamente público;
- GitHub remoto configurado.

## 2. Funcionalidades existentes naquele momento

O sistema já possuía:

- dashboard;
- portal do atleta por código;
- atletas;
- perfil do atleta;
- importação CSV inicial;
- radar do olheiro;
- interesses registrados;
- layout administrativo refinado;
- cards, filtros, modais e paginação.

## 3. Limitações naquele momento

As principais limitações eram:

- área pública e área administrativa ainda misturadas;
- dashboard ocupando a rota inicial `/`;
- ausência de login;
- ausência de controle de permissões;
- ausência de usuários;
- ausência de perfis;
- ausência de aprovação de cadastros;
- ausência de ferramenta de reset para demonstração;
- importação CSV sensível aos nomes exatos das colunas;
- inexistência de gestão administrativa de olheiros.

## 4. Evolução posterior

Após este estado, o MVP evoluiu com:

- homepage pública moderna;
- login;
- JWT;
- bcryptjs;
- perfis `ADMIN`, `VISITOR`, `SCOUT`, `ATHLETE`;
- status de usuário;
- cadastro público de atleta;
- cadastro público de olheiro;
- aprovação administrativa;
- dashboard autenticado em `/dashboard`;
- Portal do Atleta público em `/portal-atleta`;
- importação de base escolar com `NOME_JOGADOR`;
- reset administrativo da base;
- listagem administrativa de olheiros;
- nova homepage baseada em layout anterior aprovado;
- repositório remoto no GitHub.

## 5. Referência atual

Estado atual de referência:

```text
Branch local: master
Branch remota: origin/nextfut-mvp-atual
Remote: https://github.com/eduardohirle22/projeto1-eduardo-futebol.git
```

Últimos commits relevantes:

```text
e4db66b style: aplica novo layout publico da homepage
c4ec77c fix: ajusta navegacao publica do portal do atleta
a2afc72 feat: adiciona listagem administrativa de olheiros
671e95d feat: aprimora importacao reset e gestao de atletas
6fef606 feat: adiciona home publica autenticacao e perfis de usuario
```

## 6. Conclusão

Este documento deve ser mantido apenas como memória histórica do estado anterior aos ajustes de regras.

A documentação operacional e técnica atualizada está nos demais documentos do pacote.
