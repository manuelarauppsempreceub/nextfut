<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "../services/api";
import {
  athleteListActionLabel,
  canCreateAthlete,
  canEditAthlete,
  canCreateEvaluation,
  canRegisterInterest
} from "../services/permissions";

const route = useRoute();

const athletes = ref([]);
const loading = ref(true);
const error = ref("");
const actionMessage = ref("");
const actionError = ref("");

const search = ref("");
const position = ref("");
const region = ref("");
const level = ref("");
const hasEvaluationOnly = ref(false);
const sortKey = ref("name");
const sortDirection = ref("asc");
const currentPage = ref(1);
const pageSize = ref(10);

const showCreateModal = ref(false);
const showDetailModal = ref(false);
const selectedAthlete = ref(null);

const createLoading = ref(false);
const createError = ref("");

const emptyForm = () => ({
  name: "",
  age: "",
  position: "",
  dominantFoot: "",
  heightCm: "",
  country: "",
  region: "",
  schoolProject: ""
});

const form = ref(emptyForm());

async function loadAthletes() {
  try {
    loading.value = true;
    error.value = "";
    const response = await api.get("/athletes");
    athletes.value = response.data;
  } catch (err) {
    error.value = "Não foi possível carregar os atletas.";
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
  return latestPerformance(athlete)?.performanceScore ?? -1;
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

const positions = computed(() => [...new Set(athletes.value.map((athlete) => athlete.position).filter(Boolean))].sort());
const regions = computed(() => [...new Set(athletes.value.map((athlete) => athlete.region).filter(Boolean))].sort());

function syncFiltersFromRoute() {
  search.value = typeof route.query.search === "string" ? route.query.search : "";
  position.value = typeof route.query.position === "string" ? route.query.position : "";
  region.value = typeof route.query.region === "string" ? route.query.region : "";
  level.value = typeof route.query.level === "string" ? route.query.level : "";
  hasEvaluationOnly.value = route.query.hasEvaluation === "1";
}

watch(() => route.query, syncFiltersFromRoute, { immediate: true });

const filteredAthletes = computed(() => {
  const searchTerm = search.value.trim().toLowerCase();

  const result = athletes.value.filter((athlete) => {
    const matchesSearch =
      !searchTerm ||
      athlete.name?.toLowerCase().includes(searchTerm) ||
      athlete.accessCode?.toLowerCase().includes(searchTerm) ||
      athlete.schoolProject?.toLowerCase().includes(searchTerm);

    const matchesPosition = !position.value || athlete.position === position.value;
    const matchesRegion = !region.value || athlete.region === region.value;
    const matchesLevel = !level.value || levelOf(athlete) === level.value;
    const matchesEvaluation = !hasEvaluationOnly.value || Boolean(latestEvaluation(athlete));

    return matchesSearch && matchesPosition && matchesRegion && matchesLevel && matchesEvaluation;
  });

  return result.sort((a, b) => {
    const direction = sortDirection.value === "asc" ? 1 : -1;
    const values = {
      name: [a.name || "", b.name || ""],
      position: [a.position || "", b.position || ""],
      region: [a.region || "", b.region || ""],
      score: [scoreOf(a), scoreOf(b)],
      level: [levelLabel(levelOf(a)), levelLabel(levelOf(b))]
    }[sortKey.value];

    if (typeof values[0] === "number") {
      return (values[0] - values[1]) * direction;
    }

    return values[0].localeCompare(values[1], "pt-BR") * direction;
  });
});

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

watch([search, position, region, level, hasEvaluationOnly, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

function changeSort(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    return;
  }

  sortKey.value = key;
  sortDirection.value = "asc";
}

function sortLabel(key) {
  if (sortKey.value !== key) {
    return "";
  }

  return sortDirection.value === "asc" ? " ↑" : " ↓";
}

function clearFilters() {
  search.value = "";
  position.value = "";
  region.value = "";
  level.value = "";
  hasEvaluationOnly.value = false;
}

function openCreateModal() {
  form.value = emptyForm();
  createError.value = "";
  actionMessage.value = "";
  showCreateModal.value = true;
}

function openDetailModal(athlete) {
  selectedAthlete.value = athlete;
  showDetailModal.value = true;
}

async function submitAthlete() {
  if (!form.value.name.trim()) {
    createError.value = "Informe o nome do atleta.";
    return;
  }

  try {
    createLoading.value = true;
    createError.value = "";

    const payload = {
      name: form.value.name,
      age: form.value.age ? Number(form.value.age) : null,
      position: form.value.position,
      dominantFoot: form.value.dominantFoot,
      heightCm: form.value.heightCm ? Number(form.value.heightCm) : null,
      country: form.value.country,
      region: form.value.region,
      schoolProject: form.value.schoolProject
    };

    await api.post("/athletes", payload);
    actionMessage.value = "Atleta cadastrado com sucesso.";
    showCreateModal.value = false;
    await loadAthletes();
  } catch (err) {
    createError.value = err.response?.data?.message || "Não foi possível cadastrar o atleta.";
  } finally {
    createLoading.value = false;
  }
}

onMounted(loadAthletes);
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <p class="eyebrow">Banco de atletas</p>
        <h1>Atletas cadastrados</h1>
        <p class="page-description">
          Listagem operacional com filtros, ordenação, detalhamento em modal e cadastro rápido.
        </p>
      </div>
      <div class="actions-row">
        <button v-if="canCreateAthlete()" class="button" type="button" @click="openCreateModal">
          Novo atleta
        </button>
        <button class="button secondary" type="button" @click="loadAthletes">Atualizar</button>
      </div>
    </div>

    <p v-if="loading">Carregando atletas...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <p v-if="actionMessage" class="success">{{ actionMessage }}</p>
      <p v-if="actionError" class="error">{{ actionError }}</p>

      <section class="filters-panel filters-panel-list">
        <div class="field">
          <label>Buscar</label>
          <input v-model="search" type="text" placeholder="Nome, código ou projeto" />
        </div>
        <div class="field">
          <label>Posição</label>
          <select v-model="position">
            <option value="">Todas</option>
            <option v-for="item in positions" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div class="field">
          <label>Região</label>
          <select v-model="region">
            <option value="">Todas</option>
            <option v-for="item in regions" :key="item" :value="item">{{ item }}</option>
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
        <button class="button secondary" type="button" @click="clearFilters">Limpar</button>
      </section>

      <div class="list-header-row">
        <p class="list-counter">{{ totalRecords }} atleta(s) encontrado(s)</p>
        <p v-if="hasEvaluationOnly" class="list-filter-tag">Filtro ativo: somente atletas com avaliações</p>
      </div>

      <div v-if="!filteredAthletes.length" class="empty">Nenhum atleta encontrado.</div>

      <div v-else class="table-wrapper list-table-wrapper">
        <table>
          <thead>
            <tr>
              <th><button class="sort-button" @click="changeSort('name')">Atleta{{ sortLabel('name') }}</button></th>
              <th>Código</th>
              <th><button class="sort-button" @click="changeSort('position')">Posição{{ sortLabel('position') }}</button></th>
              <th><button class="sort-button" @click="changeSort('region')">Região{{ sortLabel('region') }}</button></th>
              <th><button class="sort-button" @click="changeSort('score')">Score{{ sortLabel('score') }}</button></th>
              <th><button class="sort-button" @click="changeSort('level')">Nível{{ sortLabel('level') }}</button></th>
              <th class="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="athlete in paginatedAthletes" :key="athlete.id">
              <td>
                <strong>{{ athlete.name }}</strong><br />
                <small>{{ athlete.schoolProject || "Sem escola/projeto" }}</small>
              </td>
              <td><span class="badge">{{ athlete.accessCode }}</span></td>
              <td>{{ athlete.position || "-" }}</td>
              <td>{{ athlete.region || "-" }}</td>
              <td><strong>{{ latestPerformance(athlete)?.performanceScore ?? "-" }}</strong></td>
              <td>{{ levelLabel(levelOf(athlete)) }}</td>
              <td>
                <div class="table-actions end">
                  <button class="button secondary compact action-icon-button" type="button" @click="openDetailModal(athlete)">
                    <span>Detalhar</span>
                    <span class="button-icon">👁</span>
                  </button>
                  <RouterLink class="button compact action-icon-button" :to="`/atletas/${athlete.id}`">
                    <span>{{ athleteListActionLabel(athlete) }}</span>
                    <span class="button-icon">↗</span>
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <footer class="list-footer">
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
      </div>
    </template>

    <div v-if="showCreateModal" class="modal-backdrop" @keydown.esc="showCreateModal = false">
      <section class="modal-card" role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <p class="eyebrow">Cadastro</p>
            <h2>Novo atleta</h2>
          </div>
          <button class="modal-close" type="button" @click="showCreateModal = false">×</button>
        </header>
        <form @submit.prevent="submitAthlete">
          <div class="modal-body two-column-form">
            <div class="field full"><label>Nome do atleta *</label><input v-model="form.name" type="text" placeholder="Ex: Lucas Andrade" /></div>
            <div class="field"><label>Idade</label><input v-model="form.age" type="number" min="0" /></div>
            <div class="field"><label>Posição</label><input v-model="form.position" type="text" /></div>
            <div class="field"><label>Pé dominante</label><select v-model="form.dominantFoot"><option value="">Não informado</option><option value="Direito">Direito</option><option value="Esquerdo">Esquerdo</option><option value="Ambidestro">Ambidestro</option></select></div>
            <div class="field"><label>Altura em cm</label><input v-model="form.heightCm" type="number" min="0" /></div>
            <div class="field"><label>País</label><input v-model="form.country" type="text" /></div>
            <div class="field"><label>Região</label><input v-model="form.region" type="text" /></div>
            <div class="field full"><label>Escola ou projeto</label><input v-model="form.schoolProject" type="text" /></div>
            <p v-if="createError" class="error full">{{ createError }}</p>
          </div>
          <footer class="modal-actions">
            <button class="button secondary" type="button" @click="showCreateModal = false">Cancelar</button>
            <button class="button" type="submit" :disabled="createLoading">{{ createLoading ? "Cadastrando..." : "Cadastrar atleta" }}</button>
          </footer>
        </form>
      </section>
    </div>

    <div v-if="showDetailModal && selectedAthlete" class="modal-backdrop">
      <section class="modal-card large" role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <p class="eyebrow">Detalhamento</p>
            <h2>{{ selectedAthlete.name }}</h2>
            <p class="page-description">{{ selectedAthlete.position || "Posição não informada" }} · {{ selectedAthlete.region || "Região não informada" }}</p>
          </div>
          <button class="modal-close" type="button" @click="showDetailModal = false">×</button>
        </header>
        <div class="modal-body">
          <div class="metrics detail-metrics">
            <div><span>Código</span><strong>{{ selectedAthlete.accessCode }}</strong></div>
            <div><span>Idade</span><strong>{{ selectedAthlete.age || "-" }}</strong></div>
            <div><span>Altura</span><strong>{{ selectedAthlete.heightCm ? `${selectedAthlete.heightCm} cm` : "-" }}</strong></div>
            <div><span>Score</span><strong>{{ latestPerformance(selectedAthlete)?.performanceScore ?? "-" }}</strong></div>
            <div><span>Nível</span><strong>{{ levelLabel(levelOf(selectedAthlete)) }}</strong></div>
          </div>
          <div v-if="latestPerformance(selectedAthlete)" class="analysis-grid">
            <div class="analysis-card"><h2>Pontos fortes</h2><ul><li v-for="item in latestPerformance(selectedAthlete).strengths" :key="item">{{ item }}</li></ul></div>
            <div class="analysis-card"><h2>A melhorar</h2><ul><li v-for="item in latestPerformance(selectedAthlete).weaknesses" :key="item">{{ item }}</li></ul></div>
          </div>
        </div>
        <footer class="modal-actions">
          <button class="button secondary" type="button" @click="showDetailModal = false">Fechar</button>
          <RouterLink
            class="button"
            :to="`/atletas/${selectedAthlete.id}`"
          >
            {{ canEditAthlete(selectedAthlete) || canCreateEvaluation() || canRegisterInterest()
              ? "Abrir perfil completo"
              : "Visualizar perfil" }}
          </RouterLink>
        </footer>
      </section>
    </div>
  </section>
</template>
