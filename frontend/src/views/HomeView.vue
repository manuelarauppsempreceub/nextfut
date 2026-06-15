<template>
  <section class="hero">
    <div>
      <p class="eyebrow">Plataforma NextFut</p>
      <h1>Conectando atletas, avaliações e olheiros.</h1>
      <p>
        MVP para cadastro, importação e análise de desempenho de jogadores de futebol.
      </p>

      <div class="hero-actions">
        <RouterLink class="button" to="/portal-atleta">
          Sou atleta
        </RouterLink>

        <RouterLink class="button secondary" to="/olheiro">
          Sou olheiro
        </RouterLink>

        <RouterLink class="button secondary" to="/importar">
          Importar CSV
        </RouterLink>
      </div>
    </div>
  </section>
</template>
