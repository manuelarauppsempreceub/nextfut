<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const summary = ref(null);
const loading = ref(true);
const error = ref("");

async function loadSummary() {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get("/dashboard/summary");
    summary.value = response.data;
  } catch (err) {
    error.value = "Não foi possível carregar o resumo da plataforma.";
  } finally {
    loading.value = false;
  }
}

function latestPerformance(athlete) {
  return athlete.evaluations?.[0]?.performanceResult || null;
}

function levelLabel(level) {
  const labels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto"
  };

  return labels[level] || level || "-";
}

function statusLabel(status) {
  const labels = {
    INTERESTED: "Interessado",
    CONTACTED: "Contatado",
    DISCARDED: "Descartado"
  };

  return labels[status] || status || "-";
}

const latestAthletes = computed(() => summary.value?.latestAthletes || []);
const latestInterests = computed(() => summary.value?.latestInterests || []);

onMounted(loadSummary);
</script>

<template>
  <section class="hero dashboard-home">
    <div>
      <p class="eyebrow">Plataforma NextFut</p>
      <h1>Conectando atletas, avaliações e olheiros.</h1>
      <p>
        MVP para cadastro, importação e análise de desempenho de jogadores de futebol.
      </p>

      <div class="hero-actions">
        <RouterLink class="button" to="/portal-atleta">
          Sou atleta
        </RouterLink>

        <RouterLink class="button secondary" to="/olheiro">
          Sou olheiro
        </RouterLink>

        <RouterLink class="button secondary" to="/interesses">
          Ver interesses
        </RouterLink>

        <RouterLink class="button secondary" to="/importar">
          Importar CSV
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="home-dashboard">
    <div class="page-header compact-header">
      <div>
        <p class="eyebrow">Resumo</p>
        <h2>Indicadores da plataforma</h2>
      </div>

      <button class="button secondary" @click="loadSummary">
        Atualizar
      </button>
    </div>

    <p v-if="loading">Carregando indicadores...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="summary">
      <div class="summary-grid">
        <article class="summary-card">
          <span>Atletas</span>
          <strong>{{ summary.totals.athletes }}</strong>
        </article>

        <article class="summary-card">
          <span>Avaliações</span>
          <strong>{{ summary.totals.evaluations }}</strong>
        </article>

        <article class="summary-card">
          <span>Interesses</span>
          <strong>{{ summary.totals.interests }}</strong>
        </article>

        <article class="summary-card">
          <span>Score médio</span>
          <strong>{{ summary.totals.averageScore ?? "-" }}</strong>
        </article>

        <article class="summary-card">
          <span>Alto desempenho</span>
          <strong>{{ summary.athletesByLevel.HIGH }}</strong>
        </article>

        <article class="summary-card">
          <span>Médio desempenho</span>
          <strong>{{ summary.athletesByLevel.MEDIUM }}</strong>
        </article>

        <article class="summary-card">
          <span>Baixo desempenho</span>
          <strong>{{ summary.athletesByLevel.LOW }}</strong>
        </article>
      </div>

      <div class="home-columns">
        <section class="profile-panel">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">Recentes</p>
              <h2>Últimos atletas</h2>
            </div>

            <RouterLink to="/atletas" class="text-link">
              Ver todos
            </RouterLink>
          </div>

          <div v-if="!latestAthletes.length" class="empty">
            Nenhum atleta cadastrado.
          </div>

          <article v-for="athlete in latestAthletes" :key="athlete.id" class="mini-list-card">
            <div>
              <strong>{{ athlete.name }}</strong>
              <p>{{ athlete.position || "Sem posição" }} · {{ athlete.accessCode }}</p>
            </div>

            <div class="mini-score">
              <span>{{ latestPerformance(athlete)?.performanceScore ?? "-" }}</span>
              <small>{{ levelLabel(latestPerformance(athlete)?.calculatedLevel) }}</small>
            </div>
          </article>
        </section>

        <section class="profile-panel">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">Olheiros</p>
              <h2>Últimos interesses</h2>
            </div>

            <RouterLink to="/interesses" class="text-link">
              Ver todos
            </RouterLink>
          </div>

          <div v-if="!latestInterests.length" class="empty">
            Nenhum interesse registrado.
          </div>

          <article v-for="interest in latestInterests" :key="interest.id" class="mini-list-card">
            <div>
              <strong>{{ interest.athlete?.name || "Atleta não informado" }}</strong>
              <p>{{ interest.scoutName }} · {{ statusLabel(interest.status) }}</p>
            </div>

            <RouterLink
              v-if="interest.athlete?.id"
              :to="`/atletas/${interest.athlete.id}`"
              class="text-link"
            >
              Perfil
            </RouterLink>
          </article>
        </section>
      </div>
    </template>
  </section>
</template>
