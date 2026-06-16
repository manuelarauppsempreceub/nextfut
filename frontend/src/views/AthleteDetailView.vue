<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { api } from "../services/api";
import {
  canEditAthlete,
  canCreateEvaluation,
  canRegisterInterest
} from "../services/permissions";

const route = useRoute();

const athlete = ref(null);
const loading = ref(true);
const error = ref("");

const interestLoading = ref(false);
const interestMessage = ref("");
const interestError = ref("");

const evaluationLoading = ref(false);
const evaluationMessage = ref("");
const evaluationError = ref("");

const showEvaluationForm = ref(false);

const editLoading = ref(false);
const editMessage = ref("");
const editError = ref("");
const showEditForm = ref(false);

const editForm = ref({
  name: "",
  age: "",
  position: "",
  dominantFoot: "",
  heightCm: "",
  country: "",
  region: "",
  schoolProject: ""
});

const interestForm = ref({
  scoutName: "",
  scoutEmail: "",
  notes: ""
});

const emptyEvaluationForm = () => ({
  physicalCondition: "",
  ballControl: "",
  passing: "",
  finishing: "",
  dribbling: "",
  decisionMaking: "",
  discipline: "",
  goals: "",
  assists: "",
  accuratePasses: "",
  wrongPasses: "",
  tackles: "",
  fouls: "",
  shotsOnTarget: "",
  minutesPlayed: "",
  games: "",
  successfulDribbles: "",
  duelsWon: "",
  recoveries: "",
  finalGrade: "",
  potential: ""
});

const evaluationForm = ref(emptyEvaluationForm());

const latestEvaluation = computed(() => {
  return athlete.value?.evaluations?.[0] || null;
});

const latestPerformance = computed(() => {
  return latestEvaluation.value?.performanceResult || null;
});

function fillEditForm() {
  if (!athlete.value) {
    return;
  }

  editForm.value = {
    name: athlete.value.name || "",
    age: athlete.value.age || "",
    position: athlete.value.position || "",
    dominantFoot: athlete.value.dominantFoot || "",
    heightCm: athlete.value.heightCm || "",
    country: athlete.value.country || "",
    region: athlete.value.region || "",
    schoolProject: athlete.value.schoolProject || ""
  };

  editMessage.value = "";
  editError.value = "";
  showEditForm.value = true;
}

async function submitAthleteEdit() {
  if (!editForm.value.name.trim()) {
    editError.value = "Informe o nome do atleta.";
    editMessage.value = "";
    return;
  }

  try {
    editLoading.value = true;
    editError.value = "";
    editMessage.value = "";

    const payload = {
      name: editForm.value.name,
      age: editForm.value.age === "" ? null : Number(editForm.value.age),
      position: editForm.value.position,
      dominantFoot: editForm.value.dominantFoot,
      heightCm: editForm.value.heightCm === "" ? null : Number(editForm.value.heightCm),
      country: editForm.value.country,
      region: editForm.value.region,
      schoolProject: editForm.value.schoolProject
    };

    await api.put(`/athletes/${athlete.value.id}`, payload);

    editMessage.value = "Dados do atleta atualizados com sucesso.";
    showEditForm.value = false;

    await loadAthlete();
  } catch (err) {
    editError.value = err.response?.data?.message || "Não foi possível atualizar o atleta.";
  } finally {
    editLoading.value = false;
  }
}

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

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function submitEvaluation() {
  const payload = Object.fromEntries(
    Object.entries(evaluationForm.value).map(([key, value]) => [key, numberOrNull(value)])
  );

  const hasData = Object.values(payload).some((value) => value !== null);

  if (!hasData) {
    evaluationError.value = "Informe ao menos um dado de avaliação.";
    evaluationMessage.value = "";
    return;
  }

  try {
    evaluationLoading.value = true;
    evaluationError.value = "";
    evaluationMessage.value = "";

    await api.post(`/athletes/${athlete.value.id}/evaluations`, payload);

    evaluationMessage.value = "Avaliação cadastrada com sucesso.";
    evaluationForm.value = emptyEvaluationForm();
    showEvaluationForm.value = false;

    await loadAthlete();
  } catch (err) {
    evaluationError.value = err.response?.data?.message || "Não foi possível cadastrar a avaliação.";
  } finally {
    evaluationLoading.value = false;
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
    MEDIUM: "Medio",
    HIGH: "Alto"
  };

  return labels[level] || level || "-";
}

