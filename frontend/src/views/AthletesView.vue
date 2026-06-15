<script setup>
import { onMounted, ref } from "vue";
import { api } from "../services/api";

const athletes = ref([]);
const loading = ref(true);
const error = ref("");

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

onMounted(loadAthletes);
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <p class="eyebrow">Banco de atletas</p>
        <h1>Atletas cadastrados</h1>
      </div>

      <button class="button secondary" @click="loadAthletes">
        Atualizar
      </button>
    </div>

    <p v-if="loading">Carregando atletas...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else class="grid">
      <article v-for="athlete in athletes" :key="athlete.id" class="card">
        <div class="card-header">
          <div>
            <h2>{{ athlete.name }}</h2>
            <p>{{ athlete.position || "Posição não informada" }} · {{ athlete.region || "Região não informada" }}</p>
          </div>

          <span class="badge">{{ athlete.accessCode }}</span>
        </div>

        <div class="metrics">
          <div>
            <span>Idade</span>
            <strong>{{ athlete.age || "-" }}</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{{ latestPerformance(athlete)?.performanceScore ?? "-" }}</strong>
          </div>

          <div>
            <span>Nível</span>
            <strong>{{ latestPerformance(athlete)?.calculatedLevel || latestEvaluation(athlete)?.level || "-" }}</strong>
          </div>
        </div>

        <div v-if="latestPerformance(athlete)" class="details">
          <p><strong>Pontos fortes:</strong> {{ latestPerformance(athlete).strengths.join(", ") }}</p>
          <p><strong>Pontos fracos:</strong> {{ latestPerformance(athlete).weaknesses.join(", ") }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
