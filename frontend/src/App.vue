<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <strong class="brand">NextFut</strong>
        <span class="subtitle">Avaliação e scouting de atletas</span>
      </div>

      <nav>
        <RouterLink to="/">Início</RouterLink>
        <RouterLink to="/atletas">Atletas</RouterLink>
        <RouterLink to="/olheiro">Olheiro</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>
