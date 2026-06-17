<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="public-page">
    <header class="public-header">
      <RouterLink class="public-brand" to="/">
        <span class="brand-mark">NF</span>
        <span>
          <strong>NextFut</strong>
          <small>Conectando atletas, avaliações e olheiros.</small>
        </span>
      </RouterLink>

      <nav class="public-nav">
        <RouterLink to="/portal-atleta">Portal do Atleta</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink class="button compact" to="/cadastro/atleta">Cadastro de Atleta</RouterLink>
        <RouterLink class="button secondary compact" to="/cadastro/olheiro">Cadastro de Olheiro</RouterLink>
      </nav>
    </header>

    <section class="public-hero">
      <div class="public-hero-content">
        <p class="eyebrow">MVP NextFut</p>
        <h1>Uma ponte entre atletas de base, avaliações e olheiros.</h1>
        <p>
          O NextFut organiza informações de atletas, avaliações de desempenho,
          indicadores técnicos e interesses de olheiros em uma plataforma simples
          para apoiar processos de captação no futebol de base.
        </p>

        <div class="public-actions">
          <RouterLink class="button" to="/portal-atleta">Consultar desempenho</RouterLink>
          <RouterLink class="button secondary" to="/cadastro/atleta">Sou Atleta</RouterLink>
          <RouterLink class="button secondary" to="/cadastro/olheiro">Sou Olheiro</RouterLink>
          <RouterLink class="text-link" to="/login">Já tenho acesso</RouterLink>
        </div>
      </div>

      <div class="public-hero-card">
        <span class="hero-kicker">Scouting MVP</span>
        <strong>Dados, performance e oportunidades no mesmo fluxo.</strong>
        <ul>
          <li>Cadastro de atletas de base</li>
          <li>Avaliações técnicas e indicadores</li>
          <li>Registro de interesse por olheiros</li>
          <li>Acesso controlado por perfil</li>
        </ul>
      </div>
    </section>

    <section class="public-section">
      <div>
        <p class="eyebrow">Perfis</p>
        <h2>Como cada usuário participa</h2>
      </div>

      <div class="public-card-grid">
        <article class="public-info-card">
          <h3>Atleta</h3>
          <p>
            Pode acessar suas próprias informações e manter seu cadastro atualizado.
            Os dados ficam disponíveis para administradores e olheiros autorizados.
          </p>
        </article>

        <article class="public-info-card">
          <h3>Olheiro</h3>
          <p>
            Pode consultar atletas, analisar indicadores e registrar interesse em
            perfis compatíveis com sua busca.
          </p>
        </article>

        <article class="public-info-card">
          <h3>Visitante</h3>
          <p>
            Visualiza informações básicas da plataforma, sem permissão para cadastrar,
            editar ou acessar dados sensíveis.
          </p>
        </article>

        <article class="public-info-card">
          <h3>Administrador</h3>
          <p>
            Gerencia cadastros, usuários, avaliações, importações, aprovações e regras
            gerais da plataforma.
          </p>
        </article>
      </div>
    </section>
  </main>
</template>