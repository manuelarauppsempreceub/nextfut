<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { clearSession, getCurrentUser } from "./services/auth";

const route = useRoute();
const router = useRouter();

const currentUser = ref(getCurrentUser());

const isPublicLayout = computed(() => Boolean(route.meta.publicLayout));

watch(
  () => route.fullPath,
  () => {
    currentUser.value = getCurrentUser();
  },
  {
    immediate: true
  }
);

function roleLabel(role) {
  const labels = {
    ADMIN: "Administrador",
    VISITOR: "Visitante",
    SCOUT: "Olheiro",
    ATHLETE: "Atleta"
  };

  return labels[role] || "Usuário";
}

function logout() {
  clearSession();
  currentUser.value = null;
  router.push("/");
}
</script>

<template>
  <RouterView v-if="isPublicLayout" />

  <div v-else class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand-block" to="/dashboard">
        <span class="brand-mark">NF</span>
        <span>
          <strong>NextFut</strong>
          <small>Scouting MVP</small>
        </span>
      </RouterLink>

      <nav class="main-nav" aria-label="Navegação principal">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/portal-atleta">Portal do Atleta</RouterLink>
        <RouterLink to="/atletas">Atletas</RouterLink>

        <RouterLink
          v-if="currentUser?.role === 'ADMIN' || currentUser?.role === 'SCOUT'"
          to="/olheiro"
        >
          Radar do Olheiro
        </RouterLink>

        <RouterLink
          v-if="currentUser?.role === 'ADMIN' || currentUser?.role === 'SCOUT'"
          to="/interesses"
        >
          Interesses
        </RouterLink>

        <RouterLink
          v-if="currentUser?.role === 'ADMIN'"
          to="/admin/usuarios"
        >
          Usuários
        </RouterLink>

        <RouterLink
          v-if="currentUser?.role === 'ADMIN'"
          to="/admin/olheiros"
        >
          Olheiros
        </RouterLink>

        <RouterLink
          v-if="currentUser?.role === 'ADMIN'"
          to="/importar"
        >
          Importar CSV
        </RouterLink>
      </nav>
    </aside>

    <div class="main-shell">
      <header class="topbar">
        <div>
          <strong>NextFut</strong>
          <span>Avaliação, performance e captação de atletas</span>
        </div>

        <div class="topbar-user">
          <span>{{ currentUser?.name || "Usuário" }}</span>
          <small>{{ roleLabel(currentUser?.role) }}</small>
          <button class="button secondary compact" type="button" @click="logout">
            Sair
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>