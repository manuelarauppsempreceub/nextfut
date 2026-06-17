<template>
  <footer class="next-public-footer">
    <div class="next-public-container next-public-footer__inner">
      <div class="next-public-footer__logo">
        <span class="next-public-logo__mark">NF</span>
        <strong>NextFut</strong>
      </div>

      <p>Conectando atletas, avaliações e olheiros.</p>
    </div>
  </footer>
</template>

<style scoped>
.next-public-footer {
  padding: 32px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #07111f;
  color: #94a3b8;
}

.next-public-container {
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

.next-public-footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.next-public-footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #f8fafc;
  font-size: 1rem;
}

.next-public-logo__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, #19e58c, #0ea5e9);
  color: #06101e;
  font-weight: 950;
}

.next-public-footer p {
  margin: 0;
}

@media (max-width: 700px) {
  .next-public-container {
    width: min(100% - 28px, 1180px);
  }
}
</style>
