import { Router } from "express";
import prisma from "../database/prisma.js";
import { calculatePerformance } from "../services/performance.service.js";
import { requireAuth, requireRoles } from "../services/auth.middleware.js";

const router = Router();

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function toFloat(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : fallback;
}

function normalizeManualEvaluation(body) {
  return {
    source: "MANUAL",
    physicalCondition: toInt(body.physicalCondition),
    ballControl: toInt(body.ballControl),
    passing: toInt(body.passing),
    finishing: toInt(body.finishing),
    dribbling: toInt(body.dribbling),
    decisionMaking: toInt(body.decisionMaking),
    discipline: toInt(body.discipline),
    goals: toInt(body.goals),
    assists: toInt(body.assists),
    accuratePasses: toInt(body.accuratePasses),
    wrongPasses: toInt(body.wrongPasses),
    tackles: toInt(body.tackles),
    fouls: toInt(body.fouls),
    shotsOnTarget: toInt(body.shotsOnTarget),
    minutesPlayed: toInt(body.minutesPlayed),
    games: toInt(body.games),
    successfulDribbles: toInt(body.successfulDribbles),
    duelsWon: toInt(body.duelsWon),
    recoveries: toInt(body.recoveries),
    approved: body.approved === undefined || body.approved === null ? null : Boolean(body.approved),
    finalGrade: toFloat(body.finalGrade),
    level: null,
    potential: toInt(body.potential)
  };
}

function hasAnyEvaluationData(evaluationData) {
  return Object.entries(evaluationData).some(([key, value]) => {
    if (["source", "approved", "level"].includes(key)) {
      return false;
    }

    return value !== null && value !== undefined;
  });
}

router.post("/athletes/:id/evaluations", requireAuth, requireRoles("ADMIN", "SCOUT"), async (req, res) => {
  const athlete = await prisma.athlete.findUnique({
    where: {
      id: req.params.id
    }
  });

  if (!athlete) {
    return res.status(404).json({
      message: "Atleta nao encontrado"
    });
  }

  const evaluationData = normalizeManualEvaluation(req.body);

  if (!hasAnyEvaluationData(evaluationData)) {
    return res.status(400).json({
      message: "Informe ao menos um dado de avaliacao"
    });
  }

  const performance = calculatePerformance(evaluationData);

  const evaluation = await prisma.evaluation.create({
    data: {
      athleteId: athlete.id,
      ...evaluationData,
      level: performance.calculatedLevel,
      performanceResult: {
        create: performance
      }
    },
    include: {
      evaluator: true,
      performanceResult: true
    }
  });

  res.status(201).json({
    message: "Avaliacao cadastrada com sucesso",
    evaluation
  });
});

export default router;