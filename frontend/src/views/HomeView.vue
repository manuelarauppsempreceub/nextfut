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
      rgba(3, 7, 18, 0.00) 100%
    ),
    linear-gradient(
      180deg,
      rgba(3, 7, 18, 0.02) 0%,
      rgba(3, 7, 18, 0.10) 74%,
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