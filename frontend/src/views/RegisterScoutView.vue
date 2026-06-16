<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const form = ref({
  name: "",
  email: "",
  password: ""
});

const loading = ref(false);
const error = ref("");
const success = ref("");

async function submitRegister() {
  try {
    loading.value = true;
    error.value = "";
    success.value = "";

    await api.post("/auth/register/scout", form.value);

    success.value = "Cadastro enviado para aprovação. Você poderá acessar após liberação do administrador.";

    form.value = {
      name: "",
      email: "",
      password: ""
    };
  } catch (err) {
    error.value = err.response?.data?.message || "Não foi possível enviar o cadastro.";
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
          <small>Cadastro de olheiro</small>
        </span>
      </RouterLink>

      <div class="page-header compact-header">
        <div>
          <p class="eyebrow">Cadastro público</p>
          <h1>Cadastro de Olheiro</h1>
          <p>O acesso ficará pendente de aprovação administrativa.</p>
        </div>
      </div>

      <form class="form-grid" @submit.prevent="submitRegister">
        <label>
          <span>Nome</span>
          <input v-model="form.name" required />
        </label>

        <label>
          <span>E-mail</span>
          <input v-model="form.email" type="email" required />
        </label>

        <label>
          <span>Senha</span>
          <input v-model="form.password" type="password" required />
        </label>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>

        <div class="form-actions">
          <RouterLink class="button secondary" to="/">Voltar</RouterLink>
          <button class="button" type="submit" :disabled="loading">
            {{ loading ? "Enviando..." : "Enviar cadastro" }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>