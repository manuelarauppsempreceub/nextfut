<script setup>
import { ref } from "vue";
import { api } from "../services/api";

const selectedFile = ref(null);
const loading = ref(false);
const error = ref("");
const result = ref(null);

function handleFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null;
  result.value = null;
  error.value = "";
}

async function uploadCsv() {
  if (!selectedFile.value) {
    error.value = "Selecione um arquivo CSV antes de importar.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    result.value = null;

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const response = await api.post("/import/csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    result.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Erro ao importar CSV.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <p class="eyebrow">Importação</p>
        <h1>Importar atletas por CSV</h1>
        <p class="page-description">
          Envie uma planilha CSV para cadastrar ou atualizar atletas, avaliações e resultados de desempenho.
        </p>
      </div>
    </div>

    <section class="upload-panel">
      <div class="upload-box">
        <label for="csv-file">Arquivo CSV</label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          @change="handleFileChange"
        />

        <p v-if="selectedFile" class="file-info">
          Arquivo selecionado: <strong>{{ selectedFile.name }}</strong>
        </p>
      </div>

      <button class="button" :disabled="loading" @click="uploadCsv">
        {{ loading ? "Importando..." : "Importar CSV" }}
      </button>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="result" class="result-panel">
      <div class="result-header">
        <div>
          <p class="eyebrow">Resultado</p>
          <h2>{{ result.message }}</h2>
        </div>

        <span class="badge">{{ result.file?.originalName }}</span>
      </div>

      <div class="summary-grid">
        <article class="summary-card">
          <span>Linhas lidas</span>
          <strong>{{ result.summary?.rows ?? 0 }}</strong>
        </article>

        <article class="summary-card">
          <span>Recebidos</span>
          <strong>{{ result.summary?.received ?? 0 }}</strong>
        </article>

        <article class="summary-card">
          <span>Importados</span>
          <strong>{{ result.summary?.imported ?? 0 }}</strong>
        </article>

        <article class="summary-card">
          <span>Atletas criados</span>
          <strong>{{ result.summary?.athletesCreated ?? 0 }}</strong>
        </article>

        <article class="summary-card">
          <span>Atletas atualizados</span>
          <strong>{{ result.summary?.athletesUpdated ?? 0 }}</strong>
        </article>

        <article class="summary-card">
          <span>Avaliações criadas</span>
          <strong>{{ result.summary?.evaluationsCreated ?? 0 }}</strong>
        </article>

        <article class="summary-card">
          <span>Ignorados</span>
          <strong>{{ result.summary?.skipped ?? 0 }}</strong>
        </article>
      </div>

      <div v-if="result.summary?.errors?.length" class="errors-box">
        <h3>Erros encontrados</h3>
        <ul>
          <li v-for="item in result.summary.errors" :key="`${item.row}-${item.message}`">
            Linha {{ item.row }}: {{ item.message }}
          </li>
        </ul>
      </div>

      <div class="columns-box">
        <h3>Colunas identificadas</h3>
        <div class="chip-list">
          <span v-for="column in result.summary?.columns" :key="column" class="chip">
            {{ column }}
          </span>
        </div>
      </div>

      <div class="preview-box">
        <h3>Prévia das primeiras linhas</h3>

        <div v-if="!result.preview?.length" class="empty">
          Nenhuma linha para exibir.
        </div>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th v-for="column in result.summary?.columns" :key="column">
                  {{ column }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(row, index) in result.preview" :key="index">
                <td v-for="column in result.summary?.columns" :key="column">
                  {{ row[column] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </section>
</template>
