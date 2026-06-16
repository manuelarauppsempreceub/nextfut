<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const summary = ref(null);
const athletes = ref([]);
const loading = ref(true);
const error = ref("");

async function loadSummary() {
  try {
    loading.value = true;
    error.value = "";

    const [summaryResponse, athletesResponse] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get("/athletes")
    ]);

    summary.value = summaryResponse.data;
    athletes.value = athletesResponse.data;
  } catch (err) {
    error.value = "Não foi possível carregar o resumo da plataforma.";
  } finally {
    loading.value = false;
  }
}

function latestEvaluation(athlete) {
  return athlete.evaluations?.[0] || null;
}

function latestPerformance(athlete) {
  return latestEvaluation(athlete)?.performanceResult || null;
}

function levelOf(athlete) {
  return latestPerformance(athlete)?.calculatedLevel || latestEvaluation(athlete)?.level || "";
}

function levelLabel(level) {
  const labels = { LOW: "Baixo", MEDIUM: "Médio", HIGH: "Alto" };
  return labels[level] || level || "-";
}

function statusLabel(status) {
  const labels = { INTERESTED: "Interessado", CONTACTED: "Contatado", DISCARDED: "Descartado" };
  return labels[status] || status || "-";
}

const latestAthletes = computed(() => summary.value?.latestAthletes || []);
const latestInterests = computed(() => summary.value?.latestInterests || []);

const evaluatedAthletesCount = computed(() => athletes.value.filter((athlete) => Boolean(latestEvaluation(athlete))).length);
const highCount = computed(() => athletes.value.filter((athlete) => levelOf(athlete) === "HIGH").length);
const mediumCount = computed(() => athletes.value.filter((athlete) => levelOf(athlete) === "MEDIUM").length);
const lowCount = computed(() => athletes.value.filter((athlete) => levelOf(athlete) === "LOW").length);

