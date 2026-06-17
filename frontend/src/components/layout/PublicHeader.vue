<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <header class="next-public-header">
    <nav class="next-public-nav next-public-container" aria-label="Navegação pública NextFut">
      <RouterLink class="next-public-logo" to="/">
        <span class="next-public-logo__mark">NF</span>
        <span>NextFut</span>
      </RouterLink>

      <ul class="next-public-menu">
        <li><RouterLink to="/portal-atleta">Portal do Atleta</RouterLink></li>
        <li><RouterLink to="/cadastro/atleta">Cadastro de Atleta</RouterLink></li>
        <li><RouterLink to="/cadastro/olheiro">Cadastro de Olheiro</RouterLink></li>
      </ul>

      <div class="next-public-nav-actions">
        <RouterLink class="next-public-nav-pill next-public-nav-pill--soft" to="/portal-atleta">
          Consultar desempenho
        </RouterLink>
        <RouterLink class="next-public-nav-pill" to="/login">
          Entrar
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.next-public-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(7, 17, 31, 0.82);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.next-public-container {
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

.next-public-nav {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.next-public-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #f8fafc;
  text-decoration: none;
  font-weight: 950;
  letter-spacing: -0.04em;
  font-size: 1.22rem;
}

.next-public-logo__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: linear-gradient(135deg, #19e58c, #0ea5e9);
  color: #06101e;
  font-weight: 950;
}

.next-public-menu {
  display: flex;
  gap: 8px;
  list-style: none;
  align-items: center;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
}

.next-public-menu a {
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 9px 12px;
  border-radius: 999px;
  text-decoration: none;
}

.next-public-menu a:hover,
.next-public-menu a.router-link-active {
  color: #19e58c;
  background: rgba(25, 229, 140, 0.08);
}

.next-public-nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.next-public-nav-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  background: linear-gradient(135deg, #19e58c, #0fbf72);
  color: #03120c;
  font-size: 0.84rem;
  font-weight: 950;
  text-decoration: none;
  box-shadow: 0 12px 28px rgba(25, 229, 140, 0.2);
}

.next-public-nav-pill--soft {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  box-shadow: none;
}

@media (max-width: 900px) {
  .next-public-menu {
    display: none;
  }
}

@media (max-width: 700px) {
  .next-public-container {
    width: min(100% - 28px, 1180px);
  }

  .next-public-nav {
    min-height: 68px;
  }

  .next-public-nav-actions {
    gap: 8px;
  }

  .next-public-nav-pill--soft {
    display: none;
  }
}
</style>
