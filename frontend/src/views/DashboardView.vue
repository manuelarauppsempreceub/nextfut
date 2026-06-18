<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const summary = ref(null);
const athletes = ref([]);
const loading = ref(true);
const error = ref("");

const radarSize = 380;
const radarCenter = radarSize / 2;
const radarMaxRadius = 105;
const radarLevels = [25, 50, 75, 100];

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

function clamp(value, min = 0, max = 100) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(Math.max(number, min), max);
}

const latestAthletes = computed(() => summary.value?.latestAthletes || []);
const latestInterests = computed(() => summary.value?.latestInterests || []);

const evaluatedAthletesCount = computed(() =>
  athletes.value.filter((athlete) => Boolean(latestEvaluation(athlete))).length
);

const highCount = computed(() =>
  athletes.value.filter((athlete) => levelOf(athlete) === "HIGH").length
);

const mediumCount = computed(() =>
  athletes.value.filter((athlete) => levelOf(athlete) === "MEDIUM").length
);

const lowCount = computed(() =>
  athletes.value.filter((athlete) => levelOf(athlete) === "LOW").length
);

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

const radarMetrics = computed(() => {
  const totals = summary.value?.totals || {};
  const totalAthletes = totals.athletes || 0;
  const totalInterests = totals.interests || 0;

  const evaluatedRate = totalAthletes
    ? (evaluatedAthletesCount.value / totalAthletes) * 100
    : 0;

  const highRate = totalAthletes
    ? (highCount.value / totalAthletes) * 100
    : 0;

  const mediumRate = totalAthletes
    ? (mediumCount.value / totalAthletes) * 100
    : 0;

  const lowRate = totalAthletes
    ? (lowCount.value / totalAthletes) * 100
    : 0;

  const interestRate = totalAthletes
    ? (totalInterests / totalAthletes) * 100
    : 0;

      return [
    {
      key: "score",
      label: "Score médio",
      axisLabel: "Score",
      value: clamp(Number(averageScore.value || 0)),
      display: averageScore.value
    },
    {
      key: "evaluated",
      label: "Avaliados",
      axisLabel: "Avaliados",
      value: clamp(evaluatedRate),
      display: evaluatedAthletesCount.value
    },
    {
      key: "high",
      label: "Alto desempenho",
      axisLabel: "Alto",
      value: clamp(highRate),
      display: highCount.value
    },
    {
      key: "medium",
      label: "Médio desempenho",
      axisLabel: "Médio",
      value: clamp(mediumRate),
      display: mediumCount.value
    },
    {
      key: "low",
      label: "Baixo desempenho",
      axisLabel: "Baixo",
      value: clamp(lowRate),
      display: lowCount.value
    },
    {
      key: "interests",
      label: "Interesses",
      axisLabel: "Interesses",
      value: clamp(interestRate),
      display: totalInterests
    }
  ];
});

function radarPoint(index, value = 100, extraRadius = 0) {
  const total = radarMetrics.value.length;
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  const radius = ((clamp(value) / 100) * radarMaxRadius) + extraRadius;

  return {
    x: radarCenter + radius * Math.cos(angle),
    y: radarCenter + radius * Math.sin(angle)
  };
}

