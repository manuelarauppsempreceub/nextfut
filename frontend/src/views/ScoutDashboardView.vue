<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const athletes = ref([]);
const loading = ref(true);
const error = ref("");

const search = ref("");
const position = ref("");
const region = ref("");
const level = ref("");

async function loadAthletes() {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get("/athletes");
    athletes.value = response.data;
  } catch (err) {
    error.value = "Não foi possível carregar os dados para o painel do olheiro.";
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

function scoreOf(athlete) {
  return latestPerformance(athlete)?.performanceScore ?? 0;
}

function levelOf(athlete) {
  return latestPerformance(athlete)?.calculatedLevel || latestEvaluation(athlete)?.level || "";
}

function levelLabel(value) {
  const labels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto"
  };

  return labels[value] || value || "-";
}

const positions = computed(() => {
  return [...new Set(athletes.value.map((athlete) => athlete.position).filter(Boolean))].sort();
});

const regions = computed(() => {
  return [...new Set(athletes.value.map((athlete) => athlete.region).filter(Boolean))].sort();
});

const filteredAthletes = computed(() => {
  const searchTerm = search.value.trim().toLowerCase();

  return athletes.value
    .filter((athlete) => {
      const matchesSearch =
        !searchTerm ||
        athlete.name.toLowerCase().includes(searchTerm) ||
        athlete.accessCode.toLowerCase().includes(searchTerm);

      const matchesPosition = !position.value || athlete.position === position.value;
      const matchesRegion = !region.value || athlete.region === region.value;
      const matchesLevel = !level.value || levelOf(athlete) === level.value;

      return matchesSearch && matchesPosition && matchesRegion && matchesLevel;
    })
    .sort((a, b) => scoreOf(b) - scoreOf(a));
});

const totalAthletes = computed(() => athletes.value.length);

const averageScore = computed(() => {
  const scores = athletes.value
    .map((athlete) => latestPerformance(athlete)?.performanceScore)
    .filter((score) => typeof score === "number");

  if (!scores.length) {
    return "-";
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return average.toFixed(1);
});

const highCount = computed(() => athletes.value.filter((athlete) => levelOf(athlete) === "HIGH").length);
const mediumCount = computed(() => athletes.value.filter((athlete) => levelOf(athlete) === "MEDIUM").length);
const lowCount = computed(() => athletes.value.filter((athlete) => levelOf(athlete) === "LOW").length);

function clearFilters() {
  search.value = "";
  position.value = "";
  region.value = "";
  level.value = "";
}

onMounted(loadAthletes);
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <p class="eyebrow">Painel do olheiro</p>
        <h1>Radar de atletas</h1>
      </div>

      <button class="button secondary" @click="loadAthletes">
        Atualizar
      </button>
    </div>

    <p v-if="loading">Carregando painel...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <div class="summary-grid">
        <article class="summary-card">
          <span>Total de atletas</span>
          <strong>{{ totalAthletes }}</strong>
        </article>

        <article class="summary-card">
          <span>Score médio</span>
          <strong>{{ averageScore }}</strong>
        </article>

        <article class="summary-card">
          <span>Alto desempenho</span>
          <strong>{{ highCount }}</strong>
        </article>

        <article class="summary-card">
          <span>Médio desempenho</span>
          <strong>{{ mediumCount }}</strong>
        </article>

        <article class="summary-card">
          <span>Baixo desempenho</span>
          <strong>{{ lowCount }}</strong>
        </article>
      </div>

      <section class="filters-panel">
        <div class="field">
          <label>Buscar</label>
          <input v-model="search" type="text" placeholder="Nome ou código" />
        </div>

        <div class="field">
          <label>Posição</label>
          <select v-model="position">
            <option value="">Todas</option>
            <option v-for="item in positions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Região</label>
          <select v-model="region">
            <option value="">Todas</option>
            <option v-for="item in regions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Nível</label>
          <select v-model="level">
            <option value="">Todos</option>
            <option value="HIGH">Alto</option>
            <option value="MEDIUM">Médio</option>
            <option value="LOW">Baixo</option>
          </select>
        </div>

        <button class="button secondary" @click="clearFilters">
          Limpar filtros
        </button>
      </section>

      <div class="ranking-list">
        <article v-for="athlete in filteredAthletes" :key="athlete.id" class="ranking-card">
          <div class="ranking-main">
            <div>
              <span class="badge">{{ athlete.accessCode }}</span>
              <h2>{{ athlete.name }}</h2>
              <p>
                {{ athlete.position || "Posição não informada" }}
                ·
                {{ athlete.region || "Região não informada" }}
              </p>
            </div>

            <div class="score-box">
              <span>Score</span>
              <strong>{{ latestPerformance(athlete)?.performanceScore ?? "-" }}</strong>
              <small>{{ levelLabel(levelOf(athlete)) }}</small>
            </div>
          </div>

          <div v-if="latestPerformance(athlete)" class="ranking-details">
            <p><strong>Fortes:</strong> {{ latestPerformance(athlete).strengths.join(", ") }}</p>
            <p><strong>A melhorar:</strong> {{ latestPerformance(athlete).weaknesses.join(", ") }}</p>
          </div>

          <RouterLink class="button card-action" :to="`/atletas/${athlete.id}`">
            Ver perfil
          </RouterLink>
        </article>
      </div>
    </template>
  </section>
</template>
