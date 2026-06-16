<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const interests = ref([]);
const loading = ref(true);
const error = ref("");
const actionMessage = ref("");
const actionError = ref("");
const updatingId = ref("");

const search = ref("");
const status = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

async function loadInterests() {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get("/scout-interests");
    interests.value = response.data;
  } catch (err) {
    error.value = "Não foi possível carregar os interesses dos olheiros.";
  } finally {
    loading.value = false;
  }
}

async function updateInterestStatus(interestId, newStatus) {
  try {
    updatingId.value = interestId;
    actionMessage.value = "";
    actionError.value = "";

    await api.patch(`/scout-interests/${interestId}/status`, {
      status: newStatus
    });

    actionMessage.value = "Status atualizado com sucesso.";
    await loadInterests();
  } catch (err) {
    actionError.value = err.response?.data?.message || "Não foi possível atualizar o status.";
  } finally {
    updatingId.value = "";
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

function statusLabel(value) {
  const labels = {
    INTERESTED: "Interessado",
    CONTACTED: "Contatado",
    DISCARDED: "Descartado"
  };

  return labels[value] || value || "-";
}

const filteredInterests = computed(() => {
  const term = search.value.trim().toLowerCase();

  return interests.value.filter((interest) => {
    const matchesSearch =
      !term ||
      interest.scoutName?.toLowerCase().includes(term) ||
      interest.scoutEmail?.toLowerCase().includes(term) ||
      interest.athlete?.name?.toLowerCase().includes(term) ||
      interest.athlete?.accessCode?.toLowerCase().includes(term);

    const matchesStatus = !status.value || interest.status === status.value;

    return matchesSearch && matchesStatus;
  });
});

const totalRecords = computed(() => filteredInterests.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)));
const paginatedInterests = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredInterests.value.slice(start, start + pageSize.value);
});
const pageStart = computed(() => (totalRecords.value ? (currentPage.value - 1) * pageSize.value + 1 : 0));
const pageEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalRecords.value));

function goToPage(page) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}

watch([search, status, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

function clearFilters() {
  search.value = "";
  status.value = "";
}

onMounted(loadInterests);
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <p class="eyebrow">Olheiros</p>
        <h1>Interesses registrados</h1>
        <p class="page-description">
          Acompanhe os atletas que despertaram interesse de olheiros, técnicos ou avaliadores.
        </p>
      </div>

      <button class="button secondary" @click="loadInterests">
        Atualizar
      </button>
    </div>

    <p v-if="loading">Carregando interesses...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <p v-if="actionMessage" class="success">{{ actionMessage }}</p>
      <p v-if="actionError" class="error">{{ actionError }}</p>

      <section class="filters-panel interests-filters filters-panel-list">
        <div class="field">
          <label>Buscar</label>
          <input v-model="search" type="text" placeholder="Atleta, código, olheiro ou e-mail" />
        </div>

        <div class="field">
          <label>Status</label>
          <select v-model="status">
            <option value="">Todos</option>
            <option value="INTERESTED">Interessado</option>
            <option value="CONTACTED">Contatado</option>
            <option value="DISCARDED">Descartado</option>
          </select>
        </div>

        <button class="button secondary" @click="clearFilters">
          Limpar filtros
        </button>
      </section>

      <div class="list-header-row">
        <p class="list-counter">{{ totalRecords }} interesse(s) encontrado(s)</p>
      </div>

      <div v-if="!filteredInterests.length" class="empty">
        Nenhum interesse encontrado.
      </div>

      <div v-else class="interest-dashboard-list standardized-list">
        <article
          v-for="interest in paginatedInterests"
          :key="interest.id"
          class="interest-dashboard-card standardized-card"
        >
          <div class="interest-dashboard-main standardized-card-main">
            <div>
              <span class="badge">{{ statusLabel(interest.status) }}</span>
              <h2>{{ interest.athlete?.name || "Atleta não informado" }}</h2>
              <p>
                {{ interest.athlete?.position || "Posição não informada" }}
                ·
                {{ interest.athlete?.region || "Região não informada" }}
                ·
                {{ interest.athlete?.accessCode || "-" }}
              </p>
            </div>

            <div class="interest-date">
              <span>Registrado em</span>
              <strong>{{ formatDate(interest.createdAt) }}</strong>
            </div>
          </div>

          <div class="interest-dashboard-details">
            <div>
              <span>Olheiro</span>
              <strong>{{ interest.scoutName }}</strong>
            </div>

            <div>
              <span>E-mail</span>
              <strong>{{ interest.scoutEmail || "-" }}</strong>
            </div>
          </div>

          <p v-if="interest.notes" class="interest-notes">
            {{ interest.notes }}
          </p>

          <div class="interest-actions end">
            <button
              class="button secondary compact action-icon-button"
              :disabled="updatingId === interest.id || interest.status === 'INTERESTED'"
              @click="updateInterestStatus(interest.id, 'INTERESTED')"
            >
              <span>Interessado</span>
              <span class="button-icon">●</span>
            </button>

            <button
              class="button secondary compact action-icon-button"
              :disabled="updatingId === interest.id || interest.status === 'CONTACTED'"
              @click="updateInterestStatus(interest.id, 'CONTACTED')"
            >
              <span>Contatado</span>
              <span class="button-icon">✓</span>
            </button>

            <button
              class="button secondary danger compact action-icon-button"
              :disabled="updatingId === interest.id || interest.status === 'DISCARDED'"
              @click="updateInterestStatus(interest.id, 'DISCARDED')"
            >
              <span>Descartado</span>
              <span class="button-icon">×</span>
            </button>

            <RouterLink
              v-if="interest.athlete?.id"
              class="button compact action-icon-button"
              :to="`/atletas/${interest.athlete.id}`"
            >
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
