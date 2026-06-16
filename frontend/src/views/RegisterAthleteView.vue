<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../services/api";

const form = ref({
  name: "",
  email: "",
  password: "",
  age: "",
  position: "",
  dominantFoot: "",
  heightCm: "",
  country: "Brasil",
  region: "",
  schoolProject: "",
  consentDataVisibility: false
});

const loading = ref(false);
const error = ref("");
const success = ref("");
const createdAccessCode = ref("");

async function submitRegister() {
  try {
    loading.value = true;
    error.value = "";
    success.value = "";
    createdAccessCode.value = "";

    const response = await api.post("/auth/register/athlete", {
      ...form.value,
      age: form.value.age ? Number(form.value.age) : null,
      heightCm: form.value.heightCm ? Number(form.value.heightCm) : null
    });

    createdAccessCode.value = response.data.athlete?.accessCode || "";
    success.value = "Cadastro enviado para aprovação. Você poderá acessar após liberação do administrador.";

    form.value = {
      name: "",
      email: "",
      password: "",
      age: "",
      position: "",
      dominantFoot: "",
      heightCm: "",
      country: "Brasil",
      region: "",
      schoolProject: "",
      consentDataVisibility: false
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
    <section class="auth-card wide-auth-card">
      <RouterLink class="public-brand auth-brand" to="/">
        <span class="brand-mark">NF</span>
        <span>
          <strong>NextFut</strong>
          <small>Cadastro de atleta</small>
        </span>
      </RouterLink>

      <div class="page-header compact-header">
        <div>
          <p class="eyebrow">Cadastro público</p>
          <h1>Cadastro de Atleta</h1>
          <p>Após o envio, o acesso ficará pendente de aprovação administrativa.</p>
        </div>
      </div>

      <form class="form-grid two-columns" @submit.prevent="submitRegister">
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

        <label>
          <span>Idade</span>
          <input v-model="form.age" type="number" min="5" max="25" />
        </label>

        <label>
          <span>Posição</span>
          <input v-model="form.position" placeholder="Ex.: Meia, Atacante, Goleiro" />
        </label>

        <label>
          <span>Pé dominante</span>
          <input v-model="form.dominantFoot" placeholder="Ex.: Direito, Esquerdo" />
        </label>

        <label>
          <span>Altura em cm</span>
          <input v-model="form.heightCm" type="number" min="80" max="230" />
        </label>

        <label>
          <span>País</span>
          <input v-model="form.country" />
        </label>

        <label>
          <span>Região/UF</span>
          <input v-model="form.region" />
        </label>

        <label>
          <span>Projeto/Escola</span>
          <input v-model="form.schoolProject" />
        </label>

        <label class="checkbox-row full-span">
          <input v-model="form.consentDataVisibility" type="checkbox" />
          <span>
            Concordo com a visualização dos meus dados por administradores e olheiros autorizados.
          </span>
        </label>

        <p v-if="error" class="error full-span">{{ error }}</p>

        <p v-if="success" class="success-message full-span">
          {{ success }}
          <strong v-if="createdAccessCode"> Código do atleta: {{ createdAccessCode }}</strong>
        </p>

        <div class="form-actions full-span">
          <RouterLink class="button secondary" to="/">Voltar</RouterLink>
          <button class="button" type="submit" :disabled="loading">
            {{ loading ? "Enviando..." : "Enviar cadastro" }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>