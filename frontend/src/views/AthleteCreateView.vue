<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { api } from "../services/api";

const router = useRouter();

const loading = ref(false);
const error = ref("");

const form = ref({
  name: "",
  age: "",
  position: "",
  dominantFoot: "",
  heightCm: "",
  country: "Brasil",
  region: "",
  schoolProject: ""
});

async function submitAthlete() {
  if (!form.value.name.trim()) {
    error.value = "Informe o nome do atleta.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

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

    const response = await api.post("/athletes", payload);
    const athleteId = response.data.athlete.id;

    router.push(`/atletas/${athleteId}`);
  } catch (err) {
    error.value = err.response?.data?.message || "Nao foi possivel cadastrar o atleta.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section>
    <RouterLink class="back-link" to="/atletas">
      &larr; Voltar para atletas
    </RouterLink>

    <div class="page-header">
      <div>
        <p class="eyebrow">Cadastro</p>
        <h1>Novo atleta</h1>
        <p class="page-description">
          Cadastre manualmente um atleta para gerar o c&oacute;digo de acesso e iniciar o acompanhamento.
        </p>
      </div>
    </div>

    <section class="profile-panel">
      <form class="athlete-create-form" @submit.prevent="submitAthlete">
        <div class="field full">
          <label>Nome do atleta *</label>
          <input v-model="form.name" type="text" placeholder="Ex: Lucas Andrade" />
        </div>

        <div class="field">
          <label>Idade</label>
          <input v-model="form.age" type="number" min="0" placeholder="Ex: 15" />
        </div>

        <div class="field">
          <label>Posi&ccedil;&atilde;o</label>
          <input v-model="form.position" type="text" placeholder="Ex: Volante" />
        </div>

        <div class="field">
          <label>P&eacute; dominante</label>
          <select v-model="form.dominantFoot">
            <option value="">N&atilde;o informado</option>
            <option value="Direito">Direito</option>
            <option value="Esquerdo">Esquerdo</option>
            <option value="Ambidestro">Ambidestro</option>
          </select>
        </div>

        <div class="field">
          <label>Altura em cm</label>
          <input v-model="form.heightCm" type="number" min="0" placeholder="Ex: 174" />
        </div>

        <div class="field">
          <label>Pa&iacute;s</label>
          <input v-model="form.country" type="text" placeholder="Ex: Brasil" />
        </div>

        <div class="field">
          <label>Regi&atilde;o</label>
          <input v-model="form.region" type="text" placeholder="Ex: Bras&iacute;lia" />
        </div>

        <div class="field full">
          <label>Escola ou projeto</label>
          <input v-model="form.schoolProject" type="text" placeholder="Ex: Projeto Escola Teste" />
        </div>

        <div class="athlete-create-actions full">
          <button class="button" type="submit" :disabled="loading">
            {{ loading ? "Cadastrando..." : "Cadastrar atleta" }}
          </button>

          <RouterLink class="button secondary" to="/atletas">
            Cancelar
          </RouterLink>
        </div>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </section>
</template>