<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import PublicHeader from "../components/layout/PublicHeader.vue";
import PublicFooter from "../components/layout/PublicFooter.vue";
import { api } from "../services/api";

const heroBackgrounds = [
  "/images/home/hero-1.png",
  "/images/home/hero-2.png",
  "/images/home/hero-3.png",
  "/images/home/hero-4.png"
];

const currentHeroBackgroundIndex = ref(0);

const currentHeroBackground = computed(() => {
  return heroBackgrounds[currentHeroBackgroundIndex.value];
});

let heroBackgroundTimer = null;

const homeAccessCode = ref("");
const homeAthlete = ref(null);
const homeSearchLoading = ref(false);
const homeSearchError = ref("");

const latestHomeEvaluation = computed(() => {
  return homeAthlete.value?.evaluations?.[0] || null;
});

const latestHomePerformance = computed(() => {
  return latestHomeEvaluation.value?.performanceResult || null;
});

function homeLevelLabel(level) {
  const labels = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto"
  };

  return labels[level] || level || "-";
}

function homeScoreLabel(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return value;
}

async function searchHomeAthlete() {
  const code = homeAccessCode.value.trim().toUpperCase();

  if (!code) {
    homeSearchError.value = "Digite seu código de acesso.";
    homeAthlete.value = null;
    return;
  }

  try {
    homeSearchLoading.value = true;
    homeSearchError.value = "";
    homeAthlete.value = null;

    const response = await api.get(`/athletes/access-code/${code}`);

    homeAthlete.value = response.data;
    homeAccessCode.value = code;
  } catch (err) {
    homeSearchError.value =
      err.response?.data?.message || "Não foi possível encontrar o atleta informado.";
  } finally {
    homeSearchLoading.value = false;
  }
}

onMounted(() => {
  heroBackgroundTimer = window.setInterval(() => {
    currentHeroBackgroundIndex.value =
      (currentHeroBackgroundIndex.value + 1) % heroBackgrounds.length;
  }, 6500);
});

onBeforeUnmount(() => {
  if (heroBackgroundTimer) {
    window.clearInterval(heroBackgroundTimer);
  }
});
</script>

