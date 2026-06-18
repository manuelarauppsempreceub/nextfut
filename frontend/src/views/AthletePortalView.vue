<script setup>
import { computed, ref } from "vue";
import RadarComparisonChart from "../components/charts/RadarComparisonChart.vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const accessCode = ref("");
const athlete = ref(null);
const loading = ref(false);
const error = ref("");

const performanceComparison = ref(null);

const latestEvaluation = computed(() => {
  return athlete.value?.evaluations?.[0] || null;
});

const latestPerformance = computed(() => {
  return latestEvaluation.value?.performanceResult || null;
});

async function loadPerformanceComparison(athleteId) {
  if (!athleteId) {
    performanceComparison.value = null;
    return;
  }

  try {
    const response = await api.get(`/athletes/${athleteId}/performance-comparison`);
    performanceComparison.value = response.data;
  } catch (err) {
    performanceComparison.value = null;
  }
}

async function searchAthlete() {
  const code = accessCode.value.trim().toUpperCase();

  if (!code) {
    error.value = "Digite seu código de acesso.";
    athlete.value = null;
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    athlete.value = null;

    const response = await api.get(`/athletes/access-code/${code}`);

    athlete.value = response.data;
    accessCode.value = code;
    await loadPerformanceComparison(response.data.id);
  } catch (err) {
    performanceComparison.value = null;
    error.value =
      err.response?.data?.message || "Não foi possível encontrar o atleta.";
  } finally {
    loading.value = false;
  }
}

function levelLabel(level) {
  const labels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto"
  };

  return labels[level] || level || "-";
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function hasList(items) {
  return Array.isArray(items) && items.length > 0;
}
</script>

<template>
  <section class="athlete-portal-page">
    <div class="athlete-portal-bg" aria-hidden="true"></div>

    <div class="athlete-portal-container">
      <div class="portal-hero">
        <div class="portal-hero__content">
          <p class="portal-eyebrow">Portal do Atleta</p>

          <h1>Consulte seu desempenho</h1>

          <p>
            Digite seu código de acesso para visualizar score, pontos fortes,
            pontos a melhorar e recomendações de treino.
          </p>

          <div class="portal-hero__actions">
            <RouterLink class="portal-link-button" to="/">
              Voltar para Home
            </RouterLink>
          </div>
        </div>

        <form class="portal-search" @submit.prevent="searchAthlete">
          <label for="access-code">Código de acesso</label>

          <div class="portal-search-row">
            <input
              id="access-code"
              v-model="accessCode"
              type="text"
              placeholder="Ex: NF-0001"
              autocomplete="off"
              :disabled="loading"
            />

            <button class="portal-button portal-button--primary" :disabled="loading">
              {{ loading ? "Buscando..." : "Consultar" }}
            </button>
          </div>

          <p class="portal-hint">
            O código é informado pelo avaliador ou gestor da plataforma.
          </p>
        </form>
      </div>

      <p v-if="error" class="portal-error">
        {{ error }}
      </p>

      <section v-if="athlete" class="portal-result">
        <div class="profile-header">
          <div>
            <p class="portal-eyebrow">Resultado encontrado</p>

            <h2>{{ athlete.name }}</h2>

            <p>
              {{ athlete.position || "Posição não informada" }}
              ·
              {{ athlete.region || athlete.country || "Região não informada" }}
            </p>
          </div>

          <span class="access-badge">{{ athlete.accessCode }}</span>
        </div>

        <div class="metrics-grid">
          <article class="metric-card">
            <span>Idade</span>
            <strong>{{ athlete.age || "-" }}</strong>
          </article>

          <article class="metric-card metric-card--highlight">
            <span>Score</span>
            <strong>{{ latestPerformance?.performanceScore ?? "-" }}</strong>
          </article>

          <article class="metric-card">
            <span>Nível</span>
            <strong>
              {{ levelLabel(latestPerformance?.calculatedLevel || latestEvaluation?.level) }}
            </strong>
          </article>

          <article class="metric-card">
            <span>Potencial</span>
            <strong>{{ latestEvaluation?.potential || "-" }}</strong>
          </article>
        </div>

        <RadarComparisonChart
          v-if="performanceComparison?.criteria?.length"
          class="portal-radar"
          title="Seu desempenho no radar"
          description="Comparativo entre sua última avaliação e a média da última avaliação dos demais atletas."
          :items="performanceComparison.criteria"
        />        

        <div v-if="latestPerformance" class="analysis-grid">
          <article class="analysis-card analysis-card--strength">
            <div class="analysis-card__header">
              <span>✓</span>
              <h3>Pontos fortes</h3>
            </div>

            <ul v-if="hasList(latestPerformance.strengths)">
              <li v-for="item in latestPerformance.strengths" :key="item">
                {{ item }}
              </li>
            </ul>

            <p v-else>Nenhum ponto forte registrado nesta avaliação.</p>
          </article>

          <article class="analysis-card analysis-card--weakness">
            <div class="analysis-card__header">
              <span>!</span>
              <h3>Pontos a melhorar</h3>
            </div>

            <ul v-if="hasList(latestPerformance.weaknesses)">
              <li v-for="item in latestPerformance.weaknesses" :key="item">
                {{ item }}
              </li>
            </ul>

            <p v-else>Nenhum ponto a melhorar registrado nesta avaliação.</p>
          </article>

          <article class="analysis-card analysis-card--recommendation">
            <div class="analysis-card__header">
              <span>↗</span>
              <h3>Recomendações de treino</h3>
            </div>

            <ul v-if="hasList(latestPerformance.recommendations)">
              <li v-for="item in latestPerformance.recommendations" :key="item">
                {{ item }}
              </li>
            </ul>

            <p v-else>Nenhuma recomendação registrada nesta avaliação.</p>
          </article>
        </div>

        <div v-else class="empty-performance">
          <h3>Avaliação encontrada, mas sem análise de desempenho.</h3>
          <p>
            O atleta ainda não possui resultado calculado para pontos fortes,
            pontos a melhorar e recomendações.
          </p>
        </div>

        <div class="portal-footer">
          <p v-if="latestEvaluation">
            Última avaliação: {{ formatDate(latestEvaluation.evaluatedAt) }}
          </p>

          <RouterLink class="portal-button portal-button--secondary" to="/">
            Voltar
          </RouterLink>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.athlete-portal-page {
  position: relative;
  min-height: 100vh;
  padding: clamp(28px, 5vw, 64px) 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 12%, rgba(25, 229, 140, 0.18), transparent 34%),
    radial-gradient(circle at 88% 18%, rgba(56, 189, 248, 0.16), transparent 34%),
    linear-gradient(180deg, #06101e 0%, #07111f 48%, #081525 100%);
  color: #f8fafc;
}

