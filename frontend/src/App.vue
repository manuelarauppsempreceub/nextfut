<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand-block" to="/">
        <span class="brand-mark">NF</span>
        <span>
          <strong>NextFut</strong>
          <small>Scouting MVP</small>
        </span>
      </RouterLink>

      <nav class="main-nav" aria-label="Navegação principal">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/portal-atleta">Portal do Atleta</RouterLink>
        <RouterLink to="/atletas">Atletas</RouterLink>
        <RouterLink to="/olheiro">Radar do Olheiro</RouterLink>
        <RouterLink to="/interesses">Interesses</RouterLink>
        <RouterLink to="/importar">Importar CSV</RouterLink>
      </nav>
    </aside>

    <div class="main-shell">
      <header class="topbar">
        <div>
          <strong>NextFut</strong>
          <span>Avaliação, performance e captação de atletas</span>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
