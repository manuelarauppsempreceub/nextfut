import { Router } from "express";
import prisma from "../database/prisma.js";
import importRoutes from "./import.routes.js";
import athleteRoutes from "./athlete.routes.js";
import evaluationRoutes from "./evaluation.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import { requireAuth, requireRoles } from "../services/auth.middleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/import", importRoutes);
router.use(athleteRoutes);
router.use(evaluationRoutes);

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

async function generateNextAccessCode() {
  const athletes = await prisma.athlete.findMany({
    where: {
      accessCode: {
        startsWith: "NF-"
      }
    },
    select: {
      accessCode: true
    }
  });

  const maxNumber = athletes.reduce((max, athlete) => {
    const number = Number(String(athlete.accessCode || "").replace("NF-", ""));

    if (!Number.isFinite(number)) {
      return max;
    }

    return Math.max(max, number);
  }, 0);

  return `NF-${String(maxNumber + 1).padStart(4, "0")}`;
}

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "nextfut-backend",
    timestamp: new Date().toISOString()
  });
});

router.get("/db-health", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT now() as current_time`;

    res.json({
      status: "ok",
      service: "nextfut-database",
      database: "postgresql",
      currentTime: result[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "nextfut-database",
      message: "Falha ao conectar ao banco de dados",
      error: error.message
    });
  }
});

router.get("/dashboard/summary", async (req, res) => {
  const [
    totalAthletes,
    totalEvaluations,
    totalInterests,
    performanceResults,
    latestAthletes,
    latestInterests
  ] = await Promise.all([
    prisma.athlete.count(),
    prisma.evaluation.count(),
    prisma.scoutInterest.count(),
    prisma.performanceResult.findMany({
      select: {
        performanceScore: true,
        calculatedLevel: true
      }
    }),
    prisma.athlete.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
      include: {
        evaluations: {
          orderBy: {
            evaluatedAt: "desc"
          },
          take: 1,
          include: {
            performanceResult: true
          }
        }
      }
    }),
    prisma.scoutInterest.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
      include: {
        athlete: true
      }
    })
  ]);

  const scoreValues = performanceResults
    .map((item) => item.performanceScore)
    .filter((score) => typeof score === "number");

  const averageScore = scoreValues.length
    ? Number((scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length).toFixed(1))
    : null;

  const athletesByLevel = {
    HIGH: performanceResults.filter((item) => item.calculatedLevel === "HIGH").length,
    MEDIUM: performanceResults.filter((item) => item.calculatedLevel === "MEDIUM").length,
    LOW: performanceResults.filter((item) => item.calculatedLevel === "LOW").length
  };

  const interestsByStatus = {
    INTERESTED: await prisma.scoutInterest.count({ where: { status: "INTERESTED" } }),
    CONTACTED: await prisma.scoutInterest.count({ where: { status: "CONTACTED" } }),
    DISCARDED: await prisma.scoutInterest.count({ where: { status: "DISCARDED" } })
  };

  res.json({
    totals: {
      athletes: totalAthletes,
      evaluations: totalEvaluations,
      interests: totalInterests,
      averageScore
    },
    athletesByLevel,
    interestsByStatus,
    latestAthletes,
    latestInterests
  });
});

router.get("/athletes", async (req, res) => {
  const athletes = await prisma.athlete.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      evaluations: {
        orderBy: {
          evaluatedAt: "desc"
        },
        take: 1,
        include: {
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

  res.json(athletes);
});

router.post("/athletes", requireAuth, requireRoles("ADMIN"), async (req, res) => {
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
      message: "Nome do atleta é obrigatório"
    });
  }

  const accessCode = await generateNextAccessCode();

  const athlete = await prisma.athlete.create({
    data: {
      accessCode,
      name,
      age,
      position: position || null,
      dominantFoot: dominantFoot || null,
      heightCm,
      country: country || null,
      region: region || null,
      schoolProject: schoolProject || null
    }
  });

  res.status(201).json({
    message: "Atleta cadastrado com sucesso",
    athlete
  });
});

router.get("/athletes/access-code/:accessCode", async (req, res) => {
  const athlete = await prisma.athlete.findUnique({
    where: {
      accessCode: req.params.accessCode.toUpperCase()
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
      scoutInterests: true
    }
  });

  if (!athlete) {
    return res.status(404).json({
      message: "Atleta não encontrado para este código de acesso"
    });
  }

  res.json(athlete);
});

router.get("/athletes/:id", async (req, res) => {
  const athlete = await prisma.athlete.findUnique({
    where: {
      id: req.params.id
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

  if (!athlete) {
    return res.status(404).json({
      message: "Atleta não encontrado"
    });
  }

  res.json(athlete);
});

router.post("/athletes/:id/scout-interests", requireAuth, requireRoles("ADMIN", "SCOUT"), async (req, res) => {
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

  const scoutName = String(req.body.scoutName || "").trim();
  const scoutEmail = String(req.body.scoutEmail || "").trim();
  const notes = String(req.body.notes || "").trim();

  if (!scoutName) {
    return res.status(400).json({
      message: "Nome do olheiro é obrigatório"
    });
  }

  const interest = await prisma.scoutInterest.create({
    data: {
      athleteId: athlete.id,
      scoutName,
      scoutEmail: scoutEmail || null,
      notes: notes || null,
      status: "INTERESTED"
    }
  });

  res.status(201).json({
    message: "Interesse registrado com sucesso",
    interest
  });
});

router.get("/scout-interests", async (req, res) => {
  const interests = await prisma.scoutInterest.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      athlete: true
    }
  });

  res.json(interests);
});

router.patch("/scout-interests/:id/status", requireAuth, requireRoles("ADMIN", "SCOUT"), async (req, res) => {
  const allowedStatuses = ["INTERESTED", "CONTACTED", "DISCARDED"];
  const status = String(req.body.status || "").trim().toUpperCase();

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status inválido",
      allowedStatuses
    });
  }

  const existingInterest = await prisma.scoutInterest.findUnique({
    where: {
      id: req.params.id
    }
  });

  if (!existingInterest) {
    return res.status(404).json({
      message: "Interesse não encontrado"
    });
  }

  const interest = await prisma.scoutInterest.update({
    where: {
      id: req.params.id
    },
    data: {
      status
    },
    include: {
      athlete: true
    }
  });

  res.json({
    message: "Status do interesse atualizado com sucesso",
    interest
  });
});

export default router;