<template>
  <div class="next-public-page">
    <PublicHeader />

    <main>
      <section class="home-hero">
        <div
          class="home-hero__background"
          :style="{ backgroundImage: `url(${currentHeroBackground})` }"
          aria-hidden="true"
        ></div>

        <div class="home-hero__overlay" aria-hidden="true"></div>

        <div class="next-container home-hero__grid">
          <div class="home-hero__content">
            <div class="next-eyebrow">NextFut · Plataforma de talentos</div>

            <h1 class="next-title">
              Conecte atletas e olheiros em uma experiência
              <span>simples, visual e inteligente.</span>
            </h1>

            <p class="next-text home-hero__text">
              Consulte rapidamente o Portal do Atleta por código de acesso ou entre no
              ambiente autenticado para importar avaliações, comparar jogadores e acompanhar análises.
            </p>

            <div class="next-actions">
              <RouterLink class="next-btn next-btn--primary" to="/portal-atleta">
                Consultar desempenho
              </RouterLink>

              <RouterLink class="next-btn next-btn--secondary" to="/login">
                Acessar plataforma
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      <section class="portal-strip">
        <div class="next-container">
          <div class="portal-strip__header">
            <div class="next-eyebrow">Acesso rápido</div>

            <h2 class="next-section-title">
              Escolha seu portal de acesso.
            </h2>

            <p class="next-text next-text--center">
              A NextFut separa a experiência de quem joga e de quem avalia,
              mantendo tudo conectado em uma única plataforma.
            </p>
          </div>

          <div class="portal-gateway portal-gateway--strip" aria-label="Acesso aos portais NextFut">
            <RouterLink to="/login?redirect=/portal-atleta" class="portal-card portal-card--athlete">
              <div class="portal-card__top">
                <div class="portal-card__icon">⚽</div>
                <span class="portal-card__badge">Para jogadores</span>
              </div>

              <h2>Portal do Atleta</h2>
              <p>
                Consulte pelo código de acesso para visualizar score, pontos fortes,
                pontos a melhorar e recomendações de treino.
              </p>

              <div class="portal-card__features">
                <span>Acesso por código</span>
                <span>Score do atleta</span>
                <span>Plano de evolução</span>
              </div>

              <strong class="portal-card__cta">Entrar como atleta →</strong>
            </RouterLink>

            <RouterLink to="/login?redirect=/dashboard" class="portal-card portal-card--scout">
              <div class="portal-card__top">
                <div class="portal-card__icon">◎</div>
                <span class="portal-card__badge">Para olheiros e gestores</span>
              </div>

              <h2>Dashboard do Olheiro</h2>
              <p>
                Entre como olheiro ou administrador para importar CSV, filtrar atletas,
                visualizar rankings, acompanhar KPIs e registrar interesses.
              </p>

              <div class="portal-card__features">
                <span>Importar CSV</span>
                <span>Ranking e filtros</span>
                <span>Análise de desempenho</span>
              </div>

              <strong class="portal-card__cta">Acessar dashboard →</strong>
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="performance-consult-section">
  <div class="next-container">
    <article class="performance-consult-card performance-consult-card--single">
      <div class="performance-consult-card__content">
        <div class="next-eyebrow">Portal do Atleta</div>

        <h2 class="next-section-title">
          Consulte seu desempenho.
        </h2>

        <p class="next-text">
          Digite seu código de acesso para visualizar score, pontos fortes,
          pontos a melhorar e recomendações para evolução.
        </p>

        <form class="performance-search-form" @submit.prevent="searchHomeAthlete">
          <label for="home-access-code">Código de acesso</label>

          <div class="performance-search-row">
            <input
              id="home-access-code"
              v-model="homeAccessCode"
              type="text"
              placeholder="Ex: NF-0001"
              autocomplete="off"
              :disabled="homeSearchLoading"
            />

            <button
              class="performance-search-button"
              type="submit"
              :disabled="homeSearchLoading"
            >
              {{ homeSearchLoading ? "Buscando..." : "Consultar" }}
            </button>
          </div>

          <p class="performance-search-hint">
            O código é informado pelo avaliador ou gestor da plataforma.
          </p>
        </form>

        <p v-if="homeSearchError" class="performance-search-error">
          {{ homeSearchError }}
        </p>

        <div v-if="homeAthlete" class="performance-result-card">
          <div class="performance-result-main">
            <span class="performance-result-badge">
              {{ homeAthlete.accessCode }}
            </span>

            <h3>{{ homeAthlete.name }}</h3>

            <p>
              {{ homeAthlete.position || "Posição não informada" }}
              ·
              {{ homeAthlete.region || homeAthlete.country || "Região não informada" }}
            </p>
          </div>

          <div class="performance-result-metrics">
            <div>
              <span>Score</span>
              <strong>
                {{ homeScoreLabel(latestHomePerformance?.performanceScore) }}
              </strong>
            </div>

            <div>
              <span>Nível</span>
              <strong>
                {{ homeLevelLabel(latestHomePerformance?.calculatedLevel || latestHomeEvaluation?.level) }}
              </strong>
            </div>
          </div>

          <RouterLink class="performance-result-link" to="/portal-atleta">
            Ver relatório completo no Portal do Atleta →
          </RouterLink>
        </div>

        <div class="performance-login-action">
          <RouterLink class="performance-login-button" to="/login">
            Entrar no NextFut
          </RouterLink>
        </div>
      </div>
    </article>
  </div>