.athlete-portal-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: 0.48;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent 86%);
}

.athlete-portal-container {
  position: relative;
  z-index: 1;
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

.portal-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.58fr);
  gap: 28px;
  align-items: stretch;
}

.portal-hero__content,
.portal-search,
.portal-result {
  border: 1px solid rgba(25, 229, 140, 0.18);
  border-radius: 32px;
  background:
    radial-gradient(circle at top left, rgba(25, 229, 140, 0.13), transparent 42%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.032));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
}

.portal-hero__content {
  padding: clamp(28px, 4vw, 44px);
}

.portal-eyebrow {
  display: inline-flex;
  width: fit-content;
  margin: 0 0 18px;
  padding: 8px 13px;
  border: 1px solid rgba(25, 229, 140, 0.42);
  border-radius: 999px;
  background: rgba(25, 229, 140, 0.08);
  color: #19e58c;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.portal-hero h1 {
  margin: 0;
  max-width: 760px;
  font-size: clamp(2.3rem, 4.8vw, 4.3rem);
  line-height: 1.06;
  letter-spacing: -0.045em;
}

.portal-hero p {
  max-width: 760px;
  margin: 18px 0 0;
  color: #dbeafe;
  font-size: 1.08rem;
}

.portal-hero__actions {
  display: flex;
  margin-top: 30px;
}

.portal-link-button,
.portal-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 999px;
  font-weight: 950;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.portal-link-button {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(2, 12, 18, 0.32);
  color: #f8fafc;
}

.portal-link-button:hover,
.portal-button:hover {
  transform: translateY(-2px);
}

.portal-search {
  display: grid;
  align-content: center;
  padding: clamp(24px, 3vw, 34px);
}

