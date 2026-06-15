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
      }
    }
  });

  res.json(athletes);
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
      scoutInterests: true
    }
  });

  if (!athlete) {
    return res.status(404).json({
      message: "Atleta não encontrado"
    });
  }

  res.json(athlete);
});

export default router;
