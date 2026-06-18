import { Router } from "express";
import prisma from "../database/prisma.js";
import { requireAuth, requireRoles } from "../services/auth.middleware.js";

const router = Router();

const RADAR_CRITERIA = [
  {
    key: "physicalCondition",
    label: "Físico",
    max: 10
  },
  {
    key: "ballControl",
    label: "Controle",
    max: 5
  },
  {
    key: "passing",
    label: "Passe",
    max: 5
  },
  {
    key: "finishing",
    label: "Finalização",
    max: 5
  },
  {
    key: "dribbling",
    label: "Drible",
    max: 5
  },
  {
    key: "decisionMaking",
    label: "Decisão",
    max: 5
  },
  {
    key: "discipline",
    label: "Disciplina",
    max: 5
  },
  {
    key: "potential",
    label: "Potencial",
    max: 5
  }
];

function normalizeText(value) {
  return String(value || "").trim();
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function normalizeToHundred(value, max) {
  if (value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  const normalized = (Math.min(Math.max(number, 0), max) / max) * 100;

  return Math.round(normalized);
}

function average(values) {
  const validValues = values.filter((value) => value !== null && value !== undefined);

  if (!validValues.length) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return total / validValues.length;
}

router.get("/athletes/:id/performance-comparison", async (req, res) => {
  try {
    const athlete = await prisma.athlete.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        evaluations: {
          orderBy: {
            evaluatedAt: "desc"
          },
          take: 1,
          select: {
            id: true,
            evaluatedAt: true,
            physicalCondition: true,
            ballControl: true,
            passing: true,
            finishing: true,
            dribbling: true,
            decisionMaking: true,
            discipline: true,
            potential: true
          }
        }
      }
    });

    if (!athlete) {
      return res.status(404).json({
        message: "Atleta não encontrado"
      });
    }

    const latestEvaluation = athlete.evaluations?.[0] || null;

    if (!latestEvaluation) {
      return res.json({
        athlete: {
          id: athlete.id,
          name: athlete.name
        },
        criteria: []
      });
    }

    const otherAthletes = await prisma.athlete.findMany({
      where: {
        id: {
          not: athlete.id
        },
        status: "ACTIVE",
        evaluations: {
          some: {}
        }
      },
      select: {
        id: true,
        evaluations: {
          orderBy: {
            evaluatedAt: "desc"
          },
          take: 1,
          select: {
            physicalCondition: true,
            ballControl: true,
            passing: true,
            finishing: true,
            dribbling: true,
            decisionMaking: true,
            discipline: true,
            potential: true
          }
        }
      }
    });

    const otherLatestEvaluations = otherAthletes
      .map((item) => item.evaluations?.[0])
      .filter(Boolean);

    const criteria = RADAR_CRITERIA.map((criterion) => {
      const athleteValue = normalizeToHundred(
        latestEvaluation[criterion.key],
        criterion.max
      );

      const averageValue = average(
        otherLatestEvaluations.map((evaluation) =>
          normalizeToHundred(evaluation[criterion.key], criterion.max)
        )
      );

      return {
        key: criterion.key,
        label: criterion.label,
        athleteValue,
        averageValue: averageValue === null ? null : Math.round(averageValue)
      };
    }).filter((criterion) => criterion.athleteValue !== null);

    return res.json({
      athlete: {
        id: athlete.id,
        name: athlete.name
      },
      latestEvaluation: {
        id: latestEvaluation.id,
        evaluatedAt: latestEvaluation.evaluatedAt
      },
      criteria
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Não foi possível gerar o comparativo de desempenho"
    });
  }
});

router.put("/athletes/:id", requireAuth, async (req, res) => {
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

  const canEdit =
    req.user.role === "ADMIN" ||
    (req.user.role === "ATHLETE" && req.user.athleteId === athlete.id);

  if (!canEdit) {
    return res.status(403).json({
      message: "Você não tem permissão para editar este atleta"
    });
  }

  const name = normalizeText(req.body.name);
  const age = toInt(req.body.age);
  const position = normalizeText(req.body.position);
  const dominantFoot = normalizeText(req.body.dominantFoot);
  const heightCm = toInt(req.body.heightCm);
  const country = normalizeText(req.body.country);
  const region = normalizeText(req.body.region);
  const schoolProject = normalizeText(req.body.schoolProject);

  if (!name) {
    return res.status(400).json({
      message: "Nome do atleta e obrigatorio"
    });
  }

  const updatedAthlete = await prisma.athlete.update({
    where: {
      id: athlete.id
    },
    data: {
      name,
      age,
      position: position || null,
      dominantFoot: dominantFoot || null,
      heightCm,
      country: country || null,
      region: region || null,
      schoolProject: schoolProject || null
    },
    include: {
      evaluations: {
        orderBy: {
          evaluatedAt: "desc"
        },
        include: {
          evaluator: true,
          performanceResult: true
        }
      },
      scoutInterests: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  res.json({
    message: "Atleta atualizado com sucesso",
    athlete: updatedAthlete
  });
});

router.patch("/athletes/:id/status", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  const allowedStatuses = ["ACTIVE", "INACTIVE"];
  const status = String(req.body.status || "").trim().toUpperCase();

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status inválido",
      allowedStatuses
    });
  }

  const athlete = await prisma.athlete.findUnique({
    where: {
      id: req.params.id
    }
  });

  if (!athlete) {
    return res.status(404).json({
      message: "Atleta não encontrado"
    });
  }

  const updatedAthlete = await prisma.athlete.update({
    where: {
      id: athlete.id
    },
    data: {
      status
    },
    include: {
      evaluations: {
        orderBy: {
          evaluatedAt: "desc"
        },
        include: {
          evaluator: true,
          performanceResult: true
        }
      },
      scoutInterests: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  res.json({
    message: status === "ACTIVE"
      ? "Atleta reativado com sucesso"
      : "Atleta inativado com sucesso",
    athlete: updatedAthlete
  });
});

export default router;