<script setup>
import { computed, onMounted, ref } from "vue";
import { api } from "../services/api";

const users = ref([]);
const loading = ref(false);
const error = ref("");
const statusFilter = ref("PENDING");

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "INACTIVE", label: "Inativos" },
  { value: "REJECTED", label: "Rejeitados" }
];

function roleLabel(role) {
  const labels = {
    ADMIN: "Administrador",
    VISITOR: "Visitante",
    SCOUT: "Olheiro",
    ATHLETE: "Atleta"
  };

  return labels[role] || role || "-";
}

function statusLabel(status) {
  const labels = {
    PENDING: "Pendente",
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    REJECTED: "Rejeitado"
  };

  return labels[status] || status || "-";
}

const pendingCount = computed(() => users.value.filter((user) => user.status === "PENDING").length);

async function loadUsers() {
  try {
    loading.value = true;
    error.value = "";

    const params = {};

    if (statusFilter.value) {
      params.status = statusFilter.value;
    }

    const response = await api.get("/admin/users", {
      params
    });

    users.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Não foi possível carregar os usuários.";
  } finally {
    loading.value = false;
  }
}

async function updateStatus(user, status) {
  try {
    error.value = "";

    await api.patch(`/admin/users/${user.id}/status`, {
      status
    });

    await loadUsers();
  } catch (err) {
    error.value = err.response?.data?.message || "Não foi possível atualizar o status.";
  }
}

onMounted(loadUsers);
</script>

<template>
  <section class="dashboard-heading">
    <div class="dashboard-heading-top">
      <p class="eyebrow">Administração</p>
    </div>

    <div class="dashboard-heading-main">
      <div>
        <h1>Usuários e aprovações</h1>
        <strong>Gerencie cadastros pendentes e acessos da plataforma.</strong>
      </div>
      <p>{{ pendingCount }} cadastro(s) pendente(s) no filtro atual.</p>
    </div>
  </section>

  <section class="profile-panel">
    <div class="page-header compact-header">
      <div>
        <p class="eyebrow">Controle de acesso</p>
        <h2>Lista de usuários</h2>
      </div>

      <div class="toolbar-actions">
        <select v-model="statusFilter" @change="loadUsers">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <button class="button secondary" type="button" @click="loadUsers">
          Atualizar
        </button>
      </div>
    </div>

    <p v-if="loading">Carregando usuários...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else-if="!users.length" class="empty">
      Nenhum usuário encontrado para o filtro selecionado.
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Status</th>
            <th>Atleta vinculado</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <strong>{{ user.name }}</strong>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ roleLabel(user.role) }}</td>
            <td>
              <span class="badge muted">{{ statusLabel(user.status) }}</span>
            </td>
            <td>
              <span v-if="user.athlete">
                {{ user.athlete.name }} · {{ user.athlete.accessCode }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <div class="table-actions">
                <button
                  v-if="user.status !== 'ACTIVE'"
                  class="button compact"
                  type="button"
                  @click="updateStatus(user, 'ACTIVE')"
                >
                  Aprovar
                </button>

                <button
                  v-if="user.status === 'PENDING'"
                  class="button secondary compact"
                  type="button"
                  @click="updateStatus(user, 'REJECTED')"
                >
                  Rejeitar
                </button>

                <button
                  v-if="user.status === 'ACTIVE'"
                  class="button secondary compact"
                  type="button"
                  @click="updateStatus(user, 'INACTIVE')"
                >
                  Inativar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>