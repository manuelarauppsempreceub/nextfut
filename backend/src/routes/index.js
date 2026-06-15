import { Router } from "express";
import prisma from "../database/prisma.js";
import importRoutes from "./import.routes.js";

const router = Router();

router.use("/import", importRoutes);

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

router.post("/athletes/:id/scout-interests", async (req, res) => {
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

router.patch("/scout-interests/:id/status", async (req, res) => {
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
