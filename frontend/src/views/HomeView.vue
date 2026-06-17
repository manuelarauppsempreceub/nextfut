<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import PublicHeader from "../components/layout/PublicHeader.vue";
import PublicFooter from "../components/layout/PublicFooter.vue";

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

const jogadores = [
  { iniciais: "PS", nome: "Pedro Silva", meta: "Atacante · Sub-13 · Alto potencial", score: 88 },
  { iniciais: "JV", nome: "João Victor", meta: "Meio-campo · Sub-11 · Evolução técnica", score: 87 },
  { iniciais: "LC", nome: "Lucas Costa", meta: "Defensor · Sub-12 · Perfil consistente", score: 86 }
];
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

          <aside class="home-panel" aria-label="Resumo da plataforma NextFut">
            <div class="home-panel__header">
              <span class="live-dot"></span>
              <strong>Radar NextFut</strong>
            </div>

            <div class="home-panel__score">
              <span>Match médio</span>
              <strong>91%</strong>
            </div>

            <div
              class="next-preview-row"
              v-for="jogador in jogadores"
              :key="jogador.nome"
            >
              <div class="next-avatar">{{ jogador.iniciais }}</div>

              <div>
                <strong>{{ jogador.nome }}</strong>
                <p>{{ jogador.meta }}</p>
              </div>

              <div class="next-score">{{ jogador.score }}%</div>
            </div>

            <div class="home-panel__note">
              <strong>Modelo de desempenho</strong>
              <p>Score, potencial, pontos fortes e recomendações em uma única jornada.</p>
            </div>
          </aside>
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
            <RouterLink to="/portal-atleta" class="portal-card portal-card--athlete">
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

              <strong class="portal-card__cta">Consultar desempenho →</strong>
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
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 68px 68px;
  opacity: 0.35;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.45), transparent 82%);
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
  border: 1px solid rgba(25, 229, 140, 0.42);
  border-radius: 999px;
  background: rgba(2, 12, 18, 0.34);
  color: #19e58c;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.next-title {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 4.4rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  font-weight: 850;
  text-shadow: 0 4px 28px rgba(0, 0, 0, 0.52);
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
  color: #dbeafe;
  font-size: 1.08rem;
  max-width: 720px;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.55);
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
  transition: 0.2s;
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
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(2, 12, 18, 0.42);
  color: #f8fafc;
  backdrop-filter: blur(8px);
}

/* HERO COM IMAGEM MUITO MAIS VISÍVEL */
.home-hero {
  position: relative;
  min-height: calc(100vh - 74px);
  display: grid;
  align-items: center;
  padding: 78px 0 92px;
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
  filter: brightness(2.15) contrast(1.05) saturate(1.16);
  will-change: opacity;
}

/* Removido o overlay escuro que estava dentro da própria imagem */
.home-hero__background::after {
  content: none;
}

.home-hero__background--active {
  opacity: 1;
}

.home-hero__background--next {
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}

.home-hero__background--next.is-visible {
  opacity: 1;
}

/* Overlay bem leve: escurece só o suficiente para o texto à esquerda */
.home-hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      90deg,
      rgba(3, 7, 18, 0.58) 0%,
      rgba(3, 7, 18, 0.34) 31%,
      rgba(3, 7, 18, 0.10) 58%,
      rgba(3, 7, 18, 0.02) 100%
    ),
    linear-gradient(
      180deg,
      rgba(3, 7, 18, 0.04) 0%,
      rgba(3, 7, 18, 0.14) 72%,
      rgba(3, 7, 18, 0.28) 100%
    );
  pointer-events: none;
}

/* Brilhos decorativos praticamente neutros para não “sujar” a imagem */
.home-hero::before {
  content: "";
  position: absolute;
  inset: -20% -10% auto auto;
  z-index: 2;
  width: 680px;
  height: 680px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(25, 229, 140, 0.035), transparent 66%);
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
  background: radial-gradient(circle, rgba(56, 189, 248, 0.025), transparent 68%);
  pointer-events: none;
}

.home-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.68fr);
  gap: 42px;
  align-items: center;
}

.home-hero__content {
  min-width: 0;
}

.home-hero__text {
  max-width: 760px;
}

/* Card mais translúcido para deixar a imagem aparecer atrás */
.home-panel {
  position: relative;
  padding: 26px;
  border: 1px solid rgba(25, 229, 140, 0.34);
  border-radius: 34px;
  background:
    radial-gradient(circle at top, rgba(25, 229, 140, 0.13), transparent 55%),
    rgba(4, 16, 24, 0.34);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(8px);
}

.home-panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
  margin-bottom: 18px;
}

.live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #19e58c;
  box-shadow: 0 0 0 6px rgba(25, 229, 140, 0.12), 0 0 24px rgba(25, 229, 140, 0.65);
}

.home-panel__score {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 24px;
  background: rgba(4, 16, 24, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.home-panel__score span {
  color: #cbd5e1;
  font-weight: 800;
}

.home-panel__score strong {
  color: #19e58c;
  font-size: 3rem;
  line-height: 0.9;
  letter-spacing: -0.06em;
}

.next-preview-row {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  background: rgba(4, 16, 24, 0.34);
}

.next-preview-row + .next-preview-row {
  margin-top: 10px;
}

.next-preview-row p {
  margin: 2px 0 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.next-avatar {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, #19e58c, #2563eb);
  display: grid;
  place-items: center;
  color: #06101e;
  font-weight: 950;
}

.next-score {
  color: #19e58c;
  font-weight: 950;
}

.home-panel__note {
  margin-top: 16px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(56, 189, 248, 0.22);
  background: rgba(3, 20, 32, 0.38);
}

.home-panel__note strong {
  color: #38bdf8;
}

.home-panel__note p {
  margin: 5px 0 0;
  color: #e2e8f0;
  font-size: 0.92rem;
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
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
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

  .home-panel {
    max-width: 620px;
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
    padding: 54px 0 70px;
  }

  .portal-gateway,
  .steps-grid {
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

  .portal-card {
    padding: 22px;
    border-radius: 24px;
  }

  .portal-card__top {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-panel {
    padding: 18px;
    border-radius: 26px;
  }

  .next-preview-row {
    grid-template-columns: 44px 1fr;
  }

  .next-preview-row .next-score {
    grid-column: 2;
  }

  .home-panel__score strong {
    font-size: 2.4rem;
  }
}
</style>