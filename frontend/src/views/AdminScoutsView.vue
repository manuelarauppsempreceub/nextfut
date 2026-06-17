<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const scouts = ref([]);
const loading = ref(false);
const error = ref("");
const actionMessage = ref("");
const actionError = ref("");
const updatingId = ref("");

const search = ref("");
const statusFilter = ref("ACTIVE");
const currentPage = ref(1);
const pageSize = ref(10);

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "INACTIVE", label: "Inativos" },
  { value: "REJECTED", label: "Rejeitados" }
];

function statusLabel(status) {
  const labels = {
    PENDING: "Pendente",
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    REJECTED: "Rejeitado"
  };

  return labels[status] || status || "-";
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

async function loadScouts() {
  try {
    loading.value = true;
    error.value = "";
    actionError.value = "";

    const params = {};

    if (statusFilter.value) {
      params.status = statusFilter.value;
    }

    if (search.value.trim()) {
      params.search = search.value.trim();
    }

    const response = await api.get("/admin/scouts", {
      params
    });

    scouts.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Não foi possível carregar os olheiros.";
  } finally {
    loading.value = false;
  }
}

async function updateScoutStatus(scout, status) {
  const actionLabels = {
    ACTIVE: "ativar",
    INACTIVE: "inativar",
    REJECTED: "rejeitar"
  };

  const confirmed = window.confirm(
    `Deseja realmente ${actionLabels[status] || "alterar"} o olheiro ${scout.name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    updatingId.value = scout.id;
    actionMessage.value = "";
    actionError.value = "";

    const response = await api.patch(`/admin/users/${scout.id}/status`, {
      status
    });

    actionMessage.value = response.data.message || "Status do olheiro atualizado com sucesso.";
    await loadScouts();
  } catch (err) {
    actionError.value = err.response?.data?.message || "Não foi possível atualizar o status do olheiro.";
  } finally {
    updatingId.value = "";
  }
}

const totalRecords = computed(() => scouts.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)));
const paginatedScouts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return scouts.value.slice(start, start + pageSize.value);
});
const pageStart = computed(() => (totalRecords.value ? (currentPage.value - 1) * pageSize.value + 1 : 0));
const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalRecords.value));

const activeCount = computed(() => scouts.value.filter((scout) => scout.status === "ACTIVE").length);
const pendingCount = computed(() => scouts.value.filter((scout) => scout.status === "PENDING").length);
const inactiveCount = computed(() => scouts.value.filter((scout) => scout.status === "INACTIVE").length);
const totalInterests = computed(() => scouts.value.reduce((sum, scout) => sum + Number(scout.interestsCount || 0), 0));

function goToPage(page) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}

function clearFilters() {
  search.value = "";
  statusFilter.value = "ACTIVE";
  currentPage.value = 1;
  loadScouts();
}

watch([statusFilter, pageSize], () => {
  currentPage.value = 1;
  loadScouts();
});

watch(totalPages, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

onMounted(loadScouts);
</script>

<template>
  <section>
    <section class="dashboard-heading">
      <div class="dashboard-heading-top">
        <p class="eyebrow">Administração</p>
      </div>

      <div class="dashboard-heading-main">
        <div>
          <h1>Olheiros</h1>
          <strong>Gerencie cadastros, status e atividade dos olheiros.</strong>
        </div>
        <p>{{ totalRecords }} olheiro(s) no filtro atual.</p>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card summary-tone-high">
        <span>Ativos</span>
        <strong>{{ activeCount }}</strong>
      </article>

      <article class="summary-card summary-tone-medium">
        <span>Pendentes</span>
        <strong>{{ pendingCount }}</strong>
      </article>

      <article class="summary-card summary-tone-low">
        <span>Inativos</span>
        <strong>{{ inactiveCount }}</strong>
      </article>

      <article class="summary-card summary-tone-interests">
        <span>Interesses</span>
        <strong>{{ totalInterests }}</strong>
      </article>
    </section>

    <section class="profile-panel">
      <div class="page-header compact-header">
        <div>
          <p class="eyebrow">Controle de olheiros</p>
          <h2>Listagem de olheiros</h2>
          <p class="page-description">
            A listagem exibe usuários com perfil Olheiro e consolida a quantidade de interesses registrados por cada um.
          </p>
        </div>

        <button class="button secondary" type="button" @click="loadScouts">
          Atualizar
        </button>
      </div>

      <section class="filters-panel admin-scouts-filters">
        <div class="field">
          <label>Buscar</label>
          <input
            v-model="search"
            type="text"
            placeholder="Nome ou e-mail do olheiro"
            @keyup.enter="loadScouts"
          />
        </div>

        <div class="field">
          <label>Status</label>
          <select v-model="statusFilter">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button class="button secondary" type="button" @click="clearFilters">
          Limpar
        </button>

        <button class="button" type="button" @click="loadScouts">
          Filtrar
        </button>
      </section>

      <p v-if="actionMessage" class="success-message">{{ actionMessage }}</p>
      <p v-if="actionError" class="error">{{ actionError }}</p>
      <p v-if="loading">Carregando olheiros...</p>
      <p v-else-if="error" class="error">{{ error }}</p>

      <div v-else-if="!paginatedScouts.length" class="empty">
        Nenhum olheiro encontrado para o filtro selecionado.
      </div>

      <div v-else class="table-wrapper admin-scouts-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Olheiro</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Interesses</th>
              <th>Último interesse</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="scout in paginatedScouts" :key="scout.id">
              <td>
                <strong>{{ scout.name }}</strong><br />
                <small>{{ scout.email }}</small>
              </td>

              <td>
                <span class="badge muted">{{ statusLabel(scout.status) }}</span>
              </td>

              <td>{{ formatDate(scout.createdAt) }}</td>

              <td>
                <strong>{{ scout.interestsCount || 0 }}</strong>
              </td>

              <td>
                <template v-if="scout.latestInterest">
                  <strong>{{ scout.latestInterest.athlete?.name || "Atleta não informado" }}</strong><br />
                  <small>
                    {{ formatDate(scout.latestInterest.createdAt) }}
                    ·
                    {{ scout.latestInterest.status }}
                  </small>
                </template>
                <span v-else>-</span>
              </td>

              <td>
                <div class="table-actions end">
                  <button
                    v-if="scout.status !== 'ACTIVE'"
                    class="button compact"
                    type="button"
                    :disabled="updatingId === scout.id"
                    @click="updateScoutStatus(scout, 'ACTIVE')"
                  >
                    Ativar
                  </button>

                  <button
                    v-if="scout.status === 'ACTIVE'"
                    class="button secondary compact"
                    type="button"
                    :disabled="updatingId === scout.id"
                    @click="updateScoutStatus(scout, 'INACTIVE')"
                  >
                    Inativar
                  </button>

                  <button
                    v-if="scout.status === 'PENDING'"
                    class="button secondary danger compact"
                    type="button"
                    :disabled="updatingId === scout.id"
                    @click="updateScoutStatus(scout, 'REJECTED')"
                  >
                    Rejeitar
                  </button>

                  <RouterLink
                    class="button secondary compact"
                    :to="{ path: '/interesses', query: { search: scout.email } }"
                  >
                    Ver interesses
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
            <button class="button secondary compact" type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
              Anterior
            </button>
            <span>Página {{ currentPage }} de {{ totalPages }}</span>
            <button class="button secondary compact" type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
              Próxima
            </button>
          </div>
        </footer>
      </div>
    </section>
  </section>
</template>