onMounted(loadAthlete);
</script>

<template>
  <section>
    <RouterLink class="back-link" to="/atletas">
      &larr; Voltar para atletas
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
              {{ athlete.position || "Posição nao informada" }}
              &middot;
              {{ athlete.region || "Região nao informada" }}
            </p>
          </div>

          <div class="profile-actions">
            <span class="badge big">{{ athlete.accessCode }}</span>

            <button
              v-if="canEditAthlete(athlete)"
              class="button secondary"
              @click="fillEditForm"
            >
              Editar atleta
            </button>
          </div>
        </div>

        <div v-if="showEditForm" class="modal-backdrop">
          <section class="modal-card" role="dialog" aria-modal="true">
            <header class="modal-header">
              <div>
                <p class="eyebrow">Edição cadastral</p>
                <h2>Editar atleta</h2>
              </div>
              <button class="modal-close" type="button" @click="showEditForm = false">×</button>
            </header>
            <form @submit.prevent="submitAthleteEdit">
              <div class="modal-body athlete-edit-form">
                <div class="field full"><label>Nome do atleta *</label><input v-model="editForm.name" type="text" /></div>
                <div class="field"><label>Idade</label><input v-model="editForm.age" type="number" min="0" /></div>
                <div class="field"><label>Posição</label><input v-model="editForm.position" type="text" /></div>
                <div class="field"><label>Pé dominante</label><select v-model="editForm.dominantFoot"><option value="">Não informado</option><option value="Direito">Direito</option><option value="Esquerdo">Esquerdo</option><option value="Ambidestro">Ambidestro</option></select></div>
                <div class="field"><label>Altura em cm</label><input v-model="editForm.heightCm" type="number" min="0" /></div>
                <div class="field"><label>País</label><input v-model="editForm.country" type="text" /></div>
                <div class="field"><label>Região</label><input v-model="editForm.region" type="text" /></div>
                <div class="field full"><label>Escola ou projeto</label><input v-model="editForm.schoolProject" type="text" /></div>
              </div>
              <footer class="modal-actions">
                <button class="button secondary" type="button" @click="showEditForm = false">Cancelar</button>
                <button class="button" type="submit" :disabled="editLoading">{{ editLoading ? "Salvando..." : "Salvar alterações" }}</button>
              </footer>
            </form>
          </section>
        </div>

        <p v-if="editMessage" class="success">{{ editMessage }}</p>
        <p v-if="editError" class="error">{{ editError }}</p>

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
            <span>P&eacute; dominante</span>
            <strong>{{ athlete.dominantFoot || "-" }}</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{{ latestPerformance?.performanceScore ?? "-" }}</strong>
          </div>

          <div>
            <span>N&iacute;vel</span>
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
            <h2>Recomenda&ccedil;&otilde;es de treino</h2>
            <ul>
              <li v-for="item in latestPerformance.recommendations" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="canCreateEvaluation()" class="profile-panel">
        <div class="section-title-row">
          <div>
            <p class="eyebrow">Avaliação</p>
            <h2>Cadastrar avaliação manual</h2>
          </div>

          <button class="button secondary" @click="showEvaluationForm = !showEvaluationForm">
            {{ showEvaluationForm ? "Fechar" : "Nova avaliação" }}
          </button>
        </div>

        <div v-if="showEvaluationForm" class="modal-backdrop">
          <section class="modal-card large" role="dialog" aria-modal="true">
            <header class="modal-header">
              <div>
                <p class="eyebrow">Avaliação manual</p>
                <h2>Nova avaliação</h2>
              </div>
              <button class="modal-close" type="button" @click="showEvaluationForm = false">×</button>
            </header>
            <form @submit.prevent="submitEvaluation">
              <div class="modal-body evaluation-form">
                <h3 class="full">Notas principais</h3>
                <div class="field"><label>Condição física (0 a 10)</label><input v-model="evaluationForm.physicalCondition" type="number" min="0" max="10" step="1" /></div>
                <div class="field"><label>Controle de bola (0 a 5)</label><input v-model="evaluationForm.ballControl" type="number" min="0" max="5" step="1" /></div>
                <div class="field"><label>Passe (0 a 5)</label><input v-model="evaluationForm.passing" type="number" min="0" max="5" step="1" /></div>
                <div class="field"><label>Finalização (0 a 5)</label><input v-model="evaluationForm.finishing" type="number" min="0" max="5" step="1" /></div>
                <div class="field"><label>Drible (0 a 5)</label><input v-model="evaluationForm.dribbling" type="number" min="0" max="5" step="1" /></div>
                <div class="field"><label>Tomada de decisão (0 a 5)</label><input v-model="evaluationForm.decisionMaking" type="number" min="0" max="5" step="1" /></div>
                <div class="field"><label>Disciplina (0 a 5)</label><input v-model="evaluationForm.discipline" type="number" min="0" max="5" step="1" /></div>
                <div class="field"><label>Potencial (0 a 5)</label><input v-model="evaluationForm.potential" type="number" min="0" max="5" step="1" /></div>
                <h3 class="full">Métricas de jogo</h3>
                <div class="field"><label>Gols</label><input v-model="evaluationForm.goals" type="number" min="0" /></div>
                <div class="field"><label>Assistências</label><input v-model="evaluationForm.assists" type="number" min="0" /></div>
                <div class="field"><label>Passes certos</label><input v-model="evaluationForm.accuratePasses" type="number" min="0" /></div>
                <div class="field"><label>Passes errados</label><input v-model="evaluationForm.wrongPasses" type="number" min="0" /></div>
                <div class="field"><label>Desarmes</label><input v-model="evaluationForm.tackles" type="number" min="0" /></div>
                <div class="field"><label>Faltas</label><input v-model="evaluationForm.fouls" type="number" min="0" /></div>
                <div class="field"><label>Chutes no gol</label><input v-model="evaluationForm.shotsOnTarget" type="number" min="0" /></div>
                <div class="field"><label>Minutos jogados</label><input v-model="evaluationForm.minutesPlayed" type="number" min="0" /></div>
                <div class="field"><label>Jogos</label><input v-model="evaluationForm.games" type="number" min="0" /></div>
                <div class="field"><label>Dribles certos</label><input v-model="evaluationForm.successfulDribbles" type="number" min="0" /></div>
                <div class="field"><label>Duelos vencidos</label><input v-model="evaluationForm.duelsWon" type="number" min="0" /></div>
                <div class="field"><label>Recuperações</label><input v-model="evaluationForm.recoveries" type="number" min="0" /></div>
                <div class="field"><label>Nota final</label><input v-model="evaluationForm.finalGrade" type="number" min="0" max="10" step="0.1" /></div>
              </div>
              <footer class="modal-actions">
                <button class="button secondary" type="button" @click="showEvaluationForm = false">Cancelar</button>
                <button class="button" type="submit" :disabled="evaluationLoading">{{ evaluationLoading ? "Salvando..." : "Salvar avaliação" }}</button>
              </footer>
            </form>
          </section>
        </div>

        <p v-if="evaluationMessage" class="success">{{ evaluationMessage }}</p>
        <p v-if="evaluationError" class="error">{{ evaluationError }}</p>
      </section>

      <section v-if="canRegisterInterest()" class="profile-panel">
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
            <label>Observacao</label>
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
              <p>{{ interest.scoutEmail || "E-mail nao informado" }}</p>
            </div>

            <span class="badge">{{ interest.status }}</span>

            <p v-if="interest.notes" class="interest-notes">
              {{ interest.notes }}
            </p>
          </article>
        </div>
      </section>

      <section v-if="!canCreateEvaluation() && !canRegisterInterest()" class="profile-panel">
        <p class="eyebrow">Permissões</p>
        <h2>Acesso do atleta</h2>
        <p class="page-description">
          Você pode visualizar suas informações e avaliações. A criação de novas avaliações
          e o registro de interesse são ações exclusivas de administradores e olheiros.
        </p>
      </section>      

      <section class="profile-panel">
        <p class="eyebrow">Histórico</p>
        <h2>Avaliacoes</h2>

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