function radarGridPoints(level) {
  return radarMetrics.value
    .map((_, index) => {
      const point = radarPoint(index, level);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

const radarPolygonPoints = computed(() =>
  radarMetrics.value
    .map((item, index) => {
      const point = radarPoint(index, item.value);
      return `${point.x},${point.y}`;
    })
    .join(" ")
);

function radarLabelPoint(index) {
  return radarPoint(index, 100, 30);
}

function radarValuePoint(index) {
  return radarPoint(index, radarMetrics.value[index]?.value || 0, 18);
}

function radarTextAnchor(index) {
  const point = radarLabelPoint(index);

  if (Math.abs(point.x - radarCenter) < 8) {
    return "middle";
  }

  return point.x > radarCenter ? "start" : "end";
}

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

      <div class="dashboard-insights">
        <section class="chart-card maturity-card-featured">
          <div class="chart-title-row">
            <div>
              <h3>Mapa de maturidade do MVP</h3>
              <p>
                Relação entre score médio, atletas avaliados, interesses e distribuição por desempenho.
              </p>
            </div>
          </div>

          <div class="maturity-radar-layout">
            <div class="maturity-radar-figure">
              <svg
                :viewBox="`0 0 ${radarSize} ${radarSize}`"
                role="img"
                aria-label="Mapa de maturidade do MVP"
              >
                <polygon
                  v-for="level in radarLevels"
                  :key="level"
                  class="maturity-radar-grid"
                  :points="radarGridPoints(level)"
                />

                <line
                  v-for="(_, index) in radarMetrics"
                  :key="`axis-${index}`"
                  class="maturity-radar-axis"
                  :x1="radarCenter"
                  :y1="radarCenter"
                  :x2="radarPoint(index, 100).x"
                  :y2="radarPoint(index, 100).y"
                />

                <polygon
                  class="maturity-radar-area"
                  :points="radarPolygonPoints"
                />

                <polyline
                  class="maturity-radar-line"
                  :points="radarPolygonPoints"
                />

                <circle
                  v-for="(item, index) in radarMetrics"
                  :key="`dot-${item.key}`"
                  class="maturity-radar-dot"
                  :cx="radarPoint(index, item.value).x"
                  :cy="radarPoint(index, item.value).y"
                  r="5"
                />

                <text
                  v-for="(item, index) in radarMetrics"
                  :key="`label-${item.key}`"
                  class="maturity-radar-label"
                  :x="radarLabelPoint(index).x"
                  :y="radarLabelPoint(index).y"
                  :text-anchor="radarTextAnchor(index)"
                  dominant-baseline="middle"
                >
                  {{ item.label }}
                </text>

              </svg>
            </div>

            <div class="maturity-radar-table">
              <div class="maturity-radar-table-row maturity-radar-table-head">
                <span>Critério</span>
                <span>Valor</span>
              </div>

              <div
                v-for="item in radarMetrics"
                :key="item.key"
                class="maturity-radar-table-row"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.display }}</strong>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-card level-card-compact">
          <div class="chart-title-row compact">
            <div>
              <h3>Distribuição por nível</h3>
              <p>Quantidade de atletas por classificação de desempenho.</p>
            </div>
          </div>

          <div class="bar-chart bar-chart-compact">
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

<style scoped>
.dashboard-insights {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
  margin-top: 26px;
}

.chart-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.chart-title-row h3 {
  margin: 0;
}

.chart-title-row p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.maturity-card-featured {
  padding: 26px 30px;
  overflow: hidden;
}

.maturity-radar-layout {
   display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(280px, 360px);
  gap: 28px;
  align-items: center;
}

.maturity-radar-figure {
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.maturity-radar-figure svg {
  display: block;
  width: min(100%, 500px);
  max-width: 500px;
  min-height: 360px;
  overflow: visible;
}

.maturity-radar-grid {
  fill: none;
  stroke: rgba(15, 68, 42, 0.18);
  stroke-width: 1;
}

.maturity-radar-axis {
  stroke: rgba(15, 68, 42, 0.2);
  stroke-width: 1;
}

.maturity-radar-area {
  fill: rgba(25, 229, 140, 0.2);
  stroke-linejoin: round;
}

.maturity-radar-line {
  fill: none;
  stroke: rgba(15, 159, 99, 0.95);
  stroke-width: 3;
  stroke-linejoin: round;
}

.maturity-radar-dot {
  fill: #0f9f63;
  stroke: #ffffff;
  stroke-width: 2;
}

.maturity-radar-label {
  fill: #0f172a;
  font-size: 0.74rem;
  font-weight: 950;
}

.maturity-radar-value {
  fill: #047857;
  font-size: 0.68rem;
  font-weight: 950;
}

.maturity-radar-center-circle {
  fill: #ffffff;
  stroke: rgba(15, 68, 42, 0.14);
  stroke-width: 1;
  filter: drop-shadow(0 8px 18px rgba(15, 23, 42, 0.12));
}

.maturity-radar-center-label {
  fill: #0f172a;
  font-size: 0.72rem;
  font-weight: 900;
}

.maturity-radar-center-score {
  fill: #0f172a;
  font-size: 0.85rem;
  font-weight: 950;
}

.maturity-radar-table {
  align-self: center;
  display: grid;
  gap: 8px;
  width: 100%;
}

.maturity-radar-table-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 15px;
  background: rgba(248, 250, 252, 0.95);
  color: #334155;
  font-size: 0.9rem;
}

.maturity-radar-table-head {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.maturity-radar-table-row strong {
  color: #0f172a;
  font-weight: 950;
}

.level-card-compact {
  min-height: auto;
  padding: 22px 26px;
}

.chart-title-row.compact {
  margin-bottom: 16px;
}

.bar-chart-compact {
  max-width: 820px;
}

.level-card-compact .bar-row {
  grid-template-columns: 92px minmax(180px, 1fr) 44px;
}

@media (max-width: 1180px) {
  .maturity-radar-layout {
    grid-template-columns: 1fr;
  }

  .maturity-radar-table {
    width: min(100%, 680px);
    margin-inline: auto;
  }

  .maturity-radar-figure svg {
    width: min(100%, 480px);
    min-height: 340px;
  }
}

@media (max-width: 720px) {
  .maturity-card-featured,
  .level-card-compact {
    padding: 20px 16px;
  }

  .chart-title-row {
    flex-direction: column;
  }

  .maturity-radar-figure svg {
    width: min(100%, 360px);
    min-height: 300px;
  }

  .maturity-radar-label {
    font-size: 0.6rem;
  }

  .maturity-radar-value {
    font-size: 0.56rem;
  }

  .level-card-compact .bar-row {
    grid-template-columns: 72px minmax(120px, 1fr) 32px;
  }
}
</style>