const averageScore = computed(() => {
  const scores = athletes.value
    .map((athlete) => latestPerformance(athlete)?.performanceScore)
    .filter((score) => typeof score === "number");

  if (!scores.length) {
    return summary.value?.totals?.averageScore ?? "-";
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Number(average.toFixed(1));
});

const levelData = computed(() => [
  { label: "Alto", value: highCount.value, tone: "high" },
  { label: "Médio", value: mediumCount.value, tone: "medium" },
  { label: "Baixo", value: lowCount.value, tone: "low" }
]);

const maxLevelValue = computed(() => Math.max(1, ...levelData.value.map((item) => item.value)));
const radarScore = computed(() => Number(averageScore.value || 0));

const radarPoints = computed(() => {
  const base = Math.max(12, Math.min(92, radarScore.value));
  const athletesValue = Math.min(92, Math.max(18, (summary.value?.totals?.athletes || 0) * 8));
  const evaluations = Math.min(92, Math.max(18, evaluatedAthletesCount.value * 10));
  const interests = Math.min(92, Math.max(18, (summary.value?.totals?.interests || 0) * 12));
  const high = Math.min(92, Math.max(18, highCount.value * 18));
  return `50% ${100 - base}%, ${evaluations}% 32%, ${interests}% 76%, 50% ${100 - high}%, ${100 - athletesValue}% 76%, ${100 - base}% 32%`;
});

const indicatorCards = computed(() => {
  if (!summary.value) {
    return [];
  }

  return [
    {
      label: "Atletas",
      value: summary.value.totals.athletes,
      to: { path: "/atletas" },
      tone: "athletes",
      icon: "⚽"
    },
    {
      label: "Avaliados",
      value: evaluatedAthletesCount.value,
      to: { path: "/atletas", query: { hasEvaluation: "1" } },
      tone: "evaluations",
      icon: "📋"
    },
    {
      label: "Interesses",
      value: summary.value.totals.interests,
      to: { path: "/interesses" },
      tone: "interests",
      icon: "👀"
    },
    {
      label: "Score médio",
      value: averageScore.value,
      to: { path: "/olheiro", query: { withScore: "1" } },
      tone: "score",
      icon: "📈"
    },
    {
      label: "Alto desempenho",
      value: highCount.value,
      to: { path: "/atletas", query: { level: "HIGH" } },
      tone: "high",
      icon: "🟢"
    },
    {
      label: "Médio desempenho",
      value: mediumCount.value,
      to: { path: "/atletas", query: { level: "MEDIUM" } },
      tone: "medium",
      icon: "🟡"
    },
    {
      label: "Baixo desempenho",
      value: lowCount.value,
      to: { path: "/atletas", query: { level: "LOW" } },
      tone: "low",
      icon: "🔴"
    }
  ];
});

onMounted(loadSummary);
</script>

<template>
  <section class="dashboard-heading">
    <div class="dashboard-heading-top">
      <p class="eyebrow">Plataforma NextFut</p>

      <div class="dashboard-heading-actions">
        <RouterLink class="button compact" to="/atletas">Gerenciar atletas</RouterLink>
        <RouterLink class="button secondary compact" to="/olheiro">Radar do olheiro</RouterLink>
        <RouterLink class="button secondary compact" to="/portal-atleta">Portal do atleta</RouterLink>
      </div>
    </div>

    <div class="dashboard-heading-main">
      <div>
        <h1>Conectando atletas, avaliações e olheiros.</h1>
        <strong>Visão geral da plataforma</strong>
      </div>
      <p>MVP para cadastro, importação, análise de desempenho e scouting.</p>
    </div>
  </section>

  <section class="home-dashboard">
    <div class="page-header compact-header">
      <div>
        <p class="eyebrow">Resumo</p>
        <h2>Indicadores da plataforma</h2>
      </div>
      <button class="button secondary" @click="loadSummary">Atualizar</button>
    </div>

    <p v-if="loading">Carregando indicadores...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else-if="summary">
      <div class="summary-grid summary-grid-dashboard">
        <RouterLink
          v-for="card in indicatorCards"
          :key="card.label"
          :to="card.to"
          class="summary-card summary-link-card"
          :class="`summary-tone-${card.tone}`"
        >
          <div class="summary-card-main">
            <span class="summary-card-icon">{{ card.icon }}</span>
            <strong>{{ card.value }}</strong>
          </div>
          <span>{{ card.label }}</span>
        </RouterLink>
      </div>

      <div class="dashboard-grid">
        <section class="chart-card">
          <h3>Distribuição por nível</h3>
          <div class="bar-chart">
            <div v-for="item in levelData" :key="item.label" class="bar-row">
              <strong>{{ item.label }}</strong>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :class="`bar-fill-${item.tone}`"
                  :style="{ width: `${(item.value / maxLevelValue) * 100}%` }"
                ></div>
              </div>
              <span>{{ item.value }}</span>
            </div>
          </div>
        </section>

        <section class="chart-card">
          <h3>Mapa de maturidade do MVP</h3>
          <div class="radar-chart">
            <span class="radar-ring" style="--inset: 8%"></span>
            <span class="radar-ring" style="--inset: 22%"></span>
            <span class="radar-ring" style="--inset: 36%"></span>
            <span class="radar-spoke" style="--rotate: 0deg"></span>
            <span class="radar-spoke" style="--rotate: 60deg"></span>
            <span class="radar-spoke" style="--rotate: 120deg"></span>
            <span class="radar-spoke" style="--rotate: 180deg"></span>
            <span class="radar-spoke" style="--rotate: 240deg"></span>
            <span class="radar-spoke" style="--rotate: 300deg"></span>
            <span class="radar-shape" :style="{ '--points': radarPoints }"></span>
            <div class="radar-center">Score<br />{{ averageScore }}</div>
          </div>
          <div class="radar-legend">
            <span>Score médio</span>
            <span>Avaliados</span>
            <span>Interesses</span>
            <span>Alto desempenho</span>
          </div>
        </section>
      </div>

      <div class="home-columns">
        <section class="profile-panel">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">Recentes</p>
              <h2>Últimos atletas</h2>
            </div>
            <RouterLink to="/atletas" class="text-link">Ver todos</RouterLink>
          </div>
          <div v-if="!latestAthletes.length" class="empty">Nenhum atleta cadastrado.</div>

          <article v-for="athlete in latestAthletes" :key="athlete.id" class="mini-list-card">
            <div>
              <strong>{{ athlete.name }}</strong>
              <p>{{ athlete.position || "Sem posição" }} · {{ athlete.accessCode }}</p>
            </div>
            <div class="mini-card-side">
              <div class="mini-score">
                <span>{{ latestPerformance(athlete)?.performanceScore ?? "-" }}</span>
                <small>{{ levelLabel(levelOf(athlete)) }}</small>
              </div>
              <RouterLink :to="`/atletas/${athlete.id}`" class="button secondary compact action-icon-button">
                <span>Perfil</span>
                <span class="button-icon">↗</span>
              </RouterLink>
            </div>
          </article>
        </section>

        <section class="profile-panel">
          <div class="section-title-row">
            <div>
              <p class="eyebrow">Olheiros</p>
              <h2>Últimos interesses</h2>
            </div>
            <RouterLink to="/interesses" class="text-link">Ver todos</RouterLink>
          </div>
          <div v-if="!latestInterests.length" class="empty">Nenhum interesse registrado.</div>

          <article v-for="interest in latestInterests" :key="interest.id" class="mini-list-card">
            <div>
              <strong>{{ interest.athlete?.name || "Atleta não informado" }}</strong>
              <p>{{ interest.scoutName }} · {{ statusLabel(interest.status) }}</p>
            </div>
            <div class="mini-card-side">
              <span class="badge muted">{{ interest.athlete?.accessCode || "Sem código" }}</span>
              <RouterLink
                v-if="interest.athlete?.id"
                :to="`/atletas/${interest.athlete.id}`"
                class="button secondary compact action-icon-button"
              >
                <span>Perfil</span>
                <span class="button-icon">↗</span>
              </RouterLink>
            </div>
          </article>
        </section>
      </div>
    </template>
  </section>
</template>
