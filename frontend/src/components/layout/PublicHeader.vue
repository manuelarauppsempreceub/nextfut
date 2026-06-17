<template>
  <header class="public-header">
    <RouterLink to="/" class="brand-link" aria-label="NextFut - Página inicial">
      <div class="brand-mark">
        NF
      </div>

      <div class="brand-copy">
        <strong>NextFut</strong>
        <span>Conectando atletas, avaliações e olheiros.</span>
      </div>
    </RouterLink>

    <nav class="public-nav" aria-label="Navegação pública">
      <div class="register-menu" ref="registerMenuRef">
        <button
          type="button"
          class="nav-button nav-button-primary"
          @click="toggleRegisterMenu"
        >
          Cadastrar
        </button>

        <div v-if="isRegisterMenuOpen" class="register-dropdown">
          <RouterLink
            to="/cadastro/atleta"
            class="register-dropdown-link"
            @click="closeRegisterMenu"
          >
            Cadastrar-se como Atleta
          </RouterLink>

          <RouterLink
            to="/cadastro/olheiro"
            class="register-dropdown-link"
            @click="closeRegisterMenu"
          >
            Cadastrar-se como Olheiro
          </RouterLink>
        </div>
      </div>

      <RouterLink to="/login" class="nav-button">
        Entrar
      </RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const isRegisterMenuOpen = ref(false);
const registerMenuRef = ref(null);

function toggleRegisterMenu() {
  isRegisterMenuOpen.value = !isRegisterMenuOpen.value;
}

function closeRegisterMenu() {
  isRegisterMenuOpen.value = false;
}

function handleClickOutside(event) {
  if (!registerMenuRef.value) {
    return;
  }

  if (!registerMenuRef.value.contains(event.target)) {
    closeRegisterMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.public-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem clamp(1.25rem, 4vw, 4rem);
  background: rgba(5, 18, 24, 0.9);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(16px);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: #f8fafc;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  color: #04111a;
  font-weight: 900;
  letter-spacing: -0.05em;
  box-shadow: 0 18px 40px rgba(34, 197, 94, 0.28);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.brand-copy strong {
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.brand-copy span {
  color: #a7b5c5;
  font-size: 0.78rem;
}

.public-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.5);
  color: #e2e8f0;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.nav-button:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 197, 94, 0.42);
  background: rgba(15, 23, 42, 0.85);
}

.nav-button-primary {
  border-color: rgba(34, 197, 94, 0.5);
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  color: #04111a;
}

.register-menu {
  position: relative;
}

.register-dropdown {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  min-width: 240px;
  padding: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  background: rgba(5, 18, 24, 0.98);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
}

.register-dropdown-link {
  display: block;
  padding: 0.8rem 0.9rem;
  border-radius: 14px;
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.register-dropdown-link:hover {
  background: rgba(34, 197, 94, 0.12);
  color: #bbf7d0;
}

@media (max-width: 720px) {
  .public-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .public-nav {
    width: 100%;
    flex-wrap: wrap;
  }

  .register-menu {
    flex: 1;
  }

  .nav-button {
    width: 100%;
  }

  .register-dropdown {
    left: 0;
    right: auto;
    width: min(280px, 90vw);
  }

  .brand-copy span {
    max-width: 260px;
  }
}
</style>