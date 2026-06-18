<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Comparativo de desempenho"
  },
  description: {
    type: String,
    default: "Atleta comparado com a média dos demais atletas."
  },
  items: {
    type: Array,
    default: () => []
  }
});

const size = 360;
const center = size / 2;
const maxRadius = 122;
const levels = [20, 40, 60, 80, 100];

const chartItems = computed(() => {
  return props.items.filter((item) => item && item.label);
});

const hasData = computed(() => chartItems.value.length >= 3);

function clamp(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(Math.max(number, 0), 100);
}

function pointFor(index, value = 100) {
  const total = chartItems.value.length;
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  const radius = (clamp(value) / 100) * maxRadius;

  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle)
  };
}

function polygonPoints(key) {
  return chartItems.value
    .map((item, index) => {
      const point = pointFor(index, item[key]);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function gridPoints(level) {
  return chartItems.value
    .map((_, index) => {
      const point = pointFor(index, level);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function axisPoint(index) {
  return pointFor(index, 100);
}

function labelPoint(index) {
  const total = chartItems.value.length;
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  const radius = maxRadius + 30;

  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle)
  };
}

function labelAnchor(index) {
  const point = labelPoint(index);

  if (Math.abs(point.x - center) < 8) {
    return "middle";
  }

  return point.x > center ? "start" : "end";
}

function formatValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  return Math.round(number);
}
</script>

<template>
  <section class="radar-card">
    <div class="radar-card__header">
      <div>
        <p class="eyebrow">Radar técnico</p>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>

      <div class="radar-legend">
        <span class="legend-item legend-item--athlete">Atleta</span>
        <span class="legend-item legend-item--average">Média dos demais</span>
      </div>
    </div>

    <div v-if="hasData" class="radar-content">
      <div class="radar-figure">
        <svg :viewBox="`0 0 ${size} ${size}`" role="img" aria-label="Gráfico de teia comparativo">
          <polygon
            v-for="level in levels"
            :key="level"
            class="radar-grid"
            :points="gridPoints(level)"
          />

          <line
            v-for="(_, index) in chartItems"
            :key="`axis-${index}`"
            class="radar-axis"
            :x1="center"
            :y1="center"
            :x2="axisPoint(index).x"
            :y2="axisPoint(index).y"
          />

          <polygon
            class="radar-area radar-area--average"
            :points="polygonPoints('averageValue')"
          />

          <polygon
            class="radar-area radar-area--athlete"
            :points="polygonPoints('athleteValue')"
          />

          <polyline
            class="radar-line radar-line--average"
            :points="polygonPoints('averageValue')"
          />

          <polyline
            class="radar-line radar-line--athlete"
            :points="polygonPoints('athleteValue')"
          />

          <circle
            v-for="(item, index) in chartItems"
            :key="`athlete-dot-${item.key}`"
            class="radar-dot radar-dot--athlete"
            :cx="pointFor(index, item.athleteValue).x"
            :cy="pointFor(index, item.athleteValue).y"
            r="4"
          />

          <circle
            v-for="(item, index) in chartItems"
            :key="`average-dot-${item.key}`"
            class="radar-dot radar-dot--average"
            :cx="pointFor(index, item.averageValue).x"
            :cy="pointFor(index, item.averageValue).y"
            r="3"
          />

          <text
            v-for="(item, index) in chartItems"
            :key="`label-${item.key}`"
            class="radar-label"
            :x="labelPoint(index).x"
            :y="labelPoint(index).y"
            :text-anchor="labelAnchor(index)"
            dominant-baseline="middle"
          >
            {{ item.label }}
          </text>
        </svg>
      </div>

      <div class="radar-table">
        <div class="radar-table__row radar-table__row--head">
          <span>Critério</span>
          <span>Atleta</span>
          <span>Média</span>
        </div>

        <div
          v-for="item in chartItems"
          :key="item.key"
          class="radar-table__row"
        >
          <span>{{ item.label }}</span>
          <strong>{{ formatValue(item.athleteValue) }}</strong>
          <strong>{{ formatValue(item.averageValue) }}</strong>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      Dados insuficientes para gerar o gráfico de teia.
    </div>
  </section>
</template>

<style scoped>
.radar-card {
  padding: 24px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(25, 229, 140, 0.08), transparent 34%),
    #ffffff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
}

.radar-card__header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.radar-card__header h2 {
  margin: 0;
}

.radar-card__header p:not(.eyebrow) {
  margin: 6px 0 0;
  color: #64748b;
}

.radar-legend {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-end;
  gap: 8px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  font-weight: 850;
  color: #475569;
}

.legend-item::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-item--athlete::before {
  background: #19e58c;
}

.legend-item--average::before {
  background: #38bdf8;
}

.radar-content {
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(240px, 0.75fr);
  gap: 20px;
  align-items: center;
}

.radar-figure {
  min-width: 0;
}

.radar-figure svg {
  width: 100%;
  max-width: 430px;
  display: block;
  margin-inline: auto;
  overflow: visible;
}

.radar-grid {
  fill: none;
  stroke: rgba(100, 116, 139, 0.24);
  stroke-width: 1;
}

.radar-axis {
  stroke: rgba(100, 116, 139, 0.2);
  stroke-width: 1;
}

.radar-area {
  stroke-linejoin: round;
}

.radar-area--athlete {
  fill: rgba(25, 229, 140, 0.2);
}

.radar-area--average {
  fill: rgba(56, 189, 248, 0.16);
}

.radar-line {
  fill: none;
  stroke-width: 3;
  stroke-linejoin: round;
}

.radar-line--athlete {
  stroke: #0f9f63;
}

.radar-line--average {
  stroke: #0284c7;
  stroke-dasharray: 6 5;
}

.radar-dot--athlete {
  fill: #0f9f63;
}

.radar-dot--average {
  fill: #0284c7;
}

.radar-label {
  fill: #334155;
  font-size: 0.72rem;
  font-weight: 850;
}

.radar-table {
  display: grid;
  gap: 7px;
}

.radar-table__row {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) 0.55fr 0.55fr;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
  color: #334155;
  font-size: 0.9rem;
}

.radar-table__row--head {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.radar-table__row strong {
  text-align: right;
  color: #0f172a;
}

@media (max-width: 860px) {
  .radar-card__header,
  .radar-content {
    grid-template-columns: 1fr;
  }

  .radar-card__header {
    flex-direction: column;
  }

  .radar-legend {
    justify-content: flex-start;
  }
}
</style>