</section>

      <section class="next-section home-strip-section">
        <div class="next-container">
          <div class="next-section-head--center">
            <div class="next-eyebrow">Como usar</div>

            <h2 class="next-section-title">Escolha o seu caminho.</h2>

            <p class="next-text next-text--center">
              A página principal funciona como uma entrada rápida para consulta pública,
              cadastro e acesso autenticado ao sistema.
            </p>
          </div>

          <div class="steps-grid">
            <article class="step-card">
              <span>1</span>
              <h3>Atleta consulta</h3>
              <p>O jogador acessa pelo código e acompanha seu relatório de desempenho.</p>
            </article>

            <article class="step-card">
              <span>2</span>
              <h3>Olheiro avalia</h3>
              <p>O olheiro entra no ambiente autenticado para analisar atletas e registrar interesse.</p>
            </article>

            <article class="step-card">
              <span>3</span>
              <h3>Sistema analisa</h3>
              <p>O backend calcula scores, níveis, pontos fortes e recomendações.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="next-section signup-section">
        <div class="next-container signup-band">
          <div>
            <div class="next-eyebrow">Cadastros públicos</div>

            <h2 class="next-section-title">Quer participar da plataforma?</h2>

            <p class="next-text">
              Atletas e olheiros podem solicitar cadastro. O acesso autenticado fica disponível
              após aprovação administrativa.
            </p>
          </div>

          <div class="signup-actions">
            <RouterLink class="next-btn next-btn--primary" to="/cadastro/atleta">
              Cadastro de Atleta
            </RouterLink>

            <RouterLink class="next-btn next-btn--secondary" to="/cadastro/olheiro">
              Cadastro de Olheiro
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <PublicFooter />
  </div>
</template>

<style scoped>
.next-public-page {
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #06101e;
  color: #f8fafc;
  line-height: 1.6;
  overflow-x: hidden;
}

.next-public-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.016) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.016) 1px, transparent 1px);
  background-size: 68px 68px;
  opacity: 0.26;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.32), transparent 82%);
}

.next-public-page :deep(a) {
  color: inherit;
  text-decoration: none;
}

.next-container {
  position: relative;
  z-index: 5;
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

.next-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  margin-bottom: 18px;
  padding: 8px 13px;
  border: 1px solid rgba(25, 229, 140, 0.46);
  border-radius: 999px;
  background: rgba(2, 12, 18, 0.26);
  color: #19e58c;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}

.next-title {
  margin: 0;
  max-width: 820px;
  font-size: clamp(2.4rem, 5.4vw, 5rem);
  line-height: 1.06;
  letter-spacing: -0.045em;
  font-weight: 850;
  text-shadow: 0 5px 30px rgba(0, 0, 0, 0.48);
}

.next-title span,
.next-section-title span {
  color: #19e58c;
}

.next-section-title {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 3rem);
  line-height: 1.16;
  letter-spacing: -0.035em;
}

.next-text {
  margin-top: 18px;
  color: #e2e8f0;
  font-size: 1.08rem;
  max-width: 720px;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.45);
}

.next-text--center {
  margin-inline: auto;
  text-align: center;
  text-shadow: none;
}

.next-actions,
.signup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.next-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
}

.next-btn--primary {
  background: linear-gradient(135deg, #19e58c, #0fbf72);
  color: #03120c;
  box-shadow: 0 18px 40px rgba(25, 229, 140, 0.24);
}

.next-btn--secondary {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(2, 12, 18, 0.34);
  color: #f8fafc;
  backdrop-filter: blur(7px);
}

.home-hero {
  position: relative;
  min-height: calc(100vh - 74px);
  display: grid;
  align-items: center;
  padding: 96px 0 110px;
  overflow: hidden;
  isolation: isolate;
  background: #06101e;
}

.home-hero__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transform: scale(1.005);
  filter: brightness(2.22) contrast(1.04) saturate(1.18);
  will-change: opacity;
}

.home-hero__background::after {
  content: none;
}

.home-hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      90deg,
      rgba(3, 7, 18, 0.52) 0%,
      rgba(3, 7, 18, 0.28) 30%,
      rgba(3, 7, 18, 0.07) 57%,
      rgba(3, 7, 18, 0) 100%
    ),
    linear-gradient(
      180deg,
      rgba(3, 7, 18, 0.02) 0%,
      rgba(3, 7, 18, 0.1) 74%,
      rgba(3, 7, 18, 0.22) 100%
    );
  pointer-events: none;
}

.home-hero::before {
  content: "";
  position: absolute;
  inset: -20% -10% auto auto;
  z-index: 2;
  width: 680px;
  height: 680px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(25, 229, 140, 0.025), transparent 66%);
  pointer-events: none;
}

.home-hero::after {
  content: "";
  position: absolute;
  inset: auto auto -22% -14%;
  z-index: 2;
  width: 620px;
  height: 620px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.018), transparent 68%);
  pointer-events: none;
}

