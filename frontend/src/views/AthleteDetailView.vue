<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "../services/api";

const route = useRoute();

const athlete = ref(null);
const loading = ref(true);
const error = ref("");

const latestEvaluation = computed(() => {
  return athlete.value?.evaluations?.[0] || null;
});

const latestPerformance = computed(() => {
  return latestEvaluation.value?.performanceResult || null;
});

async function loadAthlete() {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get(`/athletes/${route.params.id}`);
    athlete.value = response.data;
  } catch (err) {
    error.value = "Não foi possível carregar o perfil do atleta.";
  } finally {
    loading.value = false;
  }
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

function levelLabel(level) {
  const labels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto"
  };

  return labels[level] || level || "-";
}

onMounted(loadAthlete);
</script>

<template>
  <section>
    <RouterLink class="back-link" to="/atletas">
      ← Voltar para atletas
    </RouterLink>

    <p v-if="loading">Carregando perfil...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else-if="athlete" class="detail-layout">
      <section class="profile-panel">
        <div class="profile-header">
          <div>
            <p class="eyebrow">Perfil do atleta</p>
            <h1>{{ athlete.name }}</h1>
            <p>
              {{ athlete.position || "Posição não informada" }}
              ·
              {{ athlete.region || "Região não informada" }}
            </p>
          </div>

          <span class="badge big">{{ athlete.accessCode }}</span>
        </div>

        <div class="metrics detail-metrics">
          <div>
            <span>Idade</span>
            <strong>{{ athlete.age || "-" }}</strong>
          </div>

          <div>
            <span>Altura</span>
            <strong>{{ athlete.heightCm ? `${athlete.heightCm} cm` : "-" }}</strong>
          </div>

          <div>
            <span>Pé dominante</span>
            <strong>{{ athlete.dominantFoot || "-" }}</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{{ latestPerformance?.performanceScore ?? "-" }}</strong>
          </div>

          <div>
            <span>Nível</span>
            <strong>{{ levelLabel(latestPerformance?.calculatedLevel || latestEvaluation?.level) }}</strong>
          </div>

          <div>
            <span>Potencial</span>
            <strong>{{ latestEvaluation?.potential || "-" }}</strong>
          </div>
        </div>

        <div v-if="latestPerformance" class="analysis-grid">
          <div class="analysis-card">
            <h2>Pontos fortes</h2>
            <ul>
              <li v-for="item in latestPerformance.strengths" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="analysis-card">
            <h2>Pontos fracos</h2>
            <ul>
              <li v-for="item in latestPerformance.weaknesses" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="analysis-card wide">
            <h2>Recomendações de treino</h2>
            <ul>
              <li v-for="item in latestPerformance.recommendations" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="profile-panel">
        <p class="eyebrow">Histórico</p>
        <h2>Avaliações</h2>

        <div v-if="!athlete.evaluations?.length" class="empty">
          Nenhuma avaliação cadastrada.
        </div>

        <div v-else class="timeline">
          <article
            v-for="evaluation in athlete.evaluations"
            :key="evaluation.id"
            class="timeline-item"
          >
            <div class="timeline-header">
              <strong>{{ formatDate(evaluation.evaluatedAt) }}</strong>
              <span class="badge">{{ levelLabel(evaluation.performanceResult?.calculatedLevel || evaluation.level) }}</span>
            </div>

            <div class="metrics compact">
              <div>
                <span>Score</span>
                <strong>{{ evaluation.performanceResult?.performanceScore ?? "-" }}</strong>
              </div>

              <div>
                <span>Nota</span>
                <strong>{{ evaluation.finalGrade ?? "-" }}</strong>
              </div>

              <div>
                <span>Fonte</span>
                <strong>{{ evaluation.source }}</strong>
              </div>
            </div>

            <p v-if="evaluation.evaluator">
              <strong>Avaliador:</strong> {{ evaluation.evaluator.name }}
            </p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
