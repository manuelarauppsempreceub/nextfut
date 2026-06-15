function toNumber(value, fallback = null) {
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
  const number = toNumber(value);

  if (number === null) {
    return null;
  }

  return clamp(number, 0, 5) / 5;
}

function normalizeTen(value) {
  const number = toNumber(value);

  if (number === null) {
    return null;
  }

  return clamp(number, 0, 10) / 10;
}

function averageAvailable(values, fallback = 0.5) {
  const available = values.filter((value) => value !== null && value !== undefined);

  if (!available.length) {
    return fallback;
  }

  return available.reduce((sum, value) => sum + value, 0) / available.length;
}

function calculatePassAccuracy(accuratePasses, wrongPasses) {
  const accurate = toNumber(accuratePasses, 0);
  const wrong = toNumber(wrongPasses, 0);
  const total = accurate + wrong;

  if (total <= 0) {
    return null;
  }

  return accurate / total;
}

function calculateOffensiveEfficiency(goals, assists, shotsOnTarget) {
  const shots = toNumber(shotsOnTarget, 0);
  const goalsValue = toNumber(goals, 0);
  const assistsValue = toNumber(assists, 0);

  if (shots <= 0) {
    if (goalsValue > 0 || assistsValue > 0) {
      return 0.75;
    }

    return null;
  }

  return clamp((goalsValue + assistsValue) / shots, 0, 1);
}

function calculateDisciplinaryIndex(fouls) {
  const foulsValue = toNumber(fouls);

  if (foulsValue === null) {
    return null;
  }

  const maxFouls = 10;
  return clamp(1 - foulsValue / maxFouls, 0, 1);
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
    discipline: "Disciplina",
    passAccuracyRate: "Precisão de Passe",
    offensiveEfficiency: "Eficiência Ofensiva",
    disciplinaryIndex: "Índice Disciplinar"
  };

  return labels[key] || key;
}

function recommendationFromWeakness(weakness) {
  const recommendations = {
    "Condição Física": "Treino físico de resistência aeróbica, velocidade e força muscular",
    "Controle de Bola": "Treinos de domínio e controle de bola com exercícios de toque e condução",
    "Passe": "Treinos de passe curto e longo, tabelas e visão de jogo sob pressão",
    "Precisão de Passe": "Treinos de passe curto e longo, tabelas e visão de jogo sob pressão",
    "Finalização": "Treinos de finalização, chute ao gol e posicionamento ofensivo",
    "Eficiência Ofensiva": "Treinos de finalização, chute ao gol e posicionamento ofensivo",
    "Drible": "Treinos de condução, drible em espaço reduzido e proteção de bola",
    "Tomada de Decisão": "Treinos táticos, leitura de jogo e simulações sob pressão",
    "Disciplina": "Trabalho comportamental, controle emocional e respeito às regras",
    "Índice Disciplinar": "Trabalho comportamental, controle emocional e respeito às regras"
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

  const averageTechnicalNormalized = averageAvailable(technicalItems, 0.5);

  const physicalScore = normalizeTen(evaluation.physicalCondition);
  const tacticalScore = normalizeFive(evaluation.decisionMaking);
  const disciplineScore = normalizeFive(evaluation.discipline);

  const gameMetricScore = averageAvailable(
    [passAccuracyRate, offensiveEfficiency],
    0.5
  );

  const performanceScore =
    averageTechnicalNormalized * 40 +
    averageAvailable([physicalScore], 0.5) * 20 +
    averageAvailable([tacticalScore], 0.5) * 15 +
    gameMetricScore * 15 +
    averageAvailable([disciplineScore, disciplinaryIndex], 0.5) * 10;

  const attributes = [
    ["physicalCondition", physicalScore],
    ["ballControl", normalizeFive(evaluation.ballControl)],
    ["passing", normalizeFive(evaluation.passing)],
    ["finishing", normalizeFive(evaluation.finishing)],
    ["dribbling", normalizeFive(evaluation.dribbling)],
    ["decisionMaking", tacticalScore],
    ["discipline", disciplineScore],
    ["passAccuracyRate", passAccuracyRate],
    ["offensiveEfficiency", offensiveEfficiency],
    ["disciplinaryIndex", disciplinaryIndex]
  ].filter(([, value]) => value !== null && value !== undefined);

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
    disciplinaryIndex: disciplinaryIndex === null ? null : Number(disciplinaryIndex.toFixed(3)),
    averageTechnicalScore: Number((averageTechnicalNormalized * 5).toFixed(2)),
    strengths,
    weaknesses,
    recommendations
  };
}