.home-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 820px);
  gap: 42px;
  align-items: center;
  justify-content: start;
}

.home-hero__content {
  min-width: 0;
}

.home-hero__text {
  max-width: 760px;
}

.portal-strip {
  position: relative;
  padding: 72px 0 82px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at 18% 20%, rgba(56, 189, 248, 0.16), transparent 34%),
    radial-gradient(circle at 82% 20%, rgba(25, 229, 140, 0.16), transparent 34%),
    linear-gradient(135deg, #07111f 0%, #081827 48%, #06101e 100%);
  overflow: hidden;
}

.portal-strip::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 58px 58px;
  opacity: 0.32;
  mask-image: linear-gradient(to bottom, transparent, black 18%, black 82%, transparent);
}

.portal-strip__header {
  width: 100%;
  max-width: 820px;
  margin: 0 auto 38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.portal-strip__header .next-eyebrow {
  margin-left: auto;
  margin-right: auto;
}

.portal-gateway {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 26px;
}

.portal-card {
  position: relative;
  min-height: 390px;
  display: flex;
  flex-direction: column;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.028));
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.portal-card::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.85;
  pointer-events: none;
}

.portal-card--athlete::before {
  background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 48%);
}

.portal-card--scout::before {
  background: radial-gradient(circle at top right, rgba(25, 229, 140, 0.2), transparent 48%);
}

.portal-card:hover {
  transform: translateY(-8px);
  border-color: rgba(25, 229, 140, 0.38);
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.38);
  background: linear-gradient(180deg, rgba(25, 229, 140, 0.095), rgba(255, 255, 255, 0.035));
}

.portal-card > * {
  position: relative;
  z-index: 1;
}

.portal-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 26px;
}

.portal-card__icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 22px;
  background: rgba(25, 229, 140, 0.12);
  border: 1px solid rgba(25, 229, 140, 0.23);
  font-size: 1.65rem;
}

.portal-card--athlete .portal-card__icon {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.24);
}

.portal-card__badge {
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.11);
  color: #cbd5e1;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.portal-card h2 {
  margin: 0 0 14px;
  font-size: clamp(1.55rem, 2.4vw, 2.25rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.portal-card p {
  margin: 0;
  color: #cbd5e1;
  font-size: 1rem;
  line-height: 1.72;
}

.portal-card__features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.portal-card__features span {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.77rem;
  font-weight: 800;
}

.portal-card__cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 13px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #19e58c, #0fbf72);
  color: #03120c;
  font-weight: 950;
  box-shadow: 0 14px 32px rgba(25, 229, 140, 0.18);
}

.portal-card--athlete .portal-card__cta {
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #06101e;
  box-shadow: 0 14px 32px rgba(56, 189, 248, 0.18);
}

.performance-consult-section {
  position: relative;
  padding: 72px 0 18px;
  background:
    radial-gradient(circle at 18% 40%, rgba(25, 229, 140, 0.12), transparent 34%),
    radial-gradient(circle at 82% 26%, rgba(56, 189, 248, 0.12), transparent 32%),
    #06101e;
}

.performance-consult-card {
  position: relative;
  display: block;
  max-width: 1036px;
  margin-inline: auto;
  padding: clamp(26px, 4vw, 42px);
  border: 1px solid rgba(25, 229, 140, 0.22);
  border-radius: 34px;
  background:
    radial-gradient(circle at top left, rgba(25, 229, 140, 0.14), transparent 42%),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.032));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.performance-consult-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 82% 20%, rgba(56, 189, 248, 0.12), transparent 32%),
    linear-gradient(90deg, rgba(25, 229, 140, 0.06), transparent 46%);
}

.performance-consult-card > * {
  position: relative;
  z-index: 1;
}

.performance-consult-card__content {
  max-width: 760px;
}

.performance-consult-card__content .next-text {
  max-width: 720px;
  text-shadow: none;
}

.performance-login-action {
  display: flex;
  margin-top: 24px;
}

.performance-login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(2, 12, 18, 0.38);
  color: #f8fafc;
  font-weight: 950;
  backdrop-filter: blur(8px);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.performance-login-button:hover {
  transform: translateY(-2px);
  border-color: rgba(25, 229, 140, 0.42);
  background: rgba(25, 229, 140, 0.1);
}

