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

export default router;
