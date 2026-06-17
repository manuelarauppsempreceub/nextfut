<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const accessCode = ref("");
const athlete = ref(null);
const loading = ref(false);
const error = ref("");

const latestEvaluation = computed(() => {
  return athlete.value?.evaluations?.[0] || null;
});

const latestPerformance = computed(() => {
  return latestEvaluation.value?.performanceResult || null;
});

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
  } catch (err) {
    error.value = err.response?.data?.message || "Não foi possível encontrar o atleta.";
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
</script>

<template>
  <section>
    <div class="portal-hero">
      <div>
        <p class="eyebrow">Portal do atleta</p>
        <h1>Consulte seu desempenho</h1>
        <p>
          Digite seu código de acesso para visualizar seu score, pontos fortes,
          pontos a melhorar e recomendações de treino.
        </p>
      </div>

      <div class="portal-search">
        <label for="access-code">Código de acesso</label>
        <div class="portal-search-row">
          <input
            id="access-code"
            v-model="accessCode"
            type="text"
            placeholder="Ex: NF-0001"
            @keyup.enter="searchAthlete"
          />

          <button class="button" :disabled="loading" @click="searchAthlete">
            {{ loading ? "Buscando..." : "Consultar" }}
          </button>
        </div>

        <p class="hint">
          O código é informado pelo avaliador ou gestor da plataforma.
        </p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="athlete" class="profile-panel portal-result">
      <div class="profile-header">
        <div>
          <p class="eyebrow">Resultado encontrado</p>
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
          <h2>Pontos a melhorar</h2>
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

      <div class="portal-footer">
        <p v-if="latestEvaluation">
          Última avaliação: {{ formatDate(latestEvaluation.evaluatedAt) }}
        </p>

        <RouterLink class="button secondary" to="/">
          Voltar
        </RouterLink>
      </div>
    </section>
  </section>
</template>
