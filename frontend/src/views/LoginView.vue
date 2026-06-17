<script setup>
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { login } from "../services/auth";

const router = useRouter();
const route = useRoute();

const email = ref("admin@nextfut.local");
const password = ref("Admin@123");
const loading = ref(false);
const error = ref("");

async function submitLogin() {
  try {
    loading.value = true;
    error.value = "";

    await login(email.value, password.value);

    router.push(route.query.redirect || "/dashboard");
  } catch (err) {
    error.value = err.response?.data?.message || "Não foi possível realizar o login.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="public-page auth-page">
    <section class="auth-card">
      <RouterLink class="public-brand auth-brand" to="/">
        <span class="brand-mark">NF</span>
        <span>
          <strong>NextFut</strong>
          <small>Acesso à plataforma</small>
        </span>
      </RouterLink>

      <div class="page-header compact-header">
        <div>
          <p class="eyebrow">Login</p>
          <h1>Entrar no NextFut</h1>
        </div>
      </div>

      <form class="form-grid" @submit.prevent="submitLogin">
        <label>
          <span>E-mail</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label>
          <span>Senha</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="form-actions">
          <RouterLink class="button secondary" to="/">
            Voltar
          </RouterLink>

          <button class="button" type="submit" :disabled="loading">
            {{ loading ? "Entrando..." : "Entrar" }}
          </button>
        </div>
      </form>

      <div class="auth-links">
        <RouterLink to="/cadastro/atleta">Cadastrar como atleta</RouterLink>
        <RouterLink to="/cadastro/olheiro">Cadastrar como olheiro</RouterLink>
      </div>
    </section>
  </main>
</template>