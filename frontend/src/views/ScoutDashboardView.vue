<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "../services/api";

const route = useRoute();

const athletes = ref([]);
const loading = ref(true);
const error = ref("");

const search = ref("");
const position = ref("");
const region = ref("");
const level = ref("");
const withScoreOnly = ref(false);
const currentPage = ref(1);
const pageSize = ref(5);

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

function syncFiltersFromRoute() {
  search.value = typeof route.query.search === "string" ? route.query.search : "";
  position.value = typeof route.query.position === "string" ? route.query.position : "";
  region.value = typeof route.query.region === "string" ? route.query.region : "";
  level.value = typeof route.query.level === "string" ? route.query.level : "";
  withScoreOnly.value = route.query.withScore === "1";
}

watch(() => route.query, syncFiltersFromRoute, { immediate: true });

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
      const matchesScore = !withScoreOnly.value || typeof latestPerformance(athlete)?.performanceScore === "number";

      return matchesSearch && matchesPosition && matchesRegion && matchesLevel && matchesScore;
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

const totalRecords = computed(() => filteredAthletes.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)));
const paginatedAthletes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAthletes.value.slice(start, start + pageSize.value);
});
const pageStart = computed(() => (totalRecords.value ? (currentPage.value - 1) * pageSize.value + 1 : 0));
const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalRecords.value));

function goToPage(page) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}

watch([search, position, region, level, withScoreOnly, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

function clearFilters() {
  search.value = "";
  position.value = "";
  region.value = "";
  level.value = "";
  withScoreOnly.value = false;
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
        <article class="summary-card summary-tone-athletes">
          <span>Total de atletas</span>
          <strong>{{ totalAthletes }}</strong>
        </article>

        <article class="summary-card summary-tone-score">
          <span>Score médio</span>
          <strong>{{ averageScore }}</strong>
        </article>

        <article class="summary-card summary-tone-high">
          <span>Alto desempenho</span>
          <strong>{{ highCount }}</strong>
        </article>

        <article class="summary-card summary-tone-medium">
          <span>Médio desempenho</span>
          <strong>{{ mediumCount }}</strong>
        </article>

        <article class="summary-card summary-tone-low">
          <span>Baixo desempenho</span>
          <strong>{{ lowCount }}</strong>
        </article>
      </div>

      <section class="filters-panel filters-panel-list">
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

      <div class="list-header-row">
        <p class="list-counter">{{ totalRecords }} atleta(s) listado(s)</p>
        <p v-if="withScoreOnly" class="list-filter-tag">Filtro ativo: somente atletas com score calculado</p>
      </div>

      <div class="ranking-list standardized-list">
        <article v-for="athlete in paginatedAthletes" :key="athlete.id" class="ranking-card standardized-card">
          <div class="ranking-main standardized-card-main">
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

          <div class="list-card-footer end">
            <RouterLink class="button compact action-icon-button" :to="`/atletas/${athlete.id}`">
              <span>Ver perfil</span>
              <span class="button-icon">↗</span>
            </RouterLink>
          </div>
        </article>
      </div>

      <footer v-if="totalRecords" class="list-footer standalone">
        <div>
          Exibindo {{ pageStart }}–{{ pageEnd }} de {{ totalRecords }} registro(s)
        </div>

        <div class="pagination-controls">
          <label>
            Itens por página
            <select v-model.number="pageSize">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
          </label>
          <button class="button secondary compact" type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</button>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <button class="button secondary compact" type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Próxima</button>
        </div>
      </footer>
    </template>
  </section>
</template>