.performance-search-form {
  display: grid;
  gap: 10px;
  max-width: 680px;
  margin-top: 28px;
}

.performance-search-form label {
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.performance-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.performance-search-row input {
  width: 100%;
  min-height: 52px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  outline: none;
  background: rgba(2, 12, 18, 0.46);
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.performance-search-row input::placeholder {
  color: rgba(203, 213, 225, 0.58);
}

.performance-search-row input:focus {
  border-color: rgba(25, 229, 140, 0.58);
  box-shadow: 0 0 0 4px rgba(25, 229, 140, 0.12);
}

.performance-search-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #19e58c, #0fbf72);
  color: #03120c;
  cursor: pointer;
  font-weight: 950;
  box-shadow: 0 14px 32px rgba(25, 229, 140, 0.2);
}

.performance-search-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.performance-search-hint {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.performance-search-error {
  margin: 16px 0 0;
  padding: 12px 14px;
  border: 1px solid rgba(248, 113, 113, 0.32);
  border-radius: 16px;
  background: rgba(127, 29, 29, 0.22);
  color: #fecaca;
  font-weight: 800;
}

.performance-result-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid rgba(25, 229, 140, 0.26);
  border-radius: 24px;
  background: rgba(2, 12, 18, 0.42);
  backdrop-filter: blur(8px);
}

.performance-result-badge {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 9px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(25, 229, 140, 0.12);
  color: #19e58c;
  font-size: 0.78rem;
  font-weight: 950;
}

.performance-result-card h3 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.1;
}

.performance-result-card p {
  margin: 6px 0 0;
  color: #cbd5e1;
}

.performance-result-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(86px, 1fr));
  gap: 10px;
}

.performance-result-metrics div {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
}

.performance-result-metrics span {
  display: block;
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 850;
  text-transform: uppercase;
}

.performance-result-metrics strong {
  display: block;
  margin-top: 2px;
  color: #19e58c;
  font-size: 1.25rem;
  line-height: 1;
}

.performance-result-link {
  grid-column: 1 / -1;
  display: inline-flex;
  width: fit-content;
  color: #38bdf8;
  font-weight: 950;
}

.next-section {
  padding: 88px 0;
}

.home-strip-section {
  background: rgba(255, 255, 255, 0.018);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.next-section-head--center {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 36px;
}

.next-section-head--center .next-eyebrow {
  margin-inline: auto;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.step-card {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: rgba(255, 255, 255, 0.04);
}

.step-card span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: rgba(25, 229, 140, 0.12);
  color: #19e58c;
  font-weight: 950;
  margin-bottom: 15px;
}

.step-card h3 {
  margin: 0;
  font-size: 1.08rem;
}

.step-card p {
  color: #94a3b8;
  margin: 8px 0 0;
}

.signup-section {
  padding-top: 72px;
}

.signup-band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 34px;
  align-items: center;
  padding: 34px;
  border: 1px solid rgba(25, 229, 140, 0.18);
  border-radius: 34px;
  background:
    radial-gradient(circle at top left, rgba(25, 229, 140, 0.13), transparent 40%),
    rgba(255, 255, 255, 0.04);
}

.signup-actions {
  justify-content: flex-end;
  margin-top: 0;
}

@media (max-width: 1100px) {
  .home-hero__grid,
  .signup-band {
    grid-template-columns: 1fr;
  }

  .signup-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 820px) {
  .next-container {
    width: min(100% - 28px, 1180px);
  }

  .home-hero {
    min-height: auto;
    padding: 64px 0 78px;
  }

  .performance-search-row,
  .performance-result-card,
  .portal-gateway,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .performance-search-row,
  .performance-result-card {
    grid-template-columns: 1fr;
  }

  .portal-card {
    min-height: auto;
  }
}

@media (max-width: 540px) {
  .next-title {
    font-size: 2.25rem;
  }

  .next-section-title {
    font-size: 1.75rem;
  }

  .next-text {
    font-size: 1rem;
  }

  .next-actions,
  .signup-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .next-btn {
    width: 100%;
  }

  .portal-card {
    padding: 22px;
    border-radius: 24px;
  }

  .portal-card__top {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>