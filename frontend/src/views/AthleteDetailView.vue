<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "../services/api";

const route = useRoute();

const athlete = ref(null);
const loading = ref(true);
const error = ref("");

const interestLoading = ref(false);
const interestMessage = ref("");
const interestError = ref("");

const interestForm = ref({
  scoutName: "",
  scoutEmail: "",
  notes: ""
});

const latestEvaluation = computed(() => {
  return athlete.value?.evaluations?.[0] || null;
});

const latestPerformance = computed(() => {
  return latestEvaluation.value?.performanceResult || null;
});

async function loadAthlete() {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get(`/athletes/${route.params.id}`);
    athlete.value = response.data;
  } catch (err) {
    error.value = "Não foi possível carregar o perfil do atleta.";
  } finally {
    loading.value = false;
  }
}

async function submitInterest() {
  if (!interestForm.value.scoutName.trim()) {
    interestError.value = "Informe o nome do olheiro.";
    interestMessage.value = "";
    return;
  }

  try {
    interestLoading.value = true;
    interestError.value = "";
    interestMessage.value = "";

    await api.post(`/athletes/${athlete.value.id}/scout-interests`, {
      scoutName: interestForm.value.scoutName,
      scoutEmail: interestForm.value.scoutEmail,
      notes: interestForm.value.notes
    });

    interestMessage.value = "Interesse registrado com sucesso.";
    interestForm.value = {
      scoutName: "",
      scoutEmail: "",
      notes: ""
    };

    await loadAthlete();
  } catch (err) {
    interestError.value = err.response?.data?.message || "Não foi possível registrar o interesse.";
  } finally {
    interestLoading.value = false;
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

function levelLabel(level) {
  const labels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto"
  };

  return labels[level] || level || "-";
}

onMounted(loadAthlete);
</script>

<template>
  <section>
    <RouterLink class="back-link" to="/atletas">
      ← Voltar para atletas
    </RouterLink>

    <p v-if="loading">Carregando perfil...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else-if="athlete" class="detail-layout">
      <section class="profile-panel">
        <div class="profile-header">
          <div>
            <p class="eyebrow">Perfil do atleta</p>
            <h1>{{ athlete.name }}</h1>
            <p>
              {{ athlete.position || "Posição não informada" }}
              ·
              {{ athlete.region || "Região não informada" }}
            </p>
          </div>

          <span class="badge big">{{ athlete.accessCode }}</span>
        </div>

        <div class="metrics detail-metrics">
          <div>
            <span>Idade</span>
            <strong>{{ athlete.age || "-" }}</strong>
          </div>

          <div>
            <span>Altura</span>
            <strong>{{ athlete.heightCm ? `${athlete.heightCm} cm` : "-" }}</strong>
          </div>

          <div>
            <span>Pé dominante</span>
            <strong>{{ athlete.dominantFoot || "-" }}</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{{ latestPerformance?.performanceScore ?? "-" }}</strong>
          </div>

          <div>
            <span>Nível</span>
            <strong>{{ levelLabel(latestPerformance?.calculatedLevel || latestEvaluation?.level) }}</strong>
          </div>

          <div>
            <span>Potencial</span>
            <strong>{{ latestEvaluation?.potential || "-" }}</strong>
          </div>
        </div>

        <div v-if="latestPerformance" class="analysis-grid">
          <div class="analysis-card">
            <h2>Pontos fortes</h2>
            <ul>
              <li v-for="item in latestPerformance.strengths" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="analysis-card">
            <h2>Pontos fracos</h2>
            <ul>
              <li v-for="item in latestPerformance.weaknesses" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="analysis-card wide">
            <h2>Recomendações de treino</h2>
            <ul>
              <li v-for="item in latestPerformance.recommendations" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="profile-panel">
        <p class="eyebrow">Olheiro</p>
        <h2>Registrar interesse</h2>

        <div class="interest-form">
          <div class="field">
            <label>Nome do olheiro</label>
            <input v-model="interestForm.scoutName" type="text" placeholder="Nome" />
          </div>

          <div class="field">
            <label>E-mail</label>
            <input v-model="interestForm.scoutEmail" type="email" placeholder="email@exemplo.com" />
          </div>

          <div class="field full">
            <label>Observação</label>
            <textarea v-model="interestForm.notes" rows="4" placeholder="Ex: Atleta com bom potencial para avaliação presencial."></textarea>
          </div>

          <button class="button" :disabled="interestLoading" @click="submitInterest">
            {{ interestLoading ? "Registrando..." : "Registrar interesse" }}
          </button>
        </div>

        <p v-if="interestMessage" class="success">{{ interestMessage }}</p>
        <p v-if="interestError" class="error">{{ interestError }}</p>

        <div class="interest-list">
          <h3>Interesses registrados</h3>

          <div v-if="!athlete.scoutInterests?.length" class="empty">
            Nenhum interesse registrado.
          </div>

          <article v-for="interest in athlete.scoutInterests" :key="interest.id" class="interest-card">
            <div>
              <strong>{{ interest.scoutName }}</strong>
              <p>{{ interest.scoutEmail || "E-mail não informado" }}</p>
            </div>

            <span class="badge">{{ interest.status }}</span>

            <p v-if="interest.notes" class="interest-notes">
              {{ interest.notes }}
            </p>
          </article>
        </div>
      </section>

      <section class="profile-panel">
        <p class="eyebrow">Histórico</p>
        <h2>Avaliações</h2>

        <div v-if="!athlete.evaluations?.length" class="empty">
          Nenhuma avaliação cadastrada.
        </div>

        <div v-else class="timeline">
          <article
            v-for="evaluation in athlete.evaluations"
            :key="evaluation.id"
            class="timeline-item"
          >
            <div class="timeline-header">
              <strong>{{ formatDate(evaluation.evaluatedAt) }}</strong>
              <span class="badge">{{ levelLabel(evaluation.performanceResult?.calculatedLevel || evaluation.level) }}</span>
            </div>

            <div class="metrics compact">
              <div>
                <span>Score</span>
                <strong>{{ evaluation.performanceResult?.performanceScore ?? "-" }}</strong>
              </div>

              <div>
                <span>Nota</span>
                <strong>{{ evaluation.finalGrade ?? "-" }}</strong>
              </div>

              <div>
                <span>Fonte</span>
                <strong>{{ evaluation.source }}</strong>
              </div>
            </div>

            <p v-if="evaluation.evaluator">
              <strong>Avaliador:</strong> {{ evaluation.evaluator.name }}
            </p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