.portal-search label {
  display: block;
  margin-bottom: 12px;
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.portal-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.portal-search input {
  width: 100%;
  min-height: 52px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  outline: none;
  background: rgba(2, 12, 18, 0.46);
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 850;
  text-transform: uppercase;
}

.portal-search input::placeholder {
  color: rgba(203, 213, 225, 0.58);
}

.portal-search input:focus {
  border-color: rgba(25, 229, 140, 0.58);
  box-shadow: 0 0 0 4px rgba(25, 229, 140, 0.12);
}

.portal-button {
  border: 0;
}

.portal-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
  transform: none;
}

.portal-button--primary {
  background: linear-gradient(135deg, #19e58c, #0fbf72);
  color: #03120c;
  box-shadow: 0 14px 32px rgba(25, 229, 140, 0.2);
}

.portal-button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(2, 12, 18, 0.32);
  color: #f8fafc;
}

.portal-hint {
  margin: 12px 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
}

.portal-error {
  margin: 24px 0 0;
  padding: 14px 16px;
  border: 1px solid rgba(248, 113, 113, 0.32);
  border-radius: 18px;
  background: rgba(127, 29, 29, 0.22);
  color: #fecaca;
  font-weight: 850;
}

.portal-result {
  margin-top: 30px;
  padding: clamp(26px, 4vw, 42px);
}

.profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 24px;
}

.profile-header h2 {
  margin: 0;
  font-size: clamp(2rem, 3.6vw, 3.3rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.profile-header p {
  margin: 10px 0 0;
  color: #cbd5e1;
  font-size: 1.04rem;
}

.access-badge {
  display: inline-flex;
  white-space: nowrap;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(25, 229, 140, 0.12);
  border: 1px solid rgba(25, 229, 140, 0.28);
  color: #19e58c;
  font-size: 0.9rem;
  font-weight: 950;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 26px;
}

.metric-card {
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  background: rgba(2, 12, 18, 0.34);
}

.metric-card span {
  display: block;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metric-card strong {
  display: block;
  margin-top: 6px;
  color: #f8fafc;
  font-size: clamp(1.3rem, 2.4vw, 2rem);
  line-height: 1;
}

.metric-card--highlight strong {
  color: #19e58c;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.analysis-card {
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(2, 12, 18, 0.34);
}

.analysis-card--recommendation {
  grid-column: 1 / -1;
}

.analysis-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.analysis-card__header span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 13px;
  background: rgba(25, 229, 140, 0.12);
  color: #19e58c;
  font-weight: 950;
}

.analysis-card--weakness .analysis-card__header span {
  background: rgba(250, 204, 21, 0.12);
  color: #facc15;
}

.analysis-card--recommendation .analysis-card__header span {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.analysis-card h3 {
  margin: 0;
  font-size: 1.18rem;
}

.analysis-card ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 1.2rem;
  color: #dbeafe;
}

.analysis-card p {
  margin: 0;
  color: #cbd5e1;
}

.empty-performance {
  padding: 22px;
  border: 1px solid rgba(250, 204, 21, 0.22);
  border-radius: 24px;
  background: rgba(113, 63, 18, 0.14);
}

.empty-performance h3 {
  margin: 0;
  color: #fde68a;
}

.empty-performance p {
  margin: 8px 0 0;
  color: #e2e8f0;
}

.portal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.portal-footer p {
  margin: 0;
  color: #94a3b8;
}

@media (max-width: 960px) {
  .portal-hero,
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .portal-search-row {
    grid-template-columns: 1fr;
  }

  .portal-button--primary {
    width: 100%;
  }
}

@media (max-width: 720px) {
  .athlete-portal-container {
    width: min(100% - 28px, 1180px);
  }

  .profile-header,
  .portal-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .analysis-card--recommendation {
    grid-column: auto;
  }

  .portal-link-button,
  .portal-button {
    width: 100%;
  }
}

.portal-radar {
  margin-bottom: 26px;
}

.portal-radar :deep(.radar-card) {
  border-color: rgba(255, 255, 255, 0.12);
  background:
    radial-gradient(circle at top left, rgba(25, 229, 140, 0.13), transparent 42%),
    rgba(2, 12, 18, 0.34);
  box-shadow: none;
}

.portal-radar :deep(.radar-card__header p:not(.eyebrow)),
.portal-radar :deep(.radar-table__row),
.portal-radar :deep(.radar-label) {
  color: #cbd5e1;
}

.portal-radar :deep(.radar-card__header h2),
.portal-radar :deep(.radar-table__row strong) {
  color: #f8fafc;
}

.portal-radar :deep(.radar-table__row) {
  background: rgba(15, 23, 42, 0.56);
}
</style>