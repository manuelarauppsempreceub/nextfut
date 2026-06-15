function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).replace(",", ".");
  const number = Number(normalized);

  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeFive(value) {
  return clamp(toNumber(value), 0, 5) / 5;
}

function normalizeTen(value) {
  return clamp(toNumber(value), 0, 10) / 10;
}

function calculatePassAccuracy(accuratePasses, wrongPasses) {
  const accurate = toNumber(accuratePasses);
  const wrong = toNumber(wrongPasses);
  const total = accurate + wrong;

  if (total <= 0) {
    return null;
  }

  return accurate / total;
}

function calculateOffensiveEfficiency(goals, assists, shotsOnTarget) {
  const shots = toNumber(shotsOnTarget);
  if (shots <= 0) {
    return null;
  }

  return clamp((toNumber(goals) + toNumber(assists)) / shots, 0, 1);
}

function calculateDisciplinaryIndex(fouls) {
  const maxFouls = 10;
  return clamp(1 - toNumber(fouls) / maxFouls, 0, 1);
}

function getLevelFromScore(score) {
  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 50) {
    return "MEDIUM";
  }

  return "LOW";
}

function labelFromKey(key) {
  const labels = {
    physicalCondition: "Condição Física",
    ballControl: "Controle de Bola",
    passing: "Passe",
    finishing: "Finalização",
    dribbling: "Drible",
    decisionMaking: "Tomada de Decisão",
    discipline: "Disciplina"
  };

  return labels[key] || key;
}

function recommendationFromWeakness(weakness) {
  const recommendations = {
    "Condição Física": "Treino físico de resistência aeróbica, velocidade e força muscular",
    "Controle de Bola": "Treinos de domínio e controle de bola com exercícios de toque e condução",
    "Passe": "Treinos de passe curto e longo, tabelas e visão de jogo sob pressão",
    "Finalização": "Treinos de finalização, chute ao gol e posicionamento ofensivo",
    "Drible": "Treinos de condução, drible em espaço reduzido e proteção de bola",
    "Tomada de Decisão": "Treinos táticos, leitura de jogo e simulações sob pressão",
    "Disciplina": "Trabalho comportamental, controle emocional e respeito às regras"
  };

  return recommendations[weakness] || "Manter rotina de treino e buscar evolução técnica contínua";
}

export function calculatePerformance(evaluation) {
  const passAccuracyRate = calculatePassAccuracy(
    evaluation.accuratePasses,
    evaluation.wrongPasses
  );

  const offensiveEfficiency = calculateOffensiveEfficiency(
    evaluation.goals,
    evaluation.assists,
    evaluation.shotsOnTarget
  );

  const disciplinaryIndex = calculateDisciplinaryIndex(evaluation.fouls);

  const technicalItems = [
    normalizeFive(evaluation.ballControl),
    normalizeFive(evaluation.passing),
    normalizeFive(evaluation.finishing),
    normalizeFive(evaluation.dribbling)
  ];

  const averageTechnicalScore =
    technicalItems.reduce((sum, value) => sum + value, 0) / technicalItems.length;

  const physicalScore = normalizeTen(evaluation.physicalCondition);
  const tacticalScore = normalizeFive(evaluation.decisionMaking);
  const disciplineScore = normalizeFive(evaluation.discipline);

  const gameMetricScore =
    ((passAccuracyRate ?? 0.5) + (offensiveEfficiency ?? 0.5)) / 2;

  const performanceScore =
    averageTechnicalScore * 40 +
    physicalScore * 20 +
    tacticalScore * 15 +
    gameMetricScore * 15 +
    disciplineScore * 10;

  const attributes = [
    ["physicalCondition", normalizeTen(evaluation.physicalCondition)],
    ["ballControl", normalizeFive(evaluation.ballControl)],
    ["passing", normalizeFive(evaluation.passing)],
    ["finishing", normalizeFive(evaluation.finishing)],
    ["dribbling", normalizeFive(evaluation.dribbling)],
    ["decisionMaking", normalizeFive(evaluation.decisionMaking)],
    ["discipline", normalizeFive(evaluation.discipline)]
  ];

  const sorted = [...attributes].sort((a, b) => b[1] - a[1]);

  const strengths = sorted.slice(0, 3).map(([key]) => labelFromKey(key));
  const weaknesses = sorted.slice(-3).reverse().map(([key]) => labelFromKey(key));

  const recommendations = [...new Set(
    weaknesses.map((weakness) => recommendationFromWeakness(weakness))
  )];

  const roundedScore = Number(performanceScore.toFixed(1));

  return {
    performanceScore: roundedScore,
    calculatedLevel: getLevelFromScore(roundedScore),
    passAccuracyRate: passAccuracyRate === null ? null : Number(passAccuracyRate.toFixed(3)),
    offensiveEfficiency: offensiveEfficiency === null ? null : Number(offensiveEfficiency.toFixed(3)),
    disciplinaryIndex: Number(disciplinaryIndex.toFixed(3)),
    averageTechnicalScore: Number((averageTechnicalScore * 5).toFixed(2)),
    strengths,
    weaknesses,
    recommendations
  